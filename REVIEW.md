---
status: findings
reviewed_at: 2026-04-10T18:34:46Z
critical: 3
warning: 8
info: 5
---

## CRITICAL

### [CRITICAL] C01 — N+1 / over-fetch dans /api/stats
**Fichier:** src/app/api/stats/route.ts:31-36  
**Probleme:** `prisma.planner.findMany` charge `steps → vendors → vendor` (objet complet) pour tous les planners de l'utilisateur. Avec 10 planners × 20 steps × 5 vendors = 1000 lignes vendor complètes. Seul `vendor.category` est utilisé dans buildStats.  
**Fix:** Remplacer `include: { vendor: true }` par `select: { vendor: { select: { category: true } } }` dans les deux appels (IS_DEV et prod).

### [CRITICAL] C02 — Open Redirect via `req.url` dans /api/auth/verify-email
**Fichier:** src/app/api/auth/verify-email/route.ts:9,26,45,48  
**Probleme:** Toutes les redirections utilisent `new URL("/login?...", req.url)`. Si un attaquant forge un header `Host: evil.com`, `req.url` devient `https://evil.com/...` — l'utilisateur est redirigé hors du site.  
**Fix:** Utiliser `process.env.NEXT_PUBLIC_APP_URL` comme base au lieu de `req.url`.

### [CRITICAL] C03 — Open Redirect via `req.url` dans /api/unlock
**Fichier:** src/app/api/unlock/route.ts:19,22  
**Probleme:** Même vecteur que C02 — `new URL("/coming-soon", req.url)` et `new URL("/", req.url)` utilisent `req.url` comme base, vulnérable au host header injection.  
**Fix:** Utiliser `process.env.NEXT_PUBLIC_APP_URL` comme base.

---

## WARNING

### [WARNING] W01 — catch silencieux englobe toutes les erreurs dans /api/waitlist
**Fichier:** src/app/api/waitlist/route.ts:26-29  
**Probleme:** `catch {}` nu capture toutes les erreurs (pas seulement P2002 unique constraint). Une erreur DB ou schema retourne quand même `{ ok: true }` au client — comportement trompeur.  
**Fix:** Re-throw les erreurs non-P2002.

### [WARNING] W02 — `rateLimit` synchrone (in-memory) sur POST /api/messages
**Fichier:** src/app/api/messages/route.ts:65  
**Probleme:** `rateLimit()` est in-memory par instance. Sur Vercel multi-instance, la limite de 30/min ne s'applique que par instance — contournable en distribuant les requêtes sur différentes instances.  
**Fix:** Remplacer par `await rateLimitAsync(...)`.

### [WARNING] W03 — `rateLimit` synchrone (in-memory) sur POST /api/auth/register
**Fichier:** src/app/api/auth/register/route.ts:48  
**Probleme:** Même problème que W02 — limite d'inscription de 5/15min contournable en multi-instance.  
**Fix:** Remplacer par `await rateLimitAsync(...)`.

### [WARNING] W04 — `rateLimit` synchrone (in-memory) sur POST /api/ai/suggest
**Fichier:** src/app/api/ai/suggest/route.ts:15  
**Probleme:** Même problème que W02/W03 — limite de 10 appels/heure sur l'API Anthropic contournable. Les appels AI sont coûteux — risque d'amplification de coût.  
**Fix:** Remplacer par `await rateLimitAsync(...)`.

### [WARNING] W05 — Validation Zod absente sur POST /api/vendors (route admin)
**Fichier:** src/app/api/vendors/route.ts:42-71  
**Probleme:** Coercion manuelle sans schéma Zod. `lat`/`lng` acceptent n'importe quel nombre (ex: lat=99999), `email` et `website` ne sont pas validés comme formats corrects.  
**Fix:** Ajouter un schéma Zod avec `z.string().email()`, `z.string().url()`, et `z.number().min(-90).max(90)` / `z.number().min(-180).max(180)` pour lat/lng.

