"use client"
import { useState, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm]         = useState("")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")
  const [done, setDone]               = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!newPassword || !confirm) { setError("Veuillez remplir tous les champs."); return }
    if (newPassword !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (newPassword.length < 8) { setError("Minimum 8 caractères."); return }
    if (!token) { setError("Lien invalide."); return }
    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return }
    setDone(true)
    setTimeout(() => router.push("/login"), 2500)
  }

  const inputStyle: React.CSSProperties = {
    height: 46, padding: "0 14px", borderRadius: 12,
    border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
    background: "var(--dash-input-bg,#fafafa)",
    fontSize: 14, color: "var(--dash-text,#121317)",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%",
  }

  return (
    <div className="ant-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg,#f7f7fb)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", textDecoration: "none", letterSpacing: "-0.03em" }}>
            Momento
          </Link>
        </div>

        <div style={{
          background: "var(--dash-surface,#fff)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
          borderRadius: 24, padding: "36px 32px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(225,29,72,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12l5 5L20 7" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 10px" }}>Mot de passe modifié !</h2>
              <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)" }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Nouveau mot de passe
              </h1>
              <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 24px" }}>
                Choisis un nouveau mot de passe sécurisé.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="password" placeholder="Nouveau mot de passe" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required minLength={8} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#E11D48")}
                  onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                />
                <input type="password" placeholder="Confirmer" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required minLength={8} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#E11D48")}
                  onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                />

                {error && (
                  <p style={{ fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "rgba(225,29,72,0.07)", color: "#E11D48", margin: 0 }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} style={{
                  height: 46, borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? "Modification…" : "Changer le mot de passe"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--dash-text-2,#6a6a71)" }}>
                <Link href="/login" style={{ color: "var(--dash-text-2,#6a6a71)" }}>← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>
          © 2026 Momento Events
        </p>
      </div>
    </div>
  )
}

export default function CloneResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
