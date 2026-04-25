import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ALLOWED_TEMPLATES, templateForEventType } from "@/lib/eventTemplateMapping"
import { isAdminUser } from "@/lib/adminAuth"
import { IS_DEV } from "@/lib/devMock"

const ALLOWED_IMAGE_HOSTS = [
  "blob.vercelusercontent.com",
  "public.blob.vercel-storage.com",
  ".vercel-storage.com",
]
const MAX_CONTENT_BYTES = 64 * 1024 // 64 KB pour le JSON content

/** Vérif ownership via planner → userId */
async function requireOwnership(eventSiteId: string, userId: string) {
  const site = await prisma.eventSite.findUnique({
    where: { id: eventSiteId },
    select: {
      id: true,
      planner: { select: { userId: true, eventType: true } },
    },
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

  const ownership = await requireOwnership(id, session.user.id)
  if (!ownership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Plan gating (W3.2) — Free user ne peut pas PATCH son site (paywall cohérent avec POST)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const isAdmin = await isAdminUser(session.user.id)
  if (!IS_DEV && !isAdmin && (me?.plan ?? "free") === "free") {
    return NextResponse.json(
      { error: "Plan Pro requis pour modifier votre site événement.", upgradeUrl: "/upgrade?reason=pro-required&from=event-site" },
      { status: 402 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  const data: Record<string, unknown> = {}
  const ALLOWED_PALETTES = new Set(["terracotta", "rose-or", "vert-olive", "baby-tiffany", "noir-rouge", "pastel"])
  const ALLOWED_FONTS = new Set(["cormorant", "pjs", "inter", "playfair", "poppins"])
  const ALLOWED_LAYOUTS = new Set(["classic", "modern", "minimal"])

  // Template lock selon eventType (W2.2) — admin escape
  if (typeof b.template === "string" && ALLOWED_TEMPLATES.has(b.template)) {
    const expected = templateForEventType(ownership.planner.eventType)
    if (b.template === expected || isAdmin) {
      data.template = b.template
    } else {
      return NextResponse.json(
        { error: `Template doit correspondre au type d'événement "${ownership.planner.eventType}".` },
        { status: 400 },
      )
    }
  }

  if (typeof b.palette === "string" && ALLOWED_PALETTES.has(b.palette)) data.palette = b.palette
  if (typeof b.fontHeading === "string" && ALLOWED_FONTS.has(b.fontHeading)) data.fontHeading = b.fontHeading
  if (typeof b.fontBody === "string" && ALLOWED_FONTS.has(b.fontBody)) data.fontBody = b.fontBody
  if (typeof b.layoutVariant === "string" && ALLOWED_LAYOUTS.has(b.layoutVariant)) data.layoutVariant = b.layoutVariant

  // heroImageUrl whitelist domaine (W3.5) — uniquement Vercel Blob, sauf admin
  if (b.heroImageUrl === null) {
    data.heroImageUrl = null
  } else if (typeof b.heroImageUrl === "string" && /^https?:\/\//.test(b.heroImageUrl)) {
    try {
      const url = new URL(b.heroImageUrl)
      const allowed = ALLOWED_IMAGE_HOSTS.some(h => h.startsWith(".") ? url.hostname.endsWith(h) : url.hostname === h)
      if (!allowed && !isAdmin) {
        return NextResponse.json({ error: "Domaine d'image non autorisé. Utilisez l'uploader." }, { status: 400 })
      }
      data.heroImageUrl = b.heroImageUrl
    } catch {
      return NextResponse.json({ error: "URL d'image invalide." }, { status: 400 })
    }
  }

  // Content size limit 64 KB (W3.3) — protège contre payload massif
  if (b.content && typeof b.content === "object" && !Array.isArray(b.content)) {
    const contentSize = JSON.stringify(b.content).length
    if (contentSize > MAX_CONTENT_BYTES) {
      return NextResponse.json(
        { error: `Contenu trop volumineux (${Math.ceil(contentSize / 1024)} KB / max 64 KB).` },
        { status: 413 },
      )
    }
    data.content = b.content
  }

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
