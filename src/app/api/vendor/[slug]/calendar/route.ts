/**
 * GET /api/vendor/[slug]/calendar — Disponibilités publiques d'un prestataire
 *
 * Retourne uniquement les dates déjà prises (12 prochains mois max).
 * Fusionne deux sources :
 *   - ContactRequest.status IN (won, confirmed)  → dates confirmées
 *   - VendorBlockedDate                           → dates bloquées manuellement
 *
 * AUCUNE info client exposée — juste un array de strings YYYY-MM-DD.
 * Cache 5 min (public, s-maxage=300).
 */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MAX_MONTHS_FORWARD = 12
const BOOKED = new Set(["won", "confirmed"])

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || slug.length > 120) {
      return NextResponse.json({ error: "Slug invalide." }, { status: 400 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!vendor) {
      return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
    }

    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const max = new Date(today)
    max.setUTCMonth(max.getUTCMonth() + MAX_MONTHS_FORWARD)
    const todayKey = today.toISOString().slice(0, 10)
    const maxKey = max.toISOString().slice(0, 10)

    // 1. ContactRequest.status = won — eventDate est String, on filtre en mémoire
    const requests = await prisma.contactRequest.findMany({
      where: {
        vendorSlug: slug,
        status: { in: ["won", "confirmed"] },
        eventDate: { not: null },
      },
      select: { eventDate: true, status: true },
      take: 500,
    })

    const set = new Set<string>()

    for (const r of requests) {
      if (!r.eventDate) continue
      const raw = r.eventDate.length >= 10 ? r.eventDate.slice(0, 10) : null
      if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) continue
      if (raw < todayKey || raw > maxKey) continue
      if (BOOKED.has(r.status)) set.add(raw)
    }

    // 2. VendorBlockedDate — peut être absent du client en dev si prisma generate
    // n'a pas encore été suivi d'un restart serveur (globalThis cache stale).
    if (prisma.vendorBlockedDate) {
      const blocks = await prisma.vendorBlockedDate.findMany({
        where: {
          vendorId: vendor.id,
          date: { gte: today, lte: max },
        },
        select: { date: true },
        take: 500,
      })
      for (const b of blocks) {
        set.add(b.date.toISOString().slice(0, 10))
      }
    } else {
      console.warn("[calendar] prisma.vendorBlockedDate unavailable — restart dev server after prisma generate")
    }

    const bookedDates = Array.from(set).sort()

    return NextResponse.json(
      { bookedDates },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    )
  } catch (err) {
    console.error("[calendar] GET /api/vendor/[slug]/calendar error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
