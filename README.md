# FinTracker

Application de gestion des finances personnelles — **web, API et mobile** qui partagent les mêmes données.

👉 **Démo :** [fin-tracker-ten-umber.vercel.app](https://fin-tracker-ten-umber.vercel.app/login) — bouton « Essayer la démo », sans inscription.
*(L'API est hébergée sur une offre gratuite : le premier chargement peut prendre jusqu'à une minute.)*

## Fonctionnalités

- Inscription / connexion (JWT, mots de passe hachés avec bcrypt)
- Transactions par catégorie : ajout, modification, suppression
- Tableau de bord : revenus, dépenses, solde, répartition par catégorie
- Export PDF d'une période
- Application mobile Expo connectée à la même API
- Compte de démonstration rempli de données d'exemple

## Architecture

```
Web (React + Vite + Tailwind)  ─┐
                                 ├─ HTTPS + JWT ─▶  API REST (Express + TypeScript)  ─ Prisma ─▶  PostgreSQL
Mobile (React Native + Expo)  ──┘                    /auth  /transactions  /categories  /summary
```

| Dossier | Stack |
|---|---|
| `backend/` | Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, Zod, JWT, express-rate-limit |
| `frontend/` | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios, @react-pdf/renderer |
| `mobile/` | React Native, Expo Router, AsyncStorage |

## Lancer en local

### API

```bash
cd backend
npm install
# .env : DATABASE_URL, JWT_SECRET (obligatoires), PORT, CORS_ORIGINS (facultatifs)
npx prisma migrate deploy
npx prisma db seed        # catégories par défaut + compte de démo
npm run dev               # http://localhost:3000
```

### Web

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Sécurité

- Validation de toutes les entrées (Zod) et messages d'erreur en français
- Limite de 20 tentatives / 15 min sur l'authentification
- CORS restreint au front (local, Vercel) ; origines supplémentaires via `CORS_ORIGINS`
- Chaque transaction est vérifiée comme appartenant à l'utilisateur connecté
