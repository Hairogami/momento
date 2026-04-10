import { NextRequest, NextResponse } from "next/server"

// Delegates to NextAuth's built-in signout handler which correctly clears auth cookies.
// Calling signOut() from a custom route handler bypasses NextAuth's response builder.
export async function POST(req: NextRequest) {
  return NextResponse.redirect(new URL("/api/auth/signout", req.url), { status: 307 })
}
