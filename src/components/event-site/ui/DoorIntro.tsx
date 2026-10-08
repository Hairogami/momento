"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

type Props = {
  /** Clé de session : la porte ne s'affiche qu'une fois par visite et par site. */
  slug: string
  /** Initiales affichées dans le médaillon du fronton (ex: "Y & Y"). */
  initials: string
}

/** Rotation des battants. */
const OPEN_MS = 1600
/** Fondu (« fadeaway ») du médaillon + bouton au toucher. */
const FADE_MS = 500
/** Les battants démarrent juste après le début du fondu : le médaillon ne se coupe pas en deux. */
const DOOR_DELAY_MS = 200
/** Début du « passage » à travers la porte (zoom + fondu de la façade). */
const ZOOM_DELAY_MS = 900
const ZOOM_MS = 1300
/** Fin de séquence (colombes comprises) → démontage. */
const BIRDS_MS = 2600
/**
 * Version douce (prefers-reduced-motion) : on n'enlève pas l'ouverture — beaucoup de
 * téléphones activent ce réglage via l'économie de batterie — on retire seulement les
 * grands mouvements (rotation 3D, zoom, vol en arc, battement d'ailes).
 */
const SOFT_MS = 1600

// ─── Géométrie de la façade (viewBox 390 × 844, ratio d'un téléphone) ────────
const VB_W = 390
const VB_H = 844
/** Ouverture de la porte : arc brisé (deux arcs de cercle qui se rejoignent en pointe). */
const DOOR_L = 64
const DOOR_R = 326
const DOOR_MID = (DOOR_L + DOOR_R) / 2 // 195
const SPRING_Y = 300 // naissance de l'arc
const APEX_Y = 96 // pointe de l'arc
const DOOR_BOTTOM = 800
/** Haut du cadre (alfiz) et des colonnes latérales. */
const FRAME_TOP = 36
/** Rayon des arcs : passe par la naissance (DOOR_L, SPRING_Y) et la pointe, centre sur la naissance. */
const ARC_R = (((DOOR_MID - DOOR_L) ** 2) + ((SPRING_Y - APEX_Y) ** 2)) / (2 * (DOOR_MID - DOOR_L))
const OPENING_PATH = `M${DOOR_L},${DOOR_BOTTOM} V${SPRING_Y} A${ARC_R},${ARC_R} 0 0 1 ${DOOR_MID},${APEX_Y} A${ARC_R},${ARC_R} 0 0 1 ${DOOR_R},${SPRING_Y} V${DOOR_BOTTOM} Z`
const LEAF_W = DOOR_MID - DOOR_L // 131
const LEAF_H = DOOR_BOTTOM - APEX_Y // 704
const LEAF_SPRING = SPRING_Y - APEX_Y // 204
const LEFT_LEAF_PATH = `M0,${LEAF_H} V${LEAF_SPRING} A${ARC_R},${ARC_R} 0 0 1 ${LEAF_W},0 V${LEAF_H} Z`
const RIGHT_LEAF_PATH = `M${LEAF_W},${LEAF_H} V${LEAF_SPRING} A${ARC_R},${ARC_R} 0 0 0 0,0 V${LEAF_H} Z`
const pct = (v: number, total: number) => `${(v / total) * 100}%`

/** Bois sculpté dérivé de l'or du site : s'accorde avec n'importe quelle palette. */
const WOOD = "color-mix(in srgb, var(--evt-gold) 50%, #5a3214)"
const WOOD_DARK = "color-mix(in srgb, var(--evt-gold) 22%, #2b1708)"
const WOOD_LIGHT = "color-mix(in srgb, var(--evt-gold) 72%, #7a4a20)"

function storageKey(slug: string) {
  return `evt-door-opened:${slug}`
}

function readSeen(slug: string): boolean {
  try { return sessionStorage.getItem(storageKey(slug)) === "1" } catch { return false }
}

