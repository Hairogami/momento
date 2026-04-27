import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"
import { GuestCreateSchema } from "@/lib/validations"

async function getUserId(): Promise<string | null> {
  if (IS_DEV) {
    const s = await requireSession()
    return s.user.id
  }
  const session = await auth()
  return session?.user?.id ?? null
}

export async function GET(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const plannerId = url.searchParams.get("plannerId")

  const workspace = await prisma.workspace.findUnique({ where: { userId }, select: { id: true } })
  if (!workspace) return NextResponse.json([])

  if (plannerId) {
    const planner = await prisma.planner.findUnique({ where: { id: plannerId }, select: { userId: true } })
    if (!planner || planner.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const guests = await prisma.guest.findMany({
    where: {
      workspaceId: workspace.id,
      ...(plannerId ? { plannerId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, rsvp: true, plusOne: true,
      tableNumber: true, notes: true, city: true, linkedRsvpId: true, createdAt: true,
    },
  })
  return NextResponse.json(guests)
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = GuestCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  let workspace = await prisma.workspace.findUnique({ where: { userId }, select: { id: true } })
  if (!workspace) {
    workspace = await prisma.workspace.create({ data: { userId }, select: { id: true } })
  }

  if (parsed.data.plannerId) {
    const planner = await prisma.planner.findUnique({ where: { id: parsed.data.plannerId }, select: { userId: true } })
    if (!planner || planner.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const guest = await prisma.guest.create({
    data: {
      workspaceId: workspace.id,
      plannerId: parsed.data.plannerId ?? null,
      name: parsed.data.name.trim().slice(0, 200),
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      rsvp: "pending",
    },
  })
  return NextResponse.json(guest, { status: 201 })
}
