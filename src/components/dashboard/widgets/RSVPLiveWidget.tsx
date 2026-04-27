"use client"
import { relativeTime } from "./_shared"

type RsvpStats = {
  viewCount: number
  confirmed: number
  plusOnes: number
  total: number
  recent: Array<{ id: string; guestName: string; attendingMain: boolean; createdAt?: string }>
}

function KpiCol({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3, #9a9aaa)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</div>
    </div>
  )
}

// WIDGET-CONTRACT : data = rsvpStats (depuis dashboard-data API) ; loading
// si rsvpStats undefined ; empty state si recent.length === 0.
export default function RSVPLiveWidget({ rsvpStats }: { rsvpStats?: RsvpStats }) {
  const stats = rsvpStats ?? { viewCount: 0, confirmed: 0, plusOnes: 0, total: 0, recent: [] }
  const loading = !rsvpStats
  return (
    <div style={{ padding: "14px 16px 14px", display: "flex", flexDirection: "column", gap: 12, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.10))" }}>
        <KpiCol value={stats.viewCount} label="vues" color="var(--dash-text, #121317)" />
        <KpiCol value={stats.confirmed} label="confirmés" color="#22c55e" />
        <KpiCol value={stats.plusOnes} label="+1" color="#9333EA" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0, overflow: "hidden" }}>
        {loading ? (
          <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3, #9a9aaa)", margin: 0 }}>Chargement…</p>
        ) : stats.recent.length === 0 ? (
          <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3, #9a9aaa)", margin: 0 }}>Aucune réponse pour le moment.</p>
        ) : (
          stats.recent.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: "var(--text-xs)" }}>
              <span style={{ color: "var(--dash-text, #121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: 500 }}>{r.guestName}</span>
              <span style={{ color: "var(--dash-text-3, #9a9aaa)", fontSize: "var(--text-2xs)" }}>{relativeTime(r.createdAt)}</span>
              <span style={{ color: r.attendingMain ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{r.attendingMain ? "✓" : "✗"}</span>
            </div>
          ))
        )}
      </div>
      <a href="/guests" style={{ marginTop: "auto", fontSize: "var(--text-2xs)", color: "var(--dash-text-2, #6a6a71)", textDecoration: "underline" }}>
        Voir tout →
      </a>
    </div>
  )
}
