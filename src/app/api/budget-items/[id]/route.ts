import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BudgetItemPatchSchema } from "@/lib/validations"
import { getUserId } from "@/lib/api-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = BudgetItemPatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  const item = await prisma.budgetItem.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!item || item.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.budgetItem.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}
