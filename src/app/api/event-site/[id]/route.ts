import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** Vérif ownership via planner → userId */
async function requireOwnership(eventSiteId: string, userId: string) {
  const site = await prisma.eventSite.findUnique({
    where: { id: eventSiteId },
    select: { id: true, planner: { select: { userId: true } } },
  })
  if (!site) return null
  if (site.planner.userId !== userId) return null
  return site
}

/**
 * GET /api/event-site/[id] — owner only. Retourne tout le site + photos.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const ok = await requireOwnership(id, session.user.id)
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const site = await prisma.eventSite.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
      _count: { select: { rsvps: true } },
    },
  })
  return NextResponse.json(site)
}

/**
 * PATCH /api/event-site/[id] — owner only. Update config + content.
 * Champs acceptés : template, palette, fontHeading, fontBody, heroImageUrl,
 * layoutVariant, content (JSON libre).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const ok = await requireOwnership(id, session.user.id)
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  const data: Record<string, unknown> = {}
  const ALLOWED_TEMPLATES = new Set(["mariage", "fete-famille", "corporate", "conference", "generique"])
  const ALLOWED_PALETTES = new Set(["terracotta", "rose-or", "vert-olive", "bleu-marine", "noir-blanc", "pastel"])
  const ALLOWED_FONTS = new Set(["cormorant", "pjs", "inter", "playfair", "poppins"])
  const ALLOWED_LAYOUTS = new Set(["classic", "modern", "minimal"])

  if (typeof b.template === "string" && ALLOWED_TEMPLATES.has(b.template)) data.template = b.template
  if (typeof b.palette === "string" && ALLOWED_PALETTES.has(b.palette)) data.palette = b.palette
  if (typeof b.fontHeading === "string" && ALLOWED_FONTS.has(b.fontHeading)) data.fontHeading = b.fontHeading
  if (typeof b.fontBody === "string" && ALLOWED_FONTS.has(b.fontBody)) data.fontBody = b.fontBody
  if (typeof b.layoutVariant === "string" && ALLOWED_LAYOUTS.has(b.layoutVariant)) data.layoutVariant = b.layoutVariant
  if (b.heroImageUrl === null) data.heroImageUrl = null
  else if (typeof b.heroImageUrl === "string" && /^https?:\/\//.test(b.heroImageUrl)) data.heroImageUrl = b.heroImageUrl
  if (b.content && typeof b.content === "object" && !Array.isArray(b.content)) data.content = b.content

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour." }, { status: 400 })
  }

  const updated = await prisma.eventSite.update({
    where: { id },
    data,
    select: { id: true, slug: true, template: true, palette: true, fontHeading: true, fontBody: true, layoutVariant: true, heroImageUrl: true, content: true, published: true, updatedAt: true },
  })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/event-site/[id] — owner only. Suppression définitive.
 * Cascade : photos + rsvps supprimés (onDelete Cascade).
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const ok = await requireOwnership(id, session.user.id)
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.eventSite.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
