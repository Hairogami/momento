# Codebase Concerns

**Analysis Date:** 2026-04-27
**Audit context:** Pre-launch debug sprint — zero post-launch debt tolerance.

## Tech Debt

**Monolithic dashboard client (1923 lines):**
- Issue: `src/app/dashboard/DashboardClient.tsx` is a 1923-line single file mixing widget orchestration, fetch logic, and inline component definitions
- Files: `src/app/dashboard/DashboardClient.tsx`
- Impact: Hot-reload slow, mental load on edit, merge conflicts on parallel widget work
- Fix approach: Extract per-widget components to `src/components/dashboard/widgets/` (one file per widget). Keep orchestration + dashboard-data fetch in `DashboardClient.tsx` only.

**`DashboardWidgets.tsx` is 2522 lines:**
- Issue: Same anti-pattern — single file with all widget JSX
- Files: `src/components/DashboardWidgets.tsx`
- Impact: Same as above
- Fix approach: Split per widget; deprecate this file once empty.

**Stub `[]` typed arrays in source code:**
- All confirmed instances are LEGITIMATE empty initializations for animation buffers, not data placeholders:
  - `src/components/DashboardWidgets.tsx:1198` — `const noTable: Guest[] = []` — empty fallback for "guests without table" filter result; legitimate but verify it's not a forgotten placeholder
  - `src/components/FlowerHero.tsx:38-40` — `petals/seeds/sparks: []` — animation particle buffers (canvas), legitimate
  - `src/components/clone/AntFireworks.tsx:73-74` — `rockets/sparks: []` — animation buffers, legitimate
  - `src/components/clone/planner/Calendar.tsx:47` — `items: CalItem[] = []` — verify not stub
  - `src/components/event-site/backgrounds/DecoratifBackground.tsx:207-256` — pattern building arrays, legitimate
- Fix approach: Audit `src/components/DashboardWidgets.tsx:1198` and `src/components/clone/planner/Calendar.tsx:47` to confirm no widget-contract violation. The historical bug (commit `853ec54`) was widgets receiving `[]` props in DASH ROUTING — that's now fixed via `dashboard-data` consolidated route. No widget-contract violation found in current dashboard flow.

**Legacy `clone/` component dir:**
- Issue: `src/components/clone/` contains old design system (terracotta `#C4532A`, sépia `#F5EDD6`, "Ant" prefixed) — direct violation of `brand-consistency.md` rule
- Files:
  - `src/components/clone/AntVideoSection.tsx` — multiple terracotta hex literals (lines 30, 151, 836, 1490, 1496, 1789, 1798)
  - `src/components/clone/dashboard/CreateEventModal.tsx`
  - `src/components/clone/AntFireworks.tsx`
  - `src/components/clone/planner/Calendar.tsx`
- Impact: Brand inconsistency if any of these components are referenced from active routes. Polution that drives future hex copies.
- Fix approach: Audit which `clone/*` components are still imported. Delete unused. Refactor used ones to brand tokens (`var(--g1)`, `var(--g2)`, `var(--dash-*)`).

**`src/app/globals.css` defines OBSOLETE BRAND TOKENS:**
- Issue: Lines 55-155 define `--background: #F5EDD6`, `--accent: #C4532A`, `--momento-terra: #C4532A`, `--primary-foreground: #F5EDD6`, etc. — full sépia/terracotta palette
- Files: `src/app/globals.css` (lines 55, 62, 68, 77, 91, 96, 100-101, 114, 117, 123, 129, 131-155, 440)
- Impact: Any component reading these CSS vars renders in OLD brand. Active conflict with `brand-consistency.md` rule mandating G gradient + `--dash-*`.
- Fix approach: Remove or namespace under `legacy-*`. Verify nothing in current dashboard/auth/explore reads these tokens. Replace shadcn defaults with brand-aligned values.

**Dead deps:**
- `@neondatabase/serverless` ^1.0.2 + `@prisma/adapter-neon` ^7.7.0 installed but UNUSED (Prisma uses `PrismaPg` in `src/lib/prisma.ts:7`)
- Files: `package.json`
- Impact: Bundle bloat, false signal about infrastructure
- Fix approach: `npm uninstall @neondatabase/serverless @prisma/adapter-neon`

