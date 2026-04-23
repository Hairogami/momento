import { Suspense } from "react"
import type { Metadata } from "next"
import { getCurrentPlan } from "@/lib/requirePro"
import UpgradeClient from "./UpgradeClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Passer Pro — Momento",
  description:
    "Débloquez la messagerie prestas, la checklist temporelle, la gestion invités et tous les outils Momento Pro à partir de 200 MAD / mois.",
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reason?: string }>
}) {
  const sp = await searchParams
  const { plan, planExpiresAt } = await getCurrentPlan()

  return (
    <Suspense fallback={null}>
      <UpgradeClient
        currentPlan={plan}
        planExpiresAt={planExpiresAt ? planExpiresAt.toISOString() : null}
        from={sp.from ?? null}
        reason={sp.reason ?? null}
      />
    </Suspense>
  )
}
