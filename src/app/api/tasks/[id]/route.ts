import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const task = await prisma.task.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!task || task.workspace.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "completed doit être un booléen." }, { status: 400 })
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { ...(body.completed !== undefined && { completed: body.completed as boolean }) },
  })
  return NextResponse.json(updated)
}
