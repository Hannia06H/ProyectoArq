const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Role", 
    required: true 
  },
  activo: { type: Boolean, default: true },
  ultimoAcceso: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);