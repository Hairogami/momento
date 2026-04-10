---
status: findings
reviewed_at: 2026-04-10T19:36:00Z
critical: 3
warning: 9
info: 5
---

## CRITICAL

### [CRITICAL] C01 — registerAction Server Action sans rate-limit ni email de vérification
**Fichier:** `src/app/(auth)/login/actions.ts:6-38`
**Problème:** `registerAction` est un Server Action qui crée des comptes sans rate-limiting (contrairement à `/api/auth/register`), sans envoi d'email de vérification, et sans token `emailVerification`. L'user créé ne peut jamais se connecter (auth.ts bloque si `!emailVerified`) mais des milliers de comptes zombies peuvent être créés en boucle. Doublon non-sécurisé de la route API.
**Fix:** Supprimer `registerAction` et appeler `/api/auth/register` depuis le frontend, ou ajouter rate-limit via `headers()` + création du token de vérification + envoi email.

---

### [CRITICAL] C02 — forgot-password : guard null-IP retourne HTTP 200 sans blocage
**Fichier:** `src/app/api/auth/forgot-password/route.ts:9-12`
**Problème:** `if (!ip)` retourne `NextResponse.json({ message: "..." })` sans status code — default 200. L'endpoint continue à servir sans rate-limit pour les requêtes sans IP (proxies, Cloudflare, tests). Incohérent avec toutes les autres routes qui retournent 400.
**Fix:** Ajouter `{ status: 400 }` au `NextResponse.json` dans le guard null-IP.

---

### [CRITICAL] C03 — registerAction révèle l'existence d'un email (énumération)
**Fichier:** `src/app/(auth)/login/actions.ts:27-29`
**Problème:** Retourne `"Un compte existe déjà avec cet email."` en clair — permet d'énumérer quels emails sont enregistrés. Les routes API (`/api/auth/register`) gèrent cela correctement avec un 409 standard mais ce Server Action expose l'info directement au client sans protection.
**Fix:** Retourner un message générique ou supprimer ce Server Action au profit de la route API.

---

## WARNING

### [WARNING] W01 — update-profile : URLs image sans allowlist de domaines (SSRF indirect)
**Fichier:** `src/app/api/auth/update-profile/route.ts:26-36`
**Problème:** Validation uniquement sur le protocole (`http:`/`https:`). N'importe quelle URL externe peut être stockée comme avatar. Si `next/image` optimise cette URL côté serveur (remotePatterns), cela constitue un SSRF indirect. Permet aussi des tracking pixels.
**Fix:** Valider que le domaine de l'URL est dans une allowlist (ex: `*.googleusercontent.com`, `*.fbcdn.net`, propre CDN) cohérente avec `remotePatterns` dans `next.config.ts`.

---

### [WARNING] W02 — reviews POST : race condition check-then-create sans try/catch P2002
**Fichier:** `src/app/api/reviews/route.ts:73-89`
**Problème:** `findUnique` vérifiant l'unicité puis `create` ne sont pas atomiques. Deux requêtes concurrentes peuvent toutes deux passer le check. La contrainte `@@unique` DB catch le second en P2002 mais ce code n'attrape pas P2002 → retourne un 500 non géré.
**Fix:** Entourer le `prisma.review.create` dans un try/catch qui intercepte `P2002` et retourne 409.

---

### [WARNING] W03 — vendors GET public : retourne tous les champs sans select (email, phone, coordonnées GPS)
**Fichier:** `src/app/api/vendors/route.ts:24-30`
**Problème:** `prisma.vendor.findMany` sans `select` expose `email`, `phone`, `lat`, `lng` à des requêtes non-authentifiées. Scraping trivial de toutes les données de contact en quelques requêtes paginées.
**Fix:** Ajouter un `select` explicite qui exclut `email`, `phone`, `lat`, `lng` pour cet endpoint public.

---

### [WARNING] W04 — change-password : pas de longueur max sur newPassword
**Fichier:** `src/app/api/auth/change-password/route.ts:19-30`
**Problème:** Seule la regex de complexité est vérifiée. Un mot de passe de plusieurs centaines de KB serait chargé en mémoire JSON puis bcrypt-haché (bcrypt tronque à 72 bytes mais le parsing charge tout). Vecteur de DoS bas débit.
**Fix:** Ajouter `if (newPassword.length > 128) return 400` avant la regex.

---

### [WARNING] W05 — planners GET liste : N+1 avec include steps + events complets
**Fichier:** `src/app/api/planners/route.ts:26-31`
**Problème:** `findMany` avec `include: { steps: true, events: true }` charge toutes les steps (avec vendors) et tous les events pour afficher une simple liste de planners. Pour un user avec 20 planners × 50 steps = 1000 rows + joins.
**Fix:** Pour la liste, utiliser `select` limité aux champs d'affichage (`id`, `title`, `coupleNames`, `weddingDate`, `coverColor`, `location`) + `_count` pour les steps/events.

---

