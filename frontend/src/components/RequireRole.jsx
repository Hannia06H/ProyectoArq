import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const userRole = localStorage.getItem("rol");
  if (userRole !== role) return <Navigate to="/" />;
  return children;
}
