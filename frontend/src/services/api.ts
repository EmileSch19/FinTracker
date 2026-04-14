import axios from 'axios'

const api = axios.create({
  baseURL:'https://fintracker-back.vercel.app',
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

export default api