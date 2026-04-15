import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

/**
 * POST /api/track
 *
 * Log un événement analytics pour une fiche vendor publique.
 * Consommé par /vendor/[slug] (vue + clics contact/phone/WhatsApp/IG/FB).
 *
 * Body: { slug: string, type: EventType, sessionId?: string }
 *
 * - Rate limit : 60 req/min par IP (tout type confondu)
 * - Dédup : même (sessionId, slug, type) dans les 30 dernières minutes = ignoré
 * - Pas d'IP stockée en DB (RGPD-light), juste sessionId cookie anonyme
 * - Valide que le slug existe avant d'insérer (anti-pollution de la table)
 */

const VALID_TYPES = new Set([
  "view",
  "contact_click",
  "phone_click",
  "whatsapp_click",
  "instagram_click",
  "facebook_click",
])

const DEDUP_WINDOW_MS = 30 * 60 * 1000

export async function POST(req: NextRequest) {
  // ── Rate limit par IP ─────────────────────────────────────────────────────
  const ip = getIp(req) ?? "anon"
  const rl = await rateLimitAsync(`track:${ip}`, 60, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: { slug?: unknown; type?: unknown; sessionId?: unknown; referrer?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { slug, type, sessionId, referrer } = body
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 200) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }
  if (typeof type !== "string" || !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }
  const cleanSessionId =
    typeof sessionId === "string" && sessionId.length > 0 && sessionId.length <= 100
      ? sessionId
      : null
  const cleanReferrer =
    typeof referrer === "string" && referrer.length > 0 && referrer.length <= 500
      ? referrer
      : null

  // ── Valider que le vendor existe (anti-pollution) ─────────────────────────
  const vendor = await prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  }

  // ── Dédup : si déjà un event identique < 30min, on retourne OK sans insert ─
  if (cleanSessionId) {
    const recent = await prisma.vendorEvent.findFirst({
      where: {
        vendorSlug: slug,
        type,
        sessionId: cleanSessionId,
        createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
      },
      select: { id: true },
    })
    if (recent) {
      return NextResponse.json({ ok: true, deduped: true })
    }
  }

  // ── Insert ────────────────────────────────────────────────────────────────
  await prisma.vendorEvent.create({
    data: {
      vendorSlug: slug,
      type,
      sessionId: cleanSessionId,
      referrer: cleanReferrer,
    },
  })

  return NextResponse.json({ ok: true })
}
