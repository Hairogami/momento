"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const LS_LIKED   = (pid: string) => `momento_vsw_liked_${pid}`
const LS_SKIPPED = (pid: string) => `momento_vsw_skipped_${pid}`

type VCard = {
  id: string
  name: string
  category: string
  city: string
  rating: number
  priceMin?: number
  coverPhoto?: string
}

const CATEGORY_THEMES: Record<string, { bg: string; emoji: string; accent: string }> = {
  "photo":    { bg: "linear-gradient(145deg,#0f0f1e,#1a1030)", emoji: "📸", accent: "#818cf8" },
  "dj":       { bg: "linear-gradient(145deg,#0d0008,#1a0020)", emoji: "🎧", accent: "#a855f7" },
  "traiteur": { bg: "linear-gradient(145deg,#0e0a00,#1e1200)", emoji: "🍽️", accent: "#f59e0b" },
  "décor":    { bg: "linear-gradient(145deg,#001a0a,#001f10)", emoji: "✨", accent: "#22c55e" },
  "fleur":    { bg: "linear-gradient(145deg,#1a0010,#220018)", emoji: "🌸", accent: "#f472b6" },
  "vidéo":    { bg: "linear-gradient(145deg,#0a0a1a,#0e0e28)", emoji: "🎬", accent: "#60a5fa" },
  "musique":  { bg: "linear-gradient(145deg,#0d0010,#180020)", emoji: "🎵", accent: "#c084fc" },
  "lieu":     { bg: "linear-gradient(145deg,#0a0800,#1a1400)", emoji: "🏛️", accent: "#fbbf24" },
  "default":  { bg: "linear-gradient(145deg,#0f0f14,#191920)", emoji: "⭐", accent: "#e11d48" },
}

function categoryTheme(cat: string) {
  const key = Object.keys(CATEGORY_THEMES).find(k => cat.toLowerCase().includes(k)) ?? "default"
  return CATEGORY_THEMES[key]
}

function lsGet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[]) }
  catch { return new Set() }
}
function lsAdd(key: string, slug: string) {
  try { const s = lsGet(key); s.add(slug); localStorage.setItem(key, JSON.stringify([...s])) }
  catch {}
}
function lsRemove(key: string, slug: string) {
  try { const s = lsGet(key); s.delete(slug); localStorage.setItem(key, JSON.stringify([...s])) }
  catch {}
}
function lsClear(key: string) {
  try { localStorage.removeItem(key) } catch {}
}

const SWIPE_THRESHOLD = 75

