import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

/**
 * POST /api/planners/[id]/restore
 * Restaure un événement depuis la corbeille (trashedAt → null).
 *
 * Refuse si l'utilisateur a déjà un événement LIVE (non-trashed). L'utilisateur
 * doit d'abord mettre son event actuel en corbeille.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const planner = await prisma.planner.findUnique({
    where: { id },
    select: { userId: true, trashedAt: true },
  })
  if (!planner || planner.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!planner.trashedAt) {
    return Response.json({ error: "Cet événement n'est pas dans la corbeille." }, { status: 400 })
  }

  // Free = 1 live max. Pro/Max = illimité.
  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = (userRow?.plan ?? "free") as string
  if (plan === "free") {
    const liveCount = await prisma.planner.count({
      where: { userId: session.user.id, trashedAt: null },
    })
    if (liveCount >= 1) {
      return Response.json(
        { error: "Le plan Free est limité à 1 événement en cours. Passez Pro pour restaurer sans restriction, ou mettez l'actuel en corbeille." },
        { status: 409 },
      )
    }
  }

  const restored = await prisma.planner.update({
    where: { id },
    data: { trashedAt: null },
    select: { id: true, title: true, trashedAt: true },
  })
  return Response.json(restored)
}
