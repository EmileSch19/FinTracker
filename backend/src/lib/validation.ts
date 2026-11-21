import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

// ── Schémas de validation des requêtes ────────────────────
const email = z.string().trim().toLowerCase().pipe(z.email('Email invalide'))

// Inscription : mot de passe d'au moins 8 caractères
export const registerSchema = z.object({
  email,
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères').max(128),
})

// Connexion : pas de longueur minimale, pour ne pas bloquer les comptes existants
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis').max(128),
})

export const transactionSchema = z.object({
  date: z.coerce.date({ message: 'Date invalide' }),
  label: z.string().trim().min(1, 'Libellé requis').max(120),
  amount: z.coerce.number({ message: 'Montant invalide' }).positive('Le montant doit être positif').max(1_000_000),
  type: z.enum(['income', 'expense'], { message: 'Type invalide' }),
  categoryId: z.string().min(1, 'Catégorie requise'),
  note: z.string().trim().max(500).optional().nullable(),
})

export const periodSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

// Valide req.body (ou req.query) et renvoie une 400 lisible en cas d'erreur
export function validate(schema: z.ZodType, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0]?.message ?? 'Données invalides' })
    }
    res.locals.data = result.data
    next()
  }
}
