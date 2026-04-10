import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const guest = await prisma.guest.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!guest || guest.workspace.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const VALID_RSVP = ["PENDING", "CONFIRMED", "DECLINED"]
  if (body.rsvp !== undefined && !VALID_RSVP.includes(body.rsvp as string)) {
    return NextResponse.json({ error: "Valeur rsvp invalide." }, { status: 400 })
  }

  const updated = await prisma.guest.update({
    where: { id },
    data: { ...(body.rsvp !== undefined && { rsvp: body.rsvp as string }) },
  })
  return NextResponse.json(updated)
}
