@AGENTS.md

# Momento — Guide Claude

## Stack
Next.js 16 (App Router), TypeScript, Prisma 7, Neon PostgreSQL (prod), Tailwind v4, shadcn/ui v4, Auth JWT custom (jose), Resend, Vercel

## Session Start — Charger ces 3 fichiers (~600 tokens)
1. `.claude/ARCHITECTURE_MAP.md` — où est quoi
2. `.claude/COMMON_MISTAKES.md` — erreurs critiques à éviter
3. `.claude/QUICK_START.md` — commandes essentielles

Charger en plus selon la tâche :
- Auth/sécurité → `docs/learnings/auth.md`
- UI/composants → `docs/learnings/ui-patterns.md`
- DB/Prisma → `docs/learnings/database.md`
- Deploy/Vercel → `docs/learnings/deployment.md`

## Architecture rapide
- Pages publiques : `src/app/(public)/` + `src/app/explore/` + `src/app/vendor/`
- Dashboard auth : `src/app/(dashboard)/`
- Auth pages : `src/app/(auth)/`
- API routes : `src/app/api/`
- Composants : `src/components/`
- Lib utils : `src/lib/`
- Middleware (Next.js 16) : `proxy.ts` (PAS middleware.ts)
- Schema DB : `prisma/schema.prisma`

## Commandes essentielles
```bash
npm run dev          # Dev sur localhost:3001
npm run build        # Build prod (inclut prisma db push via DIRECT_URL)
npx prisma studio    # GUI base de données
vercel deploy --prod # Deploy production (JAMAIS git push sans confirmation)
```

## Règles absolues
- Ne JAMAIS git push / déployer sans confirmation explicite du maître
- Build doit passer (`npx next build`) avant tout commit de feature
- DB migrations : utiliser DIRECT_URL (port 5432), pas DATABASE_URL (port 6543)
- Commits atomiques : `fix(scope): description` ou `feat(scope): description`
- Auth : JWT custom via `jose` — PAS NextAuth, PAS next-auth

## Notes importantes
- Next.js 16 — lire `node_modules/next/dist/docs/` si comportement inattendu
- Supabase/Neon Transaction Pooler (6543) : runtime OK, DDL bloqué
- Session Pooler (5432) : pour migrations uniquement — utiliser DIRECT_URL
- `overflow-x:clip` sur homepage (pas `hidden`) — préserve les dropdowns
- Google OAuth implémenté manuellement sans NextAuth
