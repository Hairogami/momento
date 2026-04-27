import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"
import { captureError } from "@/lib/observability"

const ContactSchema = z.object({
  vendorSlug:  z.string().min(1).max(100),
  clientName:  z.string().min(1).max(100),
  clientEmail: z.string().email().max(200),
  clientPhone: z.string().max(20).optional(),
  eventType:   z.string().max(50).optional(),
  eventDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  message:     z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  // Body size limit: 16 KB max
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  // Rate limit: 5 contact requests per 10 minutes per IP (anti-spam)
  // C06: Guard null IP to prevent shared rate-limit key "contact:null"
  const ip = getIp(req)
  if (!ip) {
    return NextResponse.json({ error: "Requête non identifiable." }, { status: 400 })
  }
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

    const vendorExists = await prisma.vendor.findUnique({ where: { slug: vendorSlug }, select: { id: true } })
    if (!vendorExists) {
      return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
    }

    // WR-004: strip HTML tags before storing to prevent stored XSS
    function stripHtml(s: string): string {
      return s.replace(/<[^>]*>/g, "").trim()
    }

    const request = await prisma.contactRequest.create({
      data: {
        vendorSlug,
        clientName:  stripHtml(clientName),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone ? stripHtml(clientPhone) : null,
        eventType:   eventType   ? stripHtml(eventType)   : null,
        eventDate:   eventDate ?? null,
        message:     stripHtml(message),
      },
    })

    return NextResponse.json({ id: request.id }, { status: 201 })
  } catch (err) {
    captureError(err, { route: "/api/contact", method: "POST" })
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
