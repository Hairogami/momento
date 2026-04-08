"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  vendor: {
    name: string;
    category: string;
  } | null;
}

interface Guest {
  id: string;
  rsvp: string;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ORDER = [
  "budget",
  "prestataires",
  "planning",
  "messages",
  "invites",
  "meteo",
];

const STORAGE_KEY = "momento_widget_order";

// ─── Widget card wrapper ──────────────────────────────────────────────────────

interface WidgetCardProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  href?: string;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
}

function WidgetCard({
  id,
  title,
  icon,
  children,
  href,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
}: WidgetCardProps) {
  const [isOver, setIsOver] = useState(false);

  const card = (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => {
        setIsOver(false);
        onDrop(id);
      }}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundColor: C.dark,
        border: isOver
          ? `2px solid ${C.terra}`
          : `1px solid ${C.anthracite}`,
        opacity: dragging ? 0.5 : 1,
        boxShadow: isOver ? `0 0 0 2px ${C.terra}30` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span
            className="text-sm font-semibold"
            style={{ color: C.white }}
          >
            {title}
          </span>
        </div>
        {href && (
          <span className="text-xs" style={{ color: C.mist }}>
            →
          </span>
        )}
      </div>
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-95 transition-opacity">
        {card}
      </Link>
    );
  }
  return card;
}

// ─── Individual widgets ───────────────────────────────────────────────────────

function BudgetWidget({ data }: { data: DashboardData }) {
  const spent = data.budgetItems.reduce(
    (sum, item) => sum + (item.actual ?? item.estimated),
    0
  );
  const pct =
    data.budget && data.budget > 0
      ? Math.min(100, Math.round((spent / data.budget) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: C.white }}>
            {spent.toLocaleString("fr-FR")} €
          </p>
          {data.budget && (
            <p className="text-xs" style={{ color: C.mist }}>
              sur {data.budget.toLocaleString("fr-FR")} € prévus
            </p>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor:
              pct > 90 ? `${C.terra}30` : `${C.anthracite}`,
            color: pct > 90 ? C.terra : C.mist,
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: C.anthracite }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: pct > 90 ? C.terra : "rgba(var(--momento-terra-rgb),0.6)",
          }}
        />
      </div>

      {/* Donut chart */}
      <BudgetChart items={data.budgetItems} total={data.budget ?? 0} />
    </div>
  );
}

function PrestatairesWidget({ data }: { data: DashboardData }) {
  const confirmed = data.bookings.filter((b) => b.status === "confirmed");
  const pending = data.bookings.filter((b) => b.status !== "confirmed");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ backgroundColor: `${C.terra}15` }}
        >
          <p className="text-xl font-bold" style={{ color: C.terra }}>
            {confirmed.length}
          </p>
          <p className="text-xs" style={{ color: C.mist }}>
            confirmés
          </p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ backgroundColor: C.anthracite + "50" }}
        >
          <p className="text-xl font-bold" style={{ color: C.white }}>
            {pending.length}
          </p>
          <p className="text-xs" style={{ color: C.mist }}>
            en attente
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        {data.bookings.slice(0, 4).map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2 py-1"
          >
            {/* Avatar initial */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: `${C.terra}20`,
                color: C.terra,
              }}
            >
              {b.vendor?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: C.white }}
              >
                {b.vendor?.name ?? "—"}
              </p>
              <p className="text-xs" style={{ color: C.mist }}>
                {b.vendor?.category ?? ""}
              </p>
            </div>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  b.status === "confirmed"
                    ? "#2a8a4a20"
                    : `${C.anthracite}`,
                color:
                  b.status === "confirmed" ? "#4ade80" : C.mist,
              }}
            >
              {b.status === "confirmed"
                ? "Confirmé"
                : b.status === "cancelled"
                ? "Annulé"
                : "En attente"}
            </span>
          </div>
        ))}
        {data.bookings.length === 0 && (
          <p className="text-xs" style={{ color: C.mist }}>
            Aucun prestataire ajouté
          </p>
        )}
      </div>
    </div>
  );
}

