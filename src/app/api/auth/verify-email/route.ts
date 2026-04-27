import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { captureError } from "@/lib/observability"

// C02: Use APP_URL as redirect base to avoid Host-header open redirect.
// req.url is controlled by the Host header which can be spoofed in non-Vercel environments.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

function safeRedirect(path: string, req: NextRequest): NextResponse {
  const base = APP_URL || req.nextUrl.origin
  return NextResponse.redirect(new URL(path, base))
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  // CR-02: Validate token length before hitting the DB
  if (!token || token.length > 256) {
    return safeRedirect("/login?error=token_invalide", req)
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
      return safeRedirect("/login?error=token_invalide", req)
    }

    if (record.user.emailVerified) {
      // Déjà vérifié, on redirige quand même avec succès
      return safeRedirect("/login?verified=true", req)
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

    return safeRedirect("/login?verified=true", req)
  } catch (err) {
    captureError(err, { route: "/api/auth/verify-email" })
    return safeRedirect("/login?error=erreur_serveur", req)
  }
}