### [WARNING] W06 — stats GET : N+1 massif avec vendors nestés sur tous les planners
**Fichier:** `src/app/api/stats/route.ts:31-36`
**Problème:** `findMany` avec `include: { steps: { include: { vendors: { select: { vendor... } } } } }` charge l'intégralité de la hiérarchie planner→step→vendor à chaque appel. Pas de cache ni pagination. Dégradation linéaire avec le nombre de planners/steps.
**Fix:** Remplacer par des requêtes `groupBy` ou `aggregate` Prisma ciblées, ou mettre en cache le résultat avec revalidation.

---

### [WARNING] W07 — messages GET conversationId : charge le user complet depuis DB (pas de select)
**Fichier:** `src/app/api/messages/[conversationId]/route.ts:22`
**Problème:** `prisma.user.findUnique({ where: { id: session.user.id } })` sans `select` — retourne tous les champs user incluant `passwordHash`, `googleId`, etc. en mémoire. Risque de data leak si le retour est mal utilisé.
**Fix:** Ajouter `select: { vendorSlug: true }` pour limiter au seul champ nécessaire.

---

### [WARNING] W08 — calendar/google : accessToken lu depuis session.user (jamais disponible, feature cassée)
**Fichier:** `src/app/api/calendar/google/route.ts:13`
**Problème:** `(session.user as { accessToken?: string }).accessToken` est toujours `undefined` car le callback `session` dans `auth.ts` n'expose pas `accessToken` intentionnellement (ligne 124 : "accessToken intentionally NOT exposed to client"). La route retourne systématiquement 501 en production — feature complètement non-fonctionnelle.
**Fix:** Implémenter la récupération depuis `prisma.account` : `findFirst({ where: { userId, provider: "google" }, select: { access_token: true } })`.

---

### [WARNING] W09 — vendor-requests PATCH : status enum non-typé stocké directement
**Fichier:** `src/app/api/vendor-requests/route.ts:48-57`
**Problème:** `status as string` est passé directement à `prisma.contactRequest.update`. Bien que validé contre un tableau `["pending", "read", "replied"]`, l'absence de cast enum Prisma peut causer des erreurs runtime si le schéma change. Pas de type safety.
**Fix:** Utiliser un type Prisma enum ou cast explicite vers le type généré.

---

## INFO

### [INFO] I01 — Dead code : registerAction doublon non-sécurisé de /api/auth/register
**Fichier:** `src/app/(auth)/login/actions.ts`
**Problème:** `/api/auth/register/route.ts` est complet (Zod, rate-limit, bcrypt, email vérification, welcome email). `registerAction` est un doublon moins sécurisé. Si le frontend utilise les deux, comportement incohérent.
**Fix:** Supprimer `registerAction`, utiliser fetch vers `/api/auth/register` depuis les composants client.

---

### [INFO] I02 — devMock importé dans 3 routes de production (bundle size)
**Fichier:** `src/app/api/planners/route.ts`, `src/app/api/stats/route.ts`, `src/app/api/unread/route.ts`
**Problème:** `IS_DEV` et `MOCK_DASHBOARD_DATA` sont importés et bundlés en production même si non exécutés. Augmente légèrement la taille du bundle serveur.
**Fix:** Guard avec `if (process.env.NODE_ENV === 'development')` inline pour tree-shaking, ou séparer dans un module `*.dev.ts` non-importé en prod.

---

### [INFO] I03 — vendors POST admin : email et website sans validation de format
**Fichier:** `src/app/api/vendors/route.ts:62-63`
**Problème:** `email` et `website` sont stockés comme strings bruts (slice seul) sans validation email ou URL. Contrairement au reste du codebase qui utilise Zod.
**Fix:** Ajouter `z.string().email()` et `z.string().url()` dans un schema Zod pour cette route admin.

---

### [INFO] I04 — logout wrapper : CSRF token non forwardé vers NextAuth signout
**Fichier:** `src/app/api/auth/logout/route.ts`
**Problème:** Redirige en 303 vers `/api/auth/signout` sans le CSRF token NextAuth. En mode JWT, NextAuth vérifie le CSRF lors du signout POST — la redirection peut échouer silencieusement.
**Fix:** Utiliser `signOut()` côté client via le hook NextAuth, ou supprimer ce wrapper.

---

### [INFO] I05 — getIp() : x-real-ip falsifiable par le client (pas de fallback cf-connecting-ip)
**Fichier:** `src/lib/rateLimiter.ts:100-106`
**Problème:** `x-real-ip` peut être injecté par un client malveillant sur certaines configs reverse-proxy. `x-vercel-forwarded-for` est prioritaire (correct sur Vercel) mais si ce header est absent, `x-real-ip` prend le relais et peut être falsifié pour contourner le rate-limit.
**Fix:** Sur Vercel, `x-vercel-forwarded-for` suffit. Supprimer le fallback `x-real-ip` ou documenter que seul Vercel est supporté.
