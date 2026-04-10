---
status: findings
reviewed_at: 2026-04-10T20:22:00Z
critical: 0
warning: 4
info: 5
---

<!-- Fixes déjà appliqués (iterations précédentes) :
     C01 (registerAction supprimé), C02, C03, W01 (image allowlist), W02, W03, W04,
     W05 (planners select+_count), W06 (stats scope), W07, W08, I01 (currentPassword cap)
-->

## CRITICAL

_Aucun finding critique nouveau._

---

## WARNING

### [WARNING] W-N01 — stats/route.ts : N+1 massif — include hiérarchique non paginé
**Fichier:** `src/app/api/stats/route.ts:31-36`
**Problème:** `prisma.planner.findMany` avec `include: { steps: { include: { vendors: { select: { vendor: ... } } } } }` charge toute la hiérarchie en mémoire à chaque appel — O(planners × steps × vendors). Pas de limite, pas de cache. Pour un utilisateur avec 10 planners × 20 steps × 5 vendors = 1000 rows par requête.
**Fix:** Remplacer par des requêtes `groupBy`/`aggregate` ciblées, ou ajouter `unstable_cache` avec revalidation par tag.

---

### [WARNING] W-N02 — ai/suggest/route.ts : réponse LLM injectée dans JSON sans validation de structure
**Fichier:** `src/app/api/ai/suggest/route.ts:63-65`
**Problème:** `JSON.parse(text)` retourne la valeur brute du LLM directement sans valider que c'est un array, ni les types des champs. Un output LLM malformé peut propager des types inattendus au client.
**Fix:** Ajouter une validation Zod sur le résultat parsé avant de le retourner.

---

### [WARNING] W-N03 — vendors/route.ts POST : P2002 non catchée sur slug dupliqué
**Fichier:** `src/app/api/vendors/route.ts:68-83`
**Problème:** Le slug généré depuis `body.name` n'est pas vérifié pour unicité. En cas de doublon Prisma lève P2002 non catchée → 500 non géré retourné au client admin.
**Fix:** Wrapper `prisma.vendor.create` dans un try/catch P2002 → retourner 409.

---

### [WARNING] W-N04 — vendor-requests vs vendor/dashboard : enum `status` incohérente
**Fichier:** `src/app/api/vendor-requests/route.ts:48` vs `src/app/api/vendor/dashboard/route.ts:99`
**Problème:** `vendor-requests` accepte `pending/read/replied`; `vendor/dashboard` accepte `pending/confirmed/declined`. Les deux routes écrivent sur `ContactRequest.status` avec des valeurs incompatibles. L'une des deux est désynchronisée du schéma Prisma réel.
**Fix:** Vérifier l'enum dans `schema.prisma` et aligner les deux routes sur les mêmes valeurs.

---

## INFO

### [INFO] I-N01 — budget/actions.ts : `estimated` et `budget` sans borne supérieure
**Fichier:** `src/app/(dashboard)/budget/actions.ts:14,51`
**Problème:** `parseFloat(...)` accepte `1e308` — pas de borne max. Peut provoquer des affichages aberrants ou dépassements numériques.
**Fix:** Ajouter `|| estimated > 1_000_000_000` dans les guards de validation.

---

### [INFO] I-N02 — calendar/google/route.ts : plage `from`/`to` non bornée dans le temps
**Fichier:** `src/app/api/calendar/google/route.ts:31-32`
**Problème:** Dates validées comme ISO valides mais sans borne max. Un client peut demander une plage de 100 ans, générant un appel Google Calendar potentiellement coûteux.
**Fix:** Rejeter si `new Date(to).getTime() - new Date(from).getTime() > 365 * 86400_000`.

---

### [INFO] I-N03 — auth.ts : accessToken/refreshToken OAuth dans le JWT (risque si secret leak)
**Fichier:** `src/lib/auth.ts:91-92`
**Problème:** TODO déjà noté en commentaire. Les tokens Google OAuth sont dans le JWT signé — si `AUTH_SECRET` fuit, les tokens OAuth sont exposés.
**Fix:** Migrer vers stockage exclusivement DB via `prisma.account` (TODO existant à prioriser).

---

### [INFO] I-N04 — auth/me/route.ts : champs `name`, `image`, `username` absents du select
**Fichier:** `src/app/api/auth/me/route.ts:10-21`
**Problème:** Le `select` retourne `id, email, role, firstName, lastName, phone, location` mais omet `name`, `image`, `username`. Les composants qui consomment `/api/auth/me` pour l'avatar ou le nom complet reçoivent `undefined` silencieusement.
**Fix:** Ajouter `name: true, image: true, username: true` dans le `select`.

---

### [INFO] I-N05 — ai/suggest/route.ts : pas de body size guard avant `req.json()`
**Fichier:** `src/app/api/ai/suggest/route.ts:20`
**Problème:** Contrairement aux autres routes POST (messages, contact, register), cette route n'a pas de vérification `content-length` avant `req.json()`. Un payload de plusieurs Mo sera parsé avant d'être rejeté.
**Fix:** Ajouter `if (contentLength > 16_384) return 413` avant `req.json()`.
