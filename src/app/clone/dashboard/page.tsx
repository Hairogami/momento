"use client"
import { useState, useRef, useEffect } from "react"
import AntNav from "@/components/clone/AntNav"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import CountdownWidget from "@/components/clone/dashboard/CountdownWidget"
import BudgetWidget, { type BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import VendorSwipeWidget from "@/components/clone/dashboard/VendorSwipeWidget"

// ── Brand ────────────────────────────────────────────────────────────────────
const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// ── Static data ───────────────────────────────────────────────────────────────
const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",  date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",       date: "2026-06-21", color: "#7b5ea7" },
  { id: "3", name: "Anniversaire 30 ans Leila", date: "2026-05-10", color: "#e05a7b" },
]

const EVENT_DATA: Record<string, { budget: number; budgetSpent: number; guestCount: number; guestConfirmed: number }> = {
  "1": { budget: 120000, budgetSpent: 72500, guestCount: 220, guestConfirmed: 145 },
  "2": { budget: 85000,  budgetSpent: 41000, guestCount: 150, guestConfirmed: 98  },
  "3": { budget: 30000,  budgetSpent: 8500,  guestCount: 60,  guestConfirmed: 22  },
}

const BUDGET_ITEMS: BudgetItem[] = [
  { label: "Photographie", allocated: 20000, spent: 18000, color: "#818cf8", icon: "📸" },
  { label: "Traiteur",     allocated: 35000, spent: 28000, color: "#f59e0b", icon: "🍽️" },
  { label: "DJ & Musique", allocated: 15000, spent: 12000, color: "#a855f7", icon: "🎧" },
  { label: "Décoration",   allocated: 18000, spent: 9000,  color: "#22c55e", icon: "✨" },
  { label: "Lieu",         allocated: 22000, spent: 5500,  color: "#60a5fa", icon: "🏛️" },
  { label: "Divers",       allocated: 10000, spent: 0,     color: "#9a9aaa", icon: "📦" },
]

type TaskPriority = "haute" | "moyenne" | "basse"
type Task = {
  id: string; label: string; done: boolean
  priority: TaskPriority; dueDate: string; category: string
}

const MOCK_TASKS: Task[] = [
  { id: "t1", label: "Confirmer le photographe",        done: true,  priority: "haute",   dueDate: "2026-04-20", category: "Prestataire" },
  { id: "t2", label: "Envoyer les invitations digitales",done: true,  priority: "haute",   dueDate: "2026-04-18", category: "Invités"    },
  { id: "t3", label: "Dégustation traiteur",             done: false, priority: "haute",   dueDate: "2026-05-02", category: "Prestataire" },
  { id: "t4", label: "Choisir la robe / costume",        done: false, priority: "moyenne", dueDate: "2026-05-15", category: "Style"      },
  { id: "t5", label: "Réserver le transport VIP",        done: false, priority: "moyenne", dueDate: "2026-06-01", category: "Logistique" },
  { id: "t6", label: "Préparer le plan de table",        done: false, priority: "basse",   dueDate: "2026-08-01", category: "Invités"    },
  { id: "t7", label: "Commander les faire-part papier",  done: false, priority: "basse",   dueDate: "2026-05-30", category: "Invités"    },
  { id: "t8", label: "Valider le DJ playlist",           done: false, priority: "basse",   dueDate: "2026-07-15", category: "Musique"    },
]

type BookingStatus = "CONFIRMED" | "PENDING" | "INQUIRY"
type Booking = { id: string; vendor: string; category: string; status: BookingStatus; amount?: number }

const MOCK_BOOKINGS: Booking[] = [
  { id: "b1", vendor: "Studio Lumière",  category: "Photographe", status: "CONFIRMED", amount: 18000 },
  { id: "b2", vendor: "DJ Karim Beat",   category: "DJ",          status: "CONFIRMED", amount: 12000 },
  { id: "b3", vendor: "Traiteur El Bab", category: "Traiteur",    status: "PENDING",   amount: 28000 },
  { id: "b4", vendor: "Villa Majorelle", category: "Lieu",        status: "INQUIRY" },
]

type Message = { id: string; vendor: string; lastMsg: string; time: string; unread: number; avatar: string }

const MOCK_MESSAGES: Message[] = [
  { id: "m1", vendor: "Studio Lumière",  lastMsg: "Parfait ! On confirme le 15 septembre.",          time: "10:32", unread: 2, avatar: "SL" },
  { id: "m2", vendor: "DJ Karim Beat",   lastMsg: "Avez-vous une playlist de référence à partager ?", time: "Hier",  unread: 1, avatar: "DK" },
  { id: "m3", vendor: "Traiteur El Bab", lastMsg: "La dégustation est prévue pour le 2 mai.",         time: "Lun",   unread: 0, avatar: "TE" },
]

