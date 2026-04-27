# P2 — Sentry SDK install + console.error → captureError migration

**Date** : 2026-04-27
**Branch** : `claude/unruffled-wright-6c6cea`
**Goal** : Production observability for Momento via Sentry, replacing scattered `console.error` calls with structured Sentry capture.

---

## 1. Sentry version installed

- `@sentry/nextjs@10.50.0`
- Single `npm install @sentry/nextjs` — 142 packages added, no other lockfile churn
- No global config edits beyond `next.config.ts`

## 2. Config files created

| File | Purpose |
|---|---|
| `sentry.client.config.ts` | Browser SDK init, replay integration, dev-disabled |
| `sentry.server.config.ts` | Node.js runtime init, dev-disabled |
| `sentry.edge.config.ts` | Edge runtime (proxy.ts, edge route handlers) |
| `src/instrumentation.ts` | Updated — imports correct config per `NEXT_RUNTIME`, exports `Sentry.captureRequestError` as `onRequestError` |
| `next.config.ts` | Wrapped with `withSentryConfig()` only when `SENTRY_DSN` is set (no-op in OSS / dev without DSN) |
| `src/lib/observability.ts` | New — exports `captureError(err, ctx)` and `captureMessage(msg, level, ctx)` helpers |

### CSP update
Added `https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io` to `connect-src` in `next.config.ts` so the browser SDK can post events.

### Tunnel route
Configured `tunnelRoute: "/monitoring"` to bypass ad-blockers on the client SDK.

## 3. console.error replacements

**Before** : 42 occurrences across 28 files
**After** : 3 remaining (intentional)

### Remaining 3 (intentional)
- `src/instrumentation.ts:14` — `unhandledRejection` handler — wraps with `Sentry.captureException` but keeps `console.error` for ops visibility in Vercel logs
- `src/instrumentation.ts:22` — same for `uncaughtException`
- `src/lib/observability.ts:23` — the dev fallback inside the helper itself (only fires when `NODE_ENV !== "production"`)

### Replacements made (39 sites)

**API routes (24 sites)** — replaced with `captureError(err, { route, method, ... })`:
- `src/app/api/contact/route.ts`
- `src/app/api/calendar/google/route.ts` (3 sites)
- `src/app/api/ai/suggest/route.ts`
- `src/app/api/messages/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/update-profile/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/admin/vendors/[slug]/media/[mediaId]/route.ts`
- `src/app/api/admin/users/[id]/reset-password/route.ts`
- `src/app/api/auth/resend-verification/route.ts` (2 sites)
- `src/app/api/planners/route.ts` (2 sites — including a multiline Prisma error context)
- `src/app/api/auth/register/route.ts` (3 sites)
- `src/app/api/vendor/[slug]/favorite/route.ts` (2 sites)
- `src/app/api/vendor/[slug]/calendar/route.ts`
- `src/app/api/auth/forgot-password/route.ts` (2 sites)
- `src/app/api/stats/route.ts`
- `src/app/api/vendor/claim/route.ts`
- `src/app/api/unread/route.ts`

**Server libs (4 sites)** — replaced with `captureError(err, { source, ... })`:
- `src/lib/adminAudit.ts`
- `src/lib/auth.ts` (signIn event handler)
- `src/lib/rateLimiter.ts` (CRITICAL fail-open)
- `src/lib/turnstile.ts`

**Client components (8 sites)** — replaced with `captureError` / `captureMessage`:
- `src/app/admin/vendors/[slug]/VendorMediaManager.tsx` (2 sites — upload + delete)
- `src/app/admin/vendors/[slug]/VendorDeleteButton.tsx`
- `src/app/admin/vendors/page.tsx` (2 sites — createVendor + deleteVendor)
- `src/app/admin/users/page.tsx` (2 sites — patchUser failed + network error → `captureMessage` + `captureError`)
- `src/components/clone/dashboard/CreateEventModal.tsx` (2 sites — POST failed + network error)

## 4. Env vars to fill

In Vercel → Project → Settings → Environment Variables (production + preview):

| Var | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | yes | sentry.io → Project Settings → Client Keys (DSN) |
| `SENTRY_DSN` | yes | same DSN, server-side mirror |
| `SENTRY_ORG` | for source maps | sentry.io org slug |
| `SENTRY_PROJECT` | for source maps | sentry.io project slug |
| `SENTRY_AUTH_TOKEN` | for source maps | sentry.io → Settings → Auth Tokens (scope: `project:releases`) |

A new `.env.local.example` was added at the repo root listing all required Momento env vars including the Sentry block.

**Without these env vars** : `withSentryConfig` is a no-op (the wrapper checks `process.env.SENTRY_DSN` before applying), and `captureError` falls back to `console.error("[dev]", ...)` in dev. Production without DSN = silent (no errors thrown, just no telemetry).

## 5. Build status

- `npx tsc --noEmit` : clean (no output = no errors)
- `npx next build` : passed — all routes built successfully (admin, public, vendor, dashboard, evt). Build emits the same routes as before.

## 6. Notes / follow-ups (not blocking this commit)

- Validation hooks flagged the `@anthropic-ai/sdk` direct import in `src/app/api/ai/suggest/route.ts` as something to migrate to `@ai-sdk/anthropic` + Vercel AI Gateway. Out of scope for P2; track separately.
- `src/lib/auth.ts` uses NextAuth v5 beta with JWT strategy — Sentry integrates cleanly via the `events.signIn` handler we replaced.
- `tunnelRoute: "/monitoring"` will create a route on first deploy. If `proxy.ts` blocks unknown routes, the tunnel may need to be excluded.

## 7. Test plan (post-merge)

- [ ] Set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` in Vercel preview
- [ ] Trigger a known 500 (e.g. POST `/api/planners` with bad payload while logged in) → verify event in Sentry dashboard
- [ ] Trigger client-side error in admin/users patchUser → verify breadcrumb + replay in Sentry
- [ ] Confirm CSP doesn't block `*.ingest.sentry.io` requests in browser DevTools
