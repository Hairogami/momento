import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import EventSiteList from "./EventSiteList"

export const dynamic = "force-dynamic"

/**
 * Page liste — affiche tous les sites événement de l'utilisateur (1 card par EventSite)
 * + sélecteur de planners orphelins (sans EventSite) pour création explicite.
 *
 * Plus d'auto-création silencieuse (refactor multi-events W1.1).
 */
export default async function EventSitesListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/dashboard/event-site")

  // Plan gating — Free → /upgrade
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? "free"
  if (!IS_DEV && plan === "free") {
    redirect("/upgrade?reason=pro-required&from=/dashboard/event-site")
  }

  // Charge tous les planners du user (non trashés) + leur EventSite associé (si existe)
  const planners = await prisma.planner.findMany({
    where: { userId: session.user.id, trashedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      coupleNames: true,
      weddingDate: true,
      eventType: true,
      eventSite: {
        select: {
          id: true,
          slug: true,
          published: true,
          template: true,
          palette: true,
          heroImageUrl: true,
          updatedAt: true,
        },
      },
    },
  })

  // Sépare en 2 listes : sites existants + planners sans site
  const sites = planners
    .filter(p => p.eventSite !== null)
    .map(p => ({
      planner: { id: p.id, title: p.title, coupleNames: p.coupleNames, weddingDate: p.weddingDate, eventType: p.eventType },
      site: p.eventSite!,
    }))

  const orphans = planners
    .filter(p => p.eventSite === null)
    .map(p => ({ id: p.id, title: p.title, coupleNames: p.coupleNames, weddingDate: p.weddingDate, eventType: p.eventType }))

  return <EventSiteList sites={sites} orphans={orphans} />
}
