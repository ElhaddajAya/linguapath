// Page affichant toutes les phrases apprises par l'utilisateur.
// Fonctionnalités : filtres, ajout manuel, suppression.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import { BookOpen, Plus, X, Bot, PenLine, Trash2 } from "lucide-react";
import api from "../services/api";
import { useLangue } from "../contexts/LangueContext";

// ── Constantes ──────────────────────────────────────────────

// Emoji par langue — pour rendre les filtres visuels
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

const NIVEAUX = ["A1", "A2", "B1", "B2", "C1", "C2"];

// ── Carte d'une phrase ───────────────────────────────────────
// t() passé en prop car ce composant est défini hors du composant principal
function PhraseCard({ entry, onDelete, t }) {
  return (
    <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-5 flex flex-col gap-3 hover:border-orange-200 transition-colors'>
      {/* Badge langue + thème */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{LANGUE_EMOJI[entry.langue] || "🌍"}</span>
          <span className='text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-medium'>
            {entry.theme}
          </span>
        </div>
        <span className='text-xs px-2 py-0.5 rounded-full bg-warm-100 text-warm-500 font-medium'>
          {entry.niveau}
        </span>
      </div>

      {/* Phrase dans la langue cible */}
      <p className='text-warm-900 font-semibold text-base leading-relaxed'>
        {entry.phrase}
      </p>

      {/* Traduction française */}
      <p className='text-warm-500 text-sm italic'>{entry.traduction}</p>

      {/* Footer : source + supprimer */}
      <div className='flex items-center justify-between pt-2 border-t border-warm-100'>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${entry.source === "auto" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-600"}`}
        >
          {entry.source === "auto" ? (
            <span className='inline-flex items-center gap-1'>
              <Bot size={12} /> {t("learningLog.auto")}
            </span>
          ) : (
            <span className='inline-flex items-center gap-1'>
              <PenLine size={12} /> {t("learningLog.manual")}
            </span>
          )}
        </span>
        <button
          onClick={() => onDelete(entry._id)}
          className='text-xs text-warm-400 hover:text-red-500 transition-colors flex items-center gap-1'
        >
          <Trash2 size={13} /> {t("learningLog.delete")}
        </button>
      </div>
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────

export default function LearningLog() {
  const navigate = useNavigate();
  // t() = fonction de traduction du contexte LangueContext
  const { t } = useLangue();

  // ─ State : données
  const [entries, setEntries] = useState([]); // phrases chargées
  const [loading, setLoading] = useState(true);

  // ─ State : filtres actifs
  const [filtreLangue, setFiltreLangue] = useState("");
  const [filtreTheme, setFiltreTheme] = useState("");
  const [filtreNiveau, setFiltreNiveau] = useState("");

  // ─ State : thèmes disponibles (extraits des entries)
  const [themes, setThemes] = useState([]);

  // ─ State : modal d'ajout manuel
  const [showModal, setShowModal] = useState(false);
  const [ajoutLoading, setAjoutLoading] = useState(false);
  const [form, setForm] = useState({
    phrase: "",
    traduction: "",
    langue: "",
    theme: "",
    pattern: "",
  });

  // ─ State : langues de l'utilisateur
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const languesUser = user.langues?.map((l) => l.langue) || [];

  // ── Chargement ────────────────────────────────────────────

  useEffect(() => {
    chargerEntries();
  }, [filtreLangue, filtreTheme, filtreNiveau]);

  const chargerEntries = async () => {
    setLoading(true);
    try {
      // Construction des query params selon les filtres actifs
      const params = {};
      if (filtreLangue) params.langue = filtreLangue;
      if (filtreTheme) params.theme = filtreTheme;
      if (filtreNiveau) params.niveau = filtreNiveau;

      const res = await api.get("/learning-log", { params });
      setEntries(res.data.entries);

      // Extraire les thèmes uniques pour le filtre
      const themesUniques = [...new Set(res.data.entries.map((e) => e.theme))];
      setThemes(themesUniques);
    } catch (err) {
      console.error("Erreur chargement learning log :", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Suppression ───────────────────────────────────────────

  const supprimerPhrase = async (id) => {
    if (!window.confirm(t("learningLog.confirm"))) return;
    try {
      await api.delete(`/learning-log/${id}`);
      // Mise à jour locale sans recharger
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err.message);
    }
  };

  // ── Ajout manuel ─────────────────────────────────────────

  const ajouterPhrase = async () => {
    if (!form.phrase || !form.traduction || !form.langue) return;

    setAjoutLoading(true);
    try {
      const res = await api.post("/learning-log", {
        phrase: form.phrase.trim(),
        traduction: form.traduction.trim(),
        langue: form.langue,
        theme: form.theme || "Général",
        pattern: form.pattern.trim() || "Général",
      });
      // Ajouter la nouvelle entrée en haut de la liste
      setEntries((prev) => [res.data.entry, ...prev]);
      // Réinitialiser le formulaire et fermer le modal
      setForm({
        phrase: "",
        traduction: "",
        langue: "",
        theme: "",
        pattern: "",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Erreur ajout :", err.message);
    } finally {
      setAjoutLoading(false);
    }
  };

  // ── Réinitialiser les filtres ─────────────────────────────

  const resetFiltres = () => {
    setFiltreLangue("");
    setFiltreTheme("");
    setFiltreNiveau("");
  };

  const filtresActifs = filtreLangue || filtreTheme || filtreNiveau;

  // Patterns déjà utilisés pour la langue sélectionnée dans le formulaire
  // (recalculé automatiquement à chaque fois que form.langue ou entries change)
  const patternsPourLangue = [
    ...new Set(
      entries
        .filter(
          (e) =>
            e.langue === form.langue && e.pattern && e.pattern !== "Général",
        )
        .map((e) => e.pattern),
    ),
  ];

  // ── Rendu ────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-5 sm:py-10'>
        {/* ── Header ── */}
        <div className='flex items-center justify-between mb-5 sm:mb-8 flex-wrap gap-3'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold text-warm-900 flex items-center gap-2'>
              <BookOpen
                size={20}
                className='text-orange-500'
              />{" "}
              {t("learningLog.title")}
            </h1>
            <p className='text-warm-500 text-xs sm:text-sm mt-1'>
              {entries.length}{" "}
              {entries.length !== 1
                ? t("learningLog.phrases")
                : t("learningLog.phrase")}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className='flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl
                                   text-sm font-semibold text-white hover:opacity-90
                                   transition-opacity shadow-soft'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            <Plus size={15} />
            <span className='hidden sm:inline'>
              {t("learningLog.addPhrase")}
            </span>
            <span className='sm:hidden'>{t("learningLog.add")}</span>
          </button>
        </div>

        {/* ── Filtres ── */}
        <div
          className='bg-white rounded-2xl border border-warm-200
                                shadow-soft p-4 sm:p-5 mb-4 sm:mb-6'
        >
          <div className='flex flex-wrap gap-2 sm:gap-4 items-end w-full'>
            {/* Filtre langue */}
            <div className='flex flex-col gap-1.5 flex-1 min-w-30'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.language")}
              </label>
              <select
                value={filtreLangue}
                onChange={(e) => setFiltreLangue(e.target.value)}
                className='w-full px-3 py-2 rounded-xl border border-warm-200
                                           text-sm text-warm-700 bg-warm-50
                                           focus:outline-none focus:border-orange-300'
              >
                <option value=''>{t("learningLog.all")}</option>
                {languesUser.map((l) => (
                  <option
                    key={l}
                    value={l}
                  >
                    {LANGUE_EMOJI[l]} {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre thème */}
            <div className='flex flex-col gap-1.5 flex-1 min-w-30'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.theme")}
              </label>
              <select
                value={filtreTheme}
                onChange={(e) => setFiltreTheme(e.target.value)}
                className='w-full px-3 py-2 rounded-xl border border-warm-200
                                           text-sm text-warm-700 bg-warm-50
                                           focus:outline-none focus:border-orange-300'
              >
                <option value=''>{t("learningLog.allThemes")}</option>
                {/* Renommé "theme" au lieu de "t" pour ne pas masquer le t() de traduction */}
                {themes.map((theme) => (
                  <option
                    key={theme}
                    value={theme}
                  >
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre niveau */}
            <div className='flex flex-col gap-1.5 flex-1 min-w-25'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.level")}
              </label>
              <select
                value={filtreNiveau}
                onChange={(e) => setFiltreNiveau(e.target.value)}
                className='w-full px-3 py-2 rounded-xl border border-warm-200
                                           text-sm text-warm-700 bg-warm-50
                                           focus:outline-none focus:border-orange-300'
              >
                <option value=''>{t("learningLog.allLevels")}</option>
                {NIVEAUX.map((n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton reset filtres */}
            {filtresActifs && (
              <button
                onClick={resetFiltres}
                className='px-4 py-2 rounded-xl text-sm text-warm-500
                                           border border-warm-200 hover:border-orange-300
                                           hover:text-orange-500 transition-colors'
              >
                <X
                  size={13}
                  className='inline mr-1'
                />{" "}
                {t("learningLog.reset")}
              </button>
            )}
          </div>
        </div>

        {/* ── Contenu principal ── */}
        {loading ? (
          <div className='text-center py-20 text-warm-400'>
            {t("common.loading")}
          </div>
        ) : entries.length === 0 ? (
          <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-12 text-center'>
            <p className='text-4xl mb-4'>📝</p>
            <p className='text-warm-600 font-medium mb-2'>
              {filtresActifs
                ? t("learningLog.empty")
                : t("learningLog.emptyNoFilter")}
            </p>
            <p className='text-warm-400 text-sm mb-6'>
              {filtresActifs
                ? t("learningLog.emptyFilters")
                : t("learningLog.emptySub")}
            </p>
            {!filtresActifs && (
              <button
                onClick={() => navigate("/scenarios")}
                className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity'
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                }}
              >
                {t("learningLog.goScenario")}
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {entries.map((entry) => (
              <PhraseCard
                key={entry._id}
                entry={entry}
                onDelete={supprimerPhrase}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ajout manuel ── */}
      {showModal && (
        // Fond semi-transparent
        <div
          className='fixed inset-0 bg-black/30 backdrop-blur-sm
                               flex items-center justify-center z-50 px-4'
          onClick={() => setShowModal(false)}
        >
          {/* Carte du modal — stoppe la propagation du clic */}
          <div
            className='bg-white rounded-2xl border border-warm-200
                                   shadow-lg w-full max-w-md p-6 flex flex-col gap-5'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className='flex items-center justify-between'>
              <h2 className='font-semibold text-warm-900 text-lg flex items-center gap-2'>
                <PenLine
                  size={18}
                  className='text-orange-500'
                />{" "}
                {t("learningLog.addPhrase")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-warm-400 hover:text-warm-700'
              >
                <X size={18} />
              </button>
            </div>

            {/* Champ : phrase dans la langue cible */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.phraseLabel")}
              </label>
              <input
                type='text'
                value={form.phrase}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phrase: e.target.value }))
                }
                placeholder='Ex: ¿Cuánto cuesta?'
                className='px-4 py-2.5 rounded-xl border border-warm-200
                                           text-sm text-warm-900 bg-warm-50
                                           focus:outline-none focus:border-orange-300
                                           placeholder:text-warm-300'
              />
            </div>

            {/* Champ : traduction */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.translationLabel")}
              </label>
              <input
                type='text'
                value={form.traduction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, traduction: e.target.value }))
                }
                placeholder='Ex: Combien ça coûte ?'
                className='px-4 py-2.5 rounded-xl border border-warm-200
                                           text-sm text-warm-900 bg-warm-50
                                           focus:outline-none focus:border-orange-300
                                           placeholder:text-warm-300'
              />
            </div>

            {/* Champ : langue */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.languageLabel")}
              </label>
              <select
                value={form.langue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, langue: e.target.value }))
                }
                className='px-4 py-2.5 rounded-xl border border-warm-200
                                           text-sm text-warm-700 bg-warm-50
                                           focus:outline-none focus:border-orange-300'
              >
                <option value=''>{t("learningLog.chooseLanguage")}</option>
                {languesUser.map((l) => (
                  <option
                    key={l}
                    value={l}
                  >
                    {LANGUE_EMOJI[l]} {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Champ : pattern grammatical (optionnel) — propose les patterns déjà utilisés */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.patternLabel")}
              </label>
              <input
                type='text'
                list='patterns-existants'
                value={form.pattern}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pattern: e.target.value }))
                }
                placeholder={t("learningLog.patternPlaceholder")}
                className='px-4 py-2.5 rounded-xl border border-warm-200
                               text-sm text-warm-900 bg-warm-50
                               focus:outline-none focus:border-orange-300
                               placeholder:text-warm-300'
              />
              {/* Suggestions natives du navigateur — l'utilisateur peut choisir un pattern existant OU taper un nouveau */}
              <datalist id='patterns-existants'>
                {patternsPourLangue.map((p) => (
                  <option
                    key={p}
                    value={p}
                  />
                ))}
              </datalist>
            </div>

            {/* Champ : thème (optionnel) */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-warm-600'>
                {t("learningLog.themeLabel")}
              </label>
              <input
                type='text'
                value={form.theme}
                onChange={(e) =>
                  setForm((f) => ({ ...f, theme: e.target.value }))
                }
                placeholder={t("learningLog.themePlaceholder")}
                className='px-4 py-2.5 rounded-xl border border-warm-200
                                           text-sm text-warm-900 bg-warm-50
                                           focus:outline-none focus:border-orange-300
                                           placeholder:text-warm-300'
              />
            </div>

            {/* Boutons action */}
            <div className='flex gap-3 pt-1'>
              <button
                onClick={() => setShowModal(false)}
                className='flex-1 px-4 py-2.5 rounded-xl text-sm
                                           border border-warm-200 text-warm-600
                                           hover:border-warm-300 transition-colors'
              >
                {t("learningLog.cancel")}
              </button>
              <button
                onClick={ajouterPhrase}
                disabled={
                  ajoutLoading ||
                  !form.phrase ||
                  !form.traduction ||
                  !form.langue
                }
                className='flex-1 px-4 py-2.5 rounded-xl text-sm
                                           font-semibold text-white
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           hover:opacity-90 transition-opacity'
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                }}
              >
                {ajoutLoading
                  ? t("learningLog.adding")
                  : t("learningLog.savePhrase")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
