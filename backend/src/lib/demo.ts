import { prisma } from './prisma'

export const DEMO_EMAIL = 'demo@fintracker.app'

// Catégories de base, créées si elles n'existent pas encore
export const DEFAULT_CATEGORIES = [
  { name: 'Salaire', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Autres revenus', type: 'income' },
  { name: 'Courses', type: 'expense' },
  { name: 'Logement', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Loisirs', type: 'expense' },
  { name: 'Santé', type: 'expense' },
  { name: 'Abonnements', type: 'expense' },
  { name: 'Autres dépenses', type: 'expense' },
] as const

export async function ensureCategories() {
  const existing = await prisma.category.findMany()
  const missing = DEFAULT_CATEGORIES.filter(
    (c) => !existing.some((e) => e.name === c.name && e.type === c.type),
  )
  if (missing.length) await prisma.category.createMany({ data: [...missing] })
  return prisma.category.findMany()
}

// Transactions d'exemple sur les 3 derniers mois (montants fictifs de démonstration)
const SAMPLE: { label: string; amount: number; category: string; type: 'income' | 'expense'; day: number }[] = [
  { label: 'Salaire alternance', amount: 1150, category: 'Salaire', type: 'income', day: 1 },
  { label: 'Loyer', amount: 520, category: 'Logement', type: 'expense', day: 3 },
  { label: 'Courses de la semaine', amount: 64.3, category: 'Courses', type: 'expense', day: 6 },
  { label: 'Abonnement transports', amount: 25, category: 'Transport', type: 'expense', day: 8 },
  { label: 'Streaming musical', amount: 10.99, category: 'Abonnements', type: 'expense', day: 10 },
  { label: 'Courses', amount: 48.7, category: 'Courses', type: 'expense', day: 14 },
  { label: 'Cinéma', amount: 12.5, category: 'Loisirs', type: 'expense', day: 17 },
  { label: 'Site vitrine (freelance)', amount: 300, category: 'Freelance', type: 'income', day: 20 },
  { label: 'Pharmacie', amount: 18.2, category: 'Santé', type: 'expense', day: 23 },
]

// Crée (ou remet à zéro) le compte de démonstration
export async function resetDemoAccount() {
  const categories = await ensureCategories()
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    // Mot de passe inutilisable : on n'entre dans ce compte que via /auth/demo
    create: { email: DEMO_EMAIL, password: '!demo-account-no-login' },
  })

  await prisma.transaction.deleteMany({ where: { userId: user.id } })

  const now = new Date()
  const rows = [0, 1, 2].flatMap((monthsAgo) =>
    SAMPLE.map((s) => {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, s.day)
      return { s, date }
    }),
  )
    .filter(({ date }) => date <= now)
    .map(({ s, date }) => ({
      date,
      label: s.label,
      amount: s.amount,
      type: s.type,
      userId: user.id,
      categoryId: categories.find((c) => c.name === s.category && c.type === s.type)!.id,
    }))

  await prisma.transaction.createMany({ data: rows })
  return user
}
