import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      )
    }

    const record = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!record || record.type !== "password_reset") {
      return NextResponse.json({ error: "Lien invalide." }, { status: 400 })
    }

    if (record.usedAt) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé." }, { status: 400 })
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce lien a expiré." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ])

    return NextResponse.json({ message: "Mot de passe réinitialisé." })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
