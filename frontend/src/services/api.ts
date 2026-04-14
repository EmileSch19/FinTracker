import axios from 'axios'

const api = axios.create({
  baseURL: 'https://fin-tracker-back-5e5ck4zg3-emile-dufoulons-projects.vercel.app'
})

// Ajoute automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api