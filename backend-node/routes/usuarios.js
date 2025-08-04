// routes/usuarios.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Obtener usuarios con filtros
router.get("/", async (req, res) => {
  try {
    const { nombre, rol } = req.query;
    let filtro = {};
    if (nombre) filtro.nombre = { $regex: nombre, $options: "i" };
    if (rol) filtro.rol = rol;

    const usuarios = await User.find(filtro).select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

module.exports = router;
