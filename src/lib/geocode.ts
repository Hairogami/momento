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
