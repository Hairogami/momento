import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, getIp } from "@/lib/rateLimit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // Rate limit: 5 contact requests per 10 minutes per IP (anti-spam)
  const ip = getIp(req)
  const rl = rateLimit(ip, { limit: 5, windowSec: 600 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de demandes. Veuillez patienter 10 minutes." },
      { status: 429, headers: { "Retry-After": "600" } }
    )
  }

  try {
    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
    }

    const { vendorSlug, clientName, clientEmail, clientPhone, eventType, eventDate, message } =
      body as Record<string, unknown>

    // Validate required fields
    if (
      typeof vendorSlug !== "string" || !vendorSlug.trim() ||
      typeof clientName !== "string" || !clientName.trim() ||
      typeof clientEmail !== "string" || !clientEmail.trim() ||
      typeof message !== "string" || !message.trim()
    ) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
    }

    // Validate email format
    if (!EMAIL_RE.test(clientEmail.trim())) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 })
    }

    // Length limits
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message trop long (max 2000 caractères)." }, { status: 400 })
    }

    const request = await prisma.contactRequest.create({
      data: {
        vendorSlug: vendorSlug.trim(),
        clientName: clientName.trim().slice(0, 100),
        clientEmail: clientEmail.trim().toLowerCase().slice(0, 200),
        clientPhone: typeof clientPhone === "string" ? clientPhone.trim().slice(0, 20) || null : null,
        eventType: typeof eventType === "string" ? eventType.trim().slice(0, 50) || null : null,
        eventDate: typeof eventDate === "string" ? eventDate.trim().slice(0, 20) || null : null,
        message: message.trim().slice(0, 2000),
      },
    })

    return NextResponse.json({ id: request.id }, { status: 201 })
  } catch (err) {
    console.error("Contact request error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
