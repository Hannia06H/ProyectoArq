// src/components/Navbar.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportesMenu, setShowReportesMenu] = useState(false);

  const currentPath = location.pathname;

  const navButtonStyle = (color) => ({
    backgroundColor: color,
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  });

  const subMenuButtonStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    textAlign: "left",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: "#333",
  };

  // Función auxiliar para mostrar siempre los botones de reportes
  const isReportesPath = currentPath.startsWith("/reportes");

  return (
    <div
      style={{
    backgroundColor: "#333",
    padding: "1rem",
    display: "flex",
    gap: "1rem",
    position: "fixed", // <-- fijo arriba
    top: 0,
    left: 0,
    width: "100%",     // <-- ocupa todo el ancho
    zIndex: 999,       // <-- para que quede encima de todo
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  }}
    >
      {/* Gestión de Productos */}
      {(isReportesPath || currentPath !== "/productos") && (
        <button
          onClick={() => navigate("/productos")}
          style={navButtonStyle("#FF9800")}
        >
          Gestión de Productos
        </button>
      )}

      {/* Gestión de Usuarios */}
      {(isReportesPath || currentPath !== "/usuarios") && (
        <button
          onClick={() => navigate("/usuarios")}
          style={navButtonStyle("#2196F3")}
        >
          Gestión de Usuarios
        </button>
      )}

      {/* Gestión de Ventas */}
      {(isReportesPath || currentPath !== "/ventas") && (
        <button
          onClick={() => navigate("/ventas")}
          style={navButtonStyle("#4CAF50")}
        >
          Gestión de Ventas
        </button>
      )}

      {/* Menú de Reportes */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowReportesMenu(!showReportesMenu)}
          style={{
            ...navButtonStyle("#9C27B0"),
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          Reportes
          <span style={{ fontSize: "0.8rem" }}>
            {showReportesMenu ? "▲" : "▼"}
          </span>
        </button>

        {showReportesMenu && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              backgroundColor: "white",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              borderRadius: "4px",
              zIndex: 100,
              minWidth: "200px",
              border: "1px solid #e0e0e0",
            }}
          >
            <button
              onClick={() => {
                navigate("/reportes/usuarios");
                setShowReportesMenu(false);
              }}
              style={subMenuButtonStyle}
            >
              Usuarios
            </button>
            <button
              onClick={() => {
                navigate("/reportes/productos");
                setShowReportesMenu(false);
              }}
              style={subMenuButtonStyle}
            >
              Productos
            </button>
            <button
              onClick={() => {
                navigate("/reportes/ventas");
                setShowReportesMenu(false);
              }}
              style={subMenuButtonStyle}
            >
              Ventas
            </button>
          </div>
        )}
      </div>

      {/* Botón Cerrar Sesión */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("rol");
          navigate("/");
        }}
        style={{ ...navButtonStyle("#f44336"), marginLeft: "auto" }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Navbar;
