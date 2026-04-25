import { NextRequest, NextResponse, after } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"
import { verifyTurnstile, turnstileEnabled } from "@/lib/turnstile"

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req)
    if (!ip) {
      return NextResponse.json({ message: "Si un compte existe, un e-mail a été envoyé." }, { status: 400 })
    }
    const rl = await rateLimitAsync(`forgot-password:${ip}`, 5, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      )
    }

    // CR-03: Validate email type and length before hitting the DB
    const body = await req.json().catch(() => null)
    const rawEmail = body?.email
    const turnstileToken = body?.turnstileToken
    // Turnstile CAPTCHA — bloque les bots si activé
    if (turnstileEnabled()) {
      const ok = await verifyTurnstile(turnstileToken, ip)
      if (!ok) {
        return NextResponse.json({ message: "Vérification anti-bot échouée." }, { status: 400 })
      }
    }
    if (rawEmail && typeof rawEmail === "string" && rawEmail.length <= 320) {
      const email = rawEmail.toLowerCase().trim()
      const user = await prisma.user.findUnique({ where: { email } })

      if (user) {
        const token = randomUUID()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Atomic delete + create to prevent race condition with multiple concurrent requests
        await prisma.$transaction(async (tx) => {
          await tx.emailVerification.deleteMany({
            where: { userId: user.id, type: "password_reset" },
          })
          await tx.emailVerification.create({
            data: { token, userId: user.id, expiresAt, type: "password_reset" },
          })
        })

        // Email send déféré via after() — sort de la fenêtre de réponse pour
        // équilibrer le timing avec la branche "user inconnu" (anti-énumération).
        after(async () => {
          try {
            await sendPasswordResetEmail({ to: user.email, firstName: user.firstName, token })
          } catch (e) {
            console.error("Forgot password email error:", e)
          }
        })
      }
      // Délai constant 250ms appliqué dans LES DEUX branches (user existant ou non) :
      // équilibre le temps de réponse pour empêcher l'énumération par timing.
      await new Promise(r => setTimeout(r, 250))
    }

    return NextResponse.json({ message: "Si un compte existe, un e-mail a été envoyé." })
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ message: "Si un compte existe, un e-mail a été envoyé." })
  }
}
