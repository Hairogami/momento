"use client"
import { useState, useEffect } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import PageSkeleton from "@/components/clone/PageSkeleton"

type Notification = { id: string; message: string; read: boolean; createdAt: string; type?: string }

export default function CloneNotificationsPage() {
  const { events, activeEventId } = usePlanners()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/unread")
      .then(r => r.json())
      .then(d => { setNotifs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Notifications
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)", margin: "0 0 28px" }}>
          Tes dernières activités et alertes.
        </p>

        {loading ? (
          <PageSkeleton variant="list" />
        ) : notifs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "var(--dash-surface,#fff)",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
            borderRadius: 20,
          }}>
            <p style={{ fontSize: "var(--text-2xl)", margin: "0 0 16px" }}>🔔</p>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text,#121317)", margin: "0 0 8px" }}>
              Aucune notification
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
              Tu seras notifié ici des nouvelles activités.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifs.map(n => (
              <div key={n.id} style={{
                background: "var(--dash-surface,#fff)",
                border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
                borderRadius: 16, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 14,
                opacity: n.read ? 0.6 : 1,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: n.read ? "var(--dash-border,rgba(183,191,217,0.4))" : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text,#121317)", margin: "0 0 4px", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>
                    {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
