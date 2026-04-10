---
status: findings
reviewed_at: 2026-04-10T20:50:00Z
critical: 2
warning: 5
info: 4
---

<!-- Fixes déjà appliqués (iterations précédentes) :
     C01 (registerAction supprimé), C02, C03, W01 (image allowlist), W02, W03, W04,
     W05 (planners select+_count), W06 (stats scope), W07, W08, I01 (currentPassword cap)
     W-N02 (Zod sur LLM output), W-N03 (P2002 catch vendors), W-N04 (vendor-requests status unifiés),
     I-N02 (calendar range limit), I-N05 (body size guard ai/suggest),
     C-N01 (reset-password newPassword cap — RÉSOLU ci-dessous par vérification du code actuel)
-->

## CRITICAL

### [CRITICAL] C-N01 — reset-password/route.ts : `include: { user: true }` expose passwordHash en mémoire
**Fichier:** `src/app/api/auth/reset-password/route.ts:41`
**Problème:** `prisma.emailVerification.findUnique({ where: { token }, include: { user: true } })` charge l'intégralité de l'objet `user` incluant `passwordHash`, `emailVerifications`, etc. Seul `record.userId` est utilisé ensuite. En cas de fuite mémoire ou log d'erreur, le hash du mot de passe est exposé.
**Fix:** Remplacer `include: { user: true }` par `select: { id: true, userId: true, type: true, usedAt: true, expiresAt: true }` et supprimer la référence à `record.user`.

### [CRITICAL] C-N02 — auth.ts : credentials.password sans cap longueur avant bcrypt.compare (DoS)
**Fichier:** `src/lib/auth.ts:64`
**Problème:** `bcrypt.compare(credentials.password as string, user.passwordHash)` sans vérification de longueur. Un attaquant peut envoyer un mot de passe de 1 Mo et saturer le CPU (bcrypt tronque à 72 bytes mais évalue quand même l'input complet selon l'implémentation). Le guard existe dans `change-password/route.ts:26` mais pas dans `authorize`.
**Fix:** Ajouter `if ((credentials.password as string).length > 128) return null;` avant l'appel bcrypt.compare.

---

## WARNING

### [WARNING] W-N01 — stats/route.ts : include hiérarchique non borné (N+1 mémoire)
**Fichier:** `src/app/api/stats/route.ts:31`
**Problème:** `prisma.planner.findMany` avec `include: { steps: { include: { vendors: { select: { vendor: ... } } } } }` charge la hiérarchie entière en mémoire sans limite. 10 planners × 20 steps × 5 vendors = 1000 objets par appel.
**Fix:** Ajouter `take: 100` sur le `findMany` pour borner la charge côté stats.

### [WARNING] W-N04 — vendor-requests/route.ts GET : select manquant — tous les champs retournés
**Fichier:** `src/app/api/vendor-requests/route.ts:22`
**Problème:** `prisma.contactRequest.findMany({ where: { vendorSlug: ... } })` sans `select` retourne tous les colonnes. Incohérent avec les autres routes qui utilisent toutes un `select` explicite. Expose des champs potentiellement sensibles ajoutés à la table à l'avenir.
**Fix:** Ajouter un `select` explicite avec les champs utiles au frontend.

### [WARNING] W-N05 — email.ts : APP_URL fallback localhost:3000 en production
**Fichier:** `src/lib/email.ts:8`
**Problème:** `const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"`. Si la variable n'est pas définie sur Vercel, les liens de vérification email et reset-password pointent vers localhost — les utilisateurs reçoivent des liens non fonctionnels.
**Fix:** Logger un warning explicite si `NODE_ENV === "production"` et `NEXT_PUBLIC_APP_URL` est absent.

### [WARNING] W-N06 — auth.ts signIn event : profile.name sans cap longueur avant update DB
**Fichier:** `src/lib/auth.ts:133`
**Problème:** `updates.name = profile.name as string` stocke le nom OAuth sans `.slice(0, 200)`. Un provider OAuth malicieux ou corrompu peut envoyer un nom de plusieurs Ko qui sera écrit tel quel en DB.
**Fix:** Ajouter `.slice(0, 200)` sur `profile.name` et `.slice(0, 2000)` sur l'image URL.

### [WARNING] W-N07 — resend-verification/route.ts : pas de validation format email avant findUnique
**Fichier:** `src/app/api/auth/resend-verification/route.ts:23`
**Problème:** La vérification est `rawEmail.length <= 320` mais il n'y a pas de validation de format email. Une chaîne sans `@` comme `"aaaa...320chars"` génère une requête Prisma inutile.
**Fix:** Ajouter une validation `z.string().email()` ou regex email avant le `findUnique`.

---

## INFO

### [INFO] I-N01 — budget/actions.ts : updateBudget sans borne max sur budget
**Fichier:** `src/app/(dashboard)/budget/actions.ts:53`
**Problème:** `updateBudget` vérifie `budget < 0` mais pas `budget > 1_000_000_000` (contrairement à `addBudgetItem` ligne 18 qui a le guard). Asymétrie qui laisse passer des montants aberrants.
**Fix:** Ajouter `|| budget > 1_000_000_000` au guard ligne 53.

### [INFO] I-N03 — auth.ts : accessToken/refreshToken OAuth dans le JWT
**Fichier:** `src/lib/auth.ts:91-92`
**Problème:** TODO déjà noté en commentaire dans le code. Les tokens Google OAuth sont dans le JWT signé côté client — si `AUTH_SECRET` fuit, les tokens OAuth sont exposés. Non critique car le token n'est pas forwarded à `session`, mais le risque existe si le JWT est inspecté.
**Fix:** Migrer vers stockage exclusivement DB via `prisma.account` (TODO existant, à prioriser en v2).

### [INFO] I-N04 — stats/route.ts : catch silencieux en mode IS_DEV
**Fichier:** `src/app/api/stats/route.ts:17`
**Problème:** `.catch(() => [])` avale silencieusement toutes les erreurs Prisma en dev. Un problème de connexion DB passe inaperçu.
**Fix:** `.catch((e) => { console.error("[stats] DB error:", e); return [] })`.

### [INFO] I-N05 — dashboard/layout.tsx : monkey-patch de window.fetch global
**Fichier:** `src/app/(dashboard)/layout.tsx:123`
**Problème:** Monkey-patching de `window.fetch` dans un `useEffect` est fragile — peut interférer avec SWR, React Query, ou tout autre lib. Le cleanup restore correctement `original` mais le pattern reste risqué si le composant se remonte.
**Fix:** Préférer un event bus centralisé ou un contexte React pour propager les mutations sans intercepter fetch globalement.
