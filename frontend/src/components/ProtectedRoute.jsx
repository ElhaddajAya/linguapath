// Ce composant "garde" certaines pages — si l'utilisateur n'est pas connecté,
// il est redirigé vers /login automatiquement.
//
// Pourquoi on fait ça ? Parce que sans ça, n'importe qui peut taper
// "/profile" dans l'URL et accéder à la page même sans être connecté.

import { Navigate } from "react-router-dom";

// "children" = le composant qu'on veut protéger (Profile, Home, etc.)
export default function ProtectedRoute({ children }) {
  // On vérifie si un token existe dans le localStorage
  // Le token a été sauvegardé lors du login/signup dans Login.jsx et Signup.jsx
  const token = localStorage.getItem("token");

  // Si pas de token → l'utilisateur n'est pas connecté
  // <Navigate> est un composant React Router qui redirige vers une autre page
  // "replace" remplace l'entrée dans l'historique (pas de retour arrière vers /profile)
  if (!token) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  // Si token présent → on affiche normalement la page protégée
  return children;
}
