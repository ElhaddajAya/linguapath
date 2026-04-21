import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  const niveauStyle = {
    A1: "bg-gray-100 text-gray-500",
    A2: "bg-blue-50 text-blue-500",
    B1: "bg-green-50 text-green-600",
    B2: "bg-yellow-50 text-yellow-600",
    C1: "bg-orange-50 text-orange-600",
    C2: "bg-red-50 text-red-600",
  };

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      {/* Même max-w-7xl que la navbar + padding cohérent */}
      <div className='max-w-7xl mx-auto px-10 py-10'>
        <h1 className='text-2xl font-semibold text-warm-900 mb-8'>
          Mon profil
        </h1>

        {/* Layout 2 colonnes sur lg+, 1 colonne sur mobile */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Colonne gauche — infos utilisateur (1/3) */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-6'>
              {/* Avatar */}
              <div
                className='flex flex-col items-center text-center gap-3 pb-6
                              border-b border-warm-200'
              >
                <div
                  className='w-20 h-20 rounded-full flex items-center justify-center
                                text-white text-2xl font-bold'
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                  }}
                >
                  {user.nom?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className='font-semibold text-warm-900 text-lg'>
                    {user.nom}
                  </h2>
                  <p className='text-sm text-warm-500'>{user.email}</p>
                  <span
                    className='inline-block mt-2 text-xs px-3 py-0.5 rounded-full
                                   bg-warm-100 text-warm-500 capitalize'
                  >
                    {user.role || "user"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='pt-5 flex flex-col gap-3'>
                <button
                  disabled
                  className='w-full py-2.5 rounded-xl text-sm font-medium
                             text-warm-400 bg-warm-100 cursor-not-allowed'
                >
                  Modifier le profil (bientôt)
                </button>
                <button
                  onClick={() => navigate("/")}
                  className='w-full py-2.5 rounded-xl text-sm font-medium
                             text-warm-600 border border-warm-200 hover:bg-warm-100
                             transition-colors'
                >
                  ← Retour à l'accueil
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite — langues (2/3) */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-6'>
              <p
                className='text-xs font-semibold text-warm-400 uppercase
                            tracking-widest mb-5'
              >
                Langues en apprentissage
              </p>

              {user.langues?.length > 0 ? (
                <div className='flex flex-col gap-3'>
                  {user.langues.map((l) => (
                    <div
                      key={l.langue}
                      className='flex items-center justify-between px-5 py-4
                                 rounded-xl border border-warm-200 bg-warm-50
                                 hover:border-orange-200 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        {/* Indicateur coloré */}
                        <div className='w-2 h-2 rounded-full bg-orange-500' />
                        <span className='font-medium text-warm-900'>
                          {l.langue}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5
                                       rounded-full ${niveauStyle[l.niveau]}`}
                      >
                        {l.niveau}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-5xl mb-4'>🌍</p>
                  <p className='text-warm-500 text-sm mb-5'>
                    Aucune langue en apprentissage pour l'instant.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className='px-6 py-2.5 rounded-xl text-sm font-semibold
                               text-white hover:opacity-90 transition-opacity'
                    style={{
                      background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                    }}
                  >
                    Choisir une langue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
