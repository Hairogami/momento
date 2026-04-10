---
fixed: 6
skipped: 3
fixed_at: 2026-04-10T20:25:00Z
---

## Fixes appliqués

[APPLIED] W-N02 — `src/app/api/ai/suggest/route.ts:78` — Ajout validation Zod sur la réponse LLM avant retour au client (VendorSuggestionSchema)
[APPLIED] W-N03 — `src/app/api/vendors/route.ts:68` — Wrap `prisma.vendor.create` dans try/catch P2002 → retourne 409 au lieu de 500
[APPLIED] I-N01 — `src/app/(dashboard)/budget/actions.ts:18,53` — Borne max `1_000_000_000` ajoutée sur `estimated` et `budget`
[APPLIED] I-N02 — `src/app/api/calendar/google/route.ts:34` — Guard plage max 1 an sur `from`/`to` Google Calendar
[APPLIED] I-N04 — `src/app/api/auth/me/route.ts:10` — Ajout `name`, `image`, `username` dans le select Prisma
[APPLIED] I-N05 — `src/app/api/ai/suggest/route.ts:18` — Ajout body size guard 16 KB + import `z` manquant

## Skippés

[SKIP] W-N01 — `src/app/api/stats/route.ts:31` — N+1 hiérarchique. Fix nécessite refactor des queries Prisma en groupBy/aggregate + potentiel changement de contrat API. Hors scope fix minimal.
[SKIP] W-N04 — `src/app/api/vendor-requests/route.ts:48` — Incohérence enum status. Nécessite de vérifier le schéma Prisma et potentiellement une migration DB. Hors scope fix minimal.
[SKIP] I-N03 — `src/lib/auth.ts:91` — OAuth tokens dans JWT. TODO existant noté en commentaire. Nécessite migration vers stockage DB-only (refactor auth). Hors scope.
