"use client"
import { useState } from "react"
import type { Guest } from "./_shared"

const DIET_OPTIONS_LIST = [
  { key: "Halal",      icon: "☪️", color: "#60a5fa" },
  { key: "Végétarien", icon: "🥗", color: "#22c55e" },
  { key: "Vegan",      icon: "🌱", color: "#16a34a" },
  { key: "Sans gluten",icon: "🌾", color: "#f59e0b" },
  { key: "Allergie",   icon: "⚠️", color: "#ef4444" },
]

// WIDGET-CONTRACT VIOLATION (diets) :
// Guest a un champ `diet?` dans le type front mais l'API dashboard-data ne
// le hydrate pas (`diet: undefined` côté serveur). Les diets restent en local
// state, perdus au refresh. TODO future : étendre Guest schema + dashboard-data.
export default function RegimesWidget({ guests }: { guests: Guest[] }) {
  const [diets, setDiets] = useState<Record<string, string>>({})
  const [showPopup, setShowPopup] = useState(false)
  const counts: Record<string, number> = {}
  Object.values(diets).filter(Boolean).forEach(d => { counts[d] = (counts[d] ?? 0) + 1 })
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  const confirmed = guests.filter(g => g.rsvp === "yes")
  const shown = confirmed.length > 0 ? confirmed : guests

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {DIET_OPTIONS_LIST.filter(d => counts[d.key] > 0).map(d => (
        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--text-sm)", flexShrink: 0 }}>{d.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-2xs)", marginBottom: 2 }}>
              <span style={{ color: "var(--dash-text-2,#45474D)" }}>{d.key}</span>
              <span style={{ fontWeight: 700, color: d.color }}>{counts[d.key]}</span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
              <div style={{ width: `${total > 0 ? (counts[d.key] / total) * 100 : 0}%`, height: "100%", background: d.color }} />
            </div>
          </div>
        </div>
      ))}
      {total === 0 && <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "4px 0" }}>Aucun régime assigné</div>}
      <button onClick={() => setShowPopup(v => !v)} style={{ alignSelf: "flex-start", fontSize: "var(--text-2xs)", padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Assigner régimes
      </button>
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>Régimes alimentaires</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {shown.slice(0, 10).map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1, fontSize: "var(--text-xs)", color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {DIET_OPTIONS_LIST.map(d => (
                    <button key={d.key} onClick={() => setDiets(p => ({ ...p, [g.id]: p[g.id] === d.key ? "" : d.key }))}
                      title={d.key} style={{
                        width: 22, height: 22, borderRadius: 6, cursor: "pointer", fontSize: "var(--text-xs)",
                        border: diets[g.id] === d.key ? `1.5px solid ${d.color}` : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                        background: diets[g.id] === d.key ? `${d.color}22` : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{d.icon}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
