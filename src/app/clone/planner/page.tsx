"use client"
import { useState, useEffect } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const MONTHS_LONG = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
const DAYS = ["L","M","M","J","V","S","D"]

const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",  date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",      date: "2026-06-21", color: "#7b5ea7" },
  { id: "3", name: "Anniversaire 30 ans Leila",date: "2026-05-10", color: "#e05a7b" },
]

type Task = { id: string; date: string; title: string; category: string; done: boolean; color: string }

const TASKS_BY_EVENT: Record<string, Task[]> = {
  "1": [
    { id:"p1",  date:"2026-04-20", title:"Confirmer le photographe",        category:"Prestataire", done:true,  color:"#818cf8" },
    { id:"p2",  date:"2026-05-02", title:"Dégustation traiteur",            category:"Prestataire", done:false, color:"#f59e0b" },
    { id:"p3",  date:"2026-05-15", title:"Choisir la robe / costume",       category:"Style",       done:false, color:"#f472b6" },
    { id:"p4",  date:"2026-05-30", title:"Commander les faire-part papier", category:"Invités",     done:false, color:"#60a5fa" },
    { id:"p5",  date:"2026-06-01", title:"Réserver le transport VIP",       category:"Logistique",  done:false, color:"#22c55e" },
    { id:"p6",  date:"2026-07-15", title:"Valider la playlist DJ",          category:"Musique",     done:false, color:"#a855f7" },
    { id:"p7",  date:"2026-08-01", title:"Préparer le plan de table",       category:"Invités",     done:false, color:"#60a5fa" },
    { id:"p8",  date:"2026-09-10", title:"Répétition cérémonie",            category:"Événement",   done:false, color:"#E11D48" },
    { id:"p9",  date:"2026-09-14", title:"Dernier état des lieux",          category:"Logistique",  done:false, color:"#22c55e" },
    { id:"p10", date:"2026-09-15", title:"🎉 Jour J — Mariage !",           category:"Événement",   done:false, color:"#E11D48" },
  ],
  "2": [
    { id:"q1", date:"2026-04-25", title:"Réserver la salle",               category:"Logistique",  done:true,  color:"#7b5ea7" },
    { id:"q2", date:"2026-05-10", title:"Envoyer les invitations",         category:"Invités",     done:false, color:"#60a5fa" },
    { id:"q3", date:"2026-06-01", title:"Confirmer le menu",               category:"Prestataire", done:false, color:"#f59e0b" },
    { id:"q4", date:"2026-06-15", title:"Essayage robes demoiselles",      category:"Style",       done:false, color:"#f472b6" },
    { id:"q5", date:"2026-06-21", title:"🎉 Jour J — Mariage Sara !",      category:"Événement",   done:false, color:"#7b5ea7" },
  ],
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`
}

function daysFromNow(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `il y a ${-diff}j`
  if (diff === 0) return "Aujourd'hui"
  return `dans ${diff}j`
}

/** Returns dots (colors) for tasks on a given YYYY-MM-DD in an event */
function getDotsForDay(tasks: Task[], year: number, month: number, day: number): string[] {
  const pad = (n: number) => String(n).padStart(2, "0")
  const key = `${year}-${pad(month + 1)}-${pad(day)}`
  return tasks.filter(t => t.date === key).map(t => t.color)
}

function MiniCalendar({ tasks, eventColor }: { tasks: Task[]; eventColor: string }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1)
  const totalDays = new Date(year, month + 1, 0).getDate()
  // Monday-based: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else { setMonth(m => m - 1) } }
  function next() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else { setMonth(m => m + 1) } }

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ background: "var(--dash-surface,#fff)", borderRadius: 18, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px 18px", minWidth: 280 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, color: "var(--dash-text-2,#6a6a71)", fontSize: 14 }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{MONTHS_LONG[month]} {year}</span>
        <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, color: "var(--dash-text-2,#6a6a71)", fontSize: 14 }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dots = getDotsForDay(tasks, year, month, day)
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "5px 2px", borderRadius: 8,
              background: isToday ? `${eventColor}18` : "transparent",
              border: isToday ? `1px solid ${eventColor}40` : "1px solid transparent",
            }}>
              <span style={{
                fontSize: 11, fontWeight: isToday ? 700 : 400,
                color: isToday ? eventColor : "var(--dash-text,#121317)",
                lineHeight: 1,
              }}>{day}</span>
              {dots.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap", justifyContent: "center" }}>
                  {dots.slice(0, 3).map((c, di) => (
                    <div key={di} style={{ width: 5, height: 5, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend — tasks this month */}
      {(() => {
        const pad = (n: number) => String(n).padStart(2, "0")
        const prefix = `${year}-${pad(month + 1)}-`
        const thisMonth = tasks.filter(t => t.date.startsWith(prefix))
        if (thisMonth.length === 0) return (
          <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", marginTop: 14, marginBottom: 0 }}>
            Aucune étape ce mois-ci
          </p>
        )
        return (
          <div style={{ marginTop: 14, borderTop: "1px solid var(--dash-divider,rgba(183,191,217,0.10))", paddingTop: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 8px" }}>Ce mois</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {thisMonth.slice(0, 4).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                </div>
              ))}
              {thisMonth.length > 4 && (
                <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>+{thisMonth.length - 4} autres</span>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default function ClonePlannerPage() {
  const [activeEventId, setActiveEventId] = useState("1")
  const [tasksByEvent, setTasksByEvent] = useState(TASKS_BY_EVENT)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskLabel, setNewTaskLabel] = useState("")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("momento_active_event")
      if (saved && EVENTS.find(e => e.id === saved)) setActiveEventId(saved)
    } catch {}
  }, [])

  function handleEventChange(id: string) {
    setActiveEventId(id)
    try { localStorage.setItem("momento_active_event", id) } catch {}
  }

  const activeEvent = EVENTS.find(e => e.id === activeEventId) ?? EVENTS[0]
  const items = tasksByEvent[activeEventId] ?? []

  function toggle(id: string) {
    setTasksByEvent(prev => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] ?? []).map(i => i.id === id ? { ...i, done: !i.done } : i),
    }))
  }

  function submitNewTask() {
    const label = newTaskLabel.trim()
    if (!label) return
    const newTask: Task = {
      id: `t${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      title: label,
      category: "Divers",
      done: false,
      color: activeEvent.color,
    }
    setTasksByEvent(prev => ({ ...prev, [activeEventId]: [...(prev[activeEventId] ?? []), newTask] }))
    setNewTaskLabel("")
    setAddingTask(false)
  }

  const done  = items.filter(i => i.done).length
  const total = items.length
  const pct   = total > 0 ? done / total : 0

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={EVENTS} activeEventId={activeEventId} onEventChange={handleEventChange} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "32px 32px 64px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              Planning
            </h1>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeEvent.color, display: "inline-block", flexShrink: 0 }} />
              {activeEvent.name}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>{done}/{total} étapes</span>
            <div style={{ width: 100, height: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.12))", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct * 100}%`, borderRadius: 99, background: G, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          {/* Timeline */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "var(--dash-faint-2,rgba(183,191,217,0.2))", borderRadius: 99 }} />

            {items.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", gap: 20, marginBottom: idx === items.length - 1 ? 0 : 6 }}>
                <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
                  <button
                    onClick={() => toggle(item.id)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      border: item.done ? "none" : `2px solid ${item.color}60`,
                      background: item.done ? G : "var(--dash-surface,#fff)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: item.done ? "0 2px 10px rgba(225,29,72,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "all 0.2s",
                    }}
                  >
                    {item.done
                      ? <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 16, color: "#fff", lineHeight: 1 }}>check</span>
                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    }
                  </button>
                </div>

                <div style={{
                  flex: 1, marginBottom: 16, padding: "14px 18px",
                  background: "var(--dash-surface,#fff)",
                  border: `1px solid ${item.done ? "var(--dash-border,rgba(183,191,217,0.15))" : `${item.color}25`}`,
                  borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  opacity: item.done ? 0.6 : 1, transition: "opacity 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", textDecoration: item.done ? "line-through" : "none" }}>
                      {item.title}
                    </span>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{daysFromNow(item.date)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 7px", borderRadius: 99, background: `${item.color}18`, color: item.color }}>{item.category}</span>
                    <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add task */}
            <div style={{ paddingLeft: 54, marginTop: 8 }}>
              {addingTask ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    autoFocus
                    value={newTaskLabel}
                    onChange={e => setNewTaskLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitNewTask(); if (e.key === "Escape") { setAddingTask(false); setNewTaskLabel("") } }}
                    placeholder="Nom de l'étape…"
                    style={{
                      flex: 1, padding: "8px 14px", borderRadius: 10, fontSize: 13,
                      border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                      background: "var(--dash-surface,#fff)", color: "var(--dash-text,#121317)",
                      outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button onClick={submitNewTask} style={{ padding: "8px 16px", borderRadius: 10, background: G, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ajouter</button>
                  <button onClick={() => { setAddingTask(false); setNewTaskLabel("") }} style={{ padding: "8px 12px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.07))", color: "var(--dash-text-2,#6a6a71)", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTask(true)}
                  style={{ padding: "10px 20px", borderRadius: 99, border: "1px dashed rgba(183,191,217,0.35)", background: "transparent", color: "var(--dash-text-3,#9a9aaa)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 15 }}>add</span>
                  Ajouter une étape
                </button>
              )}
            </div>
          </div>

          {/* Mini calendar — right panel */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <MiniCalendar tasks={items} eventColor={activeEvent.color} />
          </div>
        </div>
      </main>
    </div>
  )
}
