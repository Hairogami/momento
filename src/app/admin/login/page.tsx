"use client"
import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

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
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px",
  borderRadius: 10, border: `1px solid ${C.border}`,
  background: "#0b0b10", fontSize: "var(--text-sm)", color: C.text,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
}

function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, status } = useSession()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Si déjà connecté et admin → redirect direct
  useEffect(() => {
    if (status === "authenticated") {
      const u = session?.user as { role?: string } | undefined
      if (u?.role === "admin") {
        router.replace("/admin")
      } else if (u?.role) {
        setError("Accès refusé — ce compte n'est pas admin.")
      }
    }
  }, [status, session, router])

  // Erreur passée en query (?error=access_denied)
  useEffect(() => {
    if (params.get("error") === "access_denied") {
      setError("Accès refusé — ce compte n'est pas admin.")
    }
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (res?.error) {
        setError("Email ou mot de passe incorrect.")
      } else {
        // Session mise à jour → useEffect redirige
      }
    } catch {
      setError("Erreur réseau, réessaye.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", background: C.bg, color: C.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: 8,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="Momento" width={28} height={28} style={{ objectFit: "contain", opacity: 0.9 }} />
            <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: C.text }}>Momento</span>
            <span style={{
              fontSize: "var(--text-2xs)", fontWeight: 700, color: C.accent,
              background: "rgba(147,51,234,0.15)", border: `1px solid rgba(147,51,234,0.3)`,
              borderRadius: 4, padding: "2px 6px", letterSpacing: "0.05em",
            }}>ADMIN</span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: C.textDim, margin: 0 }}>
            Accès réservé à l&apos;équipe interne
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "32px 28px",
        }}>
          <h1 style={{
            fontSize: "var(--text-md)", fontWeight: 700, color: C.text,
            margin: "0 0 4px", letterSpacing: "-0.02em",
          }}>
            Connexion admin
          </h1>
          <p style={{ fontSize: "var(--text-xs)", color: C.textMuted, margin: "0 0 24px" }}>
            Utilise tes identifiants d&apos;équipe
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 18,
              fontSize: "var(--text-xs)", color: C.error,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: "var(--text-xs)", color: C.textMuted, display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@momentoevents.app"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.accent)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </div>

            <div>
              <label style={{ fontSize: "var(--text-xs)", color: C.textMuted, display: "block", marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.accent)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                marginTop: 6,
                height: 46, borderRadius: 10, border: "none",
                background: loading || !email || !password
                  ? C.border
                  : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
                color: "#fff", fontSize: "var(--text-sm)", fontWeight: 700,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "opacity 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Connexion…" : "Accéder au panel"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "var(--text-2xs)", color: C.textDim, marginTop: 20 }}>
          Ce panneau est réservé à l&apos;équipe Momento.
          Toute tentative non autorisée est journalisée.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}
