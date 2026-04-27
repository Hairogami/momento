# Debug Sprint Inventory — Pre-Launch Momento

**Date** : 2026-04-27
**Branche** : `claude/unruffled-wright-6c6cea`
**État final** : 25 commits ahead `origin/main`, ZÉRO push effectué.
**Build** : `npx next build` PASS · `npx tsc --noEmit` PASS · `npx vitest run` 5 fichiers / 101 tests PASS

---

## Vagues exécutées

### Vague 1 — P0 sécurité + P1 brand + P3 cleanup (4 agents parallèles)

| Commit | Scope |
|---|---|
| `988a09e` | P1 brand hex literals dans 5 composants actifs · `InstagramWidget.tsx` supprimé orphelin |
| `6851427` | P0 hard-gate sensitive actions sur `emailVerified !== null` (helper `auth-guards.ts` + 4 routes) |
| `c8ffd33` | P0 CVE `xlsx@0.18.5` → `exceljs@4.4.0` (GHSA-4r6h-8v6p-xvw6 éliminé) |
| `882b604` | P3 cleanup `@neondatabase/serverless` + `@prisma/adapter-neon` (verify removal) |

### Vague 2 — P1 brand consistency + dark mode (3 agents parallèles)

| Commit | Scope |
|---|---|
| `a13bb89` | P1 clone/* cleanup orphelin (`AntFeatureBento.tsx`) |
| `a70b4e4` | P1 `globals.css` shadcn defaults brand-aligned + `.legacy-page` namespace |
| `ffbce3f` | P1 dark mode FOUC fix — blocking head script + `AdminThemeLock` restore prev |

### Vague 3 — P0 sécurité + P1+P2 refactor (4 agents parallèles)

| Commit | Scope |
|---|---|
| `3c27b13` | P0 `logAdminAction` sur `dev/switch-role` + `dev/switch-plan` |
| `93aca17` | P1 brand refactor 25 composants `clone/*` (1 fichier `AntVideoSection.tsx` à fix, 24 déjà OK) |
| `fbe9f93` | P2 helper `getUserId()` extracted, dedup IS_DEV branching dans 17 routes API (-159 lignes) |
| `10a31a7` | wip 18 widgets extracted dans `src/components/dashboard/widgets/` |

### Vague 4 — P2 observability + tests + DRY (4 agents parallèles)

| Commit | Scope |
|---|---|
| `1c32749` | NextAuth pin exact `5.0.0-beta.30` + `proxy.ts` cookie fallback v4/v5 + E2E proxy tests |
| `04247d7` | DashboardClient.tsx wired à 18 widgets (1923 → 1142 lignes, -40.6%) |
| `c6e9bea` | Vitest infrastructure + 5 fichiers tests / 101 assertions / 0 bug trouvé |
| `7df4246` | Sentry SDK installé + 39 console.error remplacés par `captureError` (28 fichiers) |

### Vague 5 — P2 perf + P3 cleanup (4 agents parallèles)

| Commit | Scope |
|---|---|
| `5ed37b1` | Vendor list scaling : `rankingScore` column + 3 indexes + Upstash cache version-based + cron daily 03:00 UTC |
| `0043274` | Dashboard hydration RSC inline (`buildDashboardData()` extracted, page.tsx parallel SSR pre-fetch) |
| `56afa8f` | Dark mode centralize 4 systèmes parallèles → 1 `useTheme()` (140 lignes dupliquées éliminées) |
| `9e101a0` | Documentation `/accueil` vs `/dashboard` decision (KEEP both, 2 niveaux d'UX distincts) |

### Vague 6 — Legal + E2E (2 agents parallèles)

| Commit | Scope |
|---|---|
| `5d87bc6` | Legal TODO_DECISION JSX comments → 6 warning blocks visibles `<div role="alert">` (CGU 2 + Confidentialité 4) |
| `1aa0882` | E2E expand : 4 specs / 23 tests (dashboard widgets, IDOR negative, event-site publish, paywall) |

### Vague 7 — QA finale (3 agents parallèles)

| Commit | Scope |
|---|---|
| `0aa3f25` | SEO : sitemap (~1010+ URLs avec vendors) + robots + JSON-LD vendor + canonical URLs · **bug fix : 12 URLs fantômes supprimées** |
| `2357ecd` | A11y WCAG 2.1 AA : 5 pages auditées + foundational layer · 6 BLOCKER + 8 SERIOUS + 6 MINOR fixés |
| `5157404` | Bundle : `@next/bundle-analyzer` installé + `framer-motion` éliminé (-104KB chunks, -3.9%) |
| `485f3a8` | A11y final layer : sr-only + skip-to-content + global focus-visible |

---

## Bugs auto-fixés en cours d'audit (FIX-EVERYTHING-AS-YOU-GO)

1. **Sitemap envoyait 12 × 404 à Google** (URLs fantômes `/explore/<slug-fictif>` sans pages Next.js correspondantes) — fixé dans commit SEO
2. **`@/generated/prisma/client` manquant dans le worktree** — résolu via `npx prisma generate` (30+ TS errors éliminés)
3. **`tsconfig.tsbuildinfo` cache stale** créait phantom-errors entre commits parallèles (rankingScore + captureError) — résolu via `rm -f tsconfig.tsbuildinfo` à 2 reprises

---

## Décisions tranchées d'associé

| Décision | Choix | Raison |
|---|---|---|
| `allowDangerousEmailAccountLinking` | KEEP + hard-gate strict sur paiement/contact/export | Disable = friction OAuth+credentials. Hard-gate neutralise le risque takeover. |
| `xlsx` CVE | Migrate `exceljs` (pas upgrade `xlsx`) | xlsx n'est plus maintenu sur npm officiel |
| `globals.css` sépia | Namespace `.legacy-page` + remap `--momento-*` au root | Suppression directe = casse 14 composants live qui consomment via `lib/colors.ts` |
| `googleId` field | KEPT | Lu par `scripts/delete-user.ts:64` |
| `AntVendorCard <img>` | KEPT raw `<img>` | Décision archi prior (memory obs `7304`) — CSP `img-src` ligne 27 next.config.ts |
| `/accueil` vs `/dashboard` | KEEP both | 2 niveaux d'UX distincts (multi-event hub vs single-event detail) |
| `clone/*` brand refactor | 24/25 déjà OK, 1 fix | Sur-flag de l'audit initial — gain de temps |
| Bundling commits | Split atomique via `git reset --soft` | Pattern correct (utilisé par 2 agents) |

---

## Actions utilisateur post-merge requises

### Bloquant pour lancement (à faire avant push prod)

1. **Migration DB** — appliquer le schema vendor scaling :
   ```bash
   DATABASE_URL=$DIRECT_URL npx prisma db push
   ```
2. **Backfill rankingScore** — one-off après migration :
   ```bash
   npx tsx scripts/backfill-vendor-ranking.ts
   ```
3. **Env vars Vercel** (Production + Preview) :
   - `CRON_SECRET` — pour l'authentification du cron `/api/cron/refresh-vendor-ranking`
   - `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` — sinon Sentry est no-op silencieux
4. **Décisions business legal** (warning blocks visibles dans `(legal)/cgu`, `(legal)/confidentialite`) :
   - Raison sociale + forme juridique (SARL Momento ?)
   - Capital social, adresse siège, RC, ICE, IF, TVA
   - Plafond responsabilité (validation avocat)
   - Ville tribunaux (par défaut Casablanca)
   - Désignation DPO (Yazid ou externe)
   - N° récépissé CNDP + date après dépôt
   - Décision analytics/cookies (bandeau)

### Recommandé (non-bloquant)

5. Run `npx playwright test` contre le dev server avec DB seedée pour valider les 23 nouveaux E2E tests
6. Run `npm run analyze` après upgrade Next 16 → Turbopack-native analyzer
7. Add `@vitest/coverage-v8` pour mesurer la couverture (Vitest setup déjà fait)

---

## Backlog flaggé pour post-launch (NON-bloquant)

- `EventSiteEditor.tsx` (1533 lignes) — lazy par template
- `AntVideoSection.tsx` (2245 lignes) — lazy au scroll
- Routes `/explore/[city]/[category]` SEO local long-tail (high impact)
- OG image dédiée 1200×630 (actuellement 361×359)
- BreadcrumbList JSON-LD vendor pages
- `@anthropic-ai/sdk` → `@ai-sdk/anthropic` + Vercel AI Gateway (provider migration)
- AntNav.tsx (557 lignes) deeper a11y audit
- Real focus trap modals via native `<dialog>`
- Cross-user IDOR seeding tests (current uses fake CUIDs)
- Automated axe-core run en browser
- `DashboardWidgets.tsx` (2522 lignes) — encore monolithique, à splitter
- VendorMedia → /explore thumbnails (decision archi à revisiter quand CSP change)

---

## Stats finales

- **25 commits livrés** sur la branche `claude/unruffled-wright-6c6cea`
- **0 push effectué** (per CLAUDE.md règle absolue)
- **Build pass** sur le dernier commit
- **TS pass** zéro erreur
- **Tests Vitest** : 5 fichiers, 101 assertions, 100% green
- **Tests E2E** : 4 specs nouvelles + 1 proxy = 23+3 tests (run requires dev server)
- **Bundle gain** : -104KB sur /login chunk
- **Sécurité** : 1 CVE éliminé, 4 routes gated emailverify, 2 routes audit log, NextAuth pin
- **Brand** : sépia/terracotta éliminé sur 100% des composants actifs (1 fichier clone + 5 composants brand hex + globals.css)
- **A11y** : 20 issues WCAG 2.1 AA fixées (6 BLOCKER + 8 SERIOUS + 6 MINOR)
- **SEO** : sitemap 1010+ URLs, JSON-LD enrichi, canonical URLs, 12 URLs fantômes supprimées
- **Observability** : Sentry SDK + 39 console.error remplacés
- **Refactor** : DashboardClient.tsx -781 lignes (-40.6%), 17 routes API DRY via `getUserId()`, 4 systèmes dark mode → 1
- **Perf** : vendor list ranking DB column + cache + cron, dashboard hydration RSC inline

---

*Sprint debug complet. Prêt pour merge worktree → main + push.*
