import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import { VENDOR_BASIC } from "@/lib/vendorData"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, mode, email, firstName, lastName, phone } = body

    if (!slug || !VENDOR_BASIC[slug]) {
      return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
    }

    // Check vendor not already claimed
    const existing = await prisma.vendorProfile.findUnique({ where: { slug }, select: { id: true } })
    if (existing) {
      return NextResponse.json({ error: "Ce profil est déjà revendiqué." }, { status: 409 })
    }

    // ── MODE: logged-in user claiming ──────────────────────────────────────
    if (mode === "logged_in") {
      const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

      const userProfile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (userProfile) return NextResponse.json({ error: "Vous avez déjà un profil prestataire." }, { status: 409 })

      await prisma.$transaction([
        prisma.vendorProfile.create({
          data: { slug, userId: session.user.id, claimed: true, verified: false, plan: "free" }
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { role: "vendor", vendorSlug: slug }
        }),
      ])

      return NextResponse.json({ success: true, redirect: "/prestataire/dashboard" })
    }

    // ── MODE: new account via magic link ──────────────────────────────────
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé. Connectez-vous pour revendiquer." }, { status: 409 })
    }

    const token    = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await prisma.user.create({
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

    await sendVerificationEmail({ to: user.email, firstName, token })

    return NextResponse.json({ success: true, step: "verify_email" }, { status: 201 })
  } catch (err) {
    console.error("[/api/vendor/claim]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
