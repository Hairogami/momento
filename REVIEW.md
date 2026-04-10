---
status: findings
reviewed_at: 2026-04-10T20:05:01Z
critical: 1
warning: 3
info: 4
---

<!-- Fixes déjà appliqués (iterations précédentes) : C02, C03, W02, W03, W04, W07, W08 -->

## CRITICAL

### [CRITICAL] C01 — registerAction : création de comptes sans rate-limit ni vérification email
**Fichier:** `src/app/(auth)/login/actions.ts:6-39`
**Problème:** Ce Server Action crée des comptes bcrypt sans rate-limiting, sans envoi d'email de vérification, et sans token `emailVerification`. L'user créé ne peut jamais se connecter (auth.ts bloque `!emailVerified`) mais des milliers de comptes zombies peuvent être créés en boucle. Doublon non sécurisé de `/api/auth/register`.
**Fix:** Supprimer `registerAction` et faire appeler `/api/auth/register` directement depuis les composants client.

---

## WARNING

### [WARNING] W01 — update-profile : URL image sans allowlist domaine (SSRF indirect)
**Fichier:** `src/app/api/auth/update-profile/route.ts:26-36`
**Problème:** Validation protocole uniquement (`http:`/`https:`). N'importe quelle URL externe peut être stockée. Si `next/image` optimise cette URL côté serveur sans `remotePatterns` restreint, cela constitue un SSRF indirect. Permet aussi le stockage de tracking pixels.
**Fix:** Restreindre à une allowlist de domaines connus (`*.googleusercontent.com`, `*.fbcdn.net`, CDN propre) cohérente avec `remotePatterns` dans `next.config.ts`.

---

### [WARNING] W05 — planners GET liste : N+1 avec include steps + events complets
**Fichier:** `src/app/api/planners/route.ts:27-31`
**Problème:** `findMany` avec `include: { steps: true, events: true }` charge toutes les étapes et tous les événements pour une simple liste. Pour 20 planners × 50 steps = 1000 rows chargées inutilement.
**Fix:** Remplacer par `select` limité aux champs d'affichage + `_count: { select: { steps: true, events: true } }`.

---

### [WARNING] W06 — stats GET : N+1 massif planners→steps→vendors sans cache
**Fichier:** `src/app/api/stats/route.ts:31-36`
**Problème:** `findMany` avec `include: { steps: { include: { vendors: {...} } } }` charge toute la hiérarchie à chaque appel. Dégradation O(n) avec le nombre de planners/steps. Pas de cache.
**Fix:** Remplacer par des requêtes `aggregate`/`groupBy` Prisma ciblées, ou mettre en cache avec `unstable_cache` / revalidation.

---

## INFO

### [INFO] I01 — change-password : currentPassword sans borne de longueur avant bcrypt.compare (DoS)
**Fichier:** `src/app/api/auth/change-password/route.ts:52`
**Problème:** `newPassword` est borné à 128 chars (ligne 26) mais `currentPassword` est passé directement à `bcrypt.compare()` sans vérification de longueur. Un attaquant authentifié peut envoyer plusieurs Mo, bloquant le thread.
**Fix:** Ajouter `if (typeof currentPassword !== "string" || currentPassword.length > 128) return 400` avant le `bcrypt.compare`.

---

### [INFO] I02 — vendor-requests PATCH : statuts incohérents avec vendor/dashboard PATCH
**Fichier:** `src/app/api/vendor-requests/route.ts:48` vs `src/app/api/vendor/dashboard/route.ts:99`
**Problème:** `/api/vendor-requests` accepte `["pending", "read", "replied"]` ; `/api/vendor/dashboard` accepte `["pending", "confirmed", "declined"]`. Les deux routes écrivent `ContactRequest.status` sans contrainte Prisma enum — des valeurs contradictoires coexistent en DB.
**Fix:** Aligner sur un seul ensemble de valeurs valides ou créer un enum Prisma `ContactStatus`.

---

### [INFO] I03 — registerAction : dead code — doublon non-sécurisé de /api/auth/register
**Fichier:** `src/app/(auth)/login/actions.ts`
**Problème:** `/api/auth/register/route.ts` est complet (Zod, rate-limit, email vérification, welcome email). Ce Server Action est un doublon moins sécurisé. Si les deux sont utilisés, comportement incohérent.
**Fix:** Supprimer `registerAction` (même fix que C01).

---

### [INFO] I04 — getIp() : fallback x-real-ip falsifiable côté client
**Fichier:** `src/lib/rateLimiter.ts:102-105`
**Problème:** `x-real-ip` peut être injecté par un client sur certaines configs reverse-proxy. `x-vercel-forwarded-for` (prioritaire) est sûr sur Vercel, mais le fallback `x-real-ip` peut être falsifié pour contourner le rate-limit sur d'autres infras.
**Fix:** Supprimer le fallback `x-real-ip` et documenter que seul Vercel est supporté, ou ajouter un guard `process.env.VERCEL === "1"` avant de l'accepter.
