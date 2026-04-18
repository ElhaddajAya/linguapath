// Home.jsx — page d'accueil après connexion
// Affiche les langues en cours + bouton pour en ajouter une nouvelle

import Navbar from "../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";

// Emoji par langue — cohérent avec Quiz.jsx
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

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-10 py-10'>
        {/* Message de bienvenue */}
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-warm-900'>
            Bonjour, {user.nom?.split(" ")[0]} 👋
          </h1>
          <p className='text-warm-500 mt-1 text-sm'>
            Prête à pratiquer aujourd'hui ?
          </p>
        </div>

        {/* Liste des langues en cours */}
        {user.langues?.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {/* Une card par langue */}
            {user.langues.map((l) => (
              <div
                key={l.langue}
                className='bg-white rounded-2xl border border-warm-200
                           shadow-soft p-5 flex items-center justify-between
                           hover:shadow-card transition-shadow'
              >
                <div className='flex items-center gap-4'>
                  {/* Emoji de la langue */}
                  <span className='text-3xl'>
                    {LANGUE_EMOJI[l.langue] || "🌐"}
                  </span>
                  <div>
                    <p className='font-semibold text-warm-900'>{l.langue}</p>
                    <p className='text-sm text-warm-500 mt-0.5'>
                      Niveau {l.niveau}
                    </p>
                  </div>
                </div>

                {/* Bouton Pratiquer — passe la langue en paramètre URL */}
                <button
                  onClick={() => navigate(`/scenarios?langue=${l.langue}`)}
                  className='px-5 py-2 rounded-xl text-sm font-semibold text-white
                             hover:opacity-90 transition-opacity'
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                  }}
                >
                  Pratiquer →
                </button>
              </div>
            ))}

            {/* Bouton pour ajouter une nouvelle langue */}
            <button
              onClick={() => navigate("/quiz")}
              className='w-full py-4 rounded-2xl border-2 border-dashed border-warm-300
                         text-warm-500 text-sm font-medium hover:border-orange-300
                         hover:text-orange-500 transition-colors flex items-center
                         justify-center gap-2'
            >
              <span className='text-lg'>+</span>
              Ajouter une nouvelle langue
            </button>
          </div>
        ) : (
          // Aucune langue — invitation à commencer
          <div className='bg-white rounded-2xl border border-warm-200 shadow-card p-10 text-center'>
            <div className='text-4xl mb-4'>🌍</div>
            <h2 className='text-lg font-semibold text-warm-900 mb-2'>
              Quelle langue veux-tu pratiquer ?
            </h2>
            <p className='text-warm-500 text-sm mb-6'>
              Choisis une langue et on évalue ton niveau en 2 minutes.
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className='px-8 py-3 rounded-xl font-semibold text-white text-sm
                         hover:opacity-90 transition-opacity'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              Commencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
