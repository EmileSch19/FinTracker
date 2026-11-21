import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import type { Category, Transaction } from '../types/index'
import AppShell from '../components/AppShell'
import ServerWaking from '../components/ServerWaking'
import { eur, localDate } from '../lib/theme'

const emptyForm = {
  date: localDate(),
  label: '',
  amount: '',
  type: 'expense' as Transaction['type'],
  categoryId: '',
  note: ''
}

export default function Transactions() {
  const [params] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  // ?new=1 (depuis le tableau de bord) ouvre directement le formulaire
  const [showForm, setShowForm] = useState(params.get('new') === '1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [])

  async function loadTransactions() {
    try {
      const res = await api.get('/transactions')
      setTransactions(res.data)
    } catch (err) {
      setError(errorMessage(err, 'Impossible de charger les transactions'))
    } finally {
      setLoaded(true)
    }
  }

  async function loadCategories() {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (err) {
      setError(errorMessage(err, 'Impossible de charger les catégories'))
    }
  }

  function handleEdit(t: Transaction) {
    // Pré-remplir le formulaire avec les données de la transaction
    setForm({
      date: t.date.split('T')[0],
      label: t.label,
      amount: t.amount.toString(),
      type: t.type,
      categoryId: t.categoryId,
      note: t.note || ''
    })
    setEditingId(t.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.label || !form.amount || !form.categoryId) {
      setError('Renseigne le libellé, le montant et la catégorie.')
      return
    }

    setSaving(true)
    try {
      const body = { ...form, amount: parseFloat(form.amount) }
      if (editingId) {
        // Modification
        await api.put(`/transactions/${editingId}`, body)
      } else {
        // Création
        await api.post('/transactions', body)
      }
      handleCancel()
      loadTransactions()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette transaction ?')) return
    try {
      await api.delete(`/transactions/${id}`)
      loadTransactions()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const filteredCategories = categories.filter(c => c.type === form.type)

  const addButton = (
    <button
      type="button"
      onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
      aria-expanded={showForm}
      className="flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-extrabold text-on-accent transition-opacity hover:opacity-90"
    >
      {showForm && !editingId ? 'Fermer' : '+ Nouvelle transaction'}
    </button>
  )

  return (
    <AppShell title="Transactions" actions={addButton}>
      {/* Formulaire ajout / modification */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-[20px] border border-line bg-surface p-6">
          <h2 className="mb-4 text-base font-bold">
            {editingId ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="tx-type" className="label">Type</label>
              <div id="tx-type" role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl border border-line p-1">
                {(['expense', 'income'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={form.type === type}
                    onClick={() => setForm({ ...form, type, categoryId: '' })}
                    className={`min-h-9 rounded-lg text-sm font-bold transition-colors ${form.type === type ? 'bg-text text-bg' : 'text-muted'}`}
                  >
                    {type === 'expense' ? 'Dépense' : 'Revenu'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="tx-label" className="label">Libellé</label>
              <input id="tx-label" type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Ex : Courses" className="field" />
            </div>
            <div>
              <label htmlFor="tx-amount" className="label">Montant (€)</label>
              <input id="tx-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" className="field" />
            </div>
            <div>
              <label htmlFor="tx-date" className="label">Date</label>
              <input id="tx-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="field" />
            </div>
            <div>
              <label htmlFor="tx-category" className="label">Catégorie</label>
              <select id="tx-category" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="field">
                <option value="">Choisir…</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tx-note" className="label">Note (optionnel)</label>
              <input id="tx-note" type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Commentaire…" className="field" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-accent px-6 text-sm font-extrabold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60">
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Ajouter'}
            </button>
            <button type="button" onClick={handleCancel} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-muted hover:text-text">
              Annuler
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mb-6 rounded-2xl border border-line bg-danger-soft p-4 text-sm text-neg">{error}</p>
      )}

      {/* Liste des transactions */}
      <section className="rounded-[20px] border border-line bg-surface px-2 sm:px-4">
        {!loaded ? (
          <ServerWaking label="Chargement des transactions…" />
        ) : transactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Aucune transaction pour l'instant.</p>
        ) : (
          <ul>
            {transactions.map(t => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 border-t border-line px-2 py-3.5 first:border-t-0 sm:flex-nowrap">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-extrabold text-accent-text" aria-hidden="true">
                  {t.label[0]?.toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{t.label}</span>
                  <span className="truncate text-xs text-muted">
                    {new Date(t.date).toLocaleDateString('fr-FR')} · {t.category.name}{t.note && ` · ${t.note}`}
                  </span>
                </div>
                <span className={`text-[15px] font-extrabold ${t.type === 'income' ? 'text-pos' : 'text-neg'}`}>
                  {t.type === 'income' ? '+' : '−'}{eur(t.amount)}
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => handleEdit(t)} aria-label={`Modifier « ${t.label} »`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-accent-soft hover:text-accent-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)} aria-label={`Supprimer « ${t.label} »`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-danger-soft hover:text-neg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  )
}
