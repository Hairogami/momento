"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import CountdownWidget from "@/components/clone/dashboard/CountdownWidget"
import BudgetWidget, { type BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import VendorSwipeWidget from "@/components/clone/dashboard/VendorSwipeWidget"

const VendorSwipeModal = dynamic(() => import("@/components/VendorSwipeModal"), { ssr: false })

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// ── Static data ───────────────────────────────────────────────────────────────
const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",   date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",        date: "2026-06-21", color: "#7b5ea7" },
  { id: "3", name: "Anniversaire 30 ans Leila",  date: "2026-05-10", color: "#e05a7b" },
]
const EVENT_DATA: Record<string, { budget: number; budgetSpent: number; guestCount: number; guestConfirmed: number }> = {
  "1": { budget: 120000, budgetSpent: 72500, guestCount: 220, guestConfirmed: 145 },
  "2": { budget: 85000,  budgetSpent: 41000, guestCount: 150, guestConfirmed: 98  },
  "3": { budget: 30000,  budgetSpent: 8500,  guestCount: 60,  guestConfirmed: 22  },
}

type TaskPriority = "haute" | "moyenne" | "basse"
type Task = { id: string; label: string; done: boolean; priority: TaskPriority; dueDate: string; category: string }
type BookingStatus = "CONFIRMED" | "PENDING" | "INQUIRY"
type Booking = { id: string; vendor: string; category: string; status: BookingStatus; amount?: number }
type Message = { id: string; vendor: string; lastMsg: string; time: string; unread: number; avatar: string }

