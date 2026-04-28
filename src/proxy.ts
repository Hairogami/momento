import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths always allowed through regardless of gates
const COMING_SOON_EXEMPT = ["/coming-soon", "/api/", "/_next/", "/favicon", "/evt/", "/.well-known/", "/sitemap.xml", "/robots.txt", "/manifest.json"]
const PROTECTED          = ["/dashboard", "/accueil", "/profile", "/planner", "/favorites",
                             "/budget", "/guests", "/messages", "/notifications", "/settings",
                             "/vendors", "/vendor/dashboard", "/prestataire/dashboard", "/admin",
                             "/mes-prestataires"]
const AUTH_ONLY          = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ── COMING SOON GATE ──────────────────────────────────────────────────────
  const isLaunchPublic = process.env.LAUNCH_PUBLIC === "true"
  const previewKey     = request.cookies.get("preview_key")?.value
  const isExempt       = COMING_SOON_EXEMPT.some(p => path.startsWith(p))

  const configuredKey = process.env.PREVIEW_KEY
  if (!isLaunchPublic && !isExempt && (!configuredKey || previewKey !== configuredKey)) {
    return NextResponse.redirect(new URL("/coming-soon", request.url))
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── AUTH GATE ─────────────────────────────────────────────────────────────
  // Check session cookie presence only — JWT decryption (JWE) is not reliable
  // in Edge runtime with Auth.js v5. Actual session validation happens in each
  // Server Component via auth(). This gate just avoids unnecessary page loads.
  //
  // TODO: when NextAuth exits beta to v5 stable, verify the cookie name
  // stays as `authjs.session-token`. If renamed, update SESSION_COOKIE_NAMES.
  // See: https://authjs.dev/getting-started/migrating-to-v5
  const SESSION_COOKIE_NAMES = [
    "authjs.session-token",              // NextAuth v5 (current)
    "__Secure-authjs.session-token",     // NextAuth v5 over HTTPS
    "next-auth.session-token",           // NextAuth v4 legacy fallback
    "__Secure-next-auth.session-token",  // NextAuth v4 legacy over HTTPS
  ]
  const sessionCookie = SESSION_COOKIE_NAMES
    .map(name => request.cookies.get(name)?.value)
    .find(Boolean)

  const isProtected = PROTECTED.some(p => path.startsWith(p))
  const isAuthPage  = AUTH_ONLY.some(p => path.startsWith(p))

  if (isProtected && !sessionCookie) {
    const url = new URL("/login", request.url)
    const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard"
    url.searchParams.set("next", safePath)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.png$|.*\\.ico$|.*\\.xml$|.*\\.txt$).*)"],
}
