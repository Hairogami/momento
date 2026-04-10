import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const item = await prisma.budgetItem.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!item || item.workspace.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const actualRaw = body.actual
  const actual = actualRaw === null ? null
    : (typeof actualRaw === "number" && isFinite(actualRaw) && actualRaw >= 0 ? actualRaw : undefined)

  const updated = await prisma.budgetItem.update({
    where: { id },
    data: { ...(actual !== undefined && { actual }) },
  })
  return NextResponse.json(updated)
}
