// pages/AdminUsers.jsx
// Page admin : liste des utilisateurs avec possibilité de désactiver/réactiver un compte.
// Accessible uniquement via AdminRoute (role === 'admin').

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import { useLangue } from "../contexts/LangueContext";
import {
  Check,
  X,
  Settings,
  Users,
  Search,
  Globe,
  ArrowLeft,
  Clapperboard,
  UserX,
  UserCheck,
  Loader2,
} from "lucide-react";
import api from "../services/api";

const NIVEAU_COLORS = {
  A1: "bg-slate-100 text-slate-500",
  A2: "bg-blue-50 text-blue-500",
  B1: "bg-green-50 text-green-600",
  B2: "bg-yellow-50 text-yellow-600",
  C1: "bg-orange-50 text-orange-600",
  C2: "bg-red-50 text-red-600",
};

export default function AdminUsers() {
  // t() = fonction de traduction du contexte LangueContext
  const { t } = useLangue();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    chargerUsers();
  }, []);

  const chargerUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch {
      showToast(t("admin.errorLoadUsers"), "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId) => {
    setToggling(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: res.data.user.isActive } : u,
        ),
      );
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message || t("admin.errorToggle"), "error");
    } finally {
      setToggling(null);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActifs = users.filter((u) => u.isActive !== false).length;
  const totalInactifs = users.filter((u) => u.isActive === false).length;

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 sm:right-6 z-50 px-4 py-3 rounded-xl shadow-lg
            text-sm font-medium flex items-center gap-2
            ${
              toast.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
          {toast.msg}
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-5 sm:py-10'>
        {/* ── Header ── */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4'>
          <div>
            {/* Breadcrumb retour */}
            <Link
              to='/admin/scenarios'
              className='inline-flex items-center gap-1.5 text-xs text-warm-400
                hover:text-orange-500 transition-colors mb-3 group'
            >
              <ArrowLeft
                size={13}
                className='group-hover:-translate-x-0.5 transition-transform'
              />
              <span>{t("admin.backToScenarios")}</span>
              <Clapperboard
                size={11}
                className='ml-0.5'
              />
            </Link>

            <h1 className='text-xl sm:text-2xl font-semibold text-warm-900 flex items-center gap-2'>
              <Users
                size={20}
                className='text-orange-500'
              />
              {/* clé home.manageUsers déjà existante, même texte FR — réutilisée ici */}
              {t("home.manageUsers")}
            </h1>
            <p className='text-warm-500 text-xs sm:text-sm mt-1'>
              <span className='text-green-600 font-medium'>
                {totalActifs}{" "}
                {totalActifs !== 1 ? t("admin.actives") : t("admin.active")}
              </span>
              {" · "}
              <span className='text-warm-400'>
                {totalInactifs}{" "}
                {totalInactifs !== 1
                  ? t("admin.inactives")
                  : t("admin.inactive")}
              </span>
            </p>
          </div>

          {/* Barre de recherche */}
          <div className='relative w-full sm:w-64'>
            <Search
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-warm-300'
            />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
              className='pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm
                text-warm-900 bg-white focus:outline-none focus:border-orange-300
                w-full placeholder:text-warm-300'
            />
          </div>
        </div>

        {/* ── Contenu ── */}
        {loading ? (
          <div className='flex items-center justify-center py-20 gap-3 text-warm-400'>
            <Loader2
              size={20}
              className='animate-spin'
            />
            <span className='text-sm'>{t("admin.loading")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-10 sm:p-12 text-center'>
            <Search
              size={40}
              className='text-warm-300 mx-auto mb-4'
            />
            <p className='text-warm-600 font-medium'>
              {t("admin.noUserFound")}
            </p>
            {search && (
              <p className='text-warm-400 text-sm mt-1'>
                {t("admin.tryOtherName")}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* ── Tableau desktop (md+) ── */}
            <div className='hidden md:block bg-white rounded-2xl border border-warm-200 shadow-soft overflow-hidden'>
              <div
                className='grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-6 py-3
                bg-warm-50 border-b border-warm-100
                text-xs font-semibold text-warm-500 uppercase tracking-wide'
              >
                <span>{t("admin.columnUser")}</span>
                <span>{t("admin.columnLanguages")}</span>
                <span>{t("admin.columnAction")}</span>
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
                    <div className='flex items-center gap-3 min-w-0'>
                      <div
                        className='w-9 h-9 rounded-full flex items-center justify-center
                          text-white text-sm font-bold shrink-0'
                        style={{
                          background:
                            "linear-gradient(135deg, #F59E0B, #EA580C)",
                        }}
                      >
                        {user.nom?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-warm-900 truncate'>
                          {user.nom}
                        </p>
                        <p className='text-xs text-warm-400 truncate'>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1.5'>
                      {user.langues?.length > 0 ? (
                        user.langues.map((l) => (
                          <span
                            key={l.langue}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                              ${NIVEAU_COLORS[l.niveau] || "bg-warm-100 text-warm-500"}`}
                          >
                            <Globe size={9} />
                            {l.langue} · {l.niveau}
                          </span>
                        ))
                      ) : (
                        <span className='text-xs text-warm-300 italic'>
                          {t("admin.none")}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleStatus(user._id)}
                      disabled={toggling === user._id}
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium border
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          actif
                            ? "border-red-200 text-red-500 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                    >
                      {toggling === user._id ? (
                        <Loader2
                          size={12}
                          className='animate-spin'
                        />
                      ) : actif ? (
                        <>
                          <UserX size={12} /> {t("admin.deactivate")}
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} /> {t("admin.reactivate")}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Cartes mobile (< md) ── */}
            <div className='md:hidden flex flex-col gap-3'>
              {filtered.map((user) => {
                const actif = user.isActive !== false;
                return (
                  <div
                    key={user._id}
                    className={`bg-white rounded-2xl border border-warm-200 shadow-soft p-4
                      flex flex-col gap-3 ${!actif ? "opacity-50" : ""}`}
                  >
                    {/* Ligne 1 : avatar + nom + badge rôle */}
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-10 h-10 rounded-full flex items-center justify-center
                          text-white text-sm font-bold shrink-0'
                        style={{
                          background:
                            "linear-gradient(135deg, #F59E0B, #EA580C)",
                        }}
                      >
                        {user.nom?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-warm-900 truncate'>
                          {user.nom}
                        </p>
                        <p className='text-xs text-warm-400 truncate'>
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 inline-flex items-center gap-1
                        ${user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-warm-100 text-warm-500"}`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Settings size={11} /> {t("nav.admin")}
                          </>
                        ) : (
                          t("admin.user")
                        )}
                      </span>
                    </div>

                    {/* Ligne 2 : langues */}
                    <div className='flex flex-wrap gap-1.5'>
                      {user.langues?.length > 0 ? (
                        user.langues.map((l) => (
                          <span
                            key={l.langue}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                              ${NIVEAU_COLORS[l.niveau] || "bg-warm-100 text-warm-500"}`}
                          >
                            <Globe size={9} />
                            {l.langue} · {l.niveau}
                          </span>
                        ))
                      ) : (
                        <span className='text-xs text-warm-300 italic'>
                          {t("admin.noLanguage")}
                        </span>
                      )}
                    </div>

                    {/* Ligne 3 : bouton action */}
                    <button
                      onClick={() => toggleStatus(user._id)}
                      disabled={toggling === user._id}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl
                        text-sm font-medium border transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          actif
                            ? "border-red-200 text-red-500 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                    >
                      {toggling === user._id ? (
                        <Loader2
                          size={14}
                          className='animate-spin'
                        />
                      ) : actif ? (
                        <>
                          <UserX size={14} /> {t("admin.deactivateAccount")}
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} /> {t("admin.reactivateAccount")}
                        </>
                      )}
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
