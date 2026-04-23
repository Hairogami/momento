import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * POST /api/event-site/[id]/photos
 * Upload une photo (multipart/form-data, champ `file`).
 * Si champ `kind=hero`, met à jour EventSite.heroImageUrl directement.
 * Sinon crée une ligne EventSitePhoto.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const site = await prisma.eventSite.findUnique({
    where: { id },
    select: { id: true, planner: { select: { userId: true } }, photos: { select: { id: true } } },
  })
  if (!site || site.planner.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file")
  const kind = (formData.get("kind") as string) ?? "gallery"

  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: "Format non supporté (JPG/PNG/WebP seulement)." }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier > 5 MB." }, { status: 413 })

  if (kind !== "hero" && site.photos.length >= 20) {
    return NextResponse.json({ error: "Limite de 20 photos atteinte dans la galerie." }, { status: 400 })
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg"
  const key = `event-sites/${id}/${kind}-${Date.now()}.${ext}`

  const blob = await put(key, file, { access: "public", addRandomSuffix: true })

  if (kind === "hero") {
    await prisma.eventSite.update({
      where: { id },
      data: { heroImageUrl: blob.url },
    })
    return NextResponse.json({ url: blob.url })
  } else {
    const photo = await prisma.eventSitePhoto.create({
      data: {
        eventSiteId: id,
        url: blob.url,
        order: site.photos.length,
      },
      select: { id: true, url: true, order: true },
    })
    return NextResponse.json(photo, { status: 201 })
  }
}
