import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV, MOCK_DASHBOARD_DATA } from "@/lib/devMock"

export async function GET() {
  // WR-06: Auth check BEFORE IS_DEV mock — never return data without a session
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ messages: 0, notifications: 0 })

  if (IS_DEV) {
    return NextResponse.json({ messages: MOCK_DASHBOARD_DATA.unreadCount, notifications: 0 })
  }

  let messages = 0;
  try {
    messages = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: session.user.id },
        conversation: { clientId: session.user.id },
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[unread]", err)
  }

  return NextResponse.json({ messages, notifications: 0 })
}
