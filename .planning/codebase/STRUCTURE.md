# Codebase Structure

**Analysis Date:** 2026-04-27

## Directory Layout

```
momento/
├── prisma/
│   ├── schema.prisma            # 697 lines, 37 models
│   ├── seed-dev.ts              # Dev seeding script
│   └── tsconfig.seed.json
├── public/                       # Static assets (logos, OG images)
├── e2e/                          # Playwright smoke suites
│   ├── smoke-api.spec.ts
│   ├── smoke-auth.spec.ts
│   └── smoke-public.spec.ts
├── scripts/                      # One-shot ops scripts (tsx-runnable)
│   ├── audit.ts                 # SAST/sec audit
│   ├── make-me-admin.ts
│   ├── set-pro.ts / set-admin.ts
│   ├── enrich-dev-vendor.ts
│   ├── seed-vendor.ts / seed-fix.ts / seed-notif.ts
│   └── cleanup-pentest-accounts.{ts,sql}
├── docs/                         # Internal docs (learnings/, planning/)
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components (shared)
│   ├── lib/                     # Helpers, business logic
│   ├── hooks/                   # React hooks
│   ├── generated/prisma/        # Prisma 7 generated client (NEVER import @prisma/client)
│   ├── instrumentation.ts       # Next.js OTel hook
│   └── proxy.ts                 # Next 16 middleware (renamed from middleware.ts)
├── next.config.ts                # CSP, image hosts, turbopack root
├── prisma.config.ts              # Prisma 7 config
├── tsconfig.json                 # paths: { "@/*": ["./src/*"] }
├── eslint.config.mjs             # ESLint 9 flat config
├── postcss.config.mjs            # Tailwind v4 plugin
├── playwright.config.ts          # E2E config
├── components.json               # shadcn config
├── package.json                  # Build script chains prisma db push + next build
└── CLAUDE.md / .claude/          # Project rules, agents, skills
```

## Directory Purposes

**`src/app/`:**
- Purpose: All routing (App Router) — pages, layouts, route handlers
- Naming: kebab-case folders, `page.tsx` for pages, `route.ts` for API
- Special files: `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`, `globals.css`, `icon.png`

**`src/app/(legal)/`:**
- Purpose: Legal pages (CGU, confidentialité, mentions-legales) — route group, no URL prefix
- Contains TODO_DECISION comments awaiting SARL creation, CNDP n° récépissé, DPO designation

**`src/app/api/`:**
- Purpose: All HTTP API endpoints (~95 `route.ts` files)
- Subgroups: `admin/`, `auth/`, `vendor/`, `planners/`, `event-site/`, `public/`, `dev/`, `dev-login`
- Pattern: Each route uses `auth()` (or `requireSession` in IS_DEV) → Zod parse → ownership check → Prisma → JSON

**`src/app/dashboard/`:**
- Purpose: Authenticated user (client role) home
- Key files:
  - `page.tsx` (39 lines) — RSC, fetches initial planners
  - `DashboardClient.tsx` (1923 lines, **monolithic — refactor candidate**)
  - `loading.tsx` (123 lines) — skeleton
  - `event-site/[id]/EventSiteEditor.tsx` — palette + content editor

**`src/app/admin/`:**
- Purpose: Admin console (gated by `isAdminUser`)
- Subroutes: `users/`, `vendors/`, `vendors/[slug]/`, `ranking/`

**`src/app/vendor/`:**
- Purpose: Both public vendor profile (`vendor/[slug]`) AND authenticated vendor dashboard (`vendor/dashboard/`)
- Subroutes (auth): `inbox`, `packages`, `profil`, `templates`

**`src/app/explore/`:**
- Purpose: Public vendor browse + map (1000+ vendors, 41 cities, 31 categories)
- Components: `ExploreClient.tsx` (PillSelect filter pattern)

**`src/components/`:**
- Purpose: Shared React components (cross-page)
- Top-level files: dashboard widgets, hero, swipe, modals, navigation, theme toggle
- Subdirs: `admin/`, `clone/` (legacy designs being replaced), `event-site/`, `guests/`, `prestataires/`, `skeleton/`, `ui/` (shadcn), `vendor/`

