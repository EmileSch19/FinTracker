import jwt from 'jsonwebtoken'
import { env } from './env'

export function signToken(user: { id: string; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' })
}
