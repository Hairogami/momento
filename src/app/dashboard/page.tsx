import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/dashboard")

  const [planners, user] = await Promise.all([
    prisma.planner.findMany({
      where: { userId: session.user.id, trashedAt: null },
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
      where: { id: session.user.id },
      select: { name: true },
    }),
  ])

  const initialPlanners = planners.map(p => ({
    ...p,
    weddingDate: p.weddingDate?.toISOString() ?? null,
  }))

  const firstName = user?.name?.split(" ")[0] ?? ""

  return <DashboardClient initialPlanners={initialPlanners} firstName={firstName} />
}
