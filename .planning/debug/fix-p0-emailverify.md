# P0 — Hard-gate sensitive actions behind email verification

**Date** : 2026-04-27
**Branch** : `claude/unruffled-wright-6c6cea`
**Goal** : refuser les actions sensibles (paiement, messagerie, upload, export) tant que `User.emailVerified === null`, en complément du soft-gate (bannière) déjà en place.

## Helper ajouté

**`src/lib/auth-guards.ts`** — nouveau fichier.

Exporte `requireVerifiedEmail(userId: string): Promise<NextResponse | null>`.

- En `IS_DEV` (local hors Vercel — `process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"`) → bypass complet, retourne `null`. Aucun impact tests/dev.
- En prod → `prisma.user.findUnique({ where: { id }, select: { emailVerified: true } })` :
  - User introuvable → 404
  - `emailVerified === null` → **403** avec `{ error: "Email verification required", code: "EMAIL_NOT_VERIFIED" }`
  - sinon → `null` (caller continue)

Pattern d'usage dans une route API :

```ts
const session = await auth()
if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
const verifyGate = await requireVerifiedEmail(session.user.id)
if (verifyGate) return verifyGate
// ...suite de la route
```

Différent de `requireAuth.ts` / `requirePro.ts` qui sont conçus pour Server Components et font `redirect(...)`. Ici on retourne un JSON consommable côté client (route API).

## Routes modifiées

| # | Fichier | Verbe | Position du gate |
|---|---------|-------|------------------|
| 1 | `src/app/api/checkout/upgrade/route.ts` | POST | après check session, avant parse body |
| 2 | `src/app/api/messages/route.ts` | POST | après check session, avant parse body (rate-limit reste appliqué en amont) |
| 3 | `src/app/api/upload/avatar/route.ts` | POST | après check session, avant `formData()` |
| 4 | `src/app/api/planners/[id]/guests/export/route.ts` | GET | dans la branche prod (après résolution `userId`), pas dans la branche `IS_DEV` |

## Routes inspectées mais non modifiées

- `src/app/api/conversations/route.ts` — **n'existe pas**. La création de conversation se fait via POST `/api/messages` (route #2 ci-dessus, qui upsert la conversation). Gate déjà appliqué.
- `src/app/api/vendor/contact/route.ts` — **n'existe pas**. Le flux "contact vendor" passe aussi par POST `/api/messages`.

## IS_DEV preserved

- Le helper `requireVerifiedEmail` retourne `null` en `IS_DEV` → aucune régression locale.
- La route `guests/export` a déjà une branche `IS_DEV` séparée (utilise `requireSession` du `devAuth.ts`) ; le gate n'a été ajouté qu'à la branche prod pour cohérence.

## Vérifications

- `npx tsc --noEmit` : OK (pas de régression TS).
- IDOR : inchangé — chaque route conserve son filtrage par `userId` / ownership planner.

## Suite

Le frontend (bannière + UI client) n'a pas été touché. La bannière `EmailVerificationBanner` continue d'inviter l'user à vérifier ; en cas d'action sensible avant vérif, l'API renvoie maintenant 403 + code `EMAIL_NOT_VERIFIED` que le client peut détecter pour afficher un message ciblé (à brancher quand on touchera ces UI).
