---
status: findings
reviewed_at: 2026-04-10T23:35:00Z
critical: 4
warning: 11
info: 5
---

# Momento — Security & Quality Review

**Reviewed:** 2026-04-10T23:35:00Z
**Depth:** deep (full file read + cross-file analysis)
**Files reviewed:** 34
**Status:** issues_found

---

## Summary

Codebase globalement solide. Il est visible qu'un audit précédent a eu lieu (annotations CR/WR dans le code, patterns de défense bien appliqués : rate limiting, Zod, ownership checks, bcrypt cap, HTML escape). Malgré ça, 4 issues critiques subsistent — dont une fuite de token OAuth en clair, un auth bypass sur le middleware, une élévation de rôle sans vérification d'identité métier, et un input sans cap sur des champs numériques. Les 11 warnings couvrent des race conditions, injections de contenu stocké, et validations manquantes.

---

## Critical Issues

### [CRITICAL] CR-001 — Token OAuth Google lu sans refresh, exposé si DB compromise

**Fichier :** `src/app/api/calendar/google/route.ts:11-15`

**Problème :** Le `access_token` Google est lu directement depuis la table `Account` (en clair en DB) et transmis sans jamais vérifier l'expiration ni utiliser le `refresh_token`. Les tokens Google expirent en 1h — la route devient silencieusement 403 après ce délai. Plus grave : si la DB est compromise, tous les access tokens actifs sont exposés et permettent l'accès aux Google Calendars des utilisateurs.

**Impact :** En cas de fuite DB, accès en lecture au calendrier Google de tous les utilisateurs connectés via OAuth. Route cassée après 1h de session inactive.

**Fix :**
```typescript
const account = await prisma.account.findFirst({
  where: { userId: session.user.id, provider: "google" },
  select: { access_token: true, refresh_token: true, expires_at: true },
})
const now = Math.floor(Date.now() / 1000)
let accessToken = account?.access_token

if (account?.expires_at && account.expires_at < now && account.refresh_token) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  })
  const data = await resp.json()
  if (data.access_token) {
    accessToken = data.access_token
    await prisma.account.updateMany({
      where: { userId: session.user.id, provider: "google" },
      data: { access_token: data.access_token, expires_at: now + (data.expires_in ?? 3600) },
    })
  }
}
```

---

### [CRITICAL] CR-002 — Middleware auth bypass : présence de cookie ≠ session valide

**Fichier :** `src/proxy.ts:38`

**Problème :** Le middleware protège les routes en vérifiant uniquement la **présence** du cookie `authjs.session-token` et sa longueur minimale (`> 20` caractères). N'importe quel cookie arbitraire de 21+ caractères contourne la redirection vers `/login`. Le commentaire dans le code le justifie par des contraintes Edge runtime, mais le résultat est une protection purement cosmétique.

**Impact :** Accès aux pages `/dashboard`, `/planner`, `/profile`, `/guests`, `/budget`, `/messages`, `/settings`, `/prestataire/dashboard` avec un cookie forgé. Les composants React se renderent et peuvent effectuer des fetches côté serveur. Si un composant serveur fait des appels DB sans re-vérifier la session via `auth()`, des données peuvent être exposées.

**Fix :** Vérifier la signature JWT du cookie en Edge runtime avec `jose` (pas de DB requis) :
```typescript
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
try {
  await jwtVerify(sessionCookie, secret)
  // JWT valide — laisser passer
} catch {
  // JWT invalide ou expiré
  const url = new URL("/login", request.url)
  url.searchParams.set("next", safePath)
  return NextResponse.redirect(url)
}
```

---

### [CRITICAL] CR-003 — Élévation de rôle : claim vendor sans vérification d'identité métier

**Fichier :** `src/app/api/vendor/claim/route.ts:38-68`