## Known Bugs / Suspicious Patterns

**`/accueil` is in BOTH `COMING_SOON_EXEMPT` (implicit, not in list) AND `PROTECTED`:**
- Issue: `src/proxy.ts:7` lists `/accueil` in `PROTECTED` (auth-only). But `accueil` is the post-login welcome page — fine. CLAUDE.md describes `/accueil` as ALSO public landing alternative. Verify intent.
- Files: `src/proxy.ts:7`, `src/app/accueil/`
- Impact: If `/accueil` is meant as public marketing, current proxy redirects unauthenticated users to `/login`. If meant as post-login dashboard, name is confusing vs `/dashboard`.
- Fix approach: Decide — public marketing OR post-login? Pick one, rename if needed.

**`googleId @unique` field in User but unused:**
- Issue: `prisma/schema.prisma:18` defines `googleId String? @unique` but NextAuth Google provider uses `Account` table (PrismaAdapter), not direct `googleId`. Field is unset for all users.
- Files: `prisma/schema.prisma:18`
- Impact: Dead column, potential migration noise
- Fix approach: Remove field OR document that it's reserved (e.g. for legacy Google import flow)

**OAuth `allowDangerousEmailAccountLinking: true`:**
- Issue: `src/lib/auth.ts:46` allows linking Google account to existing email-credentials account without verification step
- Files: `src/lib/auth.ts:46`
- Impact: If attacker registers `victim@gmail.com` via credentials BEFORE victim signs up via Google, attacker controls account once victim signs in via Google. Mitigated only if email-verification gate is enforced before sensitive actions.
- Fix approach: Either disable `allowDangerousEmailAccountLinking` (force separate accounts) OR ensure email-verification is required before any payment / data-export action. Currently soft-gate (login allowed without verification) — risky.

**Pages router file-globbing leakage (verify only):**
- Issue: `src/app/dev/event-site-playground/` is a public dev route in production
- Files: `src/app/dev/event-site-playground/`
- Impact: If indexed/linkable, exposes internal tooling
- Fix approach: Gate behind `IS_DEV` or `isAdminUser` check, OR move to `app/admin/dev-tools/`

**Email send for `auth.signIn` event has wide try/catch:**
- Issue: `src/lib/auth.ts:208` swallows DB write errors during OAuth post-signin (`updates` to user record). Logged via `console.error` only.
- Files: `src/lib/auth.ts:208`
- Impact: Silent OAuth profile sync failures (e.g. avatar/name not updated) — user would never know
- Fix approach: Add metric/Sentry once observability is wired; for now, log clearer message including userId.

## Security Considerations

**IDOR audit — sample of mutating routes (PASSED, but verify exhaustive):**

Sampled routes ALL implement ownership filter via `userId` chain:
- `src/app/api/budget-items/[id]/route.ts:31` — `workspace.userId !== userId` → 403 ✅
- `src/app/api/tasks/[id]/route.ts` — `workspace.userId !== userId` → 403 ✅
- `src/app/api/guests/[id]/route.ts` — `workspace.userId !== userId` → 403 ✅
- `src/app/api/steps/[id]/route.ts` — `planner.userId !== userId` → 403 ✅
- `src/app/api/rsvps/[id]/route.ts` — traverses `eventSite.planner.userId` → 403 ✅
- `src/app/api/notifications/[id]/read/route.ts` — `conversation.clientId !== userId` → 403 ✅
- `src/app/api/event-site/[id]/route.ts:16-26` — `requireOwnership` helper ✅
- `src/app/api/event-site/[id]/photos/route.ts:23-26` — `planner.userId !== session.user.id` ✅
- `src/app/api/vendor/profile/route.ts` — filters by `vendorSlug` from session ✅
- `src/app/api/vendor/packages/[id]/route.ts:33-46` — verifies `pkg.vendorId === vendor.id` ✅
- `src/app/api/vendor/templates/[id]/route.ts:36-37` — verifies `tpl.userId === user.id` ✅
- `src/app/api/upload/avatar/route.ts` — filename keyed by `session.user.id` ✅
- `src/app/api/bookings/route.ts:33-37` — `workspace.userId !== session.user.id` → 403 ✅
- `src/app/api/prestataires/interest/route.ts:28+` — verifies planner ownership ✅
- `src/app/api/admin/event-sites/[id]/mod-status/route.ts:21-22` — `isAdminUser` check ✅
- `src/app/api/admin/migrate/route.ts:18-20` — admin email gate ✅

