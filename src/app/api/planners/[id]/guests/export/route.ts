import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export const runtime = "nodejs"

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return ""
  const s = String(v)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params
  const url = new URL(req.url)
  const format = url.searchParams.get("format") ?? "csv"

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: {
      userId: true,
      eventSite: { select: { id: true } },
    },
  })
  if (!planner || planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const eventSiteId = planner.eventSite?.id ?? null

  const [guests, rsvps] = await Promise.all([
    prisma.guest.findMany({
      where: { plannerId },
      orderBy: { createdAt: "desc" },
    }),
    eventSiteId
      ? prisma.eventRsvp.findMany({
          where: { eventSiteId },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  if (format === "csv") {
    const header = ["Source", "Statut", "Nom", "Email", "Téléphone", "+1", "Nom +1", "Allergie", "Message", "Lendemain", "Date"]
    const lines = [header.map(csvEscape).join(",")]
    for (const g of guests) {
      lines.push([
        "Mes invités", g.rsvp, g.name, g.email ?? "", g.phone ?? "",
        g.plusOne ? "oui" : "", "", "", g.notes ?? "", "", g.createdAt.toISOString(),
      ].map(csvEscape).join(","))
    }
    for (const r of rsvps) {
      lines.push([
        "Site", r.attendingMain ? "yes" : "no", r.guestName, r.guestEmail ?? "", r.guestPhone ?? "",
        r.plusOneName ? "oui" : "", r.plusOneName ?? "",
        r.dietaryNeeds ?? "", r.message ?? "",
        r.attendingDayAfter === true ? "oui" : (r.attendingDayAfter === false ? "non" : ""),
        r.createdAt.toISOString(),
      ].map(csvEscape).join(","))
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="invites-${plannerId}.csv"`,
      },
    })
  }

  if (format === "xlsx") {
    const XLSX = await import("xlsx")
    const wb = XLSX.utils.book_new()

    const guestRows = guests.map(g => ({
      Statut: g.rsvp,
      Nom: g.name,
      Email: g.email ?? "",
      Téléphone: g.phone ?? "",
      "+1": g.plusOne ? "oui" : "",
      Note: g.notes ?? "",
      Date: g.createdAt.toISOString(),
    }))
    const rsvpRows = rsvps.map(r => ({
      Statut: r.attendingMain ? "yes" : "no",
      Nom: r.guestName,
      Email: r.guestEmail ?? "",
      Téléphone: r.guestPhone ?? "",
      "+1": r.plusOneName ? "oui" : "",
      "Nom +1": r.plusOneName ?? "",
      Allergie: r.dietaryNeeds ?? "",
      Message: r.message ?? "",
      Lendemain: r.attendingDayAfter === true ? "oui" : (r.attendingDayAfter === false ? "non" : ""),
      Date: r.createdAt.toISOString(),
    }))

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(guestRows), "Mes invités")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rsvpRows), "Réponses site")

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="invites-${plannerId}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: "Format non supporté." }, { status: 400 })
}
