// Home.jsx — page d'accueil après connexion

import Navbar from "../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";

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

        {/* Card langues ou invitation à commencer */}
        {user.langues?.length > 0 ? (
          <div className='grid gap-4'>
            {user.langues.map((l) => (
              <div
                key={l.langue}
                className='bg-white rounded-2xl border border-warm-200
                           shadow-soft p-5 flex items-center justify-between
                           hover:shadow-card transition-shadow cursor-pointer'
              >
                <div>
                  <p className='font-semibold text-warm-900'>{l.langue}</p>
                  <p className='text-sm text-warm-500 mt-0.5'>
                    Niveau {l.niveau}
                  </p>
                </div>
                <button
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
          </div>
        ) : (
          // Aucune langue — invitation à commencer
          <div
            className='bg-white rounded-2xl border border-warm-200
                          shadow-card p-10 text-center'
          >
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
