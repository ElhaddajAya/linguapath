// Profile.jsx — affiche les infos utilisateur et ses langues

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Badge couleur par niveau CECRL
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

      <div className='max-w-xl mx-auto px-6 py-10'>
        {/* Header */}
        <h1 className='text-2xl font-semibold text-warm-900 mb-6'>
          Mon profil
        </h1>

        {/* Card principale */}
        <div className='bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden'>
          {/* Avatar + infos */}
          <div className='p-6 flex items-center gap-4 border-b border-warm-200'>
            <div
              className='w-14 h-14 rounded-full flex items-center justify-center
                            text-white text-xl font-bold shrink-0'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              {user.nom?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h2 className='font-semibold text-warm-900'>{user.nom}</h2>
              <p className='text-sm text-warm-500'>{user.email}</p>
              <span
                className='inline-block mt-1 text-xs px-2 py-0.5 rounded-full
                               bg-warm-100 text-warm-500 capitalize'
              >
                {user.role || "user"}
              </span>
            </div>
          </div>

          {/* Langues */}
          <div className='p-6'>
            <p className='text-xs font-semibold text-warm-400 uppercase tracking-widest mb-4'>
              Langues en apprentissage
            </p>

            {user.langues?.length > 0 ? (
              <div className='flex flex-col gap-3'>
                {user.langues.map((l) => (
                  <div
                    key={l.langue}
                    className='flex items-center justify-between px-4 py-3
                               rounded-xl border border-warm-200 bg-warm-50'
                  >
                    <span className='font-medium text-warm-900'>
                      {l.langue}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1
                                     rounded-full ${niveauStyle[l.niveau]}`}
                    >
                      {l.niveau}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-warm-400 text-sm mb-4'>
                  Aucune langue en apprentissage pour l'instant.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                             hover:opacity-90 transition-opacity'
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                  }}
                >
                  Choisir une langue
                </button>
              </div>
            )}
          </div>

          {/* Footer card */}
          <div
            className='px-6 py-4 border-t border-warm-200
                          flex justify-between items-center bg-warm-50'
          >
            <button
              onClick={() => navigate("/")}
              className='text-sm text-warm-400 hover:text-warm-600 transition-colors'
            >
              ← Retour
            </button>
            <button
              disabled
              className='px-4 py-2 rounded-xl text-sm font-medium
                         text-warm-400 bg-warm-100 cursor-not-allowed'
            >
              Modifier (bientôt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
