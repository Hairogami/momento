"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, X, ArrowUpRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
const VendorSwipeModal = dynamic(() => import("@/components/VendorSwipeModal"), { ssr: false });
import { C } from "@/lib/colors";
import BudgetChart from "@/components/BudgetChart";
import { InlineEdit } from "@/components/InlineEdit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  category: string | null;
  dueDate: string | null;
  completed: boolean;
}

interface BudgetItem {
  id: string;
  category: string;
  label: string;
  estimated: number;
  actual: number | null;
}

interface Booking {
  id: string;
  status: string;
  totalPrice?: number | null;
  eventDate?: string | null;
  vendor: {
    name: string;
    category: string;
    rating?: number | null;
  } | null;
}

interface Guest {
  id: string;
  name?: string | null;
  rsvp: string;
  tableNumber?: number | null;
  city?: string | null;
  inviteSent?: boolean | null;
}

export interface DashboardData {
  firstName: string | null;
  eventName: string;
  eventDate: string | null;
  budget: number | null;
  guestCount: number | null;
  tasks: Task[];
  budgetItems: BudgetItem[];
  bookings: Booking[];
  guests: Guest[];
  unreadCount: number;
}

// ─── SVG helpers ──────────────────────────────────────────────────────────────

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
  const o1 = polarToXY(cx, cy, outer, start);
  const o2 = polarToXY(cx, cy, outer, end);
  const i1 = polarToXY(cx, cy, inner, end);
  const i2 = polarToXY(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;
  return `M${o1.x} ${o1.y} A${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y} L${i1.x} ${i1.y} A${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

// ─── Stats centralisées (source unique de vérité) ────────────────────────────

export function computeStats(d: DashboardData) {
  // Tâches
  const tasks_total = d.tasks.length;
  const tasks_done  = d.tasks.filter(t => t.completed).length;
  const tasks_pct   = tasks_total > 0 ? Math.round((tasks_done / tasks_total) * 100) : 0;

  // Budget
  const budget_expected  = d.budget ?? 0;
  const budget_spent     = d.budgetItems.reduce((s, b) => s + (b.actual ?? 0), 0);
  const budget_est       = d.budgetItems.reduce((s, b) => s + b.estimated, 0);
  // committed = actual si renseigné, sinon estimated (même logique que BudgetChart)
  const budget_committed = d.budgetItems.reduce((s, b) => s + (b.actual ?? b.estimated), 0);
  const budget_pct       = budget_expected > 0 ? Math.round((budget_committed / budget_expected) * 100) : 0;
  const budget_remaining = Math.max(0, budget_expected - budget_spent);

  // Invités — dénominateur = guestCount (prévu) si renseigné, sinon total inscrit
  const guests_registered = d.guests.length;
  const guests_confirmed  = d.guests.filter(g => g.rsvp === "yes").length;
  const guests_declined   = d.guests.filter(g => g.rsvp === "no").length;
  const guests_pending    = d.guests.filter(g => g.rsvp === "pending").length;
  const guests_expected   = d.guestCount ?? guests_registered;
  // Progression = confirmés / attendus (même chiffre partout)
  const guests_pct        = guests_expected > 0 ? Math.round((guests_confirmed / guests_expected) * 100) : 0;

  // Prestataires
  const bookings_total     = d.bookings.length;
  const bookings_confirmed = d.bookings.filter(b => b.status === "confirmed").length;
  const bookings_pending   = d.bookings.filter(b => b.status !== "confirmed" && b.status !== "cancelled").length;
  const bookings_pct       = bookings_total > 0 ? Math.round((bookings_confirmed / bookings_total) * 100) : 0;

  // Score global (même formule que ProgressionWidget)
  const overall = Math.round((tasks_pct + budget_pct + guests_pct + bookings_pct) / 4);

  return {
    tasks:    { total: tasks_total,     done: tasks_done,          pct: tasks_pct },
    budget:   { expected: budget_expected, spent: budget_spent, est: budget_est, committed: budget_committed, remaining: budget_remaining, pct: budget_pct },
    guests:   { registered: guests_registered, confirmed: guests_confirmed, declined: guests_declined, pending: guests_pending, expected: guests_expected, pct: guests_pct },
    bookings: { total: bookings_total,  confirmed: bookings_confirmed, pending: bookings_pending, pct: bookings_pct },
    overall,
  };
}

export type DashStats = ReturnType<typeof computeStats>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  "Photographe": "📸", "Vidéaste": "🎥", "DJ": "🎵", "Orchestre": "🎼",
  "Chanteur / chanteuse": "🎤", "Traiteur": "🍽️", "Fleuriste événementiel": "💐",
  "Lieu de réception": "🏛️", "Makeup Artist": "💄", "Hairstylist": "💇",
  "Wedding planner": "💍", "Event planner": "🎪", "Pâtissier / Cake designer": "🎂",
  "Location de voiture de mariage": "🚗", "Décorateur": "🌸", "Neggafa": "👘",
  "Créateur de faire-part": "💌", "Créateur de cadeaux invités": "🎁",
  "Animateur enfants": "🎩", "VTC / Transport invités": "🚌",
  "Créateur d'ambiance lumineuse": "💡", "Service de bar / mixologue": "🍹",
  "Spa / soins esthétiques": "💆", "Magicien": "🪄", "Violoniste": "🎻",
  "Dekka Marrakchia / Issawa": "🥁", "Robes de mariés": "👗",
  "Sécurité événementielle": "🔒",
};

const BUDGET_COLORS = ["#e07b5a", "#4a9eda", "#5ac87a", "#da844a", "#9a5ae0", "#e0b84a", "#5ae0d4"];

const BASE_ORDER  = ["noteslibres", "budget", "prestataires", "planning", "messages", "invites", "meteo"];
const STORAGE_KEY = "momento_widget_order";
const SIZE_KEY    = "momento_widget_sizes";

type WidgetSize = 1 | 2 | 3 | 4;
function colSpanClass(size: WidgetSize) {
  if (size === 2) return "md:col-span-2";
  if (size === 3) return "md:col-span-2 xl:col-span-3";
  if (size === 4) return "md:col-span-2 xl:col-span-3 2xl:col-span-4";
  return "";
}

// ─── Widget catalog (for picker) ──────────────────────────────────────────────

export const WIDGET_CATALOG: { id: string; title: string; icon: string; category: string }[] = [
  { id: "depenses",    title: "Dépenses récentes",   icon: "📊", category: "Finance" },
  { id: "epargne",     title: "Objectif budget",      icon: "🎯", category: "Finance" },
  { id: "repartition", title: "Répartition budget",   icon: "🥧", category: "Finance" },
  { id: "checklistjx", title: "Checklist J-X",        icon: "📆", category: "Logistique" },
  { id: "timeline",    title: "Timeline",             icon: "🗓️", category: "Logistique" },
  { id: "plantable",   title: "Plan de table",        icon: "🪑", category: "Logistique" },
  { id: "rsvplive",    title: "RSVP Live",            icon: "📨", category: "Invités" },
  { id: "regimes",     title: "Régimes alimentaires", icon: "🍽️", category: "Invités" },
  { id: "contrats",    title: "Contrats à signer",    icon: "📄", category: "Prestataires" },
  { id: "moodboard",   title: "Mood board",           icon: "🎨", category: "Inspiration" },
  { id: "countdown",   title: "Compte à rebours",     icon: "⏱️", category: "Inspiration" },
  { id: "citation",    title: "Citation du jour",     icon: "✨", category: "Inspiration" },
  { id: "progression", title: "Score de progression", icon: "🏆", category: "Avancé" },
  { id: "alertes",     title: "Rappels & alertes",    icon: "🔔", category: "Avancé" },
  { id: "noteslibres",    title: "Notes libres",          icon: "📝", category: "Avancé" },
  { id: "transport",      title: "Transport & navettes",  icon: "🚌", category: "Logistique" },
  { id: "cartegeo",       title: "Carte géographique",    icon: "🗺️", category: "Invités" },
  { id: "envoi",          title: "Envoi faire-part",      icon: "💌", category: "Invités" },
];

// ─── Widget card wrapper ──────────────────────────────────────────────────────

interface WidgetCardProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  href?: string;
  dragging: boolean;
  size: WidgetSize;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  onRemove?: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
}

function WidgetCard({ id, title, icon, children, href, dragging, size, onDragStart, onDragOver, onDrop, onRemove, onResize }: WidgetCardProps) {
  const [isOver, setIsOver] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevSizeRef = useRef(size);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snap feedback when size changes during drag
  useEffect(() => {
    if (size !== prevSizeRef.current) {
      prevSizeRef.current = size;
      if (snapTimer.current) clearTimeout(snapTimer.current);
      setSnapped(true);
      snapTimer.current = setTimeout(() => setSnapped(false), 180);
    }
  }, [size]);

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startSize = size;
    const cardWidth = cardRef.current?.offsetWidth ?? 300;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const colWidth = Math.max(160, cardWidth / startSize);
      const raw = startSize + delta / colWidth;
      const newSize = Math.max(1, Math.min(4, Math.round(raw))) as WidgetSize;
      onResize(id, newSize);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group rounded-2xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none relative h-full"
      style={{
        backgroundColor: C.dark,
        border: snapped ? `1.5px solid ${C.terra}` : isOver ? `2px solid ${C.terra}` : `1px solid ${C.anthracite}`,
        opacity: dragging ? 0.45 : 1,
        boxShadow: snapped
          ? `0 0 0 3px rgba(var(--momento-terra-rgb), 0.17), 0 0 16px rgba(var(--momento-terra-rgb), 0.12)`
          : isOver ? `0 0 0 2px rgba(var(--momento-terra-rgb), 0.19)` : undefined,
        transform: snapped ? "scale(1.006)" : undefined,
        transition: snapped
          ? "transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.14s ease, border-color 0.14s ease"
          : "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 min-w-0">
        <GripVertical
          size={13}
          className="flex-shrink-0 opacity-20 group-hover:opacity-50 transition-opacity cursor-grab"
          style={{ color: C.mist }}
        />
        <span className="text-sm leading-none flex-shrink-0">{icon}</span>
        {href ? (
          <Link
            href={href}
            className="text-xs font-semibold flex-1 min-w-0 truncate transition-opacity hover:opacity-100"
            style={{ color: C.white, opacity: 0.9 }}
            onClick={e => e.stopPropagation()}
          >
            {title}
          </Link>
        ) : (
          <span className="text-xs font-semibold flex-1 min-w-0 truncate" style={{ color: C.white, opacity: 0.9 }}>
            {title}
          </span>
        )}
        {/* Actions en haut à droite */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {href && (
            <Link
              href={href}
              className="opacity-0 group-hover:opacity-30 hover:!opacity-80 transition-opacity"
              onClick={e => e.stopPropagation()}
              title={title}
            >
              <ArrowUpRight size={13} style={{ color: C.mist }} />
            </Link>
          )}
          {onRemove && !BASE_ORDER.includes(id) && hovered && (
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(id); }}
              className="w-4 h-4 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: C.anthracite }}
              title="Retirer le widget"
            >
              <X size={9} style={{ color: C.mist }} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Resize handle — coin bas-droit */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-ew-resize select-none flex items-center justify-center rounded-md"
        title="Redimensionner"
        style={{ color: C.mist, lineHeight: 1, padding: "4px", backgroundColor: `rgba(var(--momento-terra-rgb), 0)` }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <rect x="11" y="1"  width="2.5" height="16" rx="1.25" />
          <rect x="4"  y="5"  width="2.5" height="12" rx="1.25" />
        </svg>
      </div>
    </div>
  );
}

// ─── Existing widgets ─────────────────────────────────────────────────────────

function BudgetWidget({ data, onEditActual }: { data: DashboardData; onEditActual: (id: string, actual: number | null) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const s = computeStats(data);
  const spent = s.budget.spent;
  const pct = s.budget.pct;

  function startEdit(item: { id: string; actual: number | null; estimated: number }) {
    setEditingId(item.id);
    setEditValue(String(item.actual ?? item.estimated));
    setTimeout(() => inputRef.current?.select(), 10);
  }

  function commitEdit(id: string) {
    const v = parseFloat(editValue);
    onEditActual(id, isNaN(v) ? null : v);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: C.white }}>{spent.toLocaleString("fr-FR")} MAD</p>
          {data.budget && <p className="text-xs" style={{ color: C.mist }}>sur {data.budget.toLocaleString("fr-FR")} MAD prévus</p>}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: pct > 90 ? `${C.terra}30` : C.anthracite, color: pct > 90 ? C.terra : C.mist }}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct > 90 ? C.terra : "rgba(var(--momento-terra-rgb),0.6)" }} />
      </div>
      <BudgetChart items={data.budgetItems} total={data.budget ?? 0} />

      {/* Édition inline des dépenses réelles */}
      <div className="flex flex-col gap-1.5 mt-1 border-t pt-2" style={{ borderColor: `${C.anthracite}60` }}>
        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: `${C.mist}40` }}>Modifier les dépenses</p>
        {data.budgetItems.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <InlineEdit value={item.label} endpoint="/api/budget-items" id={item.id} field="label" className="text-[10px] flex-1 truncate" style={{ color: C.mist }} />
            {editingId === item.id ? (
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => commitEdit(item.id)}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                className="w-24 text-right text-xs rounded-lg px-2 py-0.5 outline-none"
                style={{ backgroundColor: `${C.terra}15`, border: `1px solid ${C.terra}60`, color: C.white }}
              />
            ) : (
              <button
                onClick={() => startEdit(item)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-all hover:opacity-70"
                style={{ backgroundColor: `${C.anthracite}60`, color: item.actual !== null ? C.terra : `${C.mist}60` }}
              >
                {item.actual !== null ? `${item.actual.toLocaleString("fr-FR")} MAD` : "— MAD"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const BOOKING_STATUSES = [
  { key: "non_contacte", label: "Non contacté", color: C.mist, bg: `${C.anthracite}60` },
  { key: "pending",      label: "En attente",   color: "#e0b84a", bg: "#e0b84a15" },
  { key: "confirmed",    label: "Confirmé",     color: "#4ade80", bg: "#2a8a4a20" },
] as const;

type BookingStatusKey = typeof BOOKING_STATUSES[number]["key"];

function getBookingStatus(b: Booking): BookingStatusKey {
  if (b.status === "confirmed") return "confirmed";
  if (b.status === "pending")   return "pending";
  return "non_contacte";
}

function PrestatairesWidget({ data, neededCategories = [], workspaceId, plannerId }: {
  data: DashboardData;
  neededCategories?: string[];
  workspaceId?: string;
  plannerId?: string | null;
}) {
  const s = computeStats(data);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, BookingStatusKey>>({});
  const [swipeCategory, setSwipeCategory] = useState<string | null>(null);
  const [optimisticBookings, setOptimisticBookings] = useState<{ id: string; name: string; category: string }[]>([]);

  async function handleStatusChange(bookingId: string, newStatus: BookingStatusKey) {
    setStatusOverrides(prev => ({ ...prev, [bookingId]: newStatus }));
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch { /* optimistic only */ }
  }

  // Catégories couvertes (bookings existants + optimistic)
  const coveredCats = new Set([
    ...data.bookings.map(b => b.vendor?.category).filter(Boolean) as string[],
    ...optimisticBookings.map(b => b.category),
  ]);

  const allBookings = data.bookings;
  const totalBookings = allBookings.length + optimisticBookings.length;
  const pendingCount = s.bookings.pending + optimisticBookings.length;

  return (
    <>
      <div className="flex flex-col gap-3">

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ backgroundColor: `rgba(var(--momento-terra-rgb),0.12)` }}>
            <p className="text-lg font-bold" style={{ color: C.terra }}>{s.bookings.confirmed}</p>
            <p className="text-[10px]" style={{ color: C.mist }}>confirmés</p>
          </div>
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ backgroundColor: `${C.anthracite}40` }}>
            <p className="text-lg font-bold" style={{ color: C.white }}>{pendingCount}</p>
            <p className="text-[10px]" style={{ color: C.mist }}>en attente</p>
          </div>
        </div>

        {/* Categories needed */}
        {neededCategories.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${C.mist}60` }}>
              Catégories recherchées
            </p>
            {neededCategories.map(cat => {
              const covered = coveredCats.has(cat);
              const booking = allBookings.find(b => b.vendor?.category === cat)
                || optimisticBookings.find(b => b.category === cat);
              return (
                <div key={cat}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                  style={{ backgroundColor: covered ? `rgba(34,197,94,0.06)` : `${C.anthracite}30`,
                    border: `1px solid ${covered ? "rgba(34,197,94,0.15)" : "transparent"}` }}>
                  <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[cat] ?? "🏢"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: covered ? "#4ade80" : C.white }}>{cat}</p>
                    {covered && booking && (
                      <p className="text-[10px] truncate" style={{ color: "rgba(74,222,128,0.6)" }}>
                        {"name" in booking ? booking.name : booking.vendor?.name ?? ""} · en attente
                      </p>
                    )}
                  </div>
                  {covered ? (
                    <span className="text-sm flex-shrink-0">✓</span>
                  ) : workspaceId ? (
                    <button
                      onClick={() => setSwipeCategory(cat)}
                      className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: `rgba(var(--momento-terra-rgb),0.15)`, color: C.terra,
                        border: `1px solid rgba(var(--momento-terra-rgb),0.25)` }}>
                      Trouver →
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Bookings list */}
        {(allBookings.length > 0 || optimisticBookings.length > 0) && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${C.mist}60` }}>
              Sélection en cours
            </p>
            {allBookings.slice(0, 3).map(b => {
              const st = statusOverrides[b.id] ?? getBookingStatus(b);
              return (
                <div key={b.id} className="flex flex-col gap-1 py-1.5 px-2.5 rounded-xl" style={{ backgroundColor: `${C.anthracite}30` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `rgba(var(--momento-terra-rgb),0.18)`, color: C.terra }}>
                      {b.vendor?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: C.white }}>{b.vendor?.name ?? "—"}</p>
                      <p className="text-[10px]" style={{ color: C.mist }}>{b.vendor?.category ?? ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {BOOKING_STATUSES.map(bst => (
                      <button key={bst.key}
                        onClick={() => handleStatusChange(b.id, bst.key)}
                        className="flex-1 text-[9px] px-1 py-0.5 rounded-md transition-all font-semibold truncate"
                        style={{
                          backgroundColor: st === bst.key ? bst.bg : `${C.anthracite}40`,
                          color: st === bst.key ? bst.color : `${C.mist}50`,
                          border: st === bst.key ? `1px solid ${bst.color}40` : `1px solid transparent`,
                        }}>
                        {bst.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {optimisticBookings.map(b => (
              <div key={b.id} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl"
                style={{ backgroundColor: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                  {b.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "#4ade80" }}>{b.name}</p>
                  <p className="text-[10px]" style={{ color: "rgba(74,222,128,0.5)" }}>Sélectionné · en attente</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalBookings === 0 && neededCategories.length === 0 && (
          <p className="text-xs" style={{ color: C.mist }}>Aucun prestataire ajouté</p>
        )}

        {/* Bouton découvrir général */}
        {workspaceId && (
          <button
            onClick={() => setSwipeCategory("")}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, rgba(var(--momento-terra-rgb),0.12), rgba(var(--momento-terra-rgb),0.04))`,
              border: `1px solid rgba(var(--momento-terra-rgb),0.18)`,
              color: C.terra,
            }}>
            <Sparkles size={11} />
            Découvrir tous les prestataires
          </button>
        )}
      </div>

      {/* Swipe modal */}
      {swipeCategory !== null && workspaceId && (
        <VendorSwipeModal
          workspaceId={workspaceId}
          plannerId={plannerId}
          categories={neededCategories}
          initialCategory={swipeCategory || undefined}
          onClose={() => setSwipeCategory(null)}
          onBooked={(vendorId, vendorName, category) => {
            setOptimisticBookings(prev => {
              if (prev.some(b => b.id === vendorId)) return prev;
              return [...prev, { id: vendorId, name: vendorName, category }];
            });
          }}
        />
      )}
    </>
  );
}

