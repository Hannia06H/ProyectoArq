// routes/usuarios.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // para encriptar contraseñas

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

// Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validación simple
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar si ya existe el email
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({ nombre, email, password: passwordHashed, rol });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: "Usuario creado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario." });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const camposActualizados = { nombre, email, rol };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      camposActualizados.password = await bcrypt.hash(password, salt);
    }

    await User.findByIdAndUpdate(req.params.id, camposActualizados);
    res.json({ mensaje: "Usuario actualizado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario." });
  }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario." });
  }
});

module.exports = router;
