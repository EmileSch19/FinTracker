import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { transactionSchema, validate } from '../lib/validation'

const router = Router()

// Toutes les routes sont protégées — il faut être connecté
router.use(authMiddleware)

// Vérifie que la catégorie existe et correspond au type (revenu / dépense)
async function checkCategory(categoryId: string, type: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  return !!category && category.type === type
}

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
router.post('/', validate(transactionSchema), async (req: Request, res: Response) => {
  const { date, label, amount, type, categoryId, note } = res.locals.data

  if (!(await checkCategory(categoryId, type))) {
    return res.status(400).json({ error: 'Catégorie invalide pour ce type' })
  }

  const transaction = await prisma.transaction.create({
    data: { date, label, amount, type, categoryId, note: note || null, userId: req.user!.id },
    include: { category: true }
  })

  res.status(201).json(transaction)
})

// ── MODIFIER UNE TRANSACTION ──────────────────────────────
router.put('/:id', validate(transactionSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { date, label, amount, type, categoryId, note } = res.locals.data

  // Vérifier que la transaction appartient bien à cet utilisateur
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existing) {
    return res.status(404).json({ error: 'Transaction introuvable' })
  }

  if (!(await checkCategory(categoryId, type))) {
    return res.status(400).json({ error: 'Catégorie invalide pour ce type' })
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: { date, label, amount, type, categoryId, note: note || null },
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
