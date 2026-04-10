import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit, getIp } from "@/lib/rateLimiter"

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req)
    const rl = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      )
    }

    const { email } = await req.json()

    if (email) {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

      if (user) {
        await prisma.emailVerification.deleteMany({
          where: { userId: user.id, type: "password_reset" },
        })

        const token = randomUUID()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await prisma.emailVerification.create({
          data: { token, userId: user.id, expiresAt, type: "password_reset" },
        })

        try {
          await sendPasswordResetEmail({ to: user.email, firstName: user.firstName, token })
        } catch (e) {
          console.error("Forgot password email error:", e)
        }
      } else {
        // Constant-time delay to prevent user-existence enumeration via timing
        await new Promise(r => setTimeout(r, 200))
      }
    }

    return NextResponse.json({ message: "Si un compte existe, un e-mail a été envoyé." })
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ message: "Si un compte existe, un e-mail a été envoyé." })
  }
}