/**
 * Animation d'ouverture : porte monumentale marocaine (façade en zellige, arc brisé
 * à bandeaux de stuc et de zellige, battants en bois sculpté). Au toucher de l'invité
 * (pas d'ouverture automatique), seuls les battants s'ouvrent sur le site, puis on
 * « passe » la porte (zoom + fondu de la façade) pendant que deux colombes dorées
 * s'envolent. Une fois par session.
 * Rendue côté serveur (porte fermée) pour éviter que le contenu flashe avant la porte.
 */
export default function DoorIntro({ slug, initials }: Props) {
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
    }, reduced ? SOFT_MS : BIRDS_MS)
  }

  // Clavier : Entrée / Espace / Échap ouvrent la porte, sans forcer le focus sur le bouton
  useEffect(() => {
    if (!active || phase !== "closed") return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); open() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
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
  const doorwayY = pct((APEX_Y + DOOR_BOTTOM) / 2, VB_H)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invitation — ouvrir"
      onClick={open}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden",
        cursor: opening ? "default" : "pointer",
        pointerEvents: opening ? "none" : "auto",
      }}
    >
      {/* Scène au ratio d'un téléphone, centrée ; le débord (écrans larges) est comblé par
          un box-shadow couleur principale — qui ne masque pas l'ouverture de la porte. */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: `min(100vw, ${(VB_W / VB_H) * 100}dvh)`,
        height: `min(100dvh, ${(VB_H / VB_W) * 100}vw)`,
        transform: "translate(-50%, -50%)",
      }}>
        {/* Calque « passage de la porte » : zoom + fondu de toute la façade, centré sur l'embrasure */}
        <div style={{
          position: "absolute", inset: 0,
          transformOrigin: `50% ${doorwayY}`,
          transform: opening && !reduced ? "translateZ(0) scale(2.6)" : "translateZ(0) scale(1)",
          opacity: opening ? 0 : 1,
          transition: reduced
            ? `opacity ${SOFT_MS}ms ease`
            : `transform ${ZOOM_MS}ms cubic-bezier(0.55, 0, 0.75, 0.4) ${ZOOM_DELAY_MS}ms, opacity ${ZOOM_MS}ms ease-in ${ZOOM_DELAY_MS}ms`,
          willChange: "transform, opacity",
          boxShadow: "0 0 0 100vmax var(--evt-main)",
        }}>
          <Facade />

          {/* Battants en bois sculpté, posés dans l'ouverture */}
          <div style={{
            position: "absolute",
            left: pct(DOOR_L, VB_W), width: pct(DOOR_R - DOOR_L, VB_W),
            top: pct(APEX_Y, VB_H), height: pct(LEAF_H, VB_H),
            perspective: "1400px",
          }}>
            {(["left", "right"] as const).map(side => (
              <div
                key={side}
                aria-hidden
                style={{
                  position: "absolute", top: 0, bottom: 0, width: "50%",
                  [side]: 0,
                  transformOrigin: side === "left" ? "left center" : "right center",
                  transform: !opening
                    ? "translateZ(0) rotateY(0deg)"
                    : reduced
                      ? `translateZ(0) translateX(${side === "left" ? -14 : 14}%)`
                      : `translateZ(0) rotateY(${side === "left" ? -84 : 84}deg)`,
                  opacity: opening && reduced ? 0 : 1,
                  transition: reduced
                    ? `transform ${SOFT_MS * 0.7}ms ease-out, opacity ${SOFT_MS * 0.7}ms ease-out`
                    : `transform ${OPEN_MS}ms ${ease} ${DOOR_DELAY_MS}ms`,
                  // Couche GPU créée dès l'affichage : pas de rastérisation au moment du clic
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                <DoorLeaf side={side} />
              </div>
            ))}
          </div>
        </div>

        {/* Deux colombes dorées qui s'envolent de l'embrasure (hors du calque de zoom) */}
        {opening && (
          <>
            <GoldenDove direction="right" soft={reduced} />
            <GoldenDove direction="left" delayMs={140} soft={reduced} />
          </>
        )}

        {/* Heurtoir aux initiales, au centre des battants. Pas de bouton visible : toucher
            n'importe où ouvre la porte ; l'anneau qui se balance invite à « frapper ».
            Au toucher : « fadeaway » (fondu + légère montée), puis les battants s'ouvrent. */}
        <div style={{
          position: "absolute", left: "50%", top: "52%",
          transform: `translate(-50%, -50%) translateY(${opening ? -14 : 0}px) scale(${opening ? 0.96 : 1})`,
          opacity: opening ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
          willChange: "opacity, transform",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 15,
          textAlign: "center", pointerEvents: "none",
        }}>
          <BrassMedallion initials={initials} swing={!reduced && !opening} />
          {/* Bouton invisible : toute la porte s'ouvre au toucher, mais lecteurs d'écran
              et navigation clavier gardent une cible explicite. */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); open() }}
            style={{
              position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
              overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
            }}
          >
            Ouvrir l&apos;invitation
          </button>
        </div>
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
        @keyframes evtDoveSoftRight {
          0%   { transform: translate3d(0, 12px, 0); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translate3d(36px, -44px, 0); opacity: 0; }
        }
        @keyframes evtDoveSoftLeft {
          0%   { transform: translate3d(0, 12px, 0); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translate3d(-36px, -40px, 0); opacity: 0; }
        }
        @keyframes evtDoveFlap {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(0.25); }
        }
        @keyframes evtKnockerSwing {
          0%, 62%, 100% { transform: rotate(0deg); }
          70%  { transform: rotate(9deg); }
          78%  { transform: rotate(-6deg); }
          86%  { transform: rotate(3deg); }
          93%  { transform: rotate(-1deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * Heurtoir marocain traditionnel portant les initiales : platine en rosace de laiton
 * (bord festonné, ajours, disque crème gravé) + anneau en goutte ciselé avec sa boule
 * de frappe. Ombre courte et serrée : pièce fixée sur le bois, pas un « sticker ».
 */
function BrassMedallion({ initials, swing = false }: { initials: string; swing?: boolean }) {
  const uid = useId().replace(/:/g, "")
  const brass = `brass-${uid}`
  const brassR = `brassR-${uid}`
  const brassEdge = `brassEdge-${uid}`
  const DARK = "color-mix(in srgb, var(--evt-gold) 45%, #2b1708)"
  const LIGHT = "color-mix(in srgb, var(--evt-gold) 50%, #fff)"
  const PLATE_Y = 40
  const VB = "0 0 100 128"
  // Anneau en goutte : pointe accrochée sous la platine (50, 82), rond en bas
  const RING = "M50,82 C63.2,85.6 68,100 63.2,112 C59,122.8 41,122.8 36.8,112 C32,100 36.8,85.6 50,82 Z"
  const brassStops = (
    <>
      <stop offset="0" stopColor={LIGHT} />
      <stop offset="0.45" stopColor="var(--evt-gold)" />
      <stop offset="1" stopColor={DARK} />
    </>
  )
  const layer: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", overflow: "visible" }
  return (
    <div
      role="img"
      aria-label={initials}
      style={{
        position: "relative",
        width: "clamp(104px, 28vw, 124px)", aspectRatio: "100 / 128",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(0,0,0,0.35))",
      }}
    >
      {/* Calque anneau : se balance autour de son accroche (GPU, pas de repaint du SVG) */}
      <div aria-hidden style={{
        ...layer,
        transformOrigin: "50% 64%", // accroche (50, 82) / 128
        animation: swing ? "evtKnockerSwing 3s ease-in-out 1.2s infinite" : undefined,
        willChange: swing ? "transform" : undefined,
      }}>
        <svg viewBox={VB} style={layer}>
          <defs>
            <linearGradient id={brassR} x1="0" y1="0" x2="1" y2="1">{brassStops}</linearGradient>
          </defs>
          <path d={RING} fill="none" stroke={DARK} strokeWidth="6.6" />
          <path d={RING} fill="none" stroke={`url(#${brassR})`} strokeWidth="5.2" />
          <path d={RING} fill="none" stroke={DARK} strokeWidth="0.7" strokeDasharray="1.8 1.6" opacity="0.8" />
          <path d={RING} fill="none" stroke={LIGHT} strokeWidth="0.6" opacity="0.6" transform="translate(-0.8 -0.8)" />
          {/* Boule de frappe */}
          <circle cx="50" cy="120.5" r="3.4" fill={`url(#${brassR})`} stroke={DARK} strokeWidth="0.7" />
        </svg>
      </div>

      {/* Calque fixe : attache + platine en rosace + initiales */}
      <svg aria-hidden viewBox={VB} style={layer}>
        <defs>
          <linearGradient id={brass} x1="0" y1="0" x2="1" y2="1">{brassStops}</linearGradient>
          <linearGradient id={brassEdge} x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={LIGHT} />
            <stop offset="1" stopColor={DARK} />
          </linearGradient>
        </defs>
        {/* Attache (charnière) entre platine et anneau */}
        <rect x="45" y={PLATE_Y + 30} width="10" height="14" rx="2.5" fill={`url(#${brass})`} stroke={DARK} strokeWidth="0.8" />
        <g transform={`translate(50 ${PLATE_Y})`}>
          {/* bord festonné : 12 lobes */}
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} r="7" cx="0" cy="-30" fill={`url(#${brass})`} stroke={DARK} strokeWidth="0.8" transform={`rotate(${i * 30})`} />
          ))}
          <circle r="30" fill={`url(#${brass})`} />
          {/* ajours */}
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} r="1.7" cx="0" cy="-25.5" fill={DARK} transform={`rotate(${i * 30 + 15})`} />
          ))}
          {/* couronne biseautée + disque crème gravé */}
          <circle r="21.5" fill={`url(#${brassEdge})`} />
          <circle r="19" fill="var(--evt-secondary)" />
          <circle r="19" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="2.2" />
          <text
            textAnchor="middle" dominantBaseline="central" y="1"
            fill="var(--evt-main)" fontSize="14"
            style={{ fontFamily: "var(--evt-font-heading)", letterSpacing: "0.03em", fontWeight: 600 }}
          >
            {initials}
          </text>
        </g>
      </svg>
    </div>
  )
}

