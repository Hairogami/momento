"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"

const C = {
  bg:        "#0b0b10",
  panel:     "#13141c",
  border:    "#252633",
  text:      "#f0f0f5",
  textMuted: "#9a9aaa",
  textDim:   "#6a6a78",
  accent:    "#9333EA",
  accent2:   "#E11D48",
  error:     "#ef4444",
  ok:        "#22c55e",
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px",
  borderRadius: 10, border: `1px solid ${C.border}`,
  background: C.bg, fontSize: "var(--text-sm)", color: C.text,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
}

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const email = (session?.user as { email?: string } | undefined)?.email ?? ""

  const [current, setCurrent]   = useState("")
  const [next, setNext]         = useState("")
  const [confirm, setConfirm]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (next.length < 8)  { setError("Minimum 8 caractères."); return }
    setLoading(true); setError(null); setSuccess(false)
    try {
      const res = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erreur serveur."); return }
      setSuccess(true)
      setCurrent(""); setNext(""); setConfirm("")
    } catch {
      setError("Erreur réseau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
        Mon profil
      </h1>
      <p style={{ fontSize: "var(--text-xs)", color: C.textMuted, margin: "0 0 32px" }}>{email}</p>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 24px" }}>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text, margin: "0 0 20px" }}>
          Changer le mot de passe
        </h2>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "var(--text-xs)", color: C.error }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "var(--text-xs)", color: C.ok }}>
            Mot de passe mis à jour.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "var(--text-xs)", color: C.textMuted, display: "block", marginBottom: 6 }}>Mot de passe actuel</label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required autoComplete="current-password" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", color: C.textMuted, display: "block", marginBottom: 6 }}>Nouveau mot de passe</label>
            <input type="password" value={next} onChange={e => setNext(e.target.value)} required autoComplete="new-password" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-xs)", color: C.textMuted, display: "block", marginBottom: 6 }}>Confirmer</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            style={{
              marginTop: 6, height: 44, borderRadius: 10, border: "none",
              background: loading || !current || !next || !confirm ? C.border : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
              color: "#fff", fontSize: "var(--text-sm)", fontWeight: 700,
              cursor: loading || !current || !next || !confirm ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  )
}
