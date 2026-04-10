import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

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

  // WR-02: Validate title
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : ""
  if (!title) return Response.json({ error: "title requis." }, { status: 400 })

  let date: Date
  try { date = parseDate(body.date) } catch {
    return Response.json({ error: "Date invalide." }, { status: 400 })
  }

  // WR-04: Validate color against hex pattern
  const color = typeof body.color === "string" && HEX_COLOR.test(body.color)
    ? body.color : "#f9a8d4"

  // W08: validate type against known enum values
  const VALID_TYPES = ["task", "reminder", "appointment"]
  const type = typeof body.type === "string" && VALID_TYPES.includes(body.type) ? body.type : "task"

  const event = await prisma.plannerEvent.create({
    data: {
      title,
      date,
      endDate: parseDateOpt(body.endDate),
      type,
      color,
      plannerId,
    },
  })
  return Response.json(event, { status: 201 })
}
