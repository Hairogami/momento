"use client"
import { useMemo } from "react"

export const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

export const MONTHS_LONG = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
]
export const DAYS_SHORT_1 = ["L","M","M","J","V","S","D"]
export const DAYS_LONG = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"]
export const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // 7h → 23h

export const CAT_COLORS: Record<string, string> = {
  venue: "#22c55e", catering: "#f59e0b", flowers: "#f472b6",
  music: "#a855f7", photo: "#818cf8", dress: "#ec4899", general: "#E11D48",
}
export const EVENT_TYPE_COLORS: Record<string, string> = {
  task: "#818cf8", appointment: "#f59e0b", reminder: "#ef4444",
}

export type Step = {
  id: string; title: string; description: string | null; status: string
  category: string; dueDate: string | null; order: number
  vendors: { vendor: { id: string; name: string; slug: string; category: string }; confirmed: boolean; notes: string | null }[]
}
export type PlannerEvent = {
  id: string; title: string; date: string; endDate: string | null
  type: string; status: string; color: string
}

export type CalItem =
  | { kind: "step";  id: string; date: Date; color: string; title: string; ref: Step }
  | { kind: "event"; id: string; date: Date; color: string; title: string; ref: PlannerEvent }
  | { kind: "wedding"; id: "wedding"; date: Date; color: string; title: string }

export type View = "month" | "week" | "day"

/* -------- date helpers -------- */
export function startOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth(), 1) }
export function startOfWeek(d: Date)    { const x = new Date(d); const dow = (x.getDay()+6)%7; x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x }
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x }
export function sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }
export function fmtDayKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

export function buildItems(steps: Step[], events: PlannerEvent[], weddingDate: string | null): CalItem[] {
  const items: CalItem[] = []
  for (const s of steps) {
    if (!s.dueDate) continue
    items.push({
      kind: "step", id: s.id, date: new Date(s.dueDate),
      color: CAT_COLORS[s.category] ?? "#818cf8",
      title: s.title, ref: s,
    })
  }
  for (const e of events) {
    items.push({
      kind: "event", id: e.id, date: new Date(e.date),
      color: e.color || EVENT_TYPE_COLORS[e.type] || "#818cf8",
      title: e.title, ref: e,
    })
  }
  if (weddingDate) {
    items.push({ kind: "wedding", id: "wedding", date: new Date(weddingDate), color: "#E11D48", title: "Jour J" })
  }
  return items
}

export function itemsByDay(items: CalItem[]) {
  const map = new Map<string, CalItem[]>()
  for (const it of items) {
    const k = fmtDayKey(it.date)
    const arr = map.get(k) ?? []
    arr.push(it)
    map.set(k, arr)
  }
  for (const arr of map.values()) arr.sort((a, b) => a.date.getTime() - b.date.getTime())
  return map
}

/* =========================================================
 * HEADER
 * ========================================================= */
export function CalendarHeader({
  view, cursor, coupleLabel, jMinus,
  onPrev, onNext, onToday, onView, onNew,
}: {
  view: View; cursor: Date; coupleLabel: string; jMinus: number | null
  onPrev: () => void; onNext: () => void; onToday: () => void
  onView: (v: View) => void; onNew: () => void
}) {
  let title = ""
  if (view === "month") title = `${MONTHS_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`
  else if (view === "week") {
    const s = startOfWeek(cursor), e = addDays(s, 6)
    title = `${s.getDate()} ${MONTHS_LONG[s.getMonth()].slice(0,4)}. · ${e.getDate()} ${MONTHS_LONG[e.getMonth()].slice(0,4)}. ${e.getFullYear()}`
  } else {
    title = `${DAYS_LONG[(cursor.getDay()+6)%7]} ${cursor.getDate()} ${MONTHS_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`
  }

  return (
    <div style={{
      padding: "18px 24px 14px",
      borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
      background: "var(--dash-surface,#fff)",
      display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
    }} className="clone-surface">
      {/* left: title + subtitle */}
      <div style={{ flex: "1 1 240px", minWidth: 0 }}>
        <h1 style={{
          margin: 0, fontSize: 15, fontWeight: 700,
          color: "var(--dash-text,#121317)", lineHeight: 1.2,
        }}>
          Planning{coupleLabel ? <span style={{ color: "var(--dash-text-3,#9a9aaa)", fontWeight: 500 }}> · {coupleLabel}</span> : null}
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", fontWeight: 500 }}>{title}</span>
          {typeof jMinus === "number" && jMinus >= 0 && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999,
              background: G, color: "#fff", letterSpacing: "0.04em",
            }}>J-{jMinus}</span>
          )}
        </div>
      </div>

      {/* center: date nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <NavBtn onClick={onPrev} icon="chevron_left" />
        <button onClick={onToday} style={navBtnStyle()}>Aujourd&apos;hui</button>
        <NavBtn onClick={onNext} icon="chevron_right" />
      </div>

      {/* right: view switcher + new */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          display: "inline-flex", padding: 3, borderRadius: 999,
          background: "var(--dash-faint-2,rgba(183,191,217,0.15))",
        }}>
          {(["month","week","day"] as View[]).map(v => (
            <button key={v} onClick={() => onView(v)} style={{
              padding: "7px 14px", border: "none", borderRadius: 999,
              background: view === v ? "var(--dash-surface,#fff)" : "transparent",
              color: view === v ? "var(--dash-text,#121317)" : "var(--dash-text-2,#6a6a71)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
            }}>
              {v === "month" ? "Mois" : v === "week" ? "Semaine" : "Jour"}
            </button>
          ))}
        </div>
        <button onClick={onNew} style={{
          padding: "9px 16px", borderRadius: 999, border: "none",
          background: G, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
        }}>
          <span style={iconStyle(15)}>add</span>Nouveau
        </button>
      </div>
    </div>
  )
}
function NavBtn({ onClick, icon }: { onClick: () => void; icon: string }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
      background: "var(--dash-surface,#fff)", cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={iconStyle(18, "var(--dash-text-2,#6a6a71)")}>{icon}</span>
    </button>
  )
}
function navBtnStyle(): React.CSSProperties {
  return {
    height: 34, padding: "0 14px", borderRadius: 999,
    border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
    background: "var(--dash-surface,#fff)", cursor: "pointer",
    color: "var(--dash-text,#121317)", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
  }
}
function iconStyle(size = 16, color = "currentColor"): React.CSSProperties {
  return {
    fontFamily: "'Google Symbols','Material Symbols Outlined'",
    fontSize: size, fontWeight: "normal", lineHeight: 1, color, userSelect: "none",
  }
}

