import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { transactionRouter } from './routes/transactions'
import { summaryRouter } from './routes/summary'
import { categoryRouter } from './routes/categories'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(cors({
  origin: true,
  credentials: true
}))

app.get('/test', (_req, res) => {
  res.send('API FinTracker OK')
})

app.use('/auth', authRouter)
app.use('/transactions', transactionRouter)
app.use('/summary', summaryRouter)
app.use('/categories', categoryRouter)

app.listen(PORT, () => {
  console.log(`Serveur FinTracker démarré sur le port ${PORT}`)
})