import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { parseLocationInput, coordsToGoogleMapsUrl, coordsToWazeUrl } from "@/lib/locationParser"
import {
  geocodeAddress, isGoogleMapsShortLink, expandGoogleMapsShortLink, placeNameFromGoogleMapsUrl,
} from "@/lib/geocode"

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

  // 2. Lien court de partage Google Maps (maps.app.goo.gl) → déplier puis re-parser
  let textToGeocode = input
  if (isGoogleMapsShortLink(input)) {
    const longUrl = await expandGoogleMapsShortLink(input)
    const fromLong = longUrl ? parseLocationInput(longUrl) : null
    if (fromLong) {
      return NextResponse.json({
        lat: fromLong.lat,
        lng: fromLong.lng,
        displayName: (longUrl && placeNameFromGoogleMapsUrl(longUrl)) ?? input,
        mapsUrl: coordsToGoogleMapsUrl(fromLong.lat, fromLong.lng),
        wazeUrl: coordsToWazeUrl(fromLong.lat, fromLong.lng),
        source: fromLong.source,
      })
    }
    const placeName = longUrl ? placeNameFromGoogleMapsUrl(longUrl) : null
    if (!placeName) {
      return NextResponse.json(
        { error: "Lien Google Maps illisible. Collez plutôt l'adresse ou les coordonnées (appui long sur le pin)." },
        { status: 404 },
      )
    }
    textToGeocode = placeName
  }

  // 3. Sinon, géocode l'adresse texte via Nominatim
  const geo = await geocodeAddress(textToGeocode)
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
