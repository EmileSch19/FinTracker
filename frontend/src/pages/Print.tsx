import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import api, { errorMessage } from '../services/api'
import type { Summary } from '../types/index'
import TransactionsPDF from '../components/TransactionsPDF'
import AppShell from '../components/AppShell'
import { eur, localDate } from '../lib/theme'

export default function Print() {
  const [from, setFrom] = useState(localDate(new Date(new Date().getFullYear(), 0, 1)))
  const [to, setTo] = useState(localDate())
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/summary', { params: { from, to } })
      setSummary(res.data)
    } catch (err) {
      setError(errorMessage(err, 'Impossible de générer le résumé'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Rapports PDF">
      <section className="max-w-xl rounded-[20px] border border-line bg-surface p-7">
        <h2 className="mb-1 text-base font-bold">Générer un résumé PDF</h2>
        <p className="mb-6 text-sm text-muted">Revenus, dépenses, solde et liste des transactions sur la période choisie.</p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="from" className="label">Date de début</label>
            <input id="from" type="date" value={from} onChange={e => { setFrom(e.target.value); setSummary(null) }} className="field" />
          </div>
          <div>
            <label htmlFor="to" className="label">Date de fin</label>
            <input id="to" type="date" value={to} onChange={e => { setTo(e.target.value); setSummary(null) }} className="field" />
          </div>
        </div>

        {error && <p role="alert" className="mb-4 text-sm text-neg">{error}</p>}

        {!summary ? (
          <button type="button" onClick={handleGenerate} disabled={loading}
            className="min-h-11 w-full rounded-xl bg-accent text-sm font-extrabold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60">
            {loading ? 'Préparation…' : 'Préparer le résumé'}
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-3 gap-3 rounded-2xl bg-accent-soft p-4 text-center">
              <div><dt className="text-xs text-muted">Revenus</dt><dd className="font-extrabold text-pos">{eur(summary.totalIncome)}</dd></div>
              <div><dt className="text-xs text-muted">Dépenses</dt><dd className="font-extrabold text-neg">{eur(summary.totalExpense)}</dd></div>
              <div><dt className="text-xs text-muted">Solde</dt><dd className="font-extrabold">{eur(summary.balance)}</dd></div>
            </dl>
            <PDFDownloadLink
              document={
                <TransactionsPDF
                  from={from}
                  to={to}
                  totalIncome={summary.totalIncome}
                  totalExpense={summary.totalExpense}
                  balance={summary.balance}
                  transactions={summary.transactions}
                />
              }
              fileName={`fintracker-${from}-${to}.pdf`}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-accent text-sm font-extrabold text-on-accent transition-opacity hover:opacity-90"
            >
              Télécharger le PDF
            </PDFDownloadLink>
          </div>
        )}
      </section>
    </AppShell>
  )
}