/**
 * Façade fixe : fronton en stuc avec rosace, colonnes de zellige, cadre (alfiz),
 * arc brisé à bandeaux concentriques (filets dorés / zellige / stuc), colonnettes,
 * seuil. L'ouverture est masquée : on voit le site à travers quand les battants s'ouvrent.
 */
function Facade() {
  const uid = useId().replace(/:/g, "")
  const id = (n: string) => `${n}-${uid}`
  const url = (n: string) => `url(#${id(n)})`
  const MAIN_DARK = "color-mix(in srgb, var(--evt-main) 72%, #000)"
  const MAIN_SOFT = "color-mix(in srgb, var(--evt-main) 85%, var(--evt-secondary))"

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <ZelligePattern id={id("zl")} tile={30} />
        <StuccoPattern id={id("st")} />
        <mask id={id("open")} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
          <rect width={VB_W} height={VB_H} fill="#fff" />
          <path d={OPENING_PATH} fill="#000" />
        </mask>
        <linearGradient id={id("col")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="color-mix(in srgb, var(--evt-secondary) 80%, #000)" />
          <stop offset="0.5" stopColor="var(--evt-secondary)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--evt-secondary) 75%, #000)" />
        </linearGradient>
      </defs>

      <g mask={url("open")}>
        {/* Mur */}
        <rect width={VB_W} height={VB_H} fill="var(--evt-main)" />

        {/* Filet doré en haut du mur */}
        <rect x="0" y={FRAME_TOP - 10} width={VB_W} height="2" fill="var(--evt-gold)" />

        {/* Colonnes latérales en zellige */}
        {[2, VB_W - 2 - 32].map(x => (
          <g key={x}>
            <rect x={x} y={FRAME_TOP} width="32" height={DOOR_BOTTOM - FRAME_TOP} fill={url("zl")} />
            <rect x={x} y={FRAME_TOP} width="32" height={DOOR_BOTTOM - FRAME_TOP} fill="none" stroke="var(--evt-gold)" strokeWidth="1.5" />
          </g>
        ))}

        {/* Cadre (alfiz) : écoinçons en stuc autour de l'arc */}
        <rect x="38" y={FRAME_TOP} width={VB_W - 76} height={DOOR_BOTTOM - FRAME_TOP} fill={url("st")} />
        <rect x="38" y={FRAME_TOP} width={VB_W - 76} height={DOOR_BOTTOM - FRAME_TOP} fill="none" stroke="var(--evt-gold)" strokeWidth="2" />

        {/* Bandeaux concentriques de l'arc (le demi-trait intérieur est masqué par l'ouverture) */}
        <path d={OPENING_PATH} fill="none" stroke="var(--evt-gold)" strokeWidth="46" />
        <path d={OPENING_PATH} fill="none" stroke={MAIN_SOFT} strokeWidth="42" />
        <path d={OPENING_PATH} fill="none" stroke="var(--evt-gold)" strokeWidth="32" />
        <path d={OPENING_PATH} fill="none" stroke={url("zl")} strokeWidth="29" />
        <path d={OPENING_PATH} fill="none" stroke="var(--evt-gold)" strokeWidth="16" />
        <path d={OPENING_PATH} fill="none" stroke={url("st")} strokeWidth="13" />
        <path d={OPENING_PATH} fill="none" stroke={MAIN_DARK} strokeWidth="3" />

        {/* Colonnettes + chapiteaux dorés de part et d'autre de la porte */}
        {[DOOR_L - 12, DOOR_R + 2].map(x => (
          <g key={x}>
            <rect x={x} y={SPRING_Y + 14} width="10" height={DOOR_BOTTOM - SPRING_Y - 14} fill={url("col")} />
            <rect x={x - 2} y={SPRING_Y + 4} width="14" height="10" rx="2" fill="var(--evt-gold)" />
            <rect x={x - 2} y={DOOR_BOTTOM - 10} width="14" height="10" rx="2" fill="var(--evt-gold)" />
          </g>
        ))}

        {/* Seuil */}
        <rect x="0" y={DOOR_BOTTOM} width={VB_W} height={VB_H - DOOR_BOTTOM} fill={MAIN_DARK} />
        <rect x="0" y={DOOR_BOTTOM} width={VB_W} height="3" fill="var(--evt-gold)" />
      </g>
    </svg>
  )
}

