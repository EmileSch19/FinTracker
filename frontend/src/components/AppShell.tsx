import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout, isLocalDemo } from '../services/api'
import { useTheme } from '../lib/theme'

const links = [
  {
    to: '/dashboard',
    label: 'Tableau de bord',
    short: 'Accueil',
    icon: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    short: 'Transactions',
    icon: <path d="M7 7h13M7 12h13M7 17h13M3 7h.01M3 12h.01M3 17h.01" />,
  },
  {
    to: '/print',
    label: 'Rapports PDF',
    short: 'PDF',
    icon: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6" /></>,
  },
]

interface Props {
  title: string
  actions?: ReactNode
  children: ReactNode
}

// Mise en page commune : menu latéral (en haut sur mobile) + contenu
export default function AppShell({ title, actions, children }: Props) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-6 border-b border-line bg-side p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r md:p-5">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-on-accent" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8" /><path d="M14 7h7v7" /></svg>
            </span>
            FinTracker
          </NavLink>
          {/* Bouton thème compact sur mobile */}
          <button type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface md:hidden">
            <ThemeIcon dark={theme === 'dark'} />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="grid grid-cols-3 gap-1 md:flex md:flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold transition-colors md:justify-start md:gap-3 md:px-3.5 ${
                  isActive ? 'bg-accent-soft text-accent-text' : 'text-muted hover:bg-accent-soft/60'
                }`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{l.icon}</svg>
              <span className="md:hidden">{l.short}</span>
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 md:block" />

        <button type="button" onClick={toggle}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="hidden min-h-11 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold md:flex">
          <ThemeIcon dark={theme === 'dark'} />
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>

        <div className="hidden flex-col gap-1 rounded-2xl border border-line bg-surface p-4 text-[13px] md:flex">
          <span className="truncate font-bold">{user.email ?? 'Mon compte'}</span>
          {isLocalDemo() && <span className="text-muted">Démo hors ligne</span>}
          <button type="button" onClick={handleLogout} className="self-start text-muted hover:text-text">Se déconnecter</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <button type="button" onClick={handleLogout} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-muted md:hidden">Déconnexion</button>
          </div>
        </div>
        {isLocalDemo() && (
          <p className="mb-6 rounded-2xl border border-line bg-accent-soft p-4 text-sm text-accent-text">
            <strong>Démo hors ligne</strong> — le serveur ne répond pas : les données d’exemple sont stockées dans ton navigateur.
          </p>
        )}
        {children}
      </main>
    </div>
  )
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dark
        ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
        : <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />}
    </svg>
  )
}
