import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EventSiteRenderer from "@/components/event-site/EventSiteRenderer"

export const dynamic = "force-dynamic"

/**
 * Route preview — réservée à l'owner du site, pas d'ISR, pas de publish requis.
 * Utilisée dans l'iframe de l'éditeur pour voir le rendu en temps réel.
 */
export default async function EventSitePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const site = await prisma.eventSite.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" }, select: { id: true, url: true, caption: true } },
      planner: { select: { userId: true } },
    },
  })
  if (!site || site.planner.userId !== session.user.id) notFound()

  return (
    <EventSiteRenderer
      site={{
        slug: site.slug,
        template: site.template,
        palette: site.palette,
        fontHeading: site.fontHeading,
        fontBody: site.fontBody,
        heroImageUrl: site.heroImageUrl,
        layoutVariant: site.layoutVariant,
        content: site.content,
        photos: site.photos,
      }}
    />
  )
}

export const metadata = {
  title: "Preview — Momento",
  robots: { index: false, follow: false },
}
