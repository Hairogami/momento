import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

function parseDate(val: unknown): Date {
  if (typeof val !== "string" || !val) throw new Error("Date invalide.")
  const d = new Date(val)
  if (isNaN(d.getTime())) throw new Error("Date invalide.")
  return d
}

function parseDateOpt(val: unknown): Date | null {
  if (!val) return null
  try { return parseDate(val) } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: plannerId } = await params
  const ownership = await prisma.planner.findUnique({ where: { id: plannerId }, select: { userId: true } })
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  let date: Date
  try { date = parseDate(body.date) } catch {
    return Response.json({ error: "Date invalide." }, { status: 400 })
  }

  const event = await prisma.plannerEvent.create({
    data: {
      title: body.title,
      date,
      endDate: parseDateOpt(body.endDate),
      type: body.type || "task",
      color: body.color || "#f9a8d4",
      plannerId,
    },
  })
  return Response.json(event, { status: 201 })
}
