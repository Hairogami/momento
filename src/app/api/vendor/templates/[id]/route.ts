/**
 * PATCH  /api/vendor/templates/[id] — met à jour un template
 * DELETE /api/vendor/templates/[id] — supprime un template
 *
 * Auth : role="vendor". IDOR-safe : template.userId === session.user.id.
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const LANGS = ["fr", "ar", "darija"] as const

const TemplateUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  body:  z.string().min(1).max(4000).optional(),
  lang:  z.enum(LANGS).optional(),
  order: z.number().int().min(0).max(1000).optional(),
})

async function authAndOwn(templateId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non authentifié.", status: 401 as const }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, vendorSlug: true },
  })
  if (!user || !user.vendorSlug || (user.role !== "vendor" && user.role !== "admin")) {
    return { error: "Accès réservé aux prestataires.", status: 403 as const }
  }

  const tpl = await prisma.vendorTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, userId: true },
  })
  if (!tpl) return { error: "Template introuvable.", status: 404 as const }
  if (tpl.userId !== user.id) return { error: "Accès refusé.", status: 403 as const }
  return { templateId: tpl.id }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await authAndOwn(id)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const body = await req.json().catch(() => null)
  const parsed = TemplateUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const updated = await prisma.vendorTemplate.update({
    where: { id: ctx.templateId },
    data: parsed.data,
  })
  return NextResponse.json({ template: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await authAndOwn(id)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  await prisma.vendorTemplate.delete({ where: { id: ctx.templateId } })
  return NextResponse.json({ success: true })
}