function PlanningWidget({ data, onToggle, workspaceId }: { data: DashboardData; onToggle: (id: string, done: boolean) => void; workspaceId?: string }) {
  const s        = computeStats(data);
  const upcoming = data.tasks.filter((t) => !t.completed).slice(0, 4);
  const done     = s.tasks.done;
  const [newTitle, setNewTitle] = useState("");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  async function handleAddTask(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");
    const tempId = `local-${Date.now()}`;
    const tempTask: Task = { id: tempId, title, category: null, dueDate: null, completed: false };
    setLocalTasks(prev => [...prev, tempTask]);
    try {
      const body: Record<string, unknown> = { title };
      if (workspaceId) body.workspaceId = workspaceId;
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch { /* optimistic only */ }
  }

  const allTasks = [...upcoming, ...localTasks.filter(lt => !upcoming.find(u => u.id === lt.id))];

  return (
    <div className="flex flex-col gap-2">
      {allTasks.length === 0 && <p className="text-xs" style={{ color: C.mist }}>Toutes les tâches sont terminées 🎉</p>}
      {allTasks.map((task) => (
        <div key={task.id}
          className="flex items-start gap-2.5 py-1.5 px-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "transparent" }}
          onClick={() => !task.id.startsWith("local-") && onToggle(task.id, true)}>
          <div className="w-4 h-4 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-all"
            style={{ borderColor: C.anthracite, backgroundColor: "transparent" }} />
          <div className="flex-1 min-w-0">
            {task.id.startsWith("local-") ? (
              <p className="text-xs font-medium" style={{ color: `${C.white}80` }}>{task.title}</p>
            ) : (
              <InlineEdit value={task.title} endpoint="/api/tasks" id={task.id} field="title" className="text-xs font-medium" style={{ color: C.white }} />
            )}
            {task.dueDate && (
              <p className="text-xs mt-0.5" style={{ color: C.mist }}>
                {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>
          {task.category && (
            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: C.anthracite, color: C.mist }}>
              {task.category}
            </span>
          )}
        </div>
      ))}
      {done > 0 && (
        <p className="text-[10px] mt-1 text-right" style={{ color: `${C.mist}50` }}>
          {done} tâche{done > 1 ? "s" : ""} complétée{done > 1 ? "s" : ""} ✓
        </p>
      )}
      <div className="mt-1 flex items-center gap-2 border-t pt-2" style={{ borderColor: `${C.anthracite}40` }}>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleAddTask}
          placeholder="+ Nouvelle tâche (Entrée)"
          className="flex-1 text-xs bg-transparent outline-none"
          style={{ color: C.mist }}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

interface ConversationPreview {
  id: string;
  vendorId?: string;
  vendorName?: string;
  lastMessage?: string;
  unread: number;
}

function MessagesWidget({ data }: { data: DashboardData }) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/messages")
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json && Array.isArray(json.conversations)) {
          setConversations(json.conversations);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (conversations.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {conversations.slice(0, 4).map(conv => (
          <div key={conv.id} className="flex items-center gap-2 py-1.5 px-2 rounded-xl" style={{ backgroundColor: `${C.anthracite}30` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
              {(conv.vendorName ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: C.white }}>{conv.vendorName ?? "Prestataire"}</p>
              {conv.lastMessage && <p className="text-[10px] truncate" style={{ color: C.mist }}>{conv.lastMessage}</p>}
            </div>
            {conv.unread > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ backgroundColor: `${C.terra}30`, color: C.terra }}>{conv.unread}</span>
            )}
            <Link
              href={conv.vendorId ? `/messages?vendor=${conv.vendorId}` : "/messages"}
              onClick={e => e.stopPropagation()}
              className="text-[10px] px-2 py-0.5 rounded-lg transition-all hover:opacity-70 flex-shrink-0"
              style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
            >
              Répondre →
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: data.unreadCount > 0 ? `${C.terra}20` : C.anthracite }}>
          {data.unreadCount > 0
            ? <span style={{ color: C.terra }}>{data.unreadCount}</span>
            : <span style={{ color: C.mist }}>0</span>}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: C.white }}>
            {!loaded ? "Chargement…" : data.unreadCount > 0
              ? `${data.unreadCount} message${data.unreadCount > 1 ? "s" : ""} non lu${data.unreadCount > 1 ? "s" : ""}`
              : "Aucun message pour cet événement"}
          </p>
          {data.unreadCount > 0 && (
            <Link href="/messages" className="text-xs hover:opacity-70" style={{ color: C.terra }} onClick={e => e.stopPropagation()}>
              Répondre →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InvitesWidget({ data, onRSVP }: { data: DashboardData; onRSVP: (id: string, rsvp: string) => void }) {
  const s         = computeStats(data);
  const confirmed = s.guests.confirmed;
  const declined  = s.guests.declined;
  const pending   = s.guests.pending;
  const total     = s.guests.registered;
  const [showList, setShowList] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold" style={{ color: C.white }}>{total}</p>
        <p className="text-xs pb-1" style={{ color: C.mist }}>invités · {confirmed} confirmés</p>
        <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full" style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
          {s.guests.pct}%
        </span>
      </div>
      {total > 0 ? (
        <>
          <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: C.anthracite }}>
            <div className="h-full transition-all" style={{ width: `${(confirmed / s.guests.expected) * 100}%`, backgroundColor: "#4ade80" }} />
            <div className="h-full transition-all" style={{ width: `${(declined / s.guests.expected) * 100}%`, backgroundColor: C.terra }} />
          </div>
          <div className="flex gap-3 text-xs" style={{ color: C.mist }}>
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />{confirmed} oui</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: C.terra }} />{declined} non</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: C.anthracite }} />{pending} en attente</span>
          </div>

          {/* Toggle liste invités */}
          <button
            onClick={() => setShowList(v => !v)}
            className="text-[10px] font-semibold text-left transition-opacity hover:opacity-70"
            style={{ color: C.terra }}
          >
            {showList ? "▲ Masquer" : `▼ Gérer les RSVP (${pending} en attente)`}
          </button>

          {showList && (
            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {data.guests.map(g => (
                <div key={g.id} className="flex items-center gap-2 py-1 px-2 rounded-xl" style={{ backgroundColor: `${C.anthracite}30` }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                    {(g.name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <InlineEdit value={g.name ?? `Invité ${g.id.slice(0,4)}`} endpoint="/api/guests" id={g.id} field="name" className="text-xs flex-1" style={{ color: C.white }} />
                  <div className="flex gap-1">
                    {(["yes", "pending", "no"] as const).map(status => (
                      <button key={status}
                        onClick={() => onRSVP(g.id, status)}
                        className="text-[9px] px-1.5 py-0.5 rounded-md transition-all font-semibold"
                        style={{
                          backgroundColor: g.rsvp === status
                            ? status === "yes" ? "#2a8a4a" : status === "no" ? C.terra : C.anthracite
                            : `${C.anthracite}60`,
                          color: g.rsvp === status ? "#fff" : `${C.mist}60`,
                        }}>
                        {status === "yes" ? "✓" : status === "no" ? "✗" : "?"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs" style={{ color: C.mist }}>Aucun invité ajouté</p>
      )}
    </div>
  );
}

function MeteoWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-2">
      <span className="text-3xl">🌤</span>
      <p className="text-sm font-medium" style={{ color: C.white }}>Météo de l&apos;événement</p>
      <p className="text-xs text-center" style={{ color: C.mist }}>Disponible 14 jours avant l&apos;événement</p>
      <span className="text-xs px-2 py-1 rounded-full mt-1" style={{ backgroundColor: C.anthracite, color: C.mist }}>À venir</span>
    </div>
  );
}

function PrestatairesRechercheWidget({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/vendors?category=${encodeURIComponent(cat)}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: "rgba(var(--momento-terra-rgb),0.12)",
              border: "1px solid rgba(var(--momento-terra-rgb),0.3)",
              color: "var(--momento-terra)",
            }}
          >
            {CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
            {cat}
          </Link>
        ))}
      </div>
      <Link href="/event/new/categories"
        className="text-xs transition hover:opacity-70 self-start"
        style={{ color: C.mist }}
        onClick={e => e.stopPropagation()}>
        + Modifier mes recherches
      </Link>
    </div>
  );
}

// ─── Finance widgets ──────────────────────────────────────────────────────────

function DepensesRecentesWidget({ data, budgetHref }: { data: DashboardData; budgetHref?: string }) {
  const items = data.budgetItems
    .filter(b => (b.actual ?? 0) > 0)
    .sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0))
    .slice(0, 5);

  const [newLabel, setNewLabel]   = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [localItems, setLocalItems] = useState<BudgetItem[]>([]);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    const amount = parseFloat(newAmount) || 0;
    const tempItem: BudgetItem = {
      id: `local-${Date.now()}`,
      category: "Autre",
      label: newLabel.trim(),
      estimated: amount,
      actual: amount,
    };
    setLocalItems(prev => [...prev, tempItem]);
    setNewLabel("");
    setNewAmount("");
    try {
      await fetch("/api/budget-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: tempItem.label, category: "Autre", estimated: amount, actual: amount }),
      });
    } catch { /* optimistic only */ }
  }

  const allItems = [...items, ...localItems];
  const max = allItems.length > 0 ? Math.max(...allItems.map(b => b.actual ?? b.estimated)) : 1;

  return (
    <div className="flex flex-col gap-2.5">
      {allItems.length === 0 && <p className="text-xs py-2" style={{ color: C.mist }}>Aucune dépense enregistrée</p>}
      {allItems.map(b => (
        <div key={b.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            {b.id.startsWith("local-") ? (
              <span className="text-xs truncate flex-1" style={{ color: `${C.mist}80` }}>{b.label}</span>
            ) : (
              <InlineEdit value={b.label} endpoint="/api/budget-items" id={b.id} field="label"
                className="text-xs truncate flex-1" style={{ color: C.mist }} />
            )}
            <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: C.terra }}>
              {(b.actual ?? b.estimated).toLocaleString("fr-FR")} MAD
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${((b.actual ?? b.estimated) / max) * 100}%`, backgroundColor: `${C.terra}90` }} />
          </div>
        </div>
      ))}
      <div className="flex gap-1.5 mt-1 border-t pt-2" style={{ borderColor: `${C.anthracite}40` }}
        onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Label dépense"
          className="flex-1 text-xs bg-transparent outline-none"
          style={{ color: C.mist }}
        />
        <input
          type="number"
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          placeholder="MAD"
          className="w-16 text-xs bg-transparent outline-none text-right"
          style={{ color: C.mist }}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="text-xs px-2 py-0.5 rounded-lg transition-all hover:opacity-70"
          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
        >+</button>
      </div>
      <Link
        href={budgetHref ?? "/budget"}
        onClick={e => e.stopPropagation()}
        className="text-[10px] mt-0.5 self-end hover:opacity-70 transition-opacity"
        style={{ color: C.terra }}
      >
        Voir le budget →
      </Link>
    </div>
  );
}

function ObjectifEpargneWidget({ data }: { data: DashboardData }) {
  const s         = computeStats(data);
  const spent     = s.budget.spent;
  // remaining basé sur committed (actual ?? estimated) pour rester cohérent avec pct
  const remaining = Math.max(0, s.budget.expected - s.budget.committed);
  const pct       = s.budget.pct;
  const days = data.eventDate
    ? Math.max(0, Math.ceil((new Date(data.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xl font-bold" style={{ color: C.terra }}>{remaining.toLocaleString("fr-FR")} MAD</p>
          <p className="text-xs" style={{ color: C.mist }}>non engagé sur {s.budget.expected.toLocaleString("fr-FR")} MAD</p>
        </div>
        {days !== null && (
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: C.white }}>J-{days}</p>
            <p className="text-[10px]" style={{ color: `${C.mist}60` }}>avant l'événement</p>
          </div>
        )}
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct > 90 ? C.terra : `${C.terra}70` }} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: pct > 90 ? C.terra : C.mist }}>{pct}% engagé</span>
        <span className="text-xs" style={{ color: `${C.mist}60` }}>{100 - pct}% libre</span>
      </div>
    </div>
  );
}

function RepartitionBudgetWidget({ data }: { data: DashboardData }) {
  const byCategory: Record<string, number> = {};
  data.budgetItems.forEach(b => {
    byCategory[b.category] = (byCategory[b.category] ?? 0) + (b.actual ?? b.estimated);
  });
  const cats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = cats.reduce((s, [, v]) => s + v, 0);

  const cx = 50, cy = 50, outer = 42, inner = 28, size = 100;
  let angle = 0;
  const paths = cats.map(([label, value], i) => {
    const sweep = total > 0 ? (value / total) * 360 : 0;
    const path = donutPath(cx, cy, outer, inner, angle, angle + Math.max(sweep - 1, 0));
    angle += sweep;
    return { label, value, color: BUDGET_COLORS[i % BUDGET_COLORS.length], path };
  });

  if (cats.length === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucune dépense enregistrée</p>;

  return (
    <div className="flex flex-col gap-3">
      {/* Donut chart en haut, centré */}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.9} />)}
          {total === 0 && <circle cx={cx} cy={cy} r={outer} fill="none" stroke={C.anthracite} strokeWidth={outer - inner} />}
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill={C.terra}>
            {Math.round(total / 1000)}k
          </text>
        </svg>
      </div>
      {/* Liste par catégorie en dessous — format L (pleine largeur) */}
      <div className="flex flex-col gap-2">
        {paths.map(p => (
          <div key={p.label} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs" style={{ color: C.mist }}>{p.label}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: p.color }}>
                {p.value.toLocaleString("fr-FR")} MAD
              </span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.round((p.value / total) * 100)}%`, backgroundColor: p.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Logistique widgets ───────────────────────────────────────────────────────

function ChecklistJXWidget({ data, workspaceId }: { data: DashboardData; workspaceId?: string }) {
  const now = Date.now();
  const month = 30 * 24 * 60 * 60 * 1000;
  const upcoming = data.tasks
    .filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() - now < month)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6);

  const [localItems, setLocalItems] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  async function handleAddItem(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");
    const tempTask: Task = { id: `local-${Date.now()}`, title, category: null, dueDate: null, completed: false };
    setLocalItems(prev => [...prev, tempTask]);
    try {
      const body: Record<string, unknown> = { title };
      if (workspaceId) body.workspaceId = workspaceId;
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch { /* optimistic only */ }
  }

  const allItems = [...upcoming, ...localItems];

  return (
    <div className="flex flex-col gap-1.5">
      {allItems.length === 0 && (
        <div className="flex flex-col items-center py-3 gap-2">
          <span className="text-2xl">🎉</span>
          <p className="text-xs text-center" style={{ color: C.mist }}>Aucune tâche dans les 30 prochains jours</p>
        </div>
      )}
      {allItems.map(t => {
        const daysLeft = t.dueDate
          ? Math.ceil((new Date(t.dueDate).getTime() - now) / (1000 * 60 * 60 * 24))
          : null;
        const color = daysLeft !== null ? (daysLeft <= 3 ? C.terra : daysLeft <= 7 ? "#e0b84a" : C.mist) : C.mist;
        return (
          <div key={t.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
            style={{ backgroundColor: `${C.anthracite}30` }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {t.id.startsWith("local-") ? (
              <p className="text-xs flex-1" style={{ color: `${C.mist}80` }}>{t.title}</p>
            ) : (
              <InlineEdit value={t.title} endpoint="/api/tasks" id={t.id} field="title" className="text-xs flex-1" style={{ color: C.mist }} />
            )}
            {daysLeft !== null && (
              <span className="text-[10px] font-bold flex-shrink-0" style={{ color }}>
                {daysLeft <= 0 ? "Auj." : `J-${daysLeft}`}
              </span>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 mt-1 border-t pt-2" style={{ borderColor: `${C.anthracite}40` }}
        onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleAddItem}
          placeholder="+ Ajouter un item (Entrée)"
          className="flex-1 text-xs bg-transparent outline-none"
          style={{ color: C.mist }}
        />
      </div>
    </div>
  );
}

function TimelineWidget({ data, plannerHref }: { data: DashboardData; plannerHref?: string }) {
  const meetingCategories = ["Traiteur", "Photo", "Photographe", "Vidéaste", "DJ", "Orchestre", "Lieu", "Fleurs", "Décorateur"];
  const sorted = [...data.tasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 7);

  if (sorted.length === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucune tâche planifiée</p>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col relative pl-5">
        <div className="absolute left-[9px] top-3 bottom-3 w-px" style={{ backgroundColor: C.anthracite }} />
        {sorted.map(t => {
          const past = t.dueDate && new Date(t.dueDate).getTime() < Date.now();
          const dotColor = t.completed ? "#4ade80" : past ? C.terra : C.anthracite;
          const isMeeting = t.category && meetingCategories.some(mc => t.category!.includes(mc));
          return (
            <div key={t.id} className="flex items-start gap-3 pb-3 relative">
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 border-2 z-10"
                style={{ backgroundColor: t.completed ? "#4ade80" : past ? C.terra : C.dark, borderColor: dotColor, marginLeft: "-18px" }} />
              <div className="flex-1 min-w-0 ml-2">
                <InlineEdit value={t.title} endpoint="/api/tasks" id={t.id} field="title"
                  className="text-xs font-medium leading-tight"
                  style={{ color: t.completed ? `${C.mist}70` : C.white, textDecoration: t.completed ? "line-through" : "none" }} />
                <div className="flex items-center gap-1.5 mt-0.5">
                  {t.dueDate && (
                    <p className="text-[10px]" style={{ color: `${C.mist}50` }}>
                      {new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  )}
                  {isMeeting && (
                    <span className="text-[9px] px-1 py-0.5 rounded-sm" style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                      RDV
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        href={plannerHref ?? "/planner"}
        onClick={e => e.stopPropagation()}
        className="text-[10px] self-end mt-1 hover:opacity-70 transition-opacity"
        style={{ color: C.terra }}
      >
        Voir le planning →
      </Link>
    </div>
  );
}

function PlanTableWidget({ data }: { data: DashboardData }) {
  const [showPopup, setShowPopup]       = useState(false);
  const [tableNum, setTableNum]         = useState("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [localTables, setLocalTables]   = useState<Record<number, Guest[]>>({});

  const byTable: Record<number, Guest[]> = {};
  const noTable: Guest[] = [];
  data.guests.forEach(g => {
    const tNum = g.tableNumber;
    if (tNum) {
      if (!byTable[tNum]) byTable[tNum] = [];
      byTable[tNum].push(g);
    } else {
      noTable.push(g);
    }
  });

  const mergedTables = { ...byTable };
  Object.entries(localTables).forEach(([n, gs]) => {
    const num = Number(n);
    if (!mergedTables[num]) mergedTables[num] = [];
    gs.forEach(g => { if (!mergedTables[num].find(x => x.id === g.id)) mergedTables[num].push(g); });
  });

  const tables = Object.entries(mergedTables).sort((a, b) => Number(a[0]) - Number(b[0]));
  const unassigned = noTable.filter(g => !Object.values(localTables).flat().find(x => x.id === g.id));

  async function handleCreate() {
    const num = parseInt(tableNum);
    if (!num || selectedGuests.length === 0) return;
    const newGuests = data.guests.filter(g => selectedGuests.includes(g.id));
    setLocalTables(prev => ({ ...prev, [num]: [...(prev[num] ?? []), ...newGuests] }));
    setShowPopup(false);
    setTableNum("");
    setSelectedGuests([]);
    for (const gId of selectedGuests) {
      try {
        await fetch(`/api/guests/${gId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableNumber: num }),
        });
      } catch { /* optimistic only */ }
    }
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {tables.length === 0 && (
        <div className="flex flex-col items-center py-3 gap-2">
          <span className="text-2xl">🪑</span>
          <p className="text-xs text-center" style={{ color: C.mist }}>Plan de table non configuré</p>
          {noTable.length > 0 && <p className="text-xs" style={{ color: `${C.mist}50` }}>{noTable.length} invités sans table</p>}
        </div>
      )}
      {tables.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tables.slice(0, 9).map(([tableNum, guests]) => (
            <div key={tableNum} className="rounded-xl px-2.5 py-2 flex flex-col items-center min-w-[52px]"
              style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}` }}>
              <span className="text-[9px] font-semibold" style={{ color: C.terra }}>T{tableNum}</span>
              <span className="text-base font-bold mt-0.5" style={{ color: C.white }}>{guests.length}</span>
            </div>
          ))}
          {/* Bouton + */}
          <button
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowPopup(v => !v); }}
            className="rounded-xl px-2.5 py-2 flex flex-col items-center min-w-[52px] transition-all hover:opacity-70"
            style={{ backgroundColor: `${C.terra}15`, border: `1px dashed ${C.terra}40` }}
          >
            <span className="text-xl font-bold" style={{ color: C.terra }}>+</span>
          </button>
        </div>
      )}
      {tables.length === 0 && (
        <button
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowPopup(v => !v); }}
          className="self-center w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all hover:opacity-70"
          style={{ backgroundColor: `${C.terra}15`, border: `1px dashed ${C.terra}40`, color: C.terra }}
        >+</button>
      )}
      {unassigned.length > 0 && (
        <p className="text-xs" style={{ color: `${C.mist}50` }}>{unassigned.length} sans table assignée</p>
      )}

      {/* Mini-popup */}
      {showPopup && (
        <div
          className="absolute top-0 left-0 right-0 z-20 rounded-xl p-3 flex flex-col gap-2"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: C.white }}>Nouvelle table</p>
            <button onClick={() => setShowPopup(false)} className="text-xs" style={{ color: C.mist }}>✕</button>
          </div>
          <input
            type="number"
            value={tableNum}
            onChange={e => setTableNum(e.target.value)}
            placeholder="Numéro de table"
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none"
            style={{ backgroundColor: `${C.anthracite}60`, color: C.white, border: `1px solid ${C.anthracite}` }}
          />
          {noTable.length > 0 && (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              <p className="text-[10px]" style={{ color: `${C.mist}50` }}>Invités sans table :</p>
              {noTable.slice(0, 8).map(g => (
                <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGuests.includes(g.id)}
                    onChange={e => setSelectedGuests(prev => e.target.checked ? [...prev, g.id] : prev.filter(x => x !== g.id))}
                    className="rounded"
                  />
                  <span className="text-xs" style={{ color: C.mist }}>{g.name ?? `Invité ${g.id.slice(0,4)}`}</span>
                </label>
              ))}
            </div>
          )}
          <button
            onClick={handleCreate}
            className="text-xs py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >Créer</button>
        </div>
      )}
    </div>
  );
}

// ─── Invités widgets ──────────────────────────────────────────────────────────

function RSVPLiveWidget({ data }: { data: DashboardData }) {
  const s = computeStats(data);
  const [showPopup, setShowPopup] = useState(false);
  const [fairepartsInput, setFairepartsInput] = useState("");
  const [fairepartsTotal, setFairepartsTotal] = useState(() => {
    try { return parseInt(localStorage.getItem("rsvp_fairparts_sent") ?? "0") || 0; } catch { return 0; }
  });
  const [rsvpToggles, setRsvpToggles] = useState<Record<string, boolean>>({});

  function handleSaveFairparts() {
    const n = parseInt(fairepartsInput) || 0;
    const newTotal = fairepartsTotal + n;
    setFairepartsTotal(newTotal);
    setFairepartsInput("");
    try { localStorage.setItem("rsvp_fairparts_sent", String(newTotal)); } catch { /* ignore */ }
  }

  if (s.guests.registered === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucun invité ajouté</p>;

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Oui ✅",    count: s.guests.confirmed, color: "#4ade80",    bg: "#4ade8015" },
          { label: "Non ❌",    count: s.guests.declined,  color: C.terra,      bg: `${C.terra}15` },
          { label: "Attente ⏳", count: s.guests.pending,   color: C.mist,       bg: `${C.anthracite}60` },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="rounded-xl py-2 px-1 flex flex-col items-center" style={{ backgroundColor: bg }}>
            <span className="text-xl font-bold" style={{ color }}>{count}</span>
            <span className="text-[9px] text-center" style={{ color: `${C.mist}80` }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: C.anthracite }}>
        <div className="h-full" style={{ width: `${(s.guests.confirmed / s.guests.expected) * 100}%`, backgroundColor: "#4ade80" }} />
        <div className="h-full" style={{ width: `${(s.guests.declined / s.guests.expected) * 100}%`, backgroundColor: C.terra }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: `${C.mist}60` }}>
          {s.guests.pct}% confirmés · {s.guests.confirmed}/{s.guests.expected} attendus
        </p>
        <button
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowPopup(v => !v); }}
          className="text-xs px-2 py-0.5 rounded-lg transition-all hover:opacity-70"
          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
        >+</button>
      </div>

      {showPopup && (
        <div
          className="absolute bottom-8 right-0 z-20 rounded-xl p-3 w-64 flex flex-col gap-2"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: C.white }}>Faire-parts envoyés</p>
            <button onClick={() => setShowPopup(false)} className="text-xs" style={{ color: C.mist }}>✕</button>
          </div>
          <p className="text-[10px]" style={{ color: `${C.mist}60` }}>Total actuel : {fairepartsTotal}</p>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={fairepartsInput}
              onChange={e => setFairepartsInput(e.target.value)}
              placeholder="Nombre envoyés aujourd'hui"
              className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: `${C.anthracite}60`, color: C.white, border: `1px solid ${C.anthracite}` }}
            />
            <button
              onClick={handleSaveFairparts}
              className="text-xs px-2 rounded-lg font-semibold"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >+</button>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            <p className="text-[10px]" style={{ color: `${C.mist}50` }}>Réponses reçues :</p>
            {data.guests.slice(0, 8).map(g => (
              <div key={g.id} className="flex items-center gap-2">
                <button
                  onClick={() => setRsvpToggles(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                  className="w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: rsvpToggles[g.id] ? "#4ade80" : "transparent",
                    borderColor: rsvpToggles[g.id] ? "#4ade80" : C.anthracite,
                  }}
                >
                  {rsvpToggles[g.id] && <span className="text-[8px] text-dark">✓</span>}
                </button>
                <span className="text-xs truncate" style={{ color: C.mist }}>{g.name ?? `Invité ${g.id.slice(0,4)}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DIET_OPTIONS = [
  { key: "Standard",      icon: "🍽️", color: C.mist },
  { key: "Végétarien",    icon: "🥗", color: "#5ac87a" },
  { key: "Halal",         icon: "🕌", color: "#4a9eda" },
  { key: "Allergie",      icon: "⚠️", color: "#e0b84a" },
  { key: "Sans gluten",   icon: "🌾", color: "#da844a" },
  { key: "Vegan",         icon: "🌱", color: "#5ac87a" },
];

function RegimesWidget({ data }: { data: DashboardData }) {
  const s         = computeStats(data);
  const confirmed = data.guests.filter(g => g.rsvp === "CONFIRMED" || g.rsvp === "yes");
  const [showPopup, setShowPopup]   = useState(false);
  const [guestRegimes, setGuestRegimes] = useState<Record<string, string>>(() => {
    try {
      const saved: Record<string, string> = {};
      data.guests.forEach(g => {
        const r = localStorage.getItem(`regime_${g.id}`);
        if (r) saved[g.id] = r;
      });
      return saved;
    } catch { return {}; }
  });

  function handleSetRegime(guestId: string, diet: string) {
    setGuestRegimes(prev => {
      const next = { ...prev, [guestId]: diet };
      try { localStorage.setItem(`regime_${guestId}`, diet); } catch { /* ignore */ }
      return next;
    });
  }

  const dietCounts: Record<string, number> = {};
  Object.values(guestRegimes).forEach(d => { dietCounts[d] = (dietCounts[d] ?? 0) + 1; });
  const totalAssigned = Object.values(dietCounts).reduce((s, v) => s + v, 0);

  return (
    <div className="flex flex-col gap-2.5 relative">
      {DIET_OPTIONS.filter(d => (dietCounts[d.key] ?? 0) > 0).map(d => (
        <div key={d.key} className="flex items-center gap-2.5">
          <span className="text-base flex-shrink-0">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: C.mist }}>{d.key}</span>
              <span className="text-xs font-semibold" style={{ color: d.color }}>{dietCounts[d.key]}</span>
            </div>
            {totalAssigned > 0 && (
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
                <div className="h-full rounded-full" style={{ width: `${((dietCounts[d.key] ?? 0) / totalAssigned) * 100}%`, backgroundColor: d.color }} />
              </div>
            )}
          </div>
        </div>
      ))}
      {totalAssigned === 0 && (
        <div className="flex flex-col items-center py-2 gap-2">
          <span className="text-2xl">🍽️</span>
          <p className="text-xs text-center" style={{ color: C.mist }}>Aucun régime assigné</p>
        </div>
      )}
      <button
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowPopup(v => !v); }}
        className="self-start text-xs px-2 py-0.5 rounded-lg mt-1 transition-all hover:opacity-70"
        style={{ backgroundColor: `${C.terra}15`, color: C.terra, border: `1px dashed ${C.terra}40` }}
      >+ Assigner régimes</button>

      {showPopup && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 rounded-xl p-3 flex flex-col gap-2"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: C.white }}>Régimes alimentaires</p>
            <button onClick={() => setShowPopup(false)} className="text-xs" style={{ color: C.mist }}>✕</button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {confirmed.slice(0, 10).map(g => (
              <div key={g.id} className="flex items-center gap-2">
                <span className="text-xs flex-1 truncate" style={{ color: C.mist }}>{g.name ?? `Invité ${g.id.slice(0,4)}`}</span>
                <div className="flex gap-1">
                  {DIET_OPTIONS.map(d => (
                    <button
                      key={d.key}
                      onClick={() => handleSetRegime(g.id, d.key)}
                      title={d.key}
                      className="w-5 h-5 text-xs rounded flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: guestRegimes[g.id] === d.key ? `${d.color}30` : `${C.anthracite}40`,
                        border: guestRegimes[g.id] === d.key ? `1px solid ${d.color}` : `1px solid transparent`,
                      }}
                    >{d.icon}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {s.guests.confirmed > 0 && <p className="text-[9px]" style={{ color: `${C.mist}40` }}>{s.guests.confirmed} invités confirmés</p>}
    </div>
  );
}

// ─── Prestataires widgets ─────────────────────────────────────────────────────

function ContratsWidget({ data }: { data: DashboardData }) {
  const s       = computeStats(data);
  const pending = data.bookings.filter(b => b.status !== "confirmed" && b.status !== "cancelled");
  const [localContrats, setLocalContrats] = useState<string[]>([]);
  const [newNom, setNewNom] = useState("");

  function handleAddContrat() {
    if (!newNom.trim()) return;
    setLocalContrats(prev => [...prev, newNom.trim()]);
    setNewNom("");
  }

  const allPending = [...pending.slice(0, 4)];

  return (
    <div className="flex flex-col gap-2">
      {s.bookings.pending > 0 && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
          {s.bookings.pending} en attente
        </span>
      )}
      {s.bookings.pending === 0 && localContrats.length === 0 && (
        <div className="flex items-center gap-2 py-1">
          <span className="text-sm">✅</span>
          <p className="text-xs" style={{ color: C.mist }}>Tous les contrats sont confirmés</p>
        </div>
      )}
      {allPending.map(b => (
        <div key={b.id} className="flex items-center gap-2 py-1.5 px-2 rounded-xl"
          style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}` }}>
          <span className="text-sm">📄</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: C.white }}>{b.vendor?.name ?? "Prestataire"}</p>
            <p className="text-[10px]" style={{ color: C.mist }}>{b.vendor?.category ?? ""}</p>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${C.terra}15`, color: C.terra }}>À signer</span>
        </div>
      ))}
      {localContrats.map((nom, i) => (
        <div key={`local-${i}`} className="flex items-center gap-2 py-1.5 px-2 rounded-xl"
          style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}` }}>
          <span className="text-sm">📄</span>
          <p className="text-xs font-medium truncate flex-1" style={{ color: C.white }}>{nom}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${C.terra}15`, color: C.terra }}>À signer</span>
        </div>
      ))}
      <div className="flex gap-1.5 mt-1 border-t pt-2" style={{ borderColor: `${C.anthracite}40` }}
        onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={newNom}
          onChange={e => setNewNom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddContrat()}
          placeholder="Nom prestataire"
          className="flex-1 text-xs bg-transparent outline-none"
          style={{ color: C.mist }}
        />
        <button
          onClick={handleAddContrat}
          className="text-xs px-2 py-0.5 rounded-lg transition-all hover:opacity-70"
          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
        >Ajouter</button>
      </div>
    </div>
  );
}

// ─── Inspiration widgets ──────────────────────────────────────────────────────

const MOODBOARD_KEY = "moodboard_images";

function MoodboardWidget() {
  const [images, setImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MOODBOARD_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clickedSlot, setClickedSlot] = useState<number | null>(null);

  function handleSlotClick(i: number) {
    if (images[i]) return; // already has image
    setClickedSlot(i);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || clickedSlot === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImages(prev => {
        const next = [...prev];
        next[clickedSlot] = base64;
        try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setClickedSlot(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleSlotClick(i); }}
            className="aspect-square rounded-lg flex items-center justify-center transition-all hover:opacity-80 cursor-pointer overflow-hidden relative"
            style={{ backgroundColor: `${C.anthracite}40`, border: images[i] ? "none" : `1px dashed ${C.anthracite}` }}
          >
            {images[i] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]} alt="" className="w-full h-full object-cover" />
                <button
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={e => {
                    e.stopPropagation();
                    setImages(prev => {
                      const next = [...prev];
                      delete next[i];
                      try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)); } catch { /* ignore */ }
                      return next;
                    });
                  }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}
                >✕</button>
              </>
            ) : (
              <span className="text-xl opacity-20">+</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CountdownWidget({ data }: { data: DashboardData }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data.eventDate) return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-xs py-2 text-center" style={{ color: C.mist }}>Aucune date d&apos;événement définie</p>
    </div>
  );

  const diff = new Date(data.eventDate).getTime() - now;
  if (diff <= 0) return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-center text-xl py-2" style={{ color: C.terra }}>C&apos;est aujourd&apos;hui ! 🎉</p>
    </div>
  );

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <div className="flex items-end gap-3 justify-center py-1">
        {[
          { value: days,    label: "jours" },
          { value: hours,   label: "h" },
          { value: minutes, label: "min" },
          { value: seconds, label: "sec" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-6xl font-bold tabular-nums leading-none" style={{ color: C.terra, fontFamily: "var(--font-cormorant), serif" }}>
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs mt-1" style={{ color: `${C.mist}80` }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CITATIONS = [
  { text: "L'amour ne se regarde pas l'un l'autre, il regarde ensemble dans la même direction.", author: "A. de Saint-Exupéry" },
  { text: "Un beau mariage, c'est l'union de deux bons pardonneurs.", author: "Ruth Bell Graham" },
  { text: "Le bonheur se multiplie quand il se partage.", author: "Proverbe" },
  { text: "La vie sans amour est comme un arbre sans fleurs ni fruits.", author: "Khalil Gibran" },
  { text: "Aimer, c'est trouver sa richesse en l'autre.", author: "Abbé Huvelin" },
  { text: "Que ton mariage soit le début d'une belle histoire.", author: "Momento" },
  { text: "Le plus grand bonheur de la vie, c'est d'être aimé pour ce que l'on est.", author: "Victor Hugo" },
];

function CitationWidget() {
  const citation = CITATIONS[new Date().getDay() % CITATIONS.length];
  return (
    <div className="flex flex-col gap-3 py-1">
      <span className="text-2xl text-center">✨</span>
      <blockquote className="text-sm italic text-center leading-relaxed"
        style={{ color: C.mist, fontFamily: "var(--font-cormorant), serif" }}>
        &ldquo;{citation.text}&rdquo;
      </blockquote>
      <p className="text-[10px] text-center" style={{ color: `${C.mist}50` }}>— {citation.author}</p>
    </div>
  );
}

// ─── Avancé widgets ───────────────────────────────────────────────────────────

function ProgressionWidget({ data }: { data: DashboardData }) {
  // Utilise computeStats → mêmes chiffres que tous les autres widgets
  const s       = computeStats(data);
  const overall = s.overall;
  const r = 26, circumference = 2 * Math.PI * r;

  const bars = [
    { label: "Tâches",        pct: s.tasks.pct,    icon: "📋", detail: `${s.tasks.done}/${s.tasks.total}` },
    { label: "Budget",        pct: s.budget.pct,   icon: "💰", detail: `${s.budget.spent.toLocaleString("fr-FR")} MAD` },
    { label: "Prestataires",  pct: s.bookings.pct, icon: "🤝", detail: `${s.bookings.confirmed}/${s.bookings.total}` },
    { label: "Invités",       pct: s.guests.pct,   icon: "👥", detail: `${s.guests.confirmed}/${s.guests.expected}` },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <svg width={64} height={64} viewBox="0 0 64 64" className="flex-shrink-0 -rotate-90">
          <circle cx={32} cy={32} r={r} fill="none" stroke={C.anthracite} strokeWidth={10} />
          <circle cx={32} cy={32} r={r} fill="none" stroke={C.terra} strokeWidth={10}
            strokeDasharray={`${(overall / 100) * circumference} ${circumference}`}
            strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-2xl font-bold" style={{ color: C.terra }}>{overall}%</p>
          <p className="text-xs" style={{ color: C.mist }}>
            {overall >= 80 ? "Presque prêt ! 🎉" : overall >= 50 ? "Bonne progression" : "Encore du travail"}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {bars.map(({ label, pct, icon, detail }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-4 flex-shrink-0">{icon}</span>
            <span className="text-[10px] w-16 flex-shrink-0" style={{ color: C.mist }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: C.terra }} />
            </div>
            <span className="text-[10px] flex-shrink-0 font-semibold w-6 text-right" style={{ color: C.terra }}>{pct}%</span>
            <span className="text-[9px] flex-shrink-0 w-20 text-right" style={{ color: `${C.mist}50` }}>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertesWidget({ data }: { data: DashboardData }) {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const urgent = data.tasks
    .filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() - now < week)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  if (urgent.length === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">✅</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucune urgence cette semaine</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {urgent.map(t => {
        const daysLeft = Math.ceil((new Date(t.dueDate!).getTime() - now) / (1000 * 60 * 60 * 24));
        const overdue = daysLeft < 0;
        const dueDateLabel = new Date(t.dueDate!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        return (
          <div key={t.id} className="flex items-center gap-2 p-2 rounded-xl"
            style={{ backgroundColor: overdue ? `${C.terra}15` : `${C.anthracite}40` }}>
            <span className="text-sm flex-shrink-0">{overdue ? "🔴" : daysLeft === 0 ? "🟡" : "🟠"}</span>
            <div className="flex-1 min-w-0">
              <InlineEdit value={t.title} endpoint="/api/tasks" id={t.id} field="title" className="text-xs font-medium" style={{ color: C.white }} />
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px]" style={{ color: overdue ? C.terra : `${C.mist}80` }}>
                  {overdue ? `En retard de ${Math.abs(daysLeft)}j` : daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft}j`}
                </p>
                <span className="text-[10px]" style={{ color: `${C.mist}50` }}>· Rappel : {dueDateLabel}</span>
              </div>
            </div>
          </div>
        );
      })}
      <Link
        href="/planner"
        onClick={e => e.stopPropagation()}
        className="text-[10px] self-end mt-1 hover:opacity-70 transition-opacity"
        style={{ color: C.terra }}
      >
        Voir les rappels →
      </Link>
    </div>
  );
}

