import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginForm';
import Dashboard from './views/Dashboard';
import GestionProductos from './views/GestionProductos';
import GestionUsuarios from './views/GestionUsuarios';
import RequireRole from './components/RequireRole';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        
        {/* Ruta accesible solo por el ADMINISTRADOR */}
        <Route
          path="/dashboard"
          element={
            <RequireRole role="Administrador">
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="/productos"
          element={
            <RequireRole role="Administrador">
              <GestionProductos />
            </RequireRole>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequireRole role="Administrador">
              <GestionUsuarios />
            </RequireRole>
          }
        />

        {/* Rutas para otros roles las puedes agregar así: */}
        {/* <Route
          path="/ventas"
          element={
            <RequireRole role="Vendedor">
              <GestionVentas />
            </RequireRole>
          }
        /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
