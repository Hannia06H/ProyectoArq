import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/loginForm";
import Dashboard from "./views/Dashboard";
import GestionProductos from "./views/GestionProductos";
import GestionVentas from "./views/GestionVentas";

//Usuarios
import GestionUsuarios from "./views/GestionUsuarios";

// Reportes
import ReportesVentas from "./views/ReportesVentas";
import ReportesProductos from "./views/ReportesProductos";
import ReportesUsuarios from "./views/ReportesUsuarios";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Autenticación y navegación principal */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Gestión */}
        <Route path="/productos" element={<GestionProductos />} />
        <Route path="/ventas" element={<GestionVentas />} />
        <Route path="/usuarios" element={<GestionUsuarios />} />

        {/* Reportes */}
        <Route path="/reportes/ventas" element={<ReportesVentas />} />
        <Route path="/reportes/productos" element={<ReportesProductos />} />
        <Route path="/reportes/usuarios" element={<ReportesUsuarios />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
