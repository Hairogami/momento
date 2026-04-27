"use client"
import Link from "next/link"
import type { Task } from "./_shared"

// WIDGET-CONTRACT : data = tasks (DB via dashboard-data) ; pas de write.
export default function TimelineWidget({ tasks, eventDate }: { tasks: Task[]; eventDate: string }) {
  void eventDate
  const sorted = [...tasks].filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 7)
  if (sorted.length === 0) return <div style={{ padding: "20px 16px", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Aucune tâche planifiée</div>
  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ position: "relative", paddingLeft: 20 }}>
        <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 1, background: "var(--dash-border,rgba(183,191,217,0.3))" }} />
        {sorted.map(t => {
          const past = new Date(t.dueDate).getTime() < Date.now()
          const dot = t.done ? "#22c55e" : past ? "var(--g1,#E11D48)" : "var(--dash-border,rgba(183,191,217,0.6))"
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 10, position: "relative" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 2, marginLeft: -19, border: "2px solid var(--dash-surface,#fff)", zIndex: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--dash-text,#121317)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 }}>{t.label}</p>
                <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", margin: "2px 0 0" }}>{new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Link href="/planner" style={{ fontSize: "var(--text-2xs)", color: "var(--g1,#E11D48)", alignSelf: "flex-end", textDecoration: "none" }}>Voir le planning →</Link>
    </div>
  )
}
