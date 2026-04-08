import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "E-mail de vérification renvoyé si le compte existe." })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (user && !user.emailVerified) {
      // Delete existing tokens and create a fresh one
      await prisma.emailVerification.deleteMany({
        where: { userId: user.id, type: "email_verification" },
      })

      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await prisma.emailVerification.create({
        data: { token, userId: user.id, expiresAt, type: "email_verification" },
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
