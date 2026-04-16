"use client"
import { useState, useEffect } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type Status = "confirmé" | "en attente" | "décliné"
type Guest = { id: string; name: string; table: string; status: Status; phone?: string }

const STATUS_COLORS: Record<Status, string> = {
  "confirmé":   "#22c55e",
  "en attente": "#f59e0b",
  "décliné":    "#ef4444",
}


const FILTERS: { label: string; value: Status | "tous" }[] = [
  { label: "Tous",       value: "tous"       },
  { label: "Confirmés",  value: "confirmé"   },
  { label: "En attente", value: "en attente" },
  { label: "Déclinés",   value: "décliné"    },
]

export default function CloneGuestsPage() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [guestsByEvent, setGuestsByEvent] = useState<Record<string, Guest[]>>({})
  const [filter, setFilter]   = useState<Status | "tous">("tous")
  const [search, setSearch]   = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName]   = useState("")
  const [newTable, setNewTable] = useState("Table 1")
  const [newPhone, setNewPhone] = useState("")


  function handleEventChange(id: string) {
    setActiveEventId(id)
    try { localStorage.setItem("momento_active_event", id) } catch {}
  }

  const activeEvent = events.find(e => e.id === activeEventId) ?? events[0] ?? { id: "", name: "", date: "", color: "#E11D48" }
  const guests = guestsByEvent[activeEventId] ?? []

  const confirmed  = guests.filter(g => g.status === "confirmé").length
  const pending    = guests.filter(g => g.status === "en attente").length
  const declined   = guests.filter(g => g.status === "décliné").length

  const filtered = guests
    .filter(g => filter === "tous" || g.status === filter)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.table.toLowerCase().includes(search.toLowerCase()))

  function setStatus(id: string, status: Status) {
    setGuestsByEvent(prev => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] ?? []).map(g => g.id === id ? { ...g, status } : g),
    }))
  }

  function addGuest() {
    const name = newName.trim()
    if (!name) return
    const guest: Guest = { id: `g${Date.now()}`, name, table: newTable, status: "en attente", phone: newPhone.trim() || undefined }
    setGuestsByEvent(prev => ({ ...prev, [activeEventId]: [...(prev[activeEventId] ?? []), guest] }))
    setNewName(""); setNewPhone(""); setShowAdd(false)
  }

  const tables = [...new Set(guests.map(g => g.table))].sort()

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={handleEventChange} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main className="pb-20 md:pb-0" style={{ flex: 1, padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px) 64px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Invités</h1>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeEvent.color, display: "inline-block" }} />
              {activeEvent.name}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{ padding: "10px 20px", borderRadius: 99, background: G, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >+ Ajouter un invité</button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ marginBottom: 24, padding: "20px 24px", background: "var(--dash-surface,#fff)", borderRadius: 16, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 16px" }}>Nouvel invité</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom complet…" onKeyDown={e => e.key === "Enter" && addGuest()} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Téléphone (opt.)" style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <select value={newTable} onChange={e => setNewTable(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {[...tables, "Nouvelle table"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={addGuest} style={{ padding: "9px 20px", borderRadius: 10, background: G, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ajouter</button>
              <button onClick={() => { setShowAdd(false); setNewName(""); setNewPhone("") }} style={{ padding: "9px 16px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.07))", color: "var(--dash-text-2,#6a6a71)", border: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total",      value: guests.length, color: "var(--dash-text,#121317)" },
            { label: "Confirmés",  value: confirmed,     color: "#22c55e" },
            { label: "En attente", value: pending,       color: "#f59e0b" },
            { label: "Déclinés",   value: declined,      color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--dash-surface,#fff)", borderRadius: 16, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "16px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0, letterSpacing: "-0.04em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "7px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  background: filter === f.value ? G : "var(--dash-faint,rgba(183,191,217,0.07))",
                  color: filter === f.value ? "#fff" : "var(--dash-text-2,#6a6a71)",
                }}
              >{f.label}</button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un invité ou une table…"
            style={{ flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-surface,#fff)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }}
          />
        </div>

        {/* Guest list */}
        <div style={{ overflowX: "auto" }}>
        <div style={{ background: "var(--dash-surface,#fff)", borderRadius: 18, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", minWidth: 480 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.10))", display: "flex", gap: 12 }}>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)" }}>Nom</span>
            <span style={{ width: 80, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)" }}>Table</span>
            <span style={{ width: 120, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)" }}>Téléphone</span>
            <span style={{ width: 110, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)" }}>Statut</span>
          </div>

          {filtered.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "32px 0" }}>Aucun invité trouvé</p>
          )}

          {filtered.map((g, i) => (
            <div key={g.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "13px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--dash-divider,rgba(183,191,217,0.10))" : "none",
            }}>
              {/* Avatar */}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${activeEvent.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: activeEvent.color, flexShrink: 0 }}>
                {g.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
              <span style={{ width: 80, fontSize: 12, color: "var(--dash-text-2,#6a6a71)" }}>{g.table}</span>
              <span style={{ width: 120, fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>{g.phone ?? "—"}</span>
              <div style={{ width: 110, flexShrink: 0 }}>
                <select
                  value={g.status}
                  onChange={e => setStatus(g.id, e.target.value as Status)}
                  style={{
                    width: "100%", padding: "5px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                    background: `${STATUS_COLORS[g.status]}18`, color: STATUS_COLORS[g.status], outline: "none",
                  }}
                >
                  <option value="confirmé">✓ Confirmé</option>
                  <option value="en attente">⏳ En attente</option>
                  <option value="décliné">✗ Décliné</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>
    </div>
  )
}
