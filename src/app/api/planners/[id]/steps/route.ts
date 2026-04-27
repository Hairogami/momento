import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: plannerId } = await params
  const ownership = await prisma.planner.findUnique({ where: { id: plannerId }, select: { userId: true } })
  if (!ownership || ownership.userId !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  // WR-03: Validate title and description
  if (!body.title || typeof body.title !== "string") {
    return Response.json({ error: "title requis." }, { status: 400 })
  }
  const title = body.title.trim().slice(0, 200)
  const description = typeof body.description === "string" ? body.description.slice(0, 1000) : null

  const lastStep = await prisma.step.findFirst({
    where: { plannerId },
    orderBy: { order: "desc" },
  })

  // W14: Validate dueDate before storing — invalid dates produce Invalid Date in JS
  let dueDate: Date | null = null
  if (body.dueDate) {
    const d = new Date(body.dueDate as string)
    if (isNaN(d.getTime())) return Response.json({ error: "dueDate invalide." }, { status: 400 })
    dueDate = d
  }

  const step = await prisma.step.create({
    data: {
      title,
      description,
      category: typeof body.category === "string" ? body.category.slice(0, 100) : "general",
      dueDate,
      order: (lastStep?.order ?? -1) + 1,
      plannerId,
    },
    include: { vendors: { include: { vendor: true } } },
  })
  return Response.json(step, { status: 201 })
}
