import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // CRITICAL: Must match 'adminToken' exactly as saved in Login.jsx
  const token = localStorage.getItem("adminToken");

  // If a valid token exists, render child routes via <Outlet />. Otherwise, force-kick back to login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
