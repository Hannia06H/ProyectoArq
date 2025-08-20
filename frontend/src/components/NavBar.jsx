import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportesMenu, setShowReportesMenu] = useState(false);
  const userNombre = localStorage.getItem('nombre') || 'Usuario';

  const currentPath = location.pathname;

  const navButtonStyle = (color) => ({
    backgroundColor: color,
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    "&:hover": {
      opacity: 0.9
    }
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
    "&:hover": {
      backgroundColor: "#f5f5f5"
    }
  };

  // Función auxiliar para mostrar siempre los botones de reportes
  const isReportesPath = currentPath.startsWith("/reportes");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("userId");
    localStorage.removeItem("nombre");
    navigate("/");
  };

  return (
    <div
      style={{
        backgroundColor: "#333",
        padding: "1rem",
        display: "flex",
        gap: "1rem",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        alignItems: "center"
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

      {/* Información del usuario */}
      <div style={{ 
        color: 'white', 
        marginLeft: 'auto', 
        marginRight: '1rem',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem'
      }}>
        <span style={{ marginRight: '0.5rem' }}>Bienvenido,</span>
        <strong>{userNombre}</strong>
        <span style={{ 
          marginLeft: '0.8rem', 
          padding: '0.2rem 0.5rem', 
          backgroundColor: '#555', 
          borderRadius: '4px',
          fontSize: '0.8rem'
        }}>
          {localStorage.getItem('rol')}
        </span>
      </div>

      {/* Botón Cerrar Sesión */}
      <button
        onClick={handleLogout}
        style={{ 
          ...navButtonStyle("#f44336"), 
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
        title="Cerrar sesión"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Salir
      </button>
    </div>
  );
};

export default Navbar;