/**
 * GET    /api/vendor/packages — liste les packages du vendor connecté
 * POST   /api/vendor/packages — crée un package
 *
 * Auth : role="vendor" + vendorSlug. IDOR-safe : on résout le vendor.id
 * depuis le slug de l'user et on filtre toutes les ops dessus.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PackageCreateSchema = z.object({
  name:        z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  price:       z.number().min(0).max(10_000_000),
  duration:    z.string().max(80).nullable().optional(),
  includes:    z.string().max(2000).nullable().optional(),
  maxGuests:   z.number().int().min(0).max(100_000).nullable().optional(),
  available:   z.boolean().optional(),
})

async function authVendor() {
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
  return { vendorId: vendor.id }
}

export async function GET() {
  const ctx = await authVendor()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const packages = await prisma.package.findMany({
    where: { vendorId: ctx.vendorId },
    orderBy: [{ available: "desc" }, { price: "asc" }],
  })
  return NextResponse.json({ packages })
}

export async function POST(req: NextRequest) {
  const ctx = await authVendor()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const body = await req.json().catch(() => null)
  const parsed = PackageCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  // Cap à 10 packages par vendor pour éviter l'abus
  const count = await prisma.package.count({ where: { vendorId: ctx.vendorId } })
  if (count >= 10) {
    return NextResponse.json({ error: "Limite de 10 packages atteinte." }, { status: 400 })
  }

  const pkg = await prisma.package.create({
    data: { ...parsed.data, vendorId: ctx.vendorId },
  })
  return NextResponse.json({ package: pkg }, { status: 201 })
}
