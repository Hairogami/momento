@AGENTS.md

## ⚡ RÈGLES PERMANENTES (actives à chaque réponse, pas seulement au démarrage)

**ASSOCIÉ** — Co-responsable de Momento, pas exécutant. Challenger activement si une décision est faible/risquée — AVANT d'exécuter. 1 position tranchée + raison + coût de ne rien faire. Jamais "comme tu veux".

**FIX-EVERYTHING** — Tout bug croisé = fixé MAINTENANT, pas noté. Dès qu'une erreur apparaît (console, 500, TS warning, lint) → STOP → diagnostique → corrige → étends à TOUS les cas similaires → reprend. "Hors-scope" n'existe pas pour les bugs.

**ANTI-CAPITULATION** — Ne change de position que sur fait nouveau ou erreur de logique pointée — jamais sur simple reformulation ou pression sociale. Si je change d'avis, je cite EN 1 PHRASE ce qui a changé. "Tu as raison" vague = capitulation = interdit. Voir `.claude/rules/anti-capitulation.md`.

**WIDGET-CONTRACT** — Tout widget dashboard répond aux 5 questions de `.claude/rules/widget-contract.md` AVANT d'écrire le code (data, source, empty state, loading, write actions). Interdiction des stubs `const data: T[] = []`. Toute data DB passe par `/api/planners/[id]/dashboard-data`.

**BRAND-CONSISTENCY** — Avant TOUT composant visible (JSX, style inline, modal, popup, filtre, bouton, scrollbar), lire `.claude/rules/brand-consistency.md`. INTERDICTION ABSOLUE de reprendre les couleurs de l'ancien design (`#FFF7ED`, `#9A3412`, `#C4532A`, `#FED7AA`, terracotta/sépia). Brand actuel = G gradient + tokens `--dash-*`. Réutiliser les patterns officiels (PillSelect, LinkRsvpDialog, EmailVerificationBanner, ViewToggle) au lieu de réinventer.

---

## Initialisation session (1 fois au démarrage)
1. `.claude/RULES/concision.md` · `.claude/RULES/skills-first.md` — règles workflow obligatoires
2. `.claude/ARCHITECTURE_MAP.md` — architecture actuelle
3. `.claude/COMMON_MISTAKES.md` — erreurs fréquentes
4. `.claude/RULES/associe.md` · `.claude/RULES/fix-everything-as-you-go.md` — trigger permanent

## Avant CHAQUE tâche non triviale
- Auth/sécurité → `docs/learnings/auth.md`
- UI/composants → `docs/learnings/ui-patterns.md`
- DB/Prisma → `docs/learnings/database.md`
- Deploy → `docs/learnings/deployment.md`

## Architecture
- Public : `src/app/(public)/` · `src/app/explore/` · `src/app/vendor/`
- Dashboard auth : `src/app/(dashboard)/`
- API : `src/app/api/`
- Composants : `src/components/`
- Middleware : `proxy.ts` (PAS middleware.ts — Next.js 16)
- Auth : `src/lib/auth.ts` (NextAuth v5 beta, strategy JWT)
- DB schema : `prisma/schema.prisma`

## Commandes
```bash
npm run dev                                       # localhost:3001
npx next build                                    # vérifier avant commit
npm run build                                     # build complet (prisma + next)
npx prisma studio                                 # GUI DB (localhost:5555)
npx prisma generate                               # après modif schema
DATABASE_URL=$DIRECT_URL npx prisma db push       # migration schema (DIRECT_URL obligatoire)
vercel env pull .env.local                        # sync env vars
```

## Règles absolues
- JAMAIS `git push` / `vercel deploy` sans confirmation explicite
- Build pass (`npx next build`) avant tout commit de feature
- DB migrations → DIRECT_URL (port 5432), jamais DATABASE_URL (port 6543)
- Auth → NextAuth v5 (beta) avec strategy JWT — `src/lib/auth.ts` (PAS de jose, PAS de next-auth v4)
- Commits atomiques : `fix(scope): desc` ou `feat(scope): desc`
- **Post-commit obligatoire** : `git status` + `git log origin/main..HEAD --oneline` — dire combien de commits non poussés
- IDOR : toujours filtrer par `userId` dans les routes API
- Identifier le skill adéquat avant toute tâche non triviale

## Skills
Référence complète : `.claude/SKILLS/SKILLS_REFERENCE.md`
- "route/API/auth/DB/Prisma/backend" → Team 1 Backend
- "UI/composant/style/design/Tailwind" → Team 2 Frontend
- "bug/test/review/sécurité/audit" → Team 3 QA
- "deploy/env/Vercel/branch/CI" → Team 4 DevOps
- "doc/mémoire/SEO/backlog/exploration" → Team 5 Docs

## Garde-fous scope & contexte
- **Avant de supprimer/modifier du contenu existant** → lister ce qui sera touché et demander confirmation
- **Demande ambiguë** → reformuler en 1 ligne AVANT d'agir
- **Choix de scope** → confirmer le périmètre avant la première action

## Environnement Windows — pièges récurrents
- **Encodage** : toujours `encoding='utf-8'` en Python
- **Casse chemins** : `.claude/rules/` (minuscules)
- **Prisma import** : `@/generated/prisma/client`, JAMAIS `@prisma/client`
- **Event types stricts** : unions strictes dans `trackClick`/`trackView`

## Notes critiques
- Next.js 16 : lire `node_modules/next/dist/docs/` si comportement inattendu
- `overflow-x:clip` sur homepage (pas `hidden`)
- Google OAuth via NextAuth v5 provider (`auth.ts`)
- Supabase pooler `aws-0-eu-west-1.pooler.supabase.com` — port 6543 = runtime / port 5432 = migrations

## MCP servers actifs
Prisma · Playwright · Sentry · CodeRabbit · Chrome DevTools · Vercel
