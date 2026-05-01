import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BudgetItemCreateSchema } from "@/lib/validations"
import { getUserId } from "@/lib/api-auth"

/**
 * GET /api/planners/[id]/budget-items
 * Liste les budget items du planner. IDOR check via planner.userId.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  if (!planner || planner.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const items = await prisma.budgetItem.findMany({
    where: { plannerId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(items)
}

/**
 * POST /api/planners/[id]/budget-items
 * Crée un budget item dans le planner. IDOR check via planner.userId.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  if (!planner || planner.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = BudgetItemCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })
  }

  const data = parsed.data

  const item = await prisma.budgetItem.create({
    data: {
      plannerId,
      label: data.label,
      category: data.category,
      estimated: data.estimated,
      actual: data.actual ?? null,
      paid: data.paid ?? false,
      vendorId: data.vendorId ?? null,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
