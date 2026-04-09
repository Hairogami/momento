"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, X } from "lucide-react";
import { C } from "@/lib/colors";
import BudgetChart from "@/components/BudgetChart";

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
  const guests_confirmed  = d.guests.filter(g => g.rsvp === "CONFIRMED").length;
  const guests_declined   = d.guests.filter(g => g.rsvp === "DECLINED").length;
  const guests_pending    = d.guests.filter(g => g.rsvp === "PENDING").length;
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

const BASE_ORDER  = ["budget", "prestataires", "planning", "messages", "invites", "meteo"];
const STORAGE_KEY = "momento_widget_order";
const SIZE_KEY    = "momento_widget_sizes";

type WidgetSize = 1 | 2 | 3;
function colSpanClass(size: WidgetSize) {
  if (size === 2) return "md:col-span-2";
  if (size === 3) return "md:col-span-2 xl:col-span-3 2xl:col-span-4";
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
  { id: "agenda",      title: "Agenda prestataires",  icon: "📅", category: "Prestataires" },
  { id: "contrats",    title: "Contrats à signer",    icon: "📄", category: "Prestataires" },
  { id: "notemoyenne", title: "Note moyenne",         icon: "⭐", category: "Prestataires" },
  { id: "moodboard",   title: "Mood board",           icon: "🎨", category: "Inspiration" },
  { id: "countdown",   title: "Compte à rebours",     icon: "⏱️", category: "Inspiration" },
  { id: "activite",    title: "Fil d'actualité",      icon: "📰", category: "Inspiration" },
  { id: "citation",    title: "Citation du jour",     icon: "✨", category: "Inspiration" },
  { id: "progression", title: "Score de progression", icon: "🏆", category: "Avancé" },
  { id: "alertes",     title: "Rappels & alertes",    icon: "🔔", category: "Avancé" },
  { id: "comparateur", title: "Comparateur devis",    icon: "⚖️", category: "Avancé" },
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

  const inner = (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group rounded-2xl p-4 flex flex-col gap-3 transition-all cursor-grab active:cursor-grabbing select-none relative h-full"
      style={{
        backgroundColor: C.dark,
        border: isOver ? `2px solid ${C.terra}` : `1px solid ${C.anthracite}`,
        opacity: dragging ? 0.45 : 1,
        boxShadow: isOver ? `0 0 0 2px ${C.terra}30` : undefined,
      }}
    >
      {/* Remove button */}
      {onRemove && !BASE_ORDER.includes(id) && hovered && (
        <button
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(id); }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity z-10"
          style={{ backgroundColor: C.anthracite }}
          title="Retirer le widget"
        >
          <X size={10} style={{ color: C.mist }} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <GripVertical
          size={14}
          className="flex-shrink-0 opacity-20 group-hover:opacity-50 transition-opacity cursor-grab"
          style={{ color: C.mist }}
        />
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold flex-1" style={{ color: C.white }}>{title}</span>
        {href && <span className="text-xs" style={{ color: C.mist }}>→</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Resize controls — apparaissent au hover */}
      {hovered && (
        <div
          className="flex items-center gap-1 pt-2 mt-1 border-t"
          style={{ borderColor: `${C.anthracite}60` }}
          onMouseDown={e => e.stopPropagation()}
        >
          <span className="text-[9px] flex-1 select-none" style={{ color: `${C.mist}30` }}>TAILLE</span>
          {([1, 2, 3] as const).map(s => (
            <button
              key={s}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onResize(id, s); }}
              className="text-[9px] px-2 py-0.5 rounded-md transition-all font-semibold"
              style={{
                backgroundColor: size === s ? C.terra : `${C.anthracite}80`,
                color: size === s ? "#fff" : `${C.mist}80`,
              }}
              title={s === 1 ? "Petit (1 colonne)" : s === 2 ? "Moyen (2 colonnes)" : "Large (pleine largeur)"}
            >
              {s === 1 ? "S" : s === 2 ? "M" : "L"}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href} className="block hover:opacity-95 transition-opacity h-full">{inner}</Link>;
  return inner;
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
            <span className="text-[10px] flex-1 truncate" style={{ color: C.mist }}>{item.label}</span>
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

function PrestatairesWidget({ data }: { data: DashboardData }) {
  const s = computeStats(data);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: `${C.terra}15` }}>
          <p className="text-xl font-bold" style={{ color: C.terra }}>{s.bookings.confirmed}</p>
          <p className="text-xs" style={{ color: C.mist }}>confirmés</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: C.anthracite + "50" }}>
          <p className="text-xl font-bold" style={{ color: C.white }}>{s.bookings.pending}</p>
          <p className="text-xs" style={{ color: C.mist }}>en attente</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        {data.bookings.slice(0, 4).map((b) => (
          <div key={b.id} className="flex items-center gap-2 py-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
              {b.vendor?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: C.white }}>{b.vendor?.name ?? "—"}</p>
              <p className="text-xs" style={{ color: C.mist }}>{b.vendor?.category ?? ""}</p>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: b.status === "confirmed" ? "#2a8a4a20" : C.anthracite, color: b.status === "confirmed" ? "#4ade80" : C.mist }}>
              {b.status === "confirmed" ? "Confirmé" : b.status === "cancelled" ? "Annulé" : "En attente"}
            </span>
          </div>
        ))}
        {data.bookings.length === 0 && <p className="text-xs" style={{ color: C.mist }}>Aucun prestataire ajouté</p>}
      </div>
    </div>
  );
}

