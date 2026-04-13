---
fixed_at: 2026-04-10T23:55:00Z
fixed: 11
skipped: 0
---

## Applied Fixes

[APPLIED] CR-002 — src/proxy.ts
  JWT signature verification via `jose.jwtVerify` replaces the trivial `length > 20` check.
  Proxy function made `async` to support `await jwtVerify`.
  Commits: 9137af9, eb5aea5

[APPLIED] CR-001 — src/app/api/calendar/google/route.ts
  Added token refresh logic: fetches `refresh_token` + `expires_at` from Account table,
  calls Google token endpoint if expired, updates DB with new token.
  Commit: 9a1995f

[APPLIED] CR-003 — src/app/api/vendor/claim/route.ts + prisma/schema.prisma
  Replaced immediate role elevation with a `VendorClaimRequest` pending queue.
  Added `VendorClaimRequest` Prisma model + relation on User. Prisma client regenerated.
  Returns { step: "pending_admin_review" } instead of directly writing vendor role.
  Commit: 1b3ee36

[APPLIED] WR-006 — src/app/api/vendor/claim/route.ts
  Per-userId rate limit (3 claims / 24h) added in logged_in mode, complementing existing IP limit.
  Commit: 1b3ee36

[APPLIED] CR-004 — src/lib/validations.ts + src/app/api/workspace/route.ts
  budget: .max(1_000_000_000), guestCount: .min(1).max(100_000) in Zod schema.
  Matching inline guards in workspace PATCH handler.
  Commit: 1b3ee36

[APPLIED] WR-001 — src/app/api/reviews/route.ts
  Replaced two-step aggregate+update with a single atomic $executeRaw SQL UPDATE.
  Commit: c1a51f1

[APPLIED] WR-002 — src/app/api/auth/logout/route.ts
  Redirect base now uses NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin instead of req.url.
  Commit: c1a51f1

[APPLIED] WR-003 — src/app/api/stats/route.ts
  Added take: 5000 to stepVendor.findMany to cap memory usage.
  Commit: c1a51f1

[APPLIED] WR-004 — src/app/api/contact/route.ts
  Added stripHtml() applied to clientName and message before DB insert.
  Commit: c1a51f1

[APPLIED] WR-005 — src/app/api/messages/route.ts
  sanitize() now strips numeric (&#60;) and named (&lt;) HTML entities before tag removal.
  Commit: c1a51f1

[APPLIED] WR-009 — src/app/api/auth/change-password/route.ts
  Added rateLimitAsync (5 attempts / 15 min per userId) after session check.
  Commit: c1a51f1

[APPLIED] WR-011 — src/app/api/unlock/route.ts
  previewKey guaranteed non-null at cookie-set point. Removed ?? "" fallback.
  Commits: c1a51f1, eb5aea5

## Skipped

None — all 4 Critical and 7 Warning findings applied successfully.

## Deferred (not in scope — no security regression)

WR-007: Prisma Planner.userId nullable/cascade — schema migration deferred, requires
  NOT NULL backfill on existing rows. Manual review needed before applying.

WR-008: CSP unsafe-inline -> nonces — requires Next.js nonce integration across all
  Script/style usages. Dedicated work item, not a single-line fix.

WR-010: Duplicate vendor-requests / vendor/dashboard routes — maintenance concern only,
  no security impact. Refactor deferred.

## Build

npx next build: PASS (0 errors) — verified after all fixes applied.