const TASKS_BY_EVENT: Record<string, Task[]> = {
  "1": [
    { id:"t1", label:"Confirmer le photographe",         done:true,  priority:"haute",   dueDate:"2026-04-20", category:"Prestataire" },
    { id:"t2", label:"Envoyer les invitations digitales", done:true,  priority:"haute",   dueDate:"2026-04-18", category:"Invités"    },
    { id:"t3", label:"Dégustation traiteur",              done:false, priority:"haute",   dueDate:"2026-05-02", category:"Prestataire" },
    { id:"t4", label:"Choisir la robe / costume",         done:false, priority:"moyenne", dueDate:"2026-05-15", category:"Style"      },
    { id:"t5", label:"Réserver le transport VIP",         done:false, priority:"moyenne", dueDate:"2026-06-01", category:"Logistique" },
    { id:"t6", label:"Préparer le plan de table",         done:false, priority:"basse",   dueDate:"2026-08-01", category:"Invités"    },
    { id:"t7", label:"Commander les faire-part papier",   done:false, priority:"basse",   dueDate:"2026-05-30", category:"Invités"    },
    { id:"t8", label:"Valider la playlist DJ",            done:false, priority:"basse",   dueDate:"2026-07-15", category:"Musique"    },
  ],
  "2": [
    { id:"t1", label:"Réserver la salle de réception",   done:true,  priority:"haute",   dueDate:"2026-03-10", category:"Lieu"       },
    { id:"t2", label:"Signer le contrat DJ",              done:false, priority:"haute",   dueDate:"2026-04-25", category:"Prestataire" },
    { id:"t3", label:"Envoyer les invitations",           done:false, priority:"haute",   dueDate:"2026-05-01", category:"Invités"    },
    { id:"t4", label:"Choisir le menu traiteur",          done:false, priority:"moyenne", dueDate:"2026-05-10", category:"Prestataire" },
    { id:"t5", label:"Commander les alliances",           done:false, priority:"haute",   dueDate:"2026-04-30", category:"Style"      },
  ],
  "3": [
    { id:"t1", label:"Réserver le lieu",                  done:true,  priority:"haute",   dueDate:"2026-03-15", category:"Lieu"       },
    { id:"t2", label:"Envoyer les invitations",           done:true,  priority:"haute",   dueDate:"2026-04-01", category:"Invités"    },
    { id:"t3", label:"Commander le gâteau",               done:false, priority:"moyenne", dueDate:"2026-05-01", category:"Traiteur"   },
    { id:"t4", label:"Préparer la playlist",              done:false, priority:"basse",   dueDate:"2026-05-05", category:"Musique"    },
  ],
}
const BOOKINGS_BY_EVENT: Record<string, Booking[]> = {
  "1": [
    { id:"b1", vendor:"Studio Lumière",   category:"Photographe", status:"CONFIRMED", amount:18000 },
    { id:"b2", vendor:"DJ Karim Beat",    category:"DJ",          status:"CONFIRMED", amount:12000 },
    { id:"b3", vendor:"Traiteur El Bab",  category:"Traiteur",    status:"PENDING",   amount:28000 },
    { id:"b4", vendor:"Villa Majorelle",  category:"Lieu",        status:"INQUIRY"               },
  ],
  "2": [
    { id:"b1", vendor:"Riad Al Bacha",    category:"Lieu",        status:"CONFIRMED", amount:35000 },
    { id:"b2", vendor:"Ciné Mariage",     category:"Vidéographe", status:"PENDING",   amount:15000 },
    { id:"b3", vendor:"Fleurs & Art",     category:"Fleuriste",   status:"INQUIRY"               },
  ],
  "3": [
    { id:"b1", vendor:"Orchestre Andalou", category:"Musique",    status:"CONFIRMED", amount:6000 },
    { id:"b2", vendor:"Café Nomad",        category:"Lieu",       status:"CONFIRMED", amount:8000 },
  ],
}
const MESSAGES_BY_EVENT: Record<string, Message[]> = {
  "1": [
    { id:"m1", vendor:"Studio Lumière",   lastMsg:"Parfait ! On confirme le 15 septembre.",          time:"10:32", unread:2, avatar:"SL" },
    { id:"m2", vendor:"DJ Karim Beat",    lastMsg:"Avez-vous une playlist de référence à partager ?", time:"Hier",  unread:1, avatar:"DK" },
    { id:"m3", vendor:"Traiteur El Bab",  lastMsg:"La dégustation est prévue pour le 2 mai.",         time:"Lun",   unread:0, avatar:"TE" },
  ],
  "2": [
    { id:"m1", vendor:"Riad Al Bacha",    lastMsg:"Les dates sont bien bloquées pour vous.",          time:"09:15", unread:1, avatar:"RA" },
    { id:"m2", vendor:"Ciné Mariage",     lastMsg:"Quel style de montage préférez-vous ?",            time:"Hier",  unread:0, avatar:"CM" },
  ],
  "3": [
    { id:"m1", vendor:"Orchestre Andalou", lastMsg:"Répertoire envoyé par email.",                    time:"14:00", unread:1, avatar:"OA" },
  ],
}
const BUDGET_BY_EVENT: Record<string, BudgetItem[]> = {
  "1": [
    { label:"Photographie", allocated:20000, spent:18000, color:"#818cf8", icon:"📸" },
    { label:"Traiteur",     allocated:35000, spent:28000, color:"#f59e0b", icon:"🍽️" },
    { label:"DJ & Musique", allocated:15000, spent:12000, color:"#a855f7", icon:"🎧" },
    { label:"Décoration",   allocated:18000, spent:9000,  color:"#22c55e", icon:"✨" },
    { label:"Lieu",         allocated:22000, spent:5500,  color:"#60a5fa", icon:"🏛️" },
    { label:"Divers",       allocated:10000, spent:0,     color:"#9a9aaa", icon:"📦" },
  ],
  "2": [
    { label:"Lieu",         allocated:40000, spent:35000, color:"#60a5fa", icon:"🏛️" },
    { label:"Vidéographie", allocated:18000, spent:0,     color:"#818cf8", icon:"🎬" },
    { label:"Fleurs",       allocated:12000, spent:0,     color:"#f472b6", icon:"🌸" },
    { label:"Traiteur",     allocated:10000, spent:6000,  color:"#f59e0b", icon:"🍽️" },
    { label:"Divers",       allocated:5000,  spent:0,     color:"#9a9aaa", icon:"📦" },
  ],
  "3": [
    { label:"Lieu",         allocated:12000, spent:8000,  color:"#60a5fa", icon:"🏛️" },
    { label:"Musique",      allocated:8000,  spent:6000,  color:"#a855f7", icon:"🎵" },
    { label:"Traiteur",     allocated:6000,  spent:500,   color:"#f59e0b", icon:"🍽️" },
    { label:"Divers",       allocated:4000,  spent:0,     color:"#9a9aaa", icon:"📦" },
  ],
}

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
type WidgetId   = "countdown" | "budget" | "swipe" | "tasks" | "bookings" | "messages"

function colSpan(size: WidgetSize): number {
  if (size === 4) return 12; if (size === 3) return 8; if (size === 2) return 6; return 4
}