function PlanningWidget({ data, onToggle }: { data: DashboardData; onToggle: (id: string, done: boolean) => void }) {
  const s        = computeStats(data);
  const upcoming = data.tasks.filter((t) => !t.completed).slice(0, 4);
  const done     = s.tasks.done;

  return (
    <div className="flex flex-col gap-2">
      {upcoming.length === 0 && <p className="text-xs" style={{ color: C.mist }}>Toutes les tâches sont terminées 🎉</p>}
      {upcoming.map((task) => (
        <div key={task.id}
          className="flex items-start gap-2.5 py-1.5 px-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "transparent" }}
          onClick={() => onToggle(task.id, true)}>
          <div className="w-4 h-4 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-all"
            style={{ borderColor: C.anthracite, backgroundColor: "transparent" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: C.white }}>{task.title}</p>
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
    </div>
  );
}

function MessagesWidget({ data }: { data: DashboardData }) {
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
            {data.unreadCount > 0 ? `${data.unreadCount} message${data.unreadCount > 1 ? "s" : ""} non lu${data.unreadCount > 1 ? "s" : ""}` : "Pas de nouveaux messages"}
          </p>
          <p className="text-xs" style={{ color: C.mist }}>{data.unreadCount > 0 ? "Cliquez pour répondre" : "Tout est à jour"}</p>
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
        <p className="text-2xl font-bold" style={{ color: C.white }}>{confirmed}</p>
        <p className="text-xs pb-1" style={{ color: C.mist }}>/ {s.guests.expected} attendus</p>
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
                  <span className="text-xs flex-1 truncate" style={{ color: C.white }}>{g.name ?? `Invité ${g.id.slice(0,4)}`}</span>
                  <div className="flex gap-1">
                    {(["CONFIRMED", "PENDING", "DECLINED"] as const).map(status => (
                      <button key={status}
                        onClick={() => onRSVP(g.id, status)}
                        className="text-[9px] px-1.5 py-0.5 rounded-md transition-all font-semibold"
                        style={{
                          backgroundColor: g.rsvp === status
                            ? status === "CONFIRMED" ? "#2a8a4a" : status === "DECLINED" ? C.terra : C.anthracite
                            : `${C.anthracite}60`,
                          color: g.rsvp === status ? "#fff" : `${C.mist}60`,
                        }}>
                        {status === "CONFIRMED" ? "✓" : status === "DECLINED" ? "✗" : "?"}
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

function DepensesRecentesWidget({ data }: { data: DashboardData }) {
  const items = data.budgetItems
    .filter(b => (b.actual ?? 0) > 0)
    .sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0))
    .slice(0, 5);

  if (items.length === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucune dépense enregistrée</p>;

  const max = Math.max(...items.map(b => b.actual ?? b.estimated));

  return (
    <div className="flex flex-col gap-2.5">
      {items.map(b => (
        <div key={b.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs truncate flex-1" style={{ color: C.mist }}>{b.label}</span>
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
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.9} />)}
        {total === 0 && <circle cx={cx} cy={cy} r={outer} fill="none" stroke={C.anthracite} strokeWidth={outer - inner} />}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill={C.terra}>
          {Math.round(total / 1000)}k
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {paths.map(p => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] truncate flex-1" style={{ color: `${C.mist}80` }}>{p.label}</span>
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: C.mist }}>
              {Math.round((p.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Logistique widgets ───────────────────────────────────────────────────────

function ChecklistJXWidget({ data }: { data: DashboardData }) {
  const now = Date.now();
  const month = 30 * 24 * 60 * 60 * 1000;
  const upcoming = data.tasks
    .filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() - now < month)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6);

  if (upcoming.length === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">🎉</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucune tâche dans les 30 prochains jours</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {upcoming.map(t => {
        const daysLeft = Math.ceil((new Date(t.dueDate!).getTime() - now) / (1000 * 60 * 60 * 24));
        const color = daysLeft <= 3 ? C.terra : daysLeft <= 7 ? "#e0b84a" : C.mist;
        return (
          <div key={t.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
            style={{ backgroundColor: `${C.anthracite}30` }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs flex-1 truncate" style={{ color: C.mist }}>{t.title}</span>
            <span className="text-[10px] font-bold flex-shrink-0" style={{ color }}>
              {daysLeft <= 0 ? "Auj." : `J-${daysLeft}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TimelineWidget({ data }: { data: DashboardData }) {
  const sorted = [...data.tasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 7);

  if (sorted.length === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucune tâche planifiée</p>;

  return (
    <div className="flex flex-col relative pl-5">
      <div className="absolute left-[9px] top-3 bottom-3 w-px" style={{ backgroundColor: C.anthracite }} />
      {sorted.map(t => {
        const past = t.dueDate && new Date(t.dueDate).getTime() < Date.now();
        const dotColor = t.completed ? "#4ade80" : past ? C.terra : C.anthracite;
        return (
          <div key={t.id} className="flex items-start gap-3 pb-3 relative">
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 border-2 z-10 -ml-5"
              style={{ backgroundColor: t.completed ? "#4ade80" : past ? C.terra : C.dark, borderColor: dotColor, marginLeft: "-18px" }} />
            <div className="flex-1 min-w-0 ml-2">
              <p className="text-xs font-medium leading-tight"
                style={{ color: t.completed ? `${C.mist}70` : C.white, textDecoration: t.completed ? "line-through" : "none" }}>
                {t.title}
              </p>
              {t.dueDate && (
                <p className="text-[10px] mt-0.5" style={{ color: `${C.mist}50` }}>
                  {new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlanTableWidget({ data }: { data: DashboardData }) {
  const byTable: Record<number, Guest[]> = {};
  const noTable: Guest[] = [];
  data.guests.forEach(g => {
    if (g.tableNumber) {
      if (!byTable[g.tableNumber]) byTable[g.tableNumber] = [];
      byTable[g.tableNumber].push(g);
    } else {
      noTable.push(g);
    }
  });

  const tables = Object.entries(byTable).sort((a, b) => Number(a[0]) - Number(b[0]));

  if (tables.length === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">🪑</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Plan de table non configuré</p>
      {noTable.length > 0 && <p className="text-xs" style={{ color: `${C.mist}50` }}>{noTable.length} invités sans table</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {tables.slice(0, 9).map(([tableNum, guests]) => (
          <div key={tableNum} className="rounded-xl px-2.5 py-2 flex flex-col items-center min-w-[52px]"
            style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}` }}>
            <span className="text-[9px] font-semibold" style={{ color: C.terra }}>T{tableNum}</span>
            <span className="text-base font-bold mt-0.5" style={{ color: C.white }}>{guests.length}</span>
          </div>
        ))}
      </div>
      {noTable.length > 0 && (
        <p className="text-xs" style={{ color: `${C.mist}50` }}>{noTable.length} sans table assignée</p>
      )}
    </div>
  );
}

// ─── Invités widgets ──────────────────────────────────────────────────────────

function RSVPLiveWidget({ data }: { data: DashboardData }) {
  const s = computeStats(data);
  if (s.guests.registered === 0) return <p className="text-xs py-2" style={{ color: C.mist }}>Aucun invité ajouté</p>;

  return (
    <div className="flex flex-col gap-3">
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
      {/* Même % que InvitesWidget et ProgressionWidget */}
      <p className="text-xs text-center" style={{ color: `${C.mist}60` }}>
        {s.guests.pct}% confirmés · {s.guests.confirmed}/{s.guests.expected} attendus
      </p>
    </div>
  );
}

function RegimesWidget({ data }: { data: DashboardData }) {
  const s         = computeStats(data);
  const confirmed = s.guests.confirmed;
  if (confirmed === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">🍽️</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Les régimes seront collectés via le formulaire d&apos;invitation</p>
    </div>
  );

  const diets = [
    { label: "Standard",    icon: "🍽️", count: Math.max(1, Math.round(confirmed * 0.70)), color: C.mist },
    { label: "Végétarien",  icon: "🥗", count: Math.max(0, Math.round(confirmed * 0.12)), color: "#5ac87a" },
    { label: "Halal",       icon: "🕌", count: Math.max(0, Math.round(confirmed * 0.10)), color: "#4a9eda" },
    { label: "Allergie",    icon: "⚠️", count: Math.max(0, Math.round(confirmed * 0.08)), color: "#e0b84a" },
  ].filter(d => d.count > 0);

  const total = diets.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col gap-2.5">
      {diets.map(d => (
        <div key={d.label} className="flex items-center gap-2.5">
          <span className="text-base flex-shrink-0">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: C.mist }}>{d.label}</span>
              <span className="text-xs font-semibold" style={{ color: d.color }}>{d.count}</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
              <div className="h-full rounded-full" style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }} />
            </div>
          </div>
        </div>
      ))}
      <p className="text-[9px] mt-1" style={{ color: `${C.mist}40` }}>Estimé · basé sur {confirmed} confirmations</p>
    </div>
  );
}

// ─── Prestataires widgets ─────────────────────────────────────────────────────

function AgendaWidget({ data }: { data: DashboardData }) {
  const upcoming = data.bookings
    .filter(b => b.eventDate && new Date(b.eventDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
    .slice(0, 4);

  if (upcoming.length === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">📅</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucun rendez-vous à venir</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {upcoming.map(b => (
        <div key={b.id} className="flex items-center gap-3 py-1.5 px-2 rounded-xl" style={{ backgroundColor: `${C.anthracite}40` }}>
          <div className="flex flex-col items-center w-10 flex-shrink-0 py-1 rounded-lg" style={{ backgroundColor: `${C.terra}15` }}>
            <span className="text-[9px] font-semibold leading-none" style={{ color: C.terra }}>
              {new Date(b.eventDate!).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
            </span>
            <span className="text-lg font-bold leading-tight" style={{ color: C.terra }}>
              {new Date(b.eventDate!).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: C.white }}>{b.vendor?.name ?? "RDV"}</p>
            <p className="text-[10px]" style={{ color: C.mist }}>{b.vendor?.category ?? ""}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContratsWidget({ data }: { data: DashboardData }) {
  const s       = computeStats(data);
  const pending = data.bookings.filter(b => b.status !== "confirmed" && b.status !== "cancelled");

  if (s.bookings.pending === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">✅</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Tous les contrats sont confirmés</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
        style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
        {s.bookings.pending} en attente
      </span>
      {pending.slice(0, 4).map(b => (
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
    </div>
  );
}

function NoteMoyenneWidget({ data }: { data: DashboardData }) {
  const withRating = data.bookings.filter(b => b.vendor?.rating != null);
  const avg = withRating.length > 0
    ? withRating.reduce((s, b) => s + b.vendor!.rating!, 0) / withRating.length
    : null;

  if (avg === null) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">⭐</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Les notes s&apos;afficheront après vos premiers avis</p>
    </div>
  );

  const stars = Math.round(avg);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold" style={{ color: C.terra, fontFamily: "var(--font-cormorant), serif" }}>
          {avg.toFixed(1)}
        </span>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} style={{ color: s <= stars ? "#e0b84a" : C.anthracite, fontSize: 16 }}>★</span>
            ))}
          </div>
          <p className="text-xs mt-0.5" style={{ color: C.mist }}>{withRating.length} avis</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {withRating.slice(0, 3).map(b => (
          <div key={b.id} className="flex items-center gap-2">
            <span className="text-xs flex-1 truncate" style={{ color: C.mist }}>{b.vendor!.name}</span>
            <span style={{ color: "#e0b84a", fontSize: 12 }}>{"★".repeat(Math.round(b.vendor!.rating!))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inspiration widgets ──────────────────────────────────────────────────────

function MoodboardWidget() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}
            className="aspect-square rounded-lg flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
            style={{ backgroundColor: `${C.anthracite}40`, border: `1px dashed ${C.anthracite}` }}>
            <span className="text-xl opacity-20">+</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center" style={{ color: `${C.mist}40` }}>Upload d&apos;images — bientôt disponible</p>
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
    <p className="text-xs py-2 text-center" style={{ color: C.mist }}>Aucune date d&apos;événement définie</p>
  );

  const diff = new Date(data.eventDate).getTime() - now;
  if (diff <= 0) return (
    <p className="text-center text-xl py-2" style={{ color: C.terra }}>C&apos;est aujourd&apos;hui ! 🎉</p>
  );

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="flex items-end gap-3 justify-center py-1">
      {[
        { value: days,    label: "jours" },
        { value: hours,   label: "h" },
        { value: minutes, label: "min" },
        { value: seconds, label: "sec" },
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color: C.terra, fontFamily: "var(--font-cormorant), serif" }}>
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[9px]" style={{ color: `${C.mist}50` }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function ActiviteWidget({ data }: { data: DashboardData }) {
  const s = computeStats(data);
  const activities: { icon: string; text: string }[] = [];

  // Utilise les listes filtrées cohérentes avec computeStats
  data.bookings.filter(b => b.status === "confirmed").slice(0, 2).forEach(b => {
    activities.push({ icon: "✅", text: `${b.vendor?.name ?? "Prestataire"} confirmé (${s.bookings.confirmed} total)` });
  });
  data.guests.filter(g => g.rsvp === "CONFIRMED").slice(0, 2).forEach(g => {
    activities.push({ icon: "🎉", text: `${g.name ?? "Un invité"} a confirmé (${s.guests.confirmed}/${s.guests.expected})` });
  });
  data.tasks.filter(t => t.completed).slice(0, 2).forEach(t => {
    activities.push({ icon: "☑️", text: `"${t.title}" complété (${s.tasks.done}/${s.tasks.total})` });
  });

  if (activities.length === 0) return (
    <p className="text-xs py-2" style={{ color: C.mist }}>Aucune activité récente</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {activities.slice(0, 5).map((a, i) => (
        <div key={i} className="flex items-start gap-2.5 py-1 border-b last:border-b-0" style={{ borderColor: `${C.anthracite}50` }}>
          <span className="text-sm flex-shrink-0">{a.icon}</span>
          <p className="text-xs" style={{ color: C.mist }}>{a.text}</p>
        </div>
      ))}
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
        return (
          <div key={t.id} className="flex items-center gap-2 p-2 rounded-xl"
            style={{ backgroundColor: overdue ? `${C.terra}15` : `${C.anthracite}40` }}>
            <span className="text-sm flex-shrink-0">{overdue ? "🔴" : daysLeft === 0 ? "🟡" : "🟠"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: C.white }}>{t.title}</p>
              <p className="text-[10px]" style={{ color: overdue ? C.terra : `${C.mist}80` }}>
                {overdue ? `En retard de ${Math.abs(daysLeft)}j` : daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft}j`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparateurWidget({ data }: { data: DashboardData }) {
  const byCategory: Record<string, Booking[]> = {};
  data.bookings.forEach(b => {
    const cat = b.vendor?.category ?? "Autre";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(b);
  });

  const categories = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);

  if (categories.length === 0) return (
    <p className="text-xs py-2" style={{ color: C.mist }}>Aucun prestataire à comparer</p>
  );

  const [cat, bookings] = categories[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>{cat}</span>
        <span className="text-xs" style={{ color: `${C.mist}50` }}>{bookings.length} option{bookings.length > 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {bookings.slice(0, 2).map(b => (
          <div key={b.id} className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${b.status === "confirmed" ? `${C.terra}40` : C.anthracite}` }}>
            <p className="text-xs font-semibold truncate" style={{ color: C.white }}>{b.vendor?.name ?? "—"}</p>
            {b.totalPrice != null && (
              <p className="text-xs font-bold" style={{ color: C.terra }}>{b.totalPrice.toLocaleString("fr-FR")} MAD</p>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full self-start"
              style={{ backgroundColor: b.status === "confirmed" ? "#2a8a4a20" : C.anthracite, color: b.status === "confirmed" ? "#4ade80" : C.mist }}>
              {b.status === "confirmed" ? "✓ Confirmé" : "En attente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NOTES_KEY = "momento_notes_libres";

function NotesLibresWidget() {
  const [value, setValue] = useState("");
  useEffect(() => {
    try { setValue(localStorage.getItem(NOTES_KEY) ?? ""); } catch { /* ignore */ }
  }, []);

  function handleChange(v: string) {
    setValue(v);
    try { localStorage.setItem(NOTES_KEY, v); } catch { /* ignore */ }
  }

  return (
    <textarea
      value={value}
      onChange={e => handleChange(e.target.value)}
      placeholder="Vos notes libres..."
      className="w-full h-32 resize-none rounded-xl p-3 text-xs outline-none transition-colors"
      style={{ backgroundColor: `${C.anthracite}30`, border: `1px solid ${C.anthracite}`, color: C.mist }}
      onFocus={e => { e.currentTarget.style.borderColor = `${C.terra}60`; }}
      onBlur={e => { e.currentTarget.style.borderColor = C.anthracite; }}
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
  const totalGuests = s.guests.confirmed; // même chiffre que InvitesWidget

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

      {vtcBookings.length > 0 ? (
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
      ) : (
        <p className="text-xs" style={{ color: `${C.mist}60` }}>
          Aucun prestataire transport/VTC réservé
        </p>
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
  const responded = data.guests.filter(g => g.rsvp !== "PENDING").length;
  const pctSent = total > 0 ? Math.round((sent / total) * 100) : 0;
  const pctResp = total > 0 ? Math.round((responded / total) * 100) : 0;

  if (total === 0) return (
    <div className="flex flex-col items-center py-3 gap-2">
      <span className="text-2xl">💌</span>
      <p className="text-xs text-center" style={{ color: C.mist }}>Aucun invité enregistré</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "Faire-part envoyés", count: sent,      pct: pctSent, color: "#4a9eda", icon: "📤" },
        { label: "Réponses reçues",    count: responded,  pct: pctResp, color: "#4ade80", icon: "📬" },
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

      <div className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: `${C.anthracite}30` }}>
        <span style={{ color: `${C.mist}60` }}>
          {total - sent > 0
            ? `${total - sent} faire-part restent à envoyer`
            : "Tous les faire-part ont été envoyés ✉️"}
        </span>
      </div>
    </div>
  );
}

// ─── Widget Picker modal ──────────────────────────────────────────────────────

function WidgetPicker({ activeIds, onAdd, onClose }: { activeIds: string[]; onAdd: (id: string) => void; onClose: () => void }) {
  const available = WIDGET_CATALOG.filter(w => !activeIds.includes(w.id));
  const categories = [...new Set(WIDGET_CATALOG.map(w => w.category))];

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
                      onClick={() => { onAdd(w.id); onClose(); }}
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

export default function DashboardWidgets({ data, neededCategories = [] }: { data: DashboardData; neededCategories?: string[] }) {
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
      const next = { ...prev, [id]: size };
      try { localStorage.setItem(SIZE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Mutations (optimistic + API, stables via useCallback) ──
  const toggleTask = useCallback(async (id: string, done: boolean) => {
    setTaskOverrides(prev => ({ ...prev, [id]: done }));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: done }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setTaskOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, [emitRefresh]);

  const updateBudgetActual = useCallback(async (id: string, actual: number | null) => {
    setBudgetOverrides(prev => ({ ...prev, [id]: actual }));
    try {
      const res = await fetch(`/api/budget-items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actual }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setBudgetOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, [emitRefresh]);

  const updateRSVP = useCallback(async (id: string, rsvp: string) => {
    setRsvpOverrides(prev => ({ ...prev, [id]: rsvp }));
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rsvp }) });
      if (!res.ok) throw new Error(res.statusText);
      emitRefresh();
    } catch {
      setRsvpOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, [emitRefresh]);

  const dragProps = useMemo(
    () => ({ onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop }),
    [handleDragStart, handleDragOver, handleDrop]
  );

  type WidgetDef = { title: string; icon: string; href?: string; content: React.ReactNode };
  const widgetMap: Record<string, WidgetDef> = useMemo(() => ({
    recherche:    { title: "Prestataires recherchés", icon: "🔍", href: "/vendors",  content: <PrestatairesRechercheWidget categories={neededCategories} /> },
    budget:       { title: "Budget",                  icon: "💰", href: "/budget",   content: <BudgetWidget data={mergedData} onEditActual={updateBudgetActual} /> },
    prestataires: { title: "Prestataires",            icon: "🤝", href: "/vendors",  content: <PrestatairesWidget data={mergedData} /> },
    planning:     { title: "Planning",                icon: "📋", href: "/planner",  content: <PlanningWidget data={mergedData} onToggle={toggleTask} /> },
    messages:     { title: "Messages",                icon: "💬", href: "/messages", content: <MessagesWidget data={mergedData} /> },
    invites:      { title: "Invités",                 icon: "👥", href: "/guests",   content: <InvitesWidget data={mergedData} onRSVP={updateRSVP} /> },
    meteo:        { title: "Météo",                   icon: "☀️",                   content: <MeteoWidget /> },
    depenses:     { title: "Dépenses récentes",       icon: "📊", href: "/budget",   content: <DepensesRecentesWidget data={mergedData} /> },
    epargne:      { title: "Objectif budget",         icon: "🎯", href: "/budget",   content: <ObjectifEpargneWidget data={mergedData} /> },
    repartition:  { title: "Répartition budget",      icon: "🥧", href: "/budget",   content: <RepartitionBudgetWidget data={mergedData} /> },
    checklistjx:  { title: "Checklist J-X",           icon: "📆", href: "/planner",  content: <ChecklistJXWidget data={mergedData} /> },
    timeline:     { title: "Timeline",                icon: "🗓️", href: "/planner",  content: <TimelineWidget data={mergedData} /> },
    plantable:    { title: "Plan de table",           icon: "🪑", href: "/guests",   content: <PlanTableWidget data={mergedData} /> },
    rsvplive:     { title: "RSVP Live",               icon: "📨", href: "/guests",   content: <RSVPLiveWidget data={mergedData} /> },
    regimes:      { title: "Régimes alimentaires",    icon: "🍽️",                   content: <RegimesWidget data={mergedData} /> },
    agenda:       { title: "Agenda prestataires",     icon: "📅", href: "/vendors",  content: <AgendaWidget data={mergedData} /> },
    contrats:     { title: "Contrats à signer",       icon: "📄", href: "/vendors",  content: <ContratsWidget data={mergedData} /> },
    notemoyenne:  { title: "Note moyenne",            icon: "⭐",                   content: <NoteMoyenneWidget data={mergedData} /> },
    moodboard:    { title: "Mood board",              icon: "🎨",                   content: <MoodboardWidget /> },
    countdown:    { title: "Compte à rebours",        icon: "⏱️",                   content: <CountdownWidget data={mergedData} /> },
    activite:     { title: "Fil d'actualité",         icon: "📰",                   content: <ActiviteWidget data={mergedData} /> },
    citation:     { title: "Citation du jour",        icon: "✨",                   content: <CitationWidget /> },
    progression:  { title: "Score de progression",   icon: "🏆",                   content: <ProgressionWidget data={mergedData} /> },
    alertes:      { title: "Rappels & alertes",       icon: "🔔", href: "/planner",  content: <AlertesWidget data={mergedData} /> },
    comparateur:  { title: "Comparateur devis",       icon: "⚖️", href: "/vendors",  content: <ComparateurWidget data={mergedData} /> },
    noteslibres:  { title: "Notes libres",            icon: "📝",                   content: <NotesLibresWidget /> },
    transport:    { title: "Transport & navettes",    icon: "🚌", href: "/vendors",  content: <TransportWidget data={mergedData} /> },
    cartegeo:     { title: "Carte géographique",      icon: "🗺️", href: "/guests",   content: <CarteGeographiqueWidget data={mergedData} /> },
    envoi:        { title: "Envoi faire-part",        icon: "💌", href: "/guests",   content: <EnvoiFairepartWidget data={mergedData} /> },
  }), [mergedData, neededCategories, toggleTask, updateBudgetActual, updateRSVP]);

  const rechercheIds = order.filter(id => id === "recherche");
  const otherIds     = order.filter(id => id !== "recherche");

  return (
    <>
      {showPicker && (
        <WidgetPicker activeIds={order} onAdd={handleAdd} onClose={() => setShowPicker(false)} />
      )}

      <div className="flex flex-col gap-6">
        {/* ── Prestataires recherchés (largeur fixe) ── */}
        {rechercheIds.length > 0 && (
          <div className="flex flex-col gap-4 max-w-[1400px] mx-auto w-full">
            {rechercheIds.map(id => {
              const w = widgetMap[id];
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
            const w = widgetMap[id];
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
