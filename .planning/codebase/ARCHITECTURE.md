# Architecture

**Analysis Date:** 2026-04-27

## Pattern Overview

**Overall:** Next.js 16 App Router monolith — full-stack TypeScript with co-located route handlers, server-rendered authenticated pages, and client-side interactive widgets backed by JSON API routes.

**Key Characteristics:**
- App Router exclusively (no `pages/`)
- Single Postgres DB via Prisma 7 (no microservices)
- JWT session strategy (NextAuth v5 beta) — stateless sessions readable in Server Components and Route Handlers
- Mixed RSC + client components — pages fetch initial data server-side, then hydrate to client widgets that fetch from `/api/*`
- Dual-mode auth: real NextAuth in production, `IS_DEV` bypass with first-DB-user impersonation in development
- Multi-role same-app: client / vendor / admin roles share user table, role-checked at route entry

## Layers

**Page layer (RSC):**
- Purpose: SEO-eligible static/SSR pages, initial auth gate, initial data load
- Location: `src/app/**/page.tsx`
- Contains: `async` server components, `redirect()` to `/login` on missing session, `prisma` reads
- Depends on: `src/lib/auth.ts` (`auth()`), `src/lib/prisma.ts`
- Used by: route group layouts (e.g. `dashboard/layout.tsx` calls `requireAuth`)

**Client widget layer:**
- Purpose: interactive UI (forms, dashboard widgets, swipe, modals)
- Location: `src/app/**/Client.tsx`, `src/app/**/*Editor.tsx`, `src/components/*.tsx`
- Pattern: receives initial props from RSC parent, mutates via `fetch('/api/...')`
- Depends on: `next-themes` (dark mode), `sonner` (toasts), `framer-motion`

