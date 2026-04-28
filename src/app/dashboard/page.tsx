import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"
import { buildDashboardData, type DashboardData } from "@/lib/dashboardData"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let session
  try {
    session = await auth()
  } catch (err) {
    console.error("[dashboard/page] auth() threw, redirecting to login:", err)
    redirect("/login?next=/dashboard")
  }
  if (!session?.user?.id) redirect("/login?next=/dashboard")
  const userId = session.user.id

  let planners: Array<{
    id: string
    title: string
    coupleNames: string
    weddingDate: Date | null
    coverColor: string
    categories: string[]
  }> = []
  let user: { name: string | null } | null = null

  try {
    ;[planners, user] = await Promise.all([
      prisma.planner.findMany({
        where: { userId, trashedAt: null },
        select: {
          id: true,
          title: true,
          coupleNames: true,
          weddingDate: true,
          coverColor: true,
          categories: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ])
  } catch (err) {
    console.error("[dashboard/page] planners/user query failed, rendering empty shell:", err)
  }

  const initialPlanners = planners.map(p => ({
    ...p,
    weddingDate: p.weddingDate?.toISOString() ?? null,
  }))

  const firstName = user?.name?.split(" ")[0] ?? ""

  // Pre-fetch dashboard data for the most recent planner during SSR.
  // The client honors localStorage("momento_active_event") which can override
  // this — in that case the client-side useEffect will refetch for the
  // user's pinned planner. For a brand-new session or when the active id
  // matches the most recent planner, this eliminates the hydration flash.
  let initialDashboardData: DashboardData | null = null
  let initialActivePlannerId: string | null = null
  if (planners.length > 0) {
    initialActivePlannerId = planners[0].id
    try {
      initialDashboardData = await buildDashboardData(initialActivePlannerId, userId)
    } catch (err) {
      // RSC pre-fetch best-effort: if any sub-query throws, let the client
      // re-fetch via /api/planners/[id]/dashboard-data on mount. The dashboard
      // must never crash from this optimization.
      console.error("[dashboard/page] buildDashboardData failed, falling back to client fetch:", err)
      initialDashboardData = null
    }
  }

  return (
    <DashboardClient
      initialPlanners={initialPlanners}
      firstName={firstName}
      initialDashboardData={initialDashboardData}
      initialActivePlannerId={initialActivePlannerId}
    />
  )
}
