"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type VCard = {
  id: string
  name: string
  category: string
  city: string
  rating: number
  priceMin?: number
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
  const key = Object.keys(CATEGORY_THEMES).find(k =>
    cat.toLowerCase().includes(k)
  ) ?? "default"
  return CATEGORY_THEMES[key]
}


const SWIPE_THRESHOLD = 75

export default function VendorSwipeWidget({ onOpenModal }: { onOpenModal?: () => void }) {
  const [cards, setCards] = useState<VCard[]>([])
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState<string[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<"left" | "right" | null>(null)
  const [history, setHistory] = useState<{ id: string; dir: "left" | "right" }[]>([])

  const dragActive = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    fetch("/api/vendors?limit=12")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d?.vendors) && d.vendors.length > 0) {
          setCards(d.vendors.slice(0, 12).map((v: Record<string, unknown>) => ({
            id: (v.slug as string) || (v.id as string),
            name: v.name as string,
            category: v.category as string,
            city: (v.city as string) || "",
            rating: typeof v.rating === "number" ? v.rating : 4.5,
            priceMin: v.priceMin as number | undefined,
          })))
          setIndex(0)
        }
      })
      .catch(() => {})
  }, [])

  const swipe = useCallback((dir: "left" | "right") => {
    const card = cards[index]
    if (!card) return
    setExiting(dir)
    setHistory(h => [...h, { id: card.id, dir }])
    if (dir === "right") setLiked(l => [...l, card.id])
    else setSkipped(s => [...s, card.id])
    setTimeout(() => {
      setExiting(null)
      setDrag({ x: 0, y: 0 })
      setIndex(i => i + 1)
    }, 280)
  }, [cards, index])

  function undo() {
    if (history.length === 0 || index === 0) return
    const last = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    if (last.dir === "right") setLiked(l => l.filter(id => id !== last.id))
    else setSkipped(s => s.filter(id => id !== last.id))
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
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) {
      swipe(drag.x > 0 ? "right" : "left")
    } else {
      setDrag({ x: 0, y: 0 })
    }
  }

  const card = cards[index]

  // Empty state
  if (!card) return (
    <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>
        Découvrir
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 32, margin: "0 0 10px" }}>🎉</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#121317", margin: "0 0 4px" }}>
          Tous vus !
        </p>
        <p style={{ fontSize: 11, color: "#9a9aaa", marginBottom: 16 }}>
          {liked.length} ajouté{liked.length !== 1 ? "s" : ""} aux favoris
        </p>
        <button
          onClick={() => { setIndex(0); setLiked([]); setSkipped([]); setHistory([]) }}
          style={{
            padding: "8px 20px", borderRadius: 99,
            background: G, color: "#fff", border: "none",
            fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >Recommencer</button>
      </div>
    </div>
  )

  const theme = categoryTheme(card.category)
  const rot = drag.x * 0.07
  const exitX = exiting === "right" ? 280 : exiting === "left" ? -280 : drag.x
  const exitY = exiting ? 60 : drag.y * 0.25
  const exitRot = exiting === "right" ? 18 : exiting === "left" ? -18 : rot
  const cardOpacity = exiting ? 0 : Math.abs(drag.x) > 20 ? Math.max(0, 1 - (Math.abs(drag.x) - 20) / 150) : 1

  return (
    <div style={{ padding: "20px 20px 16px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Découvrir
          </span>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              title="Ouvrir l'annuaire complet"
              style={{
                width: 20, height: 20, borderRadius: 6,
                background: "rgba(183,191,217,0.1)",
                border: "1px solid rgba(183,191,217,0.2)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Google Symbols','Material Symbols Outlined'",
                fontSize: 11, color: "#9a9aaa", fontWeight: "normal",
              }}
            >open_in_full</button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {liked.length > 0 && (
            <Link href="/favorites" style={{
              fontSize: 10, fontWeight: 600,
              background: "rgba(34,197,94,0.1)", color: "#22c55e",
              padding: "2px 7px", borderRadius: 99, textDecoration: "none",
            }}>♥ {liked.length}</Link>
          )}
          <span style={{ fontSize: 10, color: "#9a9aaa" }}>
            {index + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Card stack */}
      <div style={{
        flex: 1, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 0,
      }}>
        {/* Shadow card +2 */}
        {cards[index + 2] && (
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: 16,
            background: categoryTheme(cards[index + 2].category).bg,
            opacity: 0.25,
            transform: "scale(0.90) translateY(12px)",
          }} />
        )}
        {/* Shadow card +1 */}
        {cards[index + 1] && (
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: 16,
            background: categoryTheme(cards[index + 1].category).bg,
            opacity: 0.5,
            transform: "scale(0.95) translateY(6px)",
          }} />
        )}

        {/* Active card */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "absolute", inset: 0,
            borderRadius: 16,
            background: theme.bg,
            cursor: dragActive.current ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            transform: `translateX(${exitX}px) translateY(${exitY}px) rotate(${exitRot}deg)`,
            opacity: cardOpacity,
            transition: exiting
              ? "all 0.28s cubic-bezier(0.4,0,1,1)"
              : drag.x !== 0 ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex", flexDirection: "column",
            padding: 18, boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Decision overlays */}
          {drag.x > 25 && (
            <div style={{
              position: "absolute", top: 14, left: 14,
              padding: "4px 10px", borderRadius: 8,
              border: `2px solid #22c55e`, color: "#22c55e",
              fontSize: 11, fontWeight: 800,
              opacity: Math.min(1, (drag.x - 25) / 55),
              transform: "rotate(-14deg)",
              background: "rgba(34,197,94,0.1)",
            }}>LIKE ♥</div>
          )}
          {drag.x < -25 && (
            <div style={{
              position: "absolute", top: 14, right: 14,
              padding: "4px 10px", borderRadius: 8,
              border: `2px solid #ef4444`, color: "#ef4444",
              fontSize: 11, fontWeight: 800,
              opacity: Math.min(1, (-drag.x - 25) / 55),
              transform: "rotate(14deg)",
              background: "rgba(239,68,68,0.1)",
            }}>SKIP ✕</div>
          )}

          {/* Glow */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 100, height: 100, borderRadius: "50%",
            background: theme.accent,
            opacity: 0.08, filter: "blur(30px)",
            pointerEvents: "none",
          }} />

          {/* Emoji icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: `${theme.accent}20`,
            border: `1px solid ${theme.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: "auto",
          }}>
            {theme.emoji}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{card.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
              {card.category} · {card.city}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: theme.accent,
                background: `${theme.accent}15`,
                padding: "2px 7px", borderRadius: 99,
              }}>★ {card.rating.toFixed(1)}</span>
              {card.priceMin && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                  dès {card.priceMin.toLocaleString("fr-MA")} MAD
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 14 }}>
        {/* Undo */}
        <button
          onClick={undo}
          disabled={history.length === 0}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1.5px solid rgba(183,191,217,0.25)",
            background: "rgba(183,191,217,0.05)",
            color: history.length === 0 ? "#c9cad0" : "#6a6a71",
            cursor: history.length === 0 ? "not-allowed" : "pointer",
            fontFamily: "'Google Symbols','Material Symbols Outlined'",
            fontWeight: "normal", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >undo</button>

        {/* Skip */}
        <button
          onClick={() => swipe("left")}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "1.5px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.06)",
            color: "#ef4444",
            cursor: "pointer",
            fontFamily: "'Google Symbols','Material Symbols Outlined'",
            fontWeight: "normal", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >close</button>

        {/* Like (CTA) */}
        <button
          onClick={() => swipe("right")}
          style={{
            width: 52, height: 52, borderRadius: "50%",
            border: "none",
            background: G, color: "#fff",
            cursor: "pointer",
            fontFamily: "'Google Symbols','Material Symbols Outlined'",
            fontWeight: "normal", fontSize: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(225,29,72,0.35)",
            transition: "all 0.15s",
          }}
        >favorite</button>

        {/* Profile */}
        <button
          onClick={() => window.open(`/vendor/${card.id}`, "_blank")}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "1.5px solid rgba(183,191,217,0.25)",
            background: "rgba(183,191,217,0.05)",
            color: "#6a6a71",
            cursor: "pointer",
            fontFamily: "'Google Symbols','Material Symbols Outlined'",
            fontWeight: "normal", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >open_in_new</button>
      </div>
    </div>
  )
}
