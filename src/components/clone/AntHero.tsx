"use client"
import { useEffect, useState } from "react"
import AntConfetti from "./AntConfetti"
import Link from "next/link"

const HERO_TEXT = "Votre événement mérite les meilleurs. Trouvez-les en 3 clics."

export default function AntHero() {
  const [typed, setTyped]   = useState("")
  const [cursor, setCursor] = useState(true)
  const [done, setDone]     = useState(false)

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i++
      setTyped(HERO_TEXT.slice(0, i))
      if (i >= HERO_TEXT.length) { clearInterval(t); setDone(true) }
    }, 42)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(t)
  }, [done])

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ minHeight: "100dvh", backgroundColor: "#fff", paddingTop: 56 }}
    >
      <AntConfetti count={170} dark={false} />

      <div className="relative z-10 flex flex-col items-center gap-5 px-4" style={{ maxWidth: 1100 }}>
        {/* Brand badge */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="Momento" width={24} height={24} className="clone-logo-light" style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="Momento" width={24} height={24} className="clone-logo-dark" style={{ objectFit: "contain", display: "none" }} />
          <span className="clone-body" style={{ fontSize: 14, fontWeight: 400, color: "#45474D" }}>Momento Events</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#121317",
            minHeight: "2.3em",
          }}
        >
          {typed}
          {!done && (
            <span style={{
              display: "inline-block", width: "0.06em", height: "0.82em",
              backgroundColor: "#121317", marginLeft: "0.05em",
              verticalAlign: "text-bottom", opacity: cursor ? 1 : 0,
              transition: "opacity 0.08s",
            }}/>
          )}
        </h1>

        <div
          className="flex flex-col sm:flex-row items-center gap-3 mt-2"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <Link
            href="/explore"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", color: "#fff" }}
          >
            Trouver mon prestataire
          </Link>
          <Link
            href="#comment-ca-marche"
            className="clone-cta-ghost flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "rgba(183,191,217,0.12)",
              color: "#121317",
              border: "1px solid rgba(183,191,217,0.3)",
            }}
          >
            Voir comment ça marche
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-1"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#F59E0B", fontSize: 14 }}>★★★★★</span>
            <span className="clone-body" style={{ fontSize: 13, color: "#45474D" }}>4.8/5 · 2 300+ événements organisés</span>
          </div>
          <span className="hidden sm:block" style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(183,191,217,0.6)" }} />
          <span className="clone-muted" style={{ fontSize: 13, color: "#6a6a71" }}>1 000+ prestataires vérifiés · 41 villes</span>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40"
        style={{ color: "#45474D" }}
      >
        <div className="w-0.5 h-8 bg-current rounded-full animate-bounce" />
      </div>
    </section>
  )
}
