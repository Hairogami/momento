import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

const ContactSchema = z.object({
  vendorSlug:  z.string().min(1).max(100),
  clientName:  z.string().min(1).max(100),
  clientEmail: z.string().email().max(200),
  clientPhone: z.string().max(20).optional(),
  eventType:   z.string().max(50).optional(),
  eventDate:   z.string().max(20).optional(),
  message:     z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  // Body size limit: 16 KB max
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  // Rate limit: 5 contact requests per 10 minutes per IP (anti-spam)
  const ip = getIp(req)
  const rl = await rateLimitAsync(`contact:${ip}`, 5, 600_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de demandes. Veuillez patienter 10 minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  try {
    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      )
    }

    const { vendorSlug, clientName, clientEmail, clientPhone, eventType, eventDate, message } = parsed.data

    const request = await prisma.contactRequest.create({
      data: {
        vendorSlug,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        clientPhone: clientPhone ?? null,
        eventType:   eventType ?? null,
        eventDate:   eventDate ?? null,
        message,
      },
    })

    return NextResponse.json({ id: request.id }, { status: 201 })
  } catch (err) {
    console.error("[contact] error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
