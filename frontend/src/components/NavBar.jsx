import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, ClipboardList, BookOpen, Map, User, Users,
  Clapperboard, LogOut, Settings, X, Menu,
} from "lucide-react";
import Logo from "./Logo";

// Helper : lire le user depuis localStorage
const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);
  const isAdmin = user.role === "admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Sync avatar/nom quand le profil est modifié ────────────
  // Profile.jsx dispatch un event "userUpdated" après la sauvegarde
  useEffect(() => {
    const handleUserUpdate = () => setUser(getUser());
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setSidebarOpen(false);
  };

  const close = () => setSidebarOpen(false);

  const navLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-600 hover:bg-warm-50 hover:text-warm-900 transition-colors";

  // ── Rendu avatar (emoji ou initiale) ──────────────────────
  const AvatarCircle = ({ size = 9 }) => {
    const dim = `w-${size} h-${size}`;
    if (user.avatar) {
      return (
        <div className={`${dim} rounded-full flex items-center justify-center
          bg-warm-100 border-2 border-warm-200 text-xl`}>
          {user.avatar}
        </div>
      );
    }
    return (
      <div
        className={`${dim} rounded-full flex items-center justify-center
          text-white text-sm font-bold`}
        style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
      >
        {user.nom?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <>
      {/* ── Barre principale ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-warm-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 h-16 flex items-center justify-between">

          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="navbar" />
          </Link>

          {/* Desktop */}
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
                <Link to="/historique" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">Historique</Link>
                <Link to="/learning-log" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">Learning Log</Link>
                <Link to="/mindmap" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">MindMap</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/users" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">Utilisateurs</Link>
                <Link to="/admin/scenarios" className="text-sm text-warm-500 hover:text-warm-700 transition-colors">Scénarios</Link>
                <div className="w-px h-5 bg-warm-200" />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
                  bg-purple-50 text-purple-600 border border-purple-100">
                  <Settings size={12} /> Admin
                </span>
              </>
            )}

            <Link to="/profile" className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarCircle size={9} />
            </Link>

            <button onClick={handleLogout}
              className="text-sm text-warm-400 hover:text-warm-700 transition-colors font-medium">
              Déconnexion
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/profile" className="hover:opacity-80 transition-opacity">
              <AvatarCircle size={9} />
            </Link>
            <button onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-warm-600 hover:bg-warm-100 transition-colors">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity duration-300
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Sidebar mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
          <Logo size="navbar" />
          <button onClick={close} className="p-2 rounded-lg text-warm-500 hover:bg-warm-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-warm-200 bg-warm-50">
          <div className="flex items-center gap-3">
            <AvatarCircle size={11} />
            <div className="min-w-0">
              <p className="font-semibold text-warm-900 text-sm truncate">{user.nom}</p>
              <p className="text-xs text-warm-400 truncate">{user.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5
                  rounded-full bg-purple-50 text-purple-600">
                  <Settings size={11} /> Admin
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

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <Link to="/" onClick={close} className={navLink}><Home size={16} /> <span>Accueil</span></Link>
          {!isAdmin && (
            <>
              <Link to="/historique" onClick={close} className={navLink}><ClipboardList size={16} /> <span>Historique</span></Link>
              <Link to="/learning-log" onClick={close} className={navLink}><BookOpen size={16} /> <span>Learning Log</span></Link>
              <Link to="/mindmap" onClick={close} className={navLink}><Map size={16} /> <span>MindMap</span></Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/users" onClick={close} className={navLink}><Users size={16} /> <span>Utilisateurs</span></Link>
              <Link to="/admin/scenarios" onClick={close} className={navLink}><Clapperboard size={16} /> <span>Scénarios</span></Link>
            </>
          )}
          <Link to="/profile" onClick={close} className={navLink}><User size={16} /> <span>Mon profil</span></Link>
        </nav>

        <div className="px-3 py-4 border-t border-warm-200">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}