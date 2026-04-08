import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()

// ── INSCRIPTION ──────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ error: 'Email déjà utilisé' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  })

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.status(201).json({ token, user: { id: user.id, email: user.email } })
})

// ── CONNEXION ─────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user.id, email: user.email } })
})

export { router as authRouter }