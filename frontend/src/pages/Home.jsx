// Home.jsx — page d'accueil après connexion
// Si admin → dashboard admin avec gestion users + scénarios
// Si user  → page langues normale

import Navbar from "../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";

const LANGUE_EMOJI = {
  Anglais: "🇬🇧", Espagnol: "🇪🇸", Français: "🇫🇷",
  Allemand: "🇩🇪", Coréen: "🇰🇷", Japonais: "🇯🇵",
  Chinois: "🇨🇳", Arabe: "🇸🇦",
};

// ── Dashboard Admin ───────────────────────────────────────────
function AdminHome({ user }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-10">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">
            Tableau de bord
          </p>
          <h1 className="text-2xl font-semibold text-warm-900">
            Bonjour, {user.nom?.split(" ")[0]} ⚙️
          </h1>
          <p className="text-warm-500 mt-1 text-sm">
            Espace administrateur — gestion de la plateforme LinguaPath
          </p>
        </div>

        {/* Cards admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Card Utilisateurs */}
          <div
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-2xl border border-warm-200 shadow-soft
              p-8 cursor-pointer hover:border-orange-200 hover:shadow-card
              transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)" }}
              >
                👥
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full
                  bg-purple-50 text-purple-600 border border-purple-100"
              >
                Admin
              </span>
            </div>
            <h2 className="text-lg font-semibold text-warm-900 mb-2">
              Gestion des utilisateurs
            </h2>
            <p className="text-sm text-warm-500 mb-6 leading-relaxed">
              Consulter la liste des apprenants inscrits, voir leurs langues et niveaux, activer ou désactiver un compte.
            </p>
            <div
              className="flex items-center gap-2 text-sm font-semibold text-purple-600
                group-hover:gap-3 transition-all"
            >
              Voir les utilisateurs
              <span>→</span>
            </div>
          </div>

          {/* Card Scénarios */}
          <div
            onClick={() => navigate("/admin/scenarios")}
            className="bg-white rounded-2xl border border-warm-200 shadow-soft
              p-8 cursor-pointer hover:border-orange-200 hover:shadow-card
              transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}
              >
                🎭
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full
                  bg-orange-50 text-orange-600 border border-orange-100"
              >
                Admin
              </span>
            </div>
            <h2 className="text-lg font-semibold text-warm-900 mb-2">
              Gestion des scénarios
            </h2>
            <p className="text-sm text-warm-500 mb-6 leading-relaxed">
              Créer, modifier et supprimer les scénarios de conversation disponibles sur la plateforme.
            </p>
            <div
              className="flex items-center gap-2 text-sm font-semibold text-orange-600
                group-hover:gap-3 transition-all"
            >
              Gérer les scénarios
              <span>→</span>
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

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-10">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold text-warm-900">
            Bonjour, {user.nom?.split(" ")[0]} 👋
          </h1>
          <p className="text-warm-500 mt-1 text-sm">
            Prête à pratiquer aujourd'hui ?
          </p>
        </div>

        {user.langues?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {user.langues.map((l) => (
              <div
                key={l.langue}
                className="bg-white rounded-2xl border border-warm-200
                  shadow-soft p-5 flex items-center justify-between
                  hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{LANGUE_EMOJI[l.langue] || "🌐"}</span>
                  <div>
                    <p className="font-semibold text-warm-900">{l.langue}</p>
                    <p className="text-sm text-warm-500 mt-0.5">Niveau {l.niveau}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/scenarios?langue=${l.langue}`)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white
                    hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
                >
                  Pratiquer →
                </button>
              </div>
            ))}

            <button
              onClick={() => navigate("/quiz")}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-warm-300
                text-warm-500 text-sm font-medium hover:border-orange-300
                hover:text-orange-500 transition-colors flex items-center
                justify-center gap-2"
            >
              <span className="text-lg">+</span>
              Ajouter une nouvelle langue
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-200 shadow-card p-10 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h2 className="text-lg font-semibold text-warm-900 mb-2">
              Quelle langue veux-tu pratiquer ?
            </h2>
            <p className="text-warm-500 text-sm mb-6">
              Choisis une langue et on évalue ton niveau en 2 minutes.
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className="px-8 py-3 rounded-xl font-semibold text-white text-sm
                hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              Commencer
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