/* =========================================================
 * MONTH VIEW
 * ========================================================= */
export function CalendarMonth({
  cursor, items, weddingDate, onDayClick, onItemClick,
}: {
  cursor: Date; items: CalItem[]; weddingDate: string | null
  onDayClick: (d: Date) => void
  onItemClick: (it: CalItem) => void
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const firstOfMonth = startOfMonth(cursor)
  const gridStart = startOfWeek(firstOfMonth)
  const weeks = 6
  const totalDays = weeks * 7
  const byDay = useMemo(() => itemsByDay(items), [items])
  const weddingISO = weddingDate ? new Date(weddingDate) : null

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--dash-bg,#f7f7fb)" }}>
      {/* weekday header */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7,1fr)",
        borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
        background: "var(--dash-surface,#fff)",
      }} className="clone-surface">
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => (
          <div key={d} style={{
            padding: "10px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>

      {/* grid */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gridTemplateRows: `repeat(${weeks},minmax(90px,1fr))`,
        gap: 1, background: "var(--dash-border,rgba(183,191,217,0.12))",
      }}>
        {Array.from({ length: totalDays }, (_, i) => {
          const d = addDays(gridStart, i)
          const inMonth = d.getMonth() === cursor.getMonth()
          const isToday  = sameDay(d, today)
          const isWedding = !!(weddingISO && sameDay(d, weddingISO))
          const list = byDay.get(fmtDayKey(d)) ?? []
          const visible = list.slice(0, 3)
          const more = list.length - visible.length

          return (
            <button
              key={i}
              onClick={() => onDayClick(d)}
              style={{
                position: "relative", padding: 8, minHeight: 90, textAlign: "left", cursor: "pointer",
                background: isWedding
                  ? "linear-gradient(135deg, rgba(225,29,72,0.10), rgba(147,51,234,0.10))"
                  : "var(--dash-surface,#fff)",
                opacity: inMonth ? 1 : 0.45,
                border: "none", borderRadius: 0, fontFamily: "inherit",
                display: "flex", flexDirection: "column", gap: 4,
              }}
              className="clone-surface"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 800 : 500,
                  color: isToday ? "#fff" : "var(--dash-text,#121317)",
                  width: 24, height: 24, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? G : "transparent",
                }}>{d.getDate()}</span>
                {isWedding && (
                  <span style={iconStyle(14, "#E11D48")}>star</span>
                )}
              </div>

              {isWedding && (
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                  padding: "2px 6px", borderRadius: 999,
                  background: G, color: "#fff", alignSelf: "flex-start",
                }}>JOUR J</span>
              )}

              {visible.map(it => (
                <span key={it.kind + it.id} onClick={(e) => { e.stopPropagation(); onItemClick(it) }} style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 6px",
                  borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 5,
                  color: "var(--dash-text,#121317)", background: "var(--dash-faint,rgba(183,191,217,0.1))",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  borderLeft: `3px solid ${it.color}`,
                }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</span>
                </span>
              ))}
              {more > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)" }}>
                  +{more} autre{more > 1 ? "s" : ""}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================
 * WEEK VIEW
 * ========================================================= */
export function CalendarWeek({
  cursor, items, weddingDate, onDayClick, onItemClick,
}: {
  cursor: Date; items: CalItem[]; weddingDate: string | null
  onDayClick: (d: Date) => void; onItemClick: (it: CalItem) => void
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const s = startOfWeek(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(s, i))
  const byDay = itemsByDay(items)
  const weddingISO = weddingDate ? new Date(weddingDate) : null

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "auto", background: "var(--dash-bg,#f7f7fb)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "60px repeat(7,1fr)",
        borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
        background: "var(--dash-surface,#fff)", position: "sticky", top: 0, zIndex: 2,
      }} className="clone-surface">
        <div />
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          const isWedding = !!(weddingISO && sameDay(d, weddingISO))
          return (
            <button key={i} onClick={() => onDayClick(d)} style={{
              padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer",
              textAlign: "left", fontFamily: "inherit",
              borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase" }}>
                {DAYS_LONG[(d.getDay()+6)%7].slice(0,3)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: isToday ? 800 : 600,
                  background: isToday ? G : "transparent",
                  color: isToday ? "#fff" : "var(--dash-text,#121317)",
                }}>{d.getDate()}</span>
                {isWedding && <span style={iconStyle(14, "#E11D48")}>star</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* all-day row */}
      <div style={{
        display: "grid", gridTemplateColumns: "60px repeat(7,1fr)",
        borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
        minHeight: 48, background: "var(--dash-surface,#fff)",
      }} className="clone-surface">
        <div style={{ padding: "8px 8px", fontSize: 9, fontWeight: 700, color: "var(--dash-text-3,#9a9aaa)", letterSpacing: "0.08em" }}>TTE JOUR</div>
        {days.map((d, i) => {
          const list = byDay.get(fmtDayKey(d)) ?? []
          return (
            <div key={i} style={{
              padding: 6, borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
              display: "flex", flexDirection: "column", gap: 3,
            }}>
              {list.map(it => (
                <button key={it.kind + it.id} onClick={() => onItemClick(it)} style={{
                  fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 4,
                  border: "none", borderLeft: `3px solid ${it.color}`,
                  background: "var(--dash-faint,rgba(183,191,217,0.1))",
                  color: "var(--dash-text,#121317)", cursor: "pointer",
                  textAlign: "left", fontFamily: "inherit",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{it.title}</button>
              ))}
            </div>
          )
        })}
      </div>

      {/* hours grid (informational — events are all-day since model lacks time) */}
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7,1fr)", flex: 1 }}>
        {HOURS.map(h => (
          <div key={`label-${h}`} style={{
            gridColumn: 1, borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.08))",
            padding: "4px 8px", fontSize: 10, color: "var(--dash-text-3,#9a9aaa)",
            height: 40, background: "var(--dash-bg,#f7f7fb)",
          }}>{String(h).padStart(2,"0")}:00</div>
        ))}
        {HOURS.map(h => days.map((_, di) => (
          <div key={`cell-${h}-${di}`} style={{
            borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.08))",
            borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.08))",
            height: 40, background: "var(--dash-surface,#fff)",
          }} className="clone-surface" />
        )))}
      </div>
    </div>
  )
}

