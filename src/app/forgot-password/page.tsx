"use client"
import { useState, FormEvent } from "react"
import Link from "next/link"
import Turnstile from "@/components/Turnstile"

export default function CloneForgotPasswordPage() {
  const [email, setEmail]         = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!email) { setError("Saisis ton adresse e-mail."); return }
    setLoading(true)
    if (turnstileRequired && !turnstileToken) {
      setError("Veuillez compléter la vérification anti-bot."); setLoading(false); return
    }
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, turnstileToken: turnstileToken || undefined }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="ant-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg,#f7f7fb)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--dash-text,#121317)", textDecoration: "none", letterSpacing: "-0.03em" }}>
            Momento
          </Link>
        </div>

        <div style={{
          background: "var(--dash-surface,#fff)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
          borderRadius: 24, padding: "36px 32px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}>
          {!submitted ? (
            <>
              <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Mot de passe oublié
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)", margin: "0 0 24px", lineHeight: 1.5 }}>
                Saisis ton e-mail et nous t&apos;enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="email" placeholder="toi@exemple.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={{
                    height: 46, padding: "0 14px", borderRadius: 12,
                    border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                    background: "var(--dash-input-bg,#fafafa)",
                    fontSize: "var(--text-sm)", color: "var(--dash-text,#121317)",
                    outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#E11D48")}
                  onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                />

                <Turnstile onToken={setTurnstileToken} onError={() => setTurnstileToken("")} />

                {error && (
                  <p style={{ fontSize: "var(--text-sm)", padding: "10px 14px", borderRadius: 10, background: "rgba(225,29,72,0.07)", color: "#E11D48", margin: 0 }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} style={{
                  height: 46, borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                  color: "#fff", fontSize: "var(--text-sm)", fontWeight: 600,
                  cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)" }}>
                <Link href="/login" style={{ color: "var(--dash-text-2,#6a6a71)" }}>← Retour à la connexion</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(225,29,72,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12l5 5L20 7" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 10px" }}>E-mail envoyé !</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.6, margin: "0 0 20px" }}>
                Si un compte existe pour <strong style={{ color: "var(--dash-text,#121317)" }}>{email}</strong>, tu recevras un lien de réinitialisation.
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", marginBottom: 24 }}>Vérifie également tes spams.</p>
              <Link href="/login" style={{
                display: "inline-block", padding: "12px 28px", borderRadius: 12,
                background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                color: "#fff", fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none",
              }}>
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>
          © 2026 Momento Events
        </p>
      </div>
    </div>
  )
}
