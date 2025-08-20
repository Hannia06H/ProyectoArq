// backend-node/routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || 'http://localhost:5000';

// Middleware para verificar el token JWT y obtener el ID y rol del usuario
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // user.userId y user.rol
    next();
  });
};

// Middleware para verificar el rol del usuario
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
    }
    next();
  };
};

// Ruta para registrar una nueva venta (POST /api/ventas)
<<<<<<< HEAD
router.post('/', authenticateToken, authorizeRoles(['Vendedor', 'Administrador']), async (req, res) => {
    try {
        const { productosSeleccionados, total, clienteNombre, fecha } = req.body;
        const vendedorId = req.user.userId; // Obtenido del payload del token
=======
router.post('/', authenticateToken, authorizeRoles(['Vendedor']), async (req, res) => {
  try {
    const { productosSeleccionados, total, clienteNombre, fecha } = req.body;
    const vendedorId = req.user.userId;
>>>>>>> b1f265f673d80f3ed4b29c8a528692379db25465

    if (!vendedorId || !clienteNombre || !Array.isArray(productosSeleccionados) || productosSeleccionados.length === 0 || total === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la venta.' });
    }

    // Agrupar por id y sumar cantidades (por si vienen repetidos)
    const agregados = new Map();
    for (const p of productosSeleccionados) {
      const pid = String(p.id);
      const qty = Number(p.cantidad || 0);
      if (!pid || Number.isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Producto/cantidad inválidos en la venta.' });
      }
      agregados.set(pid, (agregados.get(pid) || 0) + qty);
    }
    const items = Array.from(agregados, ([id, cantidad]) => ({
      id: Number(id),
      cantidad: Number(cantidad),
    }));

    // 1) Descontar stock en Flask
    try {
      await axios.post(`${FLASK_BASE_URL}/api/productos/ajustar-stock`, { items }, { timeout: 8000 });
    } catch (err) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || 'No se pudo ajustar stock en el servicio de productos.';
      return res.status(status).json({ error: message });
    }

    // 2) Guardar la venta en Mongo
    const nuevaVenta = new Sale({
      vendedorId,
      clienteNombre,
      productosSeleccionados,
      total,
      fecha: fecha ? new Date(fecha) : Date.now()
    });

    try {
      await nuevaVenta.save();
      return res.status(201).json({ message: 'Venta registrada exitosamente', venta: nuevaVenta });
    } catch (err) {
      // 2b) Si falla guardar la venta, revertimos stock en Flask (best-effort)
      try {
        await axios.post(`${FLASK_BASE_URL}/api/productos/restaurar-stock`, { items }, { timeout: 8000 });
      } catch (_) { /* best-effort */ }
      console.error('Error al registrar la venta (Mongo):', err);
      return res.status(500).json({ error: 'Error al guardar la venta. El stock fue revertido.' });
    }

  } catch (error) {
    console.error('Error al registrar la venta:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar la venta.' });
  }
});

// Ruta para obtener todas las ventas (GET /api/ventas)
router.get('/', authenticateToken, authorizeRoles(['Vendedor', 'Consultor', 'Administrador']), async (req, res) => {
  try {
    const { vendedorId, fechaInicio, fechaFin, cliente } = req.query;
    let query = {};

    if (req.user.rol === 'Vendedor') {
      query.vendedorId = req.user.userId; // Filtrar por el vendedor actual
    } else if (vendedorId) {
      query.vendedorId = vendedorId;
    }

    if (fechaInicio || fechaFin) {
      query.fecha = {};
      if (fechaInicio) query.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const d = new Date(fechaFin);
        d.setDate(d.getDate() + 1);
        query.fecha.$lt = d;
      }
    }

    if (cliente) {
      query.clienteNombre = { $regex: new RegExp(cliente, 'i') };
    }

    const ventas = await Sale.find(query).sort({ fecha: -1 });
    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener las ventas.' });
  }
});

module.exports = router;
