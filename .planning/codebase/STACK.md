# Technology Stack

**Analysis Date:** 2026-04-27
**Project:** Momento — Moroccan wedding/event marketplace
**Phase:** Pre-launch (1-week debug sprint)

## Languages

**Primary:**
- TypeScript ^5 — strict mode (`tsconfig.json` line 7) — used everywhere in `src/`
- TSX (React 19) — App Router pages, client components

**Secondary:**
- SQL — Prisma migrations + raw SQL helper scripts in `scripts/cleanup-pentest-accounts.sql`, `scripts/enable-rls.sql`
- CSS — Tailwind v4 CSS-first (no `tailwind.config.*`); brand tokens in `src/app/globals.css`

## Runtime

**Environment:**
- Node.js ≥ 20 (`@types/node` ^20 in `package.json`)
- Next.js 16.2.4 (App Router only — no `pages/`)
- React 19.2.4 / React DOM 19.2.4

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- `next` ^16.2.4 — App Router, Turbopack (root configured in `next.config.ts` line 5)
- `react` 19.2.4 / `react-dom` 19.2.4
- `tailwindcss` ^4 + `@tailwindcss/postcss` ^4 — CSS-first, no JS config file
- `shadcn` ^4.2.0 + `@base-ui/react` ^1.3.0 — components in `src/components/ui/`

**Testing:**
- `@playwright/test` ^1.59.1 — E2E only, smoke suites in `e2e/smoke-*.spec.ts`
- `playwright` ^1.59.1
- Run: `npm run test:e2e` / `test:e2e:ui` / `test:e2e:prod`
- No unit-test framework (Jest/Vitest absent)

**Build/Dev:**
- `next dev` — defaults to port 3001 (per CLAUDE.md)
- Build pipeline: `DATABASE_URL=$DIRECT_URL prisma db push --accept-data-loss && next build` (`package.json` line 6)
- `eslint` ^9 + `eslint-config-next` 16.2.2

## Key Dependencies

**Critical:**
- `next-auth` ^5.0.0-beta.30 — JWT session strategy (`src/lib/auth.ts`); beta API surface
- `@auth/prisma-adapter` ^2.11.1 — used only in production (DEV bypasses for pure-JWT)
- `@prisma/client` ^7.7.0 + `prisma` ^7.7.0 — generated client at `src/generated/prisma/client` (NEVER `@prisma/client` direct)
- `@prisma/adapter-pg` ^7.7.0 — chosen Postgres driver (uses Prisma 7 driver-adapter API)
- `bcryptjs` ^3.0.3 — password hashing in Credentials provider
- `zod` ^4.3.6 — runtime validation across all routes (`src/lib/validations.ts`)

**Infrastructure:**
- `@upstash/ratelimit` ^2.0.8 + `@upstash/redis` ^1.37.0 — rate limiting (`src/lib/rateLimiter.ts`)
- `@vercel/blob` ^2.3.3 — avatar/event-site photo storage
- `resend` ^6.10.0 — transactional email (verification, password-reset)
- `@anthropic-ai/sdk` ^0.85.0 — AI suggestions in `src/app/api/ai/suggest/route.ts`
- `@neondatabase/serverless` ^1.0.2 + `@prisma/adapter-neon` ^7.7.0 — installed but not currently wired (Supabase pooler is active driver)

**UI/UX:**
- `framer-motion` ^12.38.0 — animations
- `lucide-react` ^1.7.0 — icons
- `sonner` ^2.0.7 — toasts
- `next-themes` ^0.4.6 — dark/light mode toggle
- `tailwind-merge` ^3.5.0, `clsx` ^2.1.1, `class-variance-authority` ^0.7.1
- `tw-animate-css` ^1.4.0
- `leaflet` ^1.9.4 + `react-leaflet` ^5.0.0 — vendor map
- `date-fns` ^4.1.0
- `xlsx` ^0.18.5 — guest list export (server-side dynamic import)

## Configuration

**Environment:**
- `.env.local` (gitignored) — pulled via `vercel env pull .env.local`
- Required vars: `AUTH_SECRET`, `DATABASE_URL` (port 6543, runtime), `DIRECT_URL` (port 5432, migrations), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (optional), `FACEBOOK_CLIENT_ID`/`FACEBOOK_CLIENT_SECRET` (optional), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`, `LAUNCH_PUBLIC` (string `"true"`), `PREVIEW_KEY`, `ANTHROPIC_API_KEY`

**Build:**
- `next.config.ts` — `turbopack.root` pinned to `__dirname`; CSP headers + image remote patterns; HSTS preload, CSP frame-ancestors override for `/evt/preview/*`
- `prisma.config.ts` present at root
- `tsconfig.json` — `paths: { "@/*": ["./src/*"] }`; `strict: true`; excludes `playwright.config.ts`, `tests/**`
- `eslint.config.mjs` (flat config, ESLint 9)
- `postcss.config.mjs` — Tailwind v4 plugin only

## Platform Requirements

**Development:**
- Windows 11 (current dev machine), bash via Git Bash
- Local DB: Supabase pooler `aws-0-eu-west-1.pooler.supabase.com`; runtime port 6543, migrations port 5432
- Dev server: `npm run dev` → `localhost:3001`
- DEV bypass mode: `IS_DEV = process.env.NODE_ENV === "development"` short-circuits NextAuth Resend/Adapter (see `src/lib/auth.ts` lines 19-22)

**Production:**
- Vercel project `ngf1/momento` (region: per Vercel default; eu-west-1 implied by DB)
- Domain: `momentoevents.app`
- Coming-soon gate gated by `LAUNCH_PUBLIC=true` env var (see `src/proxy.ts`)

## Deprecation / Beta Risks

- **NextAuth v5 BETA** — `next-auth@5.0.0-beta.30`. API may change before stable. Auth flow already had multiple migration patches (commits in last 7 days). Risk: regression on minor bump.
- **Prisma 7** — major version, requires `@/generated/prisma/client` import path; many teams still on v5/v6. Less battle-tested adapter ecosystem.
- **`shadcn` ^4** + `@base-ui/react` ^1.3.0 — base-ui still pre-2.0; component API may shift.
- **Next.js 16** — `proxy.ts` (renamed from `middleware.ts`); not all 3rd-party docs reflect this.
- **React 19** — concurrent renderer changes; `useFormState` gone (now `useActionState`).
- **`xlsx` 0.18.5** — known prototype-pollution CVE in versions <0.19.3. **Upgrade required.**
- **`leaflet` 1.9.4** — current; ok.
- **`@anthropic-ai/sdk` 0.85.0** — pre-1.0, unstable API.
- **`@neondatabase/serverless` + `@prisma/adapter-neon` installed but unused** — dead deps to remove.

---

*Stack analysis: 2026-04-27*
