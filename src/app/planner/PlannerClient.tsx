"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import {
  CalendarHeader, CalendarMonth, CalendarWeek, CalendarDay, CalendarSkeleton,
  buildItems,
  type View, type Step, type PlannerEvent, type CalItem,
} from "@/components/clone/planner/Calendar"
import { DayDrawer } from "@/components/clone/planner/DayDrawer"

export type PlannerDetail = {
  id: string
  title: string
  coupleNames: string | null
  weddingDate: string | null
  steps: Step[]
  events: PlannerEvent[]
}

export default function PlannerClient({ initialDetail }: { initialDetail: PlannerDetail | null }) {
  const { events: sidebarEvents, activeEventId, setActiveEventId, loading: loadingList } = usePlanners()
  const [detail, setDetail]         = useState<PlannerDetail | null>(initialDetail)
  const [loading, setLoading]       = useState(false)
  const [view, setView]             = useState<View>("month")
  const [cursor, setCursor]         = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [drawerDate, setDrawerDate] = useState<Date | null>(null)
  const [drawerFocus, setDrawerFocus] = useState<string | null>(null)
  const initialIdRef = useRef<string | null>(initialDetail?.id ?? null)

  const loadPlanner = useCallback(async (id: string, reset = false) => {
    if (!id) return
    setLoading(true)
    if (reset) setDetail(null)
    try {
      const r = await fetch(`/api/planners/${id}`, { cache: "no-store" })
      if (r.ok) setDetail(await r.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!activeEventId) return
    // Skip the fetch if the SSR payload already matches the active planner
    if (activeEventId === initialIdRef.current) {
      initialIdRef.current = null
      return
    }
    loadPlanner(activeEventId, true)
  }, [activeEventId, loadPlanner])

  // Center cursor on weddingDate when planner loads
  useEffect(() => {
    if (detail?.weddingDate) {
      const w = new Date(detail.weddingDate)
      const now = new Date()
      if (w.getTime() - now.getTime() > 30 * 86_400_000) {
        setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
      }
    }
  }, [detail?.weddingDate])

  const items = useMemo<CalItem[]>(
    () => buildItems(detail?.steps ?? [], detail?.events ?? [], detail?.weddingDate ?? null),
    [detail]
  )

  const jMinus = useMemo(() => {
    if (!detail?.weddingDate) return null
    const diff = new Date(detail.weddingDate).getTime() - Date.now()
    return Math.ceil(diff / 86_400_000)
  }, [detail?.weddingDate])

  /* nav handlers */
  function navPrev() {
    setCursor(c => {
      const d = new Date(c)
      if (view === "month") d.setMonth(d.getMonth() - 1)
      else if (view === "week") d.setDate(d.getDate() - 7)
      else d.setDate(d.getDate() - 1)
      return d
    })
  }
  function navNext() {
    setCursor(c => {
      const d = new Date(c)
      if (view === "month") d.setMonth(d.getMonth() + 1)
      else if (view === "week") d.setDate(d.getDate() + 7)
      else d.setDate(d.getDate() + 1)
      return d
    })
  }
  function navToday() { const d = new Date(); d.setHours(0,0,0,0); setCursor(d) }

  function openDay(d: Date, focusId: string | null = null) {
    setDrawerDate(d); setDrawerFocus(focusId)
  }
  function openItem(it: CalItem) { openDay(it.date, it.kind === "wedding" ? null : it.id) }

  /* keyboard shortcuts */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (drawerDate) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "ArrowLeft") navPrev()
      else if (e.key === "ArrowRight") navNext()
      else if (e.key === "t" || e.key === "T") navToday()
      else if (e.key === "m" || e.key === "M") setView("month")
      else if (e.key === "s" || e.key === "S") setView("week")
      else if (e.key === "j" || e.key === "J") setView("day")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerDate, view])

  const coupleLabel = detail?.coupleNames || detail?.title || ""

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={sidebarEvents} activeEventId={activeEventId} onEventChange={setActiveEventId} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
        <CalendarHeader
          view={view}
          cursor={cursor}
          coupleLabel={coupleLabel}
          jMinus={jMinus}
          onPrev={navPrev}
          onNext={navNext}
          onToday={navToday}
          onView={setView}
          onNew={() => openDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))}
        />

        {(!detail && (loadingList || loading || activeEventId)) ? (
          <CalendarSkeleton view={view} />
        ) : !detail ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ textAlign: "center", maxWidth: 360 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)", marginBottom: 6 }}>
                Aucun événement
              </div>
              <div style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>
                Crée un événement pour voir ton calendrier ici.
              </div>
            </div>
          </div>
        ) : view === "month" ? (
          <CalendarMonth
            cursor={cursor}
            items={items}
            weddingDate={detail.weddingDate}
            onDayClick={(d) => openDay(d)}
            onItemClick={openItem}
          />
        ) : view === "week" ? (
          <CalendarWeek
            cursor={cursor}
            items={items}
            weddingDate={detail.weddingDate}
            onDayClick={(d) => openDay(d)}
            onItemClick={openItem}
          />
        ) : (
          <CalendarDay
            cursor={cursor}
            items={items}
            onItemClick={openItem}
            onNewForDay={(d) => openDay(d)}
          />
        )}
      </main>

      {detail && (
        <DayDrawer
          open={drawerDate !== null}
          date={drawerDate}
          items={items}
          focusId={drawerFocus}
          plannerId={detail.id}
          onClose={() => { setDrawerDate(null); setDrawerFocus(null) }}
          onRefresh={() => { if (activeEventId) loadPlanner(activeEventId) }}
        />
      )}
    </div>
  )
}