/* =========================================================
 * DAY VIEW
 * ========================================================= */
export function CalendarDay({
  cursor, items, onItemClick, onNewForDay,
}: {
  cursor: Date; items: CalItem[]
  onItemClick: (it: CalItem) => void
  onNewForDay: (d: Date) => void
}) {
  const byDay = itemsByDay(items)
  const list = byDay.get(fmtDayKey(cursor)) ?? []
  const steps = list.filter(i => i.kind === "step")
  const events = list.filter(i => i.kind === "event")
  const wedding = list.find(i => i.kind === "wedding")

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 24, background: "var(--dash-bg,#f7f7fb)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {wedding && (
          <div style={{
            padding: "18px 22px", borderRadius: 16,
            background: G, color: "#fff",
            display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 30px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)",
          }}>
            <span style={iconStyle(28, "#fff")}>favorite</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.9 }}>JOUR J</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Le grand jour</div>
            </div>
          </div>
        )}

        <Section title="Rendez-vous" count={events.length}>
          {events.length === 0 ? <Empty label="Aucun rendez-vous" /> :
            events.map(it => <DayListRow key={it.id} item={it} onClick={() => onItemClick(it)} />)}
        </Section>

        <Section title="Étapes" count={steps.length}>
          {steps.length === 0 ? <Empty label="Aucune étape due ce jour" /> :
            steps.map(it => <DayListRow key={it.id} item={it} onClick={() => onItemClick(it)} />)}
        </Section>

        <button onClick={() => onNewForDay(cursor)} style={{
          padding: "14px 18px", borderRadius: 12, border: "1px dashed var(--dash-border,rgba(183,191,217,0.4))",
          background: "transparent", color: "var(--dash-text-2,#6a6a71)", cursor: "pointer",
          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <span style={iconStyle(16)}>add</span>Ajouter à ce jour
        </button>
      </div>
    </div>
  )
}
function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "var(--dash-text-2,#6a6a71)", textTransform: "uppercase", margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>{count}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  )
}
function Empty({ label }: { label: string }) {
  return <div style={{ padding: 14, fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", fontStyle: "italic" }}>{label}</div>
}
/* =========================================================
 * SKELETON (shown while planner loads)
 * ========================================================= */
export function CalendarSkeleton({ view }: { view: View }) {
  if (view === "day") {
    return (
      <div style={{ flex: 1, overflow: "auto", padding: 24, background: "var(--dash-bg,#f7f7fb)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} className="plnr-skel" style={{
              height: 64, borderRadius: 12, background: "var(--dash-faint-2,rgba(183,191,217,0.12))",
            }} />
          ))}
        </div>
        <style>{skelCSS}</style>
      </div>
    )
  }
  if (view === "week") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--dash-bg,#f7f7fb)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "60px repeat(7,1fr)", gap: 1,
          background: "var(--dash-border,rgba(183,191,217,0.12))",
        }}>
          <div style={{ background: "var(--dash-surface,#fff)" }} />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ background: "var(--dash-surface,#fff)", padding: 12 }}>
              <div className="plnr-skel" style={{ height: 10, width: "40%", borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", marginBottom: 6 }} />
              <div className="plnr-skel" style={{ height: 20, width: 26, borderRadius: 99, background: "var(--dash-faint-2,rgba(183,191,217,0.15))" }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "60px repeat(7,1fr)", gap: 1, background: "var(--dash-border,rgba(183,191,217,0.08))" }}>
          {Array.from({ length: 8 * 8 }).map((_, i) => (
            <div key={i} style={{ background: "var(--dash-surface,#fff)", minHeight: 50 }} />
          ))}
        </div>
        <style>{skelCSS}</style>
      </div>
    )
  }
  // month
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--dash-bg,#f7f7fb)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7,1fr)",
        borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
        background: "var(--dash-surface,#fff)",
      }} className="clone-surface">
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => (
          <div key={d} style={{
            padding: "10px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)",
        gridTemplateRows: "repeat(6,minmax(90px,1fr))",
        gap: 1, background: "var(--dash-border,rgba(183,191,217,0.12))",
      }}>
        {Array.from({ length: 42 }).map((_, i) => {
          const filledCount = (i * 37) % 4 // pseudo-random 0..3 pills per cell
          return (
            <div key={i} style={{
              padding: 8, background: "var(--dash-surface,#fff)",
              display: "flex", flexDirection: "column", gap: 4,
            }} className="clone-surface">
              <div className="plnr-skel" style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--dash-faint-2,rgba(183,191,217,0.18))",
                animationDelay: `${(i % 7) * 0.05}s`,
              }} />
              {Array.from({ length: filledCount }).map((_, j) => (
                <div key={j} className="plnr-skel" style={{
                  height: 14, borderRadius: 4,
                  background: "var(--dash-faint-2,rgba(183,191,217,0.12))",
                  width: `${60 + ((i + j) * 13) % 30}%`,
                  animationDelay: `${((i + j) % 7) * 0.07}s`,
                }} />
              ))}
            </div>
          )
        })}
      </div>
      <style>{skelCSS}</style>
    </div>
  )
}
const skelCSS = `
@keyframes plnrPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
.plnr-skel { animation: plnrPulse 1.4s ease-in-out infinite; }
`

function DayListRow({ item, onClick }: { item: CalItem; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "12px 14px", borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
      background: "var(--dash-surface,#fff)", cursor: "pointer",
      textAlign: "left", fontFamily: "inherit",
      display: "flex", alignItems: "center", gap: 12,
    }} className="clone-surface">
      <span style={{ width: 8, height: 40, borderRadius: 4, background: item.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{item.title}</div>
        {item.kind === "step" && (item.ref.vendors?.length ?? 0) > 0 && (
          <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 2 }}>
            {item.ref.vendors.length} prestataire{item.ref.vendors.length > 1 ? "s" : ""} lié{item.ref.vendors.length > 1 ? "s" : ""}
          </div>
        )}
        {item.kind === "event" && (
          <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 2 }}>
            {item.ref.type === "appointment" ? "Rendez-vous" : item.ref.type === "reminder" ? "Rappel" : "Tâche"}
          </div>
        )}
      </div>
      <span style={iconStyle(16, "var(--dash-text-3,#9a9aaa)")}>chevron_right</span>
    </button>
  )
}