/** Un battant en bois sculpté (forme = moitié de l'arc brisé), heurtoir doré. */
function DoorLeaf({ side }: { side: "left" | "right" }) {
  const uid = useId().replace(/:/g, "")
  const id = (n: string) => `${n}-${uid}`
  const url = (n: string) => `url(#${id(n)})`
  const shape = side === "left" ? LEFT_LEAF_PATH : RIGHT_LEAF_PATH
  /** x du bord intérieur (là où les battants se rejoignent). */
  const innerX = side === "left" ? LEAF_W : 0
  const panelX = side === "left" ? 12 : 8

  return (
    <svg
      viewBox={`0 0 ${LEAF_W} ${LEAF_H}`}
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={id("wood")} x1={side === "left" ? "0" : "1"} y1="0" x2={side === "left" ? "1" : "0"} y2="0">
          <stop offset="0" stopColor={WOOD_DARK} />
          <stop offset="0.55" stopColor={WOOD} />
          <stop offset="1" stopColor={WOOD_LIGHT} />
        </linearGradient>
        <CarvePattern id={id("carve")} />
        <clipPath id={id("clip")}>
          <path d={shape} />
        </clipPath>
      </defs>

      <g clipPath={url("clip")}>
        <path d={shape} fill={url("wood")} />
        {/* Grand panneau sculpté (suit l'arc) */}
        <path d={shape} fill={url("carve")} transform={`translate(${side === "left" ? 6 : -6} 8)`} opacity="0.95" />
        {/* Traverse dorée + panneau bas rectangulaire */}
        <rect x="0" y={LEAF_H - 142} width={LEAF_W} height="6" fill={WOOD_DARK} />
        <rect x="0" y={LEAF_H - 140} width={LEAF_W} height="1.5" fill="var(--evt-gold)" />
        <rect x={panelX} y={LEAF_H - 124} width={LEAF_W - 20} height="104" rx="3" fill={WOOD_DARK} opacity="0.55" />
        <rect x={panelX} y={LEAF_H - 124} width={LEAF_W - 20} height="104" rx="3" fill={url("carve")} />
        <rect x={panelX} y={LEAF_H - 124} width={LEAF_W - 20} height="104" rx="3" fill="none" stroke="var(--evt-gold)" strokeWidth="1.2" />
        {/* Plaque de bas de porte (cuivre doré) */}
        <rect x="0" y={LEAF_H - 14} width={LEAF_W} height="14" fill="color-mix(in srgb, var(--evt-gold) 80%, #3b2208)" />
        {/* Clous décoratifs le long du bord intérieur */}
        {Array.from({ length: 15 }, (_, i) => (
          <circle key={i} cx={side === "left" ? LEAF_W - 5 : 5} cy={LEAF_SPRING - 30 + i * 32} r="1.8" fill="var(--evt-gold)" />
        ))}
      </g>

      {/* Contour : filet doré sur la forme du battant */}
      <path d={shape} fill="none" stroke="var(--evt-gold)" strokeWidth="1.6" />
      {/* Joint central plus sombre */}
      <line x1={innerX} y1="0" x2={innerX} y2={LEAF_H} stroke={WOOD_DARK} strokeWidth="2" />

    </svg>
  )
}

