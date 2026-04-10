import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BudgetItemPatchSchema } from "@/lib/validations"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = BudgetItemPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })
  }

  const item = await prisma.budgetItem.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } })
  if (!item || item.workspace.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.budgetItem.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}
