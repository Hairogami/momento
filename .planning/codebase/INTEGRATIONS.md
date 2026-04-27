# External Integrations

**Analysis Date:** 2026-04-27

## APIs & External Services

**Email:**
- **Resend** — verification + password-reset emails
  - SDK: `resend` ^6.10.0
  - Implementation: `src/lib/email.ts` (single role-agnostic template)
  - Auth: `RESEND_API_KEY` env var
  - From: `RESEND_FROM_EMAIL` (default `noreply@momentoevents.app`)
  - Reply-To: `RESEND_REPLY_TO` (default `support@momentoevents.app`)
  - NextAuth provider integration: `Resend({ apiKey, from })` in `src/lib/auth.ts` (production only — IS_DEV disables Resend because it requires PrismaAdapter and DEV runs adapter-less)

**AI:**
- **Anthropic Claude** — vendor/budget suggestions
  - SDK: `@anthropic-ai/sdk` ^0.85.0
  - Endpoint: `src/app/api/ai/suggest/route.ts`
  - Auth: `ANTHROPIC_API_KEY`

**Maps & Geocoding:**
- **OpenStreetMap Nominatim** — `src/app/api/geocode/route.ts`, `src/lib/geocode.ts`
  - No API key (public Nominatim, must respect rate limit)
  - CSP entries in `next.config.ts` lines 25-28 (`*.tile.openstreetmap.org`, `*.basemaps.cartocdn.com`, `nominatim.openstreetmap.org`)
- **Leaflet client-side maps** — `src/components/ExploreMap.tsx`, `VendorMap.tsx`

**Bot Protection:**
- **Cloudflare Turnstile** — `src/lib/turnstile.ts` + `src/components/Turnstile.tsx`
  - Whitelisted in CSP (`challenges.cloudflare.com`)
  - Auth: `TURNSTILE_SITE_KEY` (public) + `TURNSTILE_SECRET_KEY` (server)

**Calendar:**
- **Google Calendar (read-only)** — `src/app/api/calendar/google/route.ts`
  - Currently NOT enabled (auth.ts line 50: scope locked to `openid email profile` only — calendar scope is "restricted" and would trigger Google verification)
  - Code present but inactive

## Data Storage

**Databases:**
- **Supabase Postgres (eu-west-1)**
  - Pooler host: `aws-0-eu-west-1.pooler.supabase.com`
  - Runtime: `DATABASE_URL` (port 6543, transaction pool)
  - Migrations: `DIRECT_URL` (port 5432) — required for `prisma db push`
  - Client: Prisma 7 via `@prisma/adapter-pg`
  - Driver wiring: `src/lib/prisma.ts` (`new PrismaPg({ connectionString: DATABASE_URL })`)
  - **No Supabase JS client used** — Prisma is the sole DB interface

**File Storage:**
- **Vercel Blob** (`@vercel/blob` ^2.3.3)
  - Used by: `src/app/api/upload/avatar/route.ts`, `src/app/api/event-site/[id]/photos/route.ts`
  - Auth: `BLOB_READ_WRITE_TOKEN`
  - Buckets: `avatars/`, event-site `photos/`
  - CSP allows `*.public.blob.vercel-storage.com` (img-src)

**Caching / Rate Limiting:**
- **Upstash Redis** (`@upstash/redis` + `@upstash/ratelimit`)
  - `src/lib/rateLimiter.ts` — used in 5+ routes (login, contact, vendors list, track, public RSVP)
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Fail-closed since commit `c69ee06` (April 26)

## Authentication & Identity

**Auth Provider:**
- **NextAuth v5 (beta)** with JWT strategy — `src/lib/auth.ts`
- Providers (conditional based on env):
  - Google OAuth (`GOOGLE_CLIENT_ID` set) — scopes: `openid email profile`, `allowDangerousEmailAccountLinking: true`
  - Facebook OAuth (`FACEBOOK_CLIENT_ID` set) — present but typically not configured in dev
  - Resend "magic link" (production only — disabled in IS_DEV because requires PrismaAdapter)
  - Credentials (email/password, bcrypt, with rate-limit)
