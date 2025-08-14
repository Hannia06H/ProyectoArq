import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginForm';
import GestionProductos from './views/GestionProductos';
import GestionVentas from './views/GestionVentas'; // Nuevo componente para ventas
import GestionUsuarios from './views/GestionUsuarios';
import RequireRole from './components/RequireRole';
import ReportesUsuarios from './views/ReportesUsuarios';
import ReportesProductos from './views/ReportesProductos';
import ReportesVentas from './views/ReportesVentas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (login) */}
        <Route path="/" element={<LoginForm />} />

        {/* Dashboard solo para Administrador */}
        <Route
          path="/productos"
          element={
            <RequireRole allowedRoles={["Administrador"]}>
              <GestionProductos/>
            </RequireRole>
          }
        />

  

        {/* Ventas: SOLO Vendedor (no Consultor) */}
        <Route
          path="/ventas"
          element={
            <RequireRole allowedRoles={["Administrador", "Vendedor"]}>
              <GestionVentas/>
            </RequireRole>
          }
        />

        {/* Usuarios: SOLO Administrador */}
        <Route
          path="/usuarios"
          element={
            <RequireRole allowedRoles={["Administrador"]}>
              <GestionUsuarios />
            </RequireRole>
          }
        />

        {/* Reportes: Administrador y Consultor */}
        <Route
          path="/reportes/usuarios"
          element={
            <RequireRole allowedRoles={["Administrador", "Consultor"]}>
              <ReportesUsuarios />
            </RequireRole>
          }
        />
        <Route
          path="/reportes/productos"
          element={
            <RequireRole allowedRoles={["Administrador", "Consultor"]}>
              <ReportesProductos/>
            </RequireRole>
          }
        />
        <Route
          path="/reportes/ventas"
          element={
            <RequireRole allowedRoles={["Administrador", "Consultor"]}>
              <ReportesVentas />
            </RequireRole>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}