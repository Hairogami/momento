import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

// Purge auto-lazy : événements en corbeille depuis > 15 jours → hard delete.
// Exécuté au GET /api/planners (piggyback, pas besoin de cron).
const TRASH_TTL_MS = 15 * 24 * 60 * 60 * 1000

async function purgeExpiredTrash(userId: string) {
  const cutoff = new Date(Date.now() - TRASH_TTL_MS)
  try {
    await prisma.planner.deleteMany({
      where: { userId, trashedAt: { lt: cutoff } },
    })
  } catch (e) {
    console.error("[GET /api/planners] purge expired trash failed:", e)
  }
}

export async function GET(request: NextRequest) {
  if (IS_DEV) {
    const session = await requireSession()
    const planners = await prisma.planner.findMany({
      where: { userId: session.user.id, trashedAt: null },
      select: { id: true, title: true, coupleNames: true, weddingDate: true, coverColor: true, location: true, budget: true, guestCount: true, categories: true },
      orderBy: { createdAt: "asc" },
    })
    return Response.json(planners)
  }

  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  // Purge les événements > 15j dans la corbeille (lazy, par user)
  await purgeExpiredTrash(session.user.id)

  const url = new URL(request.url)
  const wantTrash = url.searchParams.get("trashed") === "true"

  const planners = await prisma.planner.findMany({
    where: {
      userId: session.user.id,
      trashedAt: wantTrash ? { not: null } : null,
    },
    select: {
      id: true,
      title: true,
      coupleNames: true,
      weddingDate: true,
      coverColor: true,
      location: true,
      budget: true,
      categories: true,
      createdAt: true,
      trashedAt: true,
      _count: { select: { steps: true, events: true } },
    },
    orderBy: wantTrash ? { trashedAt: "desc" } : { createdAt: "desc" },
  })
  return Response.json(planners)
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function parseDate(val: unknown): Date | null {
  if (typeof val !== "string" || !val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

// WR-01: Safe budget parse — rejects NaN, Infinity, negatives
function parseBudget(val: unknown): number | null {
  if (typeof val !== "string" && typeof val !== "number") return null
  const n = parseFloat(String(val))
  if (!isFinite(n) || n < 0) return null
  return n
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 })
  }
  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 200) : ""
  if (!title) return Response.json({ error: "title requis." }, { status: 400 })

  // Catégories obligatoires : min 3
  const rawCategories = Array.isArray(b.categories) ? b.categories : []
  const categories = rawCategories
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .map(c => c.trim().slice(0, 100))
  if (categories.length < 3) {
    return Response.json({ error: "Sélectionnez au moins 3 catégories de prestataires." }, { status: 400 })
  }

  const guestCountRaw = typeof b.guestCount === "number" ? b.guestCount : parseInt(String(b.guestCount ?? ""), 10)
  const guestCount = Number.isFinite(guestCountRaw) && guestCountRaw >= 0 ? guestCountRaw : null

  const eventType    = typeof b.eventType === "string" && b.eventType.trim().length > 0 ? b.eventType.trim().slice(0, 40) : null
  const eventSubType = typeof b.eventSubType === "string" && b.eventSubType.trim().length > 0 ? b.eventSubType.trim().slice(0, 60) : null

  let budgetBreakdown: Record<string, number> | null = null
  if (b.budgetBreakdown && typeof b.budgetBreakdown === "object" && !Array.isArray(b.budgetBreakdown)) {
    const bb: Record<string, number> = {}
    for (const [k, v] of Object.entries(b.budgetBreakdown as Record<string, unknown>)) {
      const n = typeof v === "number" ? v : parseFloat(String(v))
      if (Number.isFinite(n) && n >= 0) bb[k.slice(0, 100)] = n
    }
    if (Object.keys(bb).length > 0) budgetBreakdown = bb
  }

  // Règle : 1 seul événement LIVE (trashedAt = null) pour les users FREE.
  // Les plans Pro et Max ont des événements illimités.
  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = (userRow?.plan ?? "free") as string
  const isDev = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"
  if (!isDev && plan === "free") {
    const liveCount = await prisma.planner.count({
      where: { userId: session.user.id, trashedAt: null },
    })
    if (liveCount >= 1) {
      return Response.json(
        { error: "Le plan Free est limité à 1 événement en cours. Passez Pro pour en créer plusieurs, ou mettez l'actuel en corbeille." },
        { status: 409 },
      )
    }
  }

  try {
    const planner = await prisma.planner.create({
      data: {
        title,
        coupleNames: typeof b.coupleNames === "string" ? b.coupleNames.slice(0, 200) : "",
        weddingDate: parseDate(b.weddingDate),
        budget:      parseBudget(b.budget),
        location:    typeof b.location === "string"    ? b.location.slice(0, 200)    : null,
        guestCount,
        coverColor:  typeof b.coverColor === "string" && HEX_COLOR.test(b.coverColor)
          ? b.coverColor
          : "#f9a8d4",
        categories,
        eventType,
        eventSubType,
        budgetBreakdown: budgetBreakdown ?? undefined,
        userId: session.user.id,
      },
    })
    return Response.json(planner, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; meta?: unknown }
    console.error("[POST /api/planners] Prisma error:", {
      code: e?.code,
      message: e?.message,
      meta: e?.meta,
      userId: session.user.id,
      categoriesCount: categories.length,
      budgetBreakdownKeys: budgetBreakdown ? Object.keys(budgetBreakdown).length : 0,
    })

    // FK violation : session référence un user qui n'existe plus (purge + JWT stale)
    if (e?.code === "P2003") {
      return Response.json(
        { error: "Votre session pointe vers un compte qui n'existe plus. Reconnectez-vous." },
        { status: 409 },
      )
    }

    return Response.json(
      { error: `Erreur interne lors de la création (${e?.code ?? "UNKNOWN"}).` },
      { status: 500 },
    )
  }
}
