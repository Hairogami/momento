"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { C } from "@/lib/colors"

const MONTHS_FULL = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
]
const DAYS = ["L","M","M","J","V","S","D"]

function getDays(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirst(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1 }

interface CalProps {
  year: number
  month: number
  startDate: Date | null
  endDate: Date | null
  hoverDate: Date | null
  onPick: (d: Date) => void
  onHover: (d: Date | null) => void
  minDate?: Date
}

function CalMonth({ year, month, startDate, endDate, hoverDate, onPick, onHover, minDate }: CalProps) {
  const days = getDays(year, month)
  const first = getFirst(year, month)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const min = minDate ?? today

  function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString() }

  function isStart(d: Date) { return !!startDate && sameDay(d, startDate) }
  function isEnd(d: Date) {
    if (endDate && sameDay(d, endDate)) return true
    if (!endDate && hoverDate && startDate && sameDay(d, hoverDate) && d > startDate) return true
    return false
  }
  function inRange(d: Date) {
    if (!startDate) return false
    const end = endDate ?? hoverDate
    if (!end) return false
    return d > startDate && d < end
  }

  return (
    <div style={{ minWidth: 230 }}>
      {/* Month title */}
      <p className="text-center text-sm font-bold mb-3" style={{ color: C.white }}>
        {MONTHS_FULL[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-1" style={{ color: C.steel }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const disabled = date < min
          const isToday = sameDay(date, today)
          const start = isStart(date)
          const end = isEnd(date)
          const range = !disabled && inRange(date)
          const isSelected = start || end

          // Range strip: left cap (start), right cap (end), full strip (in range)
          let stripBg = "transparent"
          let stripBorderRadius = "0"
          if (start && (endDate || (hoverDate && hoverDate > date))) {
            stripBg = "rgba(var(--momento-terra-rgb),0.1)"
            stripBorderRadius = "50% 0 0 50%"
          } else if (end && startDate) {
            stripBg = "rgba(var(--momento-terra-rgb),0.1)"
            stripBorderRadius = "0 50% 50% 0"
          } else if (range) {
            stripBg = "rgba(var(--momento-terra-rgb),0.1)"
            stripBorderRadius = "0"
          }

          return (
            <div key={day} className="relative flex items-center justify-center"
              style={{ height: 36, backgroundColor: stripBg, borderRadius: stripBorderRadius }}>
              <button
                disabled={disabled}
                onClick={() => !disabled && onPick(date)}
                onMouseEnter={() => !disabled && onHover(date)}
                onMouseLeave={() => onHover(null)}
                className="relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium"
                style={{
                  backgroundColor: isSelected ? C.terra : "transparent",
                  color: isSelected ? "var(--bg)" : disabled ? C.steel : C.white,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontWeight: isSelected || isToday ? "700" : "400",
                  outline: isToday && !isSelected ? `2px solid ${C.terra}` : "none",
                  outlineOffset: -2,
                  transition: "background-color 0.12s ease, color 0.12s ease",
                }}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onSelect: (start: Date, end: Date | null) => void
  onClear: () => void
  onApply: () => void
}

export default function DateRangePicker({ startDate, endDate, onSelect, onClear, onApply }: DateRangePickerProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const month2 = month === 11 ? 0 : month + 1
  const year2  = month === 11 ? year + 1 : year

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handlePick(date: Date) {
    if (!startDate || (startDate && endDate)) {
      // Start fresh
      onSelect(date, null)
    } else if (date < startDate) {
      // Clicked before start → restart
      onSelect(date, null)
    } else if (date.toDateString() === startDate.toDateString()) {
      // Clicked same day → single day
      onSelect(date, date)
    } else {
      // Set end
      onSelect(startDate, date)
    }
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const canGoBack = !(year === today.getFullYear() && month === today.getMonth())

  return (
    <div
      style={{
        backgroundColor: C.dark,
        border: `1px solid ${C.anthracite}`,
        borderRadius: 20,
        boxShadow: "0 16px 56px rgba(0,0,0,0.18)",
        overflow: "hidden",
        minWidth: 560,
      }}
    >
      {/* Header: range label */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${C.anthracite}`, backgroundColor: C.ink }}>
        <div className="flex items-center gap-3">
          {/* Start chip */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: C.mist }}>Arrivée</span>
            <span className="text-sm font-bold px-4 py-1.5 rounded-xl"
              style={{
                backgroundColor: startDate ? C.terra : C.anthracite,
                color: startDate ? "var(--bg)" : C.steel,
              }}>
              {startDate ? formatDate(startDate) : "—"}
            </span>
          </div>
          <span style={{ color: C.steel, fontSize: "var(--text-md)" }}>→</span>
          {/* End chip */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: C.mist }}>Départ</span>
            <span className="text-sm font-bold px-4 py-1.5 rounded-xl"
              style={{
                backgroundColor: endDate ? C.terra : C.anthracite,
                color: endDate ? "var(--bg)" : C.steel,
              }}>
              {endDate ? formatDate(endDate) : "—"}
            </span>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            disabled={!canGoBack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition"
            style={{
              backgroundColor: canGoBack ? C.dark : "transparent",
              color: canGoBack ? C.white : C.anthracite,
              cursor: canGoBack ? "pointer" : "not-allowed",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full transition hover:opacity-80"
            style={{ backgroundColor: C.dark, color: C.white }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendars */}
      <div className="flex gap-8 px-6 py-5">
        <CalMonth
          year={year} month={month}
          startDate={startDate} endDate={endDate}
          hoverDate={hoverDate}
          onPick={handlePick}
          onHover={setHoverDate}
        />
        <div style={{ width: 1, backgroundColor: C.anthracite, alignSelf: "stretch" }} />
        <CalMonth
          year={year2} month={month2}
          startDate={startDate} endDate={endDate}
          hoverDate={hoverDate}
          onPick={handlePick}
          onHover={setHoverDate}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: `1px solid ${C.anthracite}`, backgroundColor: C.ink }}>
        <div className="flex items-center gap-4 text-xs" style={{ color: C.mist }}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: C.terra }} />
            Sélectionné
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ outline: `2px solid ${C.terra}`, outlineOffset: -2 }} />
            Aujourd&apos;hui
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-sm font-medium underline transition hover:opacity-70"
            style={{ color: C.mist }}
          >
            Effacer
          </button>
          {startDate && (
            <button
              onClick={onApply}
              className="text-sm font-bold px-5 py-2 rounded-xl transition hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "var(--bg)" }}
            >
              {endDate ? "Confirmer" : "Date unique"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