// ── Widget system ─────────────────────────────────────────────────────────────
type WidgetId = "countdown" | "budget" | "swipe" | "tasks" | "bookings" | "messages"

// 12-col grid spans
const WIDGET_SPANS: Record<WidgetId, { col: number; row: number }> = {
  countdown: { col: 4, row: 1 },
  budget:    { col: 4, row: 1 },
  swipe:     { col: 4, row: 2 },
  tasks:     { col: 8, row: 1 },
  bookings:  { col: 4, row: 1 },
  messages:  { col: 8, row: 1 },
}

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; color: string }> = {
  haute:   { bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
  moyenne: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  basse:   { bg: "rgba(99,102,241,0.1)", color: "#818cf8" },
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  CONFIRMED: { bg: "rgba(34,197,94,0.1)",  color: "#22c55e", label: "Confirmé"   },
  PENDING:   { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "En attente" },
  INQUIRY:   { bg: "rgba(99,102,241,0.1)", color: "#818cf8", label: "Demande"    },
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-MA", { day: "numeric", month: "short" })
}

function GIcon({ name, size = 16, color = "#9a9aaa" }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color, fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, display: "inline-block", userSelect: "none", verticalAlign: "middle",
      flexShrink: 0,
    }}>{name}</span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CloneDashboardPage() {
  const [activeEventId, setActiveEventId] = useState("1")
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(
    ["countdown", "budget", "swipe", "tasks", "bookings", "messages"]
  )
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [isDraggingWidget, setIsDraggingWidget] = useState(false)
  const [dropTarget, setDropTarget] = useState<WidgetId | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [firstName, setFirstName] = useState("Yazid")

  const draggingWidget = useRef<WidgetId | null>(null)

  const event  = EVENTS.find(e => e.id === activeEventId) ?? EVENTS[0]
  const edata  = EVENT_DATA[activeEventId] ?? EVENT_DATA["1"]
  const daysLeft = Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000))
  const completedTasks = tasks.filter(t => t.done).length
  const taskPct = tasks.length > 0 ? completedTasks / tasks.length : 0

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: unknown) => {
        if (d && typeof d === "object" && "name" in d && typeof (d as { name: unknown }).name === "string") {
          setFirstName(((d as { name: string }).name).split(" ")[0])
        }
      })
      .catch(() => {})
  }, [])

  // ── Widget drag & drop ────────────────────────────────────────────────────
  function onDragStart(id: WidgetId) {
    draggingWidget.current = id
    setIsDraggingWidget(true)
  }

  function onDragOver(e: React.DragEvent, id: WidgetId) {
    e.preventDefault()
    if (draggingWidget.current !== id) setDropTarget(id)
  }

  function onDrop(targetId: WidgetId) {
    const srcId = draggingWidget.current
    if (!srcId || srcId === targetId) return
    const next = [...widgetOrder]
    const from = next.indexOf(srcId)
    const to   = next.indexOf(targetId)
    next.splice(from, 1)
    next.splice(to, 0, srcId)
    setWidgetOrder(next)
    draggingWidget.current = null
    setDropTarget(null)
    setIsDraggingWidget(false)
  }

  function onDragEnd() {
    draggingWidget.current = null
    setDropTarget(null)
    setIsDraggingWidget(false)
  }

  function toggleTask(id: string) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // ── Widget renderers (inline) ─────────────────────────────────────────────
  function renderTasks() {
    const pending = tasks.filter(t => !t.done)
    const done    = tasks.filter(t => t.done)
    return (
      <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em" }}>Tâches</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#9a9aaa" }}>{completedTasks}/{tasks.length}</span>
            <div style={{ width: 72, height: 3, background: "rgba(183,191,217,0.15)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${taskPct * 100}%`, borderRadius: 99,
                background: G, transition: "width 0.5s",
              }} className="clone-progress-fill" />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {/* Pending tasks */}
          {pending.map(task => {
            const p = PRIORITY_COLORS[task.priority]
            return (
              <div key={task.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "8px 0", borderBottom: "1px solid rgba(183,191,217,0.08)",
              }}>
                <button
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: "2px solid rgba(183,191,217,0.35)", background: "transparent",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#121317", lineHeight: 1.35 }}>{task.label}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                      padding: "1px 6px", borderRadius: 99, background: p.bg, color: p.color,
                    }}>{task.priority}</span>
                    <span style={{ fontSize: 10, color: "#9a9aaa" }}>{task.category}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "#9a9aaa", flexShrink: 0 }}>
                  {formatShortDate(task.dueDate)}
                </span>
              </div>
            )
          })}

          {/* Done tasks */}
          {done.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: "#c9cad0", padding: "10px 0 6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Complétées</div>
              {done.map(task => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "6px 0", borderBottom: "1px solid rgba(183,191,217,0.06)", opacity: 0.5,
                }}>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="clone-check-done"
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: "none", background: G, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <GIcon name="check" size={11} color="#fff" />
                  </button>
                  <span style={{ fontSize: 12, color: "#6a6a71", textDecoration: "line-through", flex: 1 }}>{task.label}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(183,191,217,0.1)", marginTop: 8 }}>
          <button style={{
            width: "100%", padding: "8px", borderRadius: 99,
            border: "1px dashed rgba(183,191,217,0.3)", background: "transparent",
            color: "#9a9aaa", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <GIcon name="add" size={14} color="#9a9aaa" />
            Ajouter une tâche
          </button>
        </div>
      </div>
    )
  }

  function renderBookings() {
    const confirmedCount = MOCK_BOOKINGS.filter(b => b.status === "CONFIRMED").length
    const totalEngaged   = MOCK_BOOKINGS.reduce((s, b) => s + (b.amount ?? 0), 0)
    return (
      <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em" }}>Réservations</div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
            background: "rgba(34,197,94,0.1)", color: "#22c55e",
          }}>{confirmedCount} confirmé{confirmedCount !== 1 ? "s" : ""}</span>
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { val: MOCK_BOOKINGS.length, label: "Prestataires" },
            { val: totalEngaged > 0 ? `${(totalEngaged / 1000).toFixed(0)}k MAD` : "—", label: "Engagé" },
          ].map(({ val, label }) => (
            <div key={label} style={{
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(183,191,217,0.07)",
              border: "1px solid rgba(183,191,217,0.14)",
            }}>
              <div style={{
                fontSize: 18, fontWeight: 800,
                backgroundImage: G,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>{val}</div>
              <div style={{ fontSize: 9, color: "#9a9aaa", marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {MOCK_BOOKINGS.map(b => {
            const s = STATUS_STYLES[b.status]
            return (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 0", borderBottom: "1px solid rgba(183,191,217,0.08)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `${s.color}15`, border: `1px solid ${s.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: s.color,
                }}>
                  {b.vendor.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#121317", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.vendor}</div>
                  <div style={{ fontSize: 10, color: "#9a9aaa" }}>{b.category}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, display: "block", marginBottom: 2,
                    padding: "2px 6px", borderRadius: 99, background: s.bg, color: s.color,
                  }}>{s.label}</span>
                  {b.amount && <span style={{ fontSize: 9, color: "#9a9aaa" }}>{(b.amount / 1000).toFixed(0)}k</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(183,191,217,0.1)", marginTop: 6 }}>
          <button style={{
            width: "100%", padding: "8px", borderRadius: 99,
            border: "none", background: G, color: "#fff",
            fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>+ Ajouter un prestataire</button>
        </div>
      </div>
    )
  }

  function renderMessages() {
    const unreadTotal = MOCK_MESSAGES.reduce((s, m) => s + m.unread, 0)
    return (
      <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em" }}>Messages</div>
          {unreadTotal > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              background: G, color: "#fff",
            }}>{unreadTotal} non lu{unreadTotal !== 1 ? "s" : ""}</span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {MOCK_MESSAGES.map(msg => (
            <div key={msg.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: "1px solid rgba(183,191,217,0.08)",
              cursor: "pointer",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: msg.unread > 0 ? G : "rgba(183,191,217,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: msg.unread > 0 ? "#fff" : "#45474D",
              }}>{msg.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: msg.unread > 0 ? 700 : 500, color: "#121317" }}>{msg.vendor}</span>
                  <span style={{ fontSize: 10, color: "#9a9aaa", marginLeft: 8, flexShrink: 0 }}>{msg.time}</span>
                </div>
                <div style={{
                  fontSize: 11, color: msg.unread > 0 ? "#45474D" : "#9a9aaa",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontWeight: msg.unread > 0 ? 500 : 400, marginTop: 2,
                }}>{msg.lastMsg}</div>
              </div>
              {msg.unread > 0 && (
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: G, flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(183,191,217,0.1)", marginTop: 6 }}>
          <button style={{
            width: "100%", padding: "7px", borderRadius: 99,
            border: "1px solid rgba(183,191,217,0.25)", background: "transparent",
            color: "#45474D", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}>Voir tous les messages →</button>
        </div>
      </div>
    )
  }

  function renderWidget(id: WidgetId) {
    switch (id) {
      case "countdown":
        return <CountdownWidget name={event.name} date={event.date} guestCount={edata.guestCount} guestConfirmed={edata.guestConfirmed} />
      case "budget":
        return <BudgetWidget total={edata.budget} spent={edata.budgetSpent} items={BUDGET_ITEMS} />
      case "swipe":
        return <VendorSwipeWidget />
      case "tasks":
        return renderTasks()
      case "bookings":
        return renderBookings()
      case "messages":
        return renderMessages()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "#f7f7fb" }}>

      {/* Sidebar — desktop lg+ */}
      <div className="hidden lg:flex">
        <DashSidebar
          events={EVENTS}
          activeEventId={activeEventId}
          onEventChange={setActiveEventId}
          firstName={firstName}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.45)" }} onClick={() => setMobileOpen(false)} />
          <div style={{ width: 240, height: "100%" }}>
            <DashSidebar
              events={EVENTS}
              activeEventId={activeEventId}
              onEventChange={(id) => { setActiveEventId(id); setMobileOpen(false) }}
              firstName={firstName}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Mobile topbar */}
        <div className="lg:hidden">
          <AntNav />
        </div>

        {/* Event header */}
        <div style={{ padding: "28px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: event.color, boxShadow: `0 0 8px ${event.color}90` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Événement actif
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(1.25rem,2.2vw,1.75rem)", fontWeight: 800, color: "#121317",
              letterSpacing: "-0.03em", margin: "0 0 4px",
            }}>{event.name}</h1>
            <p style={{ fontSize: 13, color: "#6a6a71", margin: 0 }}>
              {new Date(event.date).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              <span style={{
                fontWeight: 700,
                backgroundImage: G,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>J-{daysLeft}</span>
            </p>
          </div>

          {/* Quick stat chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "groups",                 val: `${edata.guestConfirmed}/${edata.guestCount}`, label: "invités"   },
              { icon: "check_circle",           val: `${completedTasks}/${tasks.length}`,           label: "tâches"    },
              { icon: "account_balance_wallet", val: `${Math.round((edata.budgetSpent / edata.budget) * 100)}%`,        label: "budget"    },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 13px", borderRadius: 999,
                background: "#fff", border: "1px solid rgba(183,191,217,0.2)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }} className="clone-card-white">
                <GIcon name={icon} size={14} color="var(--g1,#E11D48)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#121317" }}>{val}</span>
                <span style={{ fontSize: 11, color: "#9a9aaa" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drag hint */}
        <div style={{ padding: "10px 28px 0" }}>
          <span style={{ fontSize: 10, color: "#c9cad0", display: "flex", alignItems: "center", gap: 4 }}>
            <GIcon name="drag_indicator" size={12} color="#c9cad0" />
            Glissez les widgets pour les réorganiser
          </span>
        </div>

        {/* Widget grid */}
        <div style={{ padding: "14px 28px 64px", flex: 1 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 14,
            gridAutoRows: "minmax(230px, auto)",
          }}>
            {widgetOrder.map(id => {
              const span = WIDGET_SPANS[id]
              const isDraggingThis = isDraggingWidget && draggingWidget.current === id
              const isTarget       = dropTarget === id && draggingWidget.current !== id

              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => onDragStart(id)}
                  onDragOver={(e) => onDragOver(e, id)}
                  onDrop={() => onDrop(id)}
                  onDragEnd={onDragEnd}
                  onDragLeave={() => { if (dropTarget === id) setDropTarget(null) }}
                  style={{
                    gridColumn: `span ${span.col}`,
                    gridRow: `span ${span.row}`,
                    borderRadius: 20,
                    background: "#fff",
                    border: isTarget
                      ? "1.5px solid rgba(225,29,72,0.4)"
                      : "1px solid rgba(183,191,217,0.15)",
                    boxShadow: isDraggingThis
                      ? "0 20px 60px rgba(0,0,0,0.18)"
                      : isTarget
                        ? "0 4px 28px rgba(225,29,72,0.1)"
                        : "0 2px 12px rgba(0,0,0,0.04)",
                    opacity:   isDraggingThis ? 0.4 : 1,
                    transform: isDraggingThis ? "scale(0.97) rotate(1deg)" : "scale(1)",
                    transition: "opacity 0.15s, box-shadow 0.15s, transform 0.18s, border-color 0.15s",
                    cursor: isDraggingWidget ? (isDraggingThis ? "grabbing" : "copy") : "grab",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  className="clone-surface"
                >
                  {isTarget && (
                    <div style={{
                      position: "absolute", top: 10, right: 10, zIndex: 10, pointerEvents: "none",
                      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: G, color: "#fff",
                    }}>Déposer ici</div>
                  )}
                  {renderWidget(id)}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
