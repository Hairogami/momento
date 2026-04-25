"use client"

import { useEffect, useRef, useState } from "react"

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js"

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey: string
        callback: (token: string) => void
        "error-callback"?: () => void
        "expired-callback"?: () => void
        theme?: "light" | "dark" | "auto"
        size?: "normal" | "compact" | "flexible"
      }) => string
      remove: (id: string) => void
      reset: (id?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

let scriptLoaded = false
let loadPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve()
    if (window.turnstile) { scriptLoaded = true; return resolve() }
    const s = document.createElement("script")
    s.src = SCRIPT_URL
    s.async = true
    s.defer = true
    s.onload = () => { scriptLoaded = true; resolve() }
    s.onerror = () => reject(new Error("Turnstile script failed to load"))
    document.head.appendChild(s)
  })
  return loadPromise
}

interface Props {
  onToken: (token: string) => void
  onError?: () => void
  theme?: "light" | "dark" | "auto"
}

export default function Turnstile({ onToken, onError, theme = "auto" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [enabled] = useState(() => !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  useEffect(() => {
    if (!enabled || !ref.current) return
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: onToken,
          "error-callback": onError,
          "expired-callback": () => onToken(""),
          theme,
          size: "flexible",
        })
      })
      .catch(() => onError?.())

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, theme])

  if (!enabled) return null
  return <div ref={ref} style={{ display: "flex", justifyContent: "center", margin: "8px 0" }} />
}
