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

// Module-level cache — partagé entre toutes les instances du hook
let _cache: SidebarEvent[] | null = null
let _cacheTs = 0
const CACHE_TTL = 30_000 // 30 secondes

export function invalidatePlannerCache() {
  _cache = null
  _cacheTs = 0
}

export function usePlanners() {
  const [events, setEvents] = useState<SidebarEvent[]>(_cache ?? [])
  const [activeEventId, setActiveEventId] = useState(() => {
    if (_cache && _cache.length > 0) {
      let saved = ""
      try { saved = localStorage.getItem("momento_active_event") ?? "" } catch {}
      return _cache.find(e => e.id === saved)?.id ?? _cache[0].id
    }
    return ""
  })
  const [loading, setLoading] = useState(_cache === null)

  useEffect(() => {
    const now = Date.now()
    if (_cache && now - _cacheTs < CACHE_TTL) {
      // Cache valide — pas de fetch
      setEvents(_cache)
      if (_cache.length > 0 && !activeEventId) {
        let saved = ""
        try { saved = localStorage.getItem("momento_active_event") ?? "" } catch {}
        setActiveEventId(_cache.find(e => e.id === saved)?.id ?? _cache[0].id)
      }
      setLoading(false)
      return
    }

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
        _cache = mapped
        _cacheTs = Date.now()
        setEvents(mapped)
        if (mapped.length > 0) {
          let saved = ""
          try { saved = localStorage.getItem("momento_active_event") ?? "" } catch {}
          const restoredId = mapped.find(e => e.id === saved)?.id ?? mapped[0].id
          setActiveEventId(prev => prev || restoredId)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { events, activeEventId, setActiveEventId, loading }
}
