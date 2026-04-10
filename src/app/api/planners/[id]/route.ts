import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function parseDate(val: unknown): Date | undefined {
  if (typeof val !== "string" || !val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

async function findPlannerOwnership(id: string) {
  return prisma.planner.findUnique({ where: { id }, select: { userId: true } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await findPlannerOwnership(id)
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
  const ownership = await findPlannerOwnership(id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const planner = await prisma.planner.update({
    where: { id },
    data: {
      title:       body.title,
      coupleNames: body.coupleNames,
      weddingDate: parseDate(body.weddingDate),
      budget:      body.budget !== undefined ? parseFloat(body.budget) : undefined,
      location:    body.location,
      coverColor:  typeof body.coverColor === "string" && HEX_COLOR.test(body.coverColor)
        ? body.coverColor
        : undefined,
    },
  })
  return Response.json(planner)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await findPlannerOwnership(id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.planner.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
