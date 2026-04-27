import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

const CATEGORY_COLORS: Record<string, string> = {
  lieu: "#C4532A",
  traiteur: "#D4733A",
  photo: "#A03820",
  musique: "#E08050",
  deco: "#B84830",
  fleurs: "#CC6040",
  robe: "#F09060",
  autre: "#8C6A5A",
}

const CATEGORY_ICONS: Record<string, string> = {
  lieu: "place",
  traiteur: "restaurant",
  photo: "photo_camera",
  musique: "music_note",
  deco: "palette",
  fleurs: "local_florist",
  robe: "checkroom",
  autre: "category",
}

function colorFor(category: string): string {
  const k = category.toLowerCase().trim()
  return CATEGORY_COLORS[k] ?? "#8C6A5A"
}

function iconFor(category: string): string {
  const k = category.toLowerCase().trim()
  return CATEGORY_ICONS[k] ?? "category"
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = IS_DEV ? await requireSession() : await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const { id } = await params

  // IDOR check : planner doit appartenir au user
  const planner = await prisma.planner.findUnique({
    where: { id },
    select: { id: true, userId: true, budget: true },
  })
  if (!planner || planner.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const [guests, budgetItems, bookings, conversations, tasks, eventSiteWithRsvps] = await Promise.all([
    prisma.guest.findMany({
      where: { plannerId: id },
      select: {
        id: true, name: true, rsvp: true, tableNumber: true, city: true, notes: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budgetItem.findMany({
      where: { plannerId: id },
      select: {
        id: true, category: true, label: true, estimated: true, actual: true, paid: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: { plannerId: id },
      select: {
        id: true, status: true, totalPrice: true,
        vendor: { select: { name: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Conversations du user (dont messages les plus récents) pour widget Messages
    prisma.conversation.findMany({
      where: { clientId: userId, plannerId: id },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.task.findMany({
      where: { plannerId: id },
      select: {
        id: true, title: true, completed: true, category: true, dueDate: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.eventSite.findUnique({
      where: { plannerId: id },
      select: {
        id: true,
        viewCount: true,
        rsvps: {
          select: {
            id: true, guestName: true, attendingMain: true, plusOneName: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ])

  // Enrich conversations avec vendor info (1 batch). Vendor n'a pas de champ
  // image direct ; le widget gère le fallback côté front si avatar vide.
  const slugs = [...new Set(conversations.map(c => c.vendorSlug))]
  const vendors = slugs.length > 0 ? await prisma.vendor.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true },
  }) : []
  const vendorMap = new Map(vendors.map(v => [v.slug, v]))

  // Aggrégation budget par catégorie pour le widget Budget
  const byCategory = new Map<string, { allocated: number; spent: number }>()
  for (const item of budgetItems) {
    const k = item.category.toLowerCase().trim()
    const cur = byCategory.get(k) ?? { allocated: 0, spent: 0 }
    cur.allocated += item.estimated
    cur.spent     += item.actual ?? 0
    byCategory.set(k, cur)
  }
  const budgetWidgetItems = Array.from(byCategory.entries()).map(([category, v]) => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    allocated: v.allocated,
    spent: v.spent,
    color: colorFor(category),
    icon: iconFor(category),
  }))

  const totalSpent = budgetItems.reduce((s, b) => s + (b.actual ?? 0), 0)
  const guestCount = guests.length
  const guestConfirmed = guests.filter(g => g.rsvp === "yes").length

  // Liste plate des dépenses (raw) pour DepensesRecentesWidget — chaque ligne
  // garde son label spécifique, contrairement au budgetItems agrégé qui groupe
  // tout par catégorie pour le donut.
  const recentExpenses = budgetItems
    .filter(b => (b.actual ?? 0) > 0)
    .map(b => ({
      label: b.label,
      allocated: b.estimated,
      spent: b.actual ?? 0,
      color: colorFor(b.category),
      icon: iconFor(b.category),
    }))

  // Stats RSVP du site événement (page /guests + widget Invités dashboard)
  const rsvps = eventSiteWithRsvps?.rsvps ?? []
  const rsvpConfirmed = rsvps.filter(r => r.attendingMain).length
  const rsvpPlusOnes = rsvps.filter(r => r.attendingMain && r.plusOneName && r.plusOneName.trim().length > 0).length
  const rsvpStats = {
    viewCount: eventSiteWithRsvps?.viewCount ?? 0,
    confirmed: rsvpConfirmed,
    plusOnes: rsvpPlusOnes,
    total: rsvps.length,
    recent: rsvps.slice(0, 3).map(r => ({
      id: r.id,
      guestName: r.guestName,
      attendingMain: r.attendingMain,
      createdAt: r.createdAt.toISOString(),
    })),
  }

  // Format Message[] pour le widget — avatar vide géré par fallback côté widget
  const messages = conversations.map(c => {
    const vendor = vendorMap.get(c.vendorSlug)
    const last = c.messages[0]
    const isUnread = last && !last.read && last.senderId !== userId
    return {
      id: c.id,
      vendor: vendor?.name ?? c.vendorSlug,
      lastMsg: last?.content?.slice(0, 80) ?? "",
      time: (last?.createdAt ?? c.updatedAt).toISOString(),
      unread: isUnread ? 1 : 0,
      avatar: "",
    }
  })

  return Response.json({
    guests: guests.map(g => ({
      id: g.id,
      name: g.name,
      rsvp: (g.rsvp === "yes" || g.rsvp === "no" ? g.rsvp : "pending") as "yes" | "no" | "pending",
      tableNumber: g.tableNumber ?? undefined,
      diet: undefined,
      city: g.city ?? undefined,
    })),
    budgetItems: budgetWidgetItems,
    recentExpenses,
    bookings: bookings.map(b => ({
      id: b.id,
      vendor: b.vendor?.name ?? "—",
      category: b.vendor?.category ?? "autre",
      status: (b.status === "confirmed" ? "CONFIRMED" : b.status === "cancelled" ? "INQUIRY" : "PENDING") as "CONFIRMED" | "PENDING" | "INQUIRY",
      amount: b.totalPrice ?? undefined,
    })),
    messages,
    tasks: tasks.map(t => ({
      id: t.id,
      label: t.title,
      done: t.completed,
      priority: "moyenne" as "haute" | "moyenne" | "basse",
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
      category: t.category ?? "Divers",
    })),
    edata: {
      budget: planner.budget ?? 0,
      budgetSpent: totalSpent,
      guestCount,
      guestConfirmed,
    },
    rsvpStats,
  })
}
