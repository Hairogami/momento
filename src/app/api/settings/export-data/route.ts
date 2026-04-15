import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const userId = session.user.id

  const [user, settings, planners, conversations, sentMessages, reviews, favorites, notifications] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, email: true, name: true, firstName: true, lastName: true, phone: true,
        location: true, companyName: true, role: true, vendorCategory: true, createdAt: true,
      },
    }),
    prisma.userSettings.findUnique({ where: { userId } }).catch(() => null),
    prisma.planner.findMany({ where: { userId } }).catch(() => []),
    prisma.conversation.findMany({ where: { clientId: userId } }).catch(() => []),
    prisma.message.findMany({ where: { senderId: userId } }).catch(() => []),
    prisma.review.findMany({ where: { authorId: userId } }).catch(() => []),
    prisma.favorite.findMany({ where: { userId } }).catch(() => []),
    prisma.notification.findMany({ where: { userId } }).catch(() => []),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    user, settings, planners, conversations, sentMessages, reviews, favorites, notifications,
  }

  const filename = `momento-export-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type":        "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
