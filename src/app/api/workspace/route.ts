import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/workspace — get current user's workspace
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      eventName: true,
      eventDate: true,
      budget: true,
      guestCount: true,
      location: true,
      neededCategories: true,
    },
  })

  if (!workspace) return NextResponse.json({ error: "Workspace introuvable." }, { status: 404 })

  return NextResponse.json({
    ...workspace,
    eventDate: workspace.eventDate?.toISOString() ?? null,
  })
}

// PATCH /api/workspace — update workspace details
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!workspace) return NextResponse.json({ error: "Workspace introuvable." }, { status: 404 })

  const updates: {
    eventName?: string
    eventDate?: Date | null
    budget?: number | null
    guestCount?: number | null
    location?: string | null
    neededCategories?: string
  } = {}

  if ("eventName" in body && typeof body.eventName === "string") {
    updates.eventName = body.eventName.trim().slice(0, 200) || "Mon événement"
  }
  if ("eventDate" in body) {
    if (body.eventDate === null) {
      updates.eventDate = null
    } else if (typeof body.eventDate === "string" && body.eventDate) {
      const d = new Date(body.eventDate)
      if (!isNaN(d.getTime())) updates.eventDate = d
    }
  }
  if ("budget" in body) {
    updates.budget = typeof body.budget === "number" && body.budget > 0 ? body.budget : null
  }
  if ("guestCount" in body) {
    updates.guestCount = typeof body.guestCount === "number" && body.guestCount > 0
      ? Math.floor(body.guestCount)
      : null
  }
  if ("location" in body && typeof body.location === "string") {
    updates.location = body.location.trim().slice(0, 200) || null
  }
  // CR-04: Validate each element of neededCategories — no arbitrary values or oversized strings
  if ("neededCategories" in body && Array.isArray(body.neededCategories)) {
    const cats = (body.neededCategories as unknown[])
      .filter((c): c is string => typeof c === "string")
      .map(c => c.trim().slice(0, 100))
      .slice(0, 50)
    updates.neededCategories = JSON.stringify(cats)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
  }

  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data: updates,
    select: {
      id: true,
      eventName: true,
      eventDate: true,
      budget: true,
      guestCount: true,
      location: true,
    },
  })

  return NextResponse.json({
    ...updated,
    eventDate: updated.eventDate?.toISOString() ?? null,
  })
}
