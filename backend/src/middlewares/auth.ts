import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string }
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}