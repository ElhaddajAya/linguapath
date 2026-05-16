// AdminRoute.jsx
// Guard de route qui vérifie que l'utilisateur est connecté ET admin.
// Utilisation dans App.jsx : <AdminRoute><AdminUsers /></AdminRoute>

import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  // Pas connecté → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais pas admin → page d'accueil
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}