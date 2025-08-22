const Role = require("../models/Role");

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

// Crear nuevo rol
exports.createRole = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre del rol es obligatorio." });
    }

    const rolExistente = await Role.findOne({ nombre });
    if (rolExistente) {
      return res.status(400).json({ error: "Ya existe un rol con ese nombre." });
    }

    const nuevoRol = new Role({ nombre, descripcion, permisos });
    await nuevoRol.save();
    
    res.status(201).json({ mensaje: "Rol creado con éxito.", rol: nuevoRol });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el rol." });
  }
};

// Actualizar rol
exports.updateRole = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    const rolActualizado = await Role.findByIdAndUpdate(
      req.params.id, 
      { nombre, descripcion, permisos }, 
      { new: true }
    );
    
    res.json({ mensaje: "Rol actualizado con éxito.", rol: rolActualizado });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol." });
  }
};

// Eliminar rol
exports.deleteRole = async (req, res) => {
  try {
    // Verificar si hay usuarios con este rol
    const User = require("../models/User");
    const usuariosConRol = await User.countDocuments({ rol: req.params.id });
    
    if (usuariosConRol > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar el rol porque hay usuarios asignados a él." 
      });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Rol eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el rol." });
  }
};