/**
 * Zellige « étoiles et croix » (khatam) dans la palette du site : étoiles à 8 branches
 * (2 carrés croisés à 45°) aux coins de la tuile, croix sombres entre elles, rosettes dorées.
 */
function ZelligePattern({ id, tile: T }: { id: string; tile: number }) {
  const h = T / (2 * Math.SQRT2) // demi-côté : les pointes des étoiles voisines se touchent
  const star = (cx: number, cy: number, size: number, fill: string, stroke = "none", sw = 0) => (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-size} y={-size} width={size * 2} height={size * 2} fill={fill} stroke={stroke} strokeWidth={sw} />
      <rect x={-size} y={-size} width={size * 2} height={size * 2} fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(45)" />
      {sw > 0 && (
        <>
          <rect x={-size + sw} y={-size + sw} width={(size - sw) * 2} height={(size - sw) * 2} fill={fill} />
          <rect x={-size + sw} y={-size + sw} width={(size - sw) * 2} height={(size - sw) * 2} fill={fill} transform="rotate(45)" />
        </>
      )}
    </g>
  )
  const corners: [number, number][] = [[0, 0], [T, 0], [0, T], [T, T]]
  return (
    <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
      <rect width={T} height={T} fill="color-mix(in srgb, var(--evt-main) 70%, #000)" />
      {corners.map(([x, y], i) => (
        <g key={i}>
          {star(x, y, h, "color-mix(in srgb, var(--evt-main) 78%, var(--evt-secondary))", "var(--evt-gold)", 1)}
          {star(x, y, h * 0.42, "var(--evt-gold)")}
        </g>
      ))}
      {star(T / 2, T / 2, h * 0.24, "var(--evt-secondary)")}
    </pattern>
  )
}

