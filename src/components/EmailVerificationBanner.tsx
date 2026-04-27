"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function EmailVerificationBanner() {
  const { data: session, status } = useSession()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [verifiedLive, setVerifiedLive] = useState<boolean | null>(null)

  // Le JWT NextAuth ne se rafraîchit pas après que l'user clique le lien de vérif
  // (jwt callback ne re-fetche emailVerified que sur sign-in). On va donc lire
  // la vérité depuis /api/me au mount, et offrir un bouton de re-check.
  async function refreshVerification() {
    setChecking(true)
    try {
      const r = await fetch("/api/me", { cache: "no-store" })
      if (r.ok) {
        const u = await r.json()
        setVerifiedLive(Boolean(u?.emailVerified))
      }
    } catch {
      // silent — keep showing banner
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") void refreshVerification()
  }, [status])

  if (status !== "authenticated" || !session?.user?.email) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionVerified = (session.user as any).emailVerified
  if (sessionVerified || verifiedLive) return null
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
    } catch {
      // silent — UI remains
    } finally {
      setLoading(false)
    }
  }

  return (
    <div role="status" style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "#FFF7ED", borderBottom: "1px solid #FED7AA",
      color: "#9A3412", fontSize: "var(--text-sm)", padding: "10px 16px",
      display: "flex", flexWrap: "wrap", alignItems: "center",
      justifyContent: "center", gap: 12, fontFamily: "inherit",
    }}>
      <span>
        <strong style={{ marginRight: 6 }}>📧 Vérifiez votre e-mail</strong>
        {sent
          ? "Lien renvoyé. Pensez à vérifier vos spams."
          : "Cliquez sur le lien envoyé à votre adresse pour activer toutes les fonctionnalités."}
      </span>
      {!sent && (
        <button onClick={resend} disabled={loading}
          style={{
            background: "#C4532A", color: "#fff", border: "none",
            padding: "6px 14px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
            cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}>
          {loading ? "Envoi…" : "Renvoyer l'e-mail"}
        </button>
      )}
      <button onClick={refreshVerification} disabled={checking}
        style={{
          background: "transparent", color: "#9A3412",
          border: "1px solid #FED7AA",
          padding: "6px 12px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
          cursor: checking ? "wait" : "pointer", opacity: checking ? 0.6 : 1,
          fontFamily: "inherit",
        }}>
        {checking ? "Vérif…" : "✓ J'ai vérifié"}
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Fermer"
        style={{
          background: "transparent", border: "none", color: "#9A3412",
          fontSize: "var(--text-md)", lineHeight: 1, cursor: "pointer", padding: "0 4px",
        }}>×</button>
    </div>
  )
}