**`src/lib/`:**
- Purpose: Business logic + side-effect-free helpers
- Auth: `auth.ts`, `requireAuth.ts`, `requirePro.ts`, `adminAuth.ts`, `adminConstants.ts`, `adminAudit.ts`, `devAuth.ts`, `devMock.ts`
- Domain: `eventTypes.ts`, `eventTemplateMapping.ts`, `eventSiteSeed.ts`, `eventSiteSlug.ts`, `eventSiteTokens.ts`, `eventSiteAnimations.ts`, `eventLabel.ts`, `cities.ts`, `colors.ts`
- Computation: `completionScore.ts`, `rankingScore.ts`, `vendorQueries.ts`, `vendorCoords.ts`, `rsvpDedup.ts`
- Infra: `prisma.ts`, `email.ts`, `rateLimiter.ts`, `turnstile.ts`, `geocode.ts`, `imageCompress.ts`
- Validation: `validations.ts` (Zod schemas)
- Misc: `utils.ts` (clsx + tailwind-merge), `useTrack.ts` (analytics), `swipeStorage.ts`, `locationParser.ts`, `planGate.ts`

**`src/hooks/`:**
- Purpose: React hooks
- Files: see directory listing — primarily UI/data hooks

**`src/generated/prisma/`:**
- Purpose: Prisma 7 generated client (output dir per schema.prisma line 3)
- Status: Generated (commit-tracked? — confirm via .gitignore); regenerate via `npx prisma generate`
- Internal: `client.ts`, `commonInputTypes.ts`, `internal/`, `models/`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` — root RSC layout (font, metadata, providers)
- `src/app/page.tsx` — homepage RSC
- `src/proxy.ts` — Next 16 middleware

**Configuration:**
- `next.config.ts` — CSP, image hosts, turbopack root
- `prisma/schema.prisma` — DB schema source of truth
- `prisma.config.ts` — Prisma 7 config
- `tsconfig.json` — `paths: { "@/*": ["./src/*"] }`, strict mode
- `eslint.config.mjs` — flat config (ESLint 9)
- `postcss.config.mjs` — Tailwind v4 plugin
- `components.json` — shadcn alias config

**Core Logic:**
- `src/lib/auth.ts` — NextAuth v5 (beta) configuration
- `src/lib/prisma.ts` — Prisma singleton with `PrismaPg` driver-adapter
- `src/lib/validations.ts` — Zod schemas (shared client/server)
- `src/app/api/planners/[id]/dashboard-data/route.ts` — single round-trip dashboard hydration

**Auth gating helpers:**
- `src/lib/requireAuth.ts` — RSC redirect-to-login helper
- `src/lib/requirePro.ts` — Pro plan gate
- `src/lib/adminAuth.ts` — `isAdminUser()`
- `src/lib/devAuth.ts` — `requireSession()` IS_DEV variant

**Email:**
- `src/lib/email.ts` — Resend templates, fail-hard if `NEXT_PUBLIC_APP_URL` unset in prod

**Testing:**
- `e2e/smoke-*.spec.ts` — Playwright smoke
- `playwright.config.ts` — root config
- No unit tests (no Jest/Vitest)

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `EventCard.tsx`, `DashboardWidgets.tsx`)
- Library helpers: `camelCase.ts` (e.g. `rateLimiter.ts`, `vendorQueries.ts`)
- Page files: lowercase (`page.tsx`, `layout.tsx`, `route.ts` — Next conventions)
- Route folders: kebab-case (`forgot-password/`, `event-site/`)
- Dynamic segments: `[id]`, `[slug]`, `[...nextauth]`, `[mediaId]`
- Route groups: `(legal)/` — no URL prefix
- Tests: `*.spec.ts` (Playwright)

**Functions:**
- React components: `PascalCase`
- Utility functions: `camelCase`
- Server-only modules: import `"server-only"` (e.g. `adminAuth.ts:1`)

**Variables:**
- camelCase
- Constants: `UPPER_SNAKE` (e.g. `MAX_SIZE`, `ALLOWED_MIME`, `IS_DEV`, `REMEMBER_ME_MAX_AGE`)
- Zod schemas: `<Name>Schema` (e.g. `BudgetItemPatchSchema`, `GuestPatchSchema`)

**Types:**
- TypeScript types: `PascalCase`
- Prisma model types: imported from `@/generated/prisma/client`

## Where to Add New Code

**New API endpoint:**
- Place: `src/app/api/<resource>/route.ts` or `src/app/api/<resource>/[id]/route.ts`
- Boilerplate: `auth()` (or `IS_DEV` branch with `requireSession`) → Zod schema in `src/lib/validations.ts` → ownership check → Prisma op → JSON response
- Always filter by `userId` (workspace.userId / planner.userId / direct ownership) — see `src/app/api/budget-items/[id]/route.ts:31` for canonical pattern

**New page (auth-required):**
- Place: `src/app/<route>/page.tsx` (RSC) + optional `<Route>Client.tsx` for interactivity
- Add `<route>` to `PROTECTED` array in `src/proxy.ts:7-10`
- If layout-level gate needed: add `layout.tsx` calling `await requireAuth("/<route>")`

**New page (public):**
- Place: `src/app/<route>/page.tsx`
- DO NOT add to PROTECTED in `proxy.ts`
- If route should be exempt from coming-soon gate: add prefix to `COMING_SOON_EXEMPT` in `src/proxy.ts:6`

**New dashboard widget:**
- 1) Read `.claude/rules/widget-contract.md` first
- 2) Add data shape to `src/app/api/planners/[id]/dashboard-data/route.ts` response
- 3) Add widget rendering in `src/components/DashboardWidgets.tsx` or refactor to `src/components/dashboard/`
- 4) Wire in `src/app/dashboard/DashboardClient.tsx` switch statement
- NEVER use `const data: T[] = []` placeholder — must hydrate from API

**New shared component:**
- Place: `src/components/<Name>.tsx`
- Subdirs by domain: `event-site/`, `guests/`, `prestataires/`, `vendor/`, `admin/`
- shadcn primitives: `src/components/ui/`
- Reuse before reinventing: PillSelect (`src/app/explore/ExploreClient.tsx`), Dialog (`src/components/guests/LinkRsvpDialog.tsx`), Banner (`src/components/EmailVerificationBanner.tsx`), ViewToggle (`src/components/guests/ViewToggle.tsx`)

**Utility / business logic:**
- Pure functions: `src/lib/<name>.ts`
- Server-only (uses Prisma): add `import "server-only"` at top
- Validation: extend `src/lib/validations.ts` (Zod schemas)

**Database changes:**
- Edit `prisma/schema.prisma`
- Run `DATABASE_URL=$DIRECT_URL npx prisma db push` (port 5432, NEVER 6543)
- Run `npx prisma generate` (regenerates `src/generated/prisma/`)
- Update Zod schemas in `src/lib/validations.ts` if user input touches new fields

**One-shot maintenance scripts:**
- Place: `scripts/<name>.ts`
- Run: `npx tsx scripts/<name>.ts`
- For SQL: `scripts/<name>.sql` (run via Supabase SQL editor)

## Special Directories

**`src/generated/prisma/`:**
- Purpose: Prisma 7 generated client (output target)
- Generated: Yes (`prisma generate`)
- Committed: Likely yes (verify `.gitignore`); needed for `paths` resolution in `@/generated/prisma/client`
- DO NOT edit manually

**`.claude/`:**
- Purpose: Project Claude Code config — agents, rules, skills, sessions
- Contains: `rules/*.md` (associé, brand-consistency, fix-everything, widget-contract, etc.), `RULES/`, `SKILLS/`, agent definitions
- Worktree: `.claude/worktrees/<name>/` — current development branch sandbox

**`.planning/`:**
- Purpose: Planning artifacts for GSD workflow
- Subdirs: `codebase/` (this audit), `phases/`, `debug/`, `reports/`, `build-output.log`

**`docs/`:**
- Purpose: Internal documentation
- Subdirs: `learnings/` (auth.md, ui-patterns.md, database.md, deployment.md per CLAUDE.md guidance)

**`public/`:**
- Purpose: Static assets served at root
- Generated: No
- Committed: Yes

**`e2e/`:**
- Purpose: Playwright E2E smoke suites
- Generated: No
- Committed: Yes

**`scripts/`:**
- Purpose: One-shot ops/seeding scripts
- Generated: No
- Committed: Yes (some `.sql` files include cleanup queries — verify no creds)

---

*Structure analysis: 2026-04-27*