/** Stuc ciselé : fond crème, entrelacs dorés fins (étoiles en filigrane + diagonales). */
function StuccoPattern({ id }: { id: string }) {
  const T = 16
  const s = T * 0.3
  return (
    <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
      <rect width={T} height={T} fill="var(--evt-secondary)" />
      <path d={`M0,0 L${T},${T} M${T},0 L0,${T}`} stroke="color-mix(in srgb, var(--evt-gold) 55%, transparent)" strokeWidth="0.5" />
      <g transform={`translate(${T / 2} ${T / 2})`} fill="none" stroke="var(--evt-gold)" strokeWidth="0.7">
        <rect x={-s} y={-s} width={s * 2} height={s * 2} />
        <rect x={-s} y={-s} width={s * 2} height={s * 2} transform="rotate(45)" />
      </g>
    </pattern>
  )
}

/** Bois sculpté : réseau d'étoiles en creux (rainures sombres) avec rehauts dorés. */
function CarvePattern({ id }: { id: string }) {
  const T = 22
  const s = T * 0.34
  return (
    <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
      <g transform={`translate(${T / 2} ${T / 2})`} fill="none">
        <rect x={-s} y={-s} width={s * 2} height={s * 2} stroke={WOOD_DARK} strokeWidth="1.6" />
        <rect x={-s} y={-s} width={s * 2} height={s * 2} stroke={WOOD_DARK} strokeWidth="1.6" transform="rotate(45)" />
        <circle r={s * 0.38} fill="color-mix(in srgb, var(--evt-gold) 85%, #fff)" opacity="0.8" />
      </g>
      <path d={`M0,0 L${T * 0.16},${T * 0.16} M${T},0 L${T * 0.84},${T * 0.16} M0,${T} L${T * 0.16},${T * 0.84} M${T},${T} L${T * 0.84},${T * 0.84}`} stroke={WOOD_DARK} strokeWidth="1.2" />
    </pattern>
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
function GoldenDove({ direction, delayMs = 0, soft = false }: { direction: "left" | "right"; delayMs?: number; soft?: boolean }) {
  const gid = useId().replace(/:/g, "")
  const layer: React.CSSProperties = { position: "absolute", inset: 0 }
  const wing = (delay: string): React.CSSProperties => ({
    ...layer,
    transformOrigin: SHOULDER_ORIGIN,
    animation: soft ? undefined : `evtDoveFlap 0.36s ease-in-out ${delay} infinite`,
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
      position: "absolute", left: "50%", top: pct((APEX_Y + DOOR_BOTTOM) / 2, VB_H),
      width: DOVE_W, height: DOVE_H, marginLeft: -DOVE_W / 2, marginTop: -DOVE_H / 2,
      pointerEvents: "none", zIndex: 3,
      animation: soft
        ? `${direction === "right" ? "evtDoveSoftRight" : "evtDoveSoftLeft"} ${SOFT_MS - delayMs}ms ease-out ${delayMs}ms both`
        : `${direction === "right" ? "evtDoveFlyRight" : "evtDoveFlyLeft"} ${BIRDS_MS - delayMs}ms cubic-bezier(0.33, 0, 0.4, 1) ${delayMs}ms both`,
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

/** "Yazid & Yasmine" → "Y & Y" ; "Fête de Sara" → "F" */
export function initialsFromTitle(title: string | undefined): string {
  const parts = (title ?? "").split(/\s+et\s+|\s*[&+]\s*/i).map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]!.toUpperCase()} & ${parts[1]![0]!.toUpperCase()}`
  return (parts[0]?.[0] ?? "♥").toUpperCase()
}
