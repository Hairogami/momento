import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function GET() {
  // En IS_DEV: utiliser requireSession (mêmes mocks que les autres routes)
  // pour récupérer le VRAI userId. Renvoyer MOCK_DASHBOARD_DATA.unreadCount
  // hardcodé cassait la décrémentation du badge à l'ouverture d'une conv.
  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ messages: 0, notifications: 0 })
    userId = session.user.id
  }

  let messages = 0;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, vendorSlug: true },
    })
    if (user?.role === "vendor") {
      // Vendor sans vendorSlug = pas configuré → 0 (pas de fallback client
      // qui mélangerait les 2 mondes et fausserait le badge).
      if (user.vendorSlug) {
        messages = await prisma.message.count({
          where: {
            read: false,
            senderId: { not: userId },
            conversation: { vendorSlug: user.vendorSlug },
          },
        })
      }
    } else {
      messages = await prisma.message.count({
        where: {
          read: false,
          senderId: { not: userId },
          conversation: { clientId: userId },
        },
      })
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[unread]", err)
  }

  return NextResponse.json({ messages, notifications: 0 })
}
