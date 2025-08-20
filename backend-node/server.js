// backend-node/server.js
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const cors = require("cors");
// const bcrypt = require("bcryptjs"); // Ya comentada/eliminada
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios");
// Importar las rutas de ventas
const salesRoutes = require("./routes/sales"); 
const app = express();
connectDB(); // Conecta a MongoDB

app.use(cors({
  origin: 'http://localhost:3000', // puerto del frontend
  credentials: true
}));

app.use(express.json()); // Middleware para parsear el cuerpo de las peticiones en JSON

// Montar las rutas de la API
app.use("/api", authRoutes); 
app.use("/api/ventas", salesRoutes); 

//usuarios 

app.use("/api/usuarios", usuariosRoutes);



// Puedes eliminar esta línea si no la usas en server.js directamente.
// const User = require("./models/User");

// Ruta de prueba (opcional, si quieres mantenerla)
app.get('/', (req, res) => {
    res.send('API de Node.js en funcionamiento!');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));