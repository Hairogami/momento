import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ messages: 0, notifications: 0 })

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
