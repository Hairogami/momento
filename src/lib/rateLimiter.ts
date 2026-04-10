/**
 * Rate limiter hybride :
 * - Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont définis → Upstash Redis (multi-instance, production)
 * - Sinon → Map in-memory (dev / CI, single-instance uniquement)
 *
 * Pour activer Upstash en production :
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=AXxx...
 */

import type { NextRequest } from "next/server"

// ── In-memory fallback ────────────────────────────────────────────────────────

interface RateLimitEntry { count: number; resetAt: number }
const store = new Map<string, RateLimitEntry>()

function rateLimitMemory(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { ok: true }
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [k, e] of store) if (e.resetAt <= now) store.delete(k)
  }, 5 * 60_000)
}

// ── Upstash (lazy-init, only when env vars present) ──────────────────────────

let upstashRatelimit: ((key: string, limit: number, windowMs: number) => Promise<{ ok: true } | { ok: false; retryAfter: number }>) | null = null

async function getUpstashLimiter() {
  if (upstashRatelimit) return upstashRatelimit
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis }     = await import("@upstash/redis")
    const redis = new Redis({ url, token })

    upstashRatelimit = async (key, limit, windowMs) => {
      const rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`) })
      const { success, reset } = await rl.limit(key)
      if (success) return { ok: true }
      return { ok: false, retryAfter: Math.ceil((reset - Date.now()) / 1000) }
    }
    return upstashRatelimit
  } catch {
    return null
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Rate limit synchrone (in-memory uniquement).
 * Utiliser rateLimitAsync() pour bénéficier d'Upstash en production.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfter: number } {
  return rateLimitMemory(key, limit, windowMs)
}

/**
 * Rate limit async : Upstash en production, Map en dev/CI.
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const upstash = await getUpstashLimiter()
  if (upstash) return upstash(key, limit, windowMs)
  return rateLimitMemory(key, limit, windowMs)
}

/**
 * CR-03: Extrait l'IP réelle depuis les headers Next.js / Vercel.
 * x-vercel-forwarded-for est injecté par l'infra Vercel et ne peut pas
 * être falsifié par le client, contrairement à x-forwarded-for.
 * Retourne null si aucune IP disponible — les appelants doivent gérer null
 * plutôt que d'utiliser "unknown" comme clé de rate-limit partagée.
 */
export function getIp(req: Request | NextRequest): string | null {
  return (
    (req as NextRequest).headers?.get("x-vercel-forwarded-for") ??
    (req as NextRequest).headers?.get("x-real-ip") ??
    null
  )
}