const DEFAULT_SIZES: Record<WidgetId, WidgetSize> = {
  countdown: 1, budget: 1, swipe: 1, tasks: 3, bookings: 1, messages: 3,
}
const DEFAULT_ORDER: WidgetId[] = ["countdown", "budget", "swipe", "tasks", "bookings", "messages"]

const WIDGET_META: Record<WidgetId, { title: string; icon: string; href: string; rowSpan?: number }> = {
  countdown: { title: "Compte à rebours", icon: "⏱️", href: "/clone/planner"  },
  budget:    { title: "Budget",           icon: "💰", href: "/clone/budget"   },
  swipe:     { title: "Découvrir",        icon: "🔍", href: "/clone/explore", rowSpan: 2 },
  tasks:     { title: "Tâches",           icon: "✅", href: "/clone/planner"  },
  bookings:  { title: "Réservations",     icon: "📋", href: "/clone/explore"  },
  messages:  { title: "Messages",         icon: "💬", href: "/clone/messages" },
}

const WIDGET_CATALOG = [
  { id: "progression", title: "Score de progression", icon: "🏆", category: "Avancé"       },
  { id: "notes",       title: "Notes libres",          icon: "📝", category: "Avancé"       },
  { id: "checklist",   title: "Checklist J-X",         icon: "📆", category: "Logistique"   },
  { id: "rsvplive",    title: "RSVP Live",              icon: "📨", category: "Invités"      },
  { id: "moodboard",   title: "Mood board",             icon: "🎨", category: "Inspiration"  },
  { id: "weather",     title: "Météo du jour J",        icon: "🌤️", category: "Inspiration"  },
  { id: "transport",   title: "Transport & navettes",   icon: "🚌", category: "Logistique"   },
  { id: "contrats",    title: "Contrats à signer",      icon: "📄", category: "Prestataires" },
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
function GIcon({ name, size = 16, color = "#9a9aaa" }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color, fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, display: "inline-block", userSelect: "none", verticalAlign: "middle",
    }}>{name}</span>
  )
}

