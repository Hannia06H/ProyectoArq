import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/loginForm";
import Dashboard from "./views/Dashboard";
import GestionProductos from "./views/GestionProductos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/productos" element={<GestionProductos />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;



