// Navbar.jsx — Tailwind pur, blanc chaud + orange

import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    // Barre fixe en haut — fond blanc avec légère ombre
    <nav className='sticky top-0 z-50 bg-white border-b border-warm-200 shadow-soft'>
      <div className='max-w-5xl mx-auto px-6 h-16 flex items-center justify-between'>
        {/* Logo cliquable */}
        <Link
          to='/'
          className='hover:opacity-80 transition-opacity'
        >
          <Logo size='navbar' />
        </Link>

        {/* Droite */}
        <div className='flex items-center gap-4'>
          {/* Nombre de langues si l'utilisateur en a */}
          {user.langues?.length > 0 && (
            <span
              className='hidden sm:block text-xs font-medium
                             text-orange-600 bg-orange-50 px-3 py-1 rounded-full
                             border border-orange-200'
            >
              {user.langues.length} langue{user.langues.length > 1 ? "s" : ""}
            </span>
          )}

          {/* Nom */}
          <span className='hidden sm:block text-sm font-medium text-warm-600'>
            {user.nom}
          </span>

          {/* Avatar → profil */}
          <Link to='/profile'>
            <div
              className='w-9 h-9 rounded-full flex items-center justify-center
                            text-white text-sm font-bold cursor-pointer
                            hover:opacity-80 transition-opacity'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              {user.nom?.charAt(0).toUpperCase() || "?"}
            </div>
          </Link>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className='text-sm text-warm-400 hover:text-warm-600 transition-colors'
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
