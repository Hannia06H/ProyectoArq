const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ["Administrador", "Vendedor", "Consultor"] 
  },
  permisos: [{ type: String }],
  descripcion: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);