// Home.jsx — page d'accueil après connexion
// Si admin → dashboard admin avec gestion users + scénarios
// Si user  → page langues normale

import Navbar from "../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";
import { useLangue } from "../contexts/LangueContext";
import { Users, Clapperboard, ArrowRight, Plus } from "lucide-react";

const LANGUE_EMOJI = {
  Anglais: "🇬🇧",
  Espagnol: "🇪🇸",
  Français: "🇫🇷",
  Allemand: "🇩🇪",
  Coréen: "🇰🇷",
  Japonais: "🇯🇵",
  Chinois: "🇨🇳",
  Arabe: "🇸🇦",
};

// ── Dashboard Admin ───────────────────────────────────────────
function AdminHome({ user }) {
  const navigate = useNavigate();
  // t() = fonction de traduction du contexte LangueContext
  const { t } = useLangue();

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-5 sm:py-10'>
        {/* Header */}
        <div className='mb-6 sm:mb-10'>
          <p className='text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2'>
            {t("home.dashboard")}
          </p>
          <h1 className='text-xl sm:text-2xl font-semibold text-warm-900'>
            {t("home.greeting")}, {user.nom?.split(" ")[0]}
          </h1>
          <p className='text-warm-500 mt-1 text-xs sm:text-sm'>
            {t("home.adminSubtitle")}
          </p>
        </div>

        {/* Cards admin */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
          {/* Card Utilisateurs */}
          <div
            onClick={() => navigate("/admin/users")}
            className='bg-white rounded-2xl border border-warm-200 shadow-soft
              p-5 sm:p-8 cursor-pointer hover:border-purple-200 hover:shadow-card
              transition-all group'
          >
            <div className='flex items-start justify-between mb-4 sm:mb-6'>
              <div
                className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center'
                style={{
                  background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
                }}
              >
                <Users
                  size={24}
                  className='text-purple-500'
                />
              </div>
              <span
                className='text-xs font-semibold px-2.5 py-1 rounded-full
                  bg-purple-50 text-purple-600 border border-purple-100'
              >
                Admin
              </span>
            </div>
            <h2 className='text-base sm:text-lg font-semibold text-warm-900 mb-2'>
              {t("home.manageUsers")}
            </h2>
            <p className='text-sm text-warm-500 mb-4 sm:mb-6 leading-relaxed'>
              {t("home.manageUsersSub")}
            </p>
            <div
              className='flex items-center gap-2 text-sm font-semibold text-purple-600
                group-hover:gap-3 transition-all'
            >
              {t("home.seeUsers")}
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card Scénarios */}
          <div
            onClick={() => navigate("/admin/scenarios")}
            className='bg-white rounded-2xl border border-warm-200 shadow-soft
              p-5 sm:p-8 cursor-pointer hover:border-orange-200 hover:shadow-card
              transition-all group'
          >
            <div className='flex items-start justify-between mb-4 sm:mb-6'>
              <div
                className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center'
                style={{
                  background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                }}
              >
                <Clapperboard
                  size={24}
                  className='text-orange-500'
                />
              </div>
              <span
                className='text-xs font-semibold px-2.5 py-1 rounded-full
                  bg-orange-50 text-orange-600 border border-orange-100'
              >
                Admin
              </span>
            </div>
            <h2 className='text-base sm:text-lg font-semibold text-warm-900 mb-2'>
              {t("home.manageScenarios")}
            </h2>
            <p className='text-sm text-warm-500 mb-4 sm:mb-6 leading-relaxed'>
              {t("home.manageScenariosSub")}
            </p>
            <div
              className='flex items-center gap-2 text-sm font-semibold text-orange-600
                group-hover:gap-3 transition-all'
            >
              {t("home.seeScenarios")}
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page utilisateur normal ───────────────────────────────────
function UserHome({ user }) {
  const navigate = useNavigate();
  const { t } = useLangue();

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-10'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl font-semibold text-warm-900'>
            {t("home.greeting")}, {user.nom?.split(" ")[0]} 👋
          </h1>
          <p className='text-warm-500 mt-1 text-sm'>{t("home.subtitle")}</p>
        </div>

        {user.langues?.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {user.langues.map((l) => (
              <div
                key={l.langue}
                className='bg-white rounded-2xl border border-warm-200
                  shadow-soft p-5 flex items-center justify-between
                  hover:shadow-card transition-shadow'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-2xl sm:text-3xl'>
                    {LANGUE_EMOJI[l.langue] || "🌐"}
                  </span>
                  <div>
                    <p className='font-semibold text-warm-900'>{l.langue}</p>
                    <p className='text-sm text-warm-500 mt-0.5'>
                      {t("home.level")} {l.niveau}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/scenarios?langue=${l.langue}`)}
                  className='px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white
                    hover:opacity-90 transition-opacity shrink-0'
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                  }}
                >
                  {t("home.practice")}
                </button>
              </div>
            ))}

            <button
              onClick={() => navigate("/quiz")}
              className='w-full py-4 rounded-2xl border-2 border-dashed border-warm-300
                text-warm-500 text-sm font-medium hover:border-orange-300
                hover:text-orange-500 transition-colors flex items-center
                justify-center gap-2'
            >
              <Plus size={18} />
              {t("home.addLanguage")}
            </button>
          </div>
        ) : (
          <div className='bg-white rounded-2xl border border-warm-200 shadow-card p-6 sm:p-10 text-center'>
            <div className='text-3xl sm:text-4xl mb-3 sm:mb-4'>🌍</div>
            <h2 className='text-base sm:text-lg font-semibold text-warm-900 mb-2'>
              {t("home.noLanguage")}
            </h2>
            <p className='text-warm-500 text-sm mb-6'>
              {t("home.noLanguageSub")}
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className='px-8 py-3 rounded-xl font-semibold text-white text-sm
                hover:opacity-90 transition-opacity'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              {t("home.start")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Export principal — détection du rôle ─────────────────────
export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "admin") {
    return <AdminHome user={user} />;
  }

  return <UserHome user={user} />;
}
