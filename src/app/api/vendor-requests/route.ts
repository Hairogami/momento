import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })

  if (user?.role !== "vendor") {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  if (!user?.vendorSlug) {
    return NextResponse.json({ requests: [] })
  }

  const requests = await prisma.contactRequest.findMany({
    where: { vendorSlug: user.vendorSlug },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ requests })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })

  if (user?.role !== "vendor") {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  let reqBody: { id?: unknown; status?: unknown }
  try { reqBody = await req.json() } catch {
    return NextResponse.json({ error: "Requ�te invalide." }, { status: 400 })
  }
  const { id, status } = reqBody
  if (typeof id !== "string" || !["pending", "read", "replied"].includes(status as string)) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 })
  }

  const request = await prisma.contactRequest.findUnique({ where: { id } })
  if (!request || request.vendorSlug !== user?.vendorSlug) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 })
  }

  await prisma.contactRequest.update({ where: { id }, data: { status: status as string } })

  return NextResponse.json({ ok: true })
}
