import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RsvpPatchSchema } from "@/lib/validations"
import { getUserId } from "@/lib/api-auth"

async function checkOwnership(rsvpId: string, userId: string): Promise<boolean> {
  const rsvp = await prisma.eventRsvp.findUnique({
    where: { id: rsvpId },
    select: { eventSite: { select: { planner: { select: { userId: true } } } } },
  })
  return rsvp?.eventSite?.planner?.userId === userId
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await checkOwnership(id, userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = RsvpPatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  const updated = await prisma.eventRsvp.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await checkOwnership(id, userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.eventRsvp.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