// ── WidgetCard — resize (pointer) + snap + rename ─────────────────────────────
function WidgetCard({
  id, title, icon, href, size, rowSpan = 1,
  onResize, onRemove, removable, onRename,
  dragging, dropTarget,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  children,
}: {
  id: string; title: string; icon: string; href?: string
  size: WidgetSize; rowSpan?: number
  onResize: (id: string, s: WidgetSize) => void
  onRemove?: (id: string) => void; removable?: boolean
  onRename: (id: string, t: string) => void
  dragging: boolean; dropTarget: boolean
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void
  onDrop: () => void; onDragEnd: () => void; onDragLeave: () => void
  children: React.ReactNode
}) {
  const [hovered,  setHovered]  = useState(false)
  const [snapped,  setSnapped]  = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [editVal,  setEditVal]  = useState(title)
  const inputRef  = useRef<HTMLInputElement>(null)
  const cardRef   = useRef<HTMLDivElement>(null)
  const prevSize  = useRef(size)

  useEffect(() => { setEditVal(title) }, [title])

  useEffect(() => {
    if (size !== prevSize.current) {
      prevSize.current = size; setSnapped(true)
      const t = setTimeout(() => setSnapped(false), 180); return () => clearTimeout(t)
    }
  }, [size])

  useEffect(() => {
    if (editing) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
  }, [editing])

  function commitRename() {
    const v = editVal.trim()
    if (v) onRename(id, v)
    setEditing(false)
  }

  // Pointer-based resize — works on mouse AND touch
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation()
    const startX   = e.clientX
    const startSz  = size
    const cardW    = cardRef.current?.offsetWidth ?? 300
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
        borderRadius: 20, background: "#fff",
        border: dropTarget
          ? "1.5px solid rgba(225,29,72,0.4)"
          : snapped
            ? "1.5px solid rgba(225,29,72,0.5)"
            : "1px solid rgba(183,191,217,0.15)",
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "13px 16px 0", userSelect: "none", flexShrink: 0 }}>
        <span style={{ fontSize: 11, opacity: hovered ? 0.45 : 0.15, transition: "opacity 0.15s", flexShrink: 0, color: "#45474D", fontFamily: "monospace" }}>⠿</span>
        <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>

        {editing ? (
          <input
            ref={inputRef}
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") { setEditVal(title); setEditing(false) }
            }}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, fontSize: 11, fontWeight: 600, color: "#121317",
              border: "none", borderBottom: "1.5px solid var(--g1,#E11D48)",
              background: "transparent", outline: "none", padding: "0 2px",
              fontFamily: "inherit", cursor: "text",
            }}
          />
        ) : href ? (
          <Link
            href={href}
            onClick={e => e.stopPropagation()}
            onDoubleClick={e => { e.preventDefault(); e.stopPropagation(); setEditing(true) }}
            style={{ fontSize: 11, fontWeight: 600, color: "#121317", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: "none", opacity: 0.9 }}
            title="Double-clic pour renommer"
          >{title}</Link>
        ) : (
          <span
            onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
            style={{ fontSize: 11, fontWeight: 600, color: "#121317", flex: 1, minWidth: 0, opacity: 0.9, cursor: "text" }}
            title="Double-clic pour renommer"
          >{title}</span>
        )}

        <div style={{ display: "flex", gap: 4, flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          {!editing && (
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setEditing(true) }}
              style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(183,191,217,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Renommer"
            >
              <GIcon name="edit" size={9} color="#9a9aaa" />
            </button>
          )}
          {href && (
            <Link href={href} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", display: "flex" }}>
              <GIcon name="open_in_new" size={13} color="#9a9aaa" />
            </Link>
          )}
          {removable && onRemove && (
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(id) }}
              style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(183,191,217,0.25)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <GIcon name="close" size={9} color="#9a9aaa" />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>

      {dropTarget && (
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, pointerEvents: "none", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: G, color: "#fff" }}>
          Déposer ici
        </div>
      )}

      {/* Resize handle — pointer events (touch compatible) */}
      <div
        onPointerDown={handleResizeStart}
        style={{
          position: "absolute", bottom: 5, right: 5, width: 18, height: 18,
          opacity: hovered ? 0.55 : 0, cursor: "ew-resize", transition: "opacity 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#9a9aaa",
          touchAction: "none",
        }}
        title={`Taille ${size}/4 — glisser pour redimensionner`}
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
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#121317", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Ajouter un widget</h2>
            <p style={{ fontSize: 11, color: "#9a9aaa", margin: 0 }}>Personnalisez votre espace de travail</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(183,191,217,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="#45474D" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {WIDGET_CATALOG.map(w => {
            const isActive = active.includes(w.id)
            return (
              <button key={w.id} onClick={() => { if (!isActive) { onAdd(w.id); onClose() } }} disabled={isActive}
                style={{ padding: "14px 12px", borderRadius: 14, border: isActive ? "1.5px solid rgba(34,197,94,0.3)" : "1px solid rgba(183,191,217,0.2)", background: isActive ? "rgba(34,197,94,0.05)" : "rgba(183,191,217,0.04)", cursor: isActive ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: isActive ? 0.6 : 1, transition: "all 0.15s" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{w.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#121317", lineHeight: 1.3 }}>{w.title}</div>
                <div style={{ fontSize: 9, marginTop: 4, color: isActive ? "#22c55e" : "#9a9aaa", fontWeight: isActive ? 600 : 400 }}>{isActive ? "✓ Actif" : w.category}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Palette picker modal ──────────────────────────────────────────────────────
function PalettePickerModal({ current, onChange, onClose }: {
  current: { g1: string; g2: string }
  onChange: (p: { g1: string; g2: string }) => void
  onClose: () => void
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,19,23,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 420, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#121317", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Palette de couleurs</h2>
            <p style={{ fontSize: 11, color: "#9a9aaa", margin: 0 }}>Thème de votre espace client</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(183,191,217,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="#45474D" />
          </button>
        </div>

        {/* Preset palettes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {PALETTES.map(p => {
            const isActive = p.g1 === current.g1 && p.g2 === current.g2
            return (
              <button key={p.name} onClick={() => onChange(p)}
                style={{ padding: "12px 10px", borderRadius: 14, border: isActive ? `2px solid ${p.g1}` : "1px solid rgba(183,191,217,0.2)", background: isActive ? `${p.g1}12` : "rgba(183,191,217,0.04)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                <div style={{ width: "100%", height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`, marginBottom: 8, boxShadow: isActive ? `0 4px 16px ${p.g1}40` : "none", transition: "box-shadow 0.15s" }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: "#121317" }}>{p.name}</div>
                {isActive && <div style={{ fontSize: 9, color: p.g1, fontWeight: 700, marginTop: 2 }}>✓ Actif</div>}
              </button>
            )
          })}
        </div>

        {/* Custom color inputs */}
        <div style={{ paddingTop: 16, borderTop: "1px solid rgba(183,191,217,0.1)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#121317", marginBottom: 12 }}>Couleurs personnalisées</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <span style={{ fontSize: 10, color: "#9a9aaa" }}>Couleur 1</span>
              <input type="color" value={current.g1} onChange={e => onChange({ ...current, g1: e.target.value })}
                style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid rgba(183,191,217,0.3)", cursor: "pointer", padding: 2 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <span style={{ fontSize: 10, color: "#9a9aaa" }}>Couleur 2</span>
              <input type="color" value={current.g2} onChange={e => onChange({ ...current, g2: e.target.value })}
                style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid rgba(183,191,217,0.3)", cursor: "pointer", padding: 2 }} />
            </label>
            <div style={{ flex: 1, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${current.g1}, ${current.g2})`, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stub for catalog extras ───────────────────────────────────────────────────
function StubWidget({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#121317", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 99, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
        Bientôt disponible
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CloneDashboardPage() {
  const [activeEventId, setActiveEventId] = useState("1")
  const [widgetOrder,   setWidgetOrder]   = useState<string[]>(DEFAULT_ORDER)
  const [widgetSizes,   setWidgetSizes]   = useState<Record<string, WidgetSize>>(DEFAULT_SIZES)
  const [widgetTitles,  setWidgetTitles]  = useState<Record<string, string>>({})
  const [extraWidgets,  setExtraWidgets]  = useState<string[]>([])
  const [tasksByEvent,  setTasksByEvent]  = useState<Record<string, Task[]>>(TASKS_BY_EVENT)
  const [darkMode,      setDarkMode]      = useState(false)
  const [palette,       setPalette]       = useState({ g1: "#E11D48", g2: "#9333EA" })
  const [isDragging,    setIsDragging]    = useState(false)
  const [dropTarget,    setDropTarget]    = useState<string | null>(null)
  const [showPicker,    setShowPicker]    = useState(false)
  const [showPalette,   setShowPalette]   = useState(false)
  const [swipeOpen,     setSwipeOpen]     = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [firstName,     setFirstName]     = useState("Yazid")

  const draggingId = useRef<string | null>(null)

  const event    = EVENTS.find(e => e.id === activeEventId) ?? EVENTS[0]
  const edata    = EVENT_DATA[activeEventId]    ?? EVENT_DATA["1"]
  const tasks    = tasksByEvent[activeEventId]  ?? []
  const bookings = BOOKINGS_BY_EVENT[activeEventId] ?? []
  const messages = MESSAGES_BY_EVENT[activeEventId] ?? []
  const budgetItems = BUDGET_BY_EVENT[activeEventId] ?? []

  const daysLeft       = Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000))
  const completedTasks = tasks.filter(t => t.done).length
  const taskPct        = tasks.length > 0 ? completedTasks / tasks.length : 0
  const totalUnread    = messages.reduce((s, m) => s + m.unread, 0)

  // ── Persist in localStorage ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const so  = localStorage.getItem("momento_clone_widget_order")
      const ss  = localStorage.getItem("momento_clone_widget_sizes")
      const se  = localStorage.getItem("momento_clone_extra_widgets")
      const st  = localStorage.getItem("momento_clone_widget_titles")
      const sdk = localStorage.getItem("momento_clone_dark_mode")
      const sp  = localStorage.getItem("momento_clone_palette")
      if (so)  setWidgetOrder(JSON.parse(so))
      if (ss)  setWidgetSizes(prev => ({ ...prev, ...JSON.parse(ss) }))
      if (se)  setExtraWidgets(JSON.parse(se))
      if (st)  setWidgetTitles(JSON.parse(st))
      if (sdk) setDarkMode(JSON.parse(sdk))
      if (sp)  setPalette(JSON.parse(sp))
    } catch {}
  }, [])

  useEffect(() => { try { localStorage.setItem("momento_clone_widget_order",  JSON.stringify(widgetOrder))  } catch {} }, [widgetOrder])
  useEffect(() => { try { localStorage.setItem("momento_clone_widget_sizes",  JSON.stringify(widgetSizes))  } catch {} }, [widgetSizes])
  useEffect(() => { try { localStorage.setItem("momento_clone_extra_widgets", JSON.stringify(extraWidgets)) } catch {} }, [extraWidgets])
  useEffect(() => { try { localStorage.setItem("momento_clone_widget_titles", JSON.stringify(widgetTitles)) } catch {} }, [widgetTitles])
  useEffect(() => { try { localStorage.setItem("momento_clone_dark_mode",     JSON.stringify(darkMode))     } catch {} }, [darkMode])
  useEffect(() => { try { localStorage.setItem("momento_clone_palette",       JSON.stringify(palette))      } catch {} }, [palette])

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
  function renameWidget(id: string, t: string) { setWidgetTitles(prev => ({ ...prev, [id]: t })) }
  function toggleTask(taskId: string) {
    setTasksByEvent(prev => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] ?? []).map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }))
  }
  function resetLayout() {
    setWidgetOrder([...DEFAULT_ORDER]); setWidgetSizes({ ...DEFAULT_SIZES })
    setExtraWidgets([]); setWidgetTitles({})
    try {
      ["momento_clone_widget_order","momento_clone_widget_sizes","momento_clone_extra_widgets","momento_clone_widget_titles"]
        .forEach(k => localStorage.removeItem(k))
    } catch {}
  }

  // ── Inline widget content ─────────────────────────────────────────────────
  function renderTasks() {
    const pending = tasks.filter(t => !t.done)
    const done    = tasks.filter(t => t.done)
    return (
      <div style={{ padding: "14px 20px 18px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#9a9aaa" }}>{completedTasks}/{tasks.length}</span>
            <div style={{ width: 64, height: 3, background: "rgba(183,191,217,0.15)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${taskPct * 100}%`, borderRadius: 99, background: G, transition: "width 0.5s" }} className="clone-progress-fill" />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {pending.map(task => {
            const p = PRIORITY_COLORS[task.priority]
            return (
              <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "7px 0", borderBottom: "1px solid rgba(183,191,217,0.08)" }}>
                <button onClick={() => toggleTask(task.id)} style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1, border: "2px solid rgba(183,191,217,0.35)", background: "transparent", cursor: "pointer", transition: "all 0.15s" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#121317", lineHeight: 1.35 }}>{task.label}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "1px 5px", borderRadius: 99, background: p.bg, color: p.color }}>{task.priority}</span>
                    <span style={{ fontSize: 10, color: "#9a9aaa" }}>{task.category}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "#9a9aaa", flexShrink: 0 }}>{shortDate(task.dueDate)}</span>
              </div>
            )
          })}
          {done.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: "#c9cad0", padding: "8px 0 5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Complétées</div>
              {done.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "5px 0", borderBottom: "1px solid rgba(183,191,217,0.06)", opacity: 0.5 }}>
                  <button onClick={() => toggleTask(task.id)} className="clone-check-done" style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: "none", background: G, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GIcon name="check" size={10} color="#fff" />
                  </button>
                  <span style={{ fontSize: 12, color: "#6a6a71", textDecoration: "line-through", flex: 1 }}>{task.label}</span>
                </div>
              ))}
            </>
          )}
        </div>
        <Link href="/clone/planner" style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px", borderRadius: 99, textDecoration: "none", border: "1px dashed rgba(183,191,217,0.3)", color: "#9a9aaa", fontSize: 11 }}>
          <GIcon name="add" size={13} color="#9a9aaa" />Ajouter une tâche
        </Link>
      </div>
    )
  }

  function renderBookings() {
    const totalAmt = bookings.reduce((s, b) => s + (b.amount ?? 0), 0)
    return (
      <div style={{ padding: "14px 20px 18px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { val: bookings.length, label: "Prestataires", href: "/clone/explore" },
            { val: totalAmt > 0 ? `${(totalAmt / 1000).toFixed(0)}k` : "—", label: "MAD engagé", href: "/clone/budget" },
          ].map(({ val, label, href }) => (
            <Link key={label} href={href} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(183,191,217,0.07)", border: "1px solid rgba(183,191,217,0.14)", textDecoration: "none" }}>
              <div style={{ fontSize: 17, fontWeight: 800, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
              <div style={{ fontSize: 9, color: "#9a9aaa", marginTop: 1 }}>{label}</div>
            </Link>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {bookings.map(b => {
            const s    = STATUS_STYLES[b.status]
            const slug = b.vendor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
            return (
              <Link key={b.id} href={`/vendor/${slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(183,191,217,0.08)", textDecoration: "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${s.color}15`, border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: s.color }}>
                  {b.vendor.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#121317", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.vendor}</div>
                  <div style={{ fontSize: 10, color: "#9a9aaa" }}>{b.category}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
              </Link>
            )
          })}
        </div>
        <Link href="/clone/explore" style={{ marginTop: 10, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", background: G, color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
          + Ajouter un prestataire
        </Link>
      </div>
    )
  }

  function renderMessages() {
    const unread = messages.reduce((s, m) => s + m.unread, 0)
    return (
      <div style={{ padding: "14px 20px 18px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {unread > 0 && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff" }}>
              {unread} non lu{unread !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {messages.map(msg => (
            <Link key={msg.id} href="/clone/messages" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: "1px solid rgba(183,191,217,0.08)", textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: msg.unread > 0 ? G : "rgba(183,191,217,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: msg.unread > 0 ? "#fff" : "#45474D" }}>
                {msg.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: msg.unread > 0 ? 700 : 500, color: "#121317" }}>{msg.vendor}</span>
                  <span style={{ fontSize: 10, color: "#9a9aaa", marginLeft: 8 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 11, color: msg.unread > 0 ? "#45474D" : "#9a9aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2, fontWeight: msg.unread > 0 ? 500 : 400 }}>
                  {msg.lastMsg}
                </div>
              </div>
              {msg.unread > 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: G, flexShrink: 0 }} />}
            </Link>
          ))}
        </div>
        <Link href="/clone/messages" style={{ marginTop: 10, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", border: "1px solid rgba(183,191,217,0.25)", color: "#45474D", fontSize: 11, fontWeight: 500, textDecoration: "none" }}>
          Voir tous les messages →
        </Link>
      </div>
    )
  }

  function renderWidgetContent(id: string) {
    switch (id as WidgetId) {
      case "countdown": return <CountdownWidget name={event.name} date={event.date} guestCount={edata.guestCount} guestConfirmed={edata.guestConfirmed} />
      case "budget":    return <BudgetWidget total={edata.budget} spent={edata.budgetSpent} items={budgetItems} />
      case "swipe":     return <VendorSwipeWidget onOpenModal={() => setSwipeOpen(true)} />
      case "tasks":     return renderTasks()
      case "bookings":  return renderBookings()
      case "messages":  return renderMessages()
      default: {
        const cat = WIDGET_CATALOG.find(w => w.id === id)
        return cat ? <StubWidget icon={cat.icon} title={cat.title} /> : null
      }
    }
  }

  function getWidgetMeta(id: string) {
    if (id in WIDGET_META) return WIDGET_META[id as WidgetId]
    const cat = WIDGET_CATALOG.find(w => w.id === id)
    return cat ? { title: cat.title, icon: cat.icon, href: undefined, rowSpan: 1 } : null
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`ant-root${darkMode ? " clone-dark" : ""}`}
      style={{
        display: "flex", minHeight: "100vh", background: "#f7f7fb",
        "--g1": palette.g1, "--g2": palette.g2,
      } as React.CSSProperties}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <DashSidebar events={EVENTS} activeEventId={activeEventId} onEventChange={setActiveEventId} firstName={firstName} messageUnread={totalUnread} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.45)" }} onClick={() => setMobileOpen(false)} />
          <div style={{ width: 240, height: "100%" }}>
            <DashSidebar events={EVENTS} activeEventId={activeEventId} onEventChange={id => { setActiveEventId(id); setMobileOpen(false) }} firstName={firstName} messageUnread={totalUnread} />
          </div>
        </div>
      )}

      {/* VendorSwipeModal — backdrop click ferme */}
      {swipeOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 70, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(18,19,23,0.7)" }}
          onClick={() => setSwipeOpen(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <VendorSwipeModal
              workspaceId="clone-workspace-1"
              plannerId={null}
              categories={["Photographe", "DJ", "Traiteur", "Décorateur", "Fleuriste", "Lieu de réception", "Videaste", "Makeup Artist"]}
              initialCategory="Photographe"
              onClose={() => setSwipeOpen(false)}
              onBooked={() => setSwipeOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showPicker  && <WidgetPickerModal active={[...Object.keys(DEFAULT_SIZES), ...extraWidgets]} onAdd={addWidget} onClose={() => setShowPicker(false)} />}
      {showPalette && <PalettePickerModal current={palette} onChange={setPalette} onClose={() => setShowPalette(false)} />}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Mobile header avec hamburger */}
        <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderBottom: "1px solid rgba(183,191,217,0.1)", position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setMobileOpen(true)} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(183,191,217,0.08)", border: "1px solid rgba(183,191,217,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="menu" size={18} color="#45474D" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#121317", letterSpacing: "-0.02em" }}>Momento</span>
          {totalUnread > 0 && (
            <Link href="/clone/messages" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff", textDecoration: "none" }}>
              {totalUnread} non lu{totalUnread !== 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {/* Event header */}
        <div style={{ padding: "28px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: event.color, boxShadow: `0 0 8px ${event.color}90` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Événement actif</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.2rem,2.2vw,1.7rem)", fontWeight: 800, color: "#121317", letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              {event.name}
            </h1>
            <p style={{ fontSize: 13, color: "#6a6a71", margin: 0 }}>
              {new Date(event.date).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              <span style={{ fontWeight: 700, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                J-{daysLeft}
              </span>
            </p>
          </div>

          {/* Stat chips — chaque chiffre est un lien */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "groups",                 val: `${edata.guestConfirmed}/${edata.guestCount}`, label: "invités",  href: "/clone/guests"  },
              { icon: "check_circle",           val: `${completedTasks}/${tasks.length}`,           label: "tâches",   href: "/clone/planner" },
              { icon: "account_balance_wallet", val: `${Math.round((edata.budgetSpent / edata.budget) * 100)}%`, label: "budget", href: "/clone/budget" },
            ].map(({ icon, val, label, href }) => (
              <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, textDecoration: "none", background: "#fff", border: "1px solid rgba(183,191,217,0.2)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }} className="clone-card-white">
                <GIcon name={icon} size={13} color="var(--g1,#E11D48)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#121317" }}>{val}</span>
                <span style={{ fontSize: 11, color: "#9a9aaa" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "10px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#c9cad0", display: "flex", alignItems: "center", gap: 4 }}>
            <GIcon name="drag_indicator" size={12} color="#c9cad0" />
            Glisser · Redimensionner · Double-clic pour renommer
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? "Mode clair" : "Mode sombre"}
              style={{ width: 30, height: 30, borderRadius: 8, background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(183,191,217,0.08)", border: `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(183,191,217,0.2)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <GIcon name={darkMode ? "light_mode" : "dark_mode"} size={15} color={darkMode ? "#fff" : "#45474D"} />
            </button>
            {/* Palette */}
            <button
              onClick={() => setShowPalette(true)}
              title="Changer la palette"
              style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${palette.g1}22, ${palette.g2}22)`, border: `1px solid ${palette.g1}40`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <GIcon name="palette" size={15} color={palette.g1} />
            </button>
            {/* Reset */}
            <button
              onClick={resetLayout}
              title="Réinitialiser la mise en page"
              style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(183,191,217,0.08)", border: "1px solid rgba(183,191,217,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <GIcon name="restart_alt" size={15} color="#9a9aaa" />
            </button>
            {/* + Widget */}
            <button
              onClick={() => setShowPicker(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "#fff", border: "1px solid rgba(183,191,217,0.25)", fontSize: 11, fontWeight: 600, color: "#45474D", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s" }}
            >
              <GIcon name="add" size={13} color="var(--g1,#E11D48)" />Widget
            </button>
          </div>
        </div>

        {/* Widget grid */}
        <div style={{ padding: "12px 28px 64px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14, gridAutoRows: "minmax(230px, auto)" }}>
            {widgetOrder.map(id => {
              const meta = getWidgetMeta(id)
              if (!meta) return null
              const size   = (widgetSizes[id] ?? 1) as WidgetSize
              const isCore = id in DEFAULT_SIZES
              const displayTitle = widgetTitles[id] ?? meta.title

              return (
                <WidgetCard
                  key={id}
                  id={id}
                  title={displayTitle}
                  icon={meta.icon}
                  href={meta.href}
                  size={size}
                  rowSpan={meta.rowSpan}
                  onResize={onResize}
                  onRemove={!isCore ? removeWidget : undefined}
                  removable={!isCore}
                  onRename={renameWidget}
                  dragging={isDragging && draggingId.current === id}
                  dropTarget={dropTarget === id && draggingId.current !== id}
                  onDragStart={() => onDragStart(id)}
                  onDragOver={e => onDragOver(e, id)}
                  onDrop={() => onDrop(id)}
                  onDragEnd={onDragEnd}
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
