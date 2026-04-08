import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getIp } from "@/lib/rateLimit"

/** Strip dangerous HTML/script content from user input */
function sanitize(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}

// GET /api/messages — list conversations for the current user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "Introuvable." }, { status: 404 })

  let conversations

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
  }

  return NextResponse.json(conversations)
}

// POST /api/messages — create or find conversation, then send a message
export async function POST(req: NextRequest) {
  // Rate limit: 30 messages per minute per IP
  const ip = getIp(req)
  const rl = rateLimit(ip, { limit: 30, windowSec: 60 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de messages. Veuillez patienter." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

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
      const conv = await prisma.conversation.upsert({
        where: { clientId_vendorSlug: { clientId: session.user.id, vendorSlug: vendorSlug.trim() } },
        create: { clientId: session.user.id, vendorSlug: vendorSlug.trim() },
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
