import { NextRequest, NextResponse, after } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { rateLimit, getIp } from "@/lib/rateLimiter"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@momentoevents.app"

const ClientSchema = z.object({
  role:      z.literal("client"),
  email:     z.string().email(),
  password:  z.string().min(8).max(128),
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
})

const VendorSchema = z.object({
  role:           z.literal("vendor"),
  email:          z.string().email(),
  password:       z.string().min(8).max(128),
  companyName:    z.string().min(1).max(100).optional(),
  vendorCategory: z.string().max(50).optional(),
  phone:          z.string().max(20).optional(),
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
  const rl = rateLimit(`register:${ip}`, 5, 15 * 60_000)
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

  const user = await prisma.user.create({
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
    },
    select: { id: true, email: true, name: true },
  })

  // Welcome email — deferred after response via after() so the lambda doesn't
  // terminate before the send completes (WR-012 fix).
  const firstName = data.role === "client" ? (data.firstName ?? name ?? "là") : (data.companyName ?? "vous")
  after(async () => {
    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Bienvenue sur Momento 🎉",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f0eb;border-radius:12px">
            <h1 style="font-size:22px;font-weight:600;margin-bottom:8px">Bienvenue, ${firstName} !</h1>
            <p style="color:#9a9a9a;font-size:14px;line-height:1.6;margin-bottom:24px">
              Votre compte Momento est prêt. Commencez à organiser votre événement ou trouvez les meilleurs prestataires au Maroc.
            </p>
            <a href="https://momentoevents.app/dashboard"
               style="display:inline-block;background:#C1713A;color:#0f0f0f;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Accéder à mon espace →
            </a>
            <p style="color:#555;font-size:12px;margin-top:32px">
              Momento · Votre plateforme événementielle au Maroc
            </p>
          </div>
        `,
      })
    } catch (e) {
      console.error("[register] welcome email error:", e)
    }
  })

  return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