export default function VendorSwipeWidget({
  plannerId,
  onOpenModal,
  onLike,
}: {
  plannerId?: string
  onOpenModal?: () => void
  onLike?: () => void
}) {
  const [cards, setCards]     = useState<VCard[]>([])
  const [index, setIndex]     = useState(0)
  const [liked, setLiked]     = useState<string[]>([])
  const [drag, setDrag]       = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<"left" | "right" | null>(null)
  const [history, setHistory] = useState<{ id: string; dir: "left" | "right" }[]>([])

  const dragActive = useRef(false)
  const dragStart  = useRef({ x: 0, y: 0 })

  const loadCards = useCallback((clearSkipped = false) => {
    if (clearSkipped && plannerId) lsClear(LS_SKIPPED(plannerId))
    const likedSet   = plannerId ? lsGet(LS_LIKED(plannerId))   : new Set<string>()
    const skippedSet = (plannerId && !clearSkipped) ? lsGet(LS_SKIPPED(plannerId)) : new Set<string>()
    const seenSet    = new Set([...likedSet, ...skippedSet])

    fetch("/api/vendors?limit=30")
      .then(r => r.json())
      .then(d => {
        const raw: Record<string, unknown>[] = Array.isArray(d?.vendors) ? d.vendors : []
        const filtered = raw
          .filter(v => !seenSet.has((v.slug as string) || (v.id as string)))
          .slice(0, 20)
          .map(v => ({
            id: (v.slug as string) || (v.id as string),
            name: v.name as string,
            category: v.category as string,
            city: (v.city as string) || "",
            rating: typeof v.rating === "number" ? v.rating : 4.5,
            priceMin: v.priceMin as number | undefined,
            coverPhoto: Array.isArray(v.media) && (v.media as { url: string }[]).length > 0
              ? (v.media as { url: string }[])[0].url
              : undefined,
          }))
        setCards(filtered)
        setIndex(0)
        setLiked([])
        setHistory([])
      })
      .catch(() => {})
  }, [plannerId])

  useEffect(() => { loadCards() }, [loadCards])

  const swipe = useCallback((dir: "left" | "right") => {
    const card = cards[index]
    if (!card) return
    setExiting(dir)
    setHistory(h => [...h, { id: card.id, dir }])

    if (dir === "right") {
      setLiked(l => [...l, card.id])
      if (plannerId) {
        lsAdd(LS_LIKED(plannerId), card.id)
        fetch(`/api/planners/${plannerId}/vendors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorSlug: card.id }),
        }).catch(() => {})
        onLike?.()
      }
    } else {
      if (plannerId) lsAdd(LS_SKIPPED(plannerId), card.id)
    }

    setTimeout(() => {
      setExiting(null)
      setDrag({ x: 0, y: 0 })
      setIndex(i => i + 1)
    }, 280)
  }, [cards, index, plannerId])

  function undo() {
    if (history.length === 0 || index === 0) return
    const last = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    if (last.dir === "right") {
      setLiked(l => l.filter(id => id !== last.id))
      if (plannerId) lsRemove(LS_LIKED(plannerId), last.id)
    } else {
      if (plannerId) lsRemove(LS_SKIPPED(plannerId), last.id)
    }
    setIndex(i => Math.max(0, i - 1))
  }

  function onPointerDown(e: React.PointerEvent) {
    dragActive.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragActive.current) return
    setDrag({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }
  function onPointerUp() {
    if (!dragActive.current) return
    dragActive.current = false
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) swipe(drag.x > 0 ? "right" : "left")
    else setDrag({ x: 0, y: 0 })
  }

  const card = cards[index]

  if (!card) return (
    <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>
        Découvrir
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 32, margin: "0 0 10px" }}>🎉</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", margin: "0 0 4px" }}>Tous vus !</p>
        {liked.length > 0 && (
          <p style={{ fontSize: 11, color: "#9a9aaa", marginBottom: 12 }}>
            {liked.length} prestataire{liked.length !== 1 ? "s" : ""} ajouté{liked.length !== 1 ? "s" : ""}
          </p>
        )}
        {liked.length > 0 && (
          <Link href="/mes-prestataires" style={{
            padding: "8px 16px", borderRadius: 99, marginBottom: 8,
            background: "rgba(34,197,94,0.1)", color: "#22c55e",
            fontSize: 11, fontWeight: 600, textDecoration: "none", display: "inline-block",
          }}>Voir mes prestataires →</Link>
        )}
        <button onClick={() => loadCards(true)} style={{
          padding: "7px 18px", borderRadius: 99, marginTop: 4,
          background: "rgba(183,191,217,0.1)", color: "var(--dash-text-2,#6a6a71)",
          border: "1px solid rgba(183,191,217,0.2)",
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>Voir les skippés</button>
      </div>
    </div>
  )

  const theme = categoryTheme(card.category)
  const rot = drag.x * 0.07
  const exitX = exiting === "right" ? 55 : exiting === "left" ? -55 : drag.x
  const exitY = exiting ? 20 : drag.y * 0.25
  const exitRot = exiting === "right" ? 10 : exiting === "left" ? -10 : rot
  const cardOpacity = exiting ? 0 : Math.abs(drag.x) > 20 ? Math.max(0, 1 - (Math.abs(drag.x) - 20) / 150) : 1

  return (
    <div style={{ padding: "20px 20px 16px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em" }}>Découvrir</span>
          {onOpenModal && (
            <button onClick={onOpenModal} title="Ouvrir l'annuaire complet" style={{
              width: 20, height: 20, borderRadius: 6,
              background: "rgba(183,191,217,0.1)", border: "1px solid rgba(183,191,217,0.2)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Google Symbols','Material Symbols Outlined'",
              fontSize: 11, color: "#9a9aaa", fontWeight: "normal",
            }}>open_in_full</button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {liked.length > 0 && (
            <Link href="/mes-prestataires" style={{
              fontSize: 10, fontWeight: 600,
              background: "rgba(34,197,94,0.1)", color: "#22c55e",
              padding: "2px 7px", borderRadius: 99, textDecoration: "none",
            }}>🎉 {liked.length}</Link>
          )}
          <span style={{ fontSize: 10, color: "#9a9aaa" }}>{index + 1}/{cards.length}</span>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        {cards[index + 2] && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: categoryTheme(cards[index + 2].category).bg, opacity: 0.25, transform: "scale(0.90) translateY(12px)" }} />
        )}
        {cards[index + 1] && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: categoryTheme(cards[index + 1].category).bg, opacity: 0.5, transform: "scale(0.95) translateY(6px)" }} />
        )}
        <div
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          style={{
            position: "absolute", inset: 0, borderRadius: 16,
            background: card.coverPhoto ? `url(${card.coverPhoto}) center/cover no-repeat` : theme.bg,
            cursor: dragActive.current ? "grabbing" : "grab",
            userSelect: "none", touchAction: "none",
            transform: `translateX(${exitX}px) translateY(${exitY}px) rotate(${exitRot}deg)`,
            opacity: cardOpacity,
            transition: exiting ? "all 0.28s cubic-bezier(0.4,0,1,1)" : drag.x !== 0 ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex", flexDirection: "column", padding: 18, boxSizing: "border-box", overflow: "hidden",
          }}
        >
          {drag.x > 25 && (
            <div style={{ position: "absolute", top: 14, left: 14, padding: "4px 10px", borderRadius: 8, border: "2px solid #22c55e", color: "#22c55e", fontSize: 11, fontWeight: 800, opacity: Math.min(1, (drag.x - 25) / 55), transform: "rotate(-14deg)", background: "rgba(34,197,94,0.1)" }}>LIKE 🎉</div>
          )}
          {drag.x < -25 && (
            <div style={{ position: "absolute", top: 14, right: 14, padding: "4px 10px", borderRadius: 8, border: "2px solid #ef4444", color: "#ef4444", fontSize: 11, fontWeight: 800, opacity: Math.min(1, (-drag.x - 25) / 55), transform: "rotate(14deg)", background: "rgba(239,68,68,0.1)" }}>SKIP ✕</div>
          )}
          {card.coverPhoto && (
            <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.88) 100%)", pointerEvents: "none" }} />
          )}
          {!card.coverPhoto && (
            <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: theme.accent, opacity: 0.08, filter: "blur(30px)", pointerEvents: "none" }} />
          )}
          {!card.coverPhoto && (
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `${theme.accent}20`, border: `1px solid ${theme.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: "auto" }}>{theme.emoji}</div>
          )}
          {card.coverPhoto && <div style={{ flex: 1 }} />}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{card.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{card.category} · {card.city}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent, background: `${theme.accent}15`, padding: "2px 7px", borderRadius: 99 }}>★ {card.rating.toFixed(1)}</span>
              {card.priceMin && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>dès {card.priceMin.toLocaleString("fr-MA")} MAD</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 14 }}>
        <button onClick={undo} disabled={history.length === 0} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(183,191,217,0.25)", background: "rgba(183,191,217,0.05)", color: history.length === 0 ? "#c9cad0" : "#6a6a71", cursor: history.length === 0 ? "not-allowed" : "pointer", fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>undo</button>
        <button onClick={() => swipe("left")} style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.06)", color: "#ef4444", cursor: "pointer", fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>close</button>
        <button onClick={() => swipe("right")} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: G, color: "#fff", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(225,29,72,0.35)", transition: "all 0.15s" }}>🎉</button>
        <button onClick={() => window.open(`/vendor/${card.id}`, "_blank")} style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(183,191,217,0.25)", background: "rgba(183,191,217,0.05)", color: "#6a6a71", cursor: "pointer", fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>open_in_new</button>
      </div>
    </div>
  )
}
