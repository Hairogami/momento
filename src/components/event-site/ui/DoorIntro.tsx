"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Props = {
  /** Clé de session : la porte ne s'affiche qu'une fois par visite et par site. */
  slug: string
  /** Initiales affichées dans le médaillon central (ex: "Y & Y"). */
  initials: string
  /** Ouverture automatique si l'invité ne touche pas (ms). */
  autoOpenMs?: number
}

const OPEN_MS = 1700
/** Les colombes volent un peu plus longtemps que l'ouverture des battants. */
const BIRDS_MS = 2600

function storageKey(slug: string) {
  return `evt-door-opened:${slug}`
}

function readSeen(slug: string): boolean {
  try { return sessionStorage.getItem(storageKey(slug)) === "1" } catch { return false }
}

/**
 * Animation d'ouverture : double porte en arche (couleur principale, filets dorés)
 * qui s'ouvre au toucher — ou seule après `autoOpenMs`. Une fois par session.
 * Rendue côté serveur (porte fermée) pour éviter que le contenu flashe avant la porte.
 */
export default function DoorIntro({ slug, initials, autoOpenMs = 5000 }: Props) {
  const seen = useSyncExternalStore(
    () => () => {},
    () => readSeen(slug),
    () => false,
  )
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("closed")
  const active = !seen && phase !== "gone"

  function open() {
    if (phase !== "closed") return
    setPhase("opening")
    setTimeout(() => {
      // Flag écrit APRÈS l'animation : `seen` est relu à chaque rendu (useSyncExternalStore),
      // l'écrire avant démonterait la porte avant qu'elle ait pivoté.
      try { sessionStorage.setItem(storageKey(slug), "1") } catch { /* stockage indisponible : sans effet */ }
      setPhase("gone")
    }, reduced ? 400 : BIRDS_MS)
  }

  // Ouverture automatique
  useEffect(() => {
    if (!active || phase !== "closed") return
    const t = setTimeout(open, autoOpenMs)
    return () => clearTimeout(t)
  })

  // Bloque le scroll tant que la porte est là — en compensant la largeur de la scrollbar
  // (desktop) pour éviter un saut horizontal du contenu au déverrouillage.
  useEffect(() => {
    if (!active) return
    // html ET body : le site met `overflow-y: auto` sur html, verrouiller body seul
    // laisse la scrollbar (bande visible à droite) et le scroll molette sous la porte.
    const html = document.documentElement
    const body = document.body
    const prev = { html: html.style.overflow, body: body.style.overflow, pad: body.style.paddingRight }
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      html.style.overflow = prev.html
      body.style.overflow = prev.body
      body.style.paddingRight = prev.pad
    }
  }, [active])

  if (!active) return null

  const opening = phase === "opening"
  // Uniquement transform + opacity : animés par le GPU (compositor), sans repeindre à chaque frame.
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invitation — ouvrir"
      onClick={open}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " " || e.key === "Escape") open() }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        perspective: "1800px",
        cursor: opening ? "default" : "pointer",
        pointerEvents: opening ? "none" : "auto",
        opacity: opening && reduced ? 0 : 1,
        transition: reduced ? "opacity 0.4s ease" : undefined,
      }}
    >
      {/* Fond derrière les battants : fondu en opacité (pas de transition de background) */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "color-mix(in srgb, var(--evt-main) 70%, #000)",
        opacity: opening ? 0 : 1,
        transition: `opacity ${OPEN_MS}ms ease`,
        willChange: "opacity",
      }} />

      {(["left", "right"] as const).map(side => (
        <div
          key={side}
          aria-hidden
          style={{
            position: "absolute", top: 0, bottom: 0,
            [side]: 0, width: "50%",
            background: "var(--evt-main)",
            transformOrigin: side === "left" ? "left center" : "right center",
            transform: opening && !reduced
              ? `translateZ(0) rotateY(${side === "left" ? -108 : 108}deg)`
              : "translateZ(0) rotateY(0deg)",
            transition: reduced ? undefined : `transform ${OPEN_MS}ms ${ease}`,
            // Couche GPU créée dès l'affichage : pas de rastérisation au moment du clic
            willChange: "transform",
            backfaceVisibility: "hidden",
            boxShadow: side === "left"
              ? "inset -1px 0 0 color-mix(in srgb, var(--evt-gold) 70%, transparent)"
              : "inset 1px 0 0 color-mix(in srgb, var(--evt-gold) 70%, transparent)",
            overflow: "hidden",
          }}
        >
          {/* Panneau en arche, double filet doré */}
          <div style={{
            position: "absolute", top: "12%", bottom: "8%",
            left: side === "left" ? "16%" : "10%", right: side === "left" ? "10%" : "16%",
            border: "1.5px solid var(--evt-gold)",
            borderRadius: "999px 999px 6px 6px",
          }}>
            <div style={{
              position: "absolute", inset: 8,
              border: "1px solid color-mix(in srgb, var(--evt-gold) 55%, transparent)",
              borderRadius: "999px 999px 4px 4px",
              overflow: "hidden",
            }}>
              <ZelligeFill />
            </div>
          </div>
          {/* Poignée */}
          <div style={{
            position: "absolute", top: "62%",
            [side === "left" ? "right" : "left"]: "4%",
            width: 10, height: 34, borderRadius: 999,
            background: "linear-gradient(180deg, color-mix(in srgb, var(--evt-gold) 70%, #fff), var(--evt-gold))",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }} />
          {/* Ombre de rotation : opacité (GPU) au lieu de filter: brightness (repeint chaque frame) */}
          <div style={{
            position: "absolute", inset: 0, background: "#000",
            opacity: opening && !reduced ? 0.3 : 0,
            transition: `opacity ${OPEN_MS}ms ease`,
            willChange: "opacity",
          }} />
        </div>
      ))}

      {/* Deux colombes dorées qui s'envolent du médaillon à l'ouverture */}
      {opening && !reduced && (
        <>
          <GoldenDove direction="right" />
          <GoldenDove direction="left" delayMs={140} />
        </>
      )}

      {/* Médaillon central + appel à l'action */}
      <div style={{
        position: "absolute", left: "50%", top: "44%",
        transform: `translate(-50%, -50%) scale(${opening ? 0.9 : 1})`,
        opacity: opening ? 0 : 1,
        transition: "opacity 0.45s ease, transform 0.45s ease",
        willChange: "opacity, transform",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 22,
        textAlign: "center", pointerEvents: "none",
      }}>
        <div style={{
          width: "clamp(116px, 26vw, 156px)", aspectRatio: "1",
          borderRadius: "50%",
          background: "var(--evt-main)",
          border: "2px solid var(--evt-gold)",
          outline: "1px solid color-mix(in srgb, var(--evt-gold) 50%, transparent)",
          outlineOffset: 5,
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--evt-font-heading)",
          fontSize: "clamp(1.6rem, 5vw, 2.3rem)",
          color: "var(--evt-gold)",
          letterSpacing: "0.04em",
        }}>
          {initials}
        </div>
        <div style={{
          fontFamily: "var(--evt-font-body)",
          fontSize: "var(--text-xs)", letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--evt-secondary)",
          // Capsule unie : reste lisible par-dessus le zellige
          padding: "6px 14px 6px 18px", borderRadius: 999, whiteSpace: "nowrap",
          background: "color-mix(in srgb, var(--evt-main) 85%, #000)",
          border: "1px solid color-mix(in srgb, var(--evt-gold) 60%, transparent)",
        }}>
          Vous êtes invités
        </div>
        <button
          type="button"
          autoFocus
          onClick={e => { e.stopPropagation(); open() }}
          style={{
            position: "relative",
            pointerEvents: "auto",
            padding: "12px 26px", borderRadius: 999,
            border: "1px solid var(--evt-gold)",
            background: "color-mix(in srgb, var(--evt-main) 85%, #000)",
            color: "var(--evt-secondary)",
            fontFamily: "var(--evt-font-body)", fontSize: "var(--text-sm)", fontWeight: 600,
            letterSpacing: "0.08em", cursor: "pointer",
          }}
        >
          {/* Halo pulsé : scale + opacity (GPU) au lieu d'un box-shadow animé */}
          {!reduced && !opening && (
            <span aria-hidden style={{
              position: "absolute", inset: -1, borderRadius: 999,
              border: "1px solid var(--evt-gold)",
              animation: "evtDoorPulse 2.2s ease-out infinite",
              willChange: "transform, opacity",
              pointerEvents: "none",
            }} />
          )}
          Ouvrir l&apos;invitation
        </button>
      </div>
      <style>{`
        @keyframes evtDoveFlyRight {
          0%   { transform: translate3d(0, 0, 0) scale(0.45); opacity: 0; }
          12%  { opacity: 1; }
          45%  { transform: translate3d(18vw, -16vh, 0) scale(0.95); }
          80%  { opacity: 1; }
          100% { transform: translate3d(48vw, -52vh, 0) scale(1.35); opacity: 0; }
        }
        @keyframes evtDoveFlyLeft {
          0%   { transform: translate3d(0, 0, 0) scale(0.45); opacity: 0; }
          12%  { opacity: 1; }
          45%  { transform: translate3d(-20vw, -12vh, 0) scale(0.9); }
          80%  { opacity: 1; }
          100% { transform: translate3d(-50vw, -48vh, 0) scale(1.3); opacity: 0; }
        }
        @keyframes evtDoveFlap {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(0.25); }
        }
        @keyframes evtDoorPulse {
          0%   { transform: scale(1); opacity: 0.7; }
          70%  { transform: scale(1.18, 1.45); opacity: 0; }
          100% { transform: scale(1.18, 1.45); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// Géométrie colombe : viewBox "0 -6 60 46" rendu en 72×56 px (échelle 1.2).
const DOVE_W = 72
const DOVE_H = 56
const DOVE_VIEWBOX = "0 -6 60 46"
/** Épaule (29, 21) dans le viewBox → pixels, pour l'origine du battement d'ailes. */
const SHOULDER_ORIGIN = `${29 * 1.2}px ${(21 + 6) * 1.2}px`

/**
 * Colombe dorée stylisée : ailes qui battent + trajectoire en arc vers le haut.
 * Chaque aile est une couche HTML séparée animée en transform (GPU) — animer des
 * <path> à l'intérieur d'un SVG forcerait un repaint du SVG à chaque frame.
 * Tournée vers la droite ; miroir horizontal pour l'envol vers la gauche.
 */
function GoldenDove({ direction, delayMs = 0 }: { direction: "left" | "right"; delayMs?: number }) {
  const gid = useId().replace(/:/g, "")
  const layer: React.CSSProperties = { position: "absolute", inset: 0 }
  const wing = (delay: string): React.CSSProperties => ({
    ...layer,
    transformOrigin: SHOULDER_ORIGIN,
    animation: `evtDoveFlap 0.36s ease-in-out ${delay} infinite`,
    willChange: "transform",
  })
  const grad = (suffix: string) => (
    <defs>
      <linearGradient id={`dove-${gid}-${suffix}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="color-mix(in srgb, var(--evt-gold) 55%, #fff)" />
        <stop offset="1" stopColor="var(--evt-gold)" />
      </linearGradient>
    </defs>
  )
  return (
    <div aria-hidden style={{
      position: "absolute", left: "50%", top: "40%",
      width: DOVE_W, height: DOVE_H, marginLeft: -DOVE_W / 2, marginTop: -DOVE_H / 2,
      pointerEvents: "none", zIndex: 3,
      animation: `${direction === "right" ? "evtDoveFlyRight" : "evtDoveFlyLeft"} ${BIRDS_MS - delayMs}ms cubic-bezier(0.33, 0, 0.4, 1) ${delayMs}ms both`,
      willChange: "transform, opacity",
    }}>
      <div style={{ ...layer, transform: `${direction === "left" ? "scaleX(-1) " : ""}rotate(-12deg)` }}>
        {/* aile arrière */}
        <div style={wing("0s")}>
          <svg viewBox={DOVE_VIEWBOX} width={DOVE_W} height={DOVE_H} style={{ overflow: "visible", display: "block" }}>
            {grad("b")}
            <path d="M28,20 C22,8 12,0 2,0 C8,4 6,6 10,8 C6,9 10,11 13,12 C18,15 23,18 26,22 Z" fill={`url(#dove-${gid}-b)`} opacity="0.7" />
          </svg>
        </div>
        {/* corps : queue + corps + tête + bec */}
        <div style={layer}>
          <svg viewBox={DOVE_VIEWBOX} width={DOVE_W} height={DOVE_H} style={{ overflow: "visible", display: "block" }}>
            {grad("c")}
            <path d="M22,22 L11,17 L12.5,21 L10,24.5 L14,25.5 Z" fill={`url(#dove-${gid}-c)`} />
            <ellipse cx="30" cy="22" rx="9.5" ry="4.6" fill={`url(#dove-${gid}-c)`} />
            <circle cx="39.5" cy="18.8" r="3.4" fill={`url(#dove-${gid}-c)`} />
            <path d="M42.6,18.4 L46.5,19.4 L42.6,20.3 Z" fill="var(--evt-gold)" />
          </svg>
        </div>
        {/* aile avant */}
        <div style={wing("0.04s")}>
          <svg viewBox={DOVE_VIEWBOX} width={DOVE_W} height={DOVE_H} style={{ overflow: "visible", display: "block" }}>
            {grad("f")}
            <path d="M29,20 C30,6 40,-4 54,-5 C49,0 51,2 48,4 C51,5 47,8 44,9 C38,13 34,17 32,22 Z" fill={`url(#dove-${gid}-f)`} />
          </svg>
        </div>
      </div>
    </div>
  )
}

