import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  if (typeof body.title !== "string" || !body.title.trim())
    return NextResponse.json({ error: "title requis." }, { status: 400 })

  let workspace = await prisma.workspace.findUnique({ where: { userId }, select: { id: true } })
  if (!workspace) {
    // Auto-create : un user peut être créé sans workspace (signup OAuth, etc.)
    workspace = await prisma.workspace.create({
      data: { userId },
      select: { id: true },
    })
  }

  let plannerId: string | null = null
  if (body.plannerId !== undefined && body.plannerId !== null) {
    if (typeof body.plannerId !== "string") return NextResponse.json({ error: "plannerId invalide." }, { status: 400 })
    // IDOR : planner doit appartenir au user
    const planner = await prisma.planner.findUnique({ where: { id: body.plannerId }, select: { userId: true } })
    if (!planner || planner.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    plannerId = body.plannerId
  }

  const task = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      plannerId,
      title: body.title.trim().slice(0, 300),
      category: typeof body.category === "string" ? body.category.trim().slice(0, 100) : null,
      dueDate: body.dueDate ? new Date(body.dueDate as string) : null,
      completed: false,
    },
  })

  return NextResponse.json(task, { status: 201 })
}