**API layer (Route Handlers):**
- Purpose: JSON CRUD, rate-limited mutations, file uploads
- Location: `src/app/api/**/route.ts` (~95 route files)
- Pattern: `auth()` (or `requireSession` in IS_DEV) → Zod parse → ownership check → Prisma op → JSON response
- Depends on: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/validations.ts`, `src/lib/rateLimiter.ts`

**Domain helper layer:**
- Purpose: business rules / shared computation
- Location: `src/lib/`
- Contains: `eventSiteSlug.ts`, `eventTypeMapping.ts`, `rankingScore.ts`, `completionScore.ts`, `vendorQueries.ts`, `planGate.ts`, `rsvpDedup.ts`, `vendorCoords.ts`
- Used by: API routes + RSC pages

**Auth & gate layer:**
- `src/lib/auth.ts` — NextAuth config (providers, callbacks, JWT shape)
- `src/lib/requireAuth.ts` — `redirect("/login")` helper for layouts/RSC
- `src/lib/requirePro.ts` — Pro plan gate
- `src/lib/adminAuth.ts` + `src/lib/adminConstants.ts` — `isAdminUser`, `DEV_OWNER_EMAIL`
- `src/lib/devAuth.ts` — `requireSession()` IS_DEV variant impersonating first user
- `src/lib/devMock.ts` — `IS_DEV` flag + mock data helpers
- `src/proxy.ts` — Next.js 16 middleware (renamed); coming-soon gate + cookie presence check, no JWT decode (Edge runtime can't reliably decrypt JWE in v5 beta)

**Cross-cutting:**
- `src/lib/rateLimiter.ts` — Upstash sliding window
- `src/lib/turnstile.ts` — Cloudflare bot challenge verification
- `src/lib/email.ts` — Resend templates (verification, password-reset)
- `src/lib/adminAudit.ts` — admin action audit log writer
- `src/lib/imageCompress.ts` — server-side image compression for uploads

## Route Groups & Auth Boundary

**Public (no auth gate):**
- `/` (root `page.tsx`)
- `/(legal)/*` — CGU, confidentialité, mentions-legales (route group)
- `/a-propos`, `/accueil`, `/coming-soon`
- `/explore`, `/prestataires`, `/pro`, `/welcome-preview`, `/dev/event-site-playground`
- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/vendor/[slug]` — public vendor profile
- `/evt/[slug]` — public published event site
- `/evt/preview/[id]` — owner preview (iframe-allowed via CSP override)

**Auth-required (gated by `proxy.ts` + RSC layouts):**
- `/dashboard` (+ nested `dashboard/event-site/[id]`)
- `/accueil` (post-login home — note: `/accueil` is BOTH listed as public AND in PROTECTED in `src/proxy.ts` line 8)
- `/profile`, `/planner`, `/favorites`, `/budget`, `/guests`, `/messages`, `/notifications`, `/settings`, `/upgrade`
- `/mes-prestataires`
- `/admin/*` — gated by `isAdminUser()` server-side check inside pages

**Vendor-role:**
- `/vendor/dashboard/*` — `inbox`, `packages`, `profil`, `templates` (role + vendorSlug check inside)

**Admin:**
- `/admin/users`, `/admin/vendors`, `/admin/vendors/[slug]`, `/admin/ranking`

**API public:**
- `/api/auth/*` (NextAuth handlers + custom register/forgot-password/etc.)
- `/api/contact`, `/api/health`, `/api/track`, `/api/waitlist`, `/api/unlock`
- `/api/vendors`, `/api/vendors/counts`, `/api/vendor/[slug]/calendar`
- `/api/public/evt/[slug]/rsvp`
- `/api/dev-login` (404 in production)

## Data Flow

**Sign-in flow (Credentials):**
1. Client `POST /login` form → calls `signIn("credentials", ...)`
2. NextAuth Credentials provider rate-limits by IP + email (`src/lib/auth.ts` lines 80-91)
3. `bcrypt.compare()` — fails-soft on length > 128 (DoS protection)
4. JWT callback issues token with `id`, `role`, `emailVerified`, `picture`, custom `exp` based on `rememberMe`
5. Cookie `authjs.session-token` set with `maxAge: 30d`
6. `proxy.ts` checks cookie presence on subsequent navigation
7. RSC pages call `auth()` → reads JWT → fetches user data via Prisma

**Dashboard hydration (per `widget-contract.md`):**
1. RSC `src/app/dashboard/page.tsx` — `auth()` + initial Prisma read for `Planner` list
2. RSC passes `initialPlanners` props to `DashboardClient.tsx` (1923 lines)
3. Client `useEffect` fires `GET /api/planners/[id]/dashboard-data` (single round trip)
4. Endpoint returns `{ guests, budget, tasks, rsvps, bookings, vendors, ... }` after IDOR check
5. Widgets receive data as props from `DashboardClient` — no widget fetches independently
6. Optimistic mutation on widget action → POST/PATCH `/api/<resource>` → on response, refetch dashboard-data OR locally patch state

**Event site publish flow:**
1. Owner edits `dashboard/event-site/[id]` → `EventSiteEditor.tsx`
2. PATCH `/api/event-site/[id]` after `requireOwnership()` (planner.userId === session.user.id)
3. POST `/api/event-site/[id]/publish` flips status
4. Public visitor `GET /evt/[slug]` → RSC reads `EventSite` where `slug && publishedAt && modStatus === "ok"`
5. RSVP form → `POST /api/public/evt/[slug]/rsvp` (rate-limited, deduped by `rsvpDedup.ts`)
6. Owner sees RSVPs in `/evt/preview/[id]` (CSP iframe-allowed via `next.config.ts` lines 47-55)

**Vendor contact flow:**
1. Public visitor on `/vendor/[slug]` clicks contact
2. `POST /api/track` — analytics event (rate-limited, dedup 30min by sessionId)
3. Authenticated client `POST /api/prestataires/interest` — creates conversation + first message (planner ownership checked)
4. Vendor sees in `/vendor/dashboard/inbox` via `GET /api/messages` (filtered by `user.vendorSlug`)
5. Reply via `POST /api/messages` (sanitized for HTML/encoded entity injection)

**State Management:**
- Server state: Prisma DB (single source of truth)
- Client state: local `useState` + `useEffect` fetches; no Redux/Zustand/TanStack Query
- Optimistic UI: per-widget rollback in dashboard widgets
- Theme: `next-themes` + `localStorage.theme` + `<html class="dark">`

## Key Abstractions

**`auth()` server function:**
- Purpose: read current session in any RSC / Route Handler
- Examples: every protected `route.ts` first 5 lines
- Pattern: `const session = await auth(); if (!session?.user?.id) return 401`

**`requireSession()` (IS_DEV):**
- Purpose: dev-mode equivalent that impersonates first DB user
- Location: `src/lib/devAuth.ts`
- Pattern: routes branch `if (IS_DEV) { ... requireSession() } else { auth() }` — pervasive across `/api/budget-items`, `/api/tasks`, `/api/guests`, `/api/steps`, `/api/rsvps`, `/api/notifications`, `/api/me`, `/api/unread`

**`Prisma client (`@/generated/prisma/client`):**
- Singleton in `src/lib/prisma.ts` with `globalThis` cache (dev hot-reload safe)
- Adapter: `PrismaPg` (driver-adapter API mandatory in Prisma 7)
- Import path: ALWAYS `@/lib/prisma` (never `@prisma/client` directly)

**Workspace ↔ Planner:**
- `Planner` is the event being organized (1 per event); has `userId` owner
- `Workspace` is the legacy container for `Task`/`BudgetItem`/`Guest`; also has `userId`
- IDOR pattern: ownership traversed via `{ workspace: { userId } }` or `{ planner: { userId } }` chain

## Entry Points

**Root layout:**
- `src/app/layout.tsx` — global providers (SessionProvider, ThemeProvider), font loading, metadata
- `src/app/globals.css` — Tailwind v4 base + CSS-tokens (`--dash-*`, `--g1`, `--g2`)

**Server entry:**
- Next.js boot via `next dev` / `next start`
- `src/instrumentation.ts` — OpenTelemetry hook (currently empty/placeholder)
- `src/proxy.ts` — runs on every matching request (matcher excludes static assets)

**Database entry:**
- `prisma/schema.prisma` (697 lines, 37 models)
- Generated client output: `src/generated/prisma/`
- Migrations: `DATABASE_URL=$DIRECT_URL npx prisma db push` (port 5432, never 6543)

## Error Handling

**Strategy:** Fail-fast at API boundary, swallow at observability boundary.

**Patterns:**
- API routes return `{ error: "..."}` JSON with HTTP status (401/403/404/400/413/429/500)
- Zod parse failure → first issue surfaced: `parsed.error.issues[0]?.message`
- Try/catch around DB writes → status 500 + log via `console.error`
- Email send: `src/lib/email.ts` line 11-13 fails hard in production if `NEXT_PUBLIC_APP_URL` missing
- Rate limit: returns 429 + `Retry-After` header
- IDOR: 403 with generic message (no detail leak)
- IS_DEV: try/catch around `headers()` in auth fallback (`auth.ts` line 92)
- `src/app/error.tsx` — global error boundary (Next.js convention)
- `src/app/not-found.tsx` — 404 page

## Cross-Cutting Concerns

**Logging:**
- `console.error` only — 42 occurrences, no centralized logger, no Sentry SDK installed
- Some calls gated `if (process.env.NODE_ENV !== "production")` (e.g. `unread/route.ts:54`)

**Validation:**
- Zod schemas in `src/lib/validations.ts` (centralized) + inline schemas in each route (per-shape)
- Mirror client/server: forms call same Zod schema name

**Authentication:**
- NextAuth v5 JWT — `auth()` for server, `useSession()` for client
- Cookie-based, 30d max with `rememberMe` toggle
- Email verification soft-gate: login allowed if `emailVerified === null`, banner shown until verified

**Rate Limiting:**
- Upstash Redis sliding window
- Applied to: login (10/5min IP, 5/15min email), public `/api/vendors` list (60/min/IP), `/api/contact` (5/10min/IP), `/api/track` (60/min/IP), `/api/public/evt/.../rsvp` (deduped)
- Fail-closed since commit `c69ee06`

**Security headers (`next.config.ts`):**
- CSP with separate strict (`frame-ancestors none`) and `/evt/preview/*` override (`SAMEORIGIN`)
- HSTS preload (`max-age=63072000`)
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Internationalization:**
- French only (fr-FR), Maroc-specific date/currency formatting
- Vendor template languages: `fr | ar | darija`

---

*Architecture analysis: 2026-04-27*
