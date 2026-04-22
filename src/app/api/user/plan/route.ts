import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserPlan } from "@/lib/planGate"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ plan: user.plan, planExpiresAt: user.planExpiresAt })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as { plan?: UserPlan } | null
  const nextPlan = body?.plan
  if (nextPlan !== "free" && nextPlan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      plan: nextPlan,
      planExpiresAt: nextPlan === "pro" ? new Date(Date.now() + 30 * 86400_000) : null,
    },
    select: { plan: true, planExpiresAt: true },
  })
  return NextResponse.json(updated)
}
