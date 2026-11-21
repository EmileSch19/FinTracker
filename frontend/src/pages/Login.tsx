import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import api, { errorMessage } from '../services/api'
import { LOCAL_DEMO_FLAG, resetLocalDemo } from '../services/mockApi'

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

  // Connexion en un clic au compte de démonstration.
  // Si l'API est injoignable ou en panne, on bascule sur la démo hors ligne.
  async function handleDemo() {
    setError('')
    setLoading('demo')
    try {
      const res = await api.post('/auth/demo', null, { timeout: 15000 })
      onSuccess(res.data)
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === undefined || status >= 404) {
        localStorage.setItem(LOCAL_DEMO_FLAG, '1')
        resetLocalDemo()
        onSuccess({ token: 'demo-local', user: { id: 'demo', email: 'demo@fintracker.app' } })
        return
      }
      setError(errorMessage(err, 'Démo indisponible pour le moment'))
      setLoading(null)
    }
  }

  const inputClass = 'field'

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-surface rounded-[24px] border border-line p-8 w-full max-w-md">

        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-on-accent" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8" /><path d="M14 7h7v7" /></svg>
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">FinTracker</h1>
          <p className="text-muted mt-1">
            {isRegister ? 'Créer un compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {/* Démo */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading !== null}
          className="w-full min-h-12 rounded-xl border-2 border-accent font-extrabold text-accent-text transition-colors hover:bg-accent-soft disabled:opacity-60"
        >
          {loading === 'demo' ? 'Préparation de la démo…' : 'Essayer la démo — sans inscription'}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />ou<span className="h-px flex-1 bg-line" />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">
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
            <label htmlFor="password" className="label">
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
              <p id="password-hint" className="mt-1 text-xs text-muted">8 caractères minimum.</p>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <p role="alert" className="text-neg text-sm">{error}</p>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full min-h-12 rounded-xl bg-accent font-extrabold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading === 'form' ? 'Connexion…' : isRegister ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        {/* Switcher inscription / connexion */}
        <p className="text-center text-sm text-muted mt-6">
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-accent-text hover:underline font-bold"
          >
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  )
}
