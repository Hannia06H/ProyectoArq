const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // <--- agregado
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, required: true, enum: ["Administrador", "Vendedor", "Consultor"] },
});

module.exports = mongoose.model("User", UserSchema);
