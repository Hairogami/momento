"use client"
import { useState, useEffect } from "react"

export type SidebarEvent = {
  id: string
  name: string
  date: string
  color: string
}

type RawPlanner = {
  id: string
  title: string
  weddingDate?: string | null
  coverColor?: string | null
}

export function usePlanners() {
  const [events, setEvents] = useState<SidebarEvent[]>([])
  const [activeEventId, setActiveEventId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/planners")
      .then(r => r.ok ? r.json() : [])
      .then((planners: RawPlanner[]) => {
        if (!Array.isArray(planners)) return
        const mapped = planners.map(p => ({
          id:    p.id,
          name:  p.title,
          date:  p.weddingDate ?? "",
          color: p.coverColor  ?? "#E11D48",
        }))
        setEvents(mapped)
        if (mapped.length > 0) {
          // Restaurer l'event sélectionné depuis localStorage si valide
          let saved = ""
          try { saved = localStorage.getItem("momento_active_event") ?? "" } catch {}
          const restoredId = mapped.find(e => e.id === saved)?.id ?? mapped[0].id
          setActiveEventId(restoredId)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { events, activeEventId, setActiveEventId, loading }
}
