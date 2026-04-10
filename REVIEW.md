---
status: findings
reviewed_at: 2026-04-10T17:06:00Z
critical: 4
warning: 9
info: 5
---

# REVIEW — Momento codebase

## CRITICAL

### CR-01 — XSS via firstName interpolation non-échappée dans les emails HTML
**Fichier:** `src/lib/email.ts:59` et `src/lib/email.ts:93`
**Probleme:** Les variables `name` (dérivées de `firstName`) sont interpolées directement dans du HTML via template literals sans encodage. Si un attaquant crée un compte avec `firstName = '<img src=x onerror=alert(1)>'`, le HTML injecté est envoyé dans les emails.
**Fix:**
```typescript
function escapeHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
         .replace(/"/g,"&quot;").replace(/'/g,"&#39;")
}
// Utiliser escapeHtml(name) partout dans les templates email
```

### CR-02 — Race condition sur vendor claim : vérification slug absente avant transaction
**Fichier:** `src/app/api/vendor/claim/route.ts:43-59`
**Probleme:** Le chemin `mode === "logged_in"` tente directement la transaction sans vérifier en amont si le slug est déjà réclamé en DB. Deux requêtes concurrentes sur le même slug peuvent toutes deux passer le check `userProfile` (ligne 40) avant que la première transaction ne s'engage, causant un 500 au lieu d'un 409 propre.
**Fix:**
```typescript
const existingProfile = await prisma.vendorProfile.findUnique({ where: { slug }, select: { id: true } })
if (existingProfile) return NextResponse.json({ error: "Ce profil est déjà revendiqué." }, { status: 409 })
// puis la transaction existante
```

### CR-03 — getIp() retourne "unknown" comme clé de rate-limit — bypass possible
**Fichier:** `src/lib/rateLimiter.ts:98-103`
**Probleme:** Si ni `x-vercel-forwarded-for` ni `x-real-ip` ne sont présents, `getIp()` retourne la string `"unknown"`. Toutes ces requêtes partagent alors la même clé de rate-limit. Un attaquant qui supprime ces headers partage le quota global, ou une seule requête sans IP peut bloquer tous les autres "unknown".
**Fix:**
```typescript
export function getIp(req: Request | NextRequest): string | null {
  return (
    (req as NextRequest).headers?.get("x-vercel-forwarded-for") ??
    (req as NextRequest).headers?.get("x-real-ip") ??
    null
  )
}
// Dans les routes, refuser si ip est null :
const ip = getIp(req)
if (!ip) return NextResponse.json({ error: "Requête non identifiable." }, { status: 400 })
```

### CR-04 — neededCategories stocké sans validation des éléments du tableau
**Fichier:** `src/app/api/workspace/route.ts:78-80`
**Probleme:** `body.neededCategories` est accepté comme n'importe quel tableau JSON sans vérification des éléments. Un attaquant peut stocker des chaînes arbitrairement longues ou des objets imbriqués, sérialisés directement via `JSON.stringify`. Risque de DoS (stockage excessif) et corruption de données.
**Fix:**
```typescript
if ("neededCategories" in body && Array.isArray(body.neededCategories)) {
  const cats = (body.neededCategories as unknown[])
    .filter((c): c is string => typeof c === "string")
    .map(c => c.trim().slice(0, 100))
    .slice(0, 50)
  updates.neededCategories = JSON.stringify(cats)
}
```

---

## WARNING

### WR-01 — budget accepte NaN et Infinity via parseFloat
**Fichier:** `src/app/api/planners/route.ts:57` et `src/app/api/planners/[id]/route.ts:56`
**Probleme:** `parseFloat(body.budget)` retourne `NaN` ou `Infinity` si le body contient ces strings. Prisma peut stocker `NaN` ou lever une erreur selon le driver DB.
**Fix:**
```typescript
budget: typeof b.budget === "string" && isFinite(parseFloat(b.budget))
  ? Math.max(0, parseFloat(b.budget)) : null,
```

### WR-02 — body.title non validé dans POST /api/planners/[id]/events
**Fichier:** `src/app/api/planners/[id]/events/route.ts:33-43`
**Probleme:** `body.title` est passé directement à Prisma sans vérification de type ni troncature. `title: null` ou `title: {}` causera une erreur 500 Prisma non gérée.
**Fix:**
```typescript
const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : ""
if (!title) return Response.json({ error: "title requis." }, { status: 400 })
```

### WR-03 — body.title non validé dans POST /api/planners/[id]/steps
**Fichier:** `src/app/api/planners/[id]/steps/route.ts:21-29`
**Probleme:** Même problème que WR-02. `body.title` et `body.description` sans guard de type causent un 500 si null ou non-string.
**Fix:**
```typescript
if (!body.title || typeof body.title !== "string") {
  return Response.json({ error: "title requis." }, { status: 400 })
}
// data: { title: body.title.slice(0, 200), description: typeof body.description === "string" ? body.description.slice(0, 1000) : null }
```