function NotesLibresWidget({ storageKey = "momento_notes_libres" }: { storageKey?: string }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    try { setValue(localStorage.getItem(storageKey) ?? ""); } catch { /* ignore */ }
  }, [storageKey]);

  function handleChange(v: string) {
    setValue(v);
    try { localStorage.setItem(storageKey, v); } catch { /* ignore */ }
  }

  return (
    <textarea
      value={value}
      onChange={e => handleChange(e.target.value)}
      placeholder="Vos notes libres..."
      className="w-full h-32 resize-none p-0 text-xs outline-none"
      style={{ backgroundColor: "transparent", border: "none", color: C.mist }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    />
  );
}

// ─── Widgets manquants du brainstorm ─────────────────────────────────────────

function TransportWidget({ data }: { data: DashboardData }) {
  const s           = computeStats(data);
  const vtcBookings = data.bookings.filter(b =>
    b.vendor?.category?.toLowerCase().includes("transport") ||
    b.vendor?.category?.toLowerCase().includes("vtc")
  );
  const totalGuests = s.guests.confirmed;

  const [transportDate, setTransportDate] = useState(() => {
    try { return localStorage.getItem("transport_date") ?? ""; } catch { return ""; }
  });
  const [transportTime, setTransportTime] = useState(() => {
    try { return localStorage.getItem("transport_time") ?? ""; } catch { return ""; }
  });
  const [selectedGuests, setSelectedGuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("transport_guests");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  function saveDate(v: string) {
    setTransportDate(v);
    try { localStorage.setItem("transport_date", v); } catch { /* ignore */ }
  }
  function saveTime(v: string) {
    setTransportTime(v);
    try { localStorage.setItem("transport_time", v); } catch { /* ignore */ }
  }
  function toggleGuest(id: string) {
    setSelectedGuests(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("transport_guests", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ backgroundColor: `${C.terra}12` }}>
          <span className="text-xl font-bold" style={{ color: C.terra }}>{totalGuests}</span>
          <span className="text-[10px]" style={{ color: C.mist }}>invités confirmés</span>
        </div>
        <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ backgroundColor: `${C.anthracite}40` }}>
          <span className="text-xl font-bold" style={{ color: C.white }}>{vtcBookings.length}</span>
          <span className="text-[10px]" style={{ color: C.mist }}>navette{vtcBookings.length > 1 ? "s" : ""} réservée{vtcBookings.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Date + heure */}
      <div className="flex gap-2" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <input
          type="date"
          value={transportDate}
          onChange={e => saveDate(e.target.value)}
          className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
          style={{ backgroundColor: `${C.anthracite}40`, color: C.white, border: `1px solid ${C.anthracite}` }}
        />
        <input
          type="time"
          value={transportTime}
          onChange={e => saveTime(e.target.value)}
          className="w-20 text-xs rounded-lg px-2 py-1.5 outline-none"
          style={{ backgroundColor: `${C.anthracite}40`, color: C.white, border: `1px solid ${C.anthracite}` }}
        />
      </div>

      {/* Sélecteur invités */}
      <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setShowGuestPicker(v => !v)}
          className="text-xs px-2 py-0.5 rounded-lg mb-1 transition-all hover:opacity-70"
          style={{ backgroundColor: `${C.terra}15`, color: C.terra }}
        >
          {selectedGuests.length > 0 ? `${selectedGuests.length} invité(s) assigné(s)` : "Assigner des invités"}
        </button>
        {showGuestPicker && (
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto p-2 rounded-xl" style={{ backgroundColor: `${C.anthracite}30` }}>
            {data.guests.slice(0, 10).map(g => (
              <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGuests.includes(g.id)}
                  onChange={() => toggleGuest(g.id)}
                  className="rounded"
                />
                <span className="text-xs" style={{ color: C.mist }}>{g.name ?? `Invité ${g.id.slice(0,4)}`}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {vtcBookings.length === 0 && (
        <p className="text-xs" style={{ color: `${C.mist}60` }}>Aucun prestataire transport/VTC réservé</p>
      )}
      {vtcBookings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {vtcBookings.map(b => (
            <div key={b.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
              style={{ backgroundColor: `${C.anthracite}30` }}>
              <span className="text-base">🚌</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: C.white }}>{b.vendor?.name}</p>
                <p className="text-[10px]" style={{ color: C.mist }}>{b.vendor?.category}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                backgroundColor: b.status === "confirmed" ? "#2a8a4a20" : C.anthracite,
                color: b.status === "confirmed" ? "#4ade80" : C.mist,
              }}>{b.status === "confirmed" ? "✓" : "En attente"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ backgroundColor: `${C.anthracite}20`, border: `1px dashed ${C.anthracite}` }}>
        <span className="text-sm">🚗</span>
        <p className="text-xs" style={{ color: `${C.mist}60` }}>
          Estimé : {Math.ceil(totalGuests / 4)} véhicules pour {totalGuests} invités
        </p>
      </div>
    </div>
  );
}

function CarteGeographiqueWidget({ data }: { data: DashboardData }) {
  // Grouper par ville
  const byCityRaw: Record<string, number> = {};
  data.guests.forEach(g => {
    const city = g.city ?? "Non renseignée";
    byCityRaw[city] = (byCityRaw[city] ?? 0) + 1;
  });

  const cities = Object.entries(byCityRaw).sort((a, b) => b[1] - a[1]);
  const total = data.guests.length;

  if (total === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">🗺️</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucun invité enregistré</p>
    </div>
  );

  const maxCount = cities[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: `${C.mist}60` }}>{cities.length} ville{cities.length > 1 ? "s" : ""} · {total} invités</span>
      </div>
      {cities.slice(0, 6).map(([city, count]) => (
        <div key={city} className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">📍</span>
          <span className="text-xs w-24 truncate flex-shrink-0" style={{ color: C.mist }}>{city}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: BUDGET_COLORS[cities.findIndex(c => c[0] === city) % BUDGET_COLORS.length] }} />
          </div>
          <span className="text-xs w-5 text-right flex-shrink-0 font-semibold" style={{ color: C.white }}>{count}</span>
        </div>
      ))}
      {cities.length > 6 && (
        <p className="text-[10px] text-right" style={{ color: `${C.mist}40` }}>+{cities.length - 6} autres villes</p>
      )}
    </div>
  );
}

