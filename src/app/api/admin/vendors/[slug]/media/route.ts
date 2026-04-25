import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAdminAction } from "@/lib/adminAudit"

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 30

/**
 * POST /api/admin/vendors/[slug]/media
 * Upload (multipart/form-data, champ `file`) → crée une row VendorMedia.
 * Revalide la fiche publique + /explore.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { slug } = await params
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    select: { id: true, _count: { select: { media: true } } },
  })
  if (!vendor) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })

  if (vendor._count.media >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Limite de ${MAX_PHOTOS} photos atteinte.` }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: "Format non supporté (JPG/PNG/WebP)." }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier > 5 MB." }, { status: 413 })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob non configuré (BLOB_READ_WRITE_TOKEN manquant)." },
      { status: 500 },
    )
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg"
  const key = `vendors/${slug}/${Date.now()}.${ext}`

  let blob: { url: string }
  try {
    blob = await put(key, file, { access: "public" })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erreur inconnue"
    return NextResponse.json({ error: `Upload Blob échoué : ${msg}` }, { status: 502 })
  }

  const created = await prisma.vendorMedia.create({
    data: {
      vendorId: vendor.id,
      url:      blob.url,
      type:     "image",
      order:    vendor._count.media,
    },
    select: { id: true, url: true, order: true, createdAt: true },
  })

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "vendor.media.add",
    targetType: "Vendor",
    targetId:   slug,
    changes:    { mediaId: { from: null, to: created.id }, url: { from: null, to: created.url } },
  })

  revalidatePath(`/vendor/${slug}`)
  revalidatePath("/explore")

  return NextResponse.json({ media: created })
}
