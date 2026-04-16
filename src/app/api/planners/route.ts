import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function GET() {
  if (IS_DEV) {
    const session = await requireSession()
    const planners = await prisma.planner.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, coupleNames: true, weddingDate: true, coverColor: true, location: true, budget: true, guestCount: true },
      orderBy: { createdAt: "asc" },
    })
    return Response.json(planners)
  }

  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  // W05: replaced full include with select + _count to avoid loading all steps/events for a list view
  const planners = await prisma.planner.findMany({
    where: { userId: session.user.id },
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
      _count: { select: { steps: true, events: true } },
    },
    orderBy: { createdAt: "desc" },
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

  const planner = await prisma.planner.create({
    data: {
      title,
      coupleNames: typeof b.coupleNames === "string" ? b.coupleNames.slice(0, 200) : "",
      weddingDate: parseDate(b.weddingDate),
      budget:      parseBudget(b.budget),
      location:    typeof b.location === "string"    ? b.location.slice(0, 200)    : null,
      coverColor:  typeof b.coverColor === "string" && HEX_COLOR.test(b.coverColor)
        ? b.coverColor
        : "#f9a8d4",
      categories,
      userId: session.user.id,
    },
  })
  return Response.json(planner, { status: 201 })
}
