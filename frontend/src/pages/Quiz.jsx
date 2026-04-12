// Page de test d'évaluation — 3 étapes :
//   1. Choix de la langue
//   2. 10 questions à choix multiples
//   3. Résultat avec le niveau calculé

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Logo from "../components/Logo";

// Langues disponibles dans l'app
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

// Emoji par langue — pour rendre l'UI plus vivante
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

  // Étape courante : 'langue' | 'questions' | 'resultat'
  const [etape, setEtape] = useState("langue");

  // Langue choisie par l'utilisateur
  const [langue, setLangue] = useState("");

  // Questions reçues du backend
  const [questions, setQuestions] = useState([]);

  // Index de la question affichée (0 à questions.length-1)
  const [indexCourant, setIndexCourant] = useState(0);

  // Réponses de l'utilisateur — [{ questionId, reponseChoisie }]
  const [reponses, setReponses] = useState([]);

  // Réponse sélectionnée pour la question courante (avant validation)
  const [reponseSelectionnee, setReponseSelectionnee] = useState(null);

  // Résultat final reçu du backend
  const [resultat, setResultat] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Étape 1 → 2 : charger les questions pour la langue choisie ──
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

  // ── Valider une réponse et passer à la suivante ──
  const validerReponse = () => {
    if (reponseSelectionnee === null) return;

    const question = questions[indexCourant];

    // Ajouter la réponse à la liste
    const nouvellesReponses = [
      ...reponses,
      { questionId: question._id, reponseChoisie: reponseSelectionnee },
    ];
    setReponses(nouvellesReponses);
    setReponseSelectionnee(null);

    // Si c'était la dernière question → soumettre
    if (indexCourant === questions.length - 1) {
      soumettre(nouvellesReponses);
    } else {
      setIndexCourant(indexCourant + 1);
    }
  };

  // ── Soumettre toutes les réponses au backend ──
  const soumettre = async (toutesLesReponses) => {
    setLoading(true);
    try {
      const res = await api.post("/quiz/result", {
        langue,
        reponses: toutesLesReponses,
      });
      // Mettre à jour le localStorage avec le nouveau profil
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setResultat(res.data);
      setEtape("resultat");
    } catch (err) {
      setError("Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  // ── Descriptions des niveaux pour la page résultat ──
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
            On va évaluer ton niveau en 10 questions rapides.
          </p>

          {error && (
            <div
              className='bg-red-50 border border-red-200 text-red-600
                            text-sm rounded-xl px-4 py-3 mb-5 text-center'
            >
              {error}
            </div>
          )}

          {/* Grille de langues */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {LANGUES.map((l) => (
              <button
                key={l}
                onClick={() => demarrerQuiz(l)}
                disabled={loading}
                className='flex flex-col items-center gap-2 p-4 bg-white
                           rounded-2xl border border-warm-200 shadow-soft
                           hover:border-orange-300 hover:shadow-card
                           transition-all disabled:opacity-50 cursor-pointer'
              >
                <span className='text-3xl'>{LANGUE_EMOJI[l]}</span>
                <span className='text-sm font-medium text-warm-700'>{l}</span>
              </button>
            ))}
          </div>

          {/* Lien pour passer le test si déjà expérimenté */}
          <p className='text-center mt-8 text-sm text-warm-400'>
            Tu connais déjà ton niveau ?{" "}
            <button
              onClick={() => navigate("/")}
              className='text-orange-600 font-medium hover:underline'
            >
              Passer pour l'instant
            </button>
          </p>
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
          {/* Header — logo + progression */}
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
            {/* Badge langue + niveau indicatif */}
            <span
              className='inline-block text-xs font-semibold text-orange-600
                             bg-orange-50 px-3 py-1 rounded-full mb-4'
            >
              {LANGUE_EMOJI[langue]} {langue}
            </span>

            <h2 className='text-lg font-semibold text-warm-900 mb-6'>
              {question.question}
            </h2>

            {/* Options de réponse */}
            <div className='flex flex-col gap-3'>
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setReponseSelectionnee(i)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border
                              text-sm font-medium transition-all
                              ${
                                reponseSelectionnee === i
                                  ? "border-orange-500 bg-orange-50 text-orange-700"
                                  : "border-warm-200 bg-warm-50 text-warm-700 hover:border-orange-300"
                              }`}
                >
                  {/* Lettre A B C D */}
                  <span
                    className={`inline-block w-6 h-6 rounded-full text-xs
                                   text-center leading-6 mr-3 font-bold
                                   ${
                                     reponseSelectionnee === i
                                       ? "bg-orange-500 text-white"
                                       : "bg-warm-200 text-warm-600"
                                   }`}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton valider */}
          <button
            onClick={validerReponse}
            disabled={reponseSelectionnee === null || loading}
            className='w-full py-3.5 rounded-xl font-semibold text-white text-sm
                       transition-opacity disabled:opacity-40 hover:opacity-90'
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

          {/* Badge niveau */}
          <div
            className='inline-flex items-center justify-center w-24 h-24
                          rounded-full text-3xl font-bold text-white mb-6'
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

          {/* Bouton continuer */}
          <button
            onClick={() => navigate("/")}
            className='w-full py-3.5 rounded-xl font-semibold text-white text-sm
                       hover:opacity-90 transition-opacity'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            Commencer à pratiquer →
          </button>

          {/* Lien pour refaire le test dans une autre langue */}
          <button
            onClick={() => {
              setEtape("langue");
              setReponses([]);
              setIndexCourant(0);
              setResultat(null);
            }}
            className='w-full mt-3 py-3 rounded-xl text-sm font-medium
                       text-warm-600 border border-warm-200 hover:bg-warm-100
                       transition-colors'
          >
            Tester une autre langue
          </button>
        </div>
      </div>
    );
  }
}