/**
 * Zellige « étoiles et croix » (khatam) : étoiles à 8 branches = 2 carrés croisés à 45°,
 * posées sur une grille dont les vides forment des croix. Rendu dans la palette du site
 * (vert principal / crème secondaire / or) plutôt que dans les couleurs d'origine.
 */
function ZelligeFill() {
  const id = useId().replace(/:/g, "")
  const T = 64 // taille de la tuile
  const h = T / (2 * Math.SQRT2) // demi-côté : les pointes des étoiles voisines se touchent
  const r = h * 0.42 // rosette centrale

  const star = (cx: number, cy: number, size: number, fill: string, stroke: string, sw: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-size} y={-size} width={size * 2} height={size * 2} fill={fill} stroke={stroke} strokeWidth={sw} />
      <rect x={-size} y={-size} width={size * 2} height={size * 2} fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(45)" />
      {/* recouvre les traits internes : silhouette d'étoile nette */}
      <rect x={-size + sw} y={-size + sw} width={(size - sw) * 2} height={(size - sw) * 2} fill={fill} />
      <rect x={-size + sw} y={-size + sw} width={(size - sw) * 2} height={(size - sw) * 2} fill={fill} transform="rotate(45)" />
    </g>
  )

  const corners: [number, number][] = [[0, 0], [T, 0], [0, T], [T, T]]
  return (
    <svg aria-hidden width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block" }}>
      <defs>
        <pattern id={`zl-${id}`} width={T} height={T} patternUnits="userSpaceOnUse" x="50%">
          {/* Fond = croix (ton plus sombre) */}
          <rect width={T} height={T} fill="color-mix(in srgb, var(--evt-main) 78%, #000)" />
          {/* Étoiles aux coins de la tuile (partagées entre tuiles voisines) */}
          {corners.map(([x, y], i) => (
            <g key={i}>
              {star(x, y, h, "color-mix(in srgb, var(--evt-main) 82%, var(--evt-secondary))", "var(--evt-gold)", 1.4)}
              {star(x, y, r, "var(--evt-gold)", "none", 0)}
            </g>
          ))}
          {/* Petite étoile crème au centre de chaque croix */}
          {star(T / 2, T / 2, h * 0.22, "var(--evt-secondary)", "none", 0)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#zl-${id})`} />
      {/* Voile vertical : le motif s'adoucit vers le bas de la porte */}
      <rect width="100%" height="100%" fill={`url(#zlfade-${id})`} />
      <defs>
        <linearGradient id={`zlfade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--evt-main)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--evt-main)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** "Yazid & Yasmine" → "Y & Y" ; "Fête de Sara" → "F" */
export function initialsFromTitle(title: string | undefined): string {
  const parts = (title ?? "").split(/\s+et\s+|\s*[&+]\s*/i).map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]!.toUpperCase()} & ${parts[1]![0]!.toUpperCase()}`
  return (parts[0]?.[0] ?? "♥").toUpperCase()
}
