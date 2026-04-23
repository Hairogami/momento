"use client"
import { useEffect, useState } from "react"
import AntConfetti from "./AntConfetti"
import AntFireworks from "./AntFireworks"
import Link from "next/link"

type WordDef = { text: string; color: string }

// 7 types d'événements — couleurs alignées sur l'UI Momento (gradient rose → violet + accents)
// Tous singuliers pour rester grammaticalement corrects avec "Votre …"
const WORDS: WordDef[] = [
  { text: "événement",     color: "#9333EA" }, // violet brand (point de départ, phrase d'origine)
  { text: "mariage",       color: "#E11D48" }, // rose brand
  { text: "henné",         color: "#BE185D" }, // rose foncé (cérémonie traditionnelle marocaine)
  { text: "baby shower",   color: "#EC4899" }, // pink
  { text: "anniversaire",  color: "#F59E0B" }, // amber (raccord étoiles)
  { text: "gala",          color: "#A855F7" }, // purple
  { text: "séminaire",     color: "#6366F1" }, // indigo
]

const PREFIX      = "Votre "
const SUFFIX      = " mérite l'exception. Seulement en 3 clics."
const TYPE_SPEED  = 42   // ms/char — frappe normale
const ERASE_SPEED = 25   // ms/char — gomme plus rapide (feeling "effacement")
const HOLD_MS     = 1800 // ms — temps d'affichage avant d'effacer

type Phase = "init-word" | "init-suffix" | "hold" | "erase" | "type"

export default function AntHero() {
  const [wordIndex, setWordIndex] = useState(0)
  // PREFIX figé : affiché intégralement dès le premier rendu, pas d'animation typewriter dessus
  const [prefixLen] = useState(PREFIX.length)
  const [suffixLen, setSuffixLen] = useState(0)
  const [wordLen,   setWordLen]   = useState(0)
  const [phase,     setPhase]     = useState<Phase>("init-word")
  const [cursor,    setCursor]    = useState(true)

  const currentWord = WORDS[wordIndex]
  const initialDone = phase === "hold" || phase === "erase" || phase === "type"

  // Driver : avance d'un cran à chaque tick selon la phase courante
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    switch (phase) {
      case "init-word":
        if (wordLen < currentWord.text.length) {
          t = setTimeout(() => setWordLen(n => n + 1), TYPE_SPEED)
        } else {
          setPhase("init-suffix")
        }
        break
      case "init-suffix":
        if (suffixLen < SUFFIX.length) {
          t = setTimeout(() => setSuffixLen(n => n + 1), TYPE_SPEED)
        } else {
          setPhase("hold")
        }
        break
      case "hold":
        t = setTimeout(() => setPhase("erase"), HOLD_MS)
        break
      case "erase":
        if (wordLen > 0) {
          t = setTimeout(() => setWordLen(n => n - 1), ERASE_SPEED)
        } else {
          setWordIndex(i => (i + 1) % WORDS.length)
          setPhase("type")
        }
        break
      case "type":
        if (wordLen < currentWord.text.length) {
          t = setTimeout(() => setWordLen(n => n + 1), TYPE_SPEED)
        } else {
          setPhase("hold")
        }
        break
    }
    return () => { if (t) clearTimeout(t) }
  }, [phase, prefixLen, wordLen, suffixLen, currentWord.text.length])

  // Curseur clignotant permanent (couleur adaptée au mot courant)
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(t)
  }, [])

  // Position du curseur selon la phase
  const cursorAt: "word" | "suffix" =
    phase === "init-suffix" ? "suffix" : "word"

  const renderCursor = () => (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "0.06em",
        height: "0.78em",
        backgroundColor: currentWord.color,
        marginLeft: "0.04em",
        verticalAlign: "middle",
        transform: "translateY(-6%)",
        opacity: cursor ? 1 : 0,
        transition: "opacity 0.08s, background-color 0.25s ease",
      }}
    />
  )

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ minHeight: "100dvh", backgroundColor: "var(--dash-bg,#fff)", paddingTop: 56 }}
    >
      <AntConfetti count={170} dark={false} />
      <AntFireworks minInterval={1600} maxInterval={3200} sparkCount={90} />

      <div className="relative z-10 flex flex-col items-center gap-5 px-4" style={{ maxWidth: 1100 }}>
        {/* Brand badge */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="Momento" width={24} height={24} className="clone-logo-light" style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="Momento" width={24} height={24} className="clone-logo-dark" style={{ objectFit: "contain", display: "none" }} />
          <span className="clone-body" style={{ fontSize: 14, fontWeight: 400, color: "var(--dash-text-2,#45474D)" }}>Momento Events</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 0.5rem + 4.5vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--dash-text,#121317)",
            minHeight: "3.5em",
            textAlign: "center",
          }}
        >
          {/* 3 lignes indépendantes, chacune centrée horizontalement sur la page.
              "Votre" n'est jamais impacté par la largeur du mot (lignes séparées). */}
          <span style={{ display: "block" }}>{PREFIX.trimEnd()}</span>
          <span style={{ display: "block", minHeight: "1.1em" }}>
            <span
              style={{
                color: currentWord.color,
                transition: "color 0.25s ease",
                whiteSpace: "pre",
              }}
            >
              {currentWord.text.slice(0, wordLen)}
            </span>
            {cursorAt === "word" && renderCursor()}
          </span>
          <span style={{ display: "block" }}>
            {SUFFIX.slice(1, suffixLen)}
            {cursorAt === "suffix" && renderCursor()}
          </span>
        </h1>

        <div
          className="flex flex-col sm:flex-row items-center gap-3 mt-2"
          style={{
            opacity: initialDone ? 1 : 0,
            transform: initialDone ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full font-medium transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))",
              color: "#fff",
              padding: "15.6px 31.2px", // +30% vs 12px/24px
              fontSize: "18.2px",        // +30% vs 14px (text-sm)
            }}
          >
            Créer mon événement
          </Link>
          <Link
            href="/explore"
            className="clone-cta-ghost flex items-center gap-2 rounded-full font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "rgba(183,191,217,0.12)",
              color: "var(--dash-text,#121317)",
              border: "1px solid rgba(183,191,217,0.3)",
              padding: "15.6px 31.2px",
              fontSize: "18.2px",
            }}
          >
            Explorer les prestataires
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-1"
          style={{
            opacity: initialDone ? 1 : 0,
            transform: initialDone ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#F59E0B", fontSize: 14 }}>★★★★★</span>
            <span className="clone-body" style={{ fontSize: 13, color: "var(--dash-text-2,#45474D)" }}>4.8/5 · 2 300+ événements organisés</span>
          </div>
          <span className="hidden sm:block" style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(183,191,217,0.6)" }} />
          <span className="clone-muted" style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)" }}>1 000+ prestataires vérifiés · 41 villes</span>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40"
        style={{ color: "var(--dash-text-2,#45474D)" }}
      >
        <div className="w-0.5 h-8 bg-current rounded-full animate-bounce" />
      </div>
    </section>
  )
}
