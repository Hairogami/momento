"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import CountdownWidget from "@/components/clone/dashboard/CountdownWidget"
import BudgetWidget, { type BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import VendorSwipeWidget from "@/components/clone/dashboard/VendorSwipeWidget"
import MesPrestatairesWidget from "@/components/clone/dashboard/MesPrestatairesWidget"

const VendorSwipeModal = dynamic(
  () => import("@/components/VendorSwipeModal"),
  { ssr: false, loading: () => null }
)

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// ── Static data ───────────────────────────────────────────────────────────────
type EventMeta = { id: string; name: string; date: string; color: string }

type TaskPriority = "haute" | "moyenne" | "basse"
type Task = { id: string; label: string; done: boolean; priority: TaskPriority; dueDate: string; category: string }
type BookingStatus = "CONFIRMED" | "PENDING" | "INQUIRY"
type Booking = { id: string; vendor: string; category: string; status: BookingStatus; amount?: number }
type Message = { id: string; vendor: string; lastMsg: string; time: string; unread: number; avatar: string }


type Guest = { id: string; name: string; rsvp: "yes" | "pending" | "no"; tableNumber?: number; diet?: string; city?: string }

// ── Color palettes ────────────────────────────────────────────────────────────
const PALETTES = [
  { name: "Momento",  g1: "#E11D48", g2: "#9333EA" },
  { name: "Océan",    g1: "#0EA5E9", g2: "#6366F1" },
  { name: "Émeraude", g1: "#10B981", g2: "#0EA5E9" },
  { name: "Coucher",  g1: "#F97316", g2: "#E11D48" },
  { name: "Galaxie",  g1: "#6366F1", g2: "#A855F7" },
  { name: "Or",       g1: "#F59E0B", g2: "#EF4444" },
]

// ── Widget system ─────────────────────────────────────────────────────────────
type WidgetSize = 1 | 2 | 3 | 4
type WidgetId   = "countdown" | "budget" | "swipe" | "tasks" | "bookings" | "messages" | "prestataires"

function colSpan(size: WidgetSize): number {
  if (size === 4) return 12; if (size === 3) return 8; if (size === 2) return 6; return 4
}

const DEFAULT_SIZES: Record<WidgetId, WidgetSize> = {
  countdown: 1, budget: 1, swipe: 1, tasks: 3, bookings: 1, messages: 3, prestataires: 2,
}
const DEFAULT_ORDER: WidgetId[] = ["countdown", "budget", "swipe", "prestataires", "tasks", "bookings", "messages"]

const WIDGET_META: Record<WidgetId, { title: string; href: string; rowSpan?: number }> = {
  countdown:    { title: "Compte à rebours", href: "/planner"          },
  budget:       { title: "Budget",           href: "/budget"            },
  swipe:        { title: "Découvrir",        href: "/mes-prestataires", rowSpan: 2 },
  prestataires: { title: "Mes Prestataires", href: "/mes-prestataires"  },
  tasks:        { title: "Tâches",           href: "/planner"           },
  bookings:     { title: "Réservations",     href: "/explore"           },
  messages:     { title: "Messages",         href: "/messages"          },
}

const WIDGET_CATALOG = [
  { id: "progression",  title: "Score de progression",  category: "Avancé"        },
  { id: "notes",        title: "Notes",                  category: "Avancé"        },
  { id: "alertes",      title: "Rappels & alertes",      category: "Avancé"        },
  { id: "checklist",    title: "Checklist J-X",          category: "Logistique"    },
  { id: "timeline",     title: "Timeline",               category: "Logistique"    },
  { id: "transport",    title: "Transport & navettes",   category: "Logistique"    },
  { id: "plantable",    title: "Plan de table",          category: "Logistique"    },
  { id: "rsvplive",     title: "RSVP Live",               category: "Invités"       },
  { id: "regimes",      title: "Régimes alimentaires",   category: "Invités"       },
  { id: "cartegeo",     title: "Carte géographique",     category: "Invités"       },
  { id: "envoi",        title: "Envoi faire-part",       category: "Invités"       },
  { id: "depenses",     title: "Dépenses récentes",      category: "Finance"       },
  { id: "epargne",      title: "Objectif budget",        category: "Finance"       },
  { id: "repartition",  title: "Répartition budget",     category: "Finance"       },
  { id: "contrats",     title: "Contrats à signer",      category: "Prestataires"  },
  { id: "moodboard",    title: "Mood board",              category: "Inspiration"   },
  { id: "weather",      title: "Météo du jour J",        category: "Inspiration"   },
  { id: "citation",     title: "Citation du jour",       category: "Inspiration"   },
]

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

function shortDate(d: string) {
  return new Date(d).toLocaleDateString("fr-MA", { day: "numeric", month: "short" })
}
function GIcon({ name, size = 16, color = "var(--dash-text-3,#9a9aaa)" }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: size, color, fontWeight: "normal", fontStyle: "normal", lineHeight: 1, display: "inline-block", userSelect: "none", verticalAlign: "middle" }}>
      {name}
    </span>
  )
}

// ── WidgetCard — titre seul, resize pointer, snap ─────────────────────────────
function WidgetCard({
  id, title, href, size, rowSpan = 1,
  onResize, onRemove, removable,
  dragging, dropTarget,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  children,
}: {
  id: string; title: string; href?: string
  size: WidgetSize; rowSpan?: number
  onResize: (id: string, s: WidgetSize) => void
  onRemove?: (id: string) => void; removable?: boolean
  dragging: boolean; dropTarget: boolean
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void
  onDrop: () => void; onDragEnd: () => void; onDragLeave: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  const [snapped, setSnapped] = useState(false)
  const cardRef  = useRef<HTMLDivElement>(null)
  const prevSize = useRef(size)

  useEffect(() => {
    if (size !== prevSize.current) {
      prevSize.current = size; setSnapped(true)
      const t = setTimeout(() => setSnapped(false), 180); return () => clearTimeout(t)
    }
  }, [size])

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX; const startSz = size
    const cardW  = cardRef.current?.offsetWidth ?? 300
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    function onMove(ev: PointerEvent) {
      const delta = ev.clientX - startX
      const colW  = Math.max(160, cardW / startSz)
      const next  = Math.max(1, Math.min(4, Math.round(startSz + delta / colW))) as WidgetSize
      onResize(id, next)
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup",   onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup",   onUp)
  }, [id, size, onResize])

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: `span ${colSpan(size)}`,
        gridRow:    rowSpan > 1 ? `span ${rowSpan}` : undefined,
        borderRadius: 20,
        background: "var(--dash-surface,#fff)",
        border: dropTarget
          ? "1.5px solid rgba(225,29,72,0.4)"
          : snapped
            ? "1.5px solid rgba(225,29,72,0.5)"
            : "1px solid var(--dash-border,rgba(183,191,217,0.15))",
        boxShadow: dragging
          ? "0 20px 60px rgba(0,0,0,0.18)"
          : dropTarget
            ? "0 4px 28px rgba(225,29,72,0.1)"
            : snapped
              ? "0 0 0 3px rgba(225,29,72,0.08), 0 4px 20px rgba(0,0,0,0.06)"
              : "0 2px 12px rgba(0,0,0,0.04)",
        opacity:   dragging ? 0.4 : 1,
        transform: dragging ? "scale(0.97) rotate(1deg)" : snapped ? "scale(1.006)" : "scale(1)",
        transition: snapped
          ? "transform 0.14s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.14s ease, border-color 0.14s ease"
          : "opacity 0.15s, box-shadow 0.15s, transform 0.18s, border-color 0.15s",
        cursor:   dragging ? "grabbing" : "grab",
        position: "relative", display: "flex", flexDirection: "column",
        overflow: "hidden", minHeight: 0,
      }}
      className="clone-surface"
    >
      {/* Overlay actions — visible on hover only */}
      {(removable || href) && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 5, display: "flex", gap: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          {href && (
            <Link href={href} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: "rgba(183,191,217,0.15)", color: "var(--dash-text-3,#9a9aaa)" }}>
              <GIcon name="open_in_new" size={12} />
            </Link>
          )}
          {removable && onRemove && (
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(id) }}
              style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(183,191,217,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-3,#9a9aaa)" }}
            ><GIcon name="close" size={10} /></button>
          )}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>

      {dropTarget && (
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, pointerEvents: "none", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: G, color: "#fff" }}>
          Déposer ici
        </div>
      )}

      {/* Resize handle */}
      <div
        onPointerDown={handleResizeStart}
        style={{ position: "absolute", bottom: 5, right: 5, width: 18, height: 18, opacity: hovered ? 0.5 : 0, cursor: "ew-resize", transition: "opacity 0.15s", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-3,#9a9aaa)", touchAction: "none" }}
        title={`Taille ${size}/4`}
      >
        <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
          <rect x="11" y="1"  width="2.5" height="16" rx="1.25"/>
          <rect x="4"  y="5"  width="2.5" height="12" rx="1.25"/>
        </svg>
      </div>
    </div>
  )
}

