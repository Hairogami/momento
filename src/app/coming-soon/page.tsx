"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const LAUNCH_DATE = new Date("2026-06-01T00:00:00Z")

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const total   = Math.max(0, diff)
  const days    = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, launched: total === 0 }
}

function getCookie(name: string) {
  return document.cookie.split(";").find(c => c.trim().startsWith(name + "="))?.split("=")[1]?.trim()
}

function ComingSoonInner() {
  const searchParams = useSearchParams()

  const [code, setCode]               = useState("")
  const [codeError, setCodeError]     = useState(false)
  const [shake, setShake]             = useState(false)
  const [email, setEmail]             = useState("")
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [consent, setConsent]         = useState<"pending" | "accepted" | "refused">("pending")
  const inputRef = useRef<HTMLInputElement>(null)
  const { days, hours, minutes, seconds, launched } = useCountdown(LAUNCH_DATE)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const saved = getCookie("cookie_consent")
    if (saved === "accepted" || saved === "refused") setConsent(saved)
  }, [])

  useEffect(() => {
    if (searchParams.get("error") === "1") {
      setCodeError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [searchParams])

  function handleUnlock() {
    if (!code.trim()) return
    window.location.href = `/api/unlock?key=${encodeURIComponent(code.trim())}`
  }

  async function handleWaitlist() {
    if (!email || emailStatus === "loading") return
    setEmailStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setEmailStatus(res.ok ? "success" : "error")
      if (res.ok) setEmail("")
    } catch {
      setEmailStatus("error")
    }
  }

  function acceptCookies() {
    document.cookie = "cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax"
    setConsent("accepted")
  }

  function refuseCookies() {
    document.cookie = "cookie_consent=refused; max-age=31536000; path=/; SameSite=Lax"
    setConsent("refused")
  }

  const units = [
    { label: "Jours",    value: days },
    { label: "Heures",   value: hours },
    { label: "Minutes",  value: minutes },
    { label: "Secondes", value: seconds },
  ]

  return (
    <div
      className="ant-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background: "var(--dash-bg,#f7f7fb)",
      }}
    >
      {/* ── Left panel — brand gradient ── */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: 460,
          flexShrink: 0,
          background: "linear-gradient(145deg, var(--g1,#E11D48) 0%, var(--g2,#9333EA) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -120, right: -80,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -100, left: -100,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
        }} />

        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          height: "100%", padding: "48px 52px", position: "relative", zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="Momento" width={32} height={32} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Momento</span>
          </div>

          {/* Middle — tagline */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)", margin: "0 0 16px",
            }}>
              ✦ Bientôt disponible
            </p>
            <h1 style={{
              fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 700, color: "#fff",
              lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 16px",
            }}>
              L&apos;événement parfait<br />commence ici.
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
              La marketplace des prestataires événementiels au Maroc — lancement le 1ᵉʳ juin 2026.
            </p>

            {/* Social proof */}
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { quote: "\"Trouvé mon photographe en 10 minutes. Incroyable.\"", author: "Sara M. · Mariage Casablanca" },
                { quote: "\"Mon séminaire organisé sans stress. Merci Momento !\"", author: "Youssef B. · Corporate Rabat" },
              ].map(t => (
                <div key={t.author} style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 16, padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}>
                  <p style={{ fontSize: 13, color: "#fff", margin: "0 0 8px", lineHeight: 1.5 }}>{t.quote}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0 }}>{t.author}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            © 2026 Momento Events
          </p>
        </div>
      </div>

      {/* ── Right panel — countdown + forms ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>
              M
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text,#121317)" }}>Momento</span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 28, fontWeight: 700, color: "var(--dash-text,#121317)",
            letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2,
          }}>
            {launched ? "Nous sommes en ligne !" : "Le compte à rebours est lancé"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 28px", lineHeight: 1.5 }}>
            Inscris-toi pour être prévenu au lancement, ou utilise ton code d&apos;accès privé.
          </p>

          {/* Countdown */}
          {!launched && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10, marginBottom: 24,
            }}>
              {units.map(({ label, value }) => (
                <div key={label} style={{
                  background: "var(--dash-surface,#fff)",
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                  borderRadius: 14, padding: "14px 4px", textAlign: "center",
                }}>
                  <p style={{
                    fontSize: 24, fontWeight: 700, margin: 0,
                    fontVariantNumeric: "tabular-nums",
                    background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    {String(value).padStart(2, "0")}
                  </p>
                  <p style={{
                    fontSize: 10, color: "var(--dash-text-3,#9a9aaa)",
                    textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 0",
                    fontWeight: 600,
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Waitlist card */}
          <div style={{
            background: "var(--dash-surface,#fff)",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
            borderRadius: 16, padding: "20px 22px", marginBottom: 12,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 6px",
            }}>
              Rejoins la liste d&apos;attente
            </p>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 14px", lineHeight: 1.5 }}>
              Sois notifié dès l&apos;ouverture et reçois un accès anticipé.
            </p>

            {emailStatus === "success" ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(34,197,94,0.08)", color: "#16a34a", fontSize: 13, fontWeight: 500,
              }}>
                ✓ Tu es sur la liste — à très vite !
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailStatus("idle") }}
                  onKeyDown={e => e.key === "Enter" && handleWaitlist()}
                  placeholder="toi@exemple.com"
                  style={{
                    flex: 1, height: 44, padding: "0 14px", borderRadius: 12,
                    border: `1px solid ${emailStatus === "error" ? "var(--g1,#E11D48)" : "var(--dash-border,rgba(183,191,217,0.4))"}`,
                    background: "var(--dash-input-bg,#fafafa)",
                    fontSize: 14, color: "var(--dash-text,#121317)", outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleWaitlist}
                  disabled={emailStatus === "loading"}
                  style={{
                    height: 44, padding: "0 20px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    opacity: emailStatus === "loading" ? 0.6 : 1,
                    fontFamily: "inherit", flexShrink: 0,
                  }}
                >
                  {emailStatus === "loading" ? "…" : "Rejoindre"}
                </button>
              </div>
            )}
            {emailStatus === "error" && (
              <p style={{ fontSize: 12, color: "var(--g1,#E11D48)", margin: "8px 0 0" }}>
                Une erreur est survenue. Réessaie.
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--dash-border,rgba(183,191,217,0.3))" }} />
            <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              accès privé
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--dash-border,rgba(183,191,217,0.3))" }} />
          </div>

          {/* Passcode card */}
          <div style={{ animation: shake ? "cs-shake 0.4s ease" : "none" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                type="password"
                value={code}
                onChange={e => { setCode(e.target.value); setCodeError(false) }}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                placeholder="Code d'accès"
                style={{
                  flex: 1, height: 46, padding: "0 14px", borderRadius: 12,
                  border: `1px solid ${codeError ? "var(--g1,#E11D48)" : "var(--dash-border,rgba(183,191,217,0.4))"}`,
                  background: "var(--dash-input-bg,#fafafa)",
                  fontSize: 14, color: "var(--dash-text,#121317)", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleUnlock}
                style={{
                  height: 46, width: 56, borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                  background: "var(--dash-surface,#fff)",
                  color: "var(--dash-text,#121317)", fontSize: 18, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", flexShrink: 0,
                }}
              >
                →
              </button>
            </div>
            {codeError && (
              <p style={{ fontSize: 12, color: "var(--g1,#E11D48)", margin: "8px 0 0" }}>
                Code incorrect. Réessaie.
              </p>
            )}
          </div>

          <p style={{
            fontSize: 12, color: "var(--dash-text-3,#9a9aaa)",
            textAlign: "center", marginTop: 32,
          }}>
            © 2026 Momento · Tous droits réservés
          </p>
        </div>
      </div>

      {/* Cookie consent */}
      {consent === "pending" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          padding: "16px 24px",
          background: "var(--dash-surface,#fff)",
          borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: 0, flex: 1, minWidth: 240 }}>
            Nous utilisons des cookies pour analyser notre audience et améliorer ton expérience.{" "}
            <a href="/confidentialite" style={{ color: "var(--dash-text,#121317)", textDecoration: "underline" }}>
              En savoir plus
            </a>
          </p>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={refuseCookies}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                background: "transparent", color: "var(--dash-text-2,#6a6a71)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: "none",
                background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                color: "#fff", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Accepter
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cs-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoonInner />
    </Suspense>
  )
}
