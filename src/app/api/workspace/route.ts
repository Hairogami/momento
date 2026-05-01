import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/workspace — compat shim: returns primary planner data in workspace shape
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const planner = await prisma.planner.findFirst({
    where: { userId: session.user.id },
    select: { id: true, title: true, weddingDate: true, budget: true, guestCount: true, location: true },
    orderBy: { createdAt: "asc" },
  })

  if (!planner) return NextResponse.json({ error: "Aucun planner trouvé." }, { status: 404 })

  return NextResponse.json({
    id: planner.id,
    eventName: planner.title,
    eventDate: planner.weddingDate?.toISOString() ?? null,
    budget: planner.budget,
    guestCount: planner.guestCount,
    location: planner.location,
    neededCategories: "[]",
  })
}

// PATCH /api/workspace — compat shim: updates primary planner
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const planner = await prisma.planner.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })
  if (!planner) return NextResponse.json({ error: "Aucun planner trouvé." }, { status: 404 })

  const updates: {
    title?: string
    weddingDate?: Date | null
    budget?: number | null
    guestCount?: number | null
    location?: string | null
  } = {}

  if ("eventName" in body && typeof body.eventName === "string") {
    updates.title = body.eventName.trim().slice(0, 200) || "Mon événement"
  }
  if ("eventDate" in body) {
    if (body.eventDate === null) {
      updates.weddingDate = null
    } else if (typeof body.eventDate === "string" && body.eventDate) {
      const d = new Date(body.eventDate)
      if (!isNaN(d.getTime())) updates.weddingDate = d
    }
  }
  if ("budget" in body) {
    updates.budget = typeof body.budget === "number" && body.budget > 0 && body.budget <= 1_000_000_000
      ? body.budget : null
  }
  if ("guestCount" in body) {
    updates.guestCount = typeof body.guestCount === "number" && body.guestCount > 0 && body.guestCount <= 100_000
      ? Math.floor(body.guestCount) : null
  }
  if ("location" in body && typeof body.location === "string") {
    updates.location = body.location.trim().slice(0, 200) || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
  }

  const updated = await prisma.planner.update({
    where: { id: planner.id },
    data: updates,
    select: { id: true, title: true, weddingDate: true, budget: true, guestCount: true, location: true },
  })

  return NextResponse.json({
    id: updated.id,
    eventName: updated.title,
    eventDate: updated.weddingDate?.toISOString() ?? null,
    budget: updated.budget,
    guestCount: updated.guestCount,
    location: updated.location,
  })
}
