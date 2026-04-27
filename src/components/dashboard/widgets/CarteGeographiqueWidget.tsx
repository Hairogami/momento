"use client"
import type { Guest } from "./_shared"

const GEO_COLORS = ["#818cf8","#f59e0b","#a855f7","#22c55e","#60a5fa","#f472b6"]

// WIDGET-CONTRACT : data = guests (DB via dashboard-data) ; empty state ok.
export default function CarteGeographiqueWidget({ guests }: { guests: Guest[] }) {
  const byCityRaw: Record<string, number> = {}
  guests.forEach(g => { const city = g.city ?? "Non renseignée"; byCityRaw[city] = (byCityRaw[city] ?? 0) + 1 })
  const cities = Object.entries(byCityRaw).sort((a, b) => b[1] - a[1])
  const total = guests.length
  if (total === 0) return (
    <div style={{ padding: "20px 16px", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>🗺️ Aucun invité enregistré</div>
  )
  const maxCount = cities[0]?.[1] ?? 1
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 7, boxSizing: "border-box" }}>
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {cities.length} ville{cities.length > 1 ? "s" : ""} · {total} invités
      </div>
      {cities.slice(0, 6).map(([city, count], idx) => (
        <div key={city} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--text-xs)", flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text,#121317)", width: 78, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", borderRadius: 99, background: GEO_COLORS[idx % GEO_COLORS.length], transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", width: 16, textAlign: "right", flexShrink: 0 }}>{count}</span>
        </div>
      ))}
      {cities.length > 6 && <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "right" }}>+{cities.length - 6} autres villes</div>}
    </div>
  )
}
