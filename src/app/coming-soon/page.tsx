"use client"

import { useState, useRef, useEffect } from "react"

// Launch date: June 1, 2026
const LAUNCH_DATE = new Date("2026-06-01T00:00:00Z")

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const total = Math.max(0, diff)
  const days    = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, launched: total === 0 }
}

export default function ComingSoonPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { days, hours, minutes, seconds, launched } = useCountdown(LAUNCH_DATE)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleUnlock() {
    if (code.trim().toUpperCase() === "NGF") {
      document.cookie = "momento_bypass=1; max-age=2592000; path=/; SameSite=Lax; Secure"
      window.location.href = "/"
    } else {
      setError(true)
      setShake(true)
      setCode("")
      setTimeout(() => setShake(false), 500)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleUnlock()
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

        {/* Passcode box */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#EDE4CC", border: "1px solid #DDD4BC" }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9A907A" }}>
            Accès privé
          </p>

          <div
            className="flex gap-2"
            style={{ animation: shake ? "shake 0.4s ease" : "none" }}
          >
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false) }}
              onKeyDown={handleKey}
              placeholder="Code d'accès"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "#F5EDD6",
                border: `1.5px solid ${error ? "var(--momento-terra)" : "#DDD4BC"}`,
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

          {error && (
            <p className="text-xs mt-2" style={{ color: "var(--momento-terra)" }}>
              Code incorrect. Réessayez.
            </p>
          )}
        </div>

        <p className="mt-10 text-xs" style={{ color: "#9A907A" }}>
          © 2026 Momento · Tous droits réservés
        </p>
      </div>

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