function EnvoiFairepartWidget({ data }: { data: DashboardData }) {
  const total = data.guests.length;
  const sent  = data.guests.filter(g => g.inviteSent).length;
  const responded = data.guests.filter(g => g.rsvp !== "pending" && g.rsvp !== "PENDING").length;
  const [extraSent, setExtraSent] = useState(() => {
    try { return parseInt(localStorage.getItem("fairpart_sent_count") ?? "0") || 0; } catch { return 0; }
  });
  const [showPopup, setShowPopup] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const totalSent = sent + extraSent;
  const pctSent = total > 0 ? Math.round((totalSent / total) * 100) : 0;
  const pctResp = total > 0 ? Math.round((responded / total) * 100) : 0;

  function handleAdd() {
    const n = parseInt(inputVal) || 0;
    const newTotal = extraSent + n;
    setExtraSent(newTotal);
    setInputVal("");
    try { localStorage.setItem("fairpart_sent_count", String(newTotal)); } catch { /* ignore */ }
  }

  function handleMarkAll() {
    const newTotal = total;
    setExtraSent(Math.max(0, newTotal - sent));
    try { localStorage.setItem("fairpart_sent_count", String(Math.max(0, newTotal - sent))); } catch { /* ignore */ }
    setShowPopup(false);
  }

  if (total === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">💌</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucun invité enregistré</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 relative">
      {[
        { label: "Faire-part envoyés", count: totalSent, pct: pctSent, color: "#4a9eda", icon: "📤" },
        { label: "Réponses reçues",    count: responded, pct: pctResp, color: "#4ade80", icon: "📬" },
      ].map(({ label, count, pct, color, icon }) => (
        <div key={label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: C.mist }}>
              <span>{icon}</span>{label}
            </span>
            <span className="text-xs font-bold" style={{ color }}>
              {count}/{total} <span style={{ color: `${C.mist}60` }}>({pct}%)</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <div className="rounded-xl px-3 py-1.5 text-xs flex-1 mr-2" style={{ backgroundColor: `${C.anthracite}30` }}>
          <span style={{ color: `${C.mist}60` }}>
            {total - totalSent > 0
              ? `${total - totalSent} faire-part restent à envoyer`
              : "Tous les faire-part ont été envoyés ✉️"}
          </span>
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowPopup(v => !v); }}
          className="text-xs px-2 py-0.5 rounded-lg transition-all hover:opacity-70 flex-shrink-0"
          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
        >+</button>
      </div>

      {showPopup && (
        <div
          className="absolute bottom-10 right-0 z-20 rounded-xl p-3 w-56 flex flex-col gap-2"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: C.white }}>Faire-parts envoyés</p>
            <button onClick={() => setShowPopup(false)} className="text-xs" style={{ color: C.mist }}>✕</button>
          </div>
          <p className="text-[10px]" style={{ color: `${C.mist}60` }}>Total actuel : {totalSent}/{total}</p>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Nombre envoyés"
              className="flex-1 text-xs rounded-lg px-2 py-1 outline-none"
              style={{ backgroundColor: `${C.anthracite}60`, color: C.white, border: `1px solid ${C.anthracite}` }}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <button onClick={handleAdd} className="text-xs px-2 rounded-lg" style={{ backgroundColor: C.terra, color: "#fff" }}>+</button>
          </div>
          <button
            onClick={handleMarkAll}
            className="text-xs py-1 rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: `${C.anthracite}60`, color: C.mist }}
          >Marquer tout comme envoyé</button>
        </div>
      )}
    </div>
  );
}