**Problème :** En mode `logged_in`, n'importe quel utilisateur authentifié (rôle `client`) peut poster `{ slug: "nom-prestataire", mode: "logged_in" }` pour s'attribuer immédiatement le rôle `vendor` et le profil du prestataire correspondant. Aucune vérification que l'utilisateur est bien le propriétaire réel du business. Le premier arrivant prend le slug.

**Impact :** Un utilisateur malveillant peut usurper l'identité de n'importe quel prestataire dans `VENDOR_BASIC`, recevoir ses messages clients, voir ses contact requests, et se présenter comme ce prestataire sur la plateforme.

**Fix :**
```typescript
// Placer les claims en file d'attente pour validation admin
// au lieu d'activer immédiatement
await prisma.vendorClaimRequest.create({
  data: {
    userId: session.user.id,
    slug,
    status: "pending",
    submittedAt: new Date(),
  }
})
return NextResponse.json({ success: true, step: "pending_admin_review" })

// Ou : envoyer un lien de vérification à l'email officiel du vendor dans VENDOR_BASIC[slug]
// et n'activer le claim qu'après clic confirmé
```

---

### [CRITICAL] CR-004 — `guestCount` et `budget` workspace sans limite supérieure

**Fichier :** `src/app/api/workspace/route.ts:68-73` | `src/lib/validations.ts:53-54`

**Problème :** `guestCount` (validé uniquement `> 0`) et `budget` (validé uniquement `.positive()`) n'ont aucun plafond. Un utilisateur authentifié peut soumettre `{ guestCount: 9007199254740991 }`. La valeur est stockée en DB (PostgreSQL `Int` / `Float`). Les calculs de stats et graphiques de budget peuvent produire des valeurs aberrantes ou faire planter les composants frontend.

**Impact :** Corruption de données utilisateur, potentiel crash des composants React de stats/budget avec des valeurs hors-plage.

**Fix :**
```typescript
// validations.ts
guestCount: z.number().int().min(1).max(100_000).optional().nullable(),
budget: z.number().positive().finite().max(1_000_000_000).optional().nullable(),

// workspace/route.ts — aligner les guards inline
updates.guestCount = typeof body.guestCount === "number"
  && body.guestCount > 0
  && body.guestCount <= 100_000
  ? Math.floor(body.guestCount) : null
```

---

## Warnings

### [WARNING] WR-001 — Race condition : aggregate + update vendor rating non atomiques

**Fichier :** `src/app/api/reviews/route.ts:101-112`

**Problème :** Après création d'une review, `prisma.review.aggregate` puis `prisma.vendor.update` sont deux requêtes séparées. Entre les deux, une autre review peut être insérée → le `rating` et `reviewCount` stockés sur `Vendor` deviennent incohérents.

**Impact :** Dérive silencieuse du rating affiché — sous-comptage ou sur-comptage de reviews.

**Fix :**
```typescript
await prisma.$executeRaw`
  UPDATE "Vendor"
  SET rating = (SELECT AVG(rating)::numeric(3,2) FROM "Review" WHERE "vendorId" = ${vendor.id}),
      "reviewCount" = (SELECT COUNT(*)::int FROM "Review" WHERE "vendorId" = ${vendor.id})
  WHERE id = ${vendor.id}
`
```

---

### [WARNING] WR-002 — `logout/route.ts` : redirect base sur `req.url` (Host header spoofable)

**Fichier :** `src/app/api/auth/logout/route.ts:7`

**Problème :** `new URL("/api/auth/signout", req.url)` utilise `req.url` comme base. Hors Vercel (self-hosted, CI, staging), le header `Host` peut être forgé, produisant une redirection vers un domaine arbitraire.

**Impact :** Open redirect potentiel en environnement non-Vercel.

**Fix :**
```typescript
const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
return NextResponse.redirect(new URL("/api/auth/signout", base), { status: 303 })
```

---

### [WARNING] WR-003 — `stats/route.ts` : `stepVendors` sans `take` — charge illimitée

