"use client"
import { useState } from "react"
import { G, type Guest } from "./_shared"

// WIDGET-CONTRACT VIOLATION (extraSent) :
// "Faire-parts envoyés" = compteur localStorage per-event. Pas modélisé en DB.
// Acceptable car c'est un compteur low-stakes — perdre = pas grave.
export default function EnvoiFairepartWidget({ guests, eventId }: { guests: Guest[]; eventId: string }) {
  const total = guests.length
  const responded = guests.filter(g => g.rsvp !== "pending").length
  const [extraSent, setExtraSent] = useState(() => { try { return parseInt(localStorage.getItem(`fairpart_sent_${eventId}`) ?? "0") || 0 } catch { return 0 } })
  const [input, setInput] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const totalSent = Math.min(total, extraSent)
  const pctSent = total > 0 ? Math.round((totalSent / total) * 100) : 0
  const pctResp = total > 0 ? Math.round((responded / total) * 100) : 0
  function handleAdd() {
    const n = parseInt(input) || 0
    const newVal = Math.min(total, extraSent + n)
    setExtraSent(newVal)
    setInput("")
    try { localStorage.setItem(`fairpart_sent_${eventId}`, String(newVal)) } catch {}
  }
  function handleMarkAll() {
    setExtraSent(total)
    try { localStorage.setItem(`fairpart_sent_${eventId}`, String(total)) } catch {}
    setShowPopup(false)
  }
  if (total === 0) return (
    <div style={{ padding: "20px 16px", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>💌 Aucun invité enregistré</div>
  )
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {[
        { label: "Faire-part envoyés", count: totalSent, pct: pctSent, color: "#60a5fa", icon: "📤" },
        { label: "Réponses reçues",    count: responded, pct: pctResp, color: "#22c55e", icon: "📬" },
      ].map(({ label, count, pct, color, icon }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--dash-text-2,#45474D)" }}><span>{icon}</span>{label}</span>
            <span style={{ fontWeight: 700, color }}>{count}/{total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.5s" }} />
          </div>
        </div>
      ))}
      <button onClick={() => setShowPopup(v => !v)}
        style={{ alignSelf: "flex-start", marginTop: 2, fontSize: "var(--text-2xs)", padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Marquer envoyés
      </button>
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>Faire-parts envoyés</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input type="number" min={1} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd() }}
              placeholder="Combien envoyés…"
              style={{ flex: 1, fontSize: "var(--text-xs)", padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-faint,rgba(183,191,217,0.04))", outline: "none", fontFamily: "inherit", color: "var(--dash-text,#121317)" }} />
            <button onClick={handleAdd}
              style={{ padding: "5px 10px", borderRadius: 8, background: G, color: "#fff", border: "none", cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 600, fontFamily: "inherit" }}>+</button>
          </div>
          <button onClick={handleMarkAll}
            style={{ width: "100%", padding: "6px", borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", color: "var(--dash-text-2,#45474D)", cursor: "pointer", fontSize: "var(--text-xs)", fontFamily: "inherit" }}>
            ✓ Tout marquer envoyé ({total})
          </button>
        </div>
      )}
    </div>
  )
}
