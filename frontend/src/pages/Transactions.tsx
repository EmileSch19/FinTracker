import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

type Category = {
  id: string
  name: string
  type: string
}

type Transaction = {
  id: string
  date: string
  label: string
  amount: number
  type: 'income' | 'expense'
  note?: string
  category: Category
  categoryId: string
}

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  label: '',
  amount: '',
  type: 'expense',
  categoryId: '',
  note: ''
}

export default function Transactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [])

  async function loadTransactions() {
    const res = await api.get('/transactions')
    setTransactions(res.data)
  }

  async function loadCategories() {
    const res = await api.get('/categories')
    setCategories(res.data)
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
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    if (!form.label || !form.amount || !form.categoryId) return

    if (editingId) {
      // Modification
      await api.put(`/transactions/${editingId}`, {
        ...form,
        amount: parseFloat(form.amount)
      })
    } else {
      // Création
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount)
      })
    }

    handleCancel()
    loadTransactions()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette transaction ?')) return
    await api.delete(`/transactions/${id}`)
    loadTransactions()
  }

  const filteredCategories = categories.filter(c => c.type === form.type)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline">
            Dashboard
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-semibold text-gray-900">Transactions</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Formulaire ajout / modification */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value, categoryId: '' })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="Ex: Courses Lidl"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choisir...</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="Commentaire..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Modifier' : 'Enregistrer'}
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des transactions */}
        <div className="bg-white rounded-xl border border-gray-100">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Aucune transaction pour l'instant
            </div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center px-6 py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(t.date).toLocaleDateString('fr-FR')} · {t.category.name}
                    {t.note && ` · ${t.note}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}