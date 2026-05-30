// Landing.jsx — Page d'accueil publique de LinguaPath
// Accessible à tous sans connexion — optimisée SEO

import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const FEATURES = [
  {
    emoji: "🎭",
    title: "Scénarios réels",
    desc: "L'IA joue un rôle précis — serveur, recruteur, médecin — et vous plonge dans une situation du quotidien.",
  },
  {
    emoji: "📊",
    title: "Évaluation de niveau",
    desc: "Un test initial place l'utilisateur de A1 à C2. Les scénarios sont filtrés automatiquement selon son niveau.",
  },
  {
    emoji: "📝",
    title: "Learning Log",
    desc: "Les phrases et expressions clés sont extraites automatiquement après chaque session et sauvegardées.",
  },
  {
    emoji: "🧠",
    title: "MindMap visuelle",
    desc: "Un arbre interactif de connaissances qui grandit à chaque session. Exportable en image PNG.",
  },
  {
    emoji: "✍️",
    title: "Saisie multilingue",
    desc: "Romanisation automatique, mode voix (Web Speech API) ou cartes de phrases — au choix.",
  },
  {
    emoji: "🔄",
    title: "Corrections discrètes",
    desc: "L'IA corrige les erreurs de grammaire et de vocabulaire de manière naturelle à chaque échange.",
  },
];

const LANGUAGES = [
  { flag: "🇬🇧", name: "Anglais" },
  { flag: "🇪🇸", name: "Espagnol" },
  { flag: "🇫🇷", name: "Français" },
  { flag: "🇩🇪", name: "Allemand" },
  { flag: "🇰🇷", name: "Coréen" },
  { flag: "🇯🇵", name: "Japonais" },
  { flag: "🇨🇳", name: "Chinois" },
  { flag: "🇸🇦", name: "Arabe" },
];

const STEPS = [
  { num: "01", title: "Inscris-toi", desc: "Crée ton compte en 30 secondes avec ton email." },
  { num: "02", title: "Évalue ton niveau", desc: "Un QCM rapide détermine ton niveau A1 → C2 dans la langue choisie." },
  { num: "03", title: "Choisis un scénario", desc: "Restaurant, voyage, entretien d'embauche, médecin... adapté à ton niveau." },
  { num: "04", title: "Parle avec l'IA", desc: "L'IA joue un rôle précis. Tu pratiques, elle corrige discrètement." },
  { num: "05", title: "Suis ta progression", desc: "Learning Log + MindMap mis à jour automatiquement après chaque session." },
];

const COMPARE = [
  { app: "Duolingo", conv: false, log: false, mind: false, niveau: true },
  { app: "Babbel", conv: "partial", log: false, mind: false, niveau: "partial" },
  { app: "HelloTalk", conv: "partial", log: false, mind: false, niveau: false },
  { app: "ChatGPT", conv: true, log: false, mind: false, niveau: false },
  { app: "LinguaPath", conv: true, log: true, mind: true, niveau: true, highlight: true },
];

