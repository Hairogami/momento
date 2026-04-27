import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  // Format attendu: "msg-<id>" ou "rsvp-<id>"
  if (id.startsWith("msg-")) {
    const messageId = id.slice(4)
    // IDOR : message doit appartenir à une conv où le user est client
    const msg = await prisma.message.findUnique({
      where: { id: messageId },
      select: { conversation: { select: { clientId: true } }, senderId: true },
    })
    if (!msg || msg.conversation.clientId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (msg.senderId === userId)
      return NextResponse.json({ ok: true }) // déjà "lu" implicitement (envoyé par lui)

    await prisma.message.update({ where: { id: messageId }, data: { read: true } })
    return NextResponse.json({ ok: true })
  }

  if (id.startsWith("rsvp-")) {
    // Pas de notion "lu" sur EventRsvp en MVP : on retourne ok sans rien modifier
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Format id invalide" }, { status: 400 })
}
