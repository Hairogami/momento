import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Paths always allowed through regardless of gates
const COMING_SOON_EXEMPT = ["/coming-soon", "/api/", "/_next/", "/favicon"]
const PROTECTED          = ["/dashboard", "/accueil", "/profile", "/planner", "/favorites",
                             "/budget", "/guests", "/messages", "/notifications", "/settings",
                             "/prestataire/dashboard"]
const AUTH_ONLY          = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ── COMING SOON GATE (tous les environnements) ────────────────────────────
  // Mettre LAUNCH_PUBLIC=true dans les env vars Vercel pour désactiver la gate au lancement.
  const isLaunchPublic = process.env.LAUNCH_PUBLIC === "true"
  const previewKey     = request.cookies.get("preview_key")?.value
  const isExempt       = COMING_SOON_EXEMPT.some(p => path.startsWith(p))

  const configuredKey = process.env.PREVIEW_KEY
  if (!isLaunchPublic && !isExempt && (!configuredKey || previewKey !== configuredKey)) {
    return NextResponse.redirect(new URL("/coming-soon", request.url))
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── AUTH GATE ─────────────────────────────────────────────────────────────
  // Check session cookie directly — do NOT call auth() here.
  // PrismaAdapter uses database sessions which require Node.js runtime,
  // but proxy runs in Edge. Calling auth() here breaks the OAuth callback.
  const sessionCookie =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  const isProtected = PROTECTED.some(p => path.startsWith(p))
  const isAuthPage  = AUTH_ONLY.some(p => path.startsWith(p))

  const isDev = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"
  if (isProtected && !isDev) {
    // Validate JWT signature — cookie presence alone is not sufficient (CR-002)
    let jwtValid = false
    if (sessionCookie && process.env.AUTH_SECRET) {
      try {
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
        await jwtVerify(sessionCookie, secret)
        jwtValid = true
      } catch {
        jwtValid = false
      }
    }
    if (!jwtValid) {
      const url = new URL("/login", request.url)
      // Validate path to prevent open redirect: must start with / and not be protocol-relative
      const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard"
      url.searchParams.set("next", safePath)
      return NextResponse.redirect(url)
    }
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$).*)"],
}
