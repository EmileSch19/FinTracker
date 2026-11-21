export type User = {
  id: string
  email: string
}

export type Category = {
  id: string
  name: string
  type: string
}

export type Transaction = {
  id: string
  date: string
  label: string
  amount: number
  type: 'income' | 'expense'
  note?: string
  categoryId: string
  category: Category
  createdAt: string
}

export type Summary = {
  period: { from: string; to: string }
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: Record<string, { total: number; type: string }>
  transactions: Transaction[]
}