function PlanningWidget({ data }: { data: DashboardData }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const upcoming = data.tasks.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      {upcoming.length === 0 && (
        <p className="text-xs" style={{ color: C.mist }}>
          Toutes les tâches sont terminées 🎉
        </p>
      )}
      {upcoming.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-2.5 py-1.5 px-2 rounded-xl transition-colors cursor-pointer"
          style={{
            backgroundColor: checked.has(task.id)
              ? `${C.terra}10`
              : "transparent",
          }}
          onClick={() => toggle(task.id)}
        >
          {/* Checkbox */}
          <div
            className="w-4 h-4 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-all"
            style={{
              borderColor: checked.has(task.id) ? C.terra : C.anthracite,
              backgroundColor: checked.has(task.id)
                ? C.terra
                : "transparent",
            }}
          >
            {checked.has(task.id) && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4l2.5 2.5L9 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium"
              style={{
                color: checked.has(task.id) ? C.mist : C.white,
                textDecoration: checked.has(task.id)
                  ? "line-through"
                  : "none",
              }}
            >
              {task.title}
            </p>
            {task.dueDate && (
              <p className="text-xs mt-0.5" style={{ color: C.mist }}>
                {new Date(task.dueDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            )}
          </div>
          {task.category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: C.anthracite,
                color: C.mist,
              }}
            >
              {task.category}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function MessagesWidget({ data }: { data: DashboardData }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor:
              data.unreadCount > 0 ? `${C.terra}20` : C.anthracite,
          }}
        >
          {data.unreadCount > 0 ? (
            <span style={{ color: C.terra }}>{data.unreadCount}</span>
          ) : (
            <span style={{ color: C.mist }}>0</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: C.white }}>
            {data.unreadCount > 0
              ? `${data.unreadCount} message${data.unreadCount > 1 ? "s" : ""} non lu${data.unreadCount > 1 ? "s" : ""}`
              : "Pas de nouveaux messages"}
          </p>
          <p className="text-xs" style={{ color: C.mist }}>
            {data.unreadCount > 0
              ? "Cliquez pour répondre"
              : "Tout est à jour"}
          </p>
        </div>
      </div>
    </div>
  );
}

function InvitesWidget({ data }: { data: DashboardData }) {
  const confirmed = data.guests.filter((g) => g.rsvp === "yes").length;
  const declined = data.guests.filter((g) => g.rsvp === "no").length;
  const pending = data.guests.filter((g) => g.rsvp === "pending").length;
  const total = data.guests.length;
  const rsvpPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold" style={{ color: C.white }}>
          {total}
        </p>
        {data.guestCount && (
          <p className="text-xs pb-1" style={{ color: C.mist }}>
            / {data.guestCount} prévus
          </p>
        )}
      </div>

      {/* RSVP bar */}
      {total > 0 && (
        <>
          <div
            className="w-full h-2 rounded-full overflow-hidden flex"
            style={{ backgroundColor: C.anthracite }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${(confirmed / total) * 100}%`,
                backgroundColor: "#4ade80",
              }}
            />
            <div
              className="h-full transition-all"
              style={{
                width: `${(declined / total) * 100}%`,
                backgroundColor: C.terra,
              }}
            />
          </div>
          <div className="flex gap-3 text-xs" style={{ color: C.mist }}>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />
              {confirmed} oui
            </span>
            <span>
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: C.terra }}
              />
              {declined} non
            </span>
            <span>
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: C.anthracite }}
              />
              {pending} en attente
            </span>
          </div>
        </>
      )}

      {total === 0 && (
        <p className="text-xs" style={{ color: C.mist }}>
          Aucun invité ajouté
        </p>
      )}
    </div>
  );
}

function MeteoWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-2">
      <span className="text-3xl">🌤</span>
      <p className="text-sm font-medium" style={{ color: C.white }}>
        Météo de l&apos;événement
      </p>
      <p
        className="text-xs text-center"
        style={{ color: C.mist }}
      >
        Disponible 14 jours avant l&apos;événement
      </p>
      <span
        className="text-xs px-2 py-1 rounded-full mt-1"
        style={{ backgroundColor: C.anthracite, color: C.mist }}
      >
        À venir
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardWidgets({ data }: { data: DashboardData }) {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const draggingId = useRef<string | null>(null);

  // Load order from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        // Validate: must contain all default IDs
        if (
          Array.isArray(parsed) &&
          DEFAULT_ORDER.every((id) => parsed.includes(id))
        ) {
          setOrder(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function handleDragStart(id: string) {
    draggingId.current = id;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    const fromId = draggingId.current;
    if (!fromId || fromId === targetId) return;

    setOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(fromId);
      const toIdx = next.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, fromId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    draggingId.current = null;
  }

  const widgetProps = {
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  const widgetMap: Record<
    string,
    { title: string; icon: string; href?: string; content: React.ReactNode }
  > = {
    budget: {
      title: "Budget",
      icon: "💰",
      href: "/budget",
      content: <BudgetWidget data={data} />,
    },
    prestataires: {
      title: "Prestataires",
      icon: "🤝",
      href: "/prestataires",
      content: <PrestatairesWidget data={data} />,
    },
    planning: {
      title: "Planning",
      icon: "📋",
      href: "/planner",
      content: <PlanningWidget data={data} />,
    },
    messages: {
      title: "Messages",
      icon: "💬",
      href: "/messages",
      content: <MessagesWidget data={data} />,
    },
    invites: {
      title: "Invités",
      icon: "👥",
      href: "/guests",
      content: <InvitesWidget data={data} />,
    },
    meteo: {
      title: "Météo",
      icon: "☀️",
      content: <MeteoWidget />,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {order.map((id) => {
        const w = widgetMap[id];
        if (!w) return null;
        return (
          <WidgetCard
            key={id}
            id={id}
            title={w.title}
            icon={w.icon}
            href={w.href}
            dragging={draggingId.current === id}
            {...widgetProps}
          >
            {w.content}
          </WidgetCard>
        );
      })}

      {/* Add widget button */}
      <button
        className="rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90 active:scale-95 md:col-span-2"
        style={{
          backgroundColor: "transparent",
          border: `2px dashed ${C.anthracite}`,
          color: C.mist,
          cursor: "pointer",
        }}
        onClick={() => {
          // Future: open widget picker modal
          alert("Widget picker — bientôt disponible !");
        }}
      >
        <span style={{ color: C.terra }}>+</span>
        Ajouter un widget
      </button>
    </div>
  );
}
