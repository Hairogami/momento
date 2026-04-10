import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // The accessToken is intentionally NOT exposed on session.user (auth.ts session callback).
  // It is stored server-side in the JWT only. To fix properly, fetch it from the DB
  // Account table by userId+provider. For now return a clear 501 error rather than a
  // misleading 403 so callers know this feature is not yet implemented server-side.
  // TODO: fetch token from prisma.account where userId = session.user.id AND provider = "google"
  const accessToken = (session.user as { accessToken?: string }).accessToken
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar integration not yet available." },
      { status: 501 }
    )
  }

  const { searchParams } = req.nextUrl

  function parseIso(val: string | null, fallback: string): string {
    if (!val) return fallback
    const d = new Date(val)
    return isNaN(d.getTime()) ? fallback : d.toISOString()
  }

  const from = parseIso(searchParams.get("from"), new Date().toISOString())
  const to   = parseIso(searchParams.get("to"),   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

  try {
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events")
    url.searchParams.set("timeMin", from)
    url.searchParams.set("timeMax", to)
    url.searchParams.set("singleEvents", "true")
    url.searchParams.set("orderBy", "startTime")
    url.searchParams.set("maxResults", "100")

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const err = await res.json()
      console.error("[Google Calendar]", err)
      return NextResponse.json({ error: "Google Calendar API error." }, { status: res.status })
    }

    const data = await res.json()
    const events = (data.items ?? []).map((item: {
      id: string
      summary?: string
      start?: { date?: string; dateTime?: string }
      colorId?: string
    }) => {
      const start = item.start?.dateTime ?? item.start?.date ?? ""
      const date = start.slice(0, 10)
      const time = item.start?.dateTime
        ? new Date(item.start.dateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : undefined

      return {
        id: item.id,
        title: item.summary ?? "(sans titre)",
        date,
        time,
        color: item.colorId ?? null,
      }
    })

    return NextResponse.json({ events })
  } catch (err) {
    console.error("[Google Calendar] fetch error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