// ── Widget picker modal ───────────────────────────────────────────────────────
function WidgetPickerModal({ active, onAdd, onClose }: { active: string[]; onAdd: (id: string) => void; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,19,23,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--dash-surface,#fff)", borderRadius: 24, width: "100%", maxWidth: 520, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--dash-text,#121317)", margin: "0 0 2px" }}>Ajouter un widget</h2>
            <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Personnalisez votre espace</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.12))", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="var(--dash-text-2,#6a6a71)" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          {WIDGET_CATALOG.map(w => {
            const isActive = active.includes(w.id)
            return (
              <button key={w.id} onClick={() => { if (!isActive) { onAdd(w.id); onClose() } }} disabled={isActive}
                style={{ padding: "14px 10px", borderRadius: 14, border: isActive ? "1.5px solid rgba(34,197,94,0.3)" : "1px solid var(--dash-border,rgba(183,191,217,0.2))", background: isActive ? "rgba(34,197,94,0.05)" : "var(--dash-faint,rgba(183,191,217,0.04))", cursor: isActive ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: isActive ? 0.6 : 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)", lineHeight: 1.3, marginBottom: 4 }}>{w.title}</div>
                <div style={{ fontSize: 9, color: isActive ? "#22c55e" : "var(--dash-text-3,#9a9aaa)", fontWeight: isActive ? 600 : 400 }}>{isActive ? "✓ Actif" : w.category}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Palette picker modal ──────────────────────────────────────────────────────
function PalettePickerModal({ current, onChange, onClose }: { current: { g1: string; g2: string }; onChange: (p: { g1: string; g2: string }) => void; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,19,23,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--dash-surface,#fff)", borderRadius: 24, width: "100%", maxWidth: 400, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--dash-text,#121317)", margin: 0 }}>Palette de couleurs</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.12))", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="var(--dash-text-2,#6a6a71)" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {PALETTES.map(p => {
            const isActive = p.g1 === current.g1 && p.g2 === current.g2
            return (
              <button key={p.name} onClick={() => onChange(p)} style={{ padding: "12px 10px", borderRadius: 14, border: isActive ? `2px solid ${p.g1}` : "1px solid var(--dash-border,rgba(183,191,217,0.2))", background: isActive ? `${p.g1}12` : "var(--dash-faint,rgba(183,191,217,0.04))", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ width: "100%", height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`, marginBottom: 7 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{p.name}</div>
                {isActive && <div style={{ fontSize: 9, color: p.g1, fontWeight: 700, marginTop: 2 }}>✓ Actif</div>}
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Couleur 1</span>
            <input type="color" value={current.g1} onChange={e => onChange({ ...current, g1: e.target.value })} style={{ width: "100%", height: 32, borderRadius: 7, border: "1px solid var(--dash-border)", cursor: "pointer", padding: 2 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Couleur 2</span>
            <input type="color" value={current.g2} onChange={e => onChange({ ...current, g2: e.target.value })} style={{ width: "100%", height: 32, borderRadius: 7, border: "1px solid var(--dash-border)", cursor: "pointer", padding: 2 }} />
          </label>
          <div style={{ flex: 1, height: 32, marginTop: 18, borderRadius: 7, background: `linear-gradient(135deg, ${current.g1}, ${current.g2})`, alignSelf: "flex-end" }} />
        </div>
      </div>
    </div>
  )
}

// ── Notes widget — texte éditable ─────────────────────────────────────────────
function NotesWidget({ storageKey }: { storageKey: string }) {
  const [text, setText] = useState("")
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try { setText(localStorage.getItem(storageKey) ?? "") } catch {}
    setLoaded(true)
  }, [storageKey])
  function save(val: string) {
    setText(val)
    try { localStorage.setItem(storageKey, val) } catch {}
  }
  if (!loaded) return null
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <textarea
        value={text}
        onChange={e => save(e.target.value)}
        placeholder="Écrivez vos notes ici…"
        style={{
          flex: 1, width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", fontFamily: "inherit",
          fontSize: 13, lineHeight: 1.6, color: "var(--dash-text,#121317)",
          caretColor: "var(--g1,#E11D48)",
        }}
      />
      <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", textAlign: "right", marginTop: 4 }}>
        {text.length} car.
      </div>
    </div>
  )
}

// ── Additional widgets ────────────────────────────────────────────────────────

function ProgressionWidget({ taskPct, budgetPct, guestPct, bookingsPct }: {
  taskPct: number; budgetPct: number; guestPct: number; bookingsPct: number
}) {
  const score = Math.round(((taskPct + budgetPct + guestPct + bookingsPct) / 4) * 100)
  const R = 40, CIRC = 2 * Math.PI * R
  const dash = CIRC * (score / 100)
  const bars = [
    { label: "Tâches",        val: taskPct,     color: "#818cf8" },
    { label: "Budget",        val: budgetPct,   color: "#f59e0b" },
    { label: "Invités",       val: guestPct,    color: "#22c55e" },
    { label: "Prestataires",  val: bookingsPct, color: "#e11d48" },
  ]
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={96} height={96} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--g1,#E11D48)" />
                <stop offset="100%" stopColor="var(--g2,#9333EA)" />
              </linearGradient>
            </defs>
            <circle cx={50} cy={50} r={R} fill="none" stroke="var(--dash-faint,rgba(183,191,217,0.18))" strokeWidth={10} />
            <circle cx={50} cy={50} r={R} fill="none" stroke="url(#prog-grad)" strokeWidth={10}
              strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
              transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 800, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{score}%</span>
            <span style={{ fontSize: 7, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.06em" }}>global</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          {bars.map(b => (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--dash-text-2,#45474D)", marginBottom: 2 }}>
                <span>{b.label}</span><span style={{ fontWeight: 600 }}>{Math.round(b.val * 100)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
                <div style={{ width: `${Math.round(b.val * 100)}%`, height: "100%", background: b.color, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChecklistJXWidget({ tasks, eventDate }: { tasks: Task[]; eventDate: string }) {
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
      <div style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
        {Math.max(0, Math.ceil((jDay - now) / 86400000))} jours avant J
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, overflowY: "auto", maxHeight: 160 }}>
        {upcoming.length === 0 && <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Tout est à jour 🎉</div>}
        {upcoming.map(t => {
          const days = Math.ceil((new Date(t.dueDate).getTime() - now) / 86400000)
          const color = days < 7 ? "#ef4444" : days < 30 ? "#f59e0b" : "#22c55e"
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
              <span style={{ fontSize: 10, color, fontWeight: 600, flexShrink: 0 }}>J-{Math.max(0, days)}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))", paddingTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="+ Ajouter un item (Entrée)"
          style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "transparent", fontSize: 11, color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
      </div>
    </div>
  )
}

function RSVPLiveWidget({ guests }: { guests: Guest[] }) {
  const confirmed = guests.filter(g => g.rsvp === "yes").length
  const declined  = guests.filter(g => g.rsvp === "no").length
  const pending   = guests.filter(g => g.rsvp === "pending").length
  const total     = guests.length
  const [showPopup, setShowPopup] = useState(false)
  const [rsvps, setRsvps] = useState<Record<string, "yes" | "pending" | "no">>(() =>
    Object.fromEntries(guests.map(g => [g.id, g.rsvp]))
  )
  const [faireParts, setFaireParts] = useState(0)
  const [fpInput, setFpInput] = useState("")

  const conf2 = Object.values(rsvps).filter(v => v === "yes").length
  const decl2 = Object.values(rsvps).filter(v => v === "no").length
  const pend2 = Object.values(rsvps).filter(v => v === "pending").length

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", background: "var(--dash-faint,rgba(183,191,217,0.18))" }}>
        <div style={{ width: `${total > 0 ? (conf2/total)*100 : 0}%`, background: "#22c55e", transition: "width 0.3s" }} />
        <div style={{ width: `${total > 0 ? (pend2/total)*100 : 0}%`, background: "#f59e0b", transition: "width 0.3s" }} />
        <div style={{ width: `${total > 0 ? (decl2/total)*100 : 0}%`, background: "#ef4444", transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {[{ l:"Oui ✓", v:conf2, c:"#22c55e" }, { l:"Attente", v:pend2, c:"#f59e0b" }, { l:"Non ✗", v:decl2, c:"#ef4444" }].map(x => (
          <div key={x.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", fontWeight: 600 }}>{x.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>{conf2}/{total} confirmés</span>
        <button onClick={() => setShowPopup(v => !v)} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, border: "none", background: G, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
          Gérer
        </button>
      </div>
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Gérer les RSVP</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <input value={fpInput} onChange={e => setFpInput(e.target.value)} placeholder="Faire-parts envoyés" type="number"
              style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => { setFaireParts(p => p + (parseInt(fpInput)||0)); setFpInput("") }}
              style={{ height: 28, padding: "0 10px", borderRadius: 8, border: "none", background: G, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              + {faireParts > 0 ? `(${faireParts})` : ""}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 160, overflowY: "auto" }}>
            {guests.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, fontSize: 11, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {(["yes","pending","no"] as const).map(s => (
                    <button key={s} onClick={() => setRsvps(p => ({ ...p, [g.id]: s }))} style={{
                      width: 22, height: 22, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                      background: rsvps[g.id] === s ? (s === "yes" ? "#22c55e" : s === "no" ? "#ef4444" : "#f59e0b") : "var(--dash-faint,rgba(183,191,217,0.18))",
                      color: rsvps[g.id] === s ? "#fff" : "var(--dash-text-3,#9a9aaa)",
                    }}>
                      {s === "yes" ? "✓" : s === "no" ? "✗" : "?"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoodboardWidget({ eventId }: { eventId: string }) {
  const MOODBOARD_KEY = `moodboard_images_${eventId}`
  const [images, setImages] = useState<(string | null)[]>(() => {
    try { const s = localStorage.getItem(MOODBOARD_KEY); return s ? JSON.parse(s) : Array(6).fill(null) } catch { return Array(6).fill(null) }
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const slotRef = useRef<number | null>(null)

  function handleSlotClick(i: number) {
    if (images[i]) return
    slotRef.current = i
    fileRef.current?.click()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || slotRef.current === null) return
    const reader = new FileReader()
    reader.onload = ev => {
      setImages(prev => {
        const next = [...prev]
        next[slotRef.current!] = ev.target?.result as string
        try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)) } catch {}
        return next
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
    slotRef.current = null
  }

  function removeImage(i: number) {
    setImages(prev => {
      const next = [...prev]
      next[i] = null
      try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} onClick={() => handleSlotClick(i)} style={{
            borderRadius: 8, overflow: "hidden", position: "relative", cursor: images[i] ? "default" : "pointer",
            background: images[i] ? "transparent" : "var(--dash-faint,rgba(183,191,217,0.1))",
            border: images[i] ? "none" : "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))",
            display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1",
          }}>
            {images[i] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={e => { e.stopPropagation(); removeImage(i) }} style={{
                  position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer",
                  fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </>
            ) : (
              <span style={{ fontSize: 18, opacity: 0.25 }}>+</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherWidget({ eventDate }: { eventDate: string }) {
  const date = new Date(eventDate)
  const month = date.getMonth()
  // Pseudo-forecast based on month (Maroc climate)
  const forecast =
    month >= 5 && month <= 8 ? { icon: "☀️", temp: 28, cond: "Ensoleillé",  rain: 5  } :
    month >= 2 && month <= 4 ? { icon: "🌤️", temp: 22, cond: "Partiel",     rain: 15 } :
    month >= 9 && month <= 10 ? { icon: "🌥️", temp: 18, cond: "Nuageux",     rain: 25 } :
    { icon: "🌧️", temp: 14, cond: "Averses",    rain: 55 }
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxSizing: "border-box" }}>
      <div style={{ fontSize: 36 }}>{forecast.icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{forecast.temp}°</div>
      <div style={{ fontSize: 11, color: "var(--dash-text-2,#45474D)", fontWeight: 500 }}>{forecast.cond}</div>
      <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        💧 {forecast.rain}% pluie
      </div>
    </div>
  )
}

function TransportWidget({ guests, eventId }: { guests: Guest[]; eventId: string }) {
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
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--g1,#E11D48)" }}>{confirmed.length}</div>
          <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)" }}>invités confirmés</div>
        </div>
        <div style={{ borderRadius: 10, padding: "7px 10px", background: "var(--dash-faint,rgba(183,191,217,0.08))" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text,#121317)" }}>~{estVehicles}</div>
          <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)" }}>véhicules estimés</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="date" value={date} onChange={e => saveDate(e.target.value)}
          style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,rgba(183,191,217,0.06))", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
        <input type="time" value={time} onChange={e => saveTime(e.target.value)}
          style={{ width: 76, fontSize: 11, padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,rgba(183,191,217,0.06))", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
      </div>
      <button onClick={() => setShowPicker(v => !v)}
        style={{ alignSelf: "flex-start", fontSize: 10, padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        {selected.length > 0 ? `${selected.length} invité(s) assigné(s)` : "+ Assigner des invités"}
      </button>
      {showPicker && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 100, overflowY: "auto", padding: "6px 8px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))" }}>
          {guests.slice(0, 10).map(g => (
            <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(g.id)} onChange={() => toggleGuest(g.id)} style={{ accentColor: "var(--g1,#E11D48)" }} />
              <span style={{ color: "var(--dash-text,#121317)" }}>{g.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const CONTRACT_CYCLE: BookingStatus[] = ["INQUIRY", "PENDING", "CONFIRMED"]
const CONTRACT_CFG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Confirmé",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  PENDING:   { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  INQUIRY:   { label: "Contact",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
}

function ContratsWidget({ bookings }: { bookings: Booking[] }) {
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({})
  function cycleStatus(id: string, current: BookingStatus) {
    const next = CONTRACT_CYCLE[(CONTRACT_CYCLE.indexOf(current) + 1) % CONTRACT_CYCLE.length]
    setOverrides(p => ({ ...p, [id]: next }))
    fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }).catch(() => {})
  }
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 6, boxSizing: "border-box", overflowY: "auto" }}>
      {bookings.length === 0 && <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Aucun contrat</div>}
      {bookings.map(b => {
        const status = overrides[b.id] ?? b.status
        const cfg = CONTRACT_CFG[status] ?? CONTRACT_CFG.PENDING
        return (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", fontSize: 11 }}>
            <span style={{ flex: 1, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.vendor}</span>
            <button onClick={() => cycleStatus(b.id, status)} title="Changer le statut"
              style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {cfg.label} ↻
            </button>
          </div>
        )
      })}
    </div>
  )
}

const CITATIONS_LIST = [
  { text: "L'amour ne se regarde pas l'un l'autre, il regarde ensemble dans la même direction.", author: "Antoine de Saint-Exupéry" },
  { text: "Un beau mariage, c'est l'union de deux bons pardonneurs.", author: "Ruth Bell Graham" },
  { text: "Le bonheur se multiplie quand il se partage.", author: "Proverbe marocain" },
  { text: "La vie sans amour est comme un arbre sans fleurs ni fruits.", author: "Khalil Gibran" },
  { text: "Aimer, c'est trouver sa richesse en l'autre.", author: "Abbé Huvelin" },
  { text: "Que ton mariage soit le début d'une belle histoire.", author: "Momento" },
  { text: "Le plus grand bonheur de la vie, c'est d'être aimé pour ce que l'on est.", author: "Victor Hugo" },
]

function CitationWidget() {
  const [i, setI] = useState(() => new Date().getDay() % CITATIONS_LIST.length)
  const citation = CITATIONS_LIST[i]
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % CITATIONS_LIST.length), 12000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
      <div style={{ fontSize: 22 }}>✨</div>
      <blockquote style={{ margin: 0, fontSize: 13, fontStyle: "italic", color: "var(--dash-text,#121317)", lineHeight: 1.65, textAlign: "center", fontFamily: "var(--font-cormorant,serif)" }}>
        &ldquo;{citation.text}&rdquo;
      </blockquote>
      <p style={{ margin: 0, fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center" }}>— {citation.author}</p>
      <div style={{ display: "flex", gap: 4 }}>
        {CITATIONS_LIST.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            style={{ width: idx === i ? 16 : 6, height: 6, borderRadius: 99, border: "none", cursor: "pointer", transition: "all 0.3s", background: idx === i ? "var(--g1,#E11D48)" : "var(--dash-faint,rgba(183,191,217,0.3))", padding: 0 }} />
        ))}
      </div>
    </div>
  )
}

// ── Ported from DashboardWidgets.tsx (old UI) ─────────────────────────────────

function DepensesRecentesWidget({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const [extra, setExtra] = useState<{ label: string; spent: number; color: string }[]>([])
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const all = [...budgetItems.filter(b => b.spent > 0), ...extra].sort((a, b) => b.spent - a.spent).slice(0, 6)
  const max = all.length > 0 ? Math.max(...all.map(b => b.spent)) : 1

  function handleAdd() {
    if (!label.trim()) return
    setExtra(p => [...p, { label: label.trim(), spent: parseFloat(amount) || 0, color: "var(--g1,#E11D48)" }])
    setLabel(""); setAmount("")
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      {all.length === 0 && <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Aucune dépense enregistrée</p>}
      {all.map((b, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span style={{ color: "var(--dash-text,#121317)" }}>{"icon" in b ? (b as BudgetItem).icon + " " : ""}{b.label}</span>
            <span style={{ fontWeight: 600, color: "var(--g1,#E11D48)" }}>{b.spent.toLocaleString("fr-FR")} MAD</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${(b.spent / max) * 100}%`, height: "100%", background: b.color ?? "var(--g1,#E11D48)", transition: "width 0.4s" }} />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 4, marginTop: 4, borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))", paddingTop: 8 }}>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" onKeyDown={e => e.key === "Enter" && handleAdd()}
          style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: 11, color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="MAD" type="number" onKeyDown={e => e.key === "Enter" && handleAdd()}
          style={{ width: 60, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: 11, color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit", textAlign: "right" }} />
        <button onClick={handleAdd} style={{ height: 28, width: 28, borderRadius: 8, border: "none", background: G, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>+</button>
      </div>
      <Link href="/budget" style={{ fontSize: 10, color: "var(--g1,#E11D48)", alignSelf: "flex-end", textDecoration: "none" }}>Voir le budget →</Link>
    </div>
  )
}

function ObjectifEpargneWidget({ budget, budgetSpent, eventDate }: { budget: number; budgetSpent: number; eventDate: string }) {
  const remaining = Math.max(0, budget - budgetSpent)
  const pct = budget > 0 ? Math.min(100, Math.round((budgetSpent / budget) * 100)) : 0
  const days = Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))
  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--g1,#E11D48)", margin: 0 }}>{remaining.toLocaleString("fr-FR")} MAD</p>
          <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>non engagé sur {budget.toLocaleString("fr-FR")} MAD</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>J-{days}</p>
          <p style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>avant l&apos;événement</p>
        </div>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? "var(--g1,#E11D48)" : G, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <span style={{ color: pct > 90 ? "var(--g1,#E11D48)" : "var(--dash-text-2,#45474D)", fontWeight: 600 }}>{pct}% engagé</span>
        <span style={{ color: "var(--dash-text-3,#9a9aaa)" }}>{100 - pct}% libre</span>
      </div>
    </div>
  )
}

const BUDGET_COLORS_LIST = ["#818cf8","#f59e0b","#a855f7","#22c55e","#60a5fa","#f472b6","#34d399","#fb923c"]

function donutPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + outerR * Math.cos(toRad(startDeg)), y1 = cy + outerR * Math.sin(toRad(startDeg))
  const x2 = cx + outerR * Math.cos(toRad(endDeg)),   y2 = cy + outerR * Math.sin(toRad(endDeg))
  const x3 = cx + innerR * Math.cos(toRad(endDeg)),   y3 = cy + innerR * Math.sin(toRad(endDeg))
  const x4 = cx + innerR * Math.cos(toRad(startDeg)), y4 = cy + innerR * Math.sin(toRad(startDeg))
  const lg = endDeg - startDeg > 180 ? 1 : 0
  return `M${x1},${y1} A${outerR},${outerR},0,${lg},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${lg},0,${x4},${y4} Z`
}

function RepartitionBudgetWidget({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const entries = budgetItems.map((b, i) => ({ label: b.label, val: b.spent || b.allocated, color: b.color ?? BUDGET_COLORS_LIST[i % BUDGET_COLORS_LIST.length] })).filter(b => b.val > 0).sort((a, b) => b.val - a.val).slice(0, 6)
  const total = entries.reduce((s, e) => s + e.val, 0)
  if (entries.length === 0) return <div style={{ padding: "20px 16px", fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Aucune dépense</div>
  let angle = 0
  const paths = entries.map(e => {
    const sweep = total > 0 ? (e.val / total) * 360 : 0
    const path = donutPath(50, 50, 42, 28, angle, angle + Math.max(sweep - 1, 0))
    angle += sweep
    return { ...e, path }
  })
  return (
    <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={90} height={90} viewBox="0 0 100 100">
          {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.9} />)}
          <text x={50} y={54} textAnchor="middle" fontSize={9} fontWeight="700" fill="var(--dash-text,#121317)">{Math.round(total / 1000)}k</text>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {paths.map(p => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--dash-text-2,#45474D)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</span>
            <span style={{ fontWeight: 600, color: p.color }}>{Math.round((p.val / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineWidget({ tasks, eventDate }: { tasks: Task[]; eventDate: string }) {
  void eventDate
  const sorted = [...tasks].filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 7)
  if (sorted.length === 0) return <div style={{ padding: "20px 16px", fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Aucune tâche planifiée</div>
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
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--dash-text,#121317)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 }}>{t.label}</p>
                <p style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", margin: "2px 0 0" }}>{new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Link href="/planner" style={{ fontSize: 10, color: "var(--g1,#E11D48)", alignSelf: "flex-end", textDecoration: "none" }}>Voir le planning →</Link>
    </div>
  )
}

function PlanTableWidget({ guests }: { guests: Guest[] }) {
  const [assignments, setAssignments] = useState<Record<string, number>>(() =>
    Object.fromEntries(guests.filter(g => g.tableNumber).map(g => [g.id, g.tableNumber!]))
  )
  const [showPopup, setShowPopup] = useState(false)
  const [tableNum, setTableNum] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const byTable: Record<number, Guest[]> = {}
  guests.forEach(g => {
    const t = assignments[g.id]
    if (t) { if (!byTable[t]) byTable[t] = []; byTable[t].push(g) }
  })
  const unassigned = guests.filter(g => !assignments[g.id])
  const tables = Object.entries(byTable).sort((a, b) => Number(a[0]) - Number(b[0]))

  function handleCreate() {
    const n = parseInt(tableNum)
    if (!n || selected.length === 0) return
    setAssignments(p => { const next = { ...p }; selected.forEach(id => { next[id] = n }); return next })
    setTableNum(""); setSelected([]); setShowPopup(false)
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {guests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 28 }}>🪑</div>
          <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: "8px 0 0" }}>Aucun invité</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tables.map(([n, gs]) => (
              <div key={n} style={{ background: "var(--dash-faint,rgba(183,191,217,0.1))", border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", borderRadius: 10, padding: "6px 10px", textAlign: "center", minWidth: 46 }}>
                <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", fontWeight: 600, textTransform: "uppercase" }}>T{n}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{gs.length}</div>
              </div>
            ))}
            <button onClick={() => setShowPopup(v => !v)} style={{ minWidth: 46, padding: "6px 10px", borderRadius: 10, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--g1,#E11D48)", fontWeight: 700 }}>+</button>
          </div>
          {unassigned.length > 0 && <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>{unassigned.length} sans table</p>}
        </>
      )}
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Nouvelle table</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <input value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Numéro de table" type="number"
            style={{ width: "100%", height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: 11, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
            {unassigned.slice(0, 10).map(g => (
              <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer" }}>
                <input type="checkbox" checked={selected.includes(g.id)} onChange={e => setSelected(p => e.target.checked ? [...p, g.id] : p.filter(x => x !== g.id))} />
                <span style={{ color: "var(--dash-text,#121317)" }}>{g.name}</span>
              </label>
            ))}
            {unassigned.length === 0 && <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Tous les invités sont assignés</p>}
          </div>
          <button onClick={handleCreate} style={{ width: "100%", height: 30, borderRadius: 8, border: "none", background: G, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Créer</button>
        </div>
      )}
    </div>
  )
}

const DIET_OPTIONS_LIST = [
  { key: "Halal",      icon: "☪️", color: "#60a5fa" },
  { key: "Végétarien", icon: "🥗", color: "#22c55e" },
  { key: "Vegan",      icon: "🌱", color: "#16a34a" },
  { key: "Sans gluten",icon: "🌾", color: "#f59e0b" },
  { key: "Allergie",   icon: "⚠️", color: "#ef4444" },
]

function RegimesWidget({ guests }: { guests: Guest[] }) {
  const [diets, setDiets] = useState<Record<string, string>>({})
  const [showPopup, setShowPopup] = useState(false)
  const counts: Record<string, number> = {}
  Object.values(diets).filter(Boolean).forEach(d => { counts[d] = (counts[d] ?? 0) + 1 })
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  const confirmed = guests.filter(g => g.rsvp === "yes")
  const shown = confirmed.length > 0 ? confirmed : guests

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {DIET_OPTIONS_LIST.filter(d => counts[d.key] > 0).map(d => (
        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{d.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: "var(--dash-text-2,#45474D)" }}>{d.key}</span>
              <span style={{ fontWeight: 700, color: d.color }}>{counts[d.key]}</span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
              <div style={{ width: `${total > 0 ? (counts[d.key] / total) * 100 : 0}%`, height: "100%", background: d.color }} />
            </div>
          </div>
        </div>
      ))}
      {total === 0 && <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "4px 0" }}>Aucun régime assigné</div>}
      <button onClick={() => setShowPopup(v => !v)} style={{ alignSelf: "flex-start", fontSize: 10, padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Assigner régimes
      </button>
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Régimes alimentaires</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {shown.slice(0, 10).map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1, fontSize: 11, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {DIET_OPTIONS_LIST.map(d => (
                    <button key={d.key} onClick={() => setDiets(p => ({ ...p, [g.id]: p[g.id] === d.key ? "" : d.key }))}
                      title={d.key} style={{
                        width: 22, height: 22, borderRadius: 6, cursor: "pointer", fontSize: 11,
                        border: diets[g.id] === d.key ? `1.5px solid ${d.color}` : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                        background: diets[g.id] === d.key ? `${d.color}22` : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{d.icon}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlertesWidget({ tasks, budget, budgetSpent, bookings, guestCount, guestConfirmed, eventDate }: {
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
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: `${a.c}14`, fontSize: 11 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
          <span style={{ flex: 1, color: a.c, fontWeight: 500 }}>{a.text}</span>
        </div>
      ))}
    </div>
  )
}

const GEO_COLORS = ["#818cf8","#f59e0b","#a855f7","#22c55e","#60a5fa","#f472b6"]

function CarteGeographiqueWidget({ guests }: { guests: Guest[] }) {
  const byCityRaw: Record<string, number> = {}
  guests.forEach(g => { const city = g.city ?? "Non renseignée"; byCityRaw[city] = (byCityRaw[city] ?? 0) + 1 })
  const cities = Object.entries(byCityRaw).sort((a, b) => b[1] - a[1])
  const total = guests.length
  if (total === 0) return (
    <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>🗺️ Aucun invité enregistré</div>
  )
  const maxCount = cities[0]?.[1] ?? 1
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 7, boxSizing: "border-box" }}>
      <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {cities.length} ville{cities.length > 1 ? "s" : ""} · {total} invités
      </div>
      {cities.slice(0, 6).map(([city, count], idx) => (
        <div key={city} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: 11, color: "var(--dash-text,#121317)", width: 78, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", borderRadius: 99, background: GEO_COLORS[idx % GEO_COLORS.length], transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)", width: 16, textAlign: "right", flexShrink: 0 }}>{count}</span>
        </div>
      ))}
      {cities.length > 6 && <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", textAlign: "right" }}>+{cities.length - 6} autres villes</div>}
    </div>
  )
}

function EnvoiFairepartWidget({ guests, eventId }: { guests: Guest[]; eventId: string }) {
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
    <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>💌 Aucun invité enregistré</div>
  )
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {[
        { label: "Faire-part envoyés", count: totalSent, pct: pctSent, color: "#60a5fa", icon: "📤" },
        { label: "Réponses reçues",    count: responded, pct: pctResp, color: "#22c55e", icon: "📬" },
      ].map(({ label, count, pct, color, icon }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--dash-text-2,#45474D)" }}><span>{icon}</span>{label}</span>
            <span style={{ fontWeight: 700, color }}>{count}/{total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.5s" }} />
          </div>
        </div>
      ))}
      <button onClick={() => setShowPopup(v => !v)}
        style={{ alignSelf: "flex-start", marginTop: 2, fontSize: 10, padding: "3px 10px", borderRadius: 99, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", color: "var(--g1,#E11D48)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Marquer envoyés
      </button>
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Faire-parts envoyés</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input type="number" min={1} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd() }}
              placeholder="Combien envoyés…"
              style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-faint,rgba(183,191,217,0.04))", outline: "none", fontFamily: "inherit", color: "var(--dash-text,#121317)" }} />
            <button onClick={handleAdd}
              style={{ padding: "5px 10px", borderRadius: 8, background: G, color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>+</button>
          </div>
          <button onClick={handleMarkAll}
            style={{ width: "100%", padding: "6px", borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", color: "var(--dash-text-2,#45474D)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            ✓ Tout marquer envoyé ({total})
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CloneDashboardPage() {
  // Active event — persisté en localStorage pour synchroniser toutes les pages
  const [events,        setEvents]        = useState<EventMeta[]>([])
  const [activeEventId, setActiveEventId] = useState("")
  const [eventsLoaded,  setEventsLoaded]  = useState(false)
  const [widgetOrder,   setWidgetOrder]   = useState<string[]>(DEFAULT_ORDER)
  const [widgetSizes,   setWidgetSizes]   = useState<Record<string, WidgetSize>>(DEFAULT_SIZES)
  const [extraWidgets,  setExtraWidgets]  = useState<string[]>([])
  const [tasksByEvent,  setTasksByEvent]  = useState<Record<string, Task[]>>({})
  const [darkMode,      setDarkMode]      = useState(() => {
    if (typeof window === "undefined") return true
    try {
      const v = localStorage.getItem("momento_clone_dark_mode")
      return v !== null ? (JSON.parse(v) as boolean) : true
    } catch { return true }
  })
  const [palette,       setPalette]       = useState({ g1: "#E11D48", g2: "#9333EA" })
  const [isDragging,    setIsDragging]    = useState(false)
  const [dropTarget,    setDropTarget]    = useState<string | null>(null)
  const [showPicker,    setShowPicker]    = useState(false)
  const [showPalette,   setShowPalette]   = useState(false)
  const [swipeOpen,     setSwipeOpen]     = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [firstName,     setFirstName]     = useState("")
  const [addingTask,    setAddingTask]    = useState(false)
  const [newTaskLabel,  setNewTaskLabel]  = useState("")

  const draggingId = useRef<string | null>(null)

  const event    = events.find(e => e.id === activeEventId) ?? events[0] ?? null
  const edata    = { budget: 0, budgetSpent: 0, guestCount: 0, guestConfirmed: 0 }
  const tasks    = tasksByEvent[activeEventId]  ?? []
  const bookings: Booking[]    = []
  const messages: Message[]    = []
  const budgetItems: BudgetItem[] = []
  const guests: Guest[]        = []

  const daysLeft       = event ? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)) : 0
  const completedTasks = tasks.filter(t => t.done).length
  const taskPct        = tasks.length > 0 ? completedTasks / tasks.length : 0
  const totalUnread    = messages.reduce((s, m) => s + m.unread, 0)

  // ── localStorage hydration ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const ev = localStorage.getItem("momento_active_event")
      if (ev)  setActiveEventId(ev)
    } catch {}

    // Fetch real planners
    fetch("/api/planners")
      .then(r => r.ok ? r.json() : null)
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: EventMeta[] = (data as Array<Record<string, unknown>>).map(p => ({
            id:    String(p.id ?? ""),
            name:  String(p.coupleNames ?? p.title ?? "Mon événement"),
            date:  String(p.weddingDate ?? ""),
            color: String(p.coverColor ?? "#E11D48"),
          })).filter(e => e.id && e.date)
          if (mapped.length > 0) {
            setEvents(mapped)
            setActiveEventId(prev => mapped.some(e => e.id === prev) ? prev : mapped[0].id)
          }
        }
        setEventsLoaded(true)
      })
      .catch(() => { setEventsLoaded(true) })

    fetch("/api/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: unknown) => {
        if (d && typeof d === "object" && "name" in d && typeof (d as { name: unknown }).name === "string") {
          setFirstName(((d as { name: string }).name).split(" ")[0])
        }
        // Guard cross-user localStorage: si un autre user était connecté, effacer sa préférence d'event
        const uid = d && typeof d === "object" && "id" in d ? String((d as { id: unknown }).id) : null
        if (uid) {
          try {
            const storedUid = localStorage.getItem("momento_active_user")
            if (storedUid && storedUid !== uid) {
              localStorage.removeItem("momento_active_event")
              setActiveEventId("")
            }
            localStorage.setItem("momento_active_user", uid)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  // ── Chargement des réglages per-event (palette + widgets) ─────────────────
  useEffect(() => {
    try {
      const so = localStorage.getItem(`momento_widget_order_${activeEventId}`)
      const ss = localStorage.getItem(`momento_widget_sizes_${activeEventId}`)
      const se = localStorage.getItem(`momento_extra_widgets_${activeEventId}`)
      const sp = localStorage.getItem(`momento_palette_${activeEventId}`)
      setWidgetOrder(so ? JSON.parse(so) : DEFAULT_ORDER)
      setWidgetSizes(ss ? JSON.parse(ss) : {})
      setExtraWidgets(se ? JSON.parse(se) : [])
      setPalette(sp ? JSON.parse(sp) : { g1: "#E11D48", g2: "#9333EA" })
    } catch {}
  }, [activeEventId])

  // ── Persist ───────────────────────────────────────────────────────────────
  useEffect(() => { try { localStorage.setItem("momento_active_event",                          activeEventId)               } catch {} }, [activeEventId])
  useEffect(() => { try { localStorage.setItem(`momento_widget_order_${activeEventId}`,  JSON.stringify(widgetOrder))  } catch {} }, [widgetOrder,   activeEventId])
  useEffect(() => { try { localStorage.setItem(`momento_widget_sizes_${activeEventId}`,  JSON.stringify(widgetSizes))  } catch {} }, [widgetSizes,   activeEventId])
  useEffect(() => { try { localStorage.setItem(`momento_extra_widgets_${activeEventId}`, JSON.stringify(extraWidgets)) } catch {} }, [extraWidgets,  activeEventId])
  useEffect(() => { try { localStorage.setItem("momento_clone_dark_mode",                JSON.stringify(darkMode))     } catch {} }, [darkMode])
  useEffect(() => { try { localStorage.setItem(`momento_palette_${activeEventId}`,       JSON.stringify(palette))      } catch {} }, [palette,       activeEventId])

  // ── Dark mode — appliqué sur <html>, PAS de cleanup (persiste entre pages) ──
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  // ── Palette — CSS vars sur <html> ─────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty("--g1", palette.g1)
    document.documentElement.style.setProperty("--g2", palette.g2)
  }, [palette])

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null)
      .then((d: unknown) => {
        if (d && typeof d === "object" && "name" in d && typeof (d as { name: unknown }).name === "string")
          setFirstName(((d as { name: string }).name).split(" ")[0])
      }).catch(() => {})
  }, [])

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function onDragStart(id: string) { draggingId.current = id; setIsDragging(true) }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); if (draggingId.current !== id) setDropTarget(id) }
  function onDrop(targetId: string) {
    const src = draggingId.current
    if (!src || src === targetId) return
    const next = [...widgetOrder]
    const from = next.indexOf(src); const to = next.indexOf(targetId)
    next.splice(from, 1); next.splice(to, 0, src)
    setWidgetOrder(next); draggingId.current = null; setDropTarget(null); setIsDragging(false)
  }
  function onDragEnd() { draggingId.current = null; setDropTarget(null); setIsDragging(false) }

  // ── Widget management ─────────────────────────────────────────────────────
  function onResize(id: string, size: WidgetSize) { setWidgetSizes(prev => ({ ...prev, [id]: size })) }
  function addWidget(id: string) { setExtraWidgets(p => [...p, id]); setWidgetOrder(p => [...p, id]); setWidgetSizes(p => ({ ...p, [id]: 1 as WidgetSize })) }
  function removeWidget(id: string) { setExtraWidgets(p => p.filter(w => w !== id)); setWidgetOrder(p => p.filter(w => w !== id)) }
  function toggleTask(taskId: string) {
    setTasksByEvent(prev => ({ ...prev, [activeEventId]: (prev[activeEventId] ?? []).map(t => t.id === taskId ? { ...t, done: !t.done } : t) }))
  }
  function submitNewTask() {
    const label = newTaskLabel.trim()
    if (!label) return
    const newTask: Task = { id: `t${Date.now()}`, label, done: false, priority: "moyenne", dueDate: new Date().toISOString().slice(0, 10), category: "Divers" }
    setTasksByEvent(prev => ({ ...prev, [activeEventId]: [...(prev[activeEventId] ?? []), newTask] }))
    setNewTaskLabel(""); setAddingTask(false)
  }
  function resetLayout() {
    setWidgetOrder([...DEFAULT_ORDER]); setWidgetSizes({ ...DEFAULT_SIZES }); setExtraWidgets([])
    try { ["momento_clone_widget_order","momento_clone_widget_sizes","momento_clone_extra_widgets"].forEach(k => localStorage.removeItem(k)) } catch {}
  }

  // ── Inline widget content ─────────────────────────────────────────────────
  function renderTasks() {
    const pending = tasks.filter(t => !t.done)
    const done    = tasks.filter(t => t.done)
    return (
      <div style={{ padding: "10px 16px 14px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>{completedTasks}/{tasks.length}</span>
            <div style={{ width: 60, height: 3, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${taskPct * 100}%`, borderRadius: 99, background: G, transition: "width 0.5s" }} className="clone-progress-fill" />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {pending.map(task => {
            const p = PRIORITY_COLORS[task.priority]
            return (
              <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.08))" }}>
                <button onClick={() => toggleTask(task.id)} style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 2, border: "2px solid rgba(183,191,217,0.35)", background: "transparent", cursor: "pointer", transition: "all 0.15s" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--dash-text,#121317)", lineHeight: 1.35 }}>{task.label}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "1px 5px", borderRadius: 99, background: p.bg, color: p.color }}>{task.priority}</span>
                </div>
                <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", flexShrink: 0 }}>{shortDate(task.dueDate)}</span>
              </div>
            )
          })}
          {done.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", padding: "6px 0 4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Complétées</div>
              {done.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", borderBottom: "1px solid var(--dash-divider)", opacity: 0.45 }}>
                  <button onClick={() => toggleTask(task.id)} className="clone-check-done" style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: "none", background: G, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GIcon name="check" size={10} color="#fff" />
                  </button>
                  <span style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", textDecoration: "line-through", flex: 1 }}>{task.label}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Inline add task */}
        {addingTask ? (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              autoFocus
              value={newTaskLabel}
              onChange={e => setNewTaskLabel(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submitNewTask(); if (e.key === "Escape") { setAddingTask(false); setNewTaskLabel("") } }}
              placeholder="Nom de la tâche…"
              style={{ flex: 1, fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--g1,#E11D48)", background: "var(--dash-faint,rgba(183,191,217,0.04))", outline: "none", fontFamily: "inherit", color: "var(--dash-text,#121317)" }}
            />
            <button onClick={submitNewTask} style={{ padding: "5px 10px", borderRadius: 8, background: G, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>+</button>
            <button onClick={() => { setAddingTask(false); setNewTaskLabel("") }} style={{ padding: "5px 8px", borderRadius: 8, background: "transparent", border: "1px solid var(--dash-border)", cursor: "pointer", fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", fontFamily: "inherit" }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setAddingTask(true)} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, padding: "6px", borderRadius: 8, background: "transparent", border: "1px dashed var(--dash-border,rgba(183,191,217,0.3))", color: "var(--dash-text-3,#9a9aaa)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", width: "100%", justifyContent: "center" }}>
            <GIcon name="add" size={13} color="var(--dash-text-3,#9a9aaa)" /> Ajouter une tâche
          </button>
        )}
      </div>
    )
  }

  function renderBookings() {
    const totalAmt = bookings.reduce((s, b) => s + (b.amount ?? 0), 0)
    return (
      <div style={{ padding: "10px 16px 14px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { val: bookings.length, label: "Prestataires", href: "/explore" },
            { val: totalAmt > 0 ? `${(totalAmt / 1000).toFixed(0)}k MAD` : "—", label: "Engagé", href: "/budget" },
          ].map(({ val, label, href }) => (
            <Link key={label} href={href} style={{ padding: "9px 10px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.07))", border: "1px solid var(--dash-border)", textDecoration: "none" }}>
              <div style={{ fontSize: 16, fontWeight: 800, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
              <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>{label}</div>
            </Link>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {bookings.map(b => {
            const s    = STATUS_STYLES[b.status]
            const slug = b.vendor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
            return (
              <Link key={b.id} href={`/vendor/${slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--dash-divider)", textDecoration: "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${s.color}15`, border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: s.color }}>
                  {b.vendor.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.vendor}</div>
                  <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)" }}>{b.category}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
              </Link>
            )
          })}
        </div>
        <Link href="/explore" style={{ marginTop: 8, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", background: G, color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
          + Ajouter un prestataire
        </Link>
      </div>
    )
  }

  function renderMessages() {
    const unread = messages.reduce((s, m) => s + m.unread, 0)
    return (
      <div style={{ padding: "10px 16px 14px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {unread > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff" }}>
              {unread} non lu{unread !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {messages.map(msg => (
            <Link key={msg.id} href="/messages" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--dash-divider)", textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: msg.unread > 0 ? G : "var(--dash-faint-2,rgba(183,191,217,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: msg.unread > 0 ? "#fff" : "var(--dash-text-2,#45474D)" }}>
                {msg.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: msg.unread > 0 ? 700 : 500, color: "var(--dash-text,#121317)" }}>{msg.vendor}</span>
                  <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", marginLeft: 8 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 11, color: msg.unread > 0 ? "var(--dash-text-2,#45474D)" : "var(--dash-text-3,#9a9aaa)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1, fontWeight: msg.unread > 0 ? 500 : 400 }}>{msg.lastMsg}</div>
              </div>
              {msg.unread > 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: G, flexShrink: 0 }} />}
            </Link>
          ))}
        </div>
        <Link href="/messages" style={{ marginTop: 8, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", border: "1px solid var(--dash-border)", color: "var(--dash-text-2,#45474D)", fontSize: 11, fontWeight: 500, textDecoration: "none" }}>
          Voir tous les messages →
        </Link>
      </div>
    )
  }

  function renderWidgetContent(id: string) {
    switch (id as WidgetId) {
      case "countdown": return <CountdownWidget name={event.name} date={event.date} guestCount={edata.guestCount} guestConfirmed={edata.guestConfirmed} />
      case "budget":    return <BudgetWidget total={edata.budget} spent={edata.budgetSpent} items={budgetItems} />
      case "swipe":         return <VendorSwipeWidget onOpenModal={() => setSwipeOpen(true)} />
      case "prestataires":  return <MesPrestatairesWidget plannerId={activeEventId ?? ""} />
      case "tasks":     return renderTasks()
      case "bookings":  return renderBookings()
      case "messages":  return renderMessages()
      default: {
        const cat = WIDGET_CATALOG.find(w => w.id === id)
        if (!cat) return null
        switch (cat.id) {
          case "notes":       return <NotesWidget storageKey={`momento_notes_${activeEventId}`} />
          case "progression": return <ProgressionWidget taskPct={taskPct} budgetPct={edata.budget > 0 ? Math.min(1, edata.budgetSpent / edata.budget) : 0} guestPct={edata.guestCount > 0 ? edata.guestConfirmed / edata.guestCount : 0} bookingsPct={bookings.length > 0 ? bookings.filter(b => b.status === "CONFIRMED").length / bookings.length : 0} />
          case "checklist":    return <ChecklistJXWidget tasks={tasks} eventDate={event.date} />
          case "timeline":     return <TimelineWidget tasks={tasks} eventDate={event.date} />
          case "transport":    return <TransportWidget guests={guests} eventId={activeEventId} />
          case "plantable":    return <PlanTableWidget guests={guests} />
          case "rsvplive":     return <RSVPLiveWidget guests={guests} />
          case "regimes":      return <RegimesWidget guests={guests} />
          case "depenses":     return <DepensesRecentesWidget budgetItems={budgetItems} />
          case "epargne":      return <ObjectifEpargneWidget budget={edata.budget} budgetSpent={edata.budgetSpent} eventDate={event.date} />
          case "repartition":  return <RepartitionBudgetWidget budgetItems={budgetItems} />
          case "contrats":     return <ContratsWidget bookings={bookings} />
          case "moodboard":    return <MoodboardWidget eventId={activeEventId} />
          case "weather":      return <WeatherWidget eventDate={event.date} />
          case "citation":     return <CitationWidget />
          case "cartegeo":     return <CarteGeographiqueWidget guests={guests} />
          case "envoi":        return <EnvoiFairepartWidget guests={guests} eventId={activeEventId} />
          case "alertes":      return <AlertesWidget tasks={tasks} budget={edata.budget} budgetSpent={edata.budgetSpent} bookings={bookings} guestCount={edata.guestCount} guestConfirmed={edata.guestConfirmed} eventDate={event.date} />
          default:            return null
        }
      }
    }
  }

  function getWidgetMeta(id: string) {
    if (id in WIDGET_META) return WIDGET_META[id as WidgetId]
    const cat = WIDGET_CATALOG.find(w => w.id === id)
    return cat ? { title: cat.title, href: undefined, rowSpan: 1 } : null
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!eventsLoaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg,#f7f7fb)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#E11D48,#9333EA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <p style={{ color: "var(--dash-text-3,#9a9aaa)", fontSize: 13 }}>Chargement de votre espace…</p>
      </div>
    </div>
  )

  if (events.length === 0 || !event) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg,#f7f7fb)", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", marginBottom: 28, background: "linear-gradient(135deg,#E11D48,#9333EA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 48px rgba(225,29,72,0.25)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--dash-text,#121317)", margin: "0 0 10px", lineHeight: 1.2 }}>
          Bienvenue sur Momento
        </h1>
        <p style={{ fontSize: 15, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 32px", lineHeight: 1.6, maxWidth: 340 }}>
          Créez votre premier événement pour accéder à tous vos outils — budget, invités, prestataires et planning en un seul endroit.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
          {["Budget & dépenses", "Liste d'invités", "Trouver des prestataires", "Planning & tâches"].map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 99, background: "rgba(225,29,72,0.07)", color: "#E11D48", border: "1px solid rgba(225,29,72,0.15)" }}>{f}</span>
          ))}
        </div>
        <Link href="/planner" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(225,29,72,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Créer mon premier événement
        </Link>
        <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 16 }}>Gratuit · Sans commission · Données sécurisées</p>
      </div>
    </div>
  )

  return (
    <div
      className="ant-root"
      style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={setActiveEventId} firstName={firstName} messageUnread={totalUnread} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.45)" }} onClick={() => setMobileOpen(false)} />
          <div style={{ width: 240, height: "100%" }}>
            <DashSidebar events={events} activeEventId={activeEventId} onEventChange={id => { setActiveEventId(id); setMobileOpen(false) }} firstName={firstName} messageUnread={totalUnread} />
          </div>
        </div>
      )}

      {/* VendorSwipeModal */}
      {swipeOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(18,19,23,0.7)" }} onClick={() => setSwipeOpen(false)}>
          <div onClick={e => e.stopPropagation()}>
            <VendorSwipeModal
              workspaceId="clone-workspace-1" plannerId={null}
              categories={["Photographe","DJ","Traiteur","Décorateur","Fleuriste","Lieu de réception","Videaste","Makeup Artist"]}
              initialCategory="Photographe"
              onClose={() => setSwipeOpen(false)} onBooked={() => { /* ne pas fermer la modal sur swipe */ }}
            />
          </div>
        </div>
      )}

      {showPicker  && <WidgetPickerModal active={widgetOrder} onAdd={addWidget} onClose={() => setShowPicker(false)} />}
      {showPalette && <PalettePickerModal current={palette} onChange={setPalette} onClose={() => setShowPalette(false)} />}

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="flex lg:hidden" style={{ alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--dash-surface,#fff)", borderBottom: "1px solid var(--dash-border)", position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setMobileOpen(true)} style={{ width: 34, height: 34, borderRadius: 9, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="menu" size={18} color="var(--dash-text-2,#45474D)" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", letterSpacing: "-0.02em" }}>Momento</span>
          {totalUnread > 0 && (
            <Link href="/messages" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff", textDecoration: "none" }}>
              {totalUnread} non lu{totalUnread !== 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {/* Event header */}
        <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: event.color, boxShadow: `0 0 8px ${event.color}90` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Événement actif</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.2rem,2.2vw,1.6rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 3px" }}>
              {event.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
              {new Date(event.date).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              <span style={{ fontWeight: 700, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>J-{daysLeft}</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "groups",                 val: `${edata.guestConfirmed}/${edata.guestCount}`, label: "invités",  href: "/guests"  },
              { icon: "check_circle",           val: `${completedTasks}/${tasks.length}`,           label: "tâches",   href: "/planner" },
              { icon: "account_balance_wallet", val: `${Math.round((edata.budgetSpent / edata.budget) * 100)}%`, label: "budget", href: "/budget" },
            ].map(({ icon, val, label, href }) => (
              <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, textDecoration: "none", background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} className="clone-card-white">
                <GIcon name={icon} size={13} color="var(--g1,#E11D48)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{val}</span>
                <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "8px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 10, color: "var(--dash-text-3,#c9cad0)" }}>Glisser · Redimensionner (poignée bas-droite)</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setDarkMode(d => !d)} title={darkMode ? "Mode clair" : "Mode sombre"}
              style={{ width: 30, height: 30, borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name={darkMode ? "light_mode" : "dark_mode"} size={15} color="var(--dash-text-2,#45474D)" />
            </button>
            <button onClick={() => setShowPalette(true)} title="Palette"
              style={{ width: 30, height: 30, borderRadius: 8, background: `${palette.g1}18`, border: `1px solid ${palette.g1}40`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name="palette" size={15} color={palette.g1} />
            </button>
            <button onClick={resetLayout} title="Réinitialiser"
              style={{ width: 30, height: 30, borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name="restart_alt" size={15} color="var(--dash-text-3,#9a9aaa)" />
            </button>
            <button onClick={() => setShowPicker(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 12px", height: 30, borderRadius: 99, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border)", fontSize: 11, fontWeight: 600, color: "var(--dash-text-2,#45474D)", cursor: "pointer", fontFamily: "inherit" }}>
              <GIcon name="add" size={13} color="var(--g1,#E11D48)" />Widget
            </button>
          </div>
        </div>

        {/* Widget grid */}
        <div style={{ padding: "12px 24px 64px", flex: 1 }}>
          <div className="dash-widget-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14, gridAutoRows: "minmax(220px, auto)" }}>
            {widgetOrder.map(id => {
              const meta = getWidgetMeta(id)
              if (!meta) return null
              const size   = (widgetSizes[id] ?? 1) as WidgetSize
              const isCore = id in DEFAULT_SIZES
              return (
                <WidgetCard key={id} id={id} title={meta.title} href={meta.href} size={size} rowSpan={meta.rowSpan}
                  onResize={onResize} onRemove={removeWidget} removable
                  dragging={isDragging && draggingId.current === id}
                  dropTarget={dropTarget === id && draggingId.current !== id}
                  onDragStart={() => onDragStart(id)} onDragOver={e => onDragOver(e, id)}
                  onDrop={() => onDrop(id)} onDragEnd={onDragEnd}
                  onDragLeave={() => { if (dropTarget === id) setDropTarget(null) }}
                >
                  {renderWidgetContent(id)}
                </WidgetCard>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
