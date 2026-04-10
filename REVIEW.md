---
status: findings
reviewed_at: 2026-04-10T21:07:50Z
critical: 2
warning: 6
info: 4
---

## Review — Momento codebase (src/)

> Scope: all .ts / .tsx under src/, excluding node_modules / .next / dist.
> Previous audit rounds (sessions 717–742) already patched many issues — only new/remaining findings listed.

---

### [CRITICAL] C01 — Access token stored in JWT, leaks if AUTH_SECRET compromised

**Fichier:** `src/lib/auth.ts:93-94`

**Probleme:** The Google OAuth `access_token` (and `refresh_token`) is persisted inside the JWT payload. If `AUTH_SECRET` leaks, all stored tokens become readable — and this app has Google Calendar read scope. The code has a self-noted TODO to migrate away from this. The calendar route already fetches the token from `prisma.account` directly, making the JWT copy redundant.

**Fix:** Remove lines 93-94 (`token.accessToken` / `token.refreshToken`) from the JWT callback. The `access_token` is already available via `prisma.account.findFirst({ where: { userId, provider: "google" } })` as the calendar route demonstrates.

---

### [CRITICAL] C02 — `verify-email` redirects built from `req.url` — Host-header open redirect

**Fichier:** `src/app/api/auth/verify-email/route.ts:9,45,46,48`

**Probleme:** `new URL("/path", req.url)` uses the request's `Host` header as the base. In environments where the `Host` header can be spoofed (non-Vercel deploys, local dev behind nginx), this allows an attacker to craft a verification link that redirects to an arbitrary origin. Same pattern in `unlock/route.ts:19,22` and `logout/route.ts:7`.

**Fix:** Use `process.env.NEXT_PUBLIC_APP_URL` as the base. Example: `new URL("/login?verified=true", process.env.NEXT_PUBLIC_APP_URL ?? req.url)`.

---

### [WARNING] W01 — `vendors/route.ts` POST: lat/lng/email/website unvalidated

**Fichier:** `src/app/api/vendors/route.ts:77-84`

**Probleme:** Admin vendor-creation accepts `lat`/`lng` as any number (including `Infinity`, `NaN`, out-of-range). `email` and `website` are stored with no format check. Bad data breaks the map UI and could cause display issues.

**Fix:** Guard `lat` ∈ [-90,90] and `lng` ∈ [-180,180] with `isFinite`. Validate `email` format. Check `website` starts with `https://`.

---

### [WARNING] W02 — `steps/[id]/vendors/route.ts`: TOCTOU race on vendor dedup

**Fichier:** `src/app/api/steps/[id]/vendors/route.ts:40-48`

**Probleme:** `findFirst` + `create` for vendor deduplication is not atomic. Two concurrent requests can both pass the `findFirst` check and create duplicate vendor rows (the slug includes `Date.now()` so no unique-constraint collision occurs on slug).

**Fix:** Catch `P2002` on `vendor.create` and do a `findFirst` retry, or replace with `upsert` if a `@@unique([name, category])` constraint is added to the schema.

---

### [WARNING] W03 — Server Actions return void on all failures — silent errors

**Fichier:** `src/app/(dashboard)/budget/actions.ts:8,35,46` / `src/app/(dashboard)/guests/actions.ts:9,31`

**Probleme:** All Server Actions return `undefined` on auth failure, ownership check failure, and validation failure. Client components cannot distinguish success from silent failure, masking security enforcement (e.g., ownership check failing looks identical to a successful no-op).

**Fix:** Return `{ ok: boolean; error?: string }` so callers can surface errors via toast or form state.

---

### [WARNING] W04 — `ai/suggest/route.ts`: hardcoded deprecated model ID

**Fichier:** `src/app/api/ai/suggest/route.ts:74`

**Probleme:** `"claude-haiku-4-5-20251001"` is a snapshot model ID that may be retired. When it is, all AI suggestions silently return `{ vendors: [] }` — the error goes to `console.error` only, no monitoring.

**Fix:** Move to env var `ANTHROPIC_MODEL` (default `"claude-haiku-4-5"`). Alert via structured logging rather than bare `console.error`.

---

### [WARNING] W05 — OAuth sign-in event writes image URL without domain allowlist

**Fichier:** `src/lib/auth.ts:141`

**Probleme:** The `signIn` event writes the provider's `image` URL to the DB (`.slice(0, 2000)`) without checking the domain. The `update-profile` route has an `ALLOWED_IMAGE_HOSTS` allowlist, but it's not applied here. A misconfigured or compromised OAuth provider could inject an arbitrary URL.

**Fix:** Extract `ALLOWED_IMAGE_HOSTS` into `src/lib/allowedImageHosts.ts` and apply it in both `update-profile/route.ts` and the `signIn` event in `auth.ts`.

---

### [WARNING] W06 — `email.ts`: localhost fallback silently sends broken verification emails in production

**Fichier:** `src/lib/email.ts:8-11`

**Probleme:** If `NEXT_PUBLIC_APP_URL` is unset in production, verification and password-reset emails are sent with `http://localhost:3000/...` links. The `console.error` warning is easy to miss and the app continues sending broken emails.

**Fix:** Throw (or return an error response) when `NODE_ENV === "production"` and `NEXT_PUBLIC_APP_URL` is not set, rather than allowing emails with localhost URLs to be dispatched.

---

### [INFO] I01 — All API routes bypass coming-soon gate by design

**Fichier:** `src/proxy.ts:5`

**Probleme:** `/api/` is entirely exempt from the coming-soon gate. Public routes (`/api/vendors`, `/api/reviews`, `/api/contact`, `/api/waitlist`) are reachable before launch. Likely intentional but undocumented.

**Fix:** Add a comment. If only waitlist should be public pre-launch, tighten the exemption to `/api/waitlist` and `/api/auth`.

---

### [INFO] I02 — `stats/route.ts`: IS_DEV mock returns hardcoded totals (44/31/60)

**Fichier:** `src/app/api/stats/route.ts:24-29`

**Probleme:** When DB is empty in dev mode, the endpoint returns fabricated totals. Masks bugs in the real stats calculation path during development.

**Fix:** Return zeros or remove the mock fallback to force real code paths in dev.

---

### [INFO] I03 — `unread/route.ts`: full MOCK_DASHBOARD_DATA imported for one field

**Fichier:** `src/app/api/unread/route.ts:4`

**Probleme:** Imports a large mock object to read `.unreadCount = 2`. Minor bundle bloat.

**Fix:** Export a dedicated `MOCK_UNREAD_COUNT = 2` constant from `devMock.ts`.

---

### [INFO] I04 — Dead code: `MOCK_SESSION` exported from `devMock.ts` but unused

**Fichier:** `src/lib/devMock.ts:10-12`

**Probleme:** `MOCK_SESSION` is defined but no file in src/ imports it (search confirms zero usages).

**Fix:** Remove the export.
