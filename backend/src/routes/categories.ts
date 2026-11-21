import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany()
  res.json(categories)
})

export { router as categoryRouter }