/**
 * GET /api/vendor/requests — liste paginée des demandes client du prestataire.
 *
 * Query params :
 *   - status : "all" | "new" | "read" | "replied" | "won" | "lost"   (défaut: "all")
 *             (legacy tolerés : pending→new, confirmed→won, declined→lost)
 *   - q      : recherche plein texte sur clientName/clientEmail/message (case-insensitive)
 *   - take   : nombre max (défaut 50, plafond 200)
 *
 * Auth : role="vendor" + vendorSlug. IDOR : filtre systématique sur vendorSlug.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

const STATUS_FILTERS = ["all", "new", "read", "replied", "won", "lost"] as const
type StatusFilter = typeof STATUS_FILTERS[number]

// Chaque filtre "canonique" mappe à N statuts DB (incl. legacy).
const STATUS_MAP: Record<Exclude<StatusFilter, "all">, string[]> = {
  new:     ["new", "pending"],
  read:    ["read"],
  replied: ["replied"],
  won:     ["won", "confirmed"],
  lost:    ["lost", "declined"],
}

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || !user.vendorSlug || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  // ── Parse params ─────────────────────────────────────────────────────────
  const sp = req.nextUrl.searchParams
  const rawStatus = sp.get("status") ?? "all"
  const status: StatusFilter = (STATUS_FILTERS as readonly string[]).includes(rawStatus)
    ? (rawStatus as StatusFilter)
    : "all"
  const q = (sp.get("q") ?? "").trim().slice(0, 100)
  const takeRaw = parseInt(sp.get("take") ?? "50", 10)
  const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 200) : 50

  // ── Where ────────────────────────────────────────────────────────────────
  const where: Prisma.ContactRequestWhereInput = { vendorSlug: user.vendorSlug }
  if (status !== "all") {
    where.status = { in: STATUS_MAP[status] }
  }
  if (q) {
    where.OR = [
      { clientName:  { contains: q, mode: "insensitive" } },
      { clientEmail: { contains: q, mode: "insensitive" } },
      { message:     { contains: q, mode: "insensitive" } },
    ]
  }

  const [requests, counts] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        clientName: true, clientEmail: true, clientPhone: true,
        eventType: true, eventDate: true,
        message: true, status: true,
        readAt: true, repliedAt: true, createdAt: true,
      },
    }),
    prisma.contactRequest.groupBy({
      by: ["status"],
      where: { vendorSlug: user.vendorSlug },
      _count: { _all: true },
    }),
  ])

  // ── Counts par statut (normalisés) ───────────────────────────────────────
  const sum = (keys: string[]) =>
    counts.filter(c => keys.includes(c.status)).reduce((a, c) => a + c._count._all, 0)
  const statusCounts = {
    all:     counts.reduce((a, c) => a + c._count._all, 0),
    new:     sum(STATUS_MAP.new),
    read:    sum(STATUS_MAP.read),
    replied: sum(STATUS_MAP.replied),
    won:     sum(STATUS_MAP.won),
    lost:    sum(STATUS_MAP.lost),
  }

  return NextResponse.json({
    requests: requests.map(r => ({
      ...r,
      readAt:    r.readAt?.toISOString() ?? null,
      repliedAt: r.repliedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    statusCounts,
    filter: { status, q, take },
  })
}