function CheckCell({ val }) {
  if (val === true) return <span className="text-green-600 font-bold text-base">✓</span>;
  if (val === "partial") return <span className="text-yellow-500 font-bold text-sm">~</span>;
  return <span className="text-red-400 text-base">✕</span>;
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-warm-900" style={{ fontFamily: "'Georgia', serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="navbar" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-warm-600
                hover:text-warm-900 transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white
                hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B2A4A 0%, #2D4A7A 60%, #EA580C 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #EA580C, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-white/10 border border-white/20 text-white text-xs font-medium mb-8">
            ✨ Plateforme IA d'apprentissage des langues
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Apprenez les langues<br />
            <span style={{
              background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              en conversant avec l'IA
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "sans-serif" }}>
            Des conversations guidées dans des situations réelles, un suivi automatique
            de votre progression, et une MindMap visuelle de vos connaissances.
            Pour les niveaux A2 à B2.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 rounded-2xl text-base font-bold text-white
                hover:opacity-90 transition-all hover:scale-105 shadow-lg"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)", fontFamily: "sans-serif" }}
            >
              Commencer gratuitement →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-2xl text-base font-semibold text-white
                bg-white/10 border border-white/30 hover:bg-white/20 transition-all"
              style={{ fontFamily: "sans-serif" }}
            >
              J'ai déjà un compte
            </button>
          </div>

          {/* Langues disponibles */}
          <div className="flex flex-wrap justify-center gap-3 mt-14">
            {LANGUAGES.map((l) => (
              <div key={l.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full
                  bg-white/10 border border-white/20 text-white text-sm"
                style={{ fontFamily: "sans-serif" }}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3"
              style={{ fontFamily: "sans-serif" }}>
              Fonctionnalités
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900"
              style={{ fontFamily: "'Georgia', serif" }}>
              Tout ce qu'il faut pour progresser
            </h2>
            <p className="text-warm-500 mt-4 max-w-xl mx-auto text-base leading-relaxed"
              style={{ fontFamily: "sans-serif" }}>
              LinguaPath combine l'IA générative avec une structure pédagogique
              que les autres applications n'ont pas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-warm-50 rounded-2xl p-6 border border-warm-100
                  hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="text-4xl mb-4">{f.emoji}</div>
                <h3 className="font-bold text-warm-900 text-lg mb-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {f.title}
                </h3>
                <p className="text-warm-500 text-sm leading-relaxed"
                  style={{ fontFamily: "sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-24" style={{ background: "#F7F9FC" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3"
              style={{ fontFamily: "sans-serif" }}>
              Comment ça marche
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900"
              style={{ fontFamily: "'Georgia', serif" }}>
              5 étapes pour progresser
            </h2>
          </div>

          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.num}
                className="flex items-start gap-6 bg-white rounded-2xl p-6
                  border border-warm-100 hover:border-orange-200 transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center
                    text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                    fontFamily: "sans-serif" }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-warm-900 text-base mb-1"
                    style={{ fontFamily: "'Georgia', serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-warm-500 text-sm leading-relaxed"
                    style={{ fontFamily: "sans-serif" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARAISON ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3"
              style={{ fontFamily: "sans-serif" }}>
              Comparaison
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900"
              style={{ fontFamily: "'Georgia', serif" }}>
              Pourquoi LinguaPath ?
            </h2>
            <p className="text-warm-500 mt-4 max-w-xl mx-auto text-base"
              style={{ fontFamily: "sans-serif" }}>
              Aucune autre application ne combine toutes ces fonctionnalités.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-warm-200 shadow-sm">
            <table className="w-full text-sm" style={{ fontFamily: "sans-serif" }}>
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="text-left px-6 py-4 font-bold text-warm-900 bg-warm-50">Application</th>
                  <th className="text-center px-4 py-4 font-semibold text-warm-600 bg-warm-50">Conv. IA libre</th>
                  <th className="text-center px-4 py-4 font-semibold text-warm-600 bg-warm-50">Learning Log</th>
                  <th className="text-center px-4 py-4 font-semibold text-warm-600 bg-warm-50">MindMap</th>
                  <th className="text-center px-4 py-4 font-semibold text-warm-600 bg-warm-50">Niveaux A1→C2</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.app}
                    className={`border-b border-warm-100 last:border-b-0
                      ${row.highlight ? "bg-orange-50" : "hover:bg-warm-50"}`}>
                    <td className="px-6 py-4">
                      <span className={`font-${row.highlight ? "bold" : "medium"}
                        ${row.highlight ? "text-orange-600" : "text-warm-800"}`}>
                        {row.app}
                        {row.highlight && " ⭐"}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4"><CheckCell val={row.conv} /></td>
                    <td className="text-center px-4 py-4"><CheckCell val={row.log} /></td>
                    <td className="text-center px-4 py-4"><CheckCell val={row.mind} /></td>
                    <td className="text-center px-4 py-4"><CheckCell val={row.niveau} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1B2A4A, #2D4A7A)" }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Georgia', serif" }}>
            Prêt à progresser ?
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed"
            style={{ fontFamily: "sans-serif" }}>
            Rejoignez LinguaPath et commencez votre première conversation
            guidée par l'IA dès aujourd'hui — gratuitement.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 rounded-2xl text-base font-bold text-white
              hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              fontFamily: "sans-serif" }}
          >
            Créer mon compte gratuitement →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-warm-900 text-warm-400 py-10 text-center text-sm"
        style={{ fontFamily: "sans-serif" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center mb-4">
            <Logo size="navbar" />
          </div>
          <p className="mb-2">
            Plateforme d'apprentissage des langues par IA — EMSI Rabat 2025/2026
          </p>
          <p className="text-warm-600 text-xs">
            Aya El Haddaj &amp; Malak Fadil · Encadrante : Mme Hasnaa Chaabi
          </p>
          <div className="flex justify-center gap-6 mt-6 text-xs text-warm-500">
            <button onClick={() => navigate("/login")} className="hover:text-orange-400 transition-colors">Se connecter</button>
            <button onClick={() => navigate("/signup")} className="hover:text-orange-400 transition-colors">S'inscrire</button>
          </div>
        </div>
      </footer>

    </div>
  );
}