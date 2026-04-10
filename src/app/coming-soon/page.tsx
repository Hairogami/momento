"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { DarkModeToggle } from "@/components/DarkModeToggle"

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

  // Déclencher le shake si redirigé depuis /api/unlock avec ?error=1
  useEffect(() => {
    if (searchParams.get("error") === "1") {
      setCodeError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [searchParams])

  function handleUnlock() {
    if (!code.trim()) return
    // Déléguer au serveur — /api/unlock gère la vérification + le cookie + la redirection
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
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#F5EDD6", color: "#1A1208" }}
    >
      {/* Dark mode toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, var(--momento-terra) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">

        {/* Logo */}
        <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-8" style={{ color: "var(--momento-terra)" }}>
          ✦ Momento ✦
        </p>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl font-normal leading-tight mb-3"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            color: "#2C1A0E",
            fontStyle: "italic",
          }}
        >
          {launched ? "Nous sommes en ligne !" : "Bientôt disponible"}
        </h1>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: "#DDD4BC" }} />
          <span style={{ color: "var(--momento-terra)" }}>✦</span>
          <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: "#DDD4BC" }} />
        </div>

        <p className="text-sm mb-8" style={{ color: "#6A5F4A" }}>
          La plateforme des prestataires événementiels au Maroc est en cours de préparation.
          <br />
          <span className="font-medium" style={{ color: "#2C1A0E" }}>Lancement le 1er juin 2026.</span>
        </p>

        {/* Countdown */}
        {!launched && (
          <div className="grid grid-cols-4 gap-3 mb-10">
            {units.map(({ label, value }) => (
              <div key={label} className="rounded-2xl py-4 px-2"
                style={{ backgroundColor: "#EDE4CC", border: "1px solid #DDD4BC" }}>
                <p className="text-3xl sm:text-4xl font-bold tabular-nums"
                  style={{ color: "#2C1A0E", fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {String(value).padStart(2, "0")}
                </p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "#9A907A" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Email waitlist */}
        <div className="rounded-2xl p-6 mb-4"
          style={{ backgroundColor: "#EDE4CC", border: "1px solid #DDD4BC" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#9A907A" }}>
            Soyez les premiers informés
          </p>
          <p className="text-xs mb-4" style={{ color: "#6A5F4A" }}>
            Inscrivez-vous pour recevoir une notification au lancement.
          </p>

          {emailStatus === "success" ? (
            <p className="text-sm font-medium py-3" style={{ color: "var(--momento-terra)" }}>
              ✓ Vous êtes sur la liste !
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailStatus("idle") }}
                onKeyDown={e => e.key === "Enter" && handleWaitlist()}
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "#F5EDD6",
                  border: `1.5px solid ${emailStatus === "error" ? "var(--momento-terra)" : "#DDD4BC"}`,
                  color: "#1A1208",
                }}
              />
              <button
                onClick={handleWaitlist}
                disabled={emailStatus === "loading"}
                className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--momento-terra)", color: "#fff" }}
              >
                {emailStatus === "loading" ? "…" : "OK"}
              </button>
            </div>
          )}
          {emailStatus === "error" && (
            <p className="text-xs mt-2" style={{ color: "var(--momento-terra)" }}>
              Une erreur est survenue. Réessayez.
            </p>
          )}
        </div>

        {/* Passcode */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: "#EDE4CC", border: "1px solid #DDD4BC" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9A907A" }}>
            Accès privé
          </p>
          <div className="flex gap-2"
            style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setCodeError(false) }}
              onKeyDown={e => e.key === "Enter" && handleUnlock()}
              placeholder="Code d'accès"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "#F5EDD6",
                border: `1.5px solid ${codeError ? "var(--momento-terra)" : "#DDD4BC"}`,
                color: "#1A1208",
              }}
            />
            <button
              onClick={handleUnlock}
              className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--momento-terra)", color: "#fff" }}
            >
              →
            </button>
          </div>
          {codeError && (
            <p className="text-xs mt-2" style={{ color: "var(--momento-terra)" }}>
              Code incorrect. Réessayez.
            </p>
          )}
        </div>

        <p className="mt-10 text-xs" style={{ color: "#9A907A" }}>
          © 2026 Momento · Tous droits réservés
        </p>
      </div>

      {/* Cookie consent banner */}
      {consent === "pending" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ backgroundColor: "#2C1A0E", color: "#F5EDD6" }}
        >
          <p className="text-xs text-center sm:text-left" style={{ color: "#DDD4BC" }}>
            Nous utilisons des cookies pour analyser notre audience et améliorer votre expérience.{" "}
            <a href="/legal/privacy" className="underline" style={{ color: "#F5EDD6" }}>En savoir plus</a>
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={refuseCookies}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
              style={{ border: "1px solid #6A5F4A", color: "#9A907A" }}
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--momento-terra)", color: "#fff" }}
            >
              Accepter
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
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
