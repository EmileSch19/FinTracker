import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { periodSchema, validate } from '../lib/validation'

const router = Router()

router.use(authMiddleware)

// ── RÉSUMÉ SUR UNE PÉRIODE ────────────────────────────────
router.get('/', validate(periodSchema, 'query'), async (req: Request, res: Response) => {
  try {
    const { from, to } = res.locals.data as { from?: Date; to?: Date }

    // « to » inclut toute la journée de fin
    const end = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : undefined
    const dateFilter =
      from || end
        ? { date: { ...(from && { gte: from }), ...(end && { lte: end }) } }
        : {}

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        ...dateFilter
      },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const byCategory = transactions.reduce<Record<string, { total: number; type: string }>>(
      (acc, t) => {
        const name = t.category?.name ?? 'Sans catégorie'

        if (!acc[name]) {
          acc[name] = {
            total: 0,
            type: t.type
          }
        }

        acc[name].total += t.amount
        return acc
      },
      {}
    )

    res.json({
      period: {
        from: from ?? 'début',
        to: to ?? 'maintenant'
      },
      totalIncome,
      totalExpense,
      balance,
      byCategory,
      transactions
    })
  } catch (error) {
    console.error('Erreur résumé :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export { router as summaryRouter }