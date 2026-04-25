import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/adminAudit"

/**
 * POST /api/admin/users/[id]/eject
 *
 * Best-effort logout :
 *   1. Supprime toutes les rows Session du user (si Auth.js DB strategy)
 *   2. Supprime toutes les rows Account OAuth (force re-OAuth la prochaine fois)
 *
 * ⚠️ Limitation : on est en strategy JWT (lib/auth.ts), donc le JWT credentials
 * reste valide jusqu'à expiration sans rotation d'AUTH_SECRET. Pour un eject
 * vraiment instantané il faut ajouter un champ `tokenVersion` sur User et
 * checker dans le JWT callback. À implémenter si besoin opérationnel.
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
  if (id === me.id) {
    return NextResponse.json({ error: "Impossible de s'éjecter soi-même." }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } })
  if (!target) return NextResponse.json({ error: "User introuvable." }, { status: 404 })

  const [sessions, accounts] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: target.id } }),
    prisma.account.deleteMany({ where: { userId: target.id } }),
  ])

  await logAdminAction({
    adminId:    me.id,
    adminEmail: me.email,
    action:     "user.eject",
    targetType: "User",
    targetId:   target.id,
    changes:    {
      sessionsDeleted: { from: null, to: sessions.count },
      accountsDeleted: { from: null, to: accounts.count },
    },
  })

  return NextResponse.json({
    ok: true,
    sessionsDeleted: sessions.count,
    accountsDeleted: accounts.count,
    note: "Sessions DB + Accounts OAuth supprimés. Les JWT credentials existants restent valides jusqu'à expiration.",
  })
}
