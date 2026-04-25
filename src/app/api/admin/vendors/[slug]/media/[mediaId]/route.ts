import { NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAdminAction } from "@/lib/adminAudit"

/**
 * DELETE /api/admin/vendors/[slug]/media/[mediaId]
 * Supprime la row VendorMedia + le blob Vercel correspondant.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; mediaId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { slug, mediaId } = await params

  const media = await prisma.vendorMedia.findUnique({
    where: { id: mediaId },
    select: { id: true, url: true, vendor: { select: { slug: true } } },
  })
  if (!media || media.vendor.slug !== slug) {
    return NextResponse.json({ error: "Media introuvable." }, { status: 404 })
  }

  // Best-effort blob delete (si le delete blob échoue, on supprime quand même la row)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try { await del(media.url) } catch (e) {
      console.error("[admin vendor media delete] blob del failed", e)
    }
  }

  await prisma.vendorMedia.delete({ where: { id: mediaId } })

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "vendor.media.delete",
    targetType: "Vendor",
    targetId:   slug,
    changes:    { mediaId: { from: mediaId, to: null }, url: { from: media.url, to: null } },
  })

  revalidatePath(`/vendor/${slug}`)
  revalidatePath("/explore")

  return NextResponse.json({ ok: true })
}
