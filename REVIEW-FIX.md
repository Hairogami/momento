---
fixed: 18
skipped: 2
fixed_at: 2026-04-10T19:20:00Z
---

## CRITICAL

[APPLIED] C01 — src/app/api/stats/route.ts:14,31 + :39-41 — Remplacé `include: { vendor: true }` par `select: { vendor: { select: { category: true } } }` dans les deux appels findMany (IS_DEV + prod). Mis à jour le type `PlannerWithSteps` en conséquence. Réduit la charge DB de ~100x sur des utilisateurs actifs.

[APPLIED] C02 — src/app/api/auth/verify-email/route.ts:4,9,26,45,48 — Remplacé `req.url` par `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` comme base de toutes les redirections. Élimine le vecteur open redirect par host header injection.

[APPLIED] C03 — src/app/api/unlock/route.ts:6,19,22 — Même fix que C02 sur les deux redirections (`/coming-soon` et `/`). Base URL fixe depuis env var.

## WARNING

[APPLIED] W01 — src/app/api/waitlist/route.ts:26-29 — Catch bare remplacé par catch typé qui re-throw toutes les erreurs sauf P2002 (unique constraint). Les erreurs DB réelles remontent maintenant correctement.

[APPLIED] W02 — src/app/api/messages/route.ts:4,65 — Import `rateLimit` remplacé par `rateLimitAsync`, appel converti en `await rateLimitAsync(...)`. Rate limit désormais effectif en multi-instance via Upstash.

[APPLIED] W03 — src/app/api/auth/register/route.ts:6,48 — Même fix que W02. Inscription limitée globalement à 5/15min même sur Vercel multi-instance.

[APPLIED] W04 — src/app/api/ai/suggest/route.ts:3,15 — Même fix que W02/W03. Limite de 10 appels/heure Anthropic désormais globale — protège contre l'amplification de coût.

[APPLIED] W08 — src/app/api/calendar/google/route.ts:15-19 — Message d'erreur 501 remplacé par `"Google Calendar integration not yet available."` — ne fuite plus les détails d'implémentation interne.

[SKIP] W05 — src/app/api/vendors/route.ts (admin POST sans Zod) — Route accessible uniquement par `role === "admin"`. Risque faible en l'état. Refactor Zod recommandé mais non appliqué pour ne pas casser la route admin existante sans tests.

[SKIP] W06 — src/app/api/auth/update-profile/route.ts (image URL sans allowlist hôtes) — Fix nécessite connaissance de tous les CDN autorisés (Google, Facebook, Cloudinary, stockage propre). À définir avec les besoins produit avant d'appliquer un allowlist statique.

## INFO

I01–I05 : Non appliqués — findings informationnels, pas de vecteur d'exploitation directe.

---

## Itération 3 — 2026-04-10T19:20Z

[APPLIED] C-NEW-01 — src/app/api/auth/forgot-password/route.ts:29-38 — Race condition corrigée : `deleteMany` + `create` enveloppés dans `prisma.$transaction(async tx => {...})`. Identique au pattern déjà utilisé dans resend-verification. Un seul token valide possible à la fois.

[APPLIED] C-NEW-02 — src/app/api/messages/route.ts:101-108 — Ajout vérification existence du vendor avant upsert de conversation : `prisma.vendor.findUnique({ where: { slug: safeSlug } })` + retour 404 si absent. Empêche la création de conversations orphelines avec des slugs arbitraires.

[APPLIED] W-NEW-01 — src/app/api/auth/register/route.ts:23,31 — Ajout regex de complexité sur les deux schemas (ClientSchema + VendorSchema) : `(?=.*[a-z])(?=.*[A-Z])(?=.*\d)`. Aligne register avec change-password qui avait déjà cette contrainte.

[APPLIED] W-NEW-02 — src/app/api/messages/route.ts:19 — `prisma.user.findUnique` dans GET messages converti avec `select: { role: true, vendorSlug: true }`. Élimine le chargement de passwordHash et autres champs sensibles inutiles.

[APPLIED] W-NEW-03 — src/app/api/stats/route.ts:14-17 — Suppression du ternaire `session?.user?.id ? ... : {}` dans la branche IS_DEV. Remplacé par `where: { userId: session.user.id }` cohérent avec la branche prod. Élimine le risque théorique de charger tous les planners.

[APPLIED] W-NEW-04 — src/proxy.ts:38 — Validation du paramètre `next` avant redirection login : `path.startsWith("/") && !path.startsWith("//")`. Empêche un open redirect protocol-relative si un attaquant forge `//evil.com` comme pathname.

---

## Itération 2 — 2026-04-10T18:58Z

[APPLIED] C04 — src/app/api/planners/[id]/route.ts:57-70 — Ajout try/catch sur req.json() + type-check + slice(0,200) sur title, coupleNames, location avant passage à prisma.update. Élimine mass assignment et crash 500 sur JSON malformé.

[APPLIED] W09 — src/app/api/planners/[id]/route.ts:57 — Inclus dans le fix C04 (même bloc).

[APPLIED] W10 — src/proxy.ts:18 — Ajout guard `!configuredKey` : si PREVIEW_KEY absent ou vide, tous les accès non-exempts sont redirigés vers /coming-soon. Empêche l'accès involontaire à l'app en cas d'env var manquante.

[APPLIED] W11 — src/app/api/unread/route.ts:15-26 — Ajout branch vendor : si role="vendor" et vendorSlug défini, compte les messages non lus dans les conversations du vendor au lieu des conversations client. Badge désormais fonctionnel pour les deux rôles.