**No-auth routes (intentional, must remain):**
- Auth flow: `auth/forgot-password`, `auth/logout`, `auth/register`, `auth/resend-verification`, `auth/reset-password`, `auth/verify-email`, `auth/[...nextauth]` — auth bootstraps, OK
- Public read: `vendors`, `vendors/counts`, `vendor/[slug]/calendar`, `health` — public data, OK
- Public submit: `contact` (rate-limited 5/10min), `waitlist`, `track` (rate-limited 60/min), `unlock` (preview key), `public/evt/[slug]/rsvp` (deduped+rate-limited) — gated by rate-limit + Turnstile where appropriate
- Dev: `dev-login` (404 in prod via NODE_ENV check)

**Outstanding IDOR-adjacent risk:**
- `src/app/api/checkout/upgrade/route.ts:63` — `// TODO (phase paiement) : brancher CMI ou PayPal ici.` — payment provider not wired; checkout currently returns 501. **DO NOT SHIP payment without webhook signature verification + idempotency keys + plan-state writes inside DB transaction.**

**Dev bypass exposure risk:**
- `src/app/api/dev-login/route.ts` — gated `NODE_ENV !== "development"` → 404, OK
- `src/app/api/dev/switch-role/route.ts:14-16` — gated `production AND not preview` (allows preview env). Verify Vercel preview is not publicly indexed/linked, and the gate is `email === DEV_OWNER_EMAIL` ✅
- `src/app/api/dev/switch-plan/route.ts` — same pattern, verify
- Risk: If DEV_OWNER_EMAIL session is hijacked on a preview branch, attacker can promote/demote roles
- Fix: Add audit log for all switch-role / switch-plan calls (`adminAudit.ts`)

**Email verification soft-gate:**
- Issue: `src/lib/auth.ts:104` — login is allowed even when `emailVerified === null`. Banner shown via `EmailVerificationBanner.tsx`.
- Files: `src/lib/auth.ts:104`
- Impact: An attacker registering with a victim's email can browse the full app (until victim notices the verification email). Combined with `allowDangerousEmailAccountLinking`, this is an account-takeover vector.
- Fix approach: Block sensitive actions (payment, data export, vendor contact) until `emailVerified !== null`. Soft-gate is fine for browsing.

**HTML escaping in email templates:**
- `src/lib/email.ts:18-25` — `escapeHtml()` defined and used (CR-01 fix). ✅

**XSS sanitization in messages:**
- `src/app/api/messages/route.ts:7-16` — `sanitize()` strips `<script>`, all tags, AND decoded numeric entities (WR-005). ✅

**CSP:**
- Strict default with `frame-ancestors 'none'` ✅
- Override for `/evt/preview/:path*` to `SAMEORIGIN` (necessary for owner preview iframe) ✅
- `script-src 'unsafe-inline'` — required for Next.js inline scripts; justified
- `script-src 'unsafe-eval'` enabled in DEV only ✅

## Performance Bottlenecks

**N+1 in vendor list:**
- `src/app/api/vendors/route.ts:25+` — fetches ALL matching vendors, scores in memory, paginates after. With 1000+ vendors, this loads the full set every public list request.
- Files: `src/app/api/vendors/route.ts`
- Impact: With `~1000` rows the in-memory ranking is fine, but at 5000+ vendors page latency degrades linearly. Also no caching.
- Fix approach: Pre-compute ranking score in DB column (`Vendor.rankingScore`) on cron + on vendor update; sort by indexed column. Cache list response by category/region in Upstash for 5min.

**Image loading on /explore:**
- Issue: Per CLAUDE.md "photos explore = images génériques, pas les vrais vendors"
- Files: `src/app/explore/`, `src/components/ExploreMap.tsx`
- Impact: Visual amateurism, marketing risk
- Fix approach: Connect to `VendorMedia` records; fall back to category-typed Unsplash placeholder only if zero media.

