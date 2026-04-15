/**
 * GET  /api/vendor/templates — liste les templates de l'user connecté
 * POST /api/vendor/templates — crée un template
 *
 * Auth : role="vendor" (pas besoin de vendorSlug — les templates sont liés
 * à userId, pas vendorId, cf. schema VendorTemplate).
 * IDOR-safe : filtrage par userId.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const LANGS = ["fr", "ar", "darija"] as const

const TemplateCreateSchema = z.object({
  title: z.string().min(1).max(120),
  body:  z.string().min(1).max(4000),
  lang:  z.enum(LANGS).optional(),
  order: z.number().int().min(0).max(1000).optional(),
})

async function authVendorUser() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non authentifié.", status: 401 as const }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, vendorSlug: true },
  })
  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return { error: "Accès réservé aux prestataires.", status: 403 as const }
  }
  return { userId: user.id }
}

export async function GET() {
  const ctx = await authVendorUser()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const templates = await prisma.vendorTemplate.findMany({
    where: { userId: ctx.userId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  const ctx = await authVendorUser()
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const body = await req.json().catch(() => null)
  const parsed = TemplateCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  // Cap 20 templates par user
  const count = await prisma.vendorTemplate.count({ where: { userId: ctx.userId } })
  if (count >= 20) {
    return NextResponse.json({ error: "Limite de 20 templates atteinte." }, { status: 400 })
  }

  const tpl = await prisma.vendorTemplate.create({
    data: {
      userId: ctx.userId,
      title:  parsed.data.title,
      body:   parsed.data.body,
      lang:   parsed.data.lang  ?? "fr",
      order:  parsed.data.order ?? count, // append par défaut
    },
  })
  return NextResponse.json({ template: tpl }, { status: 201 })
}
