# P2 — Vendor Scaling : rankingScore + Upstash cache + cron daily

## Problème

`/api/vendors` actuel : `findMany()` sans `where` paginé → fetch ALL matching vendors → scoring in-memory → slice. Linear degradation au-delà de 5K vendors. Pas de cache → chaque hit anonyme = full table scan + scoring.

## Solution livrée

### 1. Schema change — `prisma/schema.prisma`

Ajouté sur `model Vendor` :

```prisma
rankingScore     Float?    @default(0)
rankingUpdatedAt DateTime?

@@index([rankingScore(sort: Desc)])
@@index([category, rankingScore(sort: Desc)])
@@index([city, rankingScore(sort: Desc)])
```

3 indexes covrent les 3 patterns de query :
- listing global (orderBy rankingScore desc)
- filtre catégorie (where category + orderBy)
- filtre ville (where city + orderBy)

### 2. Backfill script — `scripts/backfill-vendor-ranking.ts`

Recalcule `rankingScore` pour tous les vendors via `scoreVendor()` (lib existante) + persiste `rankingUpdatedAt`. Logs progression toutes les 100 lignes. Idempotent.

Lancer après migration :
```bash
DATABASE_URL=$DIRECT_URL npx prisma db push
npx tsx scripts/backfill-vendor-ranking.ts
```

### 3. Vendor list query — `src/app/api/vendors/route.ts`

Avant : fetch all → score in-memory → slice
Après : `orderBy: [{ rankingScore: "desc" }, { id: "asc" }]` + `skip`/`take` direct en Prisma. Tie-breaker stable sur `id` pour pagination déterministe. Plus de scoring inline, plus de fetch all.

Ajout filtre `?city=` (qui n'existait pas). Bench attendu : O(log n) sur l'index au lieu de O(n) full scan + O(n log n) tri.

### 4. Cache helper — `src/lib/cache.ts` (nouveau)

API exportée :
- `cached<T>(key, ttl, fetcher)` — get-or-fetch avec TTL
- `del(key)` — invalidation simple
- `getVersion(ns)` / `bumpVersion(ns)` — invalidation par version (recommandé)
- `cachedWithVersion<T>(ns, subKey, ttl, fetcher)` — combo pratique

Stratégie d'invalidation choisie : **version-based**. `vendors:v${N}:${cat}:${city}:${page}:${limit}` — au write, on incrémente `cache:version:vendors`, ce qui rend toutes les anciennes clés orphelines (et expirées via TTL). Pas de SCAN nécessaire (Upstash facture les ops, SCAN scale mal).

Client Upstash Redis lazy-init, **séparé** de l'instance `@upstash/ratelimit` existante dans `rateLimiter.ts` — zéro impact sur le rate limit. Fail-open si Upstash non configuré (cache désactivé, app continue).

TTL liste vendors : **300s (5 min)**.

### 5. Invalidation aux writes

`bumpVersion("vendors")` ajouté à :
- `src/app/api/vendors/route.ts` — POST (admin create)
- `src/app/api/vendor/profile/route.ts` — PATCH (vendor self-edit)
- `src/app/api/admin/vendors/[slug]/route.ts` — PATCH + DELETE

### 6. Cron daily refresh

Route : `src/app/api/cron/refresh-vendor-ranking/route.ts`
- Auth Vercel Cron via `Authorization: Bearer ${CRON_SECRET}` (refuse si var absente)
- `runtime = "nodejs"` (Prisma incompatible Edge)
- `maxDuration = 300` secondes
- Recompute `rankingScore` pour tous les vendors via `getRankingWeights()` + `scoreVendor()`
- `bumpVersion("vendors")` à la fin → cache servi neuf immédiatement

Schedule : `vercel.json` créé avec :
```json
{ "crons": [{ "path": "/api/cron/refresh-vendor-ranking", "schedule": "0 3 * * *" }] }
```
Exécution quotidienne 03:00 UTC (~04:00-05:00 Maroc selon DST).

## Migration à appliquer (action user)

```bash
DATABASE_URL=$DIRECT_URL npx prisma db push
npx tsx scripts/backfill-vendor-ranking.ts
```

Et configurer en prod (Vercel env vars) :
- `CRON_SECRET` — secret aléatoire (le cron sans cette var refuse 500)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — déjà présents (rate limit)

## Verification

- `npx tsc --noEmit` — clean (zero errors)
- `npx next build` — pass, cron route compilée (`/api/cron/refresh-vendor-ranking`)
- `npx prisma generate` — clean

## Ce qui reste pour le user

1. Lancer la migration DB (commande ci-dessus)
2. Lancer le backfill script (UN coup)
3. Set `CRON_SECRET` dans Vercel env (Production + Preview)
4. Push → Vercel reconnaîtra `vercel.json` et activera le cron auto

## Risques / trade-offs

- **Cache inconsistency** : entre deux bumps de version, la liste publique peut servir une donnée jusqu'à 5 min stale. Acceptable pour un annuaire public (les vendor edits ne sont pas critiques temps-réel).
- **Backfill = SQL UPDATE × N** : pour ~1000 vendors, ~30s. Pour 50K, ~5-10 min. Si scale > 100K → batch updates.
- **Le cron tourne 5 min max** (`maxDuration = 300`) — ample pour < 50K vendors. Au-delà, paginer.
- **Tie-breaker `id` asc** : pagination stable mais arbitraire pour les vendors avec même score. Si on veut un tri secondaire métier (ex. `createdAt desc`), modifier `orderBy`.
