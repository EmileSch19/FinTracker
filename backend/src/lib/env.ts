import 'dotenv/config'

// Variables obligatoires : on s'arrête tout de suite avec un message clair
for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Variable d'environnement manquante : ${key}`)
    process.exit(1)
  }
}

export const env = {
  JWT_SECRET: process.env.JWT_SECRET as string,
  PORT: Number(process.env.PORT) || 3000,
  // Origines autorisées (séparées par des virgules) en plus des valeurs par défaut
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean),
}
