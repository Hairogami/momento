"use client"
import { useEffect, useState } from "react"
import { useSessionUser } from "@/components/SessionProvider"
import type { UserPlan } from "@/lib/planGate"

type PlanData = { plan: UserPlan; planExpiresAt: string | null } | null

export function usePlan(): { plan: UserPlan; loading: boolean; refresh: () => void } {
  const user = useSessionUser()
  const [data, setData] = useState<PlanData>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch("/api/user/plan")
      .then(r => (r.ok ? r.json() : null))
      .then((d: PlanData) => { if (!cancelled) setData(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick, user])

  return {
    plan: (data?.plan ?? "free") as UserPlan,
    loading,
    refresh: () => setTick(t => t + 1),
  }
}
