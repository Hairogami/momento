"use client"

import Link from "next/link"
import { useState } from "react"
import { Calendar, Users, Wallet, CheckSquare, ArrowRight, Plus, Clock } from "lucide-react"
import { C } from "@/lib/colors"
import type { DashboardData } from "@/components/DashboardWidgets"
import EditEventInfo from "@/components/EditEventInfo"

const CATEGORY_ICONS: Record<string, string> = {
  "Photographe": "📸",
  "Vidéaste": "🎥",
  "DJ": "🎵",
  "Orchestre": "🎼",
  "Chanteur / chanteuse": "🎤",
  "Traiteur": "🍽️",
  "Fleuriste événementiel": "💐",
  "Lieu de réception": "🏛️",
  "Makeup Artist": "💄",
  "Hairstylist": "💇",
  "Wedding planner": "💍",
  "Event planner": "🎪",
  "Pâtissier / Cake designer": "🎂",
  "Location de voiture de mariage": "🚗",
  "Décorateur": "🌸",
  "Neggafa": "👘",
  "Créateur de faire-part": "💌",
  "Créateur de cadeaux invités": "🎁",
  "Animateur enfants": "🎩",
  "VTC / Transport invités": "🚌",
  "Créateur d'ambiance lumineuse": "💡",
  "Service de bar / mixologue": "🍹",
  "Spa / soins esthétiques": "💆",
  "Magicien": "🪄",
  "Violoniste": "🎻",
  "Dekka Marrakchia / Issawa": "🥁",
  "Robes de mariés": "👗",
  "Sécurité événementielle": "🔒",
}

interface Props {
  data: DashboardData
  eventName: string | null
  eventDate: string | null
  budget: number | null
  guestCount: number | null
  daysUntil: number | null
  neededCategories: string[]
  hasExistingEvents?: boolean
}

export default function EventsDashboard({ data, eventName, eventDate, budget, guestCount, daysUntil, neededCategories, hasExistingEvents }: Props) {
  const hasEvent = !!eventDate || (eventName && eventName !== "Mon événement")

  if (!hasEvent) return <EmptyState firstName={data.firstName} hasExistingEvents={hasExistingEvents} />
  return <EventCard data={data} eventName={eventName} eventDate={eventDate} budget={budget} guestCount={guestCount} daysUntil={daysUntil} neededCategories={neededCategories} />
}

