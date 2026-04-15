"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export function AntLoginGreeting() {
  const [returning, setReturning] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setReturning(!!localStorage.getItem("momento_has_logged_in"))
    } catch { setReturning(false) }
  }, [])

  if (returning === null) return null // évite le flash

  return (
    <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
      {returning ? "Bon retour 👋" : "Bienvenue 👋"}
    </h2>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px",
  borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
  background: "var(--dash-input-bg,#fafafa)", fontSize: 14, color: "var(--dash-text,#121317)",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
}

export default function AntLoginForm() {
  const [mode, setMode]       = useState<"login" | "register">("login")
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]       = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    const res = await signIn("credentials", { email, password, rememberMe: "true", redirect: false })
    setLoading(false)
    if (res?.error) setError("Email ou mot de passe incorrect.")
    else { try { localStorage.setItem("momento_has_logged_in", "1") } catch {} ; window.location.href = "/accueil" }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    const r = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!r.ok) { const d = await r.json(); setError(d.error || "Erreur inscription"); setLoading(false); return }
    const res = await signIn("credentials", { email, password, rememberMe: "true", redirect: false })
    setLoading(false)
    if (res?.error) { setError("Compte créé ! Connectez-vous."); setMode("login") }
    else { try { localStorage.setItem("momento_has_logged_in", "1") } catch {} ; window.location.href = "/accueil" }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mode toggle */}
      <div style={{
        display: "flex", background: "var(--dash-faint-2,#f0f0f8)", borderRadius: 12, padding: 4, gap: 4,
      }}>
        {(["login", "register"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError("") }}
            style={{
              flex: 1, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: mode === m ? 600 : 400, fontFamily: "inherit",
              background: mode === m ? "var(--dash-surface,#fff)" : "transparent",
              color: mode === m ? "var(--dash-text,#121317)" : "var(--dash-text-2,#6a6a71)",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>
            {m === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "register" && (
          <input placeholder="Prénom" value={name} onChange={e => setName(e.target.value)}
            required style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#E11D48")}
            onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          required style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "#E11D48")}
          onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
        <input type="password" placeholder="Mot de passe" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "#E11D48")}
          onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />

        {mode === "login" && (
          <div style={{ textAlign: "right" }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", textDecoration: "none" }}>
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        {error && (
          <p style={{
            fontSize: 13, padding: "10px 14px", borderRadius: 10,
            background: "rgba(225,29,72,0.07)", color: "#E11D48",
          }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={{
          height: 46, borderRadius: 12, border: "none", cursor: loading ? "wait" : "pointer",
          background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
          color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
        }}>
          {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>
    </div>
  )
}
