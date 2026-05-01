import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { isAdminEmail } from "@/lib/adminConstants"

export async function POST(req: Request) {
  const session = await auth()
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined
  if (!user?.id || (user.role !== "admin" && !isAdminEmail(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  })
  if (!dbUser?.passwordHash) {
    return NextResponse.json({ error: "Ce compte n'a pas de mot de passe (OAuth uniquement)." }, { status: 400 })
  }

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 403 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } })

  return NextResponse.json({ ok: true })
}
