import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import PlannerClient, { type PlannerDetail } from "./PlannerClient"

export const dynamic = "force-dynamic"

async function getInitialDetail(userId: string): Promise<PlannerDetail | null> {
  // Match usePlanners order (createdAt desc in prod) so the SSR payload = activeEventId chosen client-side
  const planner = await prisma.planner.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      steps: {
        include: {
          vendors: {
            include: {
              vendor: { select: { id: true, name: true, slug: true, category: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
      events: { orderBy: { date: "asc" } },
    },
  })
  if (!planner) return null
  // RSC boundary: serialize Dates → strings
  return JSON.parse(JSON.stringify(planner)) as PlannerDetail
}

export default async function PlannerPage() {
  const session = await auth()
  const initialDetail = session?.user?.id ? await getInitialDetail(session.user.id) : null
  return <PlannerClient initialDetail={initialDetail} />
}
