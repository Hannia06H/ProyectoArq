const mongoose = require("mongoose");
const Role = require("../models/Role");
require("dotenv").config();

const rolesIniciales = [
  { nombre: "Administrador", descripcion: "Acceso completo al sistema" },
  { nombre: "Vendedor", descripcion: "Puede gestionar ventas" },
  { nombre: "Consultor", descripcion: "Solo puede visualizar reportes" }
];

const initRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");

    for (const rol of rolesIniciales) {
      const existe = await Role.findOne({ nombre: rol.nombre });
      if (!existe) {
        await Role.create(rol);
        console.log(`Rol ${rol.nombre} creado`);
      } else {
        console.log(`Rol ${rol.nombre} ya existe`);
      }
    }

    console.log("Proceso de inicialización de roles completado");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

initRoles();