**Fichier :** `src/app/api/stats/route.ts:41-44`

**Problème :** `prisma.stepVendor.findMany` sans `take`. Un utilisateur avec beaucoup de planners et de step vendors charge toute la relation en mémoire à chaque appel `/api/stats`.

**Impact :** Consommation mémoire/CPU élevée côté serveur pour les comptes volumineux.

**Fix :**
```typescript
prisma.stepVendor.findMany({
  where: { step: { planner: { userId: session.user.id } } },
  select: { vendor: { select: { category: true } } },
  take: 5000,
}),
```

---

### [WARNING] WR-004 — `contact/route.ts` : champs texte libres stockés sans sanitisation HTML

**Fichier :** `src/app/api/contact/route.ts:58-68`

**Problème :** `clientName` et `message` sont validés par Zod (longueur) mais stockés tels quels, y compris tout contenu HTML. Si le dashboard vendor rend ces champs via `dangerouslySetInnerHTML` ou une lib non-sanitisante, XSS stocké possible.

**Impact :** XSS stocké dans le dashboard prestataire selon le mode de rendu frontend.

**Fix :**
```typescript
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim()
}
data: {
  clientName: stripHtml(clientName),
  message: stripHtml(message),
  ...
}
// Ou garantir que ces champs sont toujours rendus via {text} JSX (jamais innerHTML)
```

---

### [WARNING] WR-005 — `messages/route.ts` : `sanitize()` ne décode pas les entités HTML encodées

**Fichier :** `src/app/api/messages/route.ts:7-12`

**Problème :** La fonction `sanitize` retire les tags HTML bruts mais ne décode pas les entités encodées avant de nettoyer. Un payload `&#60;script&#62;alert(1)&#60;/script&#62;` passe la sanitisation et est stocké en DB. Si le client décode les entités lors du rendu, XSS possible.

**Impact :** XSS stocké potentiel dans la messagerie si le client décode les entités HTML.

**Fix :**
```typescript
function sanitize(str: string): string {
  // Décoder les entités numériques avant de stripper
  const decoded = str.replace(/&#x?[0-9a-f]+;/gi, "").replace(/&[a-z]+;/gi, "")
  return decoded.replace(/<[^>]*>/g, "").trim()
}
// Ou utiliser isomorphic-dompurify / sanitize-html
```

---

### [WARNING] WR-006 — `vendor/claim` mode `logged_in` : pas de rate limit par userId

**Fichier :** `src/app/api/vendor/claim/route.ts:28-29`

**Problème :** Le rate limit existant est par IP. Un attaquant avec plusieurs IPs (proxy rotatif, Tor) peut tenter de réclamer de nombreux slugs de l'annuaire en parallèle.

**Impact :** Combiné avec CR-003, permet l'usurpation en masse de profils depuis plusieurs IPs.

**Fix :**
```typescript
// Ajouter après la vérification de session, en mode logged_in
const rlUser = rateLimit(`vendor-claim-user:${session.user.id}`, 3, 24 * 60 * 60_000)
if (!rlUser.ok) {
  return NextResponse.json(
    { error: "Limite quotidienne de revendications atteinte." },
    { status: 429 }
  )
}
```

---

### [WARNING] WR-007 — Schema Prisma : `Planner.userId` nullable crée des orphelins permanents

**Fichier :** `prisma/schema.prisma:313`

**Problème :** `userId String?` avec `onDelete: SetNull` — si l'utilisateur est supprimé, le planner reste en DB sans propriétaire. La logique d'ownership (`ownership.userId !== session.user.id`) ne gère pas le cas `userId = null` : le planner devient inaccessible mais persiste indéfiniment en DB.

**Impact :** Fuite de données orphelines. Si une future route oublie le filtre `userId`, les planners orphelins peuvent être exposés.

