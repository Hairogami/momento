import { prisma } from "@/lib/prisma"
import { dedupRsvps } from "@/lib/rsvpDedup"
import { getCategory } from "@/lib/budgetCategories"

export type DashboardData = {
  guests: Array<{
    id: string
    name: string
    rsvp: "yes" | "no" | "pending"
    tableNumber?: number
    diet?: string
    city?: string
  }>
  budgetItems: Array<{
    label: string
    allocated: number
    spent: number
    color: string
    icon: string
  }>
  recentExpenses: Array<{
    label: string
    allocated: number
    spent: number
    color: string
    icon: string
  }>
  bookings: Array<{
    id: string
    vendor: string
    category: string
    status: "CONFIRMED" | "PENDING" | "INQUIRY"
    amount?: number
  }>
  messages: Array<{
    id: string
    vendor: string
    lastMsg: string
    time: string
    unread: number
    avatar: string
  }>
  tasks: Array<{
    id: string
    label: string
    done: boolean
    priority: "haute" | "moyenne" | "basse"
    dueDate: string
    category: string
  }>
  edata: {
    budget: number
    budgetSpent: number
    guestCount: number
    guestConfirmed: number
  }
  rsvpStats: {
    viewCount: number
    confirmed: number
    plusOnes: number
    total: number
    recent: Array<{
      id: string
      guestName: string
      attendingMain: boolean
      createdAt?: string
    }>
  }
  rsvpDiets: Array<{ name: string; diet: string }>
}

/**
 * Builds the consolidated dashboard data payload for a given planner.
 * Performs IDOR check (planner must belong to userId) and returns null
 * if the planner doesn't exist or doesn't belong to the user.
 *
 * Server-callable: used both by the API route handler (HTTP refetches)
 * and by the RSC page during SSR (eliminates client-side hydration flash).
 */
function fmtRelTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return "À l'instant"
  if (mins < 60)  return `Il y a ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `Il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Hier"
  if (days < 7)   return `Il y a ${days}j`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export async function buildDashboardData(
  plannerId: string,
  userId: string,
): Promise<DashboardData | null> {
  // IDOR check : planner doit appartenir au user
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { id: true, userId: true, budget: true },
  })
  if (!planner || planner.userId !== userId) {
    return null
  }

  const [guests, budgetItems, bookings, conversations, tasks, eventSiteWithRsvps] = await Promise.all([
    prisma.guest.findMany({
      where: { plannerId },
      select: {
        id: true, name: true, email: true, rsvp: true, tableNumber: true, city: true, notes: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budgetItem.findMany({
      where: { plannerId },
      select: {
        id: true, category: true, label: true, estimated: true, actual: true, paid: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: { plannerId },
      select: {
        id: true, status: true, totalPrice: true,
        vendor: { select: { name: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Conversations du user (dont messages les plus récents) pour widget Messages
    prisma.conversation.findMany({
      // Inclure conversations rattachées au planner ET conversations globales
      // (sans plannerId, ex: contact vendor avant création planner). Sinon
      // un user qui contacte un vendor en premier ne voit jamais la conv.
      where: { clientId: userId, OR: [{ plannerId }, { plannerId: null }] },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: { where: { read: false, senderId: { not: userId } } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.task.findMany({
      where: { plannerId },
      select: {
        id: true, title: true, completed: true, category: true, dueDate: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.eventSite.findUnique({
      where: { plannerId },
      select: {
        id: true,
        viewCount: true,
        rsvps: {
          select: {
            id: true, guestName: true, guestEmail: true, guestPhone: true,
            attendingMain: true, plusOneName: true, dietaryNeeds: true, createdAt: true,
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

  // Régimes : matcher les EventRsvps aux Guests par email (priorité) puis par nom
  const dietByEmail = new Map<string, string>()
  const dietByName  = new Map<string, string>()
  for (const r of (eventSiteWithRsvps?.rsvps ?? [])) {
    if (!r.dietaryNeeds) continue
    if (r.guestEmail) dietByEmail.set(r.guestEmail.toLowerCase(), r.dietaryNeeds)
    dietByName.set(r.guestName.toLowerCase().trim(), r.dietaryNeeds)
  }

  // Aggrégation budget par catégorie pour le widget Budget
  const byCategory = new Map<string, { allocated: number; spent: number }>()
  for (const item of budgetItems) {
    const k = item.category.toLowerCase().trim()
    const cur = byCategory.get(k) ?? { allocated: 0, spent: 0 }
    cur.allocated += item.estimated
    cur.spent     += item.paid ? item.estimated : 0
    byCategory.set(k, cur)
  }
  const budgetWidgetItems = Array.from(byCategory.entries()).map(([category, v]) => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    allocated: v.allocated,
    spent: v.spent,
    color: getCategory(category).color,
    icon: getCategory(category).icon,
  }))

  const totalSpent = budgetItems.filter(b => b.paid).reduce((s, b) => s + b.estimated, 0)
  const guestCount = guests.length
  const guestConfirmed = guests.filter(g => g.rsvp === "yes").length

  // Liste plate des dépenses (raw) pour DepensesRecentesWidget — chaque ligne
  // garde son label spécifique, contrairement au budgetItems agrégé qui groupe
  // tout par catégorie pour le donut.
  const recentExpenses = budgetItems
    .filter(b => b.estimated > 0)
    .map(b => ({
      label: b.label,
      allocated: b.estimated,
      spent: b.paid ? b.estimated : 0,
      color: getCategory(b.category).color,
      icon: getCategory(b.category).icon,
    }))

  // Stats RSVP du site événement — dédup par email > phone > nom (cohérence
  // avec page /guests et exports : 1 personne = 1 ligne, peu importe le
  // nombre de soumissions du form public).
  const rawRsvps = eventSiteWithRsvps?.rsvps ?? []
  const rsvps = dedupRsvps(rawRsvps)
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

  // Régimes RSVP : invités ayant soumis un RSVP avec dietaryNeeds (non dédoublonnés avec guests)
  const rsvpDiets = rawRsvps
    .filter(r => r.dietaryNeeds)
    .filter(r => !guests.some(g =>
      (g.email && r.guestEmail && g.email.toLowerCase() === r.guestEmail?.toLowerCase()) ||
      g.name.toLowerCase().trim() === r.guestName.toLowerCase().trim()
    ))
    .map(r => ({ name: r.guestName, diet: r.dietaryNeeds! }))

  // Format Message[] pour le widget — avatar vide géré par fallback côté widget
  const messages = conversations.map(c => {
    const vendor = vendorMap.get(c.vendorSlug)
    const last = c.messages[0]
    const isUnread = last && !last.read && last.senderId !== userId
    return {
      id: c.id,
      vendor: vendor?.name ?? c.vendorSlug,
      lastMsg: last?.content?.slice(0, 80) ?? "",
      time: fmtRelTime(last?.createdAt ?? c.updatedAt),
      unread: c._count.messages,
      avatar: "",
    }
  })

  return {
    guests: guests.map(g => ({
      id: g.id,
      name: g.name,
      rsvp: (g.rsvp === "yes" || g.rsvp === "no" ? g.rsvp : "pending") as "yes" | "no" | "pending",
      tableNumber: g.tableNumber ?? undefined,
      diet: (g.email ? dietByEmail.get(g.email.toLowerCase()) : undefined)
        ?? dietByName.get(g.name.toLowerCase().trim())
        ?? undefined,
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
    rsvpDiets,
  }
}