**Dashboard hydration round-trip:**
- `src/app/dashboard/page.tsx` — fetches initial planners RSC-side, then `DashboardClient` fires GET `/api/planners/[id]/dashboard-data` client-side
- Impact: Visible flash before widgets populate (~200-500ms over 4G)
- Fix approach: Inline `dashboard-data` into the RSC fetch (`Promise.all` in `page.tsx`) and pass to client as initial prop. Avoid unnecessary client-side waterfall.

## Hardcoded Hex Color Violations (Brand-Consistency Rule)

**ACTIVE files violating `brand-consistency.md` (must replace with `var(--g1)`, `var(--g2)`, `var(--dash-*)` tokens):**

- `src/components/BudgetChart.tsx:17` — `lieu: "#C4532A"` (chart segment color)
- `src/components/DarkModeToggle.tsx:60` — `stroke="#C4532A"` (sun icon)
- `src/components/InstagramWidget.tsx:47, 50, 52, 95, 111, 191` — multiple `#C4532A` and `#F5EDD6` (vintage Insta gallery — verify if widget is still used)
- `src/components/ExploreMap.tsx:54, 59, 79, 226, 232` — `#C4532A` for map markers + popup ratings + count text
- `src/components/PaletteSelector.tsx:6` — `{ id: "creme", color: "#F5EDD6", accent: "#C4532A" }` — palette template, OK if exposed to user as template; verify
- `src/components/FlowerHero.tsx:15` — `accent: '#fff7ed'` (terracotta lite)
- `src/lib/eventSiteTokens.ts:28-34` — `secondary: "#F5EDD6"`, `accent: "#8B4513"`, `darkText: "#F5EDD6"` — event-site palette; OK if exposed as user-selectable palette
- `src/app/dashboard/event-site/EventSiteEditor.tsx:690, 695` — `"#8B4513"` fallbacks for accent — OK as event-site template fallback
- `src/app/api/planners/[id]/dashboard-data/route.ts:9` — `lieu: "#C4532A"` in `CATEGORY_COLORS` map (server-side category color)

**EMAIL TEMPLATES (allowed exception per scope, but flag):**
- `src/lib/email.ts:28, 37, 41, 83, 121` — `#F5EDD6`, `#C4532A` — emails use sépia palette. Inconsistent with new brand. Decide: keep email-specific palette OR migrate to G gradient via inline CSS-mail-safe colors.

**LEGACY `clone/` (delete or refactor):**
- `src/components/clone/AntVideoSection.tsx:30, 151, 836, 1490, 1496, 1789, 1798` — `#C4532A`, `#F5EDD6`, `#8B4513`

**`globals.css` (CRITICAL — affects shadcn defaults globally):**
- `src/app/globals.css:55, 62, 68, 77, 91, 96, 100-101, 114, 117, 123, 129, 131-155, 440` — full sépia/terracotta token set including `--background`, `--accent`, `--primary-foreground`, `--ring`, `--sidebar-*`. **Any unbranded shadcn component renders in sépia.**

**Fix priority:** `globals.css` first (cascades), then dashboard components, then `clone/` deletion.

## Fragile Areas

**`DashboardClient.tsx` (1923 lines):**
- Files: `src/app/dashboard/DashboardClient.tsx`
- Why fragile: Single file orchestrating ~10 widgets, ~20 hooks, fetch logic, optimistic updates, modal state, swipe state. One bad render cascades everywhere.
- Safe modification: Extract widget-by-widget into `src/components/dashboard/widgets/<WidgetName>.tsx`. Each widget consumes typed props from `dashboardData`. Test each via Playwright after extraction.
- Test coverage: 3 smoke specs in `e2e/` — none target dashboard widget interactions specifically. Weak.

**IS_DEV branching pattern in API routes:**
- Files: `src/app/api/me/route.ts`, `src/app/api/unread/route.ts`, `src/app/api/budget-items/[id]/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/app/api/guests/[id]/route.ts`, `src/app/api/steps/[id]/route.ts`, `src/app/api/rsvps/[id]/route.ts`, `src/app/api/notifications/[id]/read/route.ts`
- Why fragile: Every authenticated route duplicates `if (IS_DEV) { requireSession() } else { auth() }` boilerplate. Forgetting in ONE route = broken in dev OR auth bypass risk.
- Safe modification: Extract a shared `getUserId()` helper that branches internally. Then all routes call `const userId = await getUserId(); if (!userId) return 401`.

