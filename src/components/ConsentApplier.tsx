"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"

/**
 * Applique le consent pending (CGU + marketing) stocké en localStorage
 * avant le redirect OAuth. Se déclenche dès que la session devient authenticated.
 * Monté au layout root via SessionProvider enfant.
 */
export default function ConsentApplier() {
  const { status } = useSession()

  useEffect(() => {
    if (status !== "authenticated") return
    if (typeof window === "undefined") return

    let pending: { agreedTos?: boolean; marketingOptIn?: boolean; ts?: number } | null = null
    try {
      const raw = localStorage.getItem("momento_pending_consent")
      if (!raw) return
      pending = JSON.parse(raw)
    } catch { return }

    if (!pending?.agreedTos) return
    // Expire après 30 min (user couldn't complete OAuth that long)
    if (pending.ts && Date.now() - pending.ts > 30 * 60_000) {
      try { localStorage.removeItem("momento_pending_consent") } catch {}
      return
    }

    fetch("/api/user/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agreedTos: true,
        marketingOptIn: pending.marketingOptIn !== false,
      }),
    })
      .then(r => { if (r.ok) { try { localStorage.removeItem("momento_pending_consent") } catch {} } })
      .catch(() => {})
  }, [status])

  return null
}