- Session: 30-day max with `rememberMe`, 1-day fallback otherwise; `updateAge` 1h
- Cookie: `authjs.session-token` (dev) / `__Secure-authjs.session-token` (prod), `httpOnly`, `sameSite: lax`, `secure: production`
- DEV bypass: `IS_DEV` short-circuits PrismaAdapter (line 22) — pure JWT in dev
- Dev-only routes: `/api/dev-login` (404 in prod), `/api/dev/switch-role`, `/api/dev/switch-plan` (gated to owner email + non-prod)

**Multi-role:**
- Single User table, `role` field: `client | vendor | admin`
- Vendor accounts gated by `vendorSlug` field; admin gated via `src/lib/adminAuth.ts` `isAdminUser()`
- Owner email: `moumene486@gmail.com` (constant in `src/lib/adminConstants.ts`)

## Monitoring & Observability

**Error Tracking:**
- **None integrated** — no Sentry, no Datadog. (Sentry MCP server is enabled per `.claude/CLAUDE.md`, but no SDK in `package.json`.)
- Errors logged to `console.error` (42 occurrences across 28 files; e.g. `src/lib/auth.ts:208`, `src/app/api/unread/route.ts:54`)

**Logs:**
- `console.log` count: 0 in `src/` — clean.
- `console.error` only — gated `process.env.NODE_ENV !== "production"` in some places (e.g. `unread/route.ts`)
- Admin audit log table: `AdminAuditLog` model written to via `src/lib/adminAudit.ts` for sensitive admin actions (eject user, reset password, etc.)
- `src/instrumentation.ts` present (Next.js OpenTelemetry hook)

## CI/CD & Deployment

**Hosting:**
- **Vercel** — project `ngf1/momento`, domain `momentoevents.app`
- Standalone build NOT enabled (no `output: 'standalone'` in `next.config.ts`)

**CI Pipeline:**
- No GitHub Actions detected (no `.github/workflows/`)
- Pre-commit: `npx next build` mandatory before feature commits (per CLAUDE.md)
- E2E: Playwright runs locally via `npm run test:e2e` against `BASE_URL=https://momentoevents.app` for prod smoke
- `review-loop.js`/`.ps1` + `review-loop.log` at root — local automated review tooling

## Environment Configuration

**Required env vars (production):**
- `AUTH_SECRET`
- `DATABASE_URL` (port 6543), `DIRECT_URL` (port 5432)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`
- `BLOB_READ_WRITE_TOKEN`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_APP_URL` — **fail-hard if missing in production** (`src/lib/email.ts` lines 11-13)
- `LAUNCH_PUBLIC=true`, `PREVIEW_KEY` (for coming-soon override)
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (optional)
- `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` (optional)

**Secrets location:**
- Vercel Project → Environment Variables (sync via `vercel env pull .env.local`)
- `.env.local` gitignored
- Local env files exist as side files (per worktree env)

## Webhooks & Callbacks

**Incoming:**
- NextAuth callbacks: `/api/auth/[...nextauth]/route.ts` (Google/Facebook/Resend/Credentials)
- Public RSVP: `/api/public/evt/[slug]/rsvp/route.ts`
- Contact form: `/api/contact/route.ts`
- Track analytics: `/api/track/route.ts`
- Waitlist: `/api/waitlist/route.ts`

**Outgoing:**
- Resend (email)
- Vercel Blob (file upload)
- Anthropic Claude (AI)
- Nominatim (geocode lookup)
- Upstash Redis (rate limit ops)

## Status Summary

| Integration | Status | Notes |
|-------------|--------|-------|
| Supabase Postgres | ✅ Active | Prisma 7 + adapter-pg, pooler eu-west-1 |
| Vercel Blob | ✅ Active | Avatar + event-site photos |
| Upstash Redis | ✅ Active | Rate limit, fail-closed since c69ee06 |
| Resend | ✅ Active (prod only) | Disabled in IS_DEV |
| NextAuth Google | ✅ Active | Conditional on env, scope=openid+email+profile only |
| NextAuth Facebook | ⚠️ Configured but unused | Code present, env typically unset |
| Anthropic Claude | ✅ Active | AI suggest endpoint |
| Cloudflare Turnstile | ✅ Active | Bot protection on signup/login |
| Google Calendar | ⚠️ Code present, OAuth scope NOT requested | Restricted scope avoided to skip verification |
| Sentry | ❌ Not integrated | MCP server only, no SDK |
| GitHub Actions | ❌ Absent | No CI; pre-commit manual |

---

*Integration audit: 2026-04-27*
