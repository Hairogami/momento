import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  const previewKey = process.env.PREVIEW_KEY

  if (!previewKey || key !== previewKey) {
    return NextResponse.redirect(new URL("/coming-soon", req.url))
  }

  const res = NextResponse.redirect(new URL("/", req.url))
  res.cookies.set("preview_key", previewKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}
