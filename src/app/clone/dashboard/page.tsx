"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import AntNav from "@/components/clone/AntNav"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TASKS = [
  { id: "1", title: "Réserver le traiteur",        category: "Traiteur",       dueDate: "2026-07-01", completed: false },
  { id: "2", title: "Confirmer le photographe",    category: "Photographe",    dueDate: "2026-06-15", completed: true  },
  { id: "3", title: "Envoyer les invitations",     category: "Organisation",   dueDate: "2026-06-01", completed: false },
  { id: "4", title: "Essayage robe de mariée",     category: "Tenue",          dueDate: "2026-07-10", completed: false },
  { id: "5", title: "Rendez-vous DJ",              category: "DJ",             dueDate: "2026-06-20", completed: true  },
  { id: "6", title: "Dégustation menu traiteur",   category: "Traiteur",       dueDate: "2026-07-15", completed: false },
]

const MOCK_BUDGET = [
  { label: "Lieu de réception", estimated: 40000, actual: 38000 },
  { label: "Traiteur",          estimated: 35000, actual: null   },
  { label: "Photographe",       estimated: 12000, actual: 11500  },
  { label: "DJ / Musique",      estimated: 8000,  actual: null   },
  { label: "Décoration",        estimated: 10000, actual: null   },
  { label: "Tenue",             estimated: 15000, actual: null   },
]

const MOCK_BOOKINGS = [
  { id: "1", vendor: "Studio Lumière", category: "Photographe", status: "CONFIRMED" },
  { id: "2", vendor: "DJ AZZ",         category: "DJ",          status: "PENDING"   },
  { id: "3", vendor: "Mariage Prestige",category: "Traiteur",   status: "PENDING"   },
]

const STATUS_LABEL: Record<string, string> = { CONFIRMED: "Confirmé", PENDING: "En attente", CANCELLED: "Annulé" }
const STATUS_COLOR: Record<string, string> = { CONFIRMED: "#16A34A", PENDING: "#D97706", CANCELLED: "#DC2626" }
const STATUS_BG:    Record<string, string> = { CONFIRMED: "rgba(22,163,74,0.08)", PENDING: "rgba(217,119,6,0.08)", CANCELLED: "rgba(220,38,38,0.08)" }

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-MA", { day: "numeric", month: "short" })
}

