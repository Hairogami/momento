import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { GuestPatchSchema } from "@/lib/validations"
import { getUserId } from "@/lib/api-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = GuestPatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  const guest = await prisma.guest.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.guest.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const guest = await prisma.guest.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.guest.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
