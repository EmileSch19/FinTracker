import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/token'
import { loginSchema, registerSchema, validate } from '../lib/validation'
import { resetDemoAccount } from '../lib/demo'

const router = Router()

// Limite les tentatives : 20 requêtes / 15 min par adresse IP
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Trop de tentatives, réessaie dans quelques minutes.' },
  }),
)

// ── INSCRIPTION ──────────────────────────────────────────
router.post('/register', validate(registerSchema), async (_req: Request, res: Response) => {
  const { email, password } = res.locals.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ error: 'Email déjà utilisé' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  })

  res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email } })
})

// ── CONNEXION ─────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (_req: Request, res: Response) => {
  const { email, password } = res.locals.data

  const user = await prisma.user.findUnique({ where: { email } })
  // Même message dans les deux cas pour ne pas révéler les emails existants
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
  }

  res.json({ token: signToken(user), user: { id: user.id, email: user.email } })
})

// ── DÉMO ─────────────────────────────────────────────────
// Connexion en un clic sur un compte rempli de données d'exemple (remis à zéro à chaque fois)
router.post('/demo', async (_req: Request, res: Response) => {
  const user = await resetDemoAccount()
  res.json({ token: signToken(user), user: { id: user.id, email: user.email }, demo: true })
})

export { router as authRouter }
