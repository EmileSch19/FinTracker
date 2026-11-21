import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../services/api'

export default function Login() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(params.get('expire') ? 'Ta session a expiré, reconnecte-toi.' : '')
  const [loading, setLoading] = useState<'form' | 'demo' | null>(null)

  function onSuccess(data: { token: string; user: unknown }) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    window.location.href = '/dashboard'
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading('form')
    try {
      const route = isRegister ? '/auth/register' : '/auth/login'
      const res = await api.post(route, { email, password })
      onSuccess(res.data)
    } catch (err) {
      setError(errorMessage(err))
      setLoading(null)
    }
  }

  // Connexion en un clic au compte de démonstration
  async function handleDemo() {
    setError('')
    setLoading('demo')
    try {
      const res = await api.post('/auth/demo')
      onSuccess(res.data)
    } catch (err) {
      setError(errorMessage(err, 'Démo indisponible pour le moment'))
      setLoading(null)
    }
  }

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">FinTracker</h1>
          <p className="text-gray-500 mt-1">
            {isRegister ? 'Créer un compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {/* Démo */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading !== null}
          className="w-full rounded-lg border-2 border-blue-600 py-2.5 font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-60"
        >
          {loading === 'demo' ? 'Préparation de la démo…' : 'Essayer la démo — sans inscription'}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="emile@fintracker.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-describedby={isRegister ? 'password-hint' : undefined}
              className={inputClass}
            />
            {isRegister && (
              <p id="password-hint" className="mt-1 text-xs text-gray-500">8 caractères minimum.</p>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <p role="alert" className="text-red-600 text-sm">{error}</p>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading === 'form' ? 'Connexion…' : isRegister ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        {/* Switcher inscription / connexion */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  )
}
