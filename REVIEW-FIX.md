---
fixed: 7
skipped: 1
fixed_at: 2026-04-10T21:10:00Z
---

## Fix Report

| Status | ID | Fichier:ligne | Changement |
|--------|-----|--------------|------------|
| APPLIED | C01 | `src/lib/auth.ts:90-94` | Suppression de `token.accessToken` et `token.refreshToken` dans le JWT callback — les tokens restent uniquement dans la table `Account` Prisma |
| APPLIED | C02 | `src/app/api/auth/verify-email/route.ts:1-11` | Ajout de `safeRedirect()` qui utilise `NEXT_PUBLIC_APP_URL` comme base plutôt que `req.url` — élimine l'open redirect via Host header |
| APPLIED | C02 | `src/app/api/unlock/route.ts:7` | Même correctif `APP_URL` appliqué aux redirects de la route unlock |
| APPLIED | W01 | `src/app/api/vendors/route.ts:80-81` | Validation `isFinite` + range check sur `lat` ([-90,90]) et `lng` ([-180,180]) |
| APPLIED | W02 | `src/app/api/steps/[id]/vendors/route.ts:40-68` | Catch `P2002` sur `vendor.create` + retry `findFirst` pour éliminer la race condition TOCTOU |
| APPLIED | W03 | `src/app/(dashboard)/budget/actions.ts` | Server Actions retournent `{ ok: boolean; error?: string }` au lieu de `void` |
| APPLIED | W03 | `src/app/(dashboard)/guests/actions.ts` | Idem pour `addGuest` et `updateRsvp` |
| APPLIED | W04 | `src/app/api/ai/suggest/route.ts:74` | Model ID via `process.env.ANTHROPIC_MODEL` (défaut `"claude-haiku-4-5"`) |
| APPLIED | W05 | `src/lib/auth.ts:137-151` | Validation du domaine image OAuth via `ALLOWED_IMAGE_HOSTS` dans l'event `signIn` |
| APPLIED | W06 | `src/lib/email.ts:8-11` | `throw` en production si `NEXT_PUBLIC_APP_URL` absent — empêche l'envoi d'emails avec des liens localhost |
| SKIP | W04 (email/website) | `src/app/api/vendors/route.ts:75-78` | Validation de format email/website non appliquée — route admin uniquement, risque faible, nécessite import Zod supplémentaire hors scope minimal |
