import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BudgetItemPatchSchema } from "@/lib/validations"
import { getUserId } from "@/lib/api-auth"

/**
 * Helper IDOR : vérifie que le user owns le planner ET que l'item appartient au planner.
 * Retourne null si OK, sinon une NextResponse d'erreur.
 */
async function checkOwnership(plannerId: string, itemId: string, userId: string) {
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  if (!planner || planner.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const item = await prisma.budgetItem.findUnique({
    where: { id: itemId },
    select: { plannerId: true },
  })
  if (!item || item.plannerId !== plannerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return null
}

/**
 * PATCH /api/planners/[id]/budget-items/[itemId]
 * Update partial d'un budget item. IDOR check planner.userId + item.plannerId.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: plannerId, itemId } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ownershipError = await checkOwnership(plannerId, itemId, userId)
  if (ownershipError) return ownershipError

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = BudgetItemPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })
  }

  const updated = await prisma.budgetItem.update({
    where: { id: itemId },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/planners/[id]/budget-items/[itemId]
 * Supprime un budget item. IDOR check planner.userId + item.plannerId.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: plannerId, itemId } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ownershipError = await checkOwnership(plannerId, itemId, userId)
  if (ownershipError) return ownershipError

  await prisma.budgetItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}
