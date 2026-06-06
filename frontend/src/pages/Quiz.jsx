// Page de test d'évaluation — 3 étapes :
//   1. Choix de la langue
//   2. Questions à choix multiples (+ option "Je ne sais pas")
//   3. Résultat avec le niveau calculé

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Logo from "../components/Logo";

const LANGUES = [
  "Anglais",
  "Espagnol",
  "Français",
  "Allemand",
  "Coréen",
  "Japonais",
  "Chinois",
  "Arabe",
];

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

export default function Quiz() {
  const navigate = useNavigate();

  const [etape, setEtape] = useState("langue");
  const [langue, setLangue] = useState("");
  const [questions, setQuestions] = useState([]);
  const [indexCourant, setIndexCourant] = useState(0);
  const [reponses, setReponses] = useState([]);

  // null = rien sélectionné | 0-3 = option ABCD | -1 = "Je ne sais pas"
  const [reponseSelectionnee, setReponseSelectionnee] = useState(null);

  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Étape 1 → 2 : charger les questions ──
  const demarrerQuiz = async (langueChoisie) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/quiz/${langueChoisie}`);
      setQuestions(res.data.questions);
      setLangue(langueChoisie);
      setEtape("questions");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des questions",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Valider une réponse (-1 = "Je ne sais pas" → compte comme faux) ──
  const validerReponse = () => {
    // null = rien sélectionné → on bloque
    // -1 = "Je ne sais pas" → accepté (compte comme mauvaise réponse côté backend)
    if (reponseSelectionnee === null) return;

    const question = questions[indexCourant];
    const nouvellesReponses = [
      ...reponses,
      { questionId: question._id, reponseChoisie: reponseSelectionnee },
    ];
    setReponses(nouvellesReponses);
    setReponseSelectionnee(null);

    if (indexCourant === questions.length - 1) {
      soumettre(nouvellesReponses);
    } else {
      setIndexCourant(indexCourant + 1);
    }
  };

  // ── Soumettre toutes les réponses ──
  const soumettre = async (toutesLesReponses) => {
    setLoading(true);
    try {
      const res = await api.post("/quiz/result", {
        langue,
        reponses: toutesLesReponses,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setResultat(res.data);
      setEtape("resultat");
    } catch (err) {
      setError("Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  const descriptionNiveau = {
    A1: "Débutant — Tu connais les bases essentielles.",
    A2: "Élémentaire — Tu peux gérer des situations simples.",
    B1: "Intermédiaire — Tu t'exprimes sur des sujets familiers.",
    B2: "Intermédiaire avancé — Tu communiques avec aisance.",
    C1: "Avancé — Tu maîtrises la langue couramment.",
    C2: "Maîtrise — Niveau quasi-natif. Bravo !",
  };

  // ════════════════════════════════
  // ÉTAPE 1 — Choix de la langue
  // ════════════════════════════════
  if (etape === "langue") {
    return (
      <div className='min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 py-10'>
        <div className='mb-10'>
          <Logo size='small' />
        </div>
        <div className='w-full max-w-lg'>
          <h1 className='text-2xl font-semibold text-warm-900 text-center mb-2'>
            Quelle langue veux-tu pratiquer ?
          </h1>
          <p className='text-warm-500 text-sm text-center mb-8'>
            On va évaluer ton niveau en quelques questions rapides.
          </p>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 text-center'>
              {error}
            </div>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {LANGUES.map((l) => (
              <button
                key={l}
                onClick={() => demarrerQuiz(l)}
                disabled={loading}
                className='flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-warm-200 shadow-soft hover:border-orange-300 hover:shadow-card transition-all disabled:opacity-50 cursor-pointer'
              >
                <span className='text-3xl'>{LANGUE_EMOJI[l]}</span>
                <span className='text-sm font-medium text-warm-700'>{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════
  // ÉTAPE 2 — Questions
  // ════════════════════════════════
  if (etape === "questions") {
    const question = questions[indexCourant];
    const progression = (indexCourant / questions.length) * 100;

    return (
      <div className='min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 py-10'>
        <div className='w-full max-w-xl'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <Logo size='navbar' />
            <span className='text-sm text-warm-500'>
              {indexCourant + 1} / {questions.length}
            </span>
          </div>

          {/* Barre de progression */}
          <div className='w-full h-1.5 bg-warm-200 rounded-full mb-8 overflow-hidden'>
            <div
              className='h-full rounded-full transition-all duration-500'
              style={{
                width: `${progression}%`,
                background: "linear-gradient(to right, #F59E0B, #EA580C)",
              }}
            />
          </div>

          {/* Card question */}
          <div className='bg-white rounded-2xl border border-warm-200 shadow-card p-8 mb-4'>
            <span className='inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-4'>
              {LANGUE_EMOJI[langue]} {langue}
            </span>

            <h2 className='text-lg font-semibold text-warm-900 mb-6'>
              {question.question}
            </h2>

            {/* Options A B C D */}
            <div className='flex flex-col gap-3'>
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setReponseSelectionnee(i)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all
                    ${
                      reponseSelectionnee === i
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-warm-200 bg-warm-50 text-warm-700 hover:border-orange-300"
                    }`}
                >
                  <span
                    className={`inline-block w-6 h-6 rounded-full text-xs text-center leading-6 mr-3 font-bold
                    ${reponseSelectionnee === i ? "bg-orange-500 text-white" : "bg-warm-200 text-warm-600"}`}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {option}
                </button>
              ))}

              {/* ── Option "Je ne sais pas" ── */}
              {/* Visuellement séparée des options ABCD — style discret en tirets */}
              {/* Envoie -1 au backend → -1 !== reponseCorrecte → compte comme faux */}
              <button
                onClick={() => setReponseSelectionnee(-1)}
                className={`w-full text-left px-5 py-3 rounded-xl border mt-1 text-sm font-medium transition-all
                  ${
                    reponseSelectionnee === -1
                      ? "border-warm-400 bg-warm-100 text-warm-700"
                      : "border-dashed border-warm-300 bg-transparent text-warm-400 hover:border-warm-400 hover:text-warm-600"
                  }`}
              >
                <span
                  className={`inline-block w-6 h-6 rounded-full text-xs text-center leading-6 mr-3 font-bold
                  ${reponseSelectionnee === -1 ? "bg-warm-500 text-white" : "bg-warm-200 text-warm-400"}`}
                >
                  ?
                </span>
                Je ne sais pas
              </button>
            </div>
          </div>

          {/* Bouton valider — activé dès qu'une option est sélectionnée (y compris -1) */}
          <button
            onClick={validerReponse}
            disabled={reponseSelectionnee === null || loading}
            className='w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-40 hover:opacity-90'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            {loading
              ? "Calcul en cours..."
              : indexCourant === questions.length - 1
                ? "Voir mon résultat"
                : "Question suivante →"}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════
  // ÉTAPE 3 — Résultat
  // ════════════════════════════════
  if (etape === "resultat") {
    return (
      <div className='min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 py-10'>
        <div className='w-full max-w-md text-center'>
          <div className='flex justify-center mb-8'>
            <Logo size='small' />
          </div>

          <div
            className='inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold text-white mb-6'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            {resultat.niveau}
          </div>

          <h1 className='text-2xl font-semibold text-warm-900 mb-2'>
            Ton niveau en {langue}
          </h1>
          <p className='text-warm-500 text-sm mb-8'>
            {descriptionNiveau[resultat.niveau]}
          </p>

          <button
            onClick={() => navigate("/home")}
            className='w-full py-3.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            Commencer à pratiquer →
          </button>

          <button
            onClick={() => {
              setEtape("langue");
              setReponses([]);
              setIndexCourant(0);
              setResultat(null);
            }}
            className='w-full mt-3 py-3 rounded-xl text-sm font-medium text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors'
          >
            Tester une autre langue
          </button>
        </div>
      </div>
    );
  }
}
