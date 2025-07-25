// backend-node/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "Usuario no registrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Contraseña incorrecta" });

        if (!user.rol)
            return res.status(403).json({ error: "El usuario no tiene rol asignado" });

        const token = jwt.sign(
            { userId: user._id, rol: user.rol }, // Payload del token: incluye userId y rol
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            rol: user.rol,
            userId: user._id // Enviar el userId al frontend
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

module.exports = router;