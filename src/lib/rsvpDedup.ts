/**
 * Dédup des RSVP par identité : email > phone > nom normalisé.
 * Garde le plus récent. À utiliser partout où on calcule des stats RSVP
 * (page /guests, widget dashboard, exports) pour cohérence.
 */
export type RsvpForDedup = {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  createdAt: Date | string
}

function keyOf(r: RsvpForDedup): string {
  const email = r.guestEmail?.toLowerCase().trim()
  if (email) return `e:${email}`
  const phone = r.guestPhone?.replace(/\s+/g, "").trim()
  if (phone) return `p:${phone}`
  return `n:${r.guestName.toLowerCase().trim()}`
}

export function dedupRsvps<T extends RsvpForDedup>(rsvps: T[]): T[] {
  const seen = new Map<string, T>()
  for (const r of rsvps) {
    const k = keyOf(r)
    const prev = seen.get(k)
    const ts = typeof r.createdAt === "string" ? new Date(r.createdAt).getTime() : r.createdAt.getTime()
    const prevTs = prev ? (typeof prev.createdAt === "string" ? new Date(prev.createdAt).getTime() : prev.createdAt.getTime()) : -Infinity
    if (!prev || ts > prevTs) seen.set(k, r)
  }
  return Array.from(seen.values()).sort((a, b) => {
    const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt.getTime()
    const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt.getTime()
    return tb - ta
  })
}
