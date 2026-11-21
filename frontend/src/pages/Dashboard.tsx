import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import type { Transaction } from '../types/index'
import AppShell from '../components/AppShell'
import ServerWaking from '../components/ServerWaking'
import { CATEGORY_COLORS, eur, useTheme } from '../lib/theme'

// Les 3 derniers mois (le mois en cours en dernier)
function lastMonths(count = 3) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
      long: d.toLocaleDateString('fr-FR', { month: 'long' }),
      short: d.toLocaleDateString('fr-FR', { month: 'short' }),
    }
  })
}

const inMonth = (t: Transaction, year: number, month: number) => {
  const d = new Date(t.date)
  return d.getFullYear() === year && d.getMonth() === month
}

const total = (list: Transaction[], type: Transaction['type']) =>
  list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)

export default function Dashboard() {
  const { theme } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [error, setError] = useState('')
  const months = useMemo(() => lastMonths(3), [])
  const [selected, setSelected] = useState(months[months.length - 1].key)

  useEffect(() => {
    api.get('/transactions')
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(errorMessage(err, 'Impossible de charger le tableau de bord')))
  }, [])

  const stats = useMemo(() => {
    if (!transactions) return null
    const month = months.find((m) => m.key === selected)!
    const list = transactions.filter((t) => inMonth(t, month.year, month.month))
    const income = total(list, 'income')
    const expense = total(list, 'expense')

    // Dépenses par catégorie, de la plus grosse à la plus petite
    const byCat = new Map<string, number>()
    for (const t of list.filter((t) => t.type === 'expense')) {
      byCat.set(t.category.name, (byCat.get(t.category.name) ?? 0) + t.amount)
    }
    const colors = CATEGORY_COLORS[theme]
    const categories = [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], i) => ({ name, amount, color: colors[i % colors.length] }))

    // Anneau : dégradé conique proportionnel aux montants
    let angle = 0
    const donut = categories.length
      ? `conic-gradient(${categories
          .map((c) => {
            const start = angle
            angle += (c.amount / expense) * 360
            return `${c.color} ${start}deg ${angle}deg`
          })
          .join(', ')})`
      : 'var(--line)'

    // Barres revenus / dépenses des 3 mois
    const bars = months.map((m) => {
      const l = transactions.filter((t) => inMonth(t, m.year, m.month))
      return { ...m, income: total(l, 'income'), expense: total(l, 'expense') }
    })
    const max = Math.max(1, ...bars.flatMap((b) => [b.income, b.expense]))

    return {
      month, income, expense, balance: income - expense,
      saving: income > 0 ? Math.round(((income - expense) / income) * 100) : null,
      categories, donut, bars, max,
      recent: list.slice(0, 5),
    }
  }, [transactions, selected, months, theme])

  const actions = (
    <>
      <div className="flex gap-1 rounded-xl border border-line bg-surface p-1 text-[13px] font-semibold" role="group" aria-label="Choisir le mois">
        {months.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={m.key === selected}
            onClick={() => setSelected(m.key)}
            className={`min-h-9 rounded-lg px-3 capitalize transition-colors ${m.key === selected ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
          >
            {m.long}
          </button>
        ))}
      </div>
      <Link to="/transactions?new=1" className="flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-extrabold text-on-accent transition-opacity hover:opacity-90">
        + Nouvelle transaction
      </Link>
    </>
  )

  return (
    <AppShell title="Vue d'ensemble" actions={actions}>
      {!stats && !error && <ServerWaking label="Chargement du tableau de bord…" />}
      {error && <p role="alert" className="rounded-2xl border border-line bg-danger-soft p-4 text-sm text-neg">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Solde */}
          <section className="flex flex-col gap-6 rounded-[20px] bg-hero p-7 text-on-hero lg:col-span-7">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm opacity-85">Solde de {stats.month.long}</span>
              <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">{eur(stats.balance)}</span>
              {stats.saving !== null && (
                <span className="mt-1 self-start rounded-full bg-hero-chip px-3 py-1 text-[13px] font-bold">
                  Taux d'épargne {stats.saving} %
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-hero-chip p-4">
                <span className="block text-[13px] opacity-85">Revenus</span>
                <span className="text-lg font-extrabold sm:text-[22px]">+{eur(stats.income)}</span>
              </div>
              <div className="rounded-2xl bg-hero-chip p-4">
                <span className="block text-[13px] opacity-85">Dépenses</span>
                <span className="text-lg font-extrabold sm:text-[22px]">−{eur(stats.expense)}</span>
              </div>
            </div>
          </section>

          {/* Barres 3 mois */}
          <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-6 lg:col-span-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold">3 derniers mois</h2>
              <span className="flex gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-accent" />Revenus</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-accent-light" />Dépenses</span>
              </span>
            </div>
            <div className="grid min-h-44 flex-1 grid-cols-3 items-end gap-5" role="img"
              aria-label={stats.bars.map((b) => `${b.long} : revenus ${eur(b.income)}, dépenses ${eur(b.expense)}`).join(' ; ')}>
              {stats.bars.map((b) => (
                <div key={b.key} className="flex h-full flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center gap-1.5">
                    <span className="w-7 rounded-t-lg rounded-b bg-accent" style={{ height: `${(b.income / stats.max) * 100}%` }} />
                    <span className="w-7 rounded-t-lg rounded-b bg-accent-light" style={{ height: `${(b.expense / stats.max) * 100}%` }} />
                  </div>
                  <span className={`text-xs capitalize ${b.key === selected ? 'font-bold text-text' : 'text-muted'}`}>{b.short}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Catégories */}
          <section className="flex flex-col gap-5 rounded-[20px] border border-line bg-surface p-6 lg:col-span-5">
            <h2 className="text-base font-bold">Dépenses par catégorie</h2>
            {stats.categories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Aucune dépense ce mois-ci.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex h-[150px] w-[150px] shrink-0 items-center justify-center rounded-full" style={{ background: stats.donut }} aria-hidden="true">
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-surface">
                    <span className="text-[11px] text-muted">Total</span>
                    <span className="text-sm font-extrabold">{eur(stats.expense)}</span>
                  </div>
                </div>
                <ul className="flex min-w-40 flex-1 flex-col gap-2.5 text-[13px]">
                  {stats.categories.map((c) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                      <span className="flex-1">{c.name}</span>
                      <span className="font-bold">{eur(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Dernières transactions */}
          <section className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-surface p-6 lg:col-span-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-bold">Dernières transactions</h2>
              <Link to="/transactions" className="text-[13px] font-bold text-accent-text hover:underline">Tout voir →</Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Aucune transaction ce mois-ci.{' '}
                <Link to="/transactions?new=1" className="font-bold text-accent-text hover:underline">Ajouter la première</Link>
              </p>
            ) : (
              <ul>
                {stats.recent.map((t) => (
                  <li key={t.id} className="flex items-center gap-3.5 border-t border-line py-3 first:border-t-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-extrabold text-accent-text" aria-hidden="true">
                      {t.label[0]?.toUpperCase()}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">{t.label}</span>
                      <span className="text-xs text-muted">
                        {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {t.category.name}
                      </span>
                    </div>
                    <span className={`text-[15px] font-extrabold ${t.type === 'income' ? 'text-pos' : 'text-neg'}`}>
                      {t.type === 'income' ? '+' : '−'}{eur(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
