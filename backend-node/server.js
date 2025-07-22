const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:3000', // puerto del frontend
  credentials: true
}));

app.use(express.json());
app.use("/api", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

const User = require("./models/User");





