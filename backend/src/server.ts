import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { transactionRouter } from './routes/transactions'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use('/auth', authRouter)
app.use('/transactions', transactionRouter)

app.listen(PORT, () => {
  console.log(`Serveur FinTracker démarré sur le port ${PORT}`)
})