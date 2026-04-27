/**
 * Lightweight cache helper backed by Upstash Redis.
 *
 * - GET/SET avec TTL (secondes) sur Upstash Redis si configuré (UPSTASH_REDIS_REST_URL + TOKEN).
 * - Si Upstash absent (dev/CI sans Redis) → bypass complet : on appelle simplement le fetcher,
 *   pas de cache. Évite de bloquer l'app quand on tourne sans infra.
 * - Le client Redis est partagé/lazy-init (séparé du Ratelimit pour ne pas casser
 *   l'instance existante de @upstash/ratelimit).
 *
 * Usage :
 *   const data = await cached("vendors:photo:rabat:1", 300, async () => {
 *     return prisma.vendor.findMany({ ... })
 *   })
 *
 * Invalidation :
 *   await invalidateByPrefix("vendors:")  // clé wildcard via SCAN
 *   await bumpVersion("vendors")          // version-based key (recommandé)
 */

import { captureError } from "@/lib/observability"

let _redis: import("@upstash/redis").Redis | null = null
let _initTried = false

async function getRedis(): Promise<import("@upstash/redis").Redis | null> {
  if (_redis) return _redis
  if (_initTried) return null
  _initTried = true

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      // En prod, on ne crash pas l'app — on log et on bypass (fail-open
      // côté cache : pas de cache, mais la route reste fonctionnelle).
      captureError(new Error("UPSTASH_REDIS_REST_URL/TOKEN absent — cache disabled"), {
        source: "cache",
        severity: "WARNING",
      })
    }
    return null
  }

  try {
    const { Redis } = await import("@upstash/redis")
    _redis = new Redis({ url, token })
    return _redis
  } catch (e) {
    captureError(e, { source: "cache.init", severity: "WARNING" })
    return null
  }
}

/**
 * Cache wrapper : tente GET, sinon appelle le fetcher et SET avec TTL.
 *
 * @param key clé Redis (préfixée à la convenance de l'appelant, ex "vendors:v3:photo:rabat:1")
 * @param ttlSeconds durée de vie en secondes
 * @param fetcher fonction async retournant la donnée à mettre en cache
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = await getRedis()
  if (!redis) return fetcher()

  try {
    // Upstash auto-parse le JSON si l'objet a été stocké en JSON.
    // On stocke tout via JSON.stringify pour avoir un comportement homogène.
    const cached = (await redis.get(key)) as T | null
    if (cached !== null && cached !== undefined) {
      return cached
    }
  } catch (e) {
    captureError(e, { source: "cache.get", severity: "WARNING", key })
    // Fall through au fetcher
  }

  const value = await fetcher()

  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (e) {
    captureError(e, { source: "cache.set", severity: "WARNING", key })
  }

  return value
}

/**
 * Supprime une clé du cache.
 */
export async function del(key: string): Promise<void> {
  const redis = await getRedis()
  if (!redis) return
  try {
    await redis.del(key)
  } catch (e) {
    captureError(e, { source: "cache.del", severity: "WARNING", key })
  }
}

/**
 * Bumpe une version pour invalider toutes les clés qui l'utilisent.
 *
 * Pattern recommandé pour invalider un namespace entier sans avoir à SCAN
 * (Upstash facture les opérations + SCAN reste lent à grosse échelle).
 *
 * Usage :
 *   const v = await getVersion("vendors")            // 1
 *   const key = `vendors:v${v}:${cat}:${city}:${page}`
 *   // ... après update vendor :
 *   await bumpVersion("vendors")                     // ancienne v1 abandonnée
 */
export async function getVersion(namespace: string): Promise<number> {
  const redis = await getRedis()
  if (!redis) return 1 // toujours v1 si pas de Redis (cache désactivé)
  try {
    const v = (await redis.get(`cache:version:${namespace}`)) as number | string | null
    if (v === null || v === undefined) return 1
    const n = typeof v === "number" ? v : parseInt(String(v), 10)
    return Number.isFinite(n) && n > 0 ? n : 1
  } catch (e) {
    captureError(e, { source: "cache.getVersion", severity: "WARNING", namespace })
    return 1
  }
}

export async function bumpVersion(namespace: string): Promise<number> {
  const redis = await getRedis()
  if (!redis) return 1
  try {
    return await redis.incr(`cache:version:${namespace}`)
  } catch (e) {
    captureError(e, { source: "cache.bumpVersion", severity: "WARNING", namespace })
    return 1
  }
}

/**
 * Helper pratique combinant version + cached.
 *
 * Usage :
 *   const data = await cachedWithVersion("vendors", `${cat}:${city}:${page}`, 300, fetcher)
 */
export async function cachedWithVersion<T>(
  namespace: string,
  subKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const v = await getVersion(namespace)
  return cached(`${namespace}:v${v}:${subKey}`, ttlSeconds, fetcher)
}
