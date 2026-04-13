"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Circle, Star } from "lucide-react"
import { C } from "@/lib/colors"
import Link from "next/link"
import { InlineEdit } from "@/components/InlineEdit"

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]

interface LocalTask {
  id: string
  title: string
  dueDate: string | null
  completed: boolean
  category: string | null
  color?: string | null
}

interface GoogleEvent {
  id: string
  title: string
  date: string
  time?: string
  color?: string
}

interface Props {
  tasks: LocalTask[]
  eventDate: string | null
  eventName: string | null
  isGoogleUser: boolean
  workspaceId: string
}

export default function CalendarView({ tasks, eventDate, eventName, isGoogleUser, workspaceId }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([])
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState(false)

  // Fetch Google Calendar events if user is Google-authenticated
  useEffect(() => {
    if (!isGoogleUser) return
    setGoogleLoading(true)
    const from = new Date(year, month, 1).toISOString()
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    fetch(`/api/calendar/google?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(data => {
        if (data.events) setGoogleEvents(data.events)
        else setGoogleError(true)
      })
      .catch(() => setGoogleError(true))
      .finally(() => setGoogleLoading(false))
  }, [isGoogleUser, year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (() => { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1 })()

  function toYMD(d: Date) { return d.toISOString().slice(0, 10) }

  // Build a map date → events
  const eventMap: Record<string, { tasks: LocalTask[]; google: GoogleEvent[]; isEventDay: boolean }> = {}

  tasks.forEach(t => {
    if (!t.dueDate) return
    const d = t.dueDate.slice(0, 10)
    if (!eventMap[d]) eventMap[d] = { tasks: [], google: [], isEventDay: false }
    eventMap[d].tasks.push(t)
  })

  googleEvents.forEach(e => {
    const d = e.date.slice(0, 10)
    if (!eventMap[d]) eventMap[d] = { tasks: [], google: [], isEventDay: false }
    eventMap[d].google.push(e)
  })

  if (eventDate) {
    const d = eventDate.slice(0, 10)
    if (!eventMap[d]) eventMap[d] = { tasks: [], google: [], isEventDay: false }
    eventMap[d].isEventDay = true
  }

  const todayStr = toYMD(today)
  const eventDateStr = eventDate?.slice(0, 10)

  // Selected day data
  const selectedData = selectedDay ? eventMap[selectedDay] : null
  const selectedDate = selectedDay ? new Date(selectedDay + "T12:00:00") : null

  return (
    <div className="space-y-6">
      {/* Calendar card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="font-display text-2xl font-light"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: C.white, fontStyle: "italic" }}>
              {MONTHS[month]} {year}
            </h2>
            {isGoogleUser && (
              <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: C.steel }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#4285F4" }} />
                {googleLoading ? "Synchro Google Calendar…" : googleError ? "Google Calendar indisponible" : "Google Calendar synchronisé"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full transition hover:opacity-70"
              style={{ backgroundColor: "var(--bg)", color: C.white }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
              className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-70"
              style={{ backgroundColor: "var(--bg)", color: C.steel }}>
              Aujourd'hui
            </button>
            <button onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full transition hover:opacity-70"
              style={{ backgroundColor: "var(--bg)", color: C.white }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-4 pt-4 pb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold uppercase tracking-widest py-1"
              style={{ color: C.steel }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 px-4 pb-5 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const isToday = dateStr === todayStr
            const isEvent = dateStr === eventDateStr
            const isSelected = dateStr === selectedDay
            const dayData = eventMap[dateStr]
            const hasGoogle = (dayData?.google.length ?? 0) > 0
            const isPast = dateStr < todayStr
            // Couleurs uniques des tâches de ce jour (max 3 dots)
            const taskColors = dayData?.tasks
              ? [...new Set(dayData.tasks.map(t => t.color ?? "var(--momento-terra)"))]
              : []

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className="relative flex flex-col items-center py-1.5 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: isSelected
                    ? "var(--momento-terra)"
                    : isToday
                    ? "rgba(var(--momento-terra-rgb),0.12)"
                    : isEvent
                    ? "rgba(var(--momento-terra-rgb),0.08)"
                    : "transparent",
                  outline: isToday && !isSelected ? "1.5px solid var(--momento-terra)" : "none",
                  outlineOffset: -1,
                }}
              >
                <span
                  className="text-sm font-medium leading-none"
                  style={{
                    color: isSelected ? "var(--bg)" : isToday ? "var(--momento-terra)" : isPast ? C.steel : C.white,
                    fontWeight: isToday || isEvent ? "700" : "400",
                  }}
                >
                  {day}
                </span>

                {isEvent && !isSelected && (
                  <Star size={7} fill="var(--momento-terra)" stroke="none" className="mt-0.5" />
                )}

                {/* Dots */}
                {!isEvent && (taskColors.length > 0 || hasGoogle) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {taskColors.slice(0, 3).map((color, idx) => (
                      <span key={idx} className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: isSelected ? "var(--bg)" : color }} />
                    ))}
                    {hasGoogle && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? "var(--bg)" : "#4285F4" }} />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-6 py-3 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: C.steel }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--momento-terra)" }} />
            Tâche / Événement
          </span>
          {isGoogleUser && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4285F4" }} />
              Google Calendar
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Star size={8} fill="var(--momento-terra)" stroke="none" />
            Votre événement
          </span>
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && selectedDate && (
        <div
          className="rounded-3xl p-5 space-y-3"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: C.white }}>
              {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            {selectedData?.isEventDay && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.15)", color: "var(--momento-terra)" }}>
                <Star size={10} fill="var(--momento-terra)" stroke="none" /> {eventName}
              </span>
            )}
          </div>

          {/* Tasks */}
          {selectedData?.tasks.length ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest" style={{ color: C.steel }}>Tâches</p>
              {selectedData.tasks.map(t => (
                <div key={t.id} className="flex items-center gap-2.5 text-sm"
                  style={{ color: t.completed ? C.steel : C.white, textDecoration: t.completed ? "line-through" : "none" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.color ?? "var(--momento-terra)" }} />
                  <InlineEdit
                    value={t.title}
                    endpoint="/api/tasks"
                    id={t.id}
                    field="title"
                    style={{ color: t.completed ? C.steel : C.white, flex: 1 }}
                  />
                  {t.category && <span className="text-xs ml-auto shrink-0" style={{ color: C.steel }}>{t.category}</span>}
                </div>
              ))}
            </div>
          ) : null}

          {/* Google events */}
          {selectedData?.google.length ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest" style={{ color: C.steel }}>Google Calendar</p>
              {selectedData.google.map(e => (
                <div key={e.id} className="flex items-center gap-2.5 text-sm" style={{ color: C.white }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#4285F4" }} />
                  {e.title}
                  {e.time && <span className="text-xs ml-auto" style={{ color: C.steel }}>{e.time}</span>}
                </div>
              ))}
            </div>
          ) : null}

          {!selectedData?.tasks.length && !selectedData?.google.length && !selectedData?.isEventDay && (
            <p className="text-sm" style={{ color: C.steel }}>Aucun événement ce jour.</p>
          )}

          <Link href={`/planner/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium mt-1 transition hover:opacity-70"
            style={{ color: "var(--momento-terra)" }}>
            + Ajouter une tâche
          </Link>
        </div>
      )}

      {/* Upcoming tasks */}
      {tasks.filter(t => !t.completed && t.dueDate && t.dueDate >= todayStr).slice(0, 5).length > 0 && (
        <div className="rounded-3xl p-5"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.steel }}>Prochaines tâches</p>
          <div className="space-y-2.5">
            {tasks
              .filter(t => !t.completed && t.dueDate && t.dueDate >= todayStr)
              .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
              .slice(0, 5)
              .map(t => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.color ?? "var(--momento-terra)" }} />
                  <InlineEdit
                    value={t.title}
                    endpoint="/api/tasks"
                    id={t.id}
                    field="title"
                    style={{ color: C.white, flex: 1 }}
                  />
                  {t.dueDate && (
                    <span className="ml-auto text-xs shrink-0" style={{ color: C.steel }}>
                      {new Date(t.dueDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
