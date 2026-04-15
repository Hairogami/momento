/**
 * PATCH  /api/vendor/packages/[id] — met à jour un package
 * DELETE /api/vendor/packages/[id] — supprime un package
 *
 * Auth : role="vendor" + vendorSlug. IDOR-safe : on vérifie que le package
 * appartient bien au vendor connecté avant toute opération.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PackageUpdateSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  price:       z.number().min(0).max(10_000_000).optional(),
  duration:    z.string().max(80).nullable().optional(),
  includes:    z.string().max(2000).nullable().optional(),
  maxGuests:   z.number().int().min(0).max(100_000).nullable().optional(),
  available:   z.boolean().optional(),
})

async function authAndOwn(packageId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non authentifié.", status: 401 as const }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return { error: "Accès réservé aux prestataires.", status: 403 as const }
  }
  const vendor = await prisma.vendor.findUnique({
    where: { slug: user.vendorSlug },
    select: { id: true },
  })
  if (!vendor) return { error: "Prestataire introuvable.", status: 404 as const }

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { id: true, vendorId: true },
  })
  if (!pkg) return { error: "Package introuvable.", status: 404 as const }
  if (pkg.vendorId !== vendor.id) {
    return { error: "Accès refusé.", status: 403 as const }
  }
  return { vendorId: vendor.id, packageId: pkg.id }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await authAndOwn(id)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const body = await req.json().catch(() => null)
  const parsed = PackageUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const updated = await prisma.package.update({
    where: { id: ctx.packageId },
    data: parsed.data,
  })
  return NextResponse.json({ package: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await authAndOwn(id)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  await prisma.package.delete({ where: { id: ctx.packageId } })
  return NextResponse.json({ success: true })
}
