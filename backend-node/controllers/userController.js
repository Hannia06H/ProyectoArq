const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

// Obtener usuarios con filtros
exports.getUsers = async (req, res) => {
  try {
    const { nombre, rol } = req.query;
    let filtro = {};
    if (nombre) filtro.nombre = { $regex: nombre, $options: "i" };
    if (rol) filtro.rol = rol;

    const usuarios = await User.find(filtro)
      .select("-password")
      .populate("rol", "nombre");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Crear nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    // Verificar que el rol existe
    const roleExists = await Role.findById(rol);
    if (!roleExists) {
      return res.status(400).json({ error: "El rol especificado no existe." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({ nombre, email, password: passwordHashed, rol });
    await nuevoUsuario.save();
    
    // Devolver usuario sin password
    const usuarioCreado = await User.findById(nuevoUsuario._id)
      .select("-password")
      .populate("rol", "nombre");
      
    res.status(201).json({ mensaje: "Usuario creado con éxito.", usuario: usuarioCreado });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario." });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const camposActualizados = { nombre, email, rol };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      camposActualizados.password = await bcrypt.hash(password, salt);
    }

    if (rol) {
      const roleExists = await Role.findById(rol);
      if (!roleExists) {
        return res.status(400).json({ error: "El rol especificado no existe." });
      }
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id, 
      camposActualizados, 
      { new: true }
    ).select("-password").populate("rol", "nombre");
    
    res.json({ mensaje: "Usuario actualizado con éxito.", usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario." });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario." });
  }
};