import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

async function assertOwnedPlanner(id: string, userId: string) {
  return prisma.planner.findUnique({ where: { id }, select: { userId: true } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await assertOwnedPlanner(id, session.user.id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const planner = await prisma.planner.findUnique({
    where: { id },
    include: {
      steps: {
        include: { vendors: { include: { vendor: true } } },
        orderBy: { order: "asc" },
      },
      events: { orderBy: { date: "asc" } },
    },
  })
  if (!planner) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(planner)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await assertOwnedPlanner(id, session.user.id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const planner = await prisma.planner.update({
    where: { id },
    data: {
      title: body.title,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      budget: body.budget !== undefined ? parseFloat(body.budget) : undefined,
      location: body.location,
      coverColor: body.coverColor,
    },
  })
  return Response.json(planner)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await assertOwnedPlanner(id, session.user.id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.planner.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