**`src/proxy.ts` cookie-name dependency:**
- Files: `src/proxy.ts:24-26`
- Why fragile: Hardcodes `authjs.session-token` / `__Secure-authjs.session-token`. If NextAuth v5 stable changes cookie name during beta exit, proxy breaks silently.
- Safe modification: Pin `next-auth` to exact beta version `5.0.0-beta.30` until stable, then re-audit. Add E2E test for `/dashboard` redirecting unauth users to `/login`.

**`globals.css` brand-token namespace:**
- Files: `src/app/globals.css`
- Why fragile: Mix of sépia legacy + brand `--dash-*` tokens. Future shadcn-add component will inherit OLD tokens. Incoherence guaranteed.
- Safe modification: Quarantine sépia tokens under explicit `.legacy-page` class scope; promote `--dash-*` to root.

## Test Coverage Gaps

**Zero unit tests:**
- What's not tested: Validation schemas (`validations.ts`), business logic (`completionScore.ts`, `rankingScore.ts`, `rsvpDedup.ts`), helpers (`vendorQueries.ts`, `geocode.ts`)
- Files: `src/lib/*` (all)
- Risk: Business logic regressions invisible until E2E or production
- Priority: HIGH — set up Vitest before adding new logic

**Smoke E2E only:**
- What's tested: 3 specs in `e2e/` — public smoke, auth smoke, API smoke
- What's NOT tested: dashboard widget mutations, vendor dashboard editor, event-site publish flow, paywall enforcement, admin moderator actions, swipe→contact gate
- Risk: Widget regressions (already happened — bug `853ec54` shipped to prod)
- Priority: HIGH — add at minimum: (a) full dashboard load + widget read happy-path, (b) IDOR negative test on every mutating route, (c) event-site publish + RSVP roundtrip

## Scaling Limits

**Vendor list in-memory ranking:**
- Current capacity: ~1000 vendors loaded per request
- Limit: ~5000 vendors before noticeable latency on `/api/vendors`
- Scaling path: DB-side ranking column + index, refresh on schedule

**Dashboard data single round-trip:**
- Current capacity: All planners + workspace data per user, fetched in one shot
- Limit: User with many events / 1000s of guests / many tasks → single response can exceed payload sweet spot
- Scaling path: Paginate guests/tasks within `dashboard-data` response; use Suspense + streaming

**Upstash Redis free tier limits:**
- Current capacity: 10K commands/day on free
- Limit: At 60 req/min/IP for `/api/track` + Login rate limit + Vendor list rate limit, busy launch day could blow through quota
- Scaling path: Upgrade to Upstash Pay-as-you-go before launch. Monitor.

**Vercel Hobby tier function execution:**
- Current capacity: 10s function timeout on Hobby
- Limit: Long Anthropic AI generation (`/api/ai/suggest`) could exceed
- Scaling path: Confirm Vercel project tier; upgrade to Pro for 300s timeout if needed.

## Dependencies at Risk

**`xlsx` 0.18.5:**
- Risk: Known prototype-pollution CVE (GHSA-4r6h-8v6p-xvw6) — patched in 0.19.3+
- Impact: Guest list export (`src/app/api/planners/[id]/guests/export/route.ts`) parses user-influenced data → POTENTIAL exploit if attacker uploads crafted xlsx (verify if route accepts uploads OR only generates)
- Migration plan: Upgrade to `xlsx-js-style` or `exceljs`; SheetJS team has moved off npm.

**`next-auth@5.0.0-beta.30`:**
- Risk: Beta API surface; breaking changes possible before stable v5
- Impact: Auth flow regression
- Migration plan: Pin to exact version, watch release notes, test full login flow on each minor bump

**`@anthropic-ai/sdk@0.85.0`:**
- Risk: Pre-1.0 SDK; API may break
- Impact: AI suggest endpoint regression
- Migration plan: Pin exact version

