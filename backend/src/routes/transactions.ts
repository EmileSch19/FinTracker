import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Toutes les routes sont protégées — il faut être connecté
router.use(authMiddleware)

// ── LISTE DES TRANSACTIONS ────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user!.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  })

  res.json(transactions)
})

// ── CRÉER UNE TRANSACTION ─────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { date, label, amount, type, categoryId, note } = req.body

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      label,
      amount,
      type,
      categoryId,
      note,
      userId: req.user!.id
    },
    include: { category: true }
  })

  res.status(201).json(transaction)
})

// ── MODIFIER UNE TRANSACTION ──────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { date, label, amount, type, categoryId, note } = req.body

  // Vérifier que la transaction appartient bien à cet utilisateur
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existing) {
    return res.status(404).json({ error: 'Transaction introuvable' })
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      date: new Date(date),
      label,
      amount,
      type,
      categoryId,
      note
    },
    include: { category: true }
  })

  res.json(transaction)
})

// ── SUPPRIMER UNE TRANSACTION ─────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string

  // Vérifier que la transaction appartient bien à cet utilisateur
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existing) {
    return res.status(404).json({ error: 'Transaction introuvable' })
  }

  await prisma.transaction.delete({
    where: { id }
  })

  res.json({ message: 'Transaction supprimée' })
})

export { router as transactionRouter }