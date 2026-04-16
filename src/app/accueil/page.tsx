"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AntNav from "@/components/clone/AntNav"
import CreateEventModal from "@/components/clone/dashboard/CreateEventModal"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"


const QUICK_LINKS = [
  { emoji: "🔍", label: "Trouver un prestataire", href: "/explore"    },
  { emoji: "📋", label: "Mon planning",           href: "/planner"    },
  { emoji: "💬", label: "Messages",               href: "/messages"   },
  { emoji: "⭐", label: "Favoris",                href: "/favorites"  },
]

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })
}

type Planner = { id: string; coupleNames?: string | null; title?: string | null; weddingDate?: string | null; coverColor?: string | null; budget?: number | null; guestCount?: number | null }

export default function CloneAccueilPage() {
  const [planners, setPlanners] = useState<Planner[]>([])
  const [loaded, setLoaded] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/planners")
      .then(r => r.ok ? r.json() : null)
      .then((data: unknown) => { if (Array.isArray(data) && (data as Planner[]).length > 0) setPlanners(data as Planner[]) })
      .catch(() => {})
      .finally(() => setLoaded(true))

    fetch("/api/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: unknown) => { if (d && typeof d === "object" && "name" in d && typeof (d as { name: unknown }).name === "string") setFirstName(((d as { name: string }).name).split(" ")[0]) })
      .catch(() => {})
  }, [])

  return (
    <div className="ant-root" style={{ minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <AntNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, color: "var(--dash-text,#121317)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            Bonjour {loaded ? firstName : "…"} 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
            Bienvenue sur Momento. Retrouvez tous vos événements en un coup d&apos;œil.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 40 }}>
          {QUICK_LINKS.map(q => (
            <Link key={q.label} href={q.href} className="clone-card-white" style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderRadius: 14,
              background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
              textDecoration: "none", transition: "box-shadow 0.15s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <span style={{ fontSize: 20 }}>{q.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{q.label}</span>
            </Link>
          ))}
        </div>

        {/* Events section */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>Mes événements</h2>
          <button onClick={() => setShowCreateModal(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 999,
            background: G, color: "#fff", border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>+ Nouvel événement</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 48 }}>
          {planners.map(p => {
            const name = p.coupleNames || p.title || "Mon événement"
            const date = p.weddingDate
            const days = date ? daysUntil(date) : null
            const color = p.coverColor ?? "#E11D48"
            return (
              <Link key={p.id} href="/mes-prestataires" style={{ textDecoration: "none" }}>
                <div className="clone-card-white" style={{
                  background: "var(--dash-surface,#fff)", borderRadius: 20,
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  overflow: "hidden", transition: "box-shadow 0.2s",
                }}>
                  {/* Color band */}
                  <div style={{ height: 6, background: color }} />
                  <div style={{ padding: "20px 20px 18px" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 4px" }}>{name}</p>
                    {date && (
                      <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 14px" }}>{formatDate(date)}</p>
                    )}
                    <div style={{ display: "flex", gap: 16 }}>
                      {days !== null && (
                        <div>
                          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0,
                            backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {days}
                          </p>
                          <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>jours</p>
                        </div>
                      )}
                      {p.budget && (
                        <div>
                          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                            {p.budget.toLocaleString("fr-MA")}
                          </p>
                          <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>budget MAD</p>
                        </div>
                      )}
                      {p.guestCount && (
                        <div>
                          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>{p.guestCount}</p>
                          <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>invités</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Add event card */}
          <button onClick={() => setShowCreateModal(true)} style={{ textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", textAlign: "left" }}>
            <div className="clone-card-white" style={{
              background: "var(--dash-surface,#fff)", borderRadius: 20,
              border: "1px dashed rgba(183,191,217,0.5)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "32px 24px", textAlign: "center", minHeight: 130,
              transition: "background 0.15s",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", marginBottom: 10,
                background: "linear-gradient(140deg, rgba(225,29,72,0.08), rgba(147,51,234,0.08))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>+</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", margin: "0 0 4px" }}>Créer un événement</p>
              <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Mariage, anniversaire, corporate…</p>
            </div>
          </button>
        </div>

        {/* CTA explore */}
        <div style={{
          background: "var(--dash-surface-dark,#121317)", borderRadius: 24, padding: "32px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
              Trouvez les meilleurs prestataires
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              1 000+ prestataires vérifiés · 41 villes · 0% commission
            </p>
          </div>
          <CreateEventModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={() => { setShowCreateModal(false); router.push("/mes-prestataires"); router.refresh() }}
          />

          <Link href="/explore" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 999,
            background: G, color: "#fff",
            fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0,
          }}>
            Explorer l&apos;annuaire →
          </Link>
        </div>
      </div>
    </div>
  )
}
