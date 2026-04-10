import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  // CR-02: Validate token length before hitting the DB
  if (!token || token.length > 256) {
    return NextResponse.redirect(new URL("/login?error=token_invalide", req.url))
  }

  try {
    const record = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, emailVerified: true } } },
    })

    // All failure cases collapse to a single error to prevent oracle attacks
    // (distinguishing "expired" vs "already used" vs "not found" leaks information)
    if (
      !record ||
      record.type !== "email_verification" ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      return NextResponse.redirect(new URL("/login?error=token_invalide", req.url))
    }

    if (record.user.emailVerified) {
      // Déjà vérifié, on redirige quand même avec succès
      return NextResponse.redirect(new URL("/login?verified=true", req.url))
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.redirect(new URL("/login?verified=true", req.url))
  } catch (err) {
    console.error("[verify-email]", err)
    return NextResponse.redirect(new URL("/login?error=erreur_serveur", req.url))
  }
}
