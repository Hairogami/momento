import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, photoId } = await params

  const site = await prisma.eventSite.findUnique({
    where: { id },
    select: { id: true, planner: { select: { userId: true } } },
  })
  if (!site || site.planner.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const photo = await prisma.eventSitePhoto.findUnique({
    where: { id: photoId },
    select: { id: true, url: true, eventSiteId: true },
  })
  if (!photo || photo.eventSiteId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    await del(photo.url)
  } catch {
    // Si le blob n'existe plus côté Vercel, on continue à supprimer la row DB
  }

  await prisma.eventSitePhoto.delete({ where: { id: photoId } })

  return NextResponse.json({ ok: true })
}