**Fix :**
```prisma
// Option recommandée : cascade delete
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
userId String  // non-nullable

// Si SetNull est intentionnel (archivage), ajouter une guard explicite dans toutes les routes :
if (!ownership || !ownership.userId || ownership.userId !== session.user.id)
  return Response.json({ error: "Forbidden" }, { status: 403 })
```

---

### [WARNING] WR-008 — CSP : `script-src 'unsafe-inline'` annule la protection XSS

**Fichier :** `next.config.ts:31`

**Problème :** `script-src 'self' 'unsafe-inline'` — `unsafe-inline` permet l'exécution de tout script inline, annulant la protection XSS que la CSP est censée apporter.

**Impact :** La CSP ne bloque pas les XSS de type inline. Les autres headers (X-Frame-Options, HSTS, nosniff) restent efficaces.

**Fix :**
```typescript
// Utiliser des nonces (Next.js 15+ supporte nativement)
// Dans proxy.ts, générer un nonce par requête :
import { randomBytes } from "crypto"
const nonce = randomBytes(16).toString("base64")
// Passer via response headers + dans <Script nonce={nonce}>
// Remplacer dans la CSP :
`script-src 'self' 'nonce-${nonce}'`
```

---

### [WARNING] WR-009 — `change-password/route.ts` : aucun rate limiting

**Fichier :** `src/app/api/auth/change-password/route.ts:8-11`

**Problème :** La route vérifie la session mais n'applique aucun rate limit. Un attaquant avec une session active peut bruteforcer `currentPassword` pour valider des mots de passe candidats, de manière répétée et illimitée.

**Impact :** Oracle de validation de mot de passe pour toute session compromise.

**Fix :**
```typescript
const rl = await rateLimitAsync(`change-password:${session.user.id}`, 5, 15 * 60_000)
if (!rl.ok) {
  return NextResponse.json(
    { error: "Trop de tentatives. Réessayez dans quelques minutes." },
    { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
  )
}
```

---

### [WARNING] WR-010 — `vendor-requests/route.ts` duplique `vendor/dashboard/route.ts`

**Fichier :** `src/app/api/vendor-requests/route.ts` | `src/app/api/vendor/dashboard/route.ts`

