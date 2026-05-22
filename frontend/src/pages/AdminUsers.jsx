// pages/AdminUsers.jsx
// Page admin : liste des utilisateurs avec possibilité de désactiver/réactiver un compte.
// Accessible uniquement via AdminRoute (role === 'admin').

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

// Niveaux possibles par langue
const NIVEAU_COLORS = {
  A1: "bg-slate-100 text-slate-500",
  A2: "bg-blue-50 text-blue-500",
  B1: "bg-green-50 text-green-600",
  B2: "bg-yellow-50 text-yellow-600",
  C1: "bg-orange-50 text-orange-600",
  C2: "bg-red-50 text-red-600",
};

const LANGUE_EMOJI = {
  Anglais: "🇬🇧", Espagnol: "🇪🇸", Français: "🇫🇷",
  Allemand: "🇩🇪", Coréen: "🇰🇷", Japonais: "🇯🇵",
  Chinois: "🇨🇳", Arabe: "🇸🇦",
};

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [toggling, setToggling] = useState(null); // id de l'user en cours de toggle
  const [toast, setToast]     = useState(null);   // { msg, type }

  // ── Chargement ─────────────────────────────────────────────

  useEffect(() => {
    chargerUsers();
  }, []);

  const chargerUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      showToast("Erreur lors du chargement des utilisateurs.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle actif / inactif ─────────────────────────────────

  const toggleStatus = async (userId) => {
    setToggling(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      // Mettre à jour localement sans recharger
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: res.data.user.isActive } : u
        )
      );
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Erreur lors de la modification.",
        "error"
      );
    } finally {
      setToggling(null);
    }
  };

  // ── Toast ──────────────────────────────────────────────────

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtre de recherche ────────────────────────────────────

  const filtered = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalActifs   = users.filter((u) => u.isActive !== false).length;
  const totalInactifs = users.filter((u) => u.isActive === false).length;

  // ── Rendu ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg
            text-sm font-medium transition-all
            ${toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/scenarios" className="text-xs text-warm-400 hover:text-orange-500 transition-colors">
                ← Scénarios
              </Link>
            </div>
            <h1 className="text-2xl font-semibold text-warm-900">
              👥 Gestion des utilisateurs
            </h1>
            <p className="text-warm-500 text-sm mt-1">
              {totalActifs} actif{totalActifs !== 1 ? "s" : ""} · {totalInactifs} désactivé{totalInactifs !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Barre de recherche — pleine largeur sur mobile */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm
              text-warm-900 bg-white focus:outline-none focus:border-orange-300
              w-full sm:w-64 placeholder:text-warm-300"
          />
        </div>

        {/* ── Contenu ── */}
        {loading ? (
          <div className="text-center py-20 text-warm-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 shadow-soft p-12 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-warm-600 font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            {/* ── Tableau desktop (md+) ── */}
            <div className="hidden md:block bg-white rounded-2xl border border-warm-200 shadow-soft overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-6 py-3
                bg-warm-50 border-b border-warm-100
                text-xs font-semibold text-warm-500 uppercase tracking-wide">
                <span>Utilisateur</span>
                <span>Langues pratiquées</span>
                <span>Rôle</span>
                <span>Action</span>
              </div>

              {filtered.map((user) => {
                const actif = user.isActive !== false;
                return (
                  <div
                    key={user._id}
                    className={`grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-6 py-4
                      border-b border-warm-100 last:border-b-0 items-center
                      hover:bg-warm-50 transition-colors
                      ${!actif ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center
                          text-white text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
                      >
                        {user.nom?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-900 truncate">{user.nom}</p>
                        <p className="text-xs text-warm-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {user.langues?.length > 0 ? (
                        user.langues.map((l) => (
                          <span key={l.langue}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${NIVEAU_COLORS[l.niveau] || "bg-warm-100 text-warm-500"}`}>
                            {LANGUE_EMOJI[l.langue] || "🌍"} {l.langue} · {l.niveau}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-warm-300 italic">Aucune</span>
                      )}
                    </div>

                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-warm-100 text-warm-500"}`}>
                      {user.role === "admin" ? "⚙️ Admin" : "Utilisateur"}
                    </span>

                    <button
                      onClick={() => toggleStatus(user._id)}
                      disabled={toggling === user._id}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium border
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        ${actif
                          ? "border-red-200 text-red-500 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"}`}
                    >
                      {toggling === user._id ? "..." : actif ? "Désactiver" : "Réactiver"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Cartes mobile (< md) ── */}
            <div className="md:hidden flex flex-col gap-3">
              {filtered.map((user) => {
                const actif = user.isActive !== false;
                return (
                  <div
                    key={user._id}
                    className={`bg-white rounded-2xl border border-warm-200 shadow-soft p-4
                      flex flex-col gap-3 ${!actif ? "opacity-50" : ""}`}
                  >
                    {/* Ligne 1 : avatar + nom + badge rôle */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center
                          text-white text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
                      >
                        {user.nom?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-warm-900 truncate">{user.nom}</p>
                        <p className="text-xs text-warm-400 truncate">{user.email}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0
                        ${user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-warm-100 text-warm-500"}`}>
                        {user.role === "admin" ? "⚙️ Admin" : "User"}
                      </span>
                    </div>

                    {/* Ligne 2 : langues */}
                    <div className="flex flex-wrap gap-1.5">
                      {user.langues?.length > 0 ? (
                        user.langues.map((l) => (
                          <span key={l.langue}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${NIVEAU_COLORS[l.niveau] || "bg-warm-100 text-warm-500"}`}>
                            {LANGUE_EMOJI[l.langue] || "🌍"} {l.langue} · {l.niveau}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-warm-300 italic">Aucune langue</span>
                      )}
                    </div>

                    {/* Ligne 3 : bouton action */}
                    <button
                      onClick={() => toggleStatus(user._id)}
                      disabled={toggling === user._id}
                      className={`w-full py-2 rounded-xl text-sm font-medium border
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        ${actif
                          ? "border-red-200 text-red-500 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"}`}
                    >
                      {toggling === user._id ? "..." : actif ? "Désactiver le compte" : "Réactiver le compte"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}