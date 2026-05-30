// Landing.jsx — Page d'accueil publique LinguaPath
// Responsive, couleurs soft blanc/orange, icônes lucide-react

import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  MessageCircle, BarChart2, BookOpen, Brain,
  Mic, Pencil, ChevronRight, Check, Globe, Sparkles
} from "lucide-react";

const FEATURES = [
  {
    icon: <MessageCircle size={24} className="text-orange-500" />,
    title: "Scénarios réels",
    desc: "L'IA joue un rôle précis — serveur, recruteur, médecin — et vous plonge dans une situation du quotidien.",
  },
  {
    icon: <BarChart2 size={24} className="text-orange-500" />,
    title: "Évaluation de niveau",
    desc: "Un test initial place l'utilisateur de A1 à C2. Les scénarios sont filtrés automatiquement selon le niveau.",
  },
  {
    icon: <BookOpen size={24} className="text-orange-500" />,
    title: "Learning Log",
    desc: "Les phrases et expressions clés sont extraites automatiquement après chaque session et sauvegardées.",
  },
  {
    icon: <Brain size={24} className="text-orange-500" />,
    title: "MindMap visuelle",
    desc: "Un arbre interactif de connaissances qui grandit à chaque session. Exportable en image PNG.",
  },
  {
    icon: <Mic size={24} className="text-orange-500" />,
    title: "Mode voix",
    desc: "Dictez votre réponse avec le micro — Web Speech API convertit votre voix en texte instantanément.",
  },
  {
    icon: <Pencil size={24} className="text-orange-500" />,
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
  { num: "03", title: "Choisis un scénario", desc: "Restaurant, voyage, entretien d'embauche... adapté à ton niveau." },
  { num: "04", title: "Parle avec l'IA", desc: "L'IA joue un rôle précis. Tu pratiques, elle corrige discrètement." },
  { num: "05", title: "Suis ta progression", desc: "Learning Log + MindMap mis à jour automatiquement après chaque session." },
];

const BENEFITS = [
  "Conversations guidées par IA dans des scénarios réels",
  "Évaluation de niveau CECRL (A1 à C2)",
  "Learning Log automatique après chaque session",
  "MindMap interactive et exportable en PNG",
  "Support de 8 langues dont coréen, japonais et arabe",
  "Mode voix, romanisation et cartes de phrases",
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-warm-900">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-warm-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="navbar" />
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-warm-600
                hover:text-warm-900 transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold text-white
                hover:opacity-90 transition-opacity shadow-soft"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              <span className="hidden sm:inline">Commencer gratuitement</span>
              <span className="sm:hidden">S'inscrire</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-warm-50 border-b border-warm-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-10 py-16 sm:py-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold mb-8">
            <Sparkles size={13} />
            Plateforme IA d'apprentissage des langues
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-warm-900
            mb-6 leading-tight tracking-tight">
            Apprenez les langues<br />
            <span style={{
              background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              en conversant avec l'IA
            </span>
          </h1>

          <p className="text-base sm:text-lg text-warm-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Des conversations guidées dans des situations réelles, un suivi automatique
            de votre progression, et une MindMap visuelle de vos connaissances.
            Pour les niveaux A2 à B2.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white
                hover:opacity-90 transition-opacity shadow-soft
                flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              Commencer gratuitement
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold
                text-warm-700 border border-warm-200 bg-white
                hover:border-orange-200 hover:text-orange-600 transition-colors"
            >
              J'ai déjà un compte
            </button>
          </div>

          {/* Langues disponibles */}
          <div className="flex flex-wrap justify-center gap-2 mt-12">
            {LANGUAGES.map((l) => (
              <div key={l.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-white border border-warm-200 text-warm-600 text-xs font-medium
                  hover:border-orange-200 transition-colors">
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BÉNÉFICES RAPIDES ── */}
      <section className="py-10 bg-white border-b border-warm-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-3 p-4 rounded-xl
                bg-warm-50 border border-warm-100">
                <div className="w-5 h-5 rounded-full flex items-center justify-center
                  flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}>
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-warm-700 leading-snug">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">
              Fonctionnalités
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-warm-900">
              Tout ce qu'il faut pour progresser
            </h2>
            <p className="text-warm-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
              LinguaPath combine la puissance de l'IA avec une structure pédagogique
              que les autres applications n'ont pas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-white rounded-2xl p-6 border border-warm-200 shadow-soft
                  hover:border-orange-200 hover:shadow-card transition-all">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center
                  justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-warm-900 text-base mb-2">{f.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 bg-warm-50 border-y border-warm-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">
              Comment ça marche
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-warm-900">
              5 étapes pour progresser
            </h2>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {STEPS.map((step) => (
              <div key={step.num}
                className="flex items-start gap-5 bg-white rounded-2xl p-5
                  border border-warm-200 shadow-soft hover:border-orange-200 transition-colors">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center
                    text-white font-bold text-xs flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-warm-900 text-sm mb-1">{step.title}</h3>
                  <p className="text-warm-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-10 text-center">
          <div className="bg-orange-50 rounded-3xl border border-orange-100 p-10 sm:p-14">
            <Globe size={40} className="text-orange-500 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-warm-900 mb-4">
              Prêt à progresser ?
            </h2>
            <p className="text-warm-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Rejoignez LinguaPath et commencez votre première conversation
              guidée par l'IA dès aujourd'hui — gratuitement.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white
                hover:opacity-90 transition-opacity shadow-soft
                flex items-center gap-2 mx-auto"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              Créer mon compte gratuitement
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-warm-100 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-10 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="navbar" />
          </div>
          <p className="text-warm-500 text-sm mb-1">
            Plateforme d'apprentissage des langues par IA — EMSI Rabat 2025/2026
          </p>
          <p className="text-warm-400 text-xs">
            Aya El Haddaj &amp; Malak Fadil · Encadrante : Mme Hasnaa Chaabi
          </p>
          <div className="flex justify-center gap-6 mt-6 text-xs text-warm-400">
            <button onClick={() => navigate("/login")}
              className="hover:text-orange-500 transition-colors">
              Se connecter
            </button>
            <button onClick={() => navigate("/signup")}
              className="hover:text-orange-500 transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}