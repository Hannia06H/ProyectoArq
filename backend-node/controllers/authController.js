const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate("rol");
    if (!user)
      return res.status(404).json({ error: "Usuario no registrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    if (!user.rol)
      return res.status(403).json({ error: "El usuario no tiene rol asignado" });

    // Actualizar último acceso
    user.ultimoAcceso = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, rol: user.rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      rol: user.rol.nombre,
      userId: user._id,
      nombre: user.nombre
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
  // Agrega console logs en authController.js para debuggear
    console.log("Buscando usuario:", email);
    console.log("Usuario encontrado:", user);
    if (!user) console.log("Usuario no encontrado");
    if (!isMatch) console.log("Password no coincide");
    if (!user.rol) console.log("Usuario sin rol:", user);
};