/* ─── Empty state ─── */
function EmptyState({ firstName, hasExistingEvents }: { firstName: string | null; hasExistingEvents?: boolean }) {
  const [hover, setHover] = useState(false)

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)`, filter: "blur(40px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)`, filter: "blur(60px)" }} />
      </div>

      {/* Top label */}
      <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-8"
        style={{ color: C.terra }}>
        ✦ Mes Événements ✦
      </p>

      {/* Add button — pulsing orb */}
      <Link
        href="/event/new"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex items-center justify-center mb-10 transition-transform duration-300"
        style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
      >
        {/* Pulse rings */}
        <span className="absolute w-36 h-36 rounded-full opacity-20 animate-ping"
          style={{ backgroundColor: "var(--momento-terra)", animationDuration: "2.5s" }} />
        <span className="absolute w-28 h-28 rounded-full opacity-15"
          style={{ backgroundColor: "var(--momento-terra)" }} />

        {/* Main circle */}
        <span
          className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: "var(--momento-terra)",
            boxShadow: hover
              ? "0 0 60px rgba(var(--momento-terra-rgb),0.5), 0 20px 40px rgba(0,0,0,0.3)"
              : "0 0 30px rgba(var(--momento-terra-rgb),0.25), 0 12px 32px rgba(0,0,0,0.25)",
          }}
        >
          <Plus size={36} strokeWidth={1.5} color="var(--bg)" />
        </span>
      </Link>

      {/* Text */}
      <h1
        className="font-display text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
        style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          color: C.white,
          fontStyle: "italic",
        }}
      >
        {firstName ? `Bonjour, ${firstName}` : "Bienvenue"}
      </h1>

      <p className="text-sm text-center max-w-xs mb-8" style={{ color: C.mist, lineHeight: 1.7 }}>
        Chaque grand moment commence par une idée.<br />
        {hasExistingEvents
          ? "Organisez un nouvel événement et laissez Momento vous guider."
          : "Chaque grand moment commence par une idée. Créez votre premier événement et laissez Momento vous guider."}
      </p>

      {/* Decorative divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px w-16" style={{ backgroundColor: C.anthracite }} />
        <span style={{ color: C.steel, fontSize: 10 }}>✦</span>
        <div className="h-px w-16" style={{ backgroundColor: C.anthracite }} />
      </div>

      {/* CTA button */}
      <Link
        href="/event/new"
        className="flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
        style={{
          backgroundColor: "var(--momento-terra)",
          color: "var(--bg)",
          boxShadow: "0 8px 32px rgba(var(--momento-terra-rgb),0.3)",
          letterSpacing: "0.05em",
        }}
      >
        {hasExistingEvents ? "Créer un nouveau projet" : "Créer mon premier événement"} <ArrowRight size={15} />
      </Link>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
        {[
          { icon: <Calendar size={13} />, label: "Planification" },
          { icon: <Wallet size={13} />, label: "Budget" },
          { icon: <Users size={13} />, label: "Invités" },
          { icon: <CheckSquare size={13} />, label: "Tâches" },
        ].map(({ icon, label }) => (
          <span key={label}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "var(--bg-card)", color: C.steel, border: `1px solid var(--border)` }}>
            {icon} {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Event card ─── */
function EventCard({ data, eventName, eventDate, budget, guestCount, daysUntil, neededCategories }: Omit<Props, "data"> & { data: DashboardData }) {
  const confirmedGuests = data.guests.filter(g => g.rsvp === "yes").length
  const totalGuests = guestCount ?? data.guests.length
  const completedTasks = data.tasks.filter(t => t.completed).length
  const totalBudgetSpent = data.budgetItems.reduce((s, b) => s + (b.actual ?? b.estimated), 0)
  const budgetPct = budget ? Math.min(100, Math.round((totalBudgetSpent / budget) * 100)) : 0
  const confirmedBookings = data.bookings.filter(b => b.status === "confirmed").length

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Hero event card */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          border: `1px solid var(--border)`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Orb décoratif */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: `radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />

        {/* Top row */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: C.terra }}>
              ✦ Votre événement
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-light leading-tight mb-1"
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                color: C.white,
                fontStyle: "italic",
              }}
            >
              {eventName ?? "Mon événement"}
            </h2>
            {formattedDate && (
              <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: C.mist }}>
                <Calendar size={13} />
                {formattedDate}
                {daysUntil !== null && daysUntil > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)", color: "var(--momento-terra)" }}>
                    J-{daysUntil}
                  </span>
                )}
                {daysUntil === 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)", color: "var(--momento-terra)" }}>
                    Aujourd'hui !
                  </span>
                )}
              </p>
            )}
          </div>

          <EditEventInfo
            eventName={eventName ?? "Mon événement"}
            eventDate={eventDate}
            budget={budget}
            guestCount={guestCount}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 relative z-10">
          {[
            {
              icon: <Users size={15} />,
              label: "Invités",
              value: totalGuests ? `${confirmedGuests}/${totalGuests}` : "—",
              sub: totalGuests ? "confirmés" : "à définir",
              href: "/guests",
            },
            {
              icon: <Wallet size={15} />,
              label: "Budget",
              value: budget ? `${budgetPct}%` : "—",
              sub: budget ? `${totalBudgetSpent.toLocaleString("fr-FR")} / ${budget.toLocaleString("fr-FR")} MAD` : "à définir",
              href: "/budget",
            },
            {
              icon: <CheckSquare size={15} />,
              label: "Prestataires",
              value: confirmedBookings > 0 ? `${confirmedBookings}` : "—",
              sub: "confirmés",
              href: "/vendors",
            },
            {
              icon: <Clock size={15} />,
              label: "Tâches",
              value: data.tasks.length > 0 ? `${completedTasks}/${data.tasks.length}` : "—",
              sub: data.tasks.length > 0 ? "complétées" : "aucune",
              href: "/dashboard/tasks",
            },
          ].map(({ icon, label, value, sub, href }) => (
            <Link key={label} href={href}
              className="rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-md group"
              style={{ backgroundColor: "var(--bg)", border: `1px solid var(--border)` }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ color: C.steel }}>
                {icon}
                <span className="text-xs uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: C.white }}>{value}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: C.mist }}>{sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Vendor category bubbles */}
      {neededCategories.length > 0 && (
        <div className="rounded-3xl p-6" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: C.steel }}>
              Mes prestataires recherchés
            </p>
            <Link href="/event/new/categories"
              className="text-xs transition hover:opacity-70"
              style={{ color: "var(--momento-terra)" }}>
              Modifier
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {neededCategories.map(cat => (
              <Link
                key={cat}
                href={`/prestataires?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                style={{
                  backgroundColor: "rgba(var(--momento-terra-rgb),0.12)",
                  border: "1px solid rgba(var(--momento-terra-rgb),0.3)",
                  color: "var(--momento-terra)",
                }}
              >
                {CATEGORY_ICONS[cat] && <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>}
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/prestataires", label: "Trouver des prestataires", icon: "🔍" },
          { href: "/budget", label: "Gérer le budget", icon: "💰" },
          { href: "/guests", label: "Liste des invités", icon: "👥" },
          { href: "/vendors", label: "Mes prestataires", icon: "🤝" },
          { href: "/messages", label: "Messages", icon: "💬" },
          { href: "/planner", label: "Planificateur", icon: "📋" },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)`, color: C.white }}>
            <span className="text-lg">{icon}</span>
            <span className="truncate">{label}</span>
            <ArrowRight size={13} className="ml-auto shrink-0" style={{ color: C.steel }} />
          </Link>
        ))}
      </div>

      {/* Add another event teaser */}
      <div className="flex items-center justify-center pt-2">
        <Link href="/event/new"
          className="flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: C.steel }}>
          <Plus size={13} /> Créer un autre événement
        </Link>
      </div>
    </div>
  )
}
