import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

/**
 * POST /api/public/evt/[slug]/rsvp
 * Endpoint PUBLIC (no auth). Un invité remplit le RSVP.
 *
 * Sécurité :
 * - Vérifie eventSite.published && modStatus === "ok"
 * - Rate-limit 5 RSVP / 15 min / IP (Upstash Redis existant)
 * - Honey-pot field (champ caché rempli = bot → 200 silencieux sans DB insert)
 * - Hash IP (pas stockage brut) pour RGPD
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Rate limit 5 tentatives / 15 min / IP
  const ip = getIp(req)
  // Si IP non détectable en prod (W3.6) : reject — sinon attaquant peut bypasser via clé partagée "null"
  if (!ip && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Origine non identifiable. Réessayez depuis un autre réseau." },
      { status: 403 },
    )
  }
  const rl = await rateLimitAsync(`rsvp:${slug}:${ip}`, 5, 15 * 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de réponses en peu de temps. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    )
  }

  // Body size guard
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 8_192) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  // Honey-pot — champ caché "website" côté front. Si un bot le remplit = silence
  if (typeof b.website === "string" && b.website.trim().length > 0) {
    return NextResponse.json({ ok: true })
  }

  const guestName = typeof b.guestName === "string" ? b.guestName.trim().slice(0, 100) : ""
  if (!guestName) return NextResponse.json({ error: "Nom requis." }, { status: 400 })

  const attendingMain = typeof b.attendingMain === "boolean" ? b.attendingMain : null
  if (attendingMain === null) return NextResponse.json({ error: "Réponse requise." }, { status: 400 })

  const site = await prisma.eventSite.findUnique({
    where: { slug },
    select: { id: true, published: true, modStatus: true },
  })
  if (!site || !site.published || site.modStatus !== "ok") {
    return NextResponse.json({ error: "Événement introuvable ou non publié." }, { status: 404 })
  }

  const guestEmail = typeof b.guestEmail === "string" ? b.guestEmail.trim().slice(0, 120) : null
  const guestPhone = typeof b.guestPhone === "string" ? b.guestPhone.trim().slice(0, 30) : null
  const plusOneName = typeof b.plusOneName === "string" ? b.plusOneName.trim().slice(0, 100) || null : null
  const dietaryNeeds = typeof b.dietaryNeeds === "string" ? b.dietaryNeeds.trim().slice(0, 300) || null : null
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 500) || null : null
  const attendingDayAfter = typeof b.attendingDayAfter === "boolean" ? b.attendingDayAfter : null

  // Hash IP pour RGPD (pas de stockage brut)
  const ipHash = crypto.createHash("sha256").update(`${ip}:momento-rsvp-salt`).digest("hex").slice(0, 32)
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null

  const created = await prisma.eventRsvp.create({
    data: {
      eventSiteId: site.id,
      guestName,
      guestEmail,
      guestPhone,
      attendingMain,
      attendingDayAfter,
      plusOneName,
      dietaryNeeds,
      message,
      ipHash,
      userAgent,
    },
    select: { id: true, createdAt: true },
  })

  return NextResponse.json({ ok: true, id: created.id, receivedAt: created.createdAt }, { status: 201 })
}
