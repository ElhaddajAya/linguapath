import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) return null

  const niveauColors = {
    A1: 'badge-error', A2: 'badge-warning',
    B1: 'badge-info',  B2: 'badge-primary',
    C1: 'badge-success', C2: 'badge-success',
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center gap-4">

          {/* Avatar */}
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-20">
              <span className="text-3xl font-bold">
                {user.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Nom & Email */}
          <div>
            <h2 className="text-2xl font-bold">{user.nom}</h2>
            <p className="text-base-content/60 text-sm">{user.email}</p>
          </div>

          <div className="divider my-0"></div>

          {/* Niveau */}
          <div className="w-full flex justify-between items-center px-2">
            <span className="text-sm font-medium">Niveau actuel</span>
            <span className={`badge ${niveauColors[user.niveau] || 'badge-ghost'} badge-lg`}>
              {user.niveau}
            </span>
          </div>

          {/* Langues cibles */}
          <div className="w-full px-2">
            <p className="text-sm font-medium mb-2 text-left">Langues à apprendre</p>
            <div className="flex flex-wrap gap-2">
              {user.languesCibles?.length > 0 ? (
                user.languesCibles.map((l) => (
                  <span key={l} className="badge badge-outline badge-primary">
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-sm text-base-content/50">Aucune langue sélectionnée</span>
              )}
            </div>
          </div>

          {/* Rôle */}
          <div className="w-full flex justify-between items-center px-2">
            <span className="text-sm font-medium">Rôle</span>
            <span className="badge badge-ghost">{user.role}</span>
          </div>

          <div className="divider my-0"></div>

          {/* Boutons */}
          <div className="w-full flex flex-col gap-3">
            <button className="btn btn-primary w-full">
              Modifier le profil
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-error w-full"
            >
              Se déconnecter
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}