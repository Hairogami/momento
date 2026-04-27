import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const task = await prisma.task.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!task || task.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const data: Record<string, unknown> = {}

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean")
      return NextResponse.json({ error: "completed doit être un booléen." }, { status: 400 })
    data.completed = body.completed
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim())
      return NextResponse.json({ error: "title invalide." }, { status: 400 })
    data.title = body.title.trim().slice(0, 300)
  }
  if (body.category !== undefined) {
    data.category = typeof body.category === "string" ? body.category.trim().slice(0, 100) : null
  }
  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate as string) : null
  }

  const updated = await prisma.task.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!task || task.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
