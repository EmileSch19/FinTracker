import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import type { Category, Transaction } from '../types/index'

/**
 * Démo hors ligne : imite l'API dans le navigateur (données dans localStorage).
 * Activée quand l'API est injoignable au clic sur « Essayer la démo »,
 * pour que le projet reste démontrable même si le serveur est en veille ou en panne.
 */

const STORE_KEY = 'fintracker-demo-data'
export const LOCAL_DEMO_FLAG = 'fintracker-demo-local'
const DEMO_USER = { id: 'demo', email: 'demo@fintracker.app' }

const CATEGORIES: Category[] = [
  ['Salaire', 'income'], ['Freelance', 'income'], ['Autres revenus', 'income'],
  ['Courses', 'expense'], ['Logement', 'expense'], ['Transport', 'expense'],
  ['Loisirs', 'expense'], ['Santé', 'expense'], ['Abonnements', 'expense'], ['Autres dépenses', 'expense'],
].map(([name, type], i) => ({ id: `cat-${i + 1}`, name, type }))

// Montants fictifs de démonstration
const SAMPLE: [string, number, string, number][] = [
  ['Salaire alternance', 1150, 'Salaire', 1],
  ['Loyer', 520, 'Logement', 3],
  ['Courses de la semaine', 64.3, 'Courses', 6],
  ['Abonnement transports', 25, 'Transport', 8],
  ['Streaming musical', 10.99, 'Abonnements', 10],
  ['Courses', 48.7, 'Courses', 14],
  ['Cinéma', 12.5, 'Loisirs', 17],
  ['Site vitrine (freelance)', 300, 'Freelance', 20],
  ['Pharmacie', 18.2, 'Santé', 23],
]

function seed(): Transaction[] {
  const now = new Date()
  const list: Transaction[] = []
  for (const monthsAgo of [0, 1, 2]) {
    for (const [label, amount, catName, day] of SAMPLE) {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12)
      if (date > now) continue
      const category = CATEGORIES.find((c) => c.name === catName)!
      list.push({
        id: crypto.randomUUID(),
        date: date.toISOString(),
        label,
        amount,
        type: category.type as Transaction['type'],
        categoryId: category.id,
        category,
        createdAt: date.toISOString(),
      })
    }
  }
  return list
}

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* données corrompues : on repart de zéro */ }
  const data = seed()
  save(data)
  return data
}

function save(list: Transaction[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list))
}

export function resetLocalDemo() {
  save(seed())
}

const sortDesc = (list: Transaction[]) => [...list].sort((a, b) => b.date.localeCompare(a.date))

function summary(from?: string, to?: string) {
  const start = from ? new Date(from).getTime() : -Infinity
  const end = to ? new Date(to).getTime() + 86_399_999 : Infinity
  const transactions = sortDesc(load()).filter((t) => {
    const d = new Date(t.date).getTime()
    return d >= start && d <= end
  })
  const sum = (type: string) => transactions.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
  const byCategory: Record<string, { total: number; type: string }> = {}
  for (const t of transactions) {
    byCategory[t.category.name] ??= { total: 0, type: t.type }
    byCategory[t.category.name].total += t.amount
  }
  const totalIncome = sum('income')
  const totalExpense = sum('expense')
  return {
    period: { from: from ?? 'début', to: to ?? 'maintenant' },
    totalIncome, totalExpense, balance: totalIncome - totalExpense, byCategory, transactions,
  }
}

function toTransaction(body: Record<string, unknown>, id: string = crypto.randomUUID()): Transaction | null {
  const category = CATEGORIES.find((c) => c.id === body.categoryId)
  const amount = Number(body.amount)
  if (!category || category.type !== body.type || !body.label || !(amount > 0)) return null
  const date = new Date(String(body.date) + 'T12:00:00').toISOString()
  return {
    id, date, amount, category, categoryId: category.id,
    label: String(body.label), type: body.type as Transaction['type'],
    note: body.note ? String(body.note) : undefined, createdAt: new Date().toISOString(),
  }
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await new Promise((r) => setTimeout(r, 150)) // petite latence réaliste
  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data ?? {})
  const respond = (status: number, data: unknown) => {
    const response = { data, status, statusText: String(status), headers: {}, config }
    if (status >= 400) {
      return Promise.reject(Object.assign(new Error(String(status)), { isAxiosError: true, response, config }))
    }
    return Promise.resolve(response)
  }

  if (url.startsWith('/auth')) return respond(200, { token: 'demo-local', user: DEMO_USER, demo: true })
  if (url === '/categories') return respond(200, CATEGORIES)
  if (url === '/summary') return respond(200, summary(config.params?.from, config.params?.to))

  if (url === '/transactions' && method === 'get') return respond(200, sortDesc(load()))
  if (url === '/transactions' && method === 'post') {
    const t = toTransaction(body)
    if (!t) return respond(400, { error: 'Données invalides' })
    save([t, ...load()])
    return respond(201, t)
  }

  const match = url.match(/^\/transactions\/(.+)$/)
  if (match) {
    const list = load()
    const index = list.findIndex((t) => t.id === match[1])
    if (index === -1) return respond(404, { error: 'Transaction introuvable' })
    if (method === 'delete') {
      list.splice(index, 1)
      save(list)
      return respond(200, { message: 'Transaction supprimée' })
    }
    if (method === 'put') {
      const t = toTransaction(body, match[1])
      if (!t) return respond(400, { error: 'Données invalides' })
      list[index] = t
      save(list)
      return respond(200, t)
    }
  }

  return respond(404, { error: 'Route introuvable' })
}
