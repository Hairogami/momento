import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // CR-001: fetch access_token + refresh_token + expires_at to handle token refresh
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
    select: { access_token: true, refresh_token: true, expires_at: true },
  })

  let accessToken = account?.access_token

  // Refresh if expired (expires_at is Unix seconds)
  const now = Math.floor(Date.now() / 1000)
  if (account?.expires_at && account.expires_at < now && account.refresh_token) {
    try {
      const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id:     process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type:    "refresh_token",
          refresh_token: account.refresh_token,
        }),
      })
      const data = await resp.json()
      if (data.access_token) {
        accessToken = data.access_token
        await prisma.account.updateMany({
          where: { userId: session.user.id, provider: "google" },
          data: {
            access_token: data.access_token,
            expires_at:   now + (data.expires_in ?? 3600),
          },
        })
      }
    } catch (refreshErr) {
      console.error("[Google Calendar] token refresh failed", refreshErr)
    }
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar non connecté. Reconnectez-vous avec Google." },
      { status: 403 }
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

  // I-N02: reject ranges larger than 1 year to avoid costly Google Calendar calls
  if (new Date(to).getTime() - new Date(from).getTime() > 365 * 86_400_000) {
    return NextResponse.json({ error: "Plage de dates trop large (max 1 an)." }, { status: 400 })
  }

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
