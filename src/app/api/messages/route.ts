import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"
import { requireVerifiedEmail } from "@/lib/auth-guards"

/** Strip dangerous HTML/script content from user input, including encoded entities */
function sanitize(str: string): string {
  // WR-005: decode numeric HTML entities first to prevent bypass via &#60;script&#62; etc.
  const decoded = str
    .replace(/&#x[0-9a-f]+;/gi, "")
    .replace(/&#[0-9]+;/gi, "")
    .replace(/&[a-z]+;/gi, "")
  return decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}

// GET /api/messages — list conversations for the current user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, vendorSlug: true } })
  if (!user) return NextResponse.json({ error: "Introuvable." }, { status: 404 })

  let conversations

  if (user.role === "vendor" && !user.vendorSlug) {
    // Vendor account exists but vendorSlug not set — return empty to avoid
    // leaking client-side conversations (WR-016)
    return NextResponse.json([])
  }

  if (user.role === "vendor" && user.vendorSlug) {
    conversations = await prisma.conversation.findMany({
      where: { vendorSlug: user.vendorSlug },
      include: {
        client: { select: { id: true, name: true, email: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    })
  } else {
    conversations = await prisma.conversation.findMany({
      where: { clientId: session.user.id },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Enrich with vendor info (batch fetch)
    const slugs = [...new Set(conversations.map((c: { vendorSlug: string }) => c.vendorSlug))]
    const vendors = await prisma.vendor.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true, category: true },
    })
    const vendorMap = Object.fromEntries(vendors.map(v => [v.slug, v]))
    return NextResponse.json(conversations.map((c: { vendorSlug: string }) => ({
      ...c,
      vendor: vendorMap[(c as { vendorSlug: string }).vendorSlug] ?? null,
    })))
  }

  return NextResponse.json(conversations)
}

// POST /api/messages — create or find conversation, then send a message
export async function POST(req: NextRequest) {
  // Body size limit: 16 KB max
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  // Rate limit: 30 messages per minute per IP — CR-01: null IP guard
  const ip = getIp(req)
  if (!ip) {
    return NextResponse.json({ error: "Requête non identifiable." }, { status: 400 })
  }
  const rl = await rateLimitAsync(`messages:${ip}`, 30, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de messages. Veuillez patienter." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  // Hard-gate : un user non vérifié ne peut pas envoyer/initier de message (anti-spam)
  const verifyGate = await requireVerifiedEmail(session.user.id)
  if (verifyGate) return verifyGate

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const { vendorSlug, content, conversationId } = body as Record<string, unknown>

  // Validate content
  const rawContent = typeof content === "string" ? content : ""
  const cleanContent = sanitize(rawContent)
  if (!cleanContent) {
    return NextResponse.json({ error: "Le message ne peut pas être vide." }, { status: 400 })
  }
  if (cleanContent.length > 2000) {
    return NextResponse.json({ error: "Message trop long (max 2000 caractères)." }, { status: 400 })
  }

  try {
    let convId = typeof conversationId === "string" ? conversationId : null

    if (!convId) {
      if (typeof vendorSlug !== "string" || !vendorSlug.trim()) {
        return NextResponse.json({ error: "vendorSlug requis." }, { status: 400 })
      }
      const safeSlug = vendorSlug.trim().slice(0, 100)
      // Verify vendor exists before creating a conversation to prevent orphaned records
      const vendorExists = await prisma.vendor.findUnique({ where: { slug: safeSlug }, select: { id: true } })
      if (!vendorExists) {
        return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
      }
      const conv = await prisma.conversation.upsert({
        where: { clientId_vendorSlug: { clientId: session.user.id, vendorSlug: safeSlug } },
        create: { clientId: session.user.id, vendorSlug: safeSlug },
        update: {},
      })
      convId = conv.id
    } else {
      // Verify the user has access to this conversation
      const conv = await prisma.conversation.findUnique({ where: { id: convId } })
      if (!conv) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 })
      const isClient = conv.clientId === session.user.id
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { vendorSlug: true } })
      const isVendor = user?.vendorSlug === conv.vendorSlug
      if (!isClient && !isVendor) {
        return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
      }
    }

    const message = await prisma.message.create({
      data: { conversationId: convId, senderId: session.user.id, content: cleanContent },
      include: { sender: { select: { id: true, name: true, image: true } } },
    })

    await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ message, conversationId: convId }, { status: 201 })
  } catch (err) {
    console.error("Messages POST error:", err)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}
