import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

router.use(authMiddleware)

// ── RÉSUMÉ SUR UNE PÉRIODE ────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { from, to } = req.query

  // Construire le filtre de date si fourni
  const dateFilter = from && to ? {
    date: {
      gte: new Date(from as string),
      lte: new Date(to as string)
    }
  } : {}

  // Récupérer toutes les transactions de la période
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user!.id,
      ...dateFilter
    },
    include: { category: true },
    orderBy: { date: 'desc' }
  })

  // Calculer les totaux
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Regrouper par catégorie
  const byCategory = transactions.reduce((acc, t) => {
    const name = t.category.name
    if (!acc[name]) acc[name] = { total: 0, type: t.type }
    acc[name].total += t.amount
    return acc
  }, {} as Record<string, { total: number; type: string }>)

  res.json({
    period: { from: from || 'début', to: to || 'maintenant' },
    totalIncome,
    totalExpense,
    balance,
    byCategory,
    transactions
  })
})

export { router as summaryRouter }