/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window per IP address.
 */

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

interface RateLimitOptions {
  /** Max requests in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export function rateLimit(ip: string, opts: RateLimitOptions): { ok: boolean; remaining: number } {
  const now = Date.now()
  const key = ip
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowSec * 1000 })
    return { ok: true, remaining: opts.limit - 1 }
  }

  if (entry.count >= opts.limit) {
    return { ok: false, remaining: 0 }
  }

  entry.count++
  return { ok: true, remaining: opts.limit - entry.count }
}

/** Extract the real IP from Next.js request headers */
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}
