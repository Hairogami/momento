import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

// C02: Use APP_URL as redirect base to avoid Host-header open redirect.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  const previewKey = process.env.PREVIEW_KEY
  const base = APP_URL || req.nextUrl.origin

  // Rate limit : 5 tentatives / 60s par IP. On redirige vers /coming-soon
  // sans signal distinct (pas de 429) pour ne pas révéler l'état de blocage.
  const ip = getIp(req)
  if (ip) {
    const rl = await rateLimitAsync(`unlock:${ip}`, 5, 60_000)
    if (!rl.ok) {
      return NextResponse.redirect(new URL("/coming-soon?error=1", base))
    }
  }

  // W03: timing-safe comparison to prevent key enumeration via timing side-channel
  let valid = false
  if (previewKey && key && Buffer.byteLength(key) === Buffer.byteLength(previewKey)) {
    try {
      valid = timingSafeEqual(Buffer.from(key), Buffer.from(previewKey))
    } catch {
      valid = false
    }
  }

  if (!valid) {
    return NextResponse.redirect(new URL("/coming-soon?error=1", base))
  }

  // WR-011: previewKey is guaranteed non-null here (validated above), never set empty cookie
  const res = NextResponse.redirect(new URL("/", base))
  res.cookies.set("preview_key", previewKey!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}
