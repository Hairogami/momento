# COMPACT_STATE — 2026-04-28 (mid-session)

## 1. Goal actif

**Refonte mobile-first pixel perfect de tout l'espace client Momento** — pas de pression launch, qualité Linear/Stripe/Notion, innovations mobile-only (bottom sheets, swipe gestures, FAB, voice input, etc.). Plan complet validé : 30-39h sur 5 sessions.

**Session 1 en cours** : Phase 5 (Foundation) + Phase 6 (Navigation mobile native) — ~7-9h.

## 2. Décisions prises + POURQUOI

### Cette session (post-12h sommeil user)
- **Phase 04 Budget refonte totale shippée prod** (commit `3fa4da3`, deployed via `vercel --prod`) — pas push GitHub par choix user
- **Phase 5/6 plan validé** : 7 sous-phases foundation + nav mobile native
- **Approche refactor pragmatique** : `DashboardShell` component wrapper plutôt que Route Group `(dashboard)/` (moins de risques de casser les imports — 10+ pages à toucher)
- **Pas de Workspace drop** : la migration BudgetItem garde `workspaceId` nullable plutôt que suppression (9+ fichiers consommateurs, hors scope Phase 4)

### Décisions architecturales validées par user
- **Multi-événement `Planner`** confirmé (pas mono-Workspace) — coherent avec pricing Pro/Free
- **Modal partout** (desktop + mobile) pour confirmations destructives
- **Optimistic updates** partout (rollback sur erreur, toast feedback)
- **Vue par prestataire** intégrée dans /budget (pas tab séparé)
- **Catégories centralisées** dans `src/lib/budgetCategories.ts` (10 cats brand-aligned, pas sépia legacy)

### Pas de push GitHub
User a explicit : "On a vercel cli pas besoin de push comme ça" → deploy via `vercel --prod` direct, commits restent locaux. Risque accepté : perte si crash PC. À pousser plus tard pour archive.

## 3. Bugs/problèmes non résolus

### Critiques
- **`/accueil` mobile CASSÉ** : `DashSidebar` toujours visible (ligne 162), pas de wrapper `hidden lg:flex` → sidebar 240px écrase tout sur 375px
- **`DashboardClient` grille 12-col rigide** (ligne 1146) : `gridTemplateColumns: "repeat(12, 1fr)"` sans collapse → widgets débordent ou ultra-comprimés sur <768px
- **`MobileDashNav` zombie** : composant existe mais utilisé nulle part
- **`AntNav` repurposée** : navbar landing recyclée pour dashboard mobile, pas de nav dédiée

### Tech debt
- Aucun layout commun — 10 pages dupliquent `<div flex><sidebar/><main/></div>`
- Container queries absentes dans globals.css
- Padding/gap/spacing statiques (seule la typo a `clamp()`)

### Non-bloquants
- 2 untracked scripts ad-hoc (`debug-vendor-msg.ts`, `fix-vendor-test.ts`)
- Phase 1 multi-rôle auth en attente (branche `phase1-multirole-pending`, commit `d6a511d`)
- Pages legal en attente contenu juridique
- Sentry skipped pre-launch
- Tests E2E Playwright budget (auth fixture nécessaire)

## 4. Approches écartées + pourquoi

- **Route Group `(dashboard)/`** : déplacement de 10 dossiers = risque casser imports + URLs → on prend `DashboardShell` wrapper component à la place
- **Vague A only (MVP)** : user a explicitement dit "pas de pression launch dans une semaine, pixel perfect" → on fait Vague A + B complète, pas de raccourci
- **Mono-événement (Workspace seul)** : casserait pricing Pro/Free (illimité events) → on garde Planner multi-event
- **Drop Workspace cette phase** : 9+ fichiers consommateurs, scope trop large → reporté en phase ultérieure dédiée
- **Tests Playwright Phase 4.7** : besoin auth fixture, scope trop large → on a fait Vitest validations seulement (20/20 pass)

## 5. Next action concrète

**Phase 5.1 — Créer `src/components/dashboard/DashboardShell.tsx`** :
- Wrapper component responsive
- Inclut : `DashSidebar` (desktop), `MobileTopBar` (mobile), `MobileBottomNav` (mobile)
- Props : `events`, `activeEventId`, `onEventChange`, optional `pageTitle`, `pageActions`
- Style : `display: flex` desktop / `display: block + safe-area-inset` mobile
- Detect viewport via Tailwind `lg:` ou via container query

**Ensuite Phase 5.2** : étendre tokens fluides dans `globals.css` :
- `--space-{2xs,xs,sm,md,lg,xl,2xl}` clamp()
- `--gap-{tight,medium,loose,comfy}` clamp()
- `--radius-{xs,sm,md,lg,full}`
- `--shadow-{card,raised,floating,modal}`
- `env(safe-area-inset-*)` setup

**Puis Phase 6.1-6.4** : MobileBottomNav (5 tabs), MobileTopBar contextuel, MobileDrawer slide-in, FAB.

## Récap structuré pour reprise post-compact

### Commits locaux non poussés
1. `3d3028c` — docs(deployment): consolidate lessons (créé pendant nuit, pas pushé)
2. `0a3742f`, `5f7c51c`, `12efa7c`, `24cf353`, `e37f326`, `daaa500`, `7e82a8e`, `55e4169`, `fe01ef0` — fixes nuit (push prod faits via webhook après reconnect)
3. `3fa4da3` — feat(budget): refonte totale Phase 04 (deployed via `vercel --prod`, pas push GitHub)

### Files clés ouverts
- `src/app/dashboard/DashboardClient.tsx` (1170 lignes) — grille 12-col rigide à fix
- `src/app/accueil/page.tsx` (427 lignes) — sidebar pas responsive ligne 162
- `src/components/clone/dashboard/DashSidebar.tsx` (579 lignes) — desktop only, OK
- `src/components/clone/dashboard/MobileDashNav.tsx` (140 lignes) — zombie, à virer ou réutiliser
- `src/app/globals.css` (840 lignes) — manque container queries + tokens spacing/gap fluides

### Branches & infra
- `main` (HEAD = e37f326 origin, local 3fa4da3 non push)
- `phase1-multirole-pending` (commit d6a511d, multi-rôle auth en attente)
- Vercel CLI installée + linkée `ngf1/momento`
- DB Supabase synced (rankingScore + plannerId required + 830 vendors backfill)
- DATABASE_URL pooler 6543 + `?pgbouncer=true&connection_limit=1` (rotation password 2x cette nuit)

### Skills Darwin optimisés (5/30 plus faibles)
- systematic-debugging.md (48→72)
- test-driven-development.md (52→75)
- brainstorming.md (65→78)
- brand-guidelines/SKILL.md (66→78)
- frontend-design.md (68→78)

### Feedback persistant
`.claude/feedback.md` créé + référencé dans `.claude/CLAUDE.md` — auto-loadé chaque session future.
