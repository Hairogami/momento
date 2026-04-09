import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (IS_DEV) {
    const body = await req.json()
    return NextResponse.json({ id: params.id, ...body })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const task = await prisma.task.findUnique({ where: { id: params.id }, select: { workspace: { select: { userId: true } } } })
  if (!task || task.workspace.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: { ...(body.completed !== undefined && { completed: body.completed }) },
  })
  return NextResponse.json(updated)
}
