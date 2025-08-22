import { Navigate } from "react-router-dom";

export default function RequireRole({ allowedRoles, children }) {
  const userRole = localStorage.getItem("rol");
  
  // Si el usuario no tiene un rol permitido, redirigir al login
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
}