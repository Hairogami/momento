import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/eventSiteSlug"
import EventSiteEditor from "./EventSiteEditor"

export const dynamic = "force-dynamic"

const FAMILY_TO_TEMPLATE: Record<string, string> = {
  mariage: "mariage",
  fete: "fete-famille",
  naissance: "fete-famille",
  milestones: "fete-famille",
  corporate: "corporate",
  conference: "conference",
  religieux: "generique",
  caritatif: "generique",
  loisirs: "generique",
  autre: "generique",
}

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

  if (!planner) return <NoPlannerEmptyState />

  // Auto-création si pas de site → évite toute race entre client/serveur
  if (!planner.eventSite) {
    const template = FAMILY_TO_TEMPLATE[planner.eventType ?? "autre"] ?? "generique"
    const baseName = planner.coupleNames || planner.title || "event"
    const slug = await generateUniqueSlug(baseName)
    await prisma.eventSite.create({
      data: {
        plannerId: planner.id,
        slug,
        template,
        content: {
          hero: { title: baseName, subtitle: "", date: null },
          program: [],
          welcomeNote: "",
        },
      },
    })
    // Re-query avec les photos (vide au début mais cohérent)
    const refreshed = await prisma.planner.findUnique({
      where: { id: planner.id },
      select: {
        id: true, title: true, coupleNames: true, weddingDate: true, location: true, eventType: true,
        eventSite: { include: { photos: { orderBy: { order: "asc" } } } },
      },
    })
    if (!refreshed?.eventSite) redirect("/dashboard/event-site")
    return <EventSiteEditor planner={refreshed} eventSite={refreshed.eventSite} />
  }

  return <EventSiteEditor planner={planner} eventSite={planner.eventSite} />
}

function NoPlannerEmptyState() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
      background: "var(--dash-bg, #0b0b10)",
      fontFamily: "'Geist', sans-serif",
    }}>
      <div style={{
        position: "relative",
        maxWidth: 560, width: "100%", textAlign: "center",
        padding: "56px 40px",
        borderRadius: 28,
        background: "var(--dash-surface, #16171e)",
        border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
        overflow: "hidden",
        boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
      }}>
        <div aria-hidden style={{ position: "absolute", top: -100, right: -100, width: 260, height: 260, background: "radial-gradient(circle, rgba(225,29,72,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -80, left: -80, width: 200, height: 200, background: "radial-gradient(circle, rgba(147,51,234,0.18), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-block",
            padding: "5px 14px",
            background: "linear-gradient(135deg,#E11D48,#9333EA)",
            color: "#fff",
            fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase",
            borderRadius: 99,
            marginBottom: 22,
          }}>
            Site événement
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
            fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15,
            color: "var(--dash-text, #eeeef5)",
            margin: "0 0 14px",
          }}>
            Un mini-site public pour vos invités
          </h1>

          <p style={{
            fontSize: 14, lineHeight: 1.6,
            color: "var(--dash-text-2, #b0b0cc)",
            margin: "0 auto 28px",
            maxWidth: 420,
          }}>
            Programme, lieu, RSVP, photos — tout ce que vos invités doivent savoir, dans un design unique. Partageable en un lien WhatsApp.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
            marginBottom: 28,
            padding: "18px 14px",
            background: "var(--dash-faint, rgba(255,255,255,0.04))",
            border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
            borderRadius: 14,
          }}>
            {[
              { emoji: "📍", label: "Maps + Waze" },
              { emoji: "💌", label: "RSVP invités" },
              { emoji: "🖼️", label: "Galerie photo" },
            ].map(f => (
              <div key={f.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{f.emoji}</div>
                <div style={{ fontSize: 11, color: "var(--dash-text-3, #8888aa)", fontWeight: 500 }}>{f.label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12.5, color: "var(--dash-text-3, #8888aa)", margin: "0 0 16px" }}>
            Le site est lié à votre événement. Créez-en un d&apos;abord.
          </p>

          <a href="/accueil" style={{
            display: "inline-block",
            padding: "13px 28px",
            background: "linear-gradient(135deg,#E11D48,#9333EA)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14, fontWeight: 700,
            borderRadius: 12,
            boxShadow: "0 10px 26px rgba(225,29,72,0.32)",
          }}>
            Créer mon événement →
          </a>
        </div>
      </div>
    </div>
  )
}
