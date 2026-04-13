import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

function parseDate(val: unknown): Date | undefined {
  if (typeof val !== "string" || !val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

async function getOwnedStep(id: string) {
  return prisma.step.findUnique({
    where: { id },
    select: { id: true, planner: { select: { userId: true } } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const { id } = await params
  const owned = await getOwnedStep(id)
  if (!owned || owned.planner.userId !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  const VALID_STATUS = ["todo", "in_progress", "done"]
  if (body.status !== undefined && !VALID_STATUS.includes(body.status as string)) {
    return Response.json({ error: "Statut invalide." }, { status: 400 })
  }

  // W14: Validate dueDate — parseDate returns undefined on invalid input, which
  // would leave the existing value unchanged. But an explicit invalid string
  // should be rejected rather than silently ignored.
  if (body.dueDate !== undefined && body.dueDate !== null) {
    const d = new Date(body.dueDate as string)
    if (isNaN(d.getTime())) return Response.json({ error: "dueDate invalide." }, { status: 400 })
  }

  const step = await prisma.step.update({
    where: { id },
    data: {
      title:       typeof body.title === "string"       ? body.title.trim().slice(0, 200)       : undefined,
      description: typeof body.description === "string" ? body.description.slice(0, 1000)       : undefined,
      status:      body.status !== undefined             ? (body.status as string)               : undefined,
      category:    typeof body.category === "string"    ? body.category.trim().slice(0, 100)    : undefined,
      dueDate: parseDate(body.dueDate),
    },
    include: { vendors: { include: { vendor: true } } },
  })
  return Response.json(step)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const { id } = await params
  const owned = await getOwnedStep(id)
  if (!owned || owned.planner.userId !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.step.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
