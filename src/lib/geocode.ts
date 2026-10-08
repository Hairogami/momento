/**
 * Géocodage serveur via Nominatim (OpenStreetMap).
 * Gratuit, pas de clé API. ToS Nominatim : max 1 req/s + User-Agent requis.
 *
 * Pour un usage production-scale, on cache côté appelant (stocké dans
 * EventSite.content.*.locationResolved pour éviter de re-géocoder à chaque save).
 */

export type GeocodeResult = {
  lat: number
  lng: number
  displayName: string
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"
const USER_AGENT = "Momento/1.0 (contact@momentoevents.app)"

/** Hosts autorisés pendant le suivi de redirections (anti-SSRF). */
const GOOGLE_HOST_RE = /^(?:maps\.app\.goo\.gl|goo\.gl|(?:[a-z0-9-]+\.)*google\.[a-z.]+)$/i

/** Vrai si l'entrée est un lien court de partage Google Maps (non parsable sans redirect). */
export function isGoogleMapsShortLink(input: string): boolean {
  return /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(input.trim())
}

/**
 * Déplie un lien court Google Maps (maps.app.goo.gl/xxx) en URL longue,
 * en suivant les redirections manuellement — uniquement vers des domaines Google.
 * Gère la page de consentement EU (consent.google.com?continue=…).
 */
export async function expandGoogleMapsShortLink(input: string): Promise<string | null> {
  let current = input.trim()
  for (let hop = 0; hop < 5; hop++) {
    let url: URL
    try { url = new URL(current) } catch { return null }
    if (url.protocol !== "https:" || !GOOGLE_HOST_RE.test(url.hostname)) return null

    if (url.hostname.startsWith("consent.")) {
      const next = url.searchParams.get("continue")
      if (!next) return null
      current = next
      continue
    }
    // Arrivé sur l'URL longue Google Maps → terminé
    if (/\/maps/.test(url.pathname) && !/goo\.gl$/i.test(url.hostname)) return current

    try {
      const res = await fetch(current, {
        redirect: "manual",
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      })
      const location = res.headers.get("location")
      if (!location) return null
      current = new URL(location, current).toString()
    } catch {
      return null
    }
  }
  return null
}

/** Extrait le nom du lieu d'une URL longue Google Maps (/maps/place/<nom>/ ou ?q=<texte>). */
export function placeNameFromGoogleMapsUrl(longUrl: string): string | null {
  try {
    const url = new URL(longUrl)
    const m = url.pathname.match(/\/maps\/place\/([^/]+)/)
    if (m) return decodeURIComponent(m[1]!.replace(/\+/g, " ")).trim() || null
    const q = url.searchParams.get("q")
    return q?.trim() || null
  } catch {
    return null
  }
}

/** Géocode une adresse texte → coords + nom normalisé. Null si introuvable. */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const q = address.trim()
  if (!q) return null

  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=0`

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "fr,en",
      },
      // Ne pas mettre cache: 'no-store' — next.js ISR cache est bénéfique ici
      next: { revalidate: 60 * 60 * 24 * 30 }, // 30 jours
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    if (!Array.isArray(data) || data.length === 0) return null
    const first = data[0]!
    const lat = Number(first.lat)
    const lng = Number(first.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng, displayName: first.display_name }
  } catch {
    return null
  }
}
