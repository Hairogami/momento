import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Mot de passe actuel et nouveau mot de passe requis." }, { status: 400 })
  }

  // I01: cap currentPassword length before bcrypt.compare to prevent DoS via oversized input
  if (typeof currentPassword !== "string" || currentPassword.length > 128) {
    return NextResponse.json(
      { error: "Le mot de passe actuel ne peut pas dépasser 128 caractères." },
      { status: 400 }
    )
  }

  // W04: cap max length before bcrypt to prevent DoS via oversized input
  if (newPassword.length > 128) {
    return NextResponse.json(
      { error: "Le mot de passe ne peut pas dépasser 128 caractères." },
      { status: 400 }
    )
  }

  if (!strongPassword.test(newPassword)) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre (8 caractères min)." },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "Ce compte utilise une connexion sociale (Google/Facebook). Impossible de changer le mot de passe." },
      { status: 400 }
    )
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 })
  }

  if (currentPassword === newPassword) {
    return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l'ancien." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  })

  return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès." })
}
