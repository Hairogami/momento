import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { parseLocationInput, coordsToGoogleMapsUrl, coordsToWazeUrl } from "@/lib/locationParser"
import { geocodeAddress } from "@/lib/geocode"

/**
 * POST /api/geocode
 * Body: { input: string }
 * Auth: user connecté (prévient l'abus du quota Nominatim).
 *
 * Résout une entrée de localisation arbitraire :
 *   - coords "33.5,-7.5" → direct
 *   - URL Google Maps / Waze / Apple / OSM avec lat,lng extraits → direct
 *   - adresse texte → géocodage Nominatim
 *
 * Retourne { lat, lng, displayName, mapsUrl, wazeUrl, source } ou 404.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const input = typeof (body as { input?: unknown }).input === "string"
    ? (body as { input: string }).input.trim()
    : ""
  if (!input) {
    return NextResponse.json({ error: "input requis." }, { status: 400 })
  }

  // 1. Essai parsing direct (coords ou URL avec coords)
  const parsed = parseLocationInput(input)
  if (parsed) {
    return NextResponse.json({
      lat: parsed.lat,
      lng: parsed.lng,
      displayName: input, // pas de normalisation, on garde ce que l'user a tapé
      mapsUrl: coordsToGoogleMapsUrl(parsed.lat, parsed.lng),
      wazeUrl: coordsToWazeUrl(parsed.lat, parsed.lng),
      source: parsed.source,
    })
  }

  // 2. Sinon, géocode l'adresse texte via Nominatim
  const geo = await geocodeAddress(input)
  if (!geo) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 })
  }

  return NextResponse.json({
    lat: geo.lat,
    lng: geo.lng,
    displayName: geo.displayName,
    mapsUrl: coordsToGoogleMapsUrl(geo.lat, geo.lng),
    wazeUrl: coordsToWazeUrl(geo.lat, geo.lng),
    source: "geocoded",
  })
}
