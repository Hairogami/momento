/**
 * Rate limiter in-memory simple pour les routes sensibles.
 * Réinitialise automatiquement après la fenêtre définie.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * @param key      Clé unique (ex: "forgot-password:user@email.com")
 * @param limit    Nombre max de tentatives
 * @param windowMs Fenêtre en millisecondes (ex: 15 * 60 * 1000 = 15 min)
 * @returns { ok: true } si autorisé, { ok: false, retryAfter: seconds } si bloqué
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfter: number } {
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

/** Extrait l'IP réelle depuis les headers Next.js */
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

// Nettoyage périodique (évite les fuites mémoire)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }, 5 * 60 * 1000) // toutes les 5 min
}
