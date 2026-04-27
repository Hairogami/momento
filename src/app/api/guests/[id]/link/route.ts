import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"
import { GuestLinkSchema } from "@/lib/validations"

async function getUserId(): Promise<string | null> {
  if (IS_DEV) {
    const s = await requireSession()
    return s.user.id
  }
  const session = await auth()
  return session?.user?.id ?? null
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: guestId } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = GuestLinkSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { workspace: { select: { userId: true } } },
  })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const rsvp = await prisma.eventRsvp.findUnique({
    where: { id: parsed.data.rsvpId },
    select: { attendingMain: true, eventSite: { select: { planner: { select: { userId: true } } } } },
  })
  if (!rsvp || rsvp.eventSite.planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: {
      linkedRsvpId: parsed.data.rsvpId,
      rsvp: rsvp.attendingMain ? "yes" : "no",
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: guestId } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { workspace: { select: { userId: true } } },
  })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: { linkedRsvpId: null },
  })
  return NextResponse.json(updated)
}
