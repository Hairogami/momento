"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const DISMISS_KEY = "momento_email_banner_dismissed_until"

export default function EmailVerificationBanner() {
  const { data: session, status } = useSession()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(true) // optimist : caché jusqu'au check
  const [checking, setChecking] = useState(false)
  const [verifiedLive, setVerifiedLive] = useState<boolean | null>(null)

  // Lecture initiale du dismiss persisté (sessionStorage 1h)
  useEffect(() => {
    try {
      const until = sessionStorage.getItem(DISMISS_KEY)
      if (until && Number(until) > Date.now()) setDismissed(true)
      else setDismissed(false)
    } catch { setDismissed(false) }
  }, [])

  async function refreshVerification() {
    setChecking(true)
    try {
      const r = await fetch("/api/me", { cache: "no-store" })
      if (r.ok) {
        const u = await r.json()
        setVerifiedLive(Boolean(u?.emailVerified))
      }
    } catch { /* silent */ }
    finally { setChecking(false) }
  }

  useEffect(() => {
    if (status === "authenticated") void refreshVerification()
  }, [status])

  if (status !== "authenticated" || !session?.user?.email) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionVerified = (session.user as any).emailVerified
  // Source de vérité : DB (verifiedLive) > JWT (sessionVerified)
  const isVerified = verifiedLive === true || (verifiedLive === null && Boolean(sessionVerified))
  if (isVerified) return null
  if (dismissed) return null

  async function resend() {
    if (!session?.user?.email) return
    setLoading(true)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      setSent(true)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  function handleDismiss() {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, String(Date.now() + 60 * 60 * 1000)) } catch {}
  }

  return (
    <div role="status" style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "var(--dash-surface, #fff)",
      borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      backdropFilter: "blur(8px)",
      color: "var(--dash-text, #121317)",
      fontSize: "var(--text-sm)", padding: "10px 20px",
      display: "flex", flexWrap: "wrap", alignItems: "center",
      justifyContent: "center", gap: 12, fontFamily: "inherit",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: "50%",
          background: G, color: "#fff",
          fontSize: 11, flexShrink: 0,
        }}>✉</span>
        <span>
          {sent
            ? <><strong>Lien renvoyé.</strong> Pensez à vérifier vos spams.</>
            : <><strong>Confirmez votre e-mail</strong> pour activer toutes les fonctionnalités.</>}
        </span>
      </span>

      {!sent && (
        <button onClick={resend} disabled={loading}
          style={{
            background: G, color: "#fff", border: "none",
            padding: "6px 14px", borderRadius: 999,
            fontSize: "var(--text-xs)", fontWeight: 600,
            cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
            boxShadow: "0 2px 8px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)" }}
        >
          {loading ? "Envoi…" : "Renvoyer"}
        </button>
      )}

      <button onClick={refreshVerification} disabled={checking}
        style={{
          background: "transparent", color: "var(--dash-text-2, #6a6a71)",
          border: "1px solid var(--dash-border, rgba(183,191,217,0.3))",
          padding: "6px 12px", borderRadius: 999,
          fontSize: "var(--text-xs)", fontWeight: 600,
          cursor: checking ? "wait" : "pointer", opacity: checking ? 0.6 : 1,
          fontFamily: "inherit",
        }}>
        {checking ? "Vérif…" : "✓ J'ai vérifié"}
      </button>

      <button onClick={handleDismiss} aria-label="Fermer"
        style={{
          background: "transparent", border: "none",
          color: "var(--dash-text-3, #9a9aaa)",
          fontSize: "var(--text-md)", lineHeight: 1, cursor: "pointer",
          padding: "0 4px", marginLeft: 4,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--dash-text, #121317)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--dash-text-3, #9a9aaa)" }}
      >×</button>
    </div>
  )
}
