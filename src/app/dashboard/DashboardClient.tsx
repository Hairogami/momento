"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AntNav from "@/components/clone/AntNav"
import { useTheme } from "@/components/ThemeProvider"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import CountdownWidget from "@/components/clone/dashboard/CountdownWidget"
import type { BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import { getEventLabel } from "@/lib/eventLabel"
import { computeCompletion } from "@/lib/completionScore"
import NotesWidget from "@/components/dashboard/widgets/NotesWidget"
import ProgressionWidget from "@/components/dashboard/widgets/ProgressionWidget"
import ChecklistJXWidget from "@/components/dashboard/widgets/ChecklistJXWidget"
import RSVPLiveWidget from "@/components/dashboard/widgets/RSVPLiveWidget"
import MoodboardWidget from "@/components/dashboard/widgets/MoodboardWidget"
import WeatherWidget from "@/components/dashboard/widgets/WeatherWidget"
import TransportWidget from "@/components/dashboard/widgets/TransportWidget"
import ContratsWidget from "@/components/dashboard/widgets/ContratsWidget"
import CitationWidget from "@/components/dashboard/widgets/CitationWidget"
import DepensesRecentesWidget from "@/components/dashboard/widgets/DepensesRecentesWidget"
import ObjectifEpargneWidget from "@/components/dashboard/widgets/ObjectifEpargneWidget"
import RepartitionBudgetWidget from "@/components/dashboard/widgets/RepartitionBudgetWidget"
import TimelineWidget from "@/components/dashboard/widgets/TimelineWidget"
import PlanTableWidget from "@/components/dashboard/widgets/PlanTableWidget"
import RegimesWidget from "@/components/dashboard/widgets/RegimesWidget"
import AlertesWidget from "@/components/dashboard/widgets/AlertesWidget"
import CarteGeographiqueWidget from "@/components/dashboard/widgets/CarteGeographiqueWidget"
import EnvoiFairepartWidget from "@/components/dashboard/widgets/EnvoiFairepartWidget"

// Skeleton générique pour les widgets lazy-loaded
function WidgetSkeleton({ minHeight = 160 }: { minHeight?: number }) {
  return (
    <div
      className="mo-skel"
      style={{
        minHeight,
        borderRadius: 16,
        background: "linear-gradient(90deg, var(--dash-faint,rgba(183,191,217,0.08)) 0%, var(--dash-faint-2,rgba(183,191,217,0.16)) 50%, var(--dash-faint,rgba(183,191,217,0.08)) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  )
}

// ── Code-splitting : widgets lourds chargés à la demande ─────────────────────
const BudgetWidget = dynamic(
  () => import("@/components/clone/dashboard/BudgetWidget"),
  { ssr: false, loading: () => <WidgetSkeleton minHeight={220} /> },
)
const VendorSwipeWidget = dynamic(
  () => import("@/components/clone/dashboard/VendorSwipeWidget"),
  { ssr: false, loading: () => <WidgetSkeleton minHeight={320} /> },
)
const MesPrestatairesWidget = dynamic(
  () => import("@/components/clone/dashboard/MesPrestatairesWidget"),
  { ssr: false, loading: () => <WidgetSkeleton minHeight={240} /> },
)
const DashboardProgressBanner = dynamic(
  () => import("@/components/clone/dashboard/DashboardProgressBanner"),
  { ssr: false, loading: () => <WidgetSkeleton minHeight={80} /> },
)
const CreateEventModal = dynamic(
  () => import("@/components/clone/dashboard/CreateEventModal"),
  { ssr: false, loading: () => null },
)
const VendorSwipeModal = dynamic(
  () => import("@/components/VendorSwipeModal"),
  { ssr: false, loading: () => null }
)

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// ── Static data ───────────────────────────────────────────────────────────────
type EventMeta = { id: string; name: string; date: string; color: string; categories: string[] }

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
  { id: "swipe",        title: "Découvrir prestataires", category: "Prestataires"  },
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
  onResize, onResizeRow, onRemove, removable,
  dragging, dropTarget,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  children,
}: {
  id: string; title: string; href?: string
  size: WidgetSize; rowSpan?: number
  onResize: (id: string, s: WidgetSize) => void
  onResizeRow?: (id: string, rows: number) => void
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
  const prevRow  = useRef(rowSpan)

  useEffect(() => {
    if (size !== prevSize.current || rowSpan !== prevRow.current) {
      prevSize.current = size; prevRow.current = rowSpan; setSnapped(true)
      const t = setTimeout(() => setSnapped(false), 180); return () => clearTimeout(t)
    }
  }, [size, rowSpan])

  const THRESHOLD = 18

  const handleResizeStart = useCallback((e: React.PointerEvent, edge: "right" | "bottom" | "left" | "top" | "corner") => {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX; const startY = e.clientY
    const startSz = size; const startRow = rowSpan
    const cardW  = cardRef.current?.offsetWidth ?? 300
    const cardH  = cardRef.current?.offsetHeight ?? 200
    const colW   = 100  // 100px drag = ±1 colonne — sensible sans être twitchy
    const rowH   = 80   // 80px drag = ±1 row — légèrement plus réactif en vertical
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (edge === "right" || edge === "corner") {
        if (Math.abs(dx) > THRESHOLD) {
          const next = Math.max(1, Math.min(4, Math.round(startSz + dx / colW))) as WidgetSize
          onResize(id, next)
        }
      }
      if (edge === "left") {
        if (Math.abs(dx) > THRESHOLD) {
          const next = Math.max(1, Math.min(4, Math.round(startSz + dx / colW))) as WidgetSize
          onResize(id, next)
        }
      }
      if (edge === "bottom" || edge === "corner") {
        if (Math.abs(dy) > THRESHOLD && onResizeRow) {
          const next = Math.max(1, Math.min(4, Math.round(startRow + dy / rowH)))
          onResizeRow(id, next)
        }
      }
      if (edge === "top") {
        if (Math.abs(dy) > THRESHOLD && onResizeRow) {
          const next = Math.max(1, Math.min(4, Math.round(startRow + dy / rowH)))
          onResizeRow(id, next)
        }
      }
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup",   onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup",   onUp)
  }, [id, size, rowSpan, onResize, onResizeRow])

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
        overflow: "visible", minHeight: 0,
      }}
      className="clone-surface"
    >
      {/* Overlay actions — visible on hover only */}
      {(removable || href) && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 5, display: "flex", gap: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          {href && (
            <Link href={href} onClick={e => e.stopPropagation()}
              aria-label={`Ouvrir ${title}`}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: "rgba(183,191,217,0.15)", color: "var(--dash-text-3,#9a9aaa)" }}>
              <GIcon name="open_in_new" size={12} />
            </Link>
          )}
          {removable && onRemove && (
            <button
              type="button"
              aria-label={`Retirer le widget ${title}`}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(id) }}
              style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(183,191,217,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-3,#9a9aaa)" }}
            ><GIcon name="close" size={10} /></button>
          )}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", borderRadius: 20 }}>{children}</div>

      {dropTarget && (
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, pointerEvents: "none", fontSize: "var(--text-2xs)", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: G, color: "#fff" }}>
          Déposer ici
        </div>
      )}

      {/* Resize edge handles — wider strips with visible hover indicator */}
      {/* Right edge */}
      <div onPointerDown={e => handleResizeStart(e, "right")}
        style={{ position: "absolute", top: 12, bottom: 12, right: -2, width: 14, cursor: "ew-resize", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", touchAction: "none", zIndex: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={() => setHovered(true)}
      ><div style={{ width: 3, height: 28, borderRadius: 99, background: "var(--dash-text-3,rgba(154,154,170,0.35))" }} /></div>
      {/* Left edge */}
      <div onPointerDown={e => handleResizeStart(e, "left")}
        style={{ position: "absolute", top: 12, bottom: 12, left: -2, width: 14, cursor: "ew-resize", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", touchAction: "none", zIndex: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={() => setHovered(true)}
      ><div style={{ width: 3, height: 28, borderRadius: 99, background: "var(--dash-text-3,rgba(154,154,170,0.35))" }} /></div>
      {/* Bottom edge */}
      <div onPointerDown={e => handleResizeStart(e, "bottom")}
        style={{ position: "absolute", bottom: -2, left: 12, right: 12, height: 14, cursor: "ns-resize", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", touchAction: "none", zIndex: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={() => setHovered(true)}
      ><div style={{ width: 28, height: 3, borderRadius: 99, background: "var(--dash-text-3,rgba(154,154,170,0.35))" }} /></div>
      {/* Top edge */}
      <div onPointerDown={e => handleResizeStart(e, "top")}
        style={{ position: "absolute", top: -2, left: 12, right: 12, height: 14, cursor: "ns-resize", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", touchAction: "none", zIndex: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={() => setHovered(true)}
      ><div style={{ width: 28, height: 3, borderRadius: 99, background: "var(--dash-text-3,rgba(154,154,170,0.35))" }} /></div>
      {/* Corner handle (bottom-right) */}
      <div onPointerDown={e => handleResizeStart(e, "corner")}
        style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16, opacity: hovered ? 0.45 : 0, cursor: "nwse-resize", transition: "opacity 0.15s", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-3,#9a9aaa)", touchAction: "none" }}
        title={`Taille ${size}/4`}
      >
        <svg width="12" height="12" viewBox="0 0 18 18" fill="currentColor">
          <rect x="11" y="1"  width="2.5" height="16" rx="1.25"/>
          <rect x="4"  y="5"  width="2.5" height="12" rx="1.25"/>
        </svg>
      </div>
    </div>
  )
}

// ── Widget picker modal ───────────────────────────────────────────────────────
function WidgetPickerModal({ active, onAdd, onClose }: { active: string[]; onAdd: (id: string) => void; onClose: () => void }) {
  // a11y — Escape to close (WCAG 2.1.2)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="widget-picker-title" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,19,23,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--dash-surface,#fff)", borderRadius: 24, width: "100%", maxWidth: 520, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 id="widget-picker-title" style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "var(--dash-text,#121317)", margin: "0 0 2px" }}>Ajouter un widget</h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Personnalisez votre espace</p>
          </div>
          <button type="button" aria-label="Fermer" onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.12))", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="var(--dash-text-2,#6a6a71)" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          {WIDGET_CATALOG.map(w => {
            const isNotes = w.id === "notes"
            const notesCount = isNotes ? active.filter(a => a === "notes" || a.startsWith("notes_")).length : 0
            const isActive = isNotes ? notesCount >= 10 : active.includes(w.id)
            const label = isNotes
              ? notesCount > 0 ? `${notesCount}/10 actifs` : w.category
              : isActive ? "✓ Actif" : w.category
            return (
              <button key={w.id} onClick={() => { if (!isActive) { onAdd(w.id); onClose() } }} disabled={isActive}
                style={{ padding: "14px 10px", borderRadius: 14, border: isActive && !isNotes ? "1.5px solid rgba(34,197,94,0.3)" : notesCount > 0 && isNotes ? "1.5px solid rgba(225,29,72,0.3)" : "1px solid var(--dash-border,rgba(183,191,217,0.2))", background: isActive && !isNotes ? "rgba(34,197,94,0.05)" : "var(--dash-faint,rgba(183,191,217,0.04))", cursor: isActive ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: isActive ? 0.6 : 1 }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text,#121317)", lineHeight: 1.3, marginBottom: 4 }}>{w.title}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: isActive ? "#22c55e" : notesCount > 0 ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)", fontWeight: isActive || notesCount > 0 ? 600 : 400 }}>{label}</div>
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
  // a11y — Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="palette-picker-title" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(18,19,23,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--dash-surface,#fff)", borderRadius: 24, width: "100%", maxWidth: 400, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="palette-picker-title" style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "var(--dash-text,#121317)", margin: 0 }}>Palette de couleurs</h2>
          <button type="button" aria-label="Fermer" onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.12))", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="close" size={14} color="var(--dash-text-2,#6a6a71)" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {PALETTES.map(p => {
            const isActive = p.g1 === current.g1 && p.g2 === current.g2
            return (
              <button key={p.name} onClick={() => onChange(p)} style={{ padding: "12px 10px", borderRadius: 14, border: isActive ? `2px solid ${p.g1}` : "1px solid var(--dash-border,rgba(183,191,217,0.2))", background: isActive ? `${p.g1}12` : "var(--dash-faint,rgba(183,191,217,0.04))", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ width: "100%", height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`, marginBottom: 7 }} />
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text,#121317)" }}>{p.name}</div>
                {isActive && <div style={{ fontSize: "var(--text-2xs)", color: p.g1, fontWeight: 700, marginTop: 2 }}>✓ Actif</div>}
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Couleur 1</span>
            <input type="color" value={current.g1} onChange={e => onChange({ ...current, g1: e.target.value })} style={{ width: "100%", height: 32, borderRadius: 7, border: "1px solid var(--dash-border)", cursor: "pointer", padding: 2 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Couleur 2</span>
            <input type="color" value={current.g2} onChange={e => onChange({ ...current, g2: e.target.value })} style={{ width: "100%", height: 32, borderRadius: 7, border: "1px solid var(--dash-border)", cursor: "pointer", padding: 2 }} />
          </label>
          <div style={{ flex: 1, height: 32, marginTop: 18, borderRadius: 7, background: `linear-gradient(135deg, ${current.g1}, ${current.g2})`, alignSelf: "flex-end" }} />
        </div>
      </div>
    </div>
  )
}


// ── Main ──────────────────────────────────────────────────────────────────────
type DashboardDataShape = {
  guests: Guest[]
  budgetItems: BudgetItem[]
  recentExpenses: BudgetItem[]
  bookings: Booking[]
  messages: Message[]
  tasks: Task[]
  edata: { budget: number; budgetSpent: number; guestCount: number; guestConfirmed: number }
  rsvpStats?: {
    viewCount: number
    confirmed: number
    plusOnes: number
    total: number
    recent: Array<{ id: string; guestName: string; attendingMain: boolean; createdAt?: string }>
  }
}

type DashboardClientProps = {
  initialPlanners: Array<{
    id: string
    title: string | null
    coupleNames: string | null
    weddingDate: string | null
    coverColor: string | null
    categories: string[]
  }>
  firstName: string
  /** Pre-hydrated dashboard data for the SSR-resolved active planner — eliminates round-trip flash. */
  initialDashboardData?: DashboardDataShape | null
  /** Planner id that `initialDashboardData` was built for (so we only seed state when localStorage agrees). */
  initialActivePlannerId?: string | null
}

export default function DashboardClient({
  initialPlanners,
  firstName: initialFirstName,
  initialDashboardData = null,
  initialActivePlannerId = null,
}: DashboardClientProps) {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  // Active event — persisté en localStorage pour synchroniser toutes les pages
  const [events,        setEvents]        = useState<EventMeta[]>(() =>
    initialPlanners
      .filter(p => p.id)
      .map(p => ({
        id:         p.id,
        name:       String(p.coupleNames || p.title || "Mon événement"),
        date:       p.weddingDate ?? "",
        color:      p.coverColor ?? "#E11D48",
        categories: p.categories ?? [],
      }))
  )
  const [activeEventId, setActiveEventId] = useState(() => {
    // SSR-safe: localStorage absent server-side → fall back to the SSR-resolved planner id
    // so initial state matches the planner that `initialDashboardData` was built for.
    if (typeof window === "undefined") return initialActivePlannerId ?? ""
    try { return localStorage.getItem("momento_active_event") ?? (initialActivePlannerId ?? "") } catch { return initialActivePlannerId ?? "" }
  })
  const [eventsLoaded,  setEventsLoaded]  = useState(true)
  const [activePlannerDetails, setActivePlannerDetails] = useState<{ eventType?: string | null; eventSubType?: string | null; categories?: string[]; budget?: number | null; budgetBreakdown?: unknown; guestCount?: number | null } | null>(null)
  const [plannerVendors, setPlannerVendors] = useState<Array<{ vendor?: { category?: string | null } | null; status?: string | null }>>([])
  const [dashboardData, setDashboardData] = useState<DashboardDataShape | null>(() => {
    // Lazily seed from SSR pre-fetch when the resolved active planner matches.
    // Avoids the 200-500ms hydration round-trip flash on first paint.
    if (typeof window === "undefined") return initialDashboardData
    if (!initialDashboardData || !initialActivePlannerId) return null
    let stored: string | null = null
    try { stored = localStorage.getItem("momento_active_event") } catch {}
    if (!stored || stored === initialActivePlannerId) return initialDashboardData
    return null
  })
  const [widgetOrder,   setWidgetOrder]   = useState<string[]>(DEFAULT_ORDER)
  const [widgetSizes,   setWidgetSizes]   = useState<Record<string, WidgetSize>>(DEFAULT_SIZES)
  const [widgetRows,    setWidgetRows]    = useState<Record<string, number>>({})
  const [extraWidgets,  setExtraWidgets]  = useState<string[]>([])
  // Source unique : ThemeProvider — plus de classList observers locaux ni de
  // localStorage doublons. Le toggle ci-dessous délègue au provider.
  const { resolved, setTheme } = useTheme()
  const darkMode = resolved === "dark"
  const [palette,       setPalette]       = useState({ g1: "#E11D48", g2: "#9333EA" })
  const [isDragging,    setIsDragging]    = useState(false)
  const [dropTarget,    setDropTarget]    = useState<string | null>(null)
  const [showPicker,    setShowPicker]    = useState(false)
  const [showPalette,   setShowPalette]   = useState(false)
  const [swipeOpen,     setSwipeOpen]     = useState(false)
  const [swipeLikeCount, setSwipeLikeCount] = useState(0)
  const [swipeCategory, setSwipeCategory] = useState<string | undefined>(undefined)
  const [swipeVendorSlug, setSwipeVendorSlug] = useState<string | undefined>(undefined)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [firstName,     setFirstName]     = useState(initialFirstName)
  const [addingTask,    setAddingTask]    = useState(false)
  const [newTaskLabel,  setNewTaskLabel]  = useState("")

  const draggingId = useRef<string | null>(null)

  const event    = events.find(e => e.id === activeEventId) ?? events[0] ?? null
  const edata    = dashboardData?.edata ?? { budget: 0, budgetSpent: 0, guestCount: 0, guestConfirmed: 0 }
  const tasks: Task[]          = dashboardData?.tasks ?? []
  const bookings: Booking[]    = dashboardData?.bookings ?? []
  const messages: Message[]    = dashboardData?.messages ?? []
  const budgetItems: BudgetItem[] = dashboardData?.budgetItems ?? []
  const recentExpenses: BudgetItem[] = dashboardData?.recentExpenses ?? []
  const guests: Guest[]        = dashboardData?.guests ?? []

  const daysLeft       = event ? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)) : 0
  const completedTasks = tasks.filter(t => t.done).length
  const taskPct        = tasks.length > 0 ? completedTasks / tasks.length : 0
  const totalUnread    = messages.reduce((s, m) => s + m.unread, 0)

  // ── Active planner details + vendors + dashboard data ─────────────────────
  useEffect(() => {
    if (!activeEventId) { setActivePlannerDetails(null); setPlannerVendors([]); setDashboardData(null); return }
    Promise.all([
      fetch(`/api/planners/${activeEventId}`),
      fetch(`/api/planners/${activeEventId}/vendors`),
      fetch(`/api/planners/${activeEventId}/dashboard-data`),
    ])
      .then(async ([pr, vr, dr]) => {
        if (pr.ok) setActivePlannerDetails(await pr.json())
        if (vr.ok) setPlannerVendors(await vr.json())
        if (dr.ok) setDashboardData(await dr.json())
      })
      .catch(() => {})
  }, [activeEventId])

  const completionPct = activePlannerDetails
    ? computeCompletion({
        planner: activePlannerDetails,
        vendors: plannerVendors,
        tasks: tasks.map(t => ({ done: t.done })),
      })
    : 0

  // ── localStorage hydration ────────────────────────────────────────────────
  // activeEventId fallback si localStorage vide OU si l'ID en cache pointe vers
  // un planner que le user ne possède plus (orphelin) → on prend le premier valide.
  useEffect(() => {
    if (events.length === 0) return
    const valid = events.some(e => e.id === activeEventId)
    if (!valid) setActiveEventId(events[0].id)
  }, [events, activeEventId])

  // ── Chargement des réglages per-event (palette + widgets) ─────────────────
  // hydratedEid (state, pas ref) : l'utiliser comme dep du save effect garantit
  // qu'au premier mount le save ne tourne PAS dans le même commit que l'hydration
  // (ce qui sauverait les valeurs initiales DEFAULT et écraserait le cache user).
  // Le state force un nouveau render APRÈS l'hydration → les setters async ont
  // pris effet → le save tourne avec les vraies valeurs custom.
  const [hydratedEid, setHydratedEid] = useState<string | null>(null)
  useEffect(() => {
    if (!activeEventId) return
    try {
      const so = localStorage.getItem(`momento_widget_order_${activeEventId}`)
      const ss = localStorage.getItem(`momento_widget_sizes_${activeEventId}`)
      const se = localStorage.getItem(`momento_extra_widgets_${activeEventId}`)
      const sp = localStorage.getItem(`momento_palette_${activeEventId}`)
      const sr = localStorage.getItem(`momento_widget_rows_${activeEventId}`)
      setWidgetOrder(so ? JSON.parse(so) : DEFAULT_ORDER)
      setWidgetSizes(ss ? JSON.parse(ss) : DEFAULT_SIZES)
      setExtraWidgets(se ? JSON.parse(se) : [])
      setPalette(sp ? JSON.parse(sp) : { g1: "#E11D48", g2: "#9333EA" })
      setWidgetRows(sr ? JSON.parse(sr) : {})
    } catch {}
    setHydratedEid(activeEventId)
  }, [activeEventId])

  // ── Persist ───────────────────────────────────────────────────────────────
  // Guard hydratedEid === activeEventId : skip le save tant que l'hydration
  // n'a pas eu lieu pour cet event (évite d'écraser le cache avec DEFAULT_*).
  useEffect(() => { try { if (activeEventId) localStorage.setItem("momento_active_event", activeEventId) } catch {} }, [activeEventId])
  useEffect(() => { if (hydratedEid !== activeEventId || !activeEventId) return; try { localStorage.setItem(`momento_widget_order_${activeEventId}`,  JSON.stringify(widgetOrder))  } catch {} }, [widgetOrder,   activeEventId, hydratedEid])
  useEffect(() => { if (hydratedEid !== activeEventId || !activeEventId) return; try { localStorage.setItem(`momento_widget_sizes_${activeEventId}`,  JSON.stringify(widgetSizes))  } catch {} }, [widgetSizes,   activeEventId, hydratedEid])
  useEffect(() => { if (hydratedEid !== activeEventId || !activeEventId) return; try { localStorage.setItem(`momento_widget_rows_${activeEventId}`,   JSON.stringify(widgetRows))   } catch {} }, [widgetRows,    activeEventId, hydratedEid])
  useEffect(() => { if (hydratedEid !== activeEventId || !activeEventId) return; try { localStorage.setItem(`momento_extra_widgets_${activeEventId}`, JSON.stringify(extraWidgets)) } catch {} }, [extraWidgets,  activeEventId, hydratedEid])
  useEffect(() => { try { localStorage.setItem(`momento_palette_${activeEventId}`,       JSON.stringify(palette))      } catch {} }, [palette,       activeEventId])

  // Dark mode : géré entièrement par ThemeProvider (classe .dark + colorScheme
  // + localStorage `momento_theme`). Le toggle ci-dessous appelle setTheme().

  // ── Palette — CSS vars sur <html> ─────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty("--g1", palette.g1)
    document.documentElement.style.setProperty("--g2", palette.g2)
  }, [palette])

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
  function onResizeRow(id: string, rows: number) { setWidgetRows(prev => ({ ...prev, [id]: rows })) }
  const MAX_NOTES = 10
  function addWidget(id: string) {
    let finalId = id
    if (id === "notes") {
      const existing = widgetOrder.filter(w => w === "notes" || w.startsWith("notes_"))
      if (existing.length >= MAX_NOTES) return
      finalId = existing.length === 0 ? "notes" : `notes_${existing.length}`
    }
    setExtraWidgets(p => [...p, finalId]); setWidgetOrder(p => [...p, finalId]); setWidgetSizes(p => ({ ...p, [finalId]: 1 as WidgetSize }))
  }
  function removeWidget(id: string) { setExtraWidgets(p => p.filter(w => w !== id)); setWidgetOrder(p => p.filter(w => w !== id)) }
  async function toggleTask(taskId: string) {
    const current = dashboardData?.tasks.find(t => t.id === taskId)
    if (!current) return
    // Optimistic update
    setDashboardData(prev => prev ? { ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : prev)
    try {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current.done }),
      })
      if (!r.ok) throw new Error("toggle failed")
    } catch {
      // Rollback
      setDashboardData(prev => prev ? { ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, done: current.done } : t) } : prev)
    }
  }
  async function submitNewTask() {
    const label = newTaskLabel.trim()
    if (!label || !activeEventId) return
    setNewTaskLabel(""); setAddingTask(false)
    try {
      const r = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: label, plannerId: activeEventId }),
      })
      if (!r.ok) return
      const created = await r.json() as { id: string; title: string; dueDate: string | null; category: string | null }
      const newTask: Task = {
        id: created.id,
        label: created.title,
        done: false,
        priority: "moyenne",
        dueDate: created.dueDate ? created.dueDate.slice(0, 10) : "",
        category: created.category ?? "Divers",
      }
      setDashboardData(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : prev)
    } catch {}
  }
  function resetLayout() {
    setWidgetOrder([...DEFAULT_ORDER]); setWidgetSizes({ ...DEFAULT_SIZES }); setExtraWidgets([]); setWidgetRows({})
    try { ["momento_clone_widget_order","momento_clone_widget_sizes","momento_clone_extra_widgets","momento_widget_rows_" + activeEventId].forEach(k => localStorage.removeItem(k)) } catch {}
  }

  // ── Inline widget content ─────────────────────────────────────────────────
  function renderTasks() {
    const pending = tasks.filter(t => !t.done)
    const done    = tasks.filter(t => t.done)
    return (
      <div style={{ padding: "10px 16px 14px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>{completedTasks}/{tasks.length}</span>
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
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--dash-text,#121317)", lineHeight: 1.35 }}>{task.label}</div>
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, textTransform: "uppercase", padding: "1px 5px", borderRadius: 99, background: p.bg, color: p.color }}>{task.priority}</span>
                </div>
                <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", flexShrink: 0 }}>{shortDate(task.dueDate)}</span>
              </div>
            )
          })}
          {done.length > 0 && (
            <>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", padding: "6px 0 4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Complétées</div>
              {done.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", borderBottom: "1px solid var(--dash-divider)", opacity: 0.45 }}>
                  <button onClick={() => toggleTask(task.id)} className="clone-check-done" style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: "none", background: G, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GIcon name="check" size={10} color="#fff" />
                  </button>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)", textDecoration: "line-through", flex: 1 }}>{task.label}</span>
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
              style={{ flex: 1, fontSize: "var(--text-xs)", padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--g1,#E11D48)", background: "var(--dash-faint,rgba(183,191,217,0.04))", outline: "none", fontFamily: "inherit", color: "var(--dash-text,#121317)" }}
            />
            <button onClick={submitNewTask} style={{ padding: "5px 10px", borderRadius: 8, background: G, color: "#fff", border: "none", cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 600, fontFamily: "inherit" }}>+</button>
            <button onClick={() => { setAddingTask(false); setNewTaskLabel("") }} style={{ padding: "5px 8px", borderRadius: 8, background: "transparent", border: "1px solid var(--dash-border)", cursor: "pointer", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", fontFamily: "inherit" }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setAddingTask(true)} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, padding: "6px", borderRadius: 8, background: "transparent", border: "1px dashed var(--dash-border,rgba(183,191,217,0.3))", color: "var(--dash-text-3,#9a9aaa)", fontSize: "var(--text-xs)", cursor: "pointer", fontFamily: "inherit", width: "100%", justifyContent: "center" }}>
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
            { val: totalAmt > 0 ? `${(totalAmt / 1000).toFixed(0)}k Dhs` : "—", label: "Engagé", href: "/budget" },
          ].map(({ val, label, href }) => (
            <Link key={label} href={href} style={{ padding: "9px 10px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.07))", border: "1px solid var(--dash-border)", textDecoration: "none" }}>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 800, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>{label}</div>
            </Link>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {bookings.map(b => {
            const s    = STATUS_STYLES[b.status]
            const slug = b.vendor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
            return (
              <Link key={b.id} href={`/vendor/${slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--dash-divider)", textDecoration: "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${s.color}15`, border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: 700, color: s.color }}>
                  {b.vendor.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.vendor}</div>
                  <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>{b.category}</div>
                </div>
                <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
              </Link>
            )
          })}
        </div>
        <Link href="/explore" style={{ marginTop: 8, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", background: G, color: "#fff", fontSize: "var(--text-xs)", fontWeight: 600, textDecoration: "none" }}>
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
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff" }}>
              {unread} non lu{unread !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {messages.map(msg => (
            <Link key={msg.id} href="/messages" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--dash-divider)", textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: msg.unread > 0 ? G : "var(--dash-faint-2,rgba(183,191,217,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: 700, color: msg.unread > 0 ? "#fff" : "var(--dash-text-2,#45474D)" }}>
                {msg.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: msg.unread > 0 ? 700 : 500, color: "var(--dash-text,#121317)" }}>{msg.vendor}</span>
                  <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", marginLeft: 8 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: msg.unread > 0 ? "var(--dash-text-2,#45474D)" : "var(--dash-text-3,#9a9aaa)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1, fontWeight: msg.unread > 0 ? 500 : 400 }}>{msg.lastMsg}</div>
              </div>
              {msg.unread > 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: G, flexShrink: 0 }} />}
            </Link>
          ))}
        </div>
        <Link href="/messages" style={{ marginTop: 8, display: "block", padding: "7px", borderRadius: 99, textAlign: "center", border: "1px solid var(--dash-border)", color: "var(--dash-text-2,#45474D)", fontSize: "var(--text-xs)", fontWeight: 500, textDecoration: "none" }}>
          Voir tous les messages →
        </Link>
      </div>
    )
  }

  function renderWidgetContent(id: string) {
    switch (id as WidgetId) {
      case "countdown": return <CountdownWidget name={event.name} date={event.date} guestCount={edata.guestCount} guestConfirmed={edata.guestConfirmed} />
      case "budget":    return <BudgetWidget total={edata.budget} spent={edata.budgetSpent} items={budgetItems} />
      case "swipe":         return <VendorSwipeWidget plannerId={activeEventId ?? ""} onOpenModal={(cat, slug) => { setSwipeCategory(cat); setSwipeVendorSlug(slug); setSwipeOpen(true) }} onLike={() => setSwipeLikeCount(c => c + 1)} />
      case "prestataires":  return <MesPrestatairesWidget plannerId={activeEventId ?? ""} refreshKey={swipeLikeCount} />
      case "tasks":     return renderTasks()
      case "bookings":  return renderBookings()
      case "messages":  return renderMessages()
      default: {
        const cat = WIDGET_CATALOG.find(w => w.id === id)
        if (!cat) return null
        const baseId = id.startsWith("notes_") ? "notes" : cat.id
        switch (baseId) {
          case "notes":       return <NotesWidget storageKey={`momento_notes_${id}_${activeEventId}`} />
          case "progression": return <ProgressionWidget taskPct={taskPct} budgetPct={edata.budget > 0 ? Math.min(1, edata.budgetSpent / edata.budget) : 0} guestPct={edata.guestCount > 0 ? edata.guestConfirmed / edata.guestCount : 0} bookingsPct={bookings.length > 0 ? bookings.filter(b => b.status === "CONFIRMED").length / bookings.length : 0} />
          case "checklist":    return <ChecklistJXWidget tasks={tasks} eventDate={event.date} />
          case "timeline":     return <TimelineWidget tasks={tasks} eventDate={event.date} />
          case "transport":    return <TransportWidget guests={guests} eventId={activeEventId} />
          case "plantable":    return <PlanTableWidget guests={guests} />
          case "rsvplive":     return <RSVPLiveWidget rsvpStats={dashboardData?.rsvpStats} />
          case "regimes":      return <RegimesWidget guests={guests} />
          case "depenses":     return <DepensesRecentesWidget budgetItems={recentExpenses} />
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
    const baseId = id.startsWith("notes_") ? "notes" : id
    const cat = WIDGET_CATALOG.find(w => w.id === baseId)
    if (!cat) return null
    const title = baseId === "notes" && id !== "notes" ? `Notes ${id.split("_")[1]}` : cat.title
    return { title, href: undefined, rowSpan: 1 }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!eventsLoaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg,#f7f7fb)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 320, width: "100%" }}>
        <div className="mo-skel" style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#E11D48,#9333EA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div className="mo-skel" style={{ height: 12, width: 180, borderRadius: 6, background: "var(--dash-faint-2,rgba(183,191,217,0.18))", animationDelay: "0.15s" }} />
        <div className="mo-skel" style={{ height: 10, width: 120, borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.10))", animationDelay: "0.3s" }} />
      </div>
      <style>{`@keyframes moPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } } .mo-skel { animation: moPulse 1.4s ease-in-out infinite; }`}</style>
    </div>
  )

  if (events.length === 0 || !event) return (
    <div style={{ minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Nav complète (logo, profil, theme toggle) — plus d'écran nu sans accès au menu */}
      <AntNav />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "96px 24px 80px" }}>
        {/* Carte principale */}
        <div style={{
          background: "var(--dash-surface,#fff)",
          borderRadius: 28,
          padding: "56px 40px",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
          boxShadow: "0 8px 36px rgba(12,14,30,0.05)",
          textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: 640, margin: "0 auto",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", marginBottom: 24,
            background: "linear-gradient(135deg,#E11D48,#9333EA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 16px 48px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          <p style={{
            fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#E11D48", margin: "0 0 12px",
          }}>
            ✦ Commençons ✦
          </p>

          <h1 style={{
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700,
            color: "var(--dash-text,#121317)", letterSpacing: "-0.025em",
            margin: "0 0 12px", lineHeight: 1.15,
          }}>
            Créez votre premier événement
          </h1>
          <p style={{
            fontSize: "var(--text-base)", color: "var(--dash-text-2,#6a6a71)",
            margin: "0 0 32px", lineHeight: 1.6, maxWidth: 440,
          }}>
            Mariage, anniversaire, corporate… En 3 étapes on calibre budget, invités, prestataires, planning.
          </p>

          {/* Features grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10, marginBottom: 32, width: "100%", maxWidth: 480,
          }}>
            {[
              { icon: "account_balance_wallet", label: "Budget détaillé" },
              { icon: "people",                  label: "Invités & RSVP" },
              { icon: "storefront",              label: "1 000+ prestataires" },
              { icon: "checklist",               label: "Planning & tâches" },
            ].map(f => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", borderRadius: 14,
                background: "var(--dash-faint,rgba(225,29,72,0.04))",
                border: "1px solid rgba(225,29,72,0.12)",
                textAlign: "left",
              }}>
                <span style={{
                  fontFamily: "'Google Symbols','Material Symbols Outlined'",
                  fontSize: "var(--text-md)", color: "#E11D48", lineHeight: 1,
                }}>{f.icon}</span>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text,#121317)" }}>{f.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 14,
              background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff",
              fontSize: "var(--text-base)", fontWeight: 700, border: "none", cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 24px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px color-mix(in srgb, var(--g1,#E11D48) 35%, transparent)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Créer mon événement en 3 étapes
          </button>

          <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", marginTop: 14 }}>
            Gratuit · Simple · Données sécurisées
          </p>

          <div style={{ marginTop: 20, fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>
            Ou{" "}
            <Link href="/accueil" style={{ color: "var(--dash-text-2,#6a6a71)", textDecoration: "underline" }}>
              retour à l&apos;accueil
            </Link>
            {" · "}
            <Link href="/explore" style={{ color: "var(--dash-text-2,#6a6a71)", textDecoration: "underline" }}>
              explorer les prestataires
            </Link>
          </div>
        </div>
      </div>

      {/* 3-steps onboarding modal — type événement → catégories → budget */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(planner) => {
          setShowCreateModal(false)
          try { localStorage.setItem("momento_active_event", planner.id) } catch {}
          router.push("/dashboard")
          router.refresh()
        }}
      />
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
              workspaceId="clone-workspace-1" plannerId={activeEventId ?? null}
              categories={event?.categories?.length ? event.categories : ["Photographe","DJ","Traiteur","Décorateur","Fleuriste","Lieu de réception","Videaste","Makeup Artist"]}
              initialCategory={swipeCategory ?? event?.categories?.[0] ?? "Photographe"}
              initialVendorSlug={swipeVendorSlug}
              onClose={() => { setSwipeOpen(false); setSwipeVendorSlug(undefined) }} onBooked={() => { /* ne pas fermer la modal sur swipe */ }}
            />
          </div>
        </div>
      )}

      {showPicker  && <WidgetPickerModal active={widgetOrder} onAdd={addWidget} onClose={() => setShowPicker(false)} />}
      {showPalette && <PalettePickerModal current={palette} onChange={setPalette} onClose={() => setShowPalette(false)} />}

      <main id="main-content" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="flex lg:hidden" style={{ alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--dash-surface,#fff)", borderBottom: "1px solid var(--dash-border)", position: "sticky", top: 0, zIndex: 20 }}>
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu de navigation" style={{ width: 34, height: 34, borderRadius: 9, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GIcon name="menu" size={18} color="var(--dash-text-2,#45474D)" />
          </button>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)", letterSpacing: "-0.02em" }}>Momento</span>
          {totalUnread > 0 && (
            <Link href="/messages" style={{ marginLeft: "auto", fontSize: "var(--text-2xs)", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: G, color: "#fff", textDecoration: "none" }}>
              {totalUnread} non lu{totalUnread !== 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {/* Event header — 3 zones cohérentes brand: titre · progression centre · KPI pills */}
        <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: event.color, boxShadow: `0 0 8px ${event.color}90` }} />
              <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Événement actif</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.2rem,2.2vw,1.6rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 3px" }}>
              {event.name}
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
              {new Date(event.date).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              <span style={{ fontWeight: 700, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>J-{daysLeft}</span>
            </p>
          </div>

          {/* Progress banner — centré, prend l'espace dispo, recule sous le titre sur écrans étroits */}
          <div style={{ flex: "1 1 320px", minWidth: 0, maxWidth: 520 }}>
            <DashboardProgressBanner
              eventLabel={getEventLabel(activePlannerDetails?.eventType, activePlannerDetails?.eventSubType)}
              completionPct={completionPct}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
            {[
              { icon: "groups",                 val: `${edata.guestConfirmed}/${edata.guestCount}`, label: "invités",  href: "/guests"  },
              { icon: "check_circle",           val: `${completedTasks}/${tasks.length}`,           label: "tâches",   href: "/planner" },
              { icon: "account_balance_wallet", val: `${edata.budget > 0 ? Math.round((edata.budgetSpent / edata.budget) * 100) : 0}%`, label: "budget", href: "/budget" },
            ].map(({ icon, val, label, href }) => (
              <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, textDecoration: "none", background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} className="clone-card-white">
                <GIcon name={icon} size={13} color="var(--g1,#E11D48)" />
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>{val}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "8px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#c9cad0)" }}>Glisser · Redimensionner (poignée bas-droite)</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={() => setTheme(darkMode ? "light" : "dark")} title={darkMode ? "Mode clair" : "Mode sombre"}
              aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              aria-pressed={darkMode}
              style={{ width: 30, height: 30, borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name={darkMode ? "light_mode" : "dark_mode"} size={15} color="var(--dash-text-2,#45474D)" />
            </button>
            <button type="button" onClick={() => setShowPalette(true)} title="Palette"
              aria-label="Choisir une palette de couleurs"
              style={{ width: 30, height: 30, borderRadius: 8, background: `${palette.g1}18`, border: `1px solid ${palette.g1}40`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name="palette" size={15} color={palette.g1} />
            </button>
            <button type="button" onClick={resetLayout} title="Réinitialiser"
              aria-label="Réinitialiser la disposition des widgets"
              style={{ width: 30, height: 30, borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", border: "1px solid var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GIcon name="restart_alt" size={15} color="var(--dash-text-3,#9a9aaa)" />
            </button>
            <button type="button" onClick={() => setShowPicker(true)}
              aria-label="Ajouter un widget"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 12px", height: 30, borderRadius: 99, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border)", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text-2,#45474D)", cursor: "pointer", fontFamily: "inherit" }}>
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
                <WidgetCard key={id} id={id} title={meta.title} href={meta.href} size={size} rowSpan={widgetRows[id] || meta.rowSpan}
                  onResize={onResize} onResizeRow={onResizeRow} onRemove={removeWidget} removable
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
