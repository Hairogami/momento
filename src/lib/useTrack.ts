"use client"
import { useEffect, useRef } from "react"

/**
 * Cookie sessionId anonyme pour dédup les events sur fenêtre 30min côté serveur.
 * Stocké en localStorage (pas en cookie pour éviter l'envoi automatique).
 */
const SESSION_KEY = "momento_track_sid"
const SESSION_TTL_MS = 30 * 60 * 1000

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr"
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const { id, exp } = JSON.parse(raw) as { id: string; exp: number }
      if (exp > Date.now() && typeof id === "string") return id
    }
  } catch {
    // ignore parse errors
  }
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, exp: Date.now() + SESSION_TTL_MS }))
  } catch {
    // ignore quota errors
  }
  return id
}

export type TrackEventType =
  | "view"
  | "contact_click"
  | "phone_click"
  | "whatsapp_click"
  | "instagram_click"
  | "facebook_click"

async function fire(slug: string, type: TrackEventType) {
  if (typeof window === "undefined") return
  try {
    const sessionId = getOrCreateSessionId()
    const body = JSON.stringify({
      slug,
      type,
      sessionId,
      referrer: document.referrer || undefined,
    })
    // sendBeacon est fire-and-forget, non bloquant, fonctionne même si l'utilisateur quitte la page
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
    }
  } catch {
    // analytics ne doit jamais casser l'UX
  }
}

/**
 * Hook : fire un event "view" au mount pour le slug donné.
 * Retourne une fonction trackClick(type) pour les clics sur contact/phone/WhatsApp/IG/FB.
 */
export function useTrack(slug: string | undefined) {
  const firedRef = useRef(false)
  useEffect(() => {
    if (!slug || firedRef.current) return
    firedRef.current = true
    void fire(slug, "view")
  }, [slug])

  return {
    trackClick: (type: Exclude<TrackEventType, "view">) => {
      if (!slug) return
      void fire(slug, type)
    },
  }
}
