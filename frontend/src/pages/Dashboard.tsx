import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Summary } from '../types/index'

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/summary').then(res => setSummary(res.data))
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">FinTracker</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Transactions
          </button>
          <span className="text-sm text-gray-500">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {summary && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  +{summary.totalIncome.toFixed(2)} €
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">Dépenses</p>
                <p className="text-2xl font-bold text-red-500">
                  -{summary.totalExpense.toFixed(2)} €
                </p>
              </div>
              <div className={`rounded-xl border p-6 ${summary.balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Solde</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {summary.balance.toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Par catégorie</h2>
              <div className="space-y-3">
                {Object.entries(summary.byCategory).map(([name, data]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{name}</span>
                    <span className={`text-sm font-medium ${data.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {data.type === 'income' ? '+' : '-'}{data.total.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Dernières transactions</h2>
              <div className="space-y-3">
                {summary.transactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.date).toLocaleDateString('fr-FR')} · {t.category.name}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}