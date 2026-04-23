import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EventSiteEditor from "./EventSiteEditor"

export const dynamic = "force-dynamic"

export default async function EventSitePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/dashboard/event-site")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? "free"
  if (plan === "free") {
    redirect("/upgrade?reason=pro-required&from=/dashboard/event-site")
  }

  // Récupère le planner actif (le plus récent non-trashed)
  const planner = await prisma.planner.findFirst({
    where: { userId: session.user.id, trashedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, coupleNames: true, weddingDate: true, location: true,
      eventType: true,
      eventSite: {
        include: { photos: { orderBy: { order: "asc" } } },
      },
    },
  })

  if (!planner) {
    // Pas d'événement → CTA création d'événement d'abord
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--dash-bg,#f7f7fb)" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 10px" }}>
            Créez d&apos;abord un événement
          </h1>
          <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 24px" }}>
            Le site événement est lié à un événement que vous organisez. Créez-en un pour commencer.
          </p>
          <a href="/accueil" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 12,
            background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff",
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}>
            Créer un événement →
          </a>
        </div>
      </div>
    )
  }

  return <EventSiteEditor planner={planner} eventSite={planner.eventSite} />
}
