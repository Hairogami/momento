"use client"
import type { Task, Booking } from "./_shared"

// WIDGET-CONTRACT : data = pure compute depuis tasks/budget/bookings/guests/eventDate.
// Pas de state, pas de write. Empty case géré (alerts.length === 0 → ✅).
export default function AlertesWidget({ tasks, budget, budgetSpent, bookings, guestCount, guestConfirmed, eventDate }: {
  tasks: Task[]; budget: number; budgetSpent: number
  bookings: Booking[]; guestCount: number; guestConfirmed: number; eventDate: string
}) {
  const now = Date.now()
  const daysLeft = Math.ceil((new Date(eventDate).getTime() - now) / 86400000)
  const overdue = tasks.filter(t => !t.done && new Date(t.dueDate).getTime() < now).length
  const budgetWarn = budget > 0 && budgetSpent / budget > 0.8
  const nonContacted = bookings.filter(b => b.status === "INQUIRY").length
  const pendingRatio = guestCount > 0 ? (guestCount - guestConfirmed) / guestCount : 0
  const alerts: { icon: string; text: string; c: string }[] = []
  if (overdue > 0)            alerts.push({ icon: "⚠️", text: `${overdue} tâche${overdue > 1 ? "s" : ""} en retard`,          c: "#ef4444" })
  if (budgetWarn)             alerts.push({ icon: "💰", text: "Budget > 80% utilisé",                                           c: "#f59e0b" })
  if (nonContacted > 3)       alerts.push({ icon: "📋", text: `${nonContacted} prestataires non confirmés`,                     c: "#f59e0b" })
  if (pendingRatio > 0.5)     alerts.push({ icon: "👥", text: `${Math.round(pendingRatio * 100)}% d'invités sans réponse`,      c: "#60a5fa" })
  if (daysLeft > 0 && daysLeft < 30) alerts.push({ icon: "⏰", text: `J-${daysLeft} — sprint final !`,                          c: "#a855f7" })
  if (alerts.length === 0)    alerts.push({ icon: "✅", text: "Aucune alerte — tout roule !",                                   c: "#22c55e" })
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 6, boxSizing: "border-box" }}>
      {alerts.map((a, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: `${a.c}14`, fontSize: "var(--text-xs)" }}>
          <span style={{ fontSize: "var(--text-sm)", flexShrink: 0 }}>{a.icon}</span>
          <span style={{ flex: 1, color: a.c, fontWeight: 500 }}>{a.text}</span>
        </div>
      ))}
    </div>
  )
}
