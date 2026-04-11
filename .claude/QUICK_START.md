# Quick Start — Momento
~200 tokens

## Développement
```bash
cd C:/Users/moume/Documents/momento
npm run dev                    # Lance sur localhost:3001
```

## Build & vérification
```bash
npx next build                 # Vérifier avant commit (TypeScript + lint)
npm run build                  # Build complet (prisma db push + next build)
npm run lint                   # ESLint
```

## Base de données
```bash
npx prisma studio              # GUI Prisma (localhost:5555)
npx prisma generate            # Regénérer le client après modif schema
DATABASE_URL=$DIRECT_URL npx prisma db push  # Migrer le schema (utiliser DIRECT_URL !)
npx prisma db seed             # Seeder les vendors
```

## Git (avec confirmation obligatoire)
```bash
git status                     # Voir les modifications
git add <fichiers>             # Jamais git add -A sans review
git commit -m "fix(scope): description"
# git push → JAMAIS sans confirmation du maître
```

## Deploy Vercel
```bash
vercel deploy --prod           # Deploy production (JAMAIS sans confirmation)
vercel logs                    # Voir les logs de déploiement
vercel env pull .env.local     # Récupérer les env vars depuis Vercel
```

## Env vars importantes
- `DATABASE_URL` : Neon pooled (port 6543) — runtime seulement
- `DIRECT_URL` : Neon direct (port 5432) — migrations uniquement
- `JWT_SECRET` : Secret JWT pour auth custom
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` : OAuth Google
- `RESEND_API_KEY` : Emails transactionnels
- `LAUNCH_PUBLIC=true` : Ouvre le site au public (Vercel)
