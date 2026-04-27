import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"
import { buildDashboardData, type DashboardData } from "@/lib/dashboardData"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/dashboard")
  const userId = session.user.id

  const [planners, user] = await Promise.all([
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
    initialDashboardData = await buildDashboardData(initialActivePlannerId, userId)
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
