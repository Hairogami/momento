import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import EventSiteEditor from "../EventSiteEditor"

export const dynamic = "force-dynamic"

/**
 * Page éditeur d'un site événement spécifique (W1.3).
 * Adressage par ID → ownership check obligatoire (planner.userId === session.user.id).
 * Plus de findFirst silencieux — l'utilisateur arrive ici après avoir cliqué une card sur la liste.
 */
export default async function EventSiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) redirect(`/login?next=/dashboard/event-site/${id}`)

  // Plan gating — Free user redirige vers upgrade (sauf en dev local)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? "free"
  if (!IS_DEV && plan === "free") {
    redirect("/upgrade?reason=pro-required&from=/dashboard/event-site")
  }

  // Charge le site avec planner + photos. Ownership check obligatoire.
  const site = await prisma.eventSite.findUnique({
    where: { id },
    include: {
      planner: true,
      photos: { orderBy: { order: "asc" } },
    },
  })
  if (!site) notFound()
  if (site.planner.userId !== session.user.id) notFound()

  return (
    <EventSiteEditor
      planner={{
        id: site.planner.id,
        title: site.planner.title,
        coupleNames: site.planner.coupleNames,
        weddingDate: site.planner.weddingDate,
        location: site.planner.location,
        eventType: site.planner.eventType,
      }}
      eventSite={{
        id: site.id,
        slug: site.slug,
        published: site.published,
        template: site.template,
        palette: site.palette,
        fontHeading: site.fontHeading,
        fontBody: site.fontBody,
        heroImageUrl: site.heroImageUrl,
        layoutVariant: site.layoutVariant,
        content: site.content,
        photos: site.photos.map(p => ({ id: p.id, url: p.url, caption: p.caption })),
      }}
    />
  )
}
