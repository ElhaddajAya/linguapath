// Navbar.jsx utilise les composants DaisyUI : navbar, btn, avatar.

import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();

  // On récupère les infos de l'utilisateur sauvegardées au moment du login
  // JSON.parse() convertit le texte stocké en objet JavaScript
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fonction de déconnexion :
  // 1. On supprime le token et l'user du localStorage
  // 2. On redirige vers /login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className='navbar bg-base-100 shadow-sm px-6'>
      {/* Logo cliquable — redirige vers Home */}
      <div className='navbar-start'>
        <Link to='/'>
          <Logo size='navbar' />
        </Link>
      </div>

      {/* Droite — niveau, nom, avatar, déconnexion */}
      <div className='navbar-end gap-3'>
        {/* Badge niveau */}
        <span className='badge badge-warning badge-outline font-semibold'>
          {user.niveau || "A1"}
        </span>

        {/* Nom — caché sur mobile */}
        <span className='text-sm font-medium hidden sm:block text-base-content/70'>
          {user.nom}
        </span>

        {/* Avatar cliquable → profil */}
        <Link to='/profile'>
          <div className='avatar placeholder cursor-pointer hover:opacity-80 transition-opacity'>
            <div
              className='rounded-full w-9 text-white text-sm font-bold'
              style={{
                background:
                  "linear-gradient(to bottom right, #F59E0B, #EA580C)",
              }}
            >
              <span>{user.nom?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          </div>
        </Link>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className='btn btn-ghost btn-sm text-base-content/50'
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
