import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit, getIp } from "@/lib/rateLimiter"

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req)
    if (!ip) {
      return NextResponse.json({ message: "Requête non identifiable." }, { status: 400 })
    }
    const rl = rateLimit(`resend-verification:${ip}`, 3, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      )
    }

    const body = await req.json().catch(() => null)
    const rawEmail = body?.email
    if (!rawEmail || typeof rawEmail !== "string" || rawEmail.length > 320) {
      return NextResponse.json({ message: "E-mail de vérification renvoyé si le compte existe." })
    }
    const email = rawEmail.toLowerCase().trim()

    const user = await prisma.user.findUnique({ where: { email } })

    if (user && !user.emailVerified) {
      // W06: atomic delete + create inside a transaction to prevent race condition
      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await prisma.$transaction(async (tx) => {
        await tx.emailVerification.deleteMany({
          where: { userId: user.id, type: "email_verification" },
        })
        await tx.emailVerification.create({
          data: { token, userId: user.id, expiresAt, type: "email_verification" },
        })
      })

      try {
        await sendVerificationEmail({ to: user.email, firstName: user.firstName, token })
      } catch (e) {
        console.error("Resend email error:", e)
      }
    }

    return NextResponse.json({ message: "E-mail de vérification renvoyé si le compte existe." })
  } catch (err) {
    console.error("Resend verification error:", err)
    return NextResponse.json({ message: "E-mail de vérification renvoyé si le compte existe." })
  }
}
