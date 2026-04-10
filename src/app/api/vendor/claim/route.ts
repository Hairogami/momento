import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import { VENDOR_BASIC } from "@/lib/vendorData"
import { randomBytes } from "crypto"
import { rateLimit, getIp } from "@/lib/rateLimiter"
import { z } from "zod"

const MagicLinkSchema = z.object({
  slug:      z.string().min(1).max(100),
  email:     z.string().email().max(200),
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  phone:     z.string().max(20).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, mode } = body

    // Rate limit: 5 attempts per 15 min per IP
    const ip = getIp(req)
    const rl = rateLimit(`vendor-claim:${ip}`, 5, 15 * 60_000)
    if (!rl.ok) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 })
    }

    if (!slug || !VENDOR_BASIC[slug]) {
      return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
    }

    // ── MODE: logged-in user claiming ──────────────────────────────────────
    if (mode === "logged_in") {
      const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

      // Prevent a user who is already a vendor from claiming a second profile
      const userProfile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (userProfile) return NextResponse.json({ error: "Vous avez déjà un profil prestataire." }, { status: 409 })

      try {
        await prisma.$transaction([
          prisma.vendorProfile.create({
            data: { slug, userId: session.user.id, claimed: true, verified: false, plan: "free" }
          }),
          prisma.user.update({
            where: { id: session.user.id },
            data: { role: "vendor", vendorSlug: slug }
          }),
        ])
      } catch (txErr: unknown) {
        const code = (txErr as { code?: string })?.code
        if (code === "P2002") {
          return NextResponse.json({ error: "Ce profil est déjà revendiqué." }, { status: 409 })
        }
        throw txErr
      }

      return NextResponse.json({ success: true, redirect: "/prestataire/dashboard" })
    }

    // ── MODE: new account via magic link ──────────────────────────────────
    const mlParsed = MagicLinkSchema.safeParse(body)
    if (!mlParsed.success) {
      return NextResponse.json(
        { error: mlParsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = mlParsed.data

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé. Connectez-vous pour revendiquer." }, { status: 409 })
    }

    const token    = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    let user: { email: string }
    try {
      user = await prisma.user.create({
        data: {
          email:      email.toLowerCase(),
          role:       "vendor",
          firstName,
          lastName,
          phone:      phone ?? null,
          vendorSlug: slug,
          emailVerified: null,
          emailVerifications: {
            create: { token, type: "email_verification", expiresAt }
          },
          vendorProfile: {
            create: { slug, claimed: true, verified: false, plan: "free" }
          },
        },
      })
    } catch (createErr: unknown) {
      const code = (createErr as { code?: string })?.code
      if (code === "P2002") {
        return NextResponse.json({ error: "Ce profil ou cet email est déjà utilisé." }, { status: 409 })
      }
      throw createErr
    }

    await sendVerificationEmail({ to: user.email, firstName, token })

    return NextResponse.json({ success: true, step: "verify_email" }, { status: 201 })
  } catch (err) {
    console.error("[/api/vendor/claim]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
