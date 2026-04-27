"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import PageSkeleton from "@/components/clone/PageSkeleton"

type NotifItem = {
  id: string
  type: "message" | "rsvp"
  title: string
  snippet: string
  href: string
  createdAt: string
  read: boolean
}

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime()
  if (isNaN(d)) return ""
  const diff = Date.now() - d
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}j`
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function iconFor(type: NotifItem["type"]): string {
  return type === "message" ? "💬" : "✓"
}

export default function NotificationsPage() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [notifs, setNotifs] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setNotifs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleEventChange(id: string) {
    setActiveEventId(id)
    try { localStorage.setItem("momento_active_event", id) } catch {}
  }

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try { await fetch(`/api/notifications/${id}/read`, { method: "PATCH" }) }
    catch { /* silent */ }
  }

  async function markAllRead() {
    const unread = notifs.filter(n => !n.read)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    await Promise.all(unread.map(n =>
      fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => null)
    ))
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={handleEventChange} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text, #121317)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Notifications {unreadCount > 0 && (
                <span style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: 999, background: G, color: "#fff", marginLeft: 8, verticalAlign: "middle" }}>{unreadCount}</span>
              )}
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2, #6a6a71)", margin: 0 }}>
              Tes dernières activités et alertes.
            </p>
          </div>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} style={{
              padding: "6px 14px", borderRadius: 999,
              background: "var(--dash-surface, #fff)",
              color: "var(--dash-text-2, #6a6a71)",
              border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
              fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              ✓ Tout marquer comme lu
            </button>
          )}
        </header>

        {loading ? (
          <PageSkeleton variant="list" />
        ) : notifs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.18))",
            borderRadius: 16,
          }}>
            <p style={{ fontSize: "var(--text-2xl)", margin: "0 0 16px" }}>🔔</p>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text, #121317)", margin: "0 0 8px" }}>
              Aucune notification
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2, #6a6a71)", margin: 0 }}>
              Tu seras notifié ici des nouveaux messages et réponses RSVP.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifs.map(n => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => { if (!n.read) void markRead(n.id) }}
                style={{
                  background: "var(--dash-surface, #fff)",
                  border: "1px solid var(--dash-border, rgba(183,191,217,0.18))",
                  borderRadius: 16, padding: "14px 18px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  textDecoration: "none", color: "inherit",
                  opacity: n.read ? 0.65 : 1,
                  transition: "opacity 0.2s, transform 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "color-mix(in srgb, var(--g1,#E11D48) 35%, transparent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--dash-border, rgba(183,191,217,0.18))" }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: n.read ? "var(--dash-faint-2, rgba(183,191,217,0.18))" : G,
                  color: n.read ? "var(--dash-text-3, #9a9aaa)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-base)", flexShrink: 0,
                }}>{iconFor(n.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--dash-text, #121317)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3, #9a9aaa)", flexShrink: 0 }}>
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2, #6a6a71)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.snippet}
                  </p>
                </div>
                {!n.read && (
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: G, flexShrink: 0, marginTop: 14 }} />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
