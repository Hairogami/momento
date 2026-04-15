/**
 * GET /api/vendor/calendar — agenda privé du prestataire.
 *
 * Lit les ContactRequest avec eventDate non nul et les classe par date :
 *   - "booked"    : status ∈ {won, confirmed}                (définitivement pris)
 *   - "pending"   : status ∈ {new, read, replied, pending}   (en négociation)
 *   - "lost"      : ignoré (pas affiché)
 *
 * Query params :
 *   - from : YYYY-MM-DD (défaut: 1er du mois courant)
 *   - to   : YYYY-MM-DD (défaut: +6 mois)
 *
 * Réponse :
 *   - dates : [{ date: "YYYY-MM-DD", booked: Request[], pending: Request[] }]
 *   - range : { from, to }
 *
 * Auth : role="vendor" + vendorSlug. IDOR-safe.
 *
 * Note : le eventDate en DB est un String (libre). On parse défensivement et on
 * ignore silencieusement les formats non ISO (héritage CSV).
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const BOOKED  = new Set(["won", "confirmed"])
const PENDING = new Set(["new", "read", "replied", "pending"])

function parseDate(raw: string | null, fallback: Date): Date {
  if (!raw) return fallback
  const d = new Date(`${raw}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? fallback : d
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  const sp = req.nextUrl.searchParams
  const now = new Date()
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const defaultTo   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 6, 0))
  const from = parseDate(sp.get("from"), defaultFrom)
  const to   = parseDate(sp.get("to"),   defaultTo)

  const fromKey = dayKey(from)
  const toKey   = dayKey(to)

  // On récupère toutes les demandes avec eventDate non vide (le filtre string
  // range fait le reste en mémoire — volume faible par prestataire).
  const requests = await prisma.contactRequest.findMany({
    where: {
      vendorSlug: user.vendorSlug,
      eventDate: { not: null },
    },
    select: {
      id: true, clientName: true, eventType: true, eventDate: true,
      status: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  type Entry = {
    id: string
    clientName: string
    eventType: string | null
    status: string
  }

  const byDate = new Map<string, { booked: Entry[]; pending: Entry[] }>()

  for (const r of requests) {
    if (!r.eventDate) continue
    // eventDate est libre — on accepte "YYYY-MM-DD" et ISO complet
    const key = r.eventDate.length >= 10 ? r.eventDate.slice(0, 10) : null
    if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
    if (key < fromKey || key > toKey) continue

    const bucket = byDate.get(key) ?? { booked: [], pending: [] }
    const entry: Entry = {
      id: r.id,
      clientName: r.clientName,
      eventType: r.eventType,
      status: r.status,
    }
    if (BOOKED.has(r.status))  bucket.booked.push(entry)
    else if (PENDING.has(r.status)) bucket.pending.push(entry)
    byDate.set(key, bucket)
  }

  const dates = Array.from(byDate.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    dates,
    range: { from: fromKey, to: toKey },
    generatedAt: new Date().toISOString(),
  })
}
