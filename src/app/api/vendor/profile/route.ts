/**
 * GET   /api/vendor/profile — retourne les champs éditables du prestataire
 * PATCH /api/vendor/profile — met à jour les champs éditables
 *
 * Auth : role="vendor" + vendorSlug. IDOR : toutes les ops filtrent par le
 * slug lié à la session — l'utilisateur ne peut éditer QUE sa propre fiche.
 *
 * Champs protégés (non-éditables) : verified, featured, rating, reviewCount,
 * slug, id, userId, createdAt → contrôlés par l'admin / le système.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PRICE_RANGES = ["budget", "mid", "premium"] as const

// Un champ optionnel-nullable qui accepte "", null, undefined → null
const nullableString = (max: number) =>
  z.string().max(max).nullable().optional().transform(v =>
    v === undefined || v === null || v.trim() === "" ? null : v.trim()
  )

const ProfileUpdateSchema = z.object({
  name:        z.string().min(2).max(120).optional(),
  category:    z.string().min(2).max(60).optional(),
  description: nullableString(3000),
  city:        nullableString(80),
  region:      nullableString(80),
  address:     nullableString(200),
  phone:       nullableString(30),
  email:       z.string().email().max(120).nullable().optional().or(z.literal("").transform(() => null)),
  website:     z.string().url().max(300).nullable().optional().or(z.literal("").transform(() => null)),
  instagram:   nullableString(120),
  facebook:    nullableString(300),
  priceMin:    z.number().min(0).max(10_000_000).nullable().optional(),
  priceMax:    z.number().min(0).max(10_000_000).nullable().optional(),
  priceRange:  z.enum(PRICE_RANGES).nullable().optional().or(z.literal("").transform(() => null)),
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
  return { slug: user.vendorSlug }
}

export async function GET() {
  const ctx = await authVendor()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const vendor = await prisma.vendor.findUnique({
    where: { slug: ctx.slug },
    select: {
      name: true, slug: true, category: true, description: true,
      city: true, region: true, address: true,
      phone: true, email: true, website: true,
      instagram: true, facebook: true,
      priceMin: true, priceMax: true, priceRange: true,
      verified: true, featured: true,
    },
  })
  if (!vendor) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
  return NextResponse.json({ vendor })
}

export async function PATCH(req: NextRequest) {
  const ctx = await authVendor()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const body = await req.json().catch(() => null)
  const parsed = ProfileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  // Sanity : priceMin ≤ priceMax si les deux sont fournis
  const data = parsed.data
  if (data.priceMin != null && data.priceMax != null && data.priceMin > data.priceMax) {
    return NextResponse.json(
      { error: "Le prix minimum doit être inférieur au prix maximum." },
      { status: 400 }
    )
  }

  const updated = await prisma.vendor.update({
    where: { slug: ctx.slug },
    data,
    select: {
      name: true, slug: true, category: true, description: true,
      city: true, region: true, address: true,
      phone: true, email: true, website: true,
      instagram: true, facebook: true,
      priceMin: true, priceMax: true, priceRange: true,
      verified: true, featured: true,
    },
  })
  return NextResponse.json({ vendor: updated })
}
