import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"

export type NotifItem = {
  id: string
  type: "message" | "rsvp"
  title: string
  snippet: string
  href: string
  createdAt: string
  read: boolean
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json([])

  const items: NotifItem[] = []

  // 1. Messages non-lus (les autres ont envoyé, le user n'a pas encore lu)
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        read: false,
        senderId: { not: userId },
        conversation: { clientId: userId },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        createdAt: true,
        conversation: { select: { vendorSlug: true } },
      },
    })

    const slugs = [...new Set(unreadMessages.map(m => m.conversation.vendorSlug))]
    const vendors = slugs.length > 0
      ? await prisma.vendor.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true, name: true },
        })
      : []
    const nameBySlug = new Map(vendors.map(v => [v.slug, v.name]))

    for (const m of unreadMessages) {
      items.push({
        id: `msg-${m.id}`,
        type: "message",
        title: nameBySlug.get(m.conversation.vendorSlug) ?? m.conversation.vendorSlug,
        snippet: m.content.slice(0, 120),
        href: "/messages",
        createdAt: m.createdAt.toISOString(),
        read: false,
      })
    }
  } catch { /* silent */ }

  // 2. RSVPs récents reçus sur les sites événement du user (7 derniers jours)
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const rsvps = await prisma.eventRsvp.findMany({
      where: {
        createdAt: { gte: since },
        eventSite: { planner: { userId } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        guestName: true,
        attendingMain: true,
        createdAt: true,
      },
    })
    for (const r of rsvps) {
      items.push({
        id: `rsvp-${r.id}`,
        type: "rsvp",
        title: r.attendingMain ? `${r.guestName} a confirmé sa présence` : `${r.guestName} ne pourra pas venir`,
        snippet: r.attendingMain ? "Réponse positive reçue via votre site événement." : "Réponse négative reçue via votre site événement.",
        href: "/guests",
        createdAt: r.createdAt.toISOString(),
        read: true, // pas de notion "lu" sur RSVP en MVP, considéré comme info
      })
    }
  } catch { /* silent */ }

  // Tri global par date desc
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json(items)
}
