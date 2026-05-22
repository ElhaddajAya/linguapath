import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setSidebarOpen(false);
  };

  const close = () => setSidebarOpen(false);

  const navLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-600 hover:bg-warm-50 hover:text-warm-900 transition-colors";

  return (
    <>
      {/* ── Barre principale ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-warm-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="navbar" />
          </Link>

          {/* ── Liens desktop (md+) ── */}
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-warm-600">{user.nom}</span>
            <div className="w-px h-5 bg-warm-200" />

            {!isAdmin && (
              <>
                {user.langues?.length > 0 && (
                  <span className="text-xs font-medium text-orange-600 bg-orange-50
                    px-3 py-1 rounded-full border border-orange-200">
                    {user.langues.length} langue{user.langues.length > 1 ? "s" : ""}
                  </span>
                )}
                <Link to="/historique" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
                  Historique
                </Link>
                <Link to="/learning-log" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
                  Learning Log
                </Link>
                <Link to="/mindmap" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
                  MindMap
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/users" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
                  Utilisateurs
                </Link>
                <Link to="/admin/scenarios" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">
                  Scénarios
                </Link>
                <div className="w-px h-5 bg-warm-200" />
                <span className="text-xs font-semibold px-3 py-1 rounded-full
                  bg-purple-50 text-purple-600 border border-purple-100">
                  ⚙️ Admin
                </span>
              </>
            )}

            <Link to="/profile">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                  text-white text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
              >
                {user.nom?.charAt(0).toUpperCase() || "?"}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm text-warm-400 hover:text-warm-700 transition-colors font-medium"
            >
              Déconnexion
            </button>
          </div>

          {/* ── Mobile : avatar + hamburger ── */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/profile" className="hover:opacity-80 transition-opacity">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                  text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
              >
                {user.nom?.charAt(0).toUpperCase() || "?"}
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-warm-600 hover:bg-warm-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Sidebar mobile ── */}

      {/* Overlay sombre derrière le tiroir */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity duration-300
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Tiroir latéral (glisse depuis la droite) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* En-tête du tiroir */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
          <Logo size="navbar" />
          <button
            onClick={close}
            className="p-2 rounded-lg text-warm-500 hover:bg-warm-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Infos utilisateur */}
        <div className="px-5 py-4 border-b border-warm-200 bg-warm-50">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center
                text-white font-bold text-base flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              {user.nom?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-warm-900 text-sm truncate">{user.nom}</p>
              <p className="text-xs text-warm-400 truncate">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5
                  rounded-full bg-purple-50 text-purple-600">
                  ⚙️ Admin
                </span>
              )}
              {!isAdmin && user.langues?.length > 0 && (
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5
                  rounded-full bg-orange-50 text-orange-600">
                  {user.langues.length} langue{user.langues.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <Link to="/" onClick={close} className={navLink}>
            🏠 <span>Accueil</span>
          </Link>

          {!isAdmin && (
            <>
              <Link to="/historique" onClick={close} className={navLink}>
                📋 <span>Historique</span>
              </Link>
              <Link to="/learning-log" onClick={close} className={navLink}>
                📚 <span>Learning Log</span>
              </Link>
              <Link to="/mindmap" onClick={close} className={navLink}>
                🗺️ <span>MindMap</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin/users" onClick={close} className={navLink}>
                👥 <span>Utilisateurs</span>
              </Link>
              <Link to="/admin/scenarios" onClick={close} className={navLink}>
                🎭 <span>Scénarios</span>
              </Link>
            </>
          )}

          <Link to="/profile" onClick={close} className={navLink}>
            👤 <span>Mon profil</span>
          </Link>
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-warm-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            🚪 <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
