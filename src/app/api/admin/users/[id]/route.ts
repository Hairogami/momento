import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction, diffFields } from "@/lib/adminAudit"

const PatchSchema = z.object({
  role:           z.enum(["client", "vendor", "admin"]).optional(),
  plan:           z.enum(["free", "pro"]).optional(),
  planExpiresAt:  z.string().datetime().nullable().optional(),
  marketingOptIn: z.boolean().optional(),
  // Action shortcut : suspend = downgrade plan + reset planExpiresAt
  action:         z.enum(["suspend"]).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const before = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, plan: true, planExpiresAt: true, marketingOptIn: true },
  })
  if (!before) return NextResponse.json({ error: "User introuvable." }, { status: 404 })

  // Self-protection : un admin ne peut pas se rétrograder/se suspendre lui-même
  if (before.id === me.id) {
    if (parsed.data.role && parsed.data.role !== "admin") {
      return NextResponse.json({ error: "Impossible de rétrograder son propre compte admin." }, { status: 400 })
    }
    if (parsed.data.action === "suspend") {
      return NextResponse.json({ error: "Impossible de se suspendre soi-même." }, { status: 400 })
    }
  }

  const data: {
    role?: string
    plan?: string
    planExpiresAt?: Date | null
    marketingOptIn?: boolean
  } = {}

  if (parsed.data.action === "suspend") {
    data.plan = "free"
    data.planExpiresAt = null
  } else {
    if (parsed.data.role           !== undefined) data.role           = parsed.data.role
    if (parsed.data.plan           !== undefined) data.plan           = parsed.data.plan
    if (parsed.data.planExpiresAt  !== undefined) data.planExpiresAt  = parsed.data.planExpiresAt ? new Date(parsed.data.planExpiresAt) : null
    if (parsed.data.marketingOptIn !== undefined) data.marketingOptIn = parsed.data.marketingOptIn
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun changement." }, { status: 400 })
  }

  const after = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, plan: true, planExpiresAt: true, marketingOptIn: true },
  })

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     parsed.data.action === "suspend" ? "user.suspend" : "user.update",
    targetType: "User",
    targetId:   id,
    changes:    diffFields(before, after),
  })

  return NextResponse.json({ user: after })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  if (id === me.id) {
    return NextResponse.json({ error: "Impossible de supprimer son propre compte." }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true } })
  if (!target) return NextResponse.json({ error: "User introuvable." }, { status: 404 })

  await prisma.user.delete({ where: { id } })

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "user.delete",
    targetType: "User",
    targetId:   id,
    changes:    { email: { from: target.email, to: null } },
  })

  return NextResponse.json({ ok: true })
}