**`shadcn@4.2.0` + `@base-ui/react@1.3.0`:**
- Risk: base-ui still pre-2.0; shadcn ecosystem evolving
- Impact: Component API shifts on upgrade
- Migration plan: Lock versions until launch + 1 month

## Missing Critical Features (per CLAUDE.md "Problèmes connus")

**Dashboard invisible to new visitors:**
- Problem: Soft-gate / onboarding parcours v2 in progress
- Blocks: Conversion funnel from /explore → signup → first action

**Explore 100% public, zero email capture:**
- Problem: No gate for unauthenticated browsing
- Blocks: Lead generation; entire marketplace discovery is anonymous

**Photos /explore are generic (not real vendors):**
- Problem: VendorMedia not connected to explore card thumbnails
- Blocks: Marketing credibility

**Dark mode flash between pages:**
- Problem: Theme init not in blocking `<head>` script
- Blocks: Visual polish; user perception of quality
- Fix: Add inline `<script>` in root `layout.tsx` reading `localStorage.theme` BEFORE first paint

**VendorSwipe widget/modal desync:**
- Problem: Per CLAUDE.md — likely state shared via two paths that drift
- Blocks: Core swipe UX

**Payment integration (CMI/PayPal):**
- Problem: `/api/checkout/upgrade` returns 501 stub
- Blocks: Pro plan monetization
- Fix: NEVER ship without idempotency + webhook signature verification + plan-state inside DB transaction

**Sentry / error monitoring:**
- Problem: Zero observability beyond `console.error`
- Blocks: Production incident detection
- Fix: Add `@sentry/nextjs` (Sentry MCP server is enabled but no SDK installed)

## Outstanding TODOs

- `src/app/(legal)/mentions-legales/page.tsx:8` — TODO_DECISION SARL info
- `src/app/(legal)/confidentialite/page.tsx:8, 9, 66, 77, 277, 299` — TODO_DECISION CNDP receipt, DPO designation, cookie banner if analytics added
- `src/app/(legal)/cgu/page.tsx:8, 312, 381` — TODO_DECISION raison sociale, contractual liability cap, jurisdiction city
- `src/app/api/checkout/upgrade/route.ts:63` — TODO payment provider integration

---

## Priority Heatmap (1-week sprint ordering)

**P0 — Security / blocking launch:**
1. Audit + fix `allowDangerousEmailAccountLinking` interaction with email-verification soft-gate (auth takeover risk)
2. Tighten email verification gate on payment / data-export / vendor-contact actions
3. Upgrade `xlsx` to safe version (or migrate to exceljs)
4. Block sensitive actions when `emailVerified === null`
5. Confirm Vercel preview environments are not publicly accessible (dev/switch-role gate)

**P1 — Brand consistency / pre-launch polish:**
6. Refactor `src/app/globals.css` — remove sépia tokens, namespace under legacy
7. Replace `#C4532A`/`#F5EDD6` hex literals in `BudgetChart.tsx`, `ExploreMap.tsx`, `DarkModeToggle.tsx`, `InstagramWidget.tsx`, `dashboard-data/route.ts`
8. Delete unused `src/components/clone/*` files
9. Fix dark mode flash via blocking head script

**P2 — Tech debt / observability:**
10. Extract `DashboardClient.tsx` widgets into per-file components
11. Extract `getUserId()` helper to dedup IS_DEV branching across 8+ routes
12. Install `@sentry/nextjs` and replace `console.error` with `Sentry.captureException`
13. Add Vitest + write unit tests for `validations.ts`, `rankingScore.ts`, `completionScore.ts`, `rsvpDedup.ts`
14. Expand E2E coverage: dashboard widget mutations, IDOR negative tests, event-site publish flow, paywall enforcement

**P3 — Cleanup:**
15. Remove `@neondatabase/serverless` + `@prisma/adapter-neon` (unused)
16. Remove `googleId @unique` field if unused
17. Decide `/accueil` semantics (public marketing vs post-login)
18. Connect VendorMedia to /explore thumbnails
19. Resolve `(legal)/*` TODO_DECISIONs (SARL, CNDP, DPO)

---

*Concerns audit: 2026-04-27*
