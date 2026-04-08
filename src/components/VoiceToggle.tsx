"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export default function VoiceToggle() {
  const [enabled, setEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
      setSupported(true)
      const saved = localStorage.getItem("momento_voice")
      if (saved === "on") setEnabled(true)
    }
  }, [])

  const stop = useCallback(() => {
    synthRef.current?.cancel()
    setSpeaking(false)
  }, [])

  // Speak text helper
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "fr-FR"
    utt.rate = 1.05
    utt.pitch = 1
    // Pick a French voice if available
    const voices = synthRef.current.getVoices()
    const fr = voices.find(v => v.lang.startsWith("fr")) || voices[0]
    if (fr) utt.voice = fr
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    synthRef.current.speak(utt)
  }, [])

  // When enabled: listen for clicks on text elements
  useEffect(() => {
    if (!supported || !enabled) {
      stop()
      return
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      // Walk up DOM to find readable text
      const readable = target.closest("p, h1, h2, h3, h4, h5, li, span, a, button, label, td, th, div[data-speak]")
      if (!readable) return
      const text = (readable as HTMLElement).innerText?.trim()
      if (text && text.length > 1) speak(text)
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [enabled, supported, speak, stop])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem("momento_voice", next ? "on" : "off")
    if (!next) stop()
  }

  if (!supported) return null

  return (
    <button
      onClick={toggle}
      title={enabled ? "Désactiver la voix" : "Activer la voix (cliquez sur un texte pour l'écouter)"}
      aria-label={enabled ? "Désactiver la voix" : "Activer la voix"}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl transition-all duration-300 text-sm font-semibold select-none"
      style={{
        backgroundColor: enabled ? "var(--momento-terra)" : "rgba(30,26,20,0.92)",
        color: "#fff",
        border: "1.5px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        boxShadow: enabled
          ? "0 0 18px rgba(var(--momento-terra-rgb),0.45), 0 4px 16px rgba(0,0,0,0.35)"
          : "0 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      {/* Wave animation when speaking */}
      {speaking ? (
        <span className="flex items-end gap-0.5 h-4">
          {[0.3, 0.6, 1, 0.7, 0.4].map((h, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full"
              style={{
                backgroundColor: "#fff",
                height: `${h * 100}%`,
                animation: `voiceBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {enabled ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          )}
        </svg>
      )}
      <span>{enabled ? (speaking ? "En cours…" : "Voix ON") : "Voix OFF"}</span>
      <style>{`
        @keyframes voiceBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </button>
  )
}
