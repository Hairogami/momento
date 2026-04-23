/**
 * Parse une chaîne de localisation arbitraire (coords, URL Maps/Waze/Apple, adresse)
 * et tente d'extraire lat/lng directement. Retourne null si pas extractible
 * → dans ce cas l'appelant doit géocoder l'adresse texte via Nominatim.
 */

export type ParsedLocation = {
  lat: number
  lng: number
  source: "coords" | "google-maps" | "waze" | "apple-maps" | "openstreetmap" | "geocoded"
}

/** "33.5731, -7.5898" ou "33.5731,-7.5898" */
const COORDS_RE = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/

/** Google Maps : @33.5,-7.5,15z  ou  !3d33.5!4d-7.5  ou  ll=33.5,-7.5  ou  q=33.5,-7.5 */
const GMAPS_AT_RE = /@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,\d+(?:\.\d+)?z)?/
const GMAPS_3D4D_RE = /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/
const GMAPS_Q_RE = /[?&](?:q|ll)=(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/

/** Waze : https://waze.com/ul?ll=33.5,-7.5 */
const WAZE_LL_RE = /waze\.com\/[^ ]*[?&]ll=(-?\d{1,2}(?:\.\d+)?)(?:%2C|,)(-?\d{1,3}(?:\.\d+)?)/

/** Apple Maps : maps.apple.com/?ll=33.5,-7.5  ou  q=33.5,-7.5 */
const APPLE_LL_RE = /maps\.apple\.com\/[^ ]*[?&](?:ll|q)=(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/

/** OpenStreetMap : /#map=15/33.5/-7.5 */
const OSM_RE = /openstreetmap\.org\/[^ ]*#map=\d+\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/

function safeNumber(s: string): number | null {
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function validCoords(lat: number | null, lng: number | null): ParsedLocation | null {
  if (lat === null || lng === null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng, source: "coords" }
}

export function parseLocationInput(raw: string): ParsedLocation | null {
  if (!raw) return null
  const input = raw.trim()
  if (!input) return null

  // 1. Coords directes "lat,lng"
  const coordsMatch = input.match(COORDS_RE)
  if (coordsMatch) {
    return validCoords(safeNumber(coordsMatch[1]!), safeNumber(coordsMatch[2]!))
  }

  // 2. Google Maps URL — plusieurs patterns
  if (/google\.[a-z.]+\/maps/i.test(input) || /goo\.gl\/maps/i.test(input) || /maps\.app\.goo\.gl/i.test(input)) {
    const at = input.match(GMAPS_AT_RE)
    if (at) {
      const r = validCoords(safeNumber(at[1]!), safeNumber(at[2]!))
      if (r) return { ...r, source: "google-maps" }
    }
    const d = input.match(GMAPS_3D4D_RE)
    if (d) {
      const r = validCoords(safeNumber(d[1]!), safeNumber(d[2]!))
      if (r) return { ...r, source: "google-maps" }
    }
    const q = input.match(GMAPS_Q_RE)
    if (q) {
      const r = validCoords(safeNumber(q[1]!), safeNumber(q[2]!))
      if (r) return { ...r, source: "google-maps" }
    }
    // Liens courts goo.gl / maps.app.goo.gl → impossible sans follow redirect
    // → retombe sur géocodage via la partie texte s'il y a un nom
    return null
  }

  // 3. Waze
  if (/waze\.com/i.test(input)) {
    const w = input.match(WAZE_LL_RE)
    if (w) {
      const r = validCoords(safeNumber(w[1]!), safeNumber(w[2]!))
      if (r) return { ...r, source: "waze" }
    }
    return null
  }

  // 4. Apple Maps
  if (/maps\.apple\.com/i.test(input)) {
    const a = input.match(APPLE_LL_RE)
    if (a) {
      const r = validCoords(safeNumber(a[1]!), safeNumber(a[2]!))
      if (r) return { ...r, source: "apple-maps" }
    }
    return null
  }

  // 5. OpenStreetMap
  if (/openstreetmap\.org/i.test(input)) {
    const o = input.match(OSM_RE)
    if (o) {
      const r = validCoords(safeNumber(o[1]!), safeNumber(o[2]!))
      if (r) return { ...r, source: "openstreetmap" }
    }
    return null
  }

  // 6. Adresse texte → géocodage requis par l'appelant
  return null
}

/** Génère une URL Google Maps "open directions" à partir de coords. */
export function coordsToGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Génère une URL Waze "open" à partir de coords. */
export function coordsToWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
}
