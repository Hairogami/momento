import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  const previewKey = process.env.PREVIEW_KEY

  // W03: timing-safe comparison to prevent key enumeration via timing side-channel
  let valid = false
  if (previewKey && key) {
    try {
      valid = timingSafeEqual(Buffer.from(key), Buffer.from(previewKey))
    } catch {
      valid = false
    }
  }

  if (!valid) {
    return NextResponse.redirect(new URL("/coming-soon?error=1", req.url))
  }

  const res = NextResponse.redirect(new URL("/", req.url))
  res.cookies.set("preview_key", previewKey ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}
