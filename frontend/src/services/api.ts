import axios from 'axios'
import { mockAdapter, LOCAL_DEMO_FLAG } from './mockApi'

export const isLocalDemo = () => localStorage.getItem(LOCAL_DEMO_FLAG) === '1'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ajoute automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  // Démo hors ligne : les requêtes sont servies par le navigateur
  if (isLocalDemo()) config.adapter = mockAdapter
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token expiré ou invalide : on déconnecte et on renvoie vers la connexion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth')
    if (error.response?.status === 401 && !isAuthRoute) {
      logout()
      window.location.href = '/login?expire=1'
    }
    return Promise.reject(error)
  },
)

// Message d'erreur lisible à partir d'une erreur axios
export function errorMessage(err: unknown, fallback = 'Une erreur est survenue') {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Serveur injoignable. Vérifie ta connexion et réessaie.'
    return err.response.data?.error ?? fallback
  }
  return fallback
}

export default api

// Déconnexion (y compris de la démo hors ligne)
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem(LOCAL_DEMO_FLAG)
}
