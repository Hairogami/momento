import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { logAdminAction } from "@/lib/adminAudit"
import { captureError } from "@/lib/observability"

/**
 * POST /api/admin/users/[id]/reset-password
 * Génère un token de reset (1h) et envoie l'email standard. Audit-logged.
 */
export async function POST(
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
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, firstName: true },
  })
  if (!target) return NextResponse.json({ error: "User introuvable." }, { status: 404 })

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

  await prisma.$transaction(async (tx) => {
    await tx.emailVerification.deleteMany({
      where: { userId: target.id, type: "password_reset" },
    })
    await tx.emailVerification.create({
      data: { token, userId: target.id, expiresAt, type: "password_reset" },
    })
  })

  try {
    await sendPasswordResetEmail({ to: target.email, firstName: target.firstName, token })
  } catch (e) {
    captureError(e, { route: "/api/admin/users/[id]/reset-password", step: "email-send" })
    return NextResponse.json({ error: "Échec envoi e-mail." }, { status: 500 })
  }

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "user.reset_password",
    targetType: "User",
    targetId:   target.id,
    changes:    { email: { from: null, to: target.email } },
  })

  return NextResponse.json({ ok: true })
}
