---
fixed: 9
skipped: 2
fixed_at: 2026-04-10T20:35:01Z
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

## Skippés

[SKIP] W-N01 — `src/app/api/stats/route.ts:31` — N+1 hiérarchique steps→vendors. Fix nécessite refactor Prisma en groupBy/aggregate avec changement de contrat API. Hors scope fix minimal.
[SKIP] I-N03 — `src/lib/auth.ts:91` — OAuth tokens dans JWT. TODO existant noté en commentaire. Nécessite migration vers stockage DB-only (refactor auth). Hors scope.
