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

  // IDOR check : on vérifie via planner.userId (modèle moderne).
  // Fallback workspace.userId conservé pour rétrocompat des items legacy non encore migrés.
  const item = await prisma.budgetItem.findUnique({
    where: { id },
    select: {
      planner: { select: { userId: true } },
      workspace: { select: { userId: true } },
    },
  })
  const ownerId = item?.planner?.userId ?? item?.workspace?.userId
  if (!item || ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.budgetItem.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}
