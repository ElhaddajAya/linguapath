import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function Profile() {
  const navigate = useNavigate();

  // On récupère l'utilisateur du localStorage
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Liste des langues disponibles dans l'app
  const toutesLesLangues = [
    "Français",
    "Anglais",
    "Espagnol",
    "Allemand",
    "Arabe",
    "Coréen",
    "Japonais",
    "Chinois",
  ];

  return (
    <div className='min-h-screen bg-base-200'>
      <Navbar />

      <div className='max-w-2xl mx-auto px-4 py-10'>
        {/* Titre de la page */}
        <h1 className='text-2xl font-bold mb-6'>Mon Profil</h1>

        {/* Carte principale du profil */}
        <div className='card bg-base-100 shadow-md'>
          <div className='card-body gap-6'>
            {/* Avatar + nom + email */}
            <div className='flex items-center gap-4'>
              {/* Grand avatar avec initiale */}
              <div className='avatar placeholder'>
                <div className='bg-primary text-primary-content rounded-full w-16'>
                  <span className='text-2xl font-bold'>
                    {user.nom?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>

              <div>
                <h2 className='text-xl font-bold'>{user.nom}</h2>
                <p className='text-base-content/60 text-sm'>{user.email}</p>
                {/* Badge du rôle — "user" ou "admin" */}
                <span className='badge badge-ghost badge-sm mt-1 capitalize'>
                  {user.role || "user"}
                </span>
              </div>
            </div>

            {/* Divider — séparateur DaisyUI */}
            <div className='divider my-0'></div>

            {/* Niveau */}
            <div>
              <p className='text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-2'>
                Niveau actuel
              </p>
              {/* On affiche tous les niveaux, le niveau actuel est mis en valeur */}
              <div className='flex gap-2 flex-wrap'>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((n) => (
                  <span
                    key={n}
                    className={`badge badge-lg font-semibold ${
                      n === user.niveau
                        ? "badge-primary" // niveau actuel → jaune
                        : "badge-ghost" // autres niveaux → gris
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className='divider my-0'></div>

            {/* Langues cibles */}
            <div>
              <p className='text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-2'>
                Langues en apprentissage
              </p>
              <div className='flex gap-2 flex-wrap'>
                {user.languesCibles?.length > 0 ? (
                  user.languesCibles.map((l) => (
                    <span
                      key={l}
                      className='badge badge-primary badge-outline'
                    >
                      {l}
                    </span>
                  ))
                ) : (
                  <span className='text-base-content/40 text-sm'>
                    Aucune langue sélectionnée
                  </span>
                )}
              </div>
            </div>

            <div className='divider my-0'></div>

            {/* Actions */}
            <div className='card-actions justify-between items-center'>
              <button
                onClick={() => navigate("/")}
                className='btn btn-ghost btn-sm'
              >
                ← Retour
              </button>
              {/* Le bouton modifier sera fonctionnel au Sprint 2 */}
              <button
                className='btn btn-primary btn-sm'
                disabled
              >
                Modifier le profil (bientôt)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
