import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

async function getOwnedStep(id: string, userId: string) {
  return prisma.step.findUnique({
    where: { id },
    select: { id: true, planner: { select: { userId: true } } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const owned = await getOwnedStep(id, session.user.id)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const step = await prisma.step.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
    include: { vendors: { include: { vendor: true } } },
  })
  return Response.json(step)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const owned = await getOwnedStep(id, session.user.id)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.step.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