### [WARNING] W06 — URL image sans allowlist d'hôtes dans /api/auth/update-profile
**Fichier:** src/app/api/auth/update-profile/route.ts:26-36  
**Probleme:** L'URL image est validée (http/https uniquement) mais n'importe quel hôte est accepté (ex: `http://evil.com/tracker.png`). Si l'image est rendue server-side, risque de tracking pixel ou SSRF-lite.  
**Fix:** Ajouter un allowlist d'hôtes acceptés (ex: `*.googleusercontent.com`, `*.fbcdn.net`, domaine CDN propre).

### [WARNING] W07 — N+1 dans /api/stats (même requête dupliquée IS_DEV + prod)
**Fichier:** src/app/api/stats/route.ts:14-17  
**Probleme:** En mode IS_DEV, la même requête lourde est exécutée, puis si elle retourne des résultats elle est utilisée normalement — le fallback mock n'est atteint que si la DB est vide. La branche IS_DEV ne protège donc pas contre la requête lourde.  
**Fix:** En IS_DEV sans résultats DB, retourner directement le mock sans la requête lourde (ou supprimer la branche IS_DEV).

### [WARNING] W08 — Message d'erreur 501 fuite architecture interne dans /api/calendar/google
**Fichier:** src/app/api/calendar/google/route.ts:15-19  
**Probleme:** `"OAuth token must be fetched from the database."` expose les détails d'implémentation interne dans la réponse HTTP publique.  
**Fix:** Remplacer par un message générique : `"Google Calendar integration not yet available."`.

---

## INFO

### [INFO] I01 — accessToken Google stocké dans le JWT (TODO commenté)
**Fichier:** src/lib/auth.ts:87-89  
**Probleme:** `token.accessToken = account.access_token` — si le secret JWT fuit, tous les tokens Google OAuth sont exposés. Un TODO note de migrer vers le stockage DB.  
**Fix:** Implémenter le TODO : stocker le token dans `prisma.account` et le récupérer depuis la DB dans la route calendar.

### [INFO] I02 — Cast mort dans /api/calendar/google
**Fichier:** src/app/api/calendar/google/route.ts:13  
**Probleme:** `(session.user as { accessToken?: string }).accessToken` sera toujours `undefined` car le session callback n'expose pas accessToken côté client (by design). Dead code — la branche 501 s'exécute toujours.  
**Fix:** Supprimer le cast ; implémenter la récupération du token depuis la DB directement.

### [INFO] I03 — `deleteBudgetItem` absent des Server Actions budget
**Fichier:** src/app/(dashboard)/budget/actions.ts  
**Probleme:** Les actions exposent `addBudgetItem`, `togglePaid`, `updateBudget` mais pas de suppression. Si la UI permet la suppression, elle doit passer par une route API — vérifier que cette route valide l'ownership.  
**Fix:** Vérifier l'existence et l'ownership check si une route DELETE /api/budget-items/[id] est ajoutée.

### [INFO] I04 — Résumé mock non exhaustif dans /api/stats IS_DEV
**Fichier:** src/app/api/stats/route.ts:104-126  
**Probleme:** Les constantes MOCK_EVENTS_BY_MONTH et MOCK_PARTNERS sont du dead code si la DB n'est jamais vide en dev (elles ne s'affichent que quand planners.length === 0).  
**Fix:** Nettoyer ou documenter explicitement le cas d'usage.

### [INFO] I05 — Intention ambiguë sur `budget < 0` dans updateBudget
**Fichier:** src/app/(dashboard)/budget/actions.ts:52  
**Probleme:** `budget < 0` accepte budget=0. Si un budget nul n'a pas de sens métier, utiliser `budget <= 0`. Si 0 est valide (budget inconnu), ajouter un commentaire.  
**Fix:** Clarifier avec un commentaire ou ajuster la condition selon la règle métier.
