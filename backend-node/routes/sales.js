// backend-node/routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT y obtener el ID y rol del usuario
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // user.userId y user.rol estarán disponibles aquí
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
router.post('/', authenticateToken, authorizeRoles(['Vendedor']), async (req, res) => {
    try {
        const { productosSeleccionados, total, clienteNombre, fecha } = req.body;
        const vendedorId = req.user.userId; // Obtenido del payload del token

        if (!vendedorId || !clienteNombre || !productosSeleccionados || productosSeleccionados.length === 0 || total === undefined) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la venta.' });
        }

        const nuevaVenta = new Sale({
            vendedorId,
            clienteNombre,
            productosSeleccionados,
            total,
            fecha: fecha ? new Date(fecha) : Date.now()
        });

        await nuevaVenta.save();
        res.status(201).json({ message: 'Venta registrada exitosamente', venta: nuevaVenta });
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar la venta.' });
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