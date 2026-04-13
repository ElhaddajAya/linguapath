// Scenarios.jsx
// Affiche les scénarios disponibles filtrés par langue et niveau.
// La langue peut être passée en paramètre URL depuis Home.jsx

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function Scenarios() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Emoji par langue
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

  // Langue active — depuis l'URL ou la première langue de l'utilisateur
  const [langueActive, setLangueActive] = useState(
    searchParams.get("langue") || user.langues?.[0]?.langue || "",
  );

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Niveau de l'utilisateur pour la langue active
  const niveauActuel =
    user.langues?.find((l) => l.langue === langueActive)?.niveau || "A1";

  // Recharger les scénarios quand la langue change
  useEffect(() => {
    if (!langueActive) return;
    chargerScenarios();
  }, [langueActive]);

  const chargerScenarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/scenarios", {
        params: { langue: langueActive, niveau: niveauActuel },
      });
      setScenarios(res.data.scenarios);
    } catch (err) {
      setError("Impossible de charger les scénarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-10 py-10'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-warm-900'>
            Choisir un scénario
          </h1>
          <p className='text-warm-500 text-sm mt-1'>
            Niveau actuel en {langueActive} :{" "}
            <span className='font-semibold text-orange-600'>
              {niveauActuel}
            </span>
          </p>
        </div>

        {/* Sélecteur de langue — visible seulement si l'utilisateur a plusieurs langues */}
        {user.langues?.length > 1 && (
          <div className='flex gap-2 mb-8 flex-wrap'>
            {user.langues.map((l) => (
              <button
                key={l.langue}
                onClick={() => setLangueActive(l.langue)}
                className={`px-4 py-2 rounded-xl text-sm font-medium
                           border transition-all flex items-center gap-2
                           ${
                             langueActive === l.langue
                               ? "text-white border-transparent"
                               : "bg-white text-warm-600 border-warm-200 hover:border-orange-300"
                           }`}
                style={
                  langueActive === l.langue
                    ? {
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }
                    : {}
                }
              >
                {LANGUE_EMOJI[l.langue]} {l.langue}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full
                  ${
                    langueActive === l.langue
                      ? "bg-white/20 text-white"
                      : "bg-warm-100 text-warm-500"
                  }`}
                >
                  {l.niveau}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className='text-center py-20 text-warm-400'>
            Chargement des scénarios...
          </div>
        ) : error ? (
          <div className='text-center py-20 text-red-500'>{error}</div>
        ) : scenarios.length === 0 ? (
          <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-12 text-center'>
            <p className='text-4xl mb-4'>🔍</p>
            <p className='text-warm-600 font-medium mb-2'>
              Aucun scénario disponible pour ce niveau
            </p>
            <p className='text-warm-400 text-sm'>
              De nouveaux scénarios seront ajoutés bientôt.
            </p>
          </div>
        ) : (
          // Grille des scénarios
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {scenarios.map((scenario) => (
              <div
                key={scenario._id}
                onClick={() => navigate(`/chat/${scenario._id}`)}
                className='bg-white rounded-2xl border border-warm-200
                           shadow-soft p-6 flex flex-col gap-4
                           hover:shadow-card hover:border-orange-200
                           transition-all cursor-pointer'
              >
                {/* Emoji + thème */}
                <div className='flex items-center justify-between'>
                  <span className='text-3xl'>{scenario.emoji}</span>
                  <span
                    className='text-xs font-medium text-warm-400
                                   bg-warm-100 px-3 py-1 rounded-full'
                  >
                    {scenario.theme}
                  </span>
                </div>

                {/* Titre + description */}
                <div>
                  <h3 className='font-semibold text-warm-900 mb-1'>
                    {scenario.titre}
                  </h3>
                  <p className='text-sm text-warm-500 leading-relaxed'>
                    {scenario.description}
                  </p>
                </div>

                {/* Niveaux + lien */}
                <div
                  className='flex items-center justify-between mt-auto pt-3
                                border-t border-warm-100'
                >
                  <span className='text-xs text-warm-400'>
                    Niveaux {scenario.niveauMin} → {scenario.niveauMax}
                  </span>
                  <span className='text-sm font-semibold text-orange-600'>
                    Pratiquer →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton ajouter une nouvelle langue */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => navigate("/quiz")}
            className='text-sm text-warm-400 hover:text-orange-500 transition-colors'
          >
            + Pratiquer une autre langue
          </button>
        </div>
      </div>
    </div>
  );
}
