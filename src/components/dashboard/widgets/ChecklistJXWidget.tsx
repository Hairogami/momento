"use client"
import { useState } from "react"
import type { Task, TaskPriority } from "./_shared"

// WIDGET-CONTRACT : data = tasks (DB via dashboard-data) + extra (state local in-memory)
// → l'extra disparaît au refresh. Délibéré pour ce widget secondaire.
// TODO future : si on veut persister extra → POST /api/tasks comme renderTasks.
export default function ChecklistJXWidget({ tasks, eventDate }: { tasks: Task[]; eventDate: string }) {
  const now = Date.now()
  const jDay = new Date(eventDate).getTime()
  const [extra, setExtra] = useState<Task[]>([])
  const [input, setInput] = useState("")
  const upcoming = [...tasks, ...extra].filter(t => !t.done).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 6)

  function handleAdd() {
    if (!input.trim()) return
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
    setExtra(p => [...p, { id: `x${Date.now()}`, label: input.trim(), done: false, priority: "moyenne" as TaskPriority, dueDate, category: "Custom" }])
    setInput("")
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 6, boxSizing: "border-box" }}>
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
        {Math.max(0, Math.ceil((jDay - now) / 86400000))} jours avant J
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, overflowY: "auto", maxHeight: 160 }}>
        {upcoming.length === 0 && <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Tout est à jour 🎉</div>}
        {upcoming.map(t => {
          const days = Math.ceil((new Date(t.dueDate).getTime() - now) / 86400000)
          const color = days < 7 ? "#ef4444" : days < 30 ? "#f59e0b" : "#22c55e"
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
              <span style={{ fontSize: "var(--text-2xs)", color, fontWeight: 600, flexShrink: 0 }}>J-{Math.max(0, days)}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))", paddingTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="+ Ajouter un item (Entrée)"
          style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "transparent", fontSize: "var(--text-xs)", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
      </div>
    </div>
  )
}