### WR-04 — color de l'événement non validée contre un format attendu
**Fichier:** `src/app/api/planners/[id]/events/route.ts:38`
**Probleme:** `body.color` est stocké sans validation. N'importe quelle chaîne est persistée et potentiellement réutilisée dans un attribut `style` côté frontend.
**Fix:**
```typescript
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const color = typeof body.color === "string" && HEX_COLOR.test(body.color)
  ? body.color : "#f9a8d4"
```

### WR-05 — Slug vendor auto-généré peut produire des collisions pour noms non-ASCII
**Fichier:** `src/app/api/steps/[id]/vendors/route.ts:34`
**Probleme:** Un nom contenant uniquement des caractères non-ASCII (ex: arabe, cyrillique) produit le slug `"vendor"`. Deux prestataires différents avec des noms non-ASCII différents obtiendraient le même slug, causant une violation de contrainte unique (500 non géré).
**Fix:**
```typescript
const baseSlug = safeName.toLowerCase()
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
const slug = (baseSlug || "vendor") + "-" + Date.now().toString(36)
```

### WR-06 — Données mock retournées sans auth check en mode IS_DEV (unread)
**Fichier:** `src/app/api/unread/route.ts:7-9`
**Probleme:** En mode `IS_DEV`, le mock est retourné avant le check d'authentification. Si `NODE_ENV !== "production"` était activé en production par erreur, l'endpoint serait public.
**Fix:** Déplacer le block `IS_DEV` après le check de session :
```typescript
const session = await auth()
if (!session?.user?.id) return NextResponse.json({ messages: 0, notifications: 0 })
if (IS_DEV) return NextResponse.json({ messages: MOCK_DASHBOARD_DATA.unreadCount, notifications: 0 })
```

### WR-07 — sanitize() dans messages utilise du regex HTML — insuffisant comme défense XSS
**Fichier:** `src/app/api/messages/route.ts:7-12`
**Probleme:** Le sanitizer regex HTML est contournable (balises imbriquées, encoding). La vraie défense est que le frontend ne doit jamais rendre le contenu via `innerHTML`. Si c'est le cas, ce sanitizer donne une fausse impression de sécurité.
**Fix:** Vérifier que le composant `MessageThread` utilise `textContent` ou React text nodes (pas `dangerouslySetInnerHTML`). Remplacer `sanitize` par un simple trim + length check côté serveur.

### WR-08 — Token de reset-password accepté sans limite de longueur
**Fichier:** `src/app/api/auth/reset-password/route.ts:7-11`
**Probleme:** `token` est passé directement à `prisma.emailVerification.findUnique` sans validation de longueur. Un token de plusieurs MB force une requête DB coûteuse.
**Fix:**
```typescript
if (!token || typeof token !== "string" || token.length > 200) {
  return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
}
```

### WR-09 — GET /api/vendors : limite max de 1000 sur endpoint public sans rate-limit
**Fichier:** `src/app/api/vendors/route.ts:9`
**Probleme:** `Math.min(1000, ...)` permet d'extraire 1000 vendors par requête sans auth et sans rate-limit. Scraping trivial de toute la base.
**Fix:**
```typescript
const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10))
```

---

## INFO

### IN-01 — Paramètre userId inutilisé dans getOwnedStep
**Fichier:** `src/app/api/steps/[id]/vendors/route.ts:5`
**Probleme:** `getOwnedStep(stepId: string, userId: string)` — `userId` n'est pas utilisé dans le corps. Paramètre mort trompeur.
**Fix:** Supprimer le paramètre `userId` de la signature.

### IN-02 — window.fetch monkey-patché dans le layout dashboard
**Fichier:** `src/app/(dashboard)/layout.tsx:123-134`
**Probleme:** Patch fragile de `window.fetch` pour émettre `momento:stats-refresh`. Ne couvre pas les Server Actions. Peut créer des doubles patches en React StrictMode (dev).
**Fix:** Utiliser un contexte React ou un event bus dédié à la place.

### IN-03 — console.error en production dans plusieurs routes
**Fichier:** `src/app/api/messages/route.ts:129`, `src/app/api/auth/register/route.ts:119`, `src/app/api/auth/forgot-password/route.ts:37`
**Probleme:** Les logs d'erreur non conditionnels exposent des stack traces dans les logs Vercel.
**Fix:** Conditionner avec `if (process.env.NODE_ENV !== "production")` ou utiliser un logger structuré.

### IN-04 — IS_DEV redéfini localement dans auth.ts (duplication)
**Fichier:** `src/lib/auth.ts:13`
**Probleme:** `IS_DEV` est réimporté manuellement alors que `devMock.ts` l'exporte déjà.
**Fix:** `import { IS_DEV } from "@/lib/devMock"` ou extraire dans un module `@/lib/env.ts`.

### IN-05 — GET sur /api/auth/logout reçoit un 307 qui préserve GET vers NextAuth signout
**Fichier:** `src/app/api/auth/logout/route.ts:6`
**Probleme:** Un 307 préserve la méthode. Un GET redirigé vers `/api/auth/signout` peut retourner une page HTML inattendue au lieu d'un signout propre.
**Fix:** Ajouter un guard `if (req.method !== "POST") return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })`.
