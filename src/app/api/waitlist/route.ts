import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit, getIp } from "@/lib/rateLimiter"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  // C01: Rate limit — 5 inscriptions par IP par 15 min
  const ip = getIp(req)
  if (!ip) {
    return NextResponse.json({ error: "Requête non identifiable." }, { status: 400 })
  }
  const rl = rateLimit(`waitlist:${ip}`, 5, 15 * 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Email invalide" }, { status: 400 })

  try {
    await prisma.waitlist.create({ data: { email: parsed.data.email } })
  } catch (err: unknown) {
    // Only swallow unique constraint violations (already registered)
    if ((err as { code?: string })?.code !== "P2002") throw err
  }

  return NextResponse.json({ ok: true })
}