**Problème :** Les deux routes exposent des opérations identiques (GET contact requests d'un vendor, PATCH status). Les statuts valides (`pending/confirmed/declined`) sont définis deux fois indépendamment. Si un statut est modifié dans un endroit, l'autre diverge silencieusement.

**Impact :** Maintenance — risque de désynchronisation des valeurs d'enum de statut entre les deux endpoints.

**Fix :** Extraire dans `src/lib/contactRequests.ts`, ou supprimer l'une des deux routes si elles ne sont pas toutes les deux utilisées activement.

---

### [WARNING] WR-011 — `unlock/route.ts` : cookie `preview_key` posé avec valeur vide si `PREVIEW_KEY` absent

**Fichier :** `src/app/api/unlock/route.ts:27-34`

**Problème :** `res.cookies.set("preview_key", previewKey ?? "", ...)` — si `PREVIEW_KEY` n'est pas défini en env, le cookie est posé avec la valeur `""`. La gate dans `proxy.ts` vérifie `!configuredKey` (line 21) qui exempte déjà de la gate dans ce cas, mais le cookie vide est quand même posé pendant 30 jours — comportement silencieusement inattendu.

**Impact :** Cookie inutile posé sur le navigateur, confusion lors du debug de la gate coming-soon.

**Fix :**
```typescript
if (!previewKey) {
  return NextResponse.redirect(new URL("/coming-soon?error=1", base))
}
res.cookies.set("preview_key", previewKey, { ... })
```

---

## Info

### [INFO] IN-001 — `MessageCreateSchema` défini mais non utilisé dans la route messages

**Fichier :** `src/lib/validations.ts:43-47`

**Problème :** `MessageCreateSchema` (avec `content: max 5000`) est défini mais `messages/route.ts` fait sa propre validation inline (`max: 2000`). Dead code + divergence silencieuse entre les deux limites.

**Fix :** Utiliser `MessageCreateSchema` dans `messages/route.ts` ou supprimer le schema inutilisé.

---

### [INFO] IN-002 — `Guest.rsvp` : incohérence de casse entre DB et API

**Fichier :** `prisma/schema.prisma:151` | `src/lib/validations.ts:5`

**Problème :** Valeur par défaut DB : `"pending"` (minuscule). Enum Zod accepté par l'API : `["PENDING", "CONFIRMED", "DECLINED"]` (majuscules). Les guests créés avec la valeur par défaut ont un rsvp `"pending"` qui ne correspond à aucune valeur de l'enum API.

**Fix :** Aligner en utilisant un enum Prisma ou en normalisant toutes les valeurs en minuscules dans le schema Zod.

---

### [INFO] IN-003 — Modèle `Booking` sans routes API

**Fichier :** `prisma/schema.prisma:273-288`

**Problème :** Le modèle `Booking` est défini dans le schema Prisma mais aucune route API ne le gère. Feature incomplète exposée en DB (migrations, espace disque, relations).

**Fix :** Implémenter les routes avec ownership checks, ou supprimer le modèle si la feature n'est pas planifiée à court terme.

---

### [INFO] IN-004 — `auth.ts` : mode dev sans adapter — risque si NODE_ENV mal configuré en staging

**Fichier :** `src/lib/auth.ts:20`

**Problème :** `IS_DEV ? {} : { adapter: PrismaAdapter(prisma) }` — si `NODE_ENV=development` est accidentellement défini en staging/production (erreur de config Vercel), aucun adapter n'est passé, les sessions OAuth ne sont pas persistées et les access tokens Google ne sont jamais stockés en DB.

**Fix :**
```typescript
if (IS_DEV) {
  console.warn("[auth] DEV mode — no DB adapter. OAuth sessions not persisted.")
}
```

---

### [INFO] IN-005 — `next.config.ts` CSP `connect-src` ne liste pas `*.upstash.io`

**Fichier :** `next.config.ts:35`

**Problème :** Mineur — les appels Upstash Redis viennent du serveur (pas du navigateur), donc la CSP ne les bloque pas. Mais la CSP ne reflète pas l'architecture réelle.

**Fix :** Pas bloquant. Ajouter un commentaire expliquant que `connect-src` ne concerne que les appels initiés depuis le navigateur.

---

## Score global : 6.5 / 10

### Priorités de correction

| Priorité | Issue | Effort |
|----------|-------|--------|
| P0 | CR-002 — middleware bypass (cookie forgé) | ~1h |
| P0 | CR-003 — claim vendor sans vérification identité | ~2h |
| P1 | CR-001 — token OAuth sans refresh | ~2h |
| P1 | WR-009 — pas de rate limit change-password | ~15min |
| P1 | WR-008 — CSP unsafe-inline | ~3h (nonces) |
| P2 | CR-004 — cap guestCount/budget | ~15min |
| P2 | WR-001 — rating non atomique | ~30min |
| P2 | WR-004/005 — XSS stocké contact + messages | ~1h |

### Points positifs

- Ownership checks systématiques sur toutes les routes CRUD (planners, steps, tasks, budget, guests, messages).
- Rate limiting présent sur toutes les routes sensibles sauf `change-password`.
- Aucun champ sensible (`passwordHash`, tokens) dans les selects exposés aux clients.
- Transactions Prisma utilisées là où des race conditions étaient possibles.
- HTML escaping dans les templates email.
- Bcrypt cap à 128 chars anti-DoS appliqué de manière cohérente.
- HSTS, X-Frame-Options, nosniff, Referrer-Policy configurés.

---

_Reviewed: 2026-04-10T23:35:00Z_
_Reviewer: Claude Sonnet 4.6 (gsd-code-reviewer)_
_Depth: deep — 34 fichiers lus_