// ─── Widget Picker modal ──────────────────────────────────────────────────────

function WidgetPicker({ activeIds, onAdd, onClose }: { activeIds: string[]; onAdd: (id: string) => void; onClose: () => void }) {
  // "noteslibres" est toujours disponible (plusieurs instances possibles)
  const available = WIDGET_CATALOG.filter(w => w.id === "noteslibres" || !activeIds.some(a => a === w.id || a.startsWith(w.id + "_")));
  const categories = [...new Set(WIDGET_CATALOG.map(w => w.category))];

  function handleAdd(id: string) {
    if (id === "noteslibres") {
      // Générer un ID unique pour chaque nouvelle instance
      onAdd(activeIds.some(a => a === "noteslibres") ? `noteslibres_${Date.now()}` : "noteslibres");
    } else {
      onAdd(id);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-t-2xl p-6 max-h-[75vh] overflow-y-auto"
        style={{ backgroundColor: C.dark, borderTop: `1px solid ${C.anthracite}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold" style={{ color: C.white }}>Ajouter un widget</h2>
            <p className="text-xs mt-0.5" style={{ color: C.mist }}>
              {available.length > 0 ? `${available.length} widget${available.length > 1 ? "s" : ""} disponible${available.length > 1 ? "s" : ""}` : "Tous les widgets sont actifs"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all hover:opacity-70" style={{ color: C.mist }}>
            <X size={18} />
          </button>
        </div>

        {available.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: C.mist }}>Tous les widgets sont déjà actifs 🎉</p>
        ) : (
          categories.map(cat => {
            const catWidgets = available.filter(w => w.category === cat);
            if (catWidgets.length === 0) return null;
            return (
              <div key={cat} className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: `${C.mist}50` }}>{cat}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {catWidgets.map(w => (
                    <button
                      key={w.id}
                      onClick={() => handleAdd(w.id)}
                      className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}` }}
                    >
                      <span className="text-xl flex-shrink-0">{w.icon}</span>
                      <span className="text-xs font-medium" style={{ color: C.white }}>{w.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardWidgets({ data, neededCategories = [], plannerId, workspaceId }: { data: DashboardData; neededCategories?: string[]; plannerId?: string | null; workspaceId?: string }) {
  const router = useRouter();
  const hasRecherche = neededCategories.length > 0;
  const defaultOrder = hasRecherche ? ["recherche", ...BASE_ORDER] : [...BASE_ORDER];

  // ── Order & drag ──
  const [order, setOrder] = useState<string[]>(defaultOrder);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // ── Sizes ──
  const [sizes, setSizes] = useState<Record<string, WidgetSize>>({});

  // ── Local data overrides (optimistic mutations) ──
  const [taskOverrides,   setTaskOverrides]   = useState<Record<string, boolean>>({});
  const [budgetOverrides, setBudgetOverrides] = useState<Record<string, number | null>>({});
  const [rsvpOverrides,   setRsvpOverrides]   = useState<Record<string, string>>({});
  const [loadingIds,      setLoadingIds]      = useState<Set<string>>(new Set());
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorMsg(null), 3500);
  }, []);

  const startLoading = useCallback((id: string) => setLoadingIds(s => new Set(s).add(id)), []);
  const stopLoading  = useCallback((id: string) => setLoadingIds(s => { const n = new Set(s); n.delete(id); return n; }), []);

  // ── Merged data (data + overrides) ──
  const mergedData: DashboardData = useMemo(() => ({
    ...data,
    tasks:       data.tasks.map(t => ({ ...t, completed: taskOverrides[t.id] ?? t.completed })),
    budgetItems: data.budgetItems.map(b => ({ ...b, actual: b.id in budgetOverrides ? budgetOverrides[b.id] : b.actual })),
    guests:      data.guests.map(g => ({ ...g, rsvp: rsvpOverrides[g.id] ?? g.rsvp })),
  }), [data, taskOverrides, budgetOverrides, rsvpOverrides]);

  // ── Persist to localStorage ──
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(STORAGE_KEY);
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder) as string[];
        if (Array.isArray(parsed)) {
          setOrder(hasRecherche && !parsed.includes("recherche") ? ["recherche", ...parsed] : parsed);
        }
      }
      const savedSizes = localStorage.getItem(SIZE_KEY);
      if (savedSizes) setSizes(JSON.parse(savedSizes));
    } catch { /* ignore */ }
  }, [hasRecherche]);

  // ── Debounced router.refresh (évite les re-renders serveur répétés) ──
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitRefresh = useCallback(() => {
    window.dispatchEvent(new Event("momento:stats-refresh"));
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { router.refresh(); }, 1500);
  }, [router]);

  // ── Drag handlers (stables via useCallback) ──
  const handleDragStart = useCallback((id: string) => { setDraggingId(id); }, []);
  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const handleDrop = useCallback((targetId: string) => {
    setDraggingId(prev => {
      if (!prev || prev === targetId) return null;
      setOrder(o => {
        const next = [...o];
        const from = next.indexOf(prev);
        const to   = next.indexOf(targetId);
        if (from === -1 || to === -1) return o;
        next.splice(from, 1);
        next.splice(to, 0, prev);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
      return null;
    });
  }, []);

  const handleAdd = useCallback((id: string) => {
    setOrder(prev => {
      const next = [...prev, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setOrder(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleResize = useCallback((id: string, size: WidgetSize) => {
    setSizes(prev => {
      const clamped = Math.max(1, Math.min(4, size)) as WidgetSize;
      const next = { ...prev, [id]: clamped };
      try { localStorage.setItem(SIZE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Mutations (optimistic + API, stables via useCallback) ──
  const toggleTask = useCallback(async (id: string, done: boolean) => {
    setTaskOverrides(prev => ({ ...prev, [id]: done }));
    startLoading(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: done }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setTaskOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
      showError("Impossible de mettre à jour la tâche.");
    } finally {
      stopLoading(id);
    }
  }, [emitRefresh, startLoading, stopLoading, showError]);

  const updateBudgetActual = useCallback(async (id: string, actual: number | null) => {
    setBudgetOverrides(prev => ({ ...prev, [id]: actual }));
    startLoading(id);
    try {
      const res = await fetch(`/api/budget-items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actual }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setBudgetOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
      showError("Impossible de mettre à jour le budget.");
    } finally {
      stopLoading(id);
    }
  }, [emitRefresh, startLoading, stopLoading, showError]);

  const updateRSVP = useCallback(async (id: string, rsvp: string) => {
    setRsvpOverrides(prev => ({ ...prev, [id]: rsvp }));
    startLoading(id);
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rsvp }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setRsvpOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
      showError("Impossible de mettre à jour le RSVP.");
    } finally {
      stopLoading(id);
    }
  }, [emitRefresh, startLoading, stopLoading, showError]);

  const dragProps = useMemo(
    () => ({ onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop }),
    [handleDragStart, handleDragOver, handleDrop]
  );

  // ── Context-aware href builder ──
  const hrefFor = useCallback((base: string) => {
    if (!plannerId) return base;
    if (base === "/vendors")  return `/vendors?id=${plannerId}`;
    if (base === "/budget")   return `/budget?event=${plannerId}`;
    if (base === "/guests")   return `/guests?id=${plannerId}`;
    if (base === "/planner")  return `/planner?id=${plannerId}`;
    return base;
  }, [plannerId]);

  type WidgetDef = { title: string; icon: string; href?: string; content: React.ReactNode };
  const widgetMap: Record<string, WidgetDef> = useMemo(() => ({
    recherche:    { title: "Prestataires recherchés", icon: "🔍", href: hrefFor("/vendors"),  content: <PrestatairesRechercheWidget categories={neededCategories} /> },
    budget:       { title: "Budget",                  icon: "💰", href: hrefFor("/budget"),   content: <BudgetWidget data={mergedData} onEditActual={updateBudgetActual} /> },
    prestataires: { title: "Prestataires",            icon: "🤝", href: hrefFor("/vendors"),  content: <PrestatairesWidget data={mergedData} neededCategories={neededCategories} workspaceId={workspaceId} plannerId={plannerId} /> },
    planning:     { title: "Planning",                icon: "📋", href: hrefFor("/planner"),  content: <PlanningWidget data={mergedData} onToggle={toggleTask} workspaceId={workspaceId} /> },
    messages:     { title: "Messages",                icon: "💬", href: "/messages",          content: <MessagesWidget data={mergedData} /> },
    invites:      { title: "Invités",                 icon: "👥", href: hrefFor("/guests"),   content: <InvitesWidget data={mergedData} onRSVP={updateRSVP} /> },
    meteo:        { title: "Météo",                   icon: "☀️",                             content: <MeteoWidget /> },
    depenses:     { title: "Dépenses récentes",       icon: "📊", href: hrefFor("/budget"),   content: <DepensesRecentesWidget data={mergedData} budgetHref={hrefFor("/budget")} /> },
    epargne:      { title: "Objectif budget",         icon: "🎯", href: hrefFor("/budget"),   content: <ObjectifEpargneWidget data={mergedData} /> },
    repartition:  { title: "Répartition budget",      icon: "🥧", href: hrefFor("/budget"),   content: <RepartitionBudgetWidget data={mergedData} /> },
    checklistjx:  { title: "Checklist J-X",           icon: "📆", href: hrefFor("/planner"),  content: <ChecklistJXWidget data={mergedData} workspaceId={workspaceId} /> },
    timeline:     { title: "Timeline",                icon: "🗓️", href: hrefFor("/planner"),  content: <TimelineWidget data={mergedData} plannerHref={hrefFor("/planner")} /> },
    plantable:    { title: "Plan de table",           icon: "🪑", href: hrefFor("/guests"),   content: <PlanTableWidget data={mergedData} /> },
    rsvplive:     { title: "RSVP Live",               icon: "📨", href: hrefFor("/guests"),   content: <RSVPLiveWidget data={mergedData} /> },
    regimes:      { title: "Régimes alimentaires",    icon: "🍽️",                             content: <RegimesWidget data={mergedData} /> },
    contrats:     { title: "Contrats à signer",       icon: "📄", href: hrefFor("/vendors"),  content: <ContratsWidget data={mergedData} /> },
    moodboard:    { title: "Mood board",              icon: "🎨",                             content: <MoodboardWidget /> },
    countdown:    { title: "Compte à rebours",        icon: "⏱️",                             content: <CountdownWidget data={mergedData} /> },
    citation:     { title: "Citation du jour",        icon: "✨",                             content: <CitationWidget /> },
    progression:  { title: "Score de progression",   icon: "🏆",                             content: <ProgressionWidget data={mergedData} /> },
    alertes:      { title: "Rappels & alertes",       icon: "🔔", href: hrefFor("/planner"),  content: <AlertesWidget data={mergedData} /> },
    noteslibres:  { title: "Notes libres",            icon: "📝",                             content: <NotesLibresWidget storageKey="noteslibres" /> },
    transport:    { title: "Transport & navettes",    icon: "🚌", href: hrefFor("/vendors"),  content: <TransportWidget data={mergedData} /> },
    cartegeo:     { title: "Carte géographique",      icon: "🗺️", href: hrefFor("/guests"),   content: <CarteGeographiqueWidget data={mergedData} /> },
    envoi:        { title: "Envoi faire-part",        icon: "💌", href: hrefFor("/guests"),   content: <EnvoiFairepartWidget data={mergedData} /> },
  }), [mergedData, neededCategories, toggleTask, updateBudgetActual, updateRSVP, hrefFor, workspaceId]);

  // Résout un ID de widget — gère les instances dynamiques de notes (noteslibres_timestamp)
  function resolveWidget(id: string): WidgetDef | undefined {
    if (widgetMap[id]) return widgetMap[id];
    if (id.startsWith("noteslibres_")) {
      return { title: "Notes libres", icon: "📝", content: <NotesLibresWidget storageKey={id} /> };
    }
    return undefined;
  }

  const rechercheIds = order.filter(id => id === "recherche");
  // noteslibres (et instances) toujours en premier dans otherIds
  const rawOtherIds = order.filter(id => id !== "recherche");
  const notesIds = rawOtherIds.filter(id => id === "noteslibres" || id.startsWith("noteslibres_"));
  const otherIds = notesIds.length > 0
    ? [...notesIds, ...rawOtherIds.filter(id => id !== "noteslibres" && !id.startsWith("noteslibres_"))]
    : rawOtherIds;

  return (
    <>
      {/* Toast d'erreur */}
      {errorMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Indicateur de chargement global */}
      {loadingIds.size > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
          style={{ backgroundColor: C.dark, color: C.mist, border: `1px solid ${C.anthracite}` }}>
          <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.terra} transparent transparent transparent` }} />
          Enregistrement…
        </div>
      )}

      {showPicker && (
        <WidgetPicker activeIds={order} onAdd={handleAdd} onClose={() => setShowPicker(false)} />
      )}

      <div className="flex flex-col gap-6">
        {/* ── Prestataires recherchés (largeur fixe) ── */}
        {rechercheIds.length > 0 && (
          <div className="flex flex-col gap-4 max-w-[1400px] mx-auto w-full">
            {rechercheIds.map(id => {
              const w = resolveWidget(id);
              if (!w) return null;
              return (
                <WidgetCard key={id} id={id} title={w.title} icon={w.icon} href={w.href}
                  dragging={draggingId === id} size={sizes[id] ?? 3}
                  onRemove={handleRemove} onResize={handleResize} {...dragProps}>
                  {w.content}
                </WidgetCard>
              );
            })}
          </div>
        )}

        {/* ── Délimiteur ── */}
        {rechercheIds.length > 0 && otherIds.length > 0 && (
          <div className="flex items-center gap-3 max-w-[1400px] mx-auto w-full">
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2" style={{ color: `${C.mist}40` }}>
              Mon tableau de bord
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
          </div>
        )}

        {/* ── Widgets principaux ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {otherIds.map(id => {
            const w = resolveWidget(id);
            if (!w) return null;
            const size = sizes[id] ?? 1;
            return (
              <div key={id} className={colSpanClass(size)}>
                <WidgetCard id={id} title={w.title} icon={w.icon} href={w.href}
                  dragging={draggingId === id} size={size}
                  onRemove={handleRemove} onResize={handleResize} {...dragProps}>
                  {w.content}
                </WidgetCard>
              </div>
            );
          })}

          {/* Bouton ajouter */}
          <button
            className="rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90 active:scale-95 min-h-[80px]"
            style={{ backgroundColor: "transparent", border: `2px dashed ${C.anthracite}`, color: C.mist }}
            onClick={() => setShowPicker(true)}
          >
            <span style={{ color: C.terra }}>+</span>
            Ajouter un widget
          </button>
        </div>
      </div>
    </>
  );
}
