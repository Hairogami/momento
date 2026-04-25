import { NextRequest, NextResponse, after } from "next/server"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"
import { sendVerificationEmail } from "@/lib/email"
import { verifyTurnstile, turnstileEnabled } from "@/lib/turnstile"

const strongPassword = z.string().min(8).max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.")

const ClientSchema = z.object({
  role:           z.literal("client"),
  email:          z.string().email(),
  password:       strongPassword,
  firstName:      z.string().min(1).max(50).optional(),
  lastName:       z.string().min(1).max(50).optional(),
  marketingOptIn: z.boolean().optional(),
  agreedTos:      z.literal(true, { message: "Vous devez accepter les conditions générales." }),
  turnstileToken: z.string().max(2048).optional(),
})

const VendorSchema = z.object({
  role:           z.literal("vendor"),
  email:          z.string().email(),
  password:       strongPassword,
  companyName:    z.string().min(1).max(100).optional(),
  vendorCategory: z.string().max(50).optional(),
  phone:          z.string().max(20).optional(),
  marketingOptIn: z.boolean().optional(),
  agreedTos:      z.literal(true, { message: "Vous devez accepter les conditions générales." }),
  turnstileToken: z.string().max(2048).optional(),
})

const RegisterSchema = z.discriminatedUnion("role", [ClientSchema, VendorSchema])

export async function POST(req: NextRequest) {
  // Body size limit
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  // Rate limit: 5 registrations per 15 min per IP
  const ip = getIp(req)
  const rl = await rateLimitAsync(`register:${ip}`, 5, 15 * 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Turnstile CAPTCHA — bloque les bots si activé via env vars
  if (turnstileEnabled()) {
    const ok = await verifyTurnstile(data.turnstileToken, ip ?? undefined)
    if (!ok) {
      return NextResponse.json({ error: "Vérification anti-bot échouée. Réessayez." }, { status: 400 })
    }
  }

  try {
  // Check existing user
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(data.password, 12)

  const name =
    data.role === "client"
      ? [data.firstName, data.lastName].filter(Boolean).join(" ") || null
      : data.companyName ?? null

  let user: { id: string; email: string; name: string | null }
  try {
    user = await prisma.user.create({
      data: {
        email:          data.email.toLowerCase(),
        name,
        passwordHash,
        role:           data.role,
        firstName:      data.role === "client" ? (data.firstName ?? null) : null,
        lastName:       data.role === "client" ? (data.lastName ?? null) : null,
        companyName:    data.role === "vendor" ? (data.companyName ?? null) : null,
        vendorCategory: data.role === "vendor" ? (data.vendorCategory ?? null) : null,
        phone:          data.role === "vendor" ? (data.phone ?? null) : null,
        marketingOptIn: data.marketingOptIn ?? true,
        agreedTosAt:    data.agreedTos ? new Date() : null,
      },
      select: { id: true, email: true, name: true },
    })
  } catch (createErr: unknown) {
    // W12: race condition — two concurrent requests both pass findUnique check
    if ((createErr as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })
    }
    throw createErr
  }

  // Email vérification — créé en transaction puis envoyé via after() pour ne pas bloquer la réponse
  const verifFirstName = data.role === "client" ? (data.firstName ?? null) : (data.companyName ?? null)
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  try {
    await prisma.emailVerification.create({
      data: { token, userId: user.id, expiresAt, type: "email_verification" },
    })
  } catch (e) {
    console.error("[register] emailVerification create error:", e)
  }

  after(async () => {
    try {
      await sendVerificationEmail({ to: user.email, firstName: verifFirstName, token })
    } catch (e) {
      console.error("[register] verification email error:", e)
    }
  })

  return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
