---
status: findings
reviewed_at: 2026-04-10T20:35:01Z
critical: 1
warning: 2
info: 3
---

<!-- Fixes déjà appliqués (iterations précédentes) :
     C01 (registerAction supprimé), C02, C03, W01 (image allowlist), W02, W03, W04,
     W05 (planners select+_count), W06 (stats scope), W07, W08, I01 (currentPassword cap)
     W-N02 (Zod sur LLM output — déjà appliqué), W-N03 (P2002 catch vendors — déjà appliqué),
     I-N02 (calendar range limit — déjà appliqué), I-N05 (body size guard ai/suggest — déjà appliqué)
-->

## CRITICAL

### [CRITICAL] C-N01 — reset-password/route.ts : newPassword sans cap de longueur avant bcrypt
**Fichier:** `src/app/api/auth/reset-password/route.ts:21`
**Problème:** `newPassword` est lu depuis `req.json()` sans vérification de longueur max avant `bcrypt.hash()`. Un attaquant peut envoyer un payload de plusieurs Mo provoquant un spike CPU (DoS). Le guard identique existe déjà dans `change-password/route.ts:34` mais est absent ici.
**Fix:** Ajouter `if (typeof newPassword !== "string" || newPassword.length > 128)` avant le test regex.

---

## WARNING

### [WARNING] W-N01 — stats/route.ts : N+1 — include hiérarchique non paginé
**Fichier:** `src/app/api/stats/route.ts:31-36`
**Problème:** `prisma.planner.findMany` avec `include: { steps: { include: { vendors: ... } } }` charge toute la hiérarchie en mémoire — O(planners × steps × vendors). Pas de limite. Pour 10 planners × 20 steps × 5 vendors = 1000 rows par requête stats.
**Fix:** Remplacer par des requêtes `groupBy`/`aggregate` ciblées ou ajouter un `take` et revalidation par tag.

---

### [WARNING] W-N04 — vendor-requests vs vendor/dashboard : valeurs `status` incohérentes
**Fichier:** `src/app/api/vendor-requests/route.ts:48` vs `src/app/api/vendor/dashboard/route.ts:99`
**Problème:** `vendor-requests` accepte `pending/read/replied`; `vendor/dashboard` accepte `pending/confirmed/declined`. Les deux routes écrivent `ContactRequest.status` (String sans enum) avec des sets de valeurs incompatibles. Les filtres de la dashboard (`status === "pending"`, `"confirmed"`) ne matcheront jamais les enregistrements créés via vendor-requests (`read`, `replied`).
**Fix:** Unifier sur `pending/confirmed/declined` (valeurs utilisées dans les stats dashboard) et mettre à jour vendor-requests.

---

## INFO

### [INFO] I-N01 — budget/actions.ts : `estimated` accepte valeurs > 1 milliard
**Fichier:** `src/app/(dashboard)/budget/actions.ts:18`
**Problème:** `parseFloat(...)` sans borne max — accepte `1e308`. Peut provoquer des affichages aberrants.
**Fix:** `|| estimated > 1_000_000_000` dans le guard — déjà présent ligne 18, vérifier `updateBudget` ligne 53 également (manquant).

---

### [INFO] I-N03 — auth.ts : accessToken/refreshToken OAuth dans le JWT
**Fichier:** `src/lib/auth.ts:91-92`
**Problème:** TODO déjà noté en commentaire. Les tokens Google OAuth sont dans le JWT signé — si `AUTH_SECRET` fuit, les tokens OAuth sont exposés.
**Fix:** Migrer vers stockage exclusivement DB via `prisma.account` (TODO existant à prioriser en v2).

---

### [INFO] I-N04 — auth/me/route.ts : champs `name`, `image`, `username` absents du select
**Fichier:** `src/app/api/auth/me/route.ts:10-21`
**Problème:** Le `select` retourne `id, email, role, firstName, lastName, phone, location` mais omet `name`, `image`, `username`. Les composants consommant `/api/auth/me` pour l'avatar/nom complet reçoivent `undefined` silencieusement.
**Fix:** Ajouter `name: true, image: true, username: true` dans le `select`.
