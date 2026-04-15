import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function parseDate(val: unknown): Date | undefined {
  if (typeof val !== "string" || !val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

// WR-01: Safe budget parse — rejects NaN, Infinity, negatives
function parseBudget(val: unknown): number | undefined {
  if (val === undefined) return undefined
  const n = parseFloat(String(val))
  if (!isFinite(n) || n < 0) return undefined
  return n
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
        include: {
          vendors: {
            include: {
              vendor: { select: { id: true, name: true, slug: true, category: true } },
            },
          },
        },
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

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }
  const planner = await prisma.planner.update({
    where: { id },
    data: {
      title:       typeof body.title === "string"       ? body.title.trim().slice(0, 200)       : undefined,
      coupleNames: typeof body.coupleNames === "string" ? body.coupleNames.trim().slice(0, 200) : undefined,
      weddingDate: parseDate(body.weddingDate),
      budget:      parseBudget(body.budget),
      guestCount:  typeof body.guestCount === "number" && Number.isInteger(body.guestCount) && body.guestCount >= 0
        ? body.guestCount
        : undefined,
      location:    typeof body.location === "string"    ? body.location.trim().slice(0, 200)    : undefined,
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
