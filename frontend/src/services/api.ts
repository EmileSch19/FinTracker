import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ajoute automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
