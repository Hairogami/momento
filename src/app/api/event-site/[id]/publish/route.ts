import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/event-site/[id]/publish
 * Bascule published=true. Refuse si plan = free (paywall).
 * Body optionnel : { publish: boolean } — par défaut true. { publish: false } = unpublish.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const site = await prisma.eventSite.findUnique({
    where: { id },
    select: { id: true, slug: true, planner: { select: { userId: true } } },
  })
  if (!site || site.planner.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? "free"

  let publish = true
  try {
    const b = await req.json() as { publish?: boolean }
    if (typeof b?.publish === "boolean") publish = b.publish
  } catch {}

  if (publish && plan === "free") {
    return NextResponse.json(
      { error: "Publication réservée aux abonnés Pro et Max.", upgradeUrl: "/upgrade?reason=pro-required&from=event-site" },
      { status: 402 },
    )
  }

  const updated = await prisma.eventSite.update({
    where: { id },
    data: { published: publish },
    select: { id: true, slug: true, published: true },
  })
  return NextResponse.json({
    ...updated,
    publicUrl: publish ? `/evt/${updated.slug}` : null,
  })
}
