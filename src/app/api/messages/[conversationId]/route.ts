import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/messages/[conversationId] — list messages in a conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  const { conversationId } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 })

  // Check access: either the client or the vendor
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const isClient = conversation.clientId === session.user.id
  const isVendor = user?.vendorSlug === conversation.vendorSlug

  if (!isClient && !isVendor) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  })

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: { conversationId, read: false, senderId: { not: session.user.id } },
    data: { read: true },
  })

  return NextResponse.json(messages)
}
