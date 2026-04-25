import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdminUser } from "@/lib/adminAuth"

const ALLOWED_STATUSES = new Set(["ok", "flagged", "banned"])

/**
 * POST /api/admin/event-sites/[id]/mod-status
 * Body: { status: "ok" | "flagged" | "banned" }
 *
 * Admin-only — permet de modérer un site événement (bannir / flag) sans toucher la DB.
 * Un site avec modStatus !== "ok" est invisible côté public (page /evt/[slug] retourne 404).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isAdmin = await isAdminUser(session.user.id)
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const status = (body as Record<string, unknown>)?.status
  if (typeof status !== "string" || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "status doit être ok | flagged | banned." }, { status: 400 })
  }

  const site = await prisma.eventSite.findUnique({ where: { id }, select: { id: true } })
  if (!site) return NextResponse.json({ error: "Site introuvable." }, { status: 404 })

  await prisma.eventSite.update({
    where: { id },
    data: { modStatus: status },
  })

  return NextResponse.json({ ok: true, id, modStatus: status })
}
