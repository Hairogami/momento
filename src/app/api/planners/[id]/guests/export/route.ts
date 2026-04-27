import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"
import { requireVerifiedEmail } from "@/lib/auth-guards"

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

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Hard-gate : pas d'export de données tant que l'email n'est pas vérifié.
  // requireVerifiedEmail bypass en IS_DEV (cf. src/lib/auth-guards.ts).
  const verifyGate = await requireVerifiedEmail(userId)
  if (verifyGate) return verifyGate

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
    const ExcelJS = (await import("exceljs")).default
    const wb = new ExcelJS.Workbook()

    const guestSheet = wb.addWorksheet("Mes invités")
    guestSheet.columns = [
      { header: "Statut", key: "statut", width: 12 },
      { header: "Nom", key: "nom", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "Téléphone", key: "telephone", width: 16 },
      { header: "+1", key: "plusOne", width: 6 },
      { header: "Note", key: "note", width: 30 },
      { header: "Date", key: "date", width: 22 },
    ]
    for (const g of guests) {
      guestSheet.addRow({
        statut: g.rsvp,
        nom: g.name,
        email: g.email ?? "",
        telephone: g.phone ?? "",
        plusOne: g.plusOne ? "oui" : "",
        note: g.notes ?? "",
        date: g.createdAt.toISOString(),
      })
    }

    const rsvpSheet = wb.addWorksheet("Réponses site")
    rsvpSheet.columns = [
      { header: "Statut", key: "statut", width: 8 },
      { header: "Nom", key: "nom", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "Téléphone", key: "telephone", width: 16 },
      { header: "+1", key: "plusOne", width: 6 },
      { header: "Nom +1", key: "plusOneName", width: 20 },
      { header: "Allergie", key: "allergie", width: 18 },
      { header: "Message", key: "message", width: 30 },
      { header: "Lendemain", key: "lendemain", width: 12 },
      { header: "Date", key: "date", width: 22 },
    ]
    for (const r of rsvps) {
      rsvpSheet.addRow({
        statut: r.attendingMain ? "yes" : "no",
        nom: r.guestName,
        email: r.guestEmail ?? "",
        telephone: r.guestPhone ?? "",
        plusOne: r.plusOneName ? "oui" : "",
        plusOneName: r.plusOneName ?? "",
        allergie: r.dietaryNeeds ?? "",
        message: r.message ?? "",
        lendemain: r.attendingDayAfter === true ? "oui" : (r.attendingDayAfter === false ? "non" : ""),
        date: r.createdAt.toISOString(),
      })
    }

    const buf = await wb.xlsx.writeBuffer()
    return new NextResponse(buf as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="invites-${plannerId}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: "Format non supporté." }, { status: 400 })
}
