import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: plannerId } = await params
  const ownership = await prisma.planner.findUnique({ where: { id: plannerId }, select: { userId: true } })
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const event = await prisma.plannerEvent.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      type: body.type || "task",
      color: body.color || "#f9a8d4",
      plannerId,
    },
  })
  return Response.json(event, { status: 201 })
}
