"use client"
import { useEffect, useState } from "react"
import { useSessionUser } from "@/components/SessionProvider"
import type { UserPlan } from "@/lib/planGate"

type PlanData = { plan: UserPlan; planExpiresAt: string | null } | null

// Module-level cache — partagé entre toutes les instances du hook (toutes pages)
let _cache: PlanData = null
let _cacheTs = 0
let _cacheUserId: string | null = null
const CACHE_TTL = 30_000 // 30 secondes — aligné sur usePlanners

export function invalidatePlanCache() {
  _cache = null
  _cacheTs = 0
  _cacheUserId = null
}

// DEV bypass — en local on est toujours "max" pour bosser sans paywall
const DEV_BYPASS = process.env.NODE_ENV === "development"

export function usePlan(): { plan: UserPlan; loading: boolean; refresh: () => void } {
  const user = useSessionUser()
  const userId = user?.id ?? null

  if (DEV_BYPASS) {
    return { plan: "max", loading: false, refresh: () => {} }
  }

  const cacheValid =
    _cache !== null &&
    _cacheUserId === userId &&
    Date.now() - _cacheTs < CACHE_TTL

  const [data, setData] = useState<PlanData>(cacheValid ? _cache : null)
  const [loading, setLoading] = useState(!cacheValid && !!user)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setData(null)
      setLoading(false)
      _cache = null
      _cacheUserId = null
      return
    }

    // Cache valide pour ce user → pas de fetch
    const stillValid =
      _cache !== null &&
      _cacheUserId === user.id &&
      Date.now() - _cacheTs < CACHE_TTL
    if (stillValid && tick === 0) {
      setData(_cache)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetch("/api/user/plan")
      .then(r => (r.ok ? r.json() : null))
      .then((d: PlanData) => {
        if (cancelled) return
        _cache = d
        _cacheTs = Date.now()
        _cacheUserId = user.id
        setData(d)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick, user])

  return {
    plan: (data?.plan ?? "free") as UserPlan,
    loading,
    refresh: () => {
      _cache = null
      _cacheTs = 0
      setTick(t => t + 1)
    },
  }
}
