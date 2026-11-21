import { useState } from 'react'

export type Theme = 'light' | 'dark'

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

// Thème clair / sombre : appliqué sur <html data-theme> et mémorisé
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* navigation privée */ }
    setTheme(next)
  }

  return { theme, toggle }
}

// Couleurs des catégories (graphique en anneau), adaptées au thème
export const CATEGORY_COLORS: Record<Theme, string[]> = {
  light: ['#047857', '#34d399', '#6ee7b7', '#064e3b', '#10b981', '#a7f3d0', '#0f766e', '#99f6e4'],
  dark: ['#5eead4', '#2dd4bf', '#14b8a6', '#99f6e4', '#0d9488', '#ccfbf1', '#2a9d8f', '#81e6d9'],
}

export const eur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

// Date locale au format AAAA-MM-JJ (toISOString décale d'un jour selon le fuseau)
export function localDate(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
