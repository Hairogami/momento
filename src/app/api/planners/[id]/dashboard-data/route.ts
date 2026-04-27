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

  const { id } = await params

  // IDOR check : planner doit appartenir au user
  const planner = await prisma.planner.findUnique({
    where: { id },
    select: { id: true, userId: true, budget: true },
  })
  if (!planner || planner.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const [guests, budgetItems, bookings] = await Promise.all([
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
  ])

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
    bookings: bookings.map(b => ({
      id: b.id,
      vendor: b.vendor?.name ?? "—",
      category: b.vendor?.category ?? "autre",
      status: (b.status === "confirmed" ? "CONFIRMED" : b.status === "cancelled" ? "INQUIRY" : "PENDING") as "CONFIRMED" | "PENDING" | "INQUIRY",
      amount: b.totalPrice ?? undefined,
    })),
    edata: {
      budget: planner.budget ?? 0,
      budgetSpent: totalSpent,
      guestCount,
      guestConfirmed,
    },
  })
}
