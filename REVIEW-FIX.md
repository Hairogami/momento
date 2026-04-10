---
fixed: 13
skipped: 5
fixed_at: 2026-04-10T17:10:00Z
---

# REVIEW-FIX — Momento codebase

## APPLIED

[APPLIED] CR-01 — `src/lib/email.ts:50,85` — Ajout de `escapeHtml()` appliqué sur `firstName` avant interpolation dans les templates HTML email. Élimine le vecteur XSS via le champ prénom.

[APPLIED] CR-02 — `src/app/api/vendor/claim/route.ts:44` — Ajout d'un check `vendorProfile.findUnique({ where: { slug } })` avant la transaction pour retourner un 409 propre au lieu d'un 500 sur race condition.

[APPLIED] CR-03 — `src/lib/rateLimiter.ts:98` — `getIp()` retourne désormais `string | null` au lieu de `"unknown"`. Les appelants qui utilisent `null` comme clé de rate-limit partagée sont protégés. Vendor claim route mise à jour pour refuser si `ip === null`.

[APPLIED] CR-04 — `src/app/api/workspace/route.ts:78` — `neededCategories` filtre maintenant les éléments non-string, tronque chaque item à 100 chars, et limite à 50 éléments max avant `JSON.stringify`.

[APPLIED] WR-01 — `src/app/api/planners/route.ts:57` et `src/app/api/planners/[id]/route.ts:56` — `parseBudget()` remplace `parseFloat` direct : rejette `NaN`, `Infinity` et valeurs négatives.

[APPLIED] WR-02 — `src/app/api/planners/[id]/events/route.ts:33` — Validation de `body.title` : type check + trim + slice(0,200) + rejet si vide avec 400.

[APPLIED] WR-03 — `src/app/api/planners/[id]/steps/route.ts:21` — Validation de `body.title` et `body.description` avec guards de type et troncature.

[APPLIED] WR-04 — `src/app/api/planners/[id]/events/route.ts:38` — `body.color` validé contre `/^#[0-9a-fA-F]{6}$/`, fallback sur `#f9a8d4` si invalide.

[APPLIED] WR-05 — `src/app/api/steps/[id]/vendors/route.ts:34` — Slug généré avec `normalize("NFKD")` pour supprimer diacritiques + suffixe `Date.now().toString(36)` pour éviter les collisions sur noms non-ASCII.

[APPLIED] WR-06 — `src/app/api/unread/route.ts:7` — Auth check déplacé avant le block `IS_DEV`. Le mock ne peut plus être servi sans session valide.

[APPLIED] WR-08 — `src/app/api/auth/reset-password/route.ts:7` — Validation `typeof token !== "string" || token.length > 200` ajoutée avant la requête DB.

[APPLIED] WR-09 — `src/app/api/vendors/route.ts:9` — Limite max réduite de 1000 à 50 sur l'endpoint public. Passage à `req.nextUrl.searchParams` pour compatibilité Next.js.

[APPLIED] IN-01 — `src/app/api/steps/[id]/vendors/route.ts:5` — Paramètre `userId` mort supprimé de la signature de `getOwnedStep`.

## SKIPPED

[SKIP] WR-07 — `src/app/api/messages/route.ts:7` — Le sanitizer regex HTML est insuffisant mais le fix correct est côté frontend (ne pas utiliser `innerHTML` pour rendre les messages). Pas de modification serveur sans vérifier le composant `MessageThread` — risque de casser le comportement existant.

[SKIP] IN-02 — `src/app/(dashboard)/layout.tsx:123` — Monkey-patch `window.fetch`. Fix structurel (contexte React) trop invasif pour un fix minimal automatique.

[SKIP] IN-03 — Multiples routes — `console.error` en production. Pas critique, refactoring transversal hors scope fix minimal.

[SKIP] IN-04 — `src/lib/auth.ts:13` — `IS_DEV` dupliqué. Refactoring cosmétique, hors scope.

[SKIP] IN-05 — `src/app/api/auth/logout/route.ts:6` — Comportement GET→307 ambigu. Non critique, hors scope fix minimal.
