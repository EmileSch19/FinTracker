import { env } from './lib/env'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { transactionRouter } from './routes/transactions'
import { summaryRouter } from './routes/summary'
import { categoryRouter } from './routes/categories'

const app = express()

// Render place l'API derrière un proxy : nécessaire pour la limite de tentatives
app.set('trust proxy', 1)
app.use(express.json({ limit: '100kb' }))

// CORS : front local, Vercel et Netlify (production + prévisualisations), et origines ajoutées via CORS_ORIGINS
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^https:\/\/fin-tracker[\w-]*\.vercel\.app$/,
  /^https:\/\/([\w-]+--)?fintracker19\.netlify\.app$/,
]
app.use(cors({
  origin: (origin, callback) => {
    // Pas d'origine = appli mobile ou outil (curl) : autorisé
    if (!origin || allowed.some((r) => r.test(origin)) || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    callback(null, false)
  },
}))

app.get('/test', (_req, res) => {
  res.send('API FinTracker OK')
})

app.use('/auth', authRouter)
app.use('/transactions', transactionRouter)
app.use('/summary', summaryRouter)
app.use('/categories', categoryRouter)

// Route inconnue
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route introuvable' })
})

// Erreurs inattendues : réponse JSON sans détail technique
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Erreur serveur' })
})

app.listen(env.PORT, () => {
  console.log(`Serveur FinTracker démarré sur le port ${env.PORT}`)
})
