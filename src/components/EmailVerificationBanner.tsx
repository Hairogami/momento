"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function EmailVerificationBanner() {
  const { data: session, status } = useSession()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (status !== "authenticated" || !session?.user?.email) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailVerified = (session.user as any).emailVerified
  if (emailVerified) return null
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
      color: "#9A3412", fontSize: 13, padding: "10px 16px",
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
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}>
          {loading ? "Envoi…" : "Renvoyer l'e-mail"}
        </button>
      )}
      <button onClick={() => setDismissed(true)} aria-label="Fermer"
        style={{
          background: "transparent", border: "none", color: "#9A3412",
          fontSize: 18, lineHeight: 1, cursor: "pointer", padding: "0 4px",
        }}>×</button>
    </div>
  )
}
