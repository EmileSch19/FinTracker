import { ensureCategories, resetDemoAccount } from './lib/demo'

// npx prisma db seed — catégories par défaut + compte de démonstration
async function main() {
  const categories = await ensureCategories()
  await resetDemoAccount()
  console.log(`Seed terminé : ${categories.length} catégories, compte démo prêt.`)
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
