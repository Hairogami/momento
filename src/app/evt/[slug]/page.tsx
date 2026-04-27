import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import EventSiteRenderer from "@/components/event-site/EventSiteRenderer"

export const revalidate = 3600 // ISR 1h

/**
 * Pas de pré-rendu au build — on-demand ISR.
 * Chaque site est généré à la première visite puis caché 1h.
 */
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await prisma.eventSite.findUnique({
    where: { slug },
    select: { content: true, template: true, published: true, modStatus: true },
  })

  const fallback: Metadata = {
    title: "Événement non trouvé — Momento",
    robots: { index: false, follow: false },
  }

  if (!site || !site.published || site.modStatus !== "ok") return fallback

  const c = site.content as Record<string, unknown> | null
  const hero = (c?.hero as Record<string, string> | undefined) ?? {}
  const title = hero.title ?? "Notre événement"
  const subtitle = hero.subtitle ?? hero.date ?? ""

  return {
    title: `${title} — ${subtitle || "Momento"}`,
    description: "Retrouvez toutes les infos et confirmez votre présence.",
    robots: { index: false, follow: false, nocache: true }, // privacy + pas de pollution SEO
    openGraph: {
      title,
      description: subtitle,
      type: "website",
    },
  }
}

export default async function EventSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await prisma.eventSite.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { order: "asc" }, select: { id: true, url: true, caption: true } },
      planner: { select: { userId: true } },
    },
  })

  if (!site || !site.published || site.modStatus !== "ok") {
    notFound()
  }

  // Incrémente view count — non-bloquant, exclut owner et bots
  try {
    const session = await auth().catch(() => null)
    const isOwner = session?.user?.id === site.planner.userId
    const ua = (await headers()).get("user-agent") ?? ""
    const isBot = /bot|crawler|spider|googlebot|bingbot|yahoo|duckduck|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp/i.test(ua)
    if (!isOwner && !isBot) {
      prisma.eventSite
        .update({ where: { id: site.id }, data: { viewCount: { increment: 1 } } })
        .catch(() => {})
    }
  } catch {
    // tracking jamais bloquant
  }

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
