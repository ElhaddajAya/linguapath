// On configure axios pour envoyer automatiquement le token JWT
// dans chaque requête — sinon les routes protégées refusent l'accès.

import axios from 'axios'

const api = axios.create({
  // En production → VITE_API_URL pointe vers Render
  // En local → "/api" (proxy Vite)
  baseURL: import.meta.env.VITE_API_URL || "/api",
})

// Intercepteur — s'exécute AVANT chaque requête
// Il récupère le token du localStorage et l'ajoute dans le header Authorization
api.interceptors.request.use((config) =>
{
  const token = localStorage.getItem('token')
  if (token)
  {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export default api