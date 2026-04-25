import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAdminAction, diffFields } from "@/lib/adminAudit"
import { z } from "zod"

const PatchSchema = z.object({
  name:        z.string().min(1).max(200),
  category:    z.string().min(1).max(100),
  description: z.string().max(2000).nullable(),
  city:        z.string().max(100).nullable(),
  region:      z.string().max(100).nullable(),
  address:     z.string().max(500).nullable(),
  priceMin:    z.number().min(0).nullable(),
  priceMax:    z.number().min(0).nullable(),
  priceRange:  z.string().max(40).nullable(),
  phone:       z.string().max(30).nullable(),
  email:       z.string().email().max(200).nullable().or(z.literal("").transform(() => null)),
  website:     z.string().max(500).nullable(),
  instagram:   z.string().max(200).nullable(),
  facebook:    z.string().max(200).nullable(),
  rating:      z.number().min(0).max(5).nullable(),
  verified:    z.boolean(),
  featured:    z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 })
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const { slug } = await params
  const body = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }
  const data = parsed.data

  // ── Fetch "before" for diff ────────────────────────────────────────────────
  const before = await prisma.vendor.findUnique({
    where: { slug },
    select: {
      name: true, category: true, description: true, city: true, region: true, address: true,
      priceMin: true, priceMax: true, priceRange: true,
      phone: true, email: true, website: true, instagram: true, facebook: true,
      rating: true, verified: true, featured: true,
    },
  })
  if (!before) {
    return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  await prisma.vendor.update({ where: { slug }, data })

  const changes = diffFields(before as Record<string, unknown>, data as Record<string, unknown>)

  // ── Audit + revalidate ─────────────────────────────────────────────────────
  if (Object.keys(changes).length > 0) {
    await logAdminAction({
      adminId:    me.id,
      adminEmail: me.email,
      action:     "vendor.update",
      targetType: "Vendor",
      targetId:   slug,
      changes,
    })
  }

  // Rafraîchit la fiche publique + liste explore + sitemap
  revalidatePath(`/vendor/${slug}`)
  revalidatePath("/explore")
  revalidatePath("/sitemap.xml")

  return NextResponse.json({ success: true, changedFields: Object.keys(changes) })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 })
  }

  const { slug } = await params
  const target = await prisma.vendor.findUnique({ where: { slug }, select: { id: true, name: true } })
  if (!target) {
    return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
  }

  await prisma.vendor.delete({ where: { slug } })

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "vendor.delete",
    targetType: "Vendor",
    targetId:   slug,
    changes:    { name: { from: target.name, to: null } },
  })

  revalidatePath("/explore")
  revalidatePath("/sitemap.xml")

  return NextResponse.json({ ok: true })
}
