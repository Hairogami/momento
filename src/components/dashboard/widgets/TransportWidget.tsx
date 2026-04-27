"use client"
import { useState } from "react"
import type { Guest } from "./_shared"

// WIDGET-CONTRACT : data = guests (DB, prop) + date/time/selected (localStorage local).
// Logistique transport pas modélisée en DB → localStorage acceptable côté MVP.
export default function TransportWidget({ guests, eventId }: { guests: Guest[]; eventId: string }) {
  const [date, setDate] = useState(() => { try { return localStorage.getItem(`transport_date_${eventId}`) ?? "" } catch { return "" } })
  const [time, setTime] = useState(() => { try { return localStorage.getItem(`transport_time_${eventId}`) ?? "" } catch { return "" } })
  const [selected, setSelected] = useState<string[]>(() => { try { const s = localStorage.getItem(`transport_guests_${eventId}`); return s ? JSON.parse(s) : [] } catch { return [] } })
  const [showPicker, setShowPicker] = useState(false)
  function saveDate(v: string) { setDate(v); try { localStorage.setItem(`transport_date_${eventId}`, v) } catch {} }
  function saveTime(v: string) { setTime(v); try { localStorage.setItem(`transport_time_${eventId}`, v) } catch {} }
  function toggleGuest(id: string) {
    setSelected(p => {
      const next = p.includes(id) ? p.filter(x => x !== id) : [...p, id]
      try { localStorage.setItem(`transport_guests_${eventId}`, JSON.stringify(next)) } catch {}
      return next
    })
  }
  const confirmed = guests.filter(g => g.rsvp === "yes")
  const estVehicles = Math.ceil(Math.max(1, confirmed.length) / 4)
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }} onMouseDown={e => e.stopPropagation()}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div style={{ borderRadius: 10, padding: "7px 10px", background: "var(--dash-faint,rgba(183,191,217,0.08))" }}>
          <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--g1,#E11D48)" }}>{confirmed.length}</div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>invités confirmés</div>
        </div>
        <div style={{ borderRadius: 10, padding: "7px 10px", background: "var(--dash-faint,rgba(183,191,217,0.08))" }}>
          <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>~{estVehicles}</div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>véhicules estimés</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="date" value={date} onChange={e => saveDate(e.target.value)}
          style={{ flex: 1, fontSize: "var(--text-xs)", padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,rgba(183,191,217,0.06))", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
        <input type="time" value={time} onChange={e => saveTime(e.target.value)}
          style={{ width: 76, fontSize: "var(--text-xs)", padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,rgba(183,191,217,0.06))", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
      </div>
      <button onClick={() => setShowPicker(v => !v)}
        style={{ alignSelf: "flex-start", fontSize: "var(--text-2xs)", padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        {selected.length > 0 ? `${selected.length} invité(s) assigné(s)` : "+ Assigner des invités"}
      </button>
      {showPicker && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 100, overflowY: "auto", padding: "6px 8px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))" }}>
          {guests.slice(0, 10).map(g => (
            <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(g.id)} onChange={() => toggleGuest(g.id)} style={{ accentColor: "var(--g1,#E11D48)" }} />
              <span style={{ color: "var(--dash-text,#121317)" }}>{g.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