export default function CloneDashboardPage() {
  const [tasks, setTasks]     = useState(MOCK_TASKS)
  const [eventName]           = useState("Mariage Yasmine & Karim")
  const [eventDate]           = useState("2026-09-15")
  const [tab, setTab]         = useState<"tasks"|"budget"|"bookings">("tasks")

  const daysLeft = Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))
  const totalBudget   = MOCK_BUDGET.reduce((s, b) => s + b.estimated, 0)
  const spentBudget   = MOCK_BUDGET.reduce((s, b) => s + (b.actual ?? 0), 0)
  const completedTasks = tasks.filter(t => t.completed).length

  useEffect(() => {
    fetch("/api/workspace")
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
    // silently ignore — we use mock data as showcase
  }, [])

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const TABS = [
    { key: "tasks",    label: "Tâches",    count: tasks.filter(t => !t.completed).length },
    { key: "budget",   label: "Budget",    count: null },
    { key: "bookings", label: "Prestataires", count: MOCK_BOOKINGS.filter(b => b.status === "PENDING").length },
  ] as const

  return (
    <div className="ant-root" style={{ minHeight: "100vh", background: "#f7f7fb", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <AntNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Event header */}
        <div style={{
          background: "#121317", borderRadius: 24, padding: "28px 32px",
          marginBottom: 32, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(225,29,72,0.2), transparent)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative" }}>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                Événement actif
              </p>
              <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {eventName}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {new Date(eventDate).toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1,
                backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {daysLeft}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>jours restants</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
            {[
              { label: "Tâches complétées", value: `${completedTasks}/${tasks.length}` },
              { label: "Budget total",       value: `${totalBudget.toLocaleString()} MAD` },
              { label: "Prestataires",       value: `${MOCK_BOOKINGS.filter(b => b.status === "CONFIRMED").length} confirmé(s)` },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p style={{ fontSize: "clamp(1rem,2vw,1.3rem)", fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="clone-tab-strip" style={{
          display: "flex", gap: 6, background: "#fff",
          borderRadius: 14, padding: 5, marginBottom: 20,
          border: "1px solid rgba(183,191,217,0.18)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          width: "fit-content",
        }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none",
                fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                background: tab === t.key ? "rgba(183,191,217,0.15)" : "transparent",
                color: tab === t.key ? "#121317" : "#6a6a71",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: G, color: "#fff", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="clone-tab-panel" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(183,191,217,0.15)", overflow: "hidden" }}>

          {/* Tasks tab */}
          {tab === "tasks" && (
            <div>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(183,191,217,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#121317", margin: 0 }}>Liste des tâches</h2>
                <Link href="/planner" style={{
                  fontSize: 12, color: "#E11D48", fontWeight: 600, textDecoration: "none",
                }}>+ Ajouter</Link>
              </div>
              {tasks.map((task, i) => (
                <div key={task.id} onClick={() => toggleTask(task.id)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < tasks.length - 1 ? "1px solid rgba(183,191,217,0.08)" : "none",
                  cursor: "pointer", transition: "background 0.1s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: task.completed ? "none" : "1.5px solid rgba(183,191,217,0.5)",
                    background: task.completed ? G : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {task.completed && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: task.completed ? "#9a9aaa" : "#121317",
                      textDecoration: task.completed ? "line-through" : "none", margin: "0 0 2px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.title}
                    </p>
                    <p style={{ fontSize: 11, color: "#9a9aaa", margin: 0 }}>{task.category}</p>
                  </div>
                  {task.dueDate && (
                    <span style={{ fontSize: 11, color: "#9a9aaa", flexShrink: 0 }}>{formatDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Budget tab */}
          {tab === "budget" && (
            <div>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(183,191,217,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#121317", margin: 0 }}>Budget prévisionnel</h2>
                <span style={{ fontSize: 13, color: "#6a6a71" }}>
                  {spentBudget.toLocaleString()} / {totalBudget.toLocaleString()} MAD
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ padding: "12px 20px 4px" }}>
                <div style={{ height: 6, background: "rgba(183,191,217,0.2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (spentBudget/totalBudget)*100)}%`, background: G, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <p style={{ fontSize: 11, color: "#9a9aaa", margin: "4px 0 12px", textAlign: "right" }}>
                  {Math.round((spentBudget/totalBudget)*100)}% engagé
                </p>
              </div>
              {MOCK_BUDGET.map((b, i) => (
                <div key={b.label} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px",
                  borderBottom: i < MOCK_BUDGET.length - 1 ? "1px solid rgba(183,191,217,0.08)" : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#121317", margin: 0 }}>{b.label}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: b.actual ? "#16A34A" : "#121317", margin: 0 }}>
                      {(b.actual ?? b.estimated).toLocaleString()} MAD
                    </p>
                    {b.actual && b.actual !== b.estimated && (
                      <p style={{ fontSize: 10, color: "#9a9aaa", margin: 0 }}>prévu: {b.estimated.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookings tab */}
          {tab === "bookings" && (
            <div>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(183,191,217,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#121317", margin: 0 }}>Prestataires réservés</h2>
                <Link href="/clone/explore" style={{ fontSize: 12, color: "#E11D48", fontWeight: 600, textDecoration: "none" }}>
                  + Trouver un prestataire
                </Link>
              </div>
              {MOCK_BOOKINGS.map((b, i) => (
                <div key={b.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < MOCK_BOOKINGS.length - 1 ? "1px solid rgba(183,191,217,0.08)" : "none",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(140deg, rgba(225,29,72,0.1), rgba(147,51,234,0.1))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    {b.category === "Photographe" ? "📸" : b.category === "DJ" ? "🎧" : "🍽️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#121317", margin: "0 0 2px" }}>{b.vendor}</p>
                    <p style={{ fontSize: 11, color: "#6a6a71", margin: 0 }}>{b.category}</p>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    color: STATUS_COLOR[b.status],
                    background: STATUS_BG[b.status],
                  }}>{STATUS_LABEL[b.status]}</span>
                </div>
              ))}
              <div style={{ padding: "16px 20px" }}>
                <Link href="/clone/explore" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "12px", borderRadius: 12,
                  border: "1.5px dashed rgba(183,191,217,0.4)",
                  fontSize: 13, color: "#6a6a71", textDecoration: "none",
                  gap: 8,
                }}>
                  🔍 Trouver d&apos;autres prestataires
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
