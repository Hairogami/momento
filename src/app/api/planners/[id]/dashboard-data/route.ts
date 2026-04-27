import { NextRequest } from "next/server"
import { getUserId } from "@/lib/api-auth"
import { buildDashboardData } from "@/lib/dashboardData"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const data = await buildDashboardData(id, userId)
  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json(data)
}
