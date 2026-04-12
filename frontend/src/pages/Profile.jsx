import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Couleurs par niveau — pour différencier visuellement
  const niveauColor = {
    A1: "bg-gray-100 text-gray-600",
    A2: "bg-blue-50 text-blue-600",
    B1: "bg-green-50 text-green-600",
    B2: "bg-yellow-50 text-yellow-600",
    C1: "bg-orange-50 text-orange-600",
    C2: "bg-red-50 text-red-600",
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-2xl mx-auto px-4 py-10'>
        <h1 className='text-2xl font-bold text-surface-900 mb-6'>Mon Profil</h1>

        <div className='bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden'>
          {/* Header — avatar + infos */}
          <div className='p-6 flex items-center gap-4 border-b border-surface-200'>
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center
                            text-white text-2xl font-bold shrink-0'
              style={{
                background:
                  "linear-gradient(to bottom right, #F59E0B, #EA580C)",
              }}
            >
              {user.nom?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h2 className='text-xl font-bold text-surface-900'>{user.nom}</h2>
              <p className='text-surface-500 text-sm'>{user.email}</p>
              <span
                className='inline-block mt-1 text-xs px-2 py-0.5 rounded-full
                               bg-surface-100 text-surface-500 capitalize'
              >
                {user.role || "user"}
              </span>
            </div>
          </div>

          {/* Langues pratiquées */}
          <div className='p-6'>
            <p className='text-xs font-semibold text-surface-500 uppercase tracking-wide mb-4'>
              Langues en apprentissage
            </p>

            {user.langues?.length > 0 ? (
              <div className='flex flex-col gap-3'>
                {user.langues.map((l) => (
                  <div
                    key={l.langue}
                    className='flex items-center justify-between px-4 py-3
                               rounded-xl border border-surface-200 bg-surface-50'
                  >
                    <span className='font-medium text-surface-900'>
                      {l.langue}
                    </span>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${niveauColor[l.niveau]}`}
                    >
                      {l.niveau}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // Aucune langue encore — invitation à commencer
              <div className='text-center py-8'>
                <p className='text-surface-500 text-sm mb-4'>
                  Tu n'as pas encore de langue en apprentissage.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white'
                  style={{
                    background: "linear-gradient(to right, #F59E0B, #EA580C)",
                  }}
                >
                  Choisir une langue
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='px-6 py-4 border-t border-surface-200 flex justify-between items-center'>
            <button
              onClick={() => navigate("/")}
              className='text-sm text-surface-500 hover:text-surface-700 transition-colors'
            >
              ← Retour
            </button>
            <button
              disabled
              className='px-4 py-2 rounded-lg text-sm font-medium
                         bg-surface-100 text-surface-400 cursor-not-allowed'
            >
              Modifier (bientôt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
