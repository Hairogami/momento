import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import { vendorSlugExists } from "@/lib/vendorQueries"
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
    if (!ip) {
      return NextResponse.json({ error: "Requête non identifiable." }, { status: 400 })
    }
    const rl = rateLimit(`vendor-claim:${ip}`, 5, 15 * 60_000)
    if (!rl.ok) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 })
    }

    if (!slug || !(await vendorSlugExists(slug))) {
      return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
    }

    // ── MODE: logged-in user claiming ──────────────────────────────────────
    if (mode === "logged_in") {
      const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

      // WR-006: per-user rate limit (3 claims per 24h) to block multi-IP abuse
      const rlUser = rateLimit(`vendor-claim-user:${session.user.id}`, 3, 24 * 60 * 60_000)
      if (!rlUser.ok) {
        return NextResponse.json(
          { error: "Limite quotidienne de revendications atteinte." },
          { status: 429 }
        )
      }

      // Prevent a user who is already a vendor from claiming a second profile
      const userProfile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (userProfile) return NextResponse.json({ error: "Vous avez déjà un profil prestataire." }, { status: 409 })

      // CR-003: Check slug not already claimed
      const existingSlugProfile = await prisma.vendorProfile.findUnique({ where: { slug }, select: { id: true } })
      if (existingSlugProfile) return NextResponse.json({ error: "Ce profil est déjà revendiqué." }, { status: 409 })

      // CR-003: Check no pending claim already exists for this user or this slug
      const existingPending = await prisma.vendorClaimRequest.findFirst({
        where: { OR: [{ userId: session.user.id, status: "pending" }, { slug, status: "pending" }] },
        select: { id: true },
      })
      if (existingPending) {
        return NextResponse.json(
          { error: "Une demande de revendication est déjà en attente pour ce profil ou cet utilisateur." },
          { status: 409 }
        )
      }

      // CR-003: Place in pending queue for admin review instead of immediate role elevation
      await prisma.vendorClaimRequest.create({
        data: {
          userId:      session.user.id,
          slug,
          status:      "pending",
          submittedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, step: "pending_admin_review" })
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
