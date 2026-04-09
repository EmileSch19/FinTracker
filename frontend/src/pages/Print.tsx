import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import api from '../services/api'
import TransactionsPDF from '../components/TransactionsPDF'
import { useNavigate } from 'react-router-dom'

export default function Print() {
  const navigate = useNavigate()
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await api.get(`/summary?from=${from}&to=${to}`)
    setSummary(res.data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline">
            Dashboard
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-semibold text-gray-900">Impression</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Générer un résumé PDF
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mb-4"
          >
            {loading ? 'Chargement...' : 'Générer le PDF'}
          </button>

          {summary && (
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
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-center"
            >
              Télécharger le PDF
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  )
}