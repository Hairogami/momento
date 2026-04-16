import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { invalidateRankingCache } from "@/lib/rankingScore"

async function assertAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  return user?.role === "admin"
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!await assertAdmin(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 })

  const configs = await prisma.rankingConfig.findMany({ orderBy: { signal: "asc" } })
  return Response.json(configs)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!await assertAdmin(session.user.id)) return Response.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const signal = typeof b.signal === "string" ? b.signal.trim() : null
  const weight = typeof b.weight === "number" ? b.weight : null

  if (!signal) return Response.json({ error: "signal requis." }, { status: 400 })
  if (weight === null || weight < 0 || weight > 1000) {
    return Response.json({ error: "weight doit être entre 0 et 1000." }, { status: 400 })
  }

  const config = await prisma.rankingConfig.upsert({
    where: { signal },
    create: { signal, weight, label: signal },
    update: { weight },
  })

  // Invalidate cache so next request picks up new weights
  invalidateRankingCache()

  return Response.json(config)
}
