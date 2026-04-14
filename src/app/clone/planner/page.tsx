"use client"
import { useState } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",  date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",       date: "2026-06-21", color: "#7b5ea7" },
]

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

type TimelineItem = {
  id: string; date: string; title: string; category: string
  done: boolean; color: string
}

const TIMELINE: TimelineItem[] = [
  { id: "p1",  date: "2026-04-20", title: "Confirmer le photographe",          category: "Prestataire", done: true,  color: "#818cf8" },
  { id: "p2",  date: "2026-05-02", title: "Dégustation traiteur",              category: "Prestataire", done: false, color: "#f59e0b" },
  { id: "p3",  date: "2026-05-15", title: "Choisir la robe / costume",         category: "Style",       done: false, color: "#f472b6" },
  { id: "p4",  date: "2026-05-30", title: "Commander les faire-part papier",   category: "Invités",     done: false, color: "#60a5fa" },
  { id: "p5",  date: "2026-06-01", title: "Réserver le transport VIP",         category: "Logistique",  done: false, color: "#22c55e" },
  { id: "p6",  date: "2026-07-15", title: "Valider la playlist DJ",            category: "Musique",     done: false, color: "#a855f7" },
  { id: "p7",  date: "2026-08-01", title: "Préparer le plan de table",         category: "Invités",     done: false, color: "#60a5fa" },
  { id: "p8",  date: "2026-09-10", title: "Répétition cérémonie",              category: "Événement",   done: false, color: "#E11D48" },
  { id: "p9",  date: "2026-09-14", title: "Dernier état des lieux du lieu",    category: "Logistique",  done: false, color: "#22c55e" },
  { id: "p10", date: "2026-09-15", title: "🎉 Jour J — Mariage !",             category: "Événement",   done: false, color: "#E11D48" },
]

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

function daysFromNow(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `il y a ${-diff}j`
  if (diff === 0) return "Aujourd'hui"
  return `dans ${diff}j`
}

export default function ClonePlannerPage() {
  const [items, setItems] = useState<TimelineItem[]>(TIMELINE)

  function toggle(id: string) {
    setItems(its => its.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  const done  = items.filter(i => i.done).length
  const total = items.length
  const pct   = total > 0 ? done / total : 0

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "#f7f7fb" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={EVENTS} activeEventId="1" onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "32px 32px 64px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "#121317", letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              Planning
            </h1>
            <p style={{ fontSize: 13, color: "#6a6a71", margin: 0 }}>
              Mariage Yasmine & Karim · 15 septembre 2026
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#9a9aaa" }}>{done}/{total} étapes</span>
            <div style={{ width: 100, height: 4, background: "rgba(183,191,217,0.15)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct * 100}%`, borderRadius: 99,
                background: G, transition: "width 0.5s",
              }} className="clone-progress-fill" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ maxWidth: 680, position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 17, top: 0, bottom: 0,
            width: 2, background: "rgba(183,191,217,0.2)", borderRadius: 99,
          }} />

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1
            return (
              <div key={item.id} style={{
                display: "flex", gap: 20,
                marginBottom: isLast ? 0 : 6,
              }}>
                {/* Timeline dot */}
                <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
                  <button
                    onClick={() => toggle(item.id)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      border: item.done ? "none" : `2px solid ${item.color}60`,
                      background: item.done ? G : "#fff",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: item.done ? "0 2px 10px rgba(225,29,72,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "all 0.2s",
                    }}
                  >
                    {item.done ? (
                      <span style={{
                        fontFamily: "'Google Symbols','Material Symbols Outlined'",
                        fontSize: 16, color: "#fff", lineHeight: 1,
                      }}>check</span>
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    )}
                  </button>
                </div>

                {/* Content card */}
                <div style={{
                  flex: 1, marginBottom: 16,
                  padding: "14px 18px",
                  background: "#fff",
                  border: `1px solid ${item.done ? "rgba(183,191,217,0.1)" : `${item.color}25`}`,
                  borderRadius: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  opacity: item.done ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }} className="clone-surface">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: "#121317",
                      textDecoration: item.done ? "line-through" : "none",
                    }}>
                      {item.title}
                    </span>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{daysFromNow(item.date)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "2px 7px", borderRadius: 99,
                      background: `${item.color}18`, color: item.color,
                    }}>{item.category}</span>
                    <span style={{ fontSize: 10, color: "#9a9aaa" }}>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add milestone */}
        <div style={{ marginTop: 8, paddingLeft: 54 }}>
          <button style={{
            padding: "10px 20px", borderRadius: 99,
            border: "1px dashed rgba(183,191,217,0.35)", background: "transparent",
            color: "#9a9aaa", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 15 }}>add</span>
            Ajouter une étape
          </button>
        </div>
      </main>
    </div>
  )
}
