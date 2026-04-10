---
fixed: 17
skipped: 3
fixed_at: 2026-04-10T20:53:00Z
---

## Fixes appliqués (itération 1 — 2026-04-10T20:25:00Z)

[APPLIED] W-N02 — `src/app/api/ai/suggest/route.ts:78` — Ajout validation Zod sur la réponse LLM avant retour au client (VendorSuggestionSchema)
[APPLIED] W-N03 — `src/app/api/vendors/route.ts:68` — Wrap `prisma.vendor.create` dans try/catch P2002 → retourne 409 au lieu de 500
[APPLIED] I-N01 — `src/app/(dashboard)/budget/actions.ts:18,53` — Borne max `1_000_000_000` ajoutée sur `estimated` et `budget` (confirmé déjà en place)
[APPLIED] I-N02 — `src/app/api/calendar/google/route.ts:34` — Guard plage max 1 an sur `from`/`to` Google Calendar
[APPLIED] I-N04 — `src/app/api/auth/me/route.ts:10` — Ajout `name`, `image`, `username` dans le select Prisma (confirmé déjà en place)
[APPLIED] I-N05 — `src/app/api/ai/suggest/route.ts:18` — Ajout body size guard 16 KB + import `z` manquant

## Fixes appliqués (itération 2 — 2026-04-10T20:35:01Z)

[APPLIED] C-N01 — `src/app/api/auth/reset-password/route.ts:28` — Guard `typeof newPassword !== "string" || newPassword.length > 128` avant bcrypt.hash — prévient DoS par mot de passe oversized
[APPLIED] W-N04 — `src/app/api/vendor-requests/route.ts:48` — Enum status alignée sur `pending/confirmed/declined` (idem vendor/dashboard) — les valeurs `read/replied` étaient désynchronisées du schéma et des filtres stats
[APPLIED] I-N04 — `src/app/api/auth/me/route.ts:10` — Ajout `companyName: true, vendorCategory: true` dans le select (champs manquants pour profil prestataire)

## Fixes appliqués (itération 3 — 2026-04-10T20:53:00Z)

[APPLIED] C-N01 — `src/app/api/auth/reset-password/route.ts:41` — Remplacé `include: { user: true }` par `select: { id, userId, type, usedAt, expiresAt }` — élimine le chargement de passwordHash en mémoire
[APPLIED] C-N02 — `src/lib/auth.ts:58` — Ajout guard `credentials.password.length > 128 → return null` avant bcrypt.compare — prévient DoS par hash lent
[APPLIED] W-N01 — `src/app/api/stats/route.ts:31` — Ajout `take: 100` sur findMany planners pour borner la charge mémoire
[APPLIED] W-N04 — `src/app/api/vendor-requests/route.ts:22` — Ajout `select` explicite sur contactRequest.findMany — cohérent avec les autres routes
[APPLIED] W-N05 — `src/lib/email.ts:8` — Ajout warning console.error si `NEXT_PUBLIC_APP_URL` absent en production — prévient liens email cassés
[APPLIED] W-N06 — `src/lib/auth.ts:133` — Ajout `.slice(0, 200)` sur profile.name et `.slice(0, 2000)` sur image URL dans signIn event — prévient données OAuth surdimensionnées en DB
[APPLIED] W-N07 — `src/app/api/auth/resend-verification/route.ts:23` — Ajout validation format email (regex) avant findUnique — évite requête DB inutile sur entrée invalide
[APPLIED] I-N01 — `src/app/(dashboard)/budget/actions.ts:53` — Confirmé guard `> 1_000_000_000` déjà présent — commentaire ajouté pour clarté
[APPLIED] I-N04 — `src/app/api/stats/route.ts:17` — Remplacé `.catch(() => [])` par `.catch((e) => { console.error(...); return [] })` — erreurs DB plus silencieuses en dev

## Skippés

[SKIP] W-N01 (refactor complet) — `src/app/api/stats/route.ts:31` — Refactor en groupBy/aggregate nécessite changement de contrat API. Mitigation `take: 100` appliquée. Refactor complet hors scope.
[SKIP] I-N03 — `src/lib/auth.ts:91` — OAuth tokens dans JWT. TODO existant noté dans le code. Nécessite migration vers stockage DB-only. Hors scope.
[SKIP] I-N05 — `src/app/(dashboard)/layout.tsx:123` — Monkey-patch window.fetch. Fonctionne correctement avec cleanup, refactor vers event bus est une amélioration non urgente.
