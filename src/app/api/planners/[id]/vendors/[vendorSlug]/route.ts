import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const VALID_STATUSES = ["contacted", "replied", "confirmed"] as const

async function assertOwnership(plannerId: string, userId: string) {
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  return planner?.userId === userId
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vendorSlug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id, vendorSlug } = await params
  if (!await assertOwnership(id, session.user.id)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }

  const data: { status?: string; notes?: string } = {}

  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return Response.json({ error: `status doit être : ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }
    data.status = body.status
  }

  if (typeof body.notes === "string") {
    data.notes = body.notes.slice(0, 1000)
  }

  const plannerVendor = await prisma.plannerVendor.update({
    where: { plannerId_vendorSlug: { plannerId: id, vendorSlug } },
    data,
  })

  return Response.json(plannerVendor)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; vendorSlug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id, vendorSlug } = await params
  if (!await assertOwnership(id, session.user.id)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.plannerVendor.delete({
    where: { plannerId_vendorSlug: { plannerId: id, vendorSlug } },
  })

  return new Response(null, { status: 204 })
}
