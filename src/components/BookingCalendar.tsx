"use client"

import { useState, useRef } from "react"
import { Clock, Tag, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react"
import { C } from "@/lib/colors"
import { useTheme } from "@/components/ThemeProvider"

interface BookingCalendarProps {
  vendorName: string
  vendorSlug?: string
  onRequestSent?: () => void
}

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const DAY_HEADERS = [
  { label: "L", weekend: false },
  { label: "M", weekend: false },
  { label: "M", weekend: false },
  { label: "J", weekend: false },
  { label: "V", weekend: false },
  { label: "S", weekend: true  },
  { label: "D", weekend: true  },
]

const EVENT_TYPES = ["Mariage", "Fiançailles", "Anniversaire", "Baby shower", "Soirée privée", "Corporate", "Autre"]

// Fake booked: some saturdays/sundays for demo realism
function isFakeBooked(date: Date) {
  const d = date.getDay()
  const day = date.getDate()
  return (d === 6 && day % 3 === 0) || (d === 0 && day % 4 === 0)
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Monday = 0
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: C.mist }}>{label}</label>
      {children}
    </div>
  )
}

export default function BookingCalendar({ vendorName, vendorSlug, onRequestSent }: BookingCalendarProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [year, setYear]       = useState(today.getFullYear())
  const [month, setMonth]     = useState(today.getMonth())
  const [selected, setSelected] = useState<Date | null>(null)
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null)
  const [form, setForm] = useState({ name: "", email: "", time: "", eventType: "" })
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState("")
  const calRef = useRef<HTMLDivElement>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDayOfMonth(year, month)

  function prevMonth() {
    const isFirstMonth = year === today.getFullYear() && month === today.getMonth()
    if (isFirstMonth) return
    setSlideDir("right")
    setTimeout(() => {
      if (month === 0) { setMonth(11); setYear(y => y - 1) }
      else setMonth(m => m - 1)
      setSelected(null)
      setSlideDir(null)
    }, 150)
  }

  function nextMonth() {
    setSlideDir("left")
    setTimeout(() => {
      if (month === 11) { setMonth(0); setYear(y => y + 1) }
      else setMonth(m => m + 1)
      setSelected(null)
      setSlideDir(null)
    }, 150)
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day)
    if (d < todayMidnight || isFakeBooked(d)) return
    setSelected(d)
    setSent(false)
    setError("")
    // Smooth scroll to form
    setTimeout(() => {
      calRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 50)
  }

  async function handleSend() {
    if (!selected || !form.name.trim() || !form.email.trim()) {
      setError("Merci de remplir votre nom et email.")
      return
    }
    setSending(true)
    setError("")
    const dateStr = formatSelectedDate(selected)
    const slug = vendorSlug ?? vendorName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorSlug: slug,
          clientName: form.name,
          clientEmail: form.email,
          eventType: form.eventType || null,
          eventDate: selected.toISOString().split("T")[0],
          message: `Demande de réservation pour le ${dateStr}${form.time ? ` à ${form.time}` : ""}.`,
        }),
      })
      if (res.ok) {
        setSent(true)
        setForm({ name: "", email: "", time: "", eventType: "" })
        onRequestSent?.()
      } else {
        setError("Une erreur est survenue. Réessayez.")
      }
    } catch {
      setError("Impossible d'envoyer. Vérifiez votre connexion.")
    } finally {
      setSending(false)
    }
  }

  const isFirstMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <div className="mb-6">
      {/* Section header + badges */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-base font-bold" style={{ color: C.white }}>Vérifier les disponibilités</h2>
        <div className="flex flex-wrap gap-2 justify-end">
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)", color: C.terra }}>
            <Clock size={10} /> Réponse sous 24h
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)", color: C.terra }}>
            <Tag size={10} /> Tarif sur devis
          </span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.anthracite}` }}>
          <button
            onClick={prevMonth}
            disabled={isFirstMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-80 disabled:opacity-30"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            <ChevronLeft size={15} />
          </button>
          <span
            className="text-sm font-bold select-none transition-all duration-150"
            style={{
              color: C.white,
              transform: slideDir === "left" ? "translateX(-10px)" : slideDir === "right" ? "translateX(10px)" : "translateX(0)",
              opacity: slideDir ? 0 : 1,
            }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-80"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={i}
              className="text-center text-xs font-bold py-2"
              style={{
                color: d.weekend ? C.terra : C.steel,
                backgroundColor: d.weekend ? "rgba(var(--momento-terra-rgb),0.04)" : "transparent",
              }}>
              {d.label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          className="grid grid-cols-7 px-3 pb-4 gap-y-1 transition-all duration-150"
          style={{ opacity: slideDir ? 0 : 1 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day     = i + 1
            const date    = new Date(year, month, day)
            const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const isPast    = date < todayMidnight
            const isBooked  = isFakeBooked(date)
            const isSelected= selected?.toDateString() === date.toDateString()
            const isToday   = date.toDateString() === today.toDateString()
            const disabled  = isPast || isBooked

            return (
              <button
                key={day}
                onClick={() => selectDay(day)}
                disabled={disabled}
                className="relative h-9 w-full flex items-center justify-center text-sm rounded-xl transition-all duration-100"
                style={{
                  backgroundColor:
                    isSelected   ? C.terra :
                    isToday      ? "rgba(var(--momento-terra-rgb),0.15)" :
                    isWeekend && !disabled ? "rgba(var(--momento-terra-rgb),0.03)" :
                    "transparent",
                  color:
                    isSelected ? "var(--bg)" :
                    isPast     ? C.steel :
                    isBooked   ? C.steel :
                    isWeekend  ? C.terra :
                    C.white,
                  fontWeight: isToday || isSelected ? "700" : isWeekend ? "600" : "400",
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  textDecoration: isBooked ? "line-through" : "none",
                  border: isToday && !isSelected ? "1px solid rgba(var(--momento-terra-rgb),0.6)" : "1px solid transparent",
                }}>
                {day}
                {isBooked && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: C.steel }} />
                )}
                {!disabled && !isSelected && (
                  <span className="absolute inset-0 rounded-xl hover:bg-black hover:bg-opacity-5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 pb-3 text-xs" style={{ color: C.mist }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.terra }} />
            Sélectionné
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.steel }} />
            Indisponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.19)", border: `1px solid ${C.terra}` }} />
            Aujourd&apos;hui
          </span>
        </div>

        {/* Selected date form */}
        {selected && !sent && (
          <div ref={calRef} className="px-5 pb-5 pt-4" style={{ borderTop: `1px solid ${C.anthracite}` }}>
            {/* Date pill */}
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl"
              style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.07)", border: "1px solid rgba(var(--momento-terra-rgb),0.19)" }}>
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.terra }}>Date sélectionnée</p>
                <p className="text-sm font-bold capitalize" style={{ color: C.white }}>
                  {formatSelectedDate(selected)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Votre nom *">
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Yasmine B."
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
                    style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}40`, color: C.white }}
                  />
                </Field>
                <Field label="Heure souhaitée">
                  <input
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    type="time"
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
                    style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}40`, color: C.white, colorScheme: isDark ? "dark" : "light" }}
                  />
                </Field>
              </div>

              <Field label="Votre email *">
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="vous@exemple.com"
                  type="email"
                  className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}40`, color: C.white }}
                />
              </Field>

              <Field label="Type d'événement">
                <select
                  value={form.eventType}
                  onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 rounded-xl outline-none appearance-none"
                  style={{
                    backgroundColor: C.anthracite,
                    border: `1px solid ${C.steel}40`,
                    color: form.eventType ? C.white : C.steel,
                  }}>
                  <option value="">Sélectionner…</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.08)", color: C.terra }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSend}
                disabled={sending || !form.name.trim() || !form.email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: C.terra, color: "#fff" }}>
                {sending
                  ? <><Loader2 size={14} className="animate-spin" /> Envoi en cours…</>
                  : <><Send size={14} /> Envoyer la demande</>
                }
              </button>

              <p className="text-xs text-center" style={{ color: C.steel }}>
                Sans engagement · Réponse garantie sous 24h
              </p>
            </div>
          </div>
        )}

        {/* Success state */}
        {sent && (
          <div ref={calRef} className="px-5 pb-6 pt-5 text-center" style={{ borderTop: `1px solid ${C.anthracite}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
              style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)" }}>
              ✅
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: C.white }}>Demande envoyée !</p>
            <p className="text-xs leading-relaxed" style={{ color: C.mist }}>
              {vendorName} a reçu votre demande et vous répondra dans les 24h.
            </p>
            <button
              onClick={() => { setSent(false); setSelected(null) }}
              className="mt-4 text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ backgroundColor: C.anthracite, color: C.mist }}>
              Choisir une autre date
            </button>
          </div>
        )}

        {/* Prompt when no date selected */}
        {!selected && !sent && (
          <div className="px-5 pb-4 pt-1 text-center" style={{ borderTop: `1px solid ${C.anthracite}` }}>
            <p className="text-xs" style={{ color: C.steel }}>
              Sélectionnez une date pour envoyer votre demande de réservation
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
