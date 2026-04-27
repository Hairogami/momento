"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ── tuning ───────────────────────────────────────────── */
const SCALE_MIN  = 0.26
const SCALE_MAX  = 0.87   // jamais plein écran
const RADIUS_MIN = 36     // très arrondi au départ
const RADIUS_MAX = 24     // clairement arrondi au max
const LERP       = 0.09   // fluide et réactif
/* ─────────────────────────────────────────────────────── */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

// ── Animation loop hook ───────────────────────────────────────────────────────
function useAnimLoop(durations: number[]) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    let cur = 0; let alive = true; let t: ReturnType<typeof setTimeout>
    const go = () => { cur = (cur + 1) % durations.length; if (alive) { setStep(cur); t = setTimeout(go, durations[cur]) } }
    t = setTimeout(go, durations[0])
    return () => { alive = false; clearTimeout(t) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return step
}

// ── 1. Site événement — palette swap (éditeur Momento, zoom cinéma) ──────────
const SITE_PALETTES = [
  { id: "terracotta", label: "Terracotta", main: "#C1713A", secondary: "#F5EDD6", accent: "#8B4513", text: "#3D2817" },
  { id: "rose-or",    label: "Rose & Or",  main: "#D4506B", secondary: "#F4D5CC", accent: "#D4AF37", text: "#2E1218" },
  { id: "noir-rouge", label: "Noir & Rouge", main: "#DC1A24", secondary: "#FFE5E7", accent: "#0A0A0A", text: "#0A0A0A" },
]

function SiteEventPreview() {
  // 0:wide terra · 1:zoom-in sidebar · 2:rose · 3:noir-rouge · 4:zoom-out · 5:pause
  const step = useAnimLoop([3500, 1500, 2000, 2000, 2500, 1500])
  // Stratégie : pas de scale CSS. À la place, on étire le sidebar à 100% du card pendant le zoom
  // → toute la sidebar (header, tabs, templates, palette, fonts) visible au final.
  const sidebarFull = step >= 1 && step <= 3
  const cfg = { z: 1, ox: "50%", oy: "50%" } // toujours scale 1, c'est la sidebar qui s'étend
  const paletteIdx = step >= 3 ? 2 : step >= 2 ? 1 : 0
  const cur = SITE_PALETTES[paletteIdx]
  // Pattern arche/voûte (motif Layali authentique). Plus aéré : viewBox plus grand, plus d'espace entre arches.
  const patternStrokeColor = cur.id === "noir-rouge" ? "%23DC1A24" : encodeURIComponent(cur.main)
  const archPattern = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='68' viewBox='0 0 48 68'><g fill='none' stroke='${patternStrokeColor}' stroke-width='1.4' opacity='1'><path d='M8 60 L8 28 Q8 8 24 8 Q40 8 40 28 L40 60'/><circle cx='24' cy='38' r='3.5' fill='${patternStrokeColor}' opacity='0.55'/></g></svg>")`

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 8, background: "#0a0a0a" }}>
      <div style={{
        width: "100%", height: "100%",
        transform: `scale(${cfg.z})`,
        transformOrigin: `${cfg.ox} ${cfg.oy}`,
        transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
      }}>
        {/* ── Sidebar éditeur Momento — réplique fidèle ── */}
        <div style={{
          width: sidebarFull ? "100%" : "38%",
          background: "#0a0a0c",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          flexShrink: 0,
          padding: sidebarFull ? "10px 14px" : "5px 5px",
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1), padding 0.7s",
          overflow: "hidden",
        }}>
          <div style={{
            width: sidebarFull ? "41.6%" : "100%",
            transform: sidebarFull ? "scale(2.4) translateY(-38%)" : "scale(1)",
            transformOrigin: "0 0",
            transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1), width 0.7s",
            display: "flex", flexDirection: "column",
            height: sidebarFull ? "41.6%" : "100%",
          }}>
          {/* Lien retour */}
          <div style={{ fontSize: 4, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>← Tous mes sites</div>

          {/* Titre + status */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 6, color: "#fff", fontWeight: 600, marginBottom: 1.5 }}>Site événement</div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 4, color: "#22c55e" }}>Publié</span>
              <span style={{ fontSize: 3.5, color: "rgba(255,255,255,0.35)" }}>· /evt/anass-oumaima</span>
            </div>
          </div>

          {/* Bouton Retirer publication */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "3px 0", textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 4.5, color: "rgba(255,255,255,0.85)" }}>Retirer de la publication</span>
          </div>

          {/* Tabs Contenu / Style / Photos */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 4 }}>
            <div style={{ flex: 1, padding: "3px 0", textAlign: "center", fontSize: 4.5, color: "rgba(255,255,255,0.5)" }}>📄 Contenu</div>
            <div style={{ flex: 1, padding: "3px 0", textAlign: "center", fontSize: 4.5, color: "#fff", fontWeight: 600, borderBottom: "1.5px solid #22c55e", marginBottom: -1 }}>🎨 Style</div>
            <div style={{ flex: 1, padding: "3px 0", textAlign: "center", fontSize: 4.5, color: "rgba(255,255,255,0.5)" }}>📷 Photos</div>
          </div>

          {/* Section TEMPLATE (ADMIN) */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 3.8, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: "0.05em", fontWeight: 600 }}>TEMPLATE (ADMIN)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[
                { l: "Mariage", e: "💍", a: true },
                { l: "Fête familiale", e: "🎉", a: false },
                { l: "Corporate", e: "💼", a: false },
                { l: "Conférence", e: "🎤", a: false },
                { l: "Générique", e: "✨", a: false },
              ].map((t, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 2,
                  padding: "2.5px 3px", borderRadius: 3,
                  background: t.a ? "rgba(225,29,72,0.15)" : "rgba(255,255,255,0.03)",
                  border: t.a ? "1px solid #E11D48" : "1px solid rgba(255,255,255,0.08)",
                }}>
                  <span style={{ fontSize: 4.5 }}>{t.e}</span>
                  <span style={{ fontSize: 4, color: t.a ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: t.a ? 600 : 400 }}>{t.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section PALETTE DE COULEURS — collapsible ouvert */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 3.8, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: "0.05em", fontWeight: 600 }}>▾ PALETTE DE COULEURS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {SITE_PALETTES.map((p, i) => {
                const active = i === paletteIdx
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "3px 4px", borderRadius: 3,
                    background: active ? "rgba(225,29,72,0.18)" : "rgba(255,255,255,0.03)",
                    border: active ? "1px solid #E11D48" : "1px solid rgba(255,255,255,0.08)",
                    transition: "background 0.3s, border 0.3s, transform 0.25s",
                    transform: active ? "scale(1.05)" : "scale(1)",
                  }}>
                    <span style={{ fontSize: 4.2, color: active ? "#fff" : "rgba(255,255,255,0.75)", fontWeight: active ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</span>
                    <span style={{ display: "flex", gap: 1, flexShrink: 0 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.main }} />
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.accent }} />
                    </span>
                  </div>
                )
              })}
              {[{m:"#556B2F",a:"#8B7355",l:"Vert olive"},{m:"#009B96",a:"#4A9FD6",l:"Baby Blue & Tiffany"},{m:"#B88AE8",a:"#6FD4D1",l:"Pastel"},{m:"#C1713A",a:"#8B4513",l:"Personnalisé"}].map((p,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 4px", borderRadius: 3, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 4.2, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.l}</span>
                  <span style={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.m }} />
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.a }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sections collapsibles */}
          {["▸ POLICE DES TITRES", "▸ POLICE DU CORPS DE TEXTE", "▸ MOTIF DÉCORATIF", "▸ ANIMATIONS"].map((l, i) => (
            <div key={i} style={{ fontSize: 3.8, color: "rgba(255,255,255,0.4)", padding: "2px 0", letterSpacing: "0.05em", fontWeight: 600 }}>{l}</div>
          ))}
          </div>
        </div>

        {/* ── Preview du vrai site Momento (réplique fidèle de la capture user) ── */}
        <div style={{
          flex: 1,
          background: cur.id === "noir-rouge" ? "#0a0a0a" : cur.id === "rose-or" ? "#1F0F13" : "#1F1108",
          transition: "background 0.6s, opacity 0.5s",
          position: "relative",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          opacity: step >= 1 && step <= 3 ? 0 : 1,
        }}>
          {/* Pattern arches répétées sur toute la page — aéré, plus de respiration */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: archPattern,
            backgroundSize: "32px 46px",
            opacity: 0.22,
            transition: "opacity 0.6s",
          }} />

          {/* Top nav — toggle CENTRÉ et plus grand (signature Layali) */}
          <div style={{ position: "relative", zIndex: 3, padding: "5px 7px 3px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["ACCUEIL","HISTOIRE","CÉRÉMONIE","RSVP"].map(l => (
                <span key={l} style={{ fontSize: 5, color: "rgba(255,255,255,0.85)", letterSpacing: "0.12em", fontWeight: 600 }}>{l}</span>
              ))}
            </div>
            <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "2.5px 6px", fontSize: 5, color: "#fff", fontWeight: 600 }}>APERÇU&nbsp;LIVE</div>
          </div>

          {/* Toggle Desktop / Mobile — CENTRÉ flottant en haut, taille plus visible */}
          <div style={{
            position: "absolute", zIndex: 4,
            top: 5, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 3,
            background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(4px)",
            borderRadius: 14, padding: "3px 5px",
          }}>
            {/* Tab Desktop ACTIVE */}
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 9, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="13" height="9" rx="1"/>
                <line x1="5.5" y1="14" x2="10.5" y2="14"/>
                <line x1="8" y1="11.5" x2="8" y2="14"/>
              </svg>
              <span style={{ fontSize: 5, color: "#0a0a0a", fontWeight: 700 }}>Ordi</span>
            </div>
            {/* Tab Mobile inactive */}
            <div style={{ padding: "3px 5px", display: "flex", alignItems: "center", gap: 2 }}>
              <svg width="7" height="11" viewBox="0 0 10 16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round">
                <rect x="1.5" y="1.5" width="7" height="13" rx="1.4"/>
                <line x1="4" y1="12.5" x2="6" y2="12.5"/>
              </svg>
              <span style={{ fontSize: 5, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Mobile</span>
            </div>
          </div>

          {/* Hero content centered — hierarchie égalisée, "Anass & Oumaima" sur UNE LIGNE */}
          <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 2px", gap: 5 }}>
            {/* Couple — une seule ligne, agrandi */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 28, color: "#fff", fontWeight: 500, fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", lineHeight: 0.9, letterSpacing: "-0.015em", textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}>Anass</span>
              <span style={{ color: cur.main, transition: "color 0.6s", fontStyle: "italic", fontSize: 24, fontFamily: "'Cormorant Garamond', serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>&amp;</span>
              <span style={{ fontSize: 28, color: "#fff", fontWeight: 500, fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", lineHeight: 0.9, letterSpacing: "-0.015em", textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}>Oumaima</span>
            </div>
            {/* Nous nous marions */}
            <div style={{ fontSize: 8, color: cur.main, letterSpacing: "0.32em", fontWeight: 700, marginTop: 4, transition: "color 0.6s", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>NOUS NOUS MARIONS</div>
            {/* Date */}
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.92)", letterSpacing: "0.22em", fontWeight: 600, marginTop: 1 }}>17 NOVEMBRE 2026</div>

            {/* Countdown — cercles 38px (était 28 → +35% ≈ 38) */}
            <div style={{ display: "flex", gap: 11, marginTop: 10 }}>
              {[{n:"205",l:"JOURS"},{n:"5",l:"HEURES"},{n:"18",l:"MIN"},{n:"36",l:"SEC"}].map((c,i)=>(
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: `1.6px solid ${cur.main}`,
                    transition: "border-color 0.6s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `inset 0 0 0 1px ${cur.main}40, 0 0 8px ${cur.main}40`,
                  }}>
                    <span style={{ fontSize: 15, color: "#fff", fontWeight: 500, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{c.n}</span>
                  </div>
                  <span style={{ fontSize: 5, color: "rgba(255,255,255,0.75)", letterSpacing: "0.18em", fontWeight: 600 }}>{c.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer décoratif + signature */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2px 0 4px", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 25, height: 0.5, background: cur.main, transition: "background 0.6s", opacity: 0.6 }} />
              <div style={{ width: 4, height: 4, transform: "rotate(45deg)", border: `0.5px solid ${cur.main}`, margin: "0 4px", transition: "border-color 0.6s" }} />
              <div style={{ width: 25, height: 0.5, background: cur.main, transition: "background 0.6s", opacity: 0.6 }} />
            </div>
            <span style={{ fontSize: 4.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.22em", fontWeight: 500 }}>· CRÉÉ AVEC <span style={{ color: cur.main, fontWeight: 700, transition: "color 0.6s" }}>LAYALI</span> ·</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 2. Prestataires — VendorSwipe (flow user : modal → photos → détail → swipe → liste) ─
function VendorSwipePreview() {
  // Flow exact (durées tunées 12-15s/cycle):
  // 0:modal Image2 · 1:Image1 · 2:Image2 retour · 3:ouvre détail · 4:détail · 5:ferme détail
  // · 6:zoom bouton 🎉 · 7:clic + swipe + toast · 8:vue Mes Prestataires · 9:pause
  const step = useAnimLoop([2200, 1400, 1400, 1100, 2500, 1100, 1700, 1500, 2800, 1300])
  const isModal    = step <= 2 || step === 6
  const isDetail   = step === 3 || step === 4
  const isClosing  = step === 5
  const isSwiping  = step === 7
  const isList     = step >= 8
  const isZoomBtn  = step === 6
  // Photo affichée : sync avec le clic curseur (délai 1050ms = animation cursorClick)
  // Step 1 (clic droite) : photo 1 → 2 à t=1.05s
  // Step 2 (clic gauche) : photo 2 → 1 à t=1.05s
  const [photoIdx, setPhotoIdx] = useState(0)
  useEffect(() => {
    if (step === 1) {
      const id = setTimeout(() => setPhotoIdx(1), 1050)
      return () => clearTimeout(id)
    }
    if (step === 2) {
      const id = setTimeout(() => setPhotoIdx(0), 1050)
      return () => clearTimeout(id)
    }
    if (step === 0) setPhotoIdx(0) // reset à chaque nouveau cycle
  }, [step])

  // Photo 1 = Image 1 user (femme chemise noire bouquet rouge), Photo 2 = Image 2 (femme bleue bouquet)
  // User flow : Image 2 first, browse → Image 1, retour Image 2
  const PHOTOS = [
    "https://images.unsplash.com/photo-1593011951342-8426e949371f?w=500&q=75&auto=format&fit=crop", // Photo 2 (premier affiché)
    "https://images.unsplash.com/photo-1586973698216-0c4c285d7afd?w=500&q=75&auto=format&fit=crop", // Photo 1 (browse)
  ]

  // Curseur souris CONTINU — coordonnées grille A-J × 1-10 mappées par user
  // Format: col*10-5%  (A=5%, B=15%, ..., J=95%)  /  row*10-5%  (1=5%, 10=95%)
  const CURSOR_POS: Record<number, { top: string; left: string }> = {
    0: { top: "45%", left: "45%" },     // idle E5
    1: { top: "45%", left: "55%" },     // F5 — photo droite
    2: { top: "45%", left: "35%" },     // D5 — photo gauche
    3: { top: "45%", left: "45%" },     // E5 — centre carte
    4: { top: "45%", left: "45%" },     // reste E5 (détail open)
    5: { top: "45%", left: "45%" },     // reste E5 (closing)
    6: { top: "95%", left: "60%" },     // coin droite F10 — clic 🎉
    7: { top: "95%", left: "60%" },     // (disparaîtra via opacity)
    8: { top: "95%", left: "60%" },
    9: { top: "95%", left: "60%" },
  }
  const cursor = CURSOR_POS[step] ?? CURSOR_POS[0]
  const isClicking = step === 1 || step === 2 || step === 3 || step === 6
  const cursorVisible = step <= 6 // disparaît après step 6 (après le clic 🎉)

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative", background: "#000", borderRadius: 6, overflow: "hidden" }}>
{/* Curseur souris — translate aligné sur le pic du SVG (hotspot 3,2 dans viewBox 24×28) */}
      <div style={{
        position: "absolute",
        top: cursor.top, left: cursor.left,
        transform: "translate(-12.5%, -7%)", // pic du curseur tombe pile sur la coordonnée
        opacity: cursorVisible ? 1 : 0,
        transition: "top 0.9s cubic-bezier(0.4, 0, 0.2, 1), left 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
        zIndex: 50,
        pointerEvents: "none",
      }}>
        {/* Onde de clic centrée sur le PIC (3.5, 2.6 px dans le SVG 28×36) */}
        {isClicking && (
          <div key={`ring-${step}`} style={{
            position: "absolute",
            top: -8.4, left: -7.5, // centre 22×22 sur (3.5, 2.6)
            width: 22, height: 22, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.95)",
            transform: "scale(0)",
            animation: "cursorRing 0.7s ease 1.05s forwards",
          }} />
        )}
        {/* Pointer SVG — clic anim après que le curseur soit arrivé en position (transition 0.9s) */}
        <div key={`click-${step}`} style={{
          animation: isClicking ? "cursorClick 0.4s ease 1.05s" : undefined,
          transformOrigin: "12.5% 7%", // origin = pic du curseur
        }}>
          <svg width="28" height="36" viewBox="0 0 24 28" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.85))" }}>
            <path d="M3 2 L3 22 L8 17 L11 24 L14 23 L11 16 L18 16 Z" />
          </svg>
        </div>
      </div>
      {/* === VUE MODAL VENDOR SWIPE — card grande + détail INSIDE === */}
      {(isModal || isDetail || isClosing || isSwiping) && (
        <>
          {/* Bandeau haut : compteur + close (X icon SVG style lucide comme VendorSwipeModal) */}
          <div style={{ padding: "4px 8px 3px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)" }}>1/19+</span>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          </div>

          {/* Stack card — agrandie 50% (76→100%, max 170→255), format 3:4 portrait conservé */}
          <div style={{
            flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: 0, padding: "0 4px",
          }}>
            <div style={{
              width: "100%", maxWidth: 255,
              aspectRatio: "3 / 4",
              borderRadius: 14,
              overflow: "hidden",
              position: "relative",
              transform: isSwiping ? "translateX(140%) rotate(24deg)" : "translateX(0) rotate(0deg)",
              opacity: isSwiping ? 0 : 1,
              transition: isSwiping ? "transform 0.5s cubic-bezier(0.4,0,1,1), opacity 0.4s ease 0.15s" : "none",
              boxShadow: "0 8px 20px rgba(0,0,0,0.55)",
              background: "#1a1a1a",
            }}>
              {/* Photos plein cadre — blurred quand détail ouvert */}
              {PHOTOS.map((src, i) => (
                <div key={i} style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url("${src}")`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: i === photoIdx ? 1 : 0,
                  filter: (isDetail || isClosing) ? "blur(10px) brightness(0.28) saturate(0.55)" : "none",
                  transition: "opacity 0.4s ease, filter 0.4s ease",
                }} />
              ))}

              {/* Photo dots haut-centre — masquées quand détail ouvert */}
              {!isDetail && !isClosing && (
                <div style={{ position: "absolute", top: 5, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2, zIndex: 3 }}>
                  {PHOTOS.map((_, i) => (
                    <div key={i} style={{
                      height: 2.5,
                      width: i === photoIdx ? 14 : 3.5,
                      borderRadius: 99,
                      background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.4)",
                      transition: "width 0.3s, background 0.3s",
                    }} />
                  ))}
                </div>
              )}

              {/* Tap zone indicators (browse) */}
              {(step === 1 || step === 2) && (
                <div style={{
                  position: "absolute",
                  top: "45%", transform: "translateY(-50%)",
                  [step === 1 ? "right" : "left"]: 6,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 4,
                  animation: "tapPulse 1.2s ease",
                  boxShadow: "0 0 12px rgba(255,255,255,0.7)",
                }}>
                  <span style={{ fontSize: 11, color: "#000", fontWeight: 700, lineHeight: 1 }}>{step === 1 ? "›" : "‹"}</span>
                </div>
              )}

              {/* Footer info — visible seulement en mode photo (pas détail) */}
              {!isDetail && !isClosing && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
                  padding: "20px 7px 6px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", lineHeight: 1.05, textShadow: "0 1px 3px rgba(0,0,0,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>La Maison des Fleurs</div>
                      <div style={{ fontSize: 5.5, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>📍 Rabat</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: "#f59e0b", fontWeight: 700 }}>4.9</span>
                      <span style={{ fontSize: 8, color: "#f59e0b" }}>★</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 4.5, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 3 }}>Appuyer pour les détails · Glisser pour choisir</div>
                </div>
              )}

              {/* === DETAIL OVERLAY — slide-up INSIDE card === */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 5,
                transform: isDetail ? "translateY(0)" : "translateY(100%)",
                transition: isClosing ? "transform 0.55s cubic-bezier(0.4,0,1,1)" : "transform 0.5s cubic-bezier(0.32,0.72,0,1)",
                padding: "5px 6px",
                display: "flex", flexDirection: "column", gap: 3,
                overflow: "hidden",
              }}>
                {/* Header dans détail — fontes agrandies */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.05, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>La Maison des Fleurs</span>
                      <span style={{ fontSize: 5.5, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }}>✓ Vérifié</span>
                    </div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>📍 Rabat · Fleuriste événementiel</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                      <span style={{ fontSize: 8, color: "#f59e0b", fontWeight: 700 }}>4.9</span>
                      <div style={{ display: "flex", gap: 0.5 }}>{"★★★★★".split("").map((s,i)=><span key={i} style={{ fontSize: 6, color: "#f59e0b" }}>{s}</span>)}</div>
                      <span style={{ fontSize: 6, color: "rgba(255,255,255,0.45)" }}>· 42 avis</span>
                    </div>
                  </div>
                  <div style={{ width: 13, height: 13, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                </div>

                {/* À propos — fontes agrandies */}
                <div style={{ padding: "5px 7px", borderRadius: 6, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 2 }}>À propos</div>
                  <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.92)", lineHeight: 1.4, margin: 0 }}>
                    Fleuriste passionnée à Rabat depuis 2018. Créations sur mesure pour mariages et événements d&apos;exception.
                  </p>
                </div>

                {/* 3 FORFAITS — fontes agrandies */}
                <div>
                  <div style={{ fontSize: 5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 3 }}>Nos forfaits</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[
                      { l: "Standard",  p: "2 000",  c: "#94a3b8", desc: "Bouquet" },
                      { l: "Premium",   p: "5 000",  c: "#C1713A", desc: "+ table" },
                      { l: "Deluxe",    p: "10 000", c: "#fbbf24", desc: "Total" },
                    ].map((f,i) => (
                      <div key={i} style={{
                        flex: 1,
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                        border: `1px solid ${f.c}66`,
                        borderRadius: 6, padding: "4px 5px",
                      }}>
                        <div style={{ fontSize: 6, color: f.c, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{f.l}</div>
                        <div style={{ fontSize: 9.5, color: "#fff", fontWeight: 800, marginTop: 1.5, lineHeight: 1 }}>{f.p}<span style={{ fontSize: 5, fontWeight: 600, marginLeft: 2 }}>Dhs</span></div>
                        <div style={{ fontSize: 5, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1.2 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts grid 2x2 — fontes agrandies */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3.5px 5px", borderRadius: 6, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6.5 }}>📞</span></div>
                    <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.9)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>06 12 34 56 78</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3.5px 5px", borderRadius: 6, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(225,48,108,0.35)" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(135deg,#f09433,#dc2743,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 5, fontWeight: 900, color: "#fff" }}>IG</span></div>
                    <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>@maisonfleurs</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3.5px 5px", borderRadius: 6, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(24,119,242,0.35)" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "#1877f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 7, fontWeight: 900, color: "#fff" }}>f</span></div>
                    <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Facebook</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3.5px 5px", borderRadius: 6, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6.5 }}>✉️</span></div>
                    <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>contact@…</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action — TAILLE AGRANDIE (32px) + cinématique zoom 🎉 */}
          <div style={{ padding: "5px 0 7px", display: "flex", justifyContent: "center", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#0a0a0a",
              border: "2px solid #ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: isZoomBtn ? 0.25 : 1,
              transform: isZoomBtn ? "scale(0.8)" : "scale(1)",
              transition: "opacity 0.5s, transform 0.5s",
            }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "#ef4444", lineHeight: 1, fontWeight: 700 }}>×</span>
              </div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#0a0a0a",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: isZoomBtn ? 0.25 : 1,
              transform: isZoomBtn ? "scale(0.8)" : "scale(1)",
              transition: "opacity 0.5s, transform 0.5s",
            }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>↻</span>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#0a0a0a",
              border: "2px solid #ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: isZoomBtn ? 0.25 : 1,
              transform: isZoomBtn ? "scale(0.8)" : "scale(1)",
              transition: "opacity 0.5s, transform 0.5s",
            }}>
              <span style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }}>♥</span>
            </div>
            {/* 🎉 vert — cinématique zoom : normale → grossit (zoom) → reste pour le swipe */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#22c55e",
              border: "2px solid #15803d",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isZoomBtn ? "0 0 28px rgba(34,197,94,0.85), 0 6px 16px rgba(34,197,94,0.6)" : "0 2px 6px rgba(34,197,94,0.4)",
              transform: isZoomBtn ? "scale(2.2) translateY(-12px)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s",
              zIndex: 5,
            }}>
              <span style={{ fontSize: 16 }}>🎉</span>
            </div>
          </div>
        </>
      )}

      {/* (Détail intégré INSIDE la card vendor swipe ci-dessus, plus de section séparée) */}

      {/* Toast intégré directement à la transition swipe→liste (overlay flash vert) */}
      {isSwiping && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          animation: "checkIn 0.4s ease",
        }}>
          <div style={{
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            borderRadius: 14, padding: "11px 18px",
            display: "flex", alignItems: "center", gap: 7,
            boxShadow: "0 8px 24px rgba(34,197,94,0.6)",
          }}>
            <span style={{ fontSize: 16, color: "#fff" }}>✓</span>
            <div>
              <div style={{ fontSize: 11, color: "#fff", fontWeight: 800, letterSpacing: "-0.01em" }}>Ajouté à mes prestataires</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.9)", marginTop: 1 }}>La Maison des Fleurs</div>
            </div>
          </div>
        </div>
      )}

      {/* === LISTE "Mes prestataires" — card limitée en largeur comme swipe (~250px max) === */}
      {isList && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: "5px 4px", overflow: "hidden", animation: "slideIn 0.5s ease" }}>
          {/* Title page */}
          <div style={{ marginBottom: 5, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "#fff", fontWeight: 700, lineHeight: 1 }}>Mes prestataires</div>
            <div style={{ fontSize: 4.5, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>1 sur 12 catégories sélectionnés</div>
          </div>

          {/* Section catégorie : Fleuriste */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 6.5, fontWeight: 700, color: "#fff" }}>Fleuriste</span>
                <span style={{ fontSize: 4, fontWeight: 700, padding: "0.5px 4px", borderRadius: 99, background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>1 sélectionné</span>
              </div>
              <div style={{ fontSize: 4.5, fontWeight: 600, padding: "1px 5px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}>+ Ajouter</div>
            </div>
            {/* Card limitée 255px comme swipe, pas full width */}
            <div style={{
              width: "100%", maxWidth: 255,
              background: "#0a0a0a",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              animation: "slideIn 0.6s ease",
            }}>
              {/* Photo header — taille proche capture user Mamounia (~140px ratio) */}
              <div style={{ position: "relative", height: 130, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${PHOTOS[0]}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                {/* Flèche browse gauche */}
                <div style={{ position: "absolute", top: "50%", left: 4, transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 6, color: "#fff", lineHeight: 1, fontWeight: 700 }}>‹</span>
                </div>
                {/* Photo dots */}
                <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: i === 0 ? 8 : 3, height: 2, borderRadius: 99, background: i === 0 ? "#fff" : "rgba(255,255,255,0.45)" }} />)}
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: "7px 9px 9px" }}>
                {/* Nom + rating */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4, gap: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>La Maison des Fleurs</div>
                    <div style={{ fontSize: 6, color: "rgba(255,255,255,0.45)", marginTop: 1.5 }}>Fleuriste · Rabat</div>
                  </div>
                  <span style={{
                    fontSize: 6, fontWeight: 700, color: "#E11D48",
                    background: "rgba(225,29,72,0.15)", padding: "1.5px 5px", borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}>★ 5.0</span>
                </div>
                {/* Pill Site web seule (comme capture user) */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 2, padding: "1.5px 6px", borderRadius: 99, background: "rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.35)" }}>
                    <span style={{ fontSize: 5 }}>🌐</span>
                    <span style={{ fontSize: 5.5, color: "#a5b4fc", fontWeight: 600 }}>Site web</span>
                  </div>
                </div>
                {/* Bouton "Contacter via WhatsApp" pleine largeur gradient rose/violet */}
                <div style={{
                  background: "linear-gradient(135deg,#E11D48,#9333EA)",
                  borderRadius: 99,
                  padding: "5px 0",
                  textAlign: "center",
                  marginBottom: 5,
                  boxShadow: "0 2px 8px rgba(225,29,72,0.35)",
                }}>
                  <span style={{ fontSize: 7, color: "#fff", fontWeight: 700 }}>Contacter via WhatsApp 💬</span>
                </div>
                {/* Ligne dropdown Sélectionné + Retirer */}
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{
                    flex: 1, padding: "3px 7px", borderRadius: 6,
                    background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: "#a78bfa" }} />
                      <span style={{ fontSize: 6.5, color: "#a78bfa", fontWeight: 700 }}>Sélectionné</span>
                    </span>
                    <span style={{ fontSize: 5, color: "rgba(167,139,250,0.7)" }}>▼</span>
                  </div>
                  <div style={{ padding: "3px 7px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <span style={{ fontSize: 6, color: "#ef4444", fontWeight: 600 }}>Retirer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 3. Invitations & RSVP — Omar remplit RSVP, notif planner, widget update ──
function RsvpPreview() {
  // 9 étapes : (0) typing nom Omar, (1) Oui highlight, (2) typing +1 Mariam,
  // (3) submit highlight, (4) success "Merci Omar", (5) dashboard wide-shot,
  // (6) zoom sur Invités + badge "1" pop, (7) widget update, (8) pause finale
  const step = useAnimLoop([2400, 1000, 2400, 1000, 1500, 1800, 2200, 2800, 1500])

  const [typedName, setTypedName] = useState("")
  const [typedPlusOne, setTypedPlusOne] = useState("")

  useEffect(() => {
    if (step === 0) {
      setTypedName("")
      setTypedPlusOne("")
      const txt = "Omar"
      let i = 0
      const id = setInterval(() => {
        i++
        setTypedName(txt.slice(0, i))
        if (i >= txt.length) clearInterval(id)
      }, 240)
      return () => clearInterval(id)
    }
    if (step === 2) {
      const txt = "Mariam"
      let i = 0
      const id = setInterval(() => {
        i++
        setTypedPlusOne(txt.slice(0, i))
        if (i >= txt.length) clearInterval(id)
      }, 220)
      return () => clearInterval(id)
    }
    if (step === 8) {
      setTypedName("")
      setTypedPlusOne("")
    }
  }, [step])

  const ouiSelected = step >= 1 && step <= 4
  const submitted = step === 4
  const showForm = step <= 4
  const showDashboard = step === 5 || step === 6
  const showWidget = step >= 7

  // Frame 2 zoom (cinematic sur badge Notifications — N6 mappé par user, ×2)
  // Pour CENTRER le focal point : translate(50%-origin) APRÈS scale
  const dashZoom = step === 6 ? 5.2 : 1
  const dashOriginX = "96%"
  const dashOriginY = "39%"
  const dashTranslateX = step === 6 ? "-46%" : "0%"  // 50% - 96%
  const dashTranslateY = step === 6 ? "11%" : "0%"   // 50% - 39%
  const showBadge = step === 6

  // Widget counters (live update at step 7+)
  const guestCount = showWidget ? 100 : 99
  const confirmedCount = showWidget ? 73 : 72
  const declinedCount = 8
  const pendingCount = guestCount - confirmedCount - declinedCount
  const pct = Math.round((confirmedCount / guestCount) * 100)

  // Police Momento (landing) = Plus Jakarta Sans (body de layout.tsx ligne 94)
  const fontMomento = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"

  // Sidebar items (fidèle à DashSidebar.tsx + Notifications du popup user déplacé en NAV)
  const NAV: { label: string; icon: string; active?: boolean; isNotif?: boolean }[] = [
    { label: "Accueil", icon: "home" },
    { label: "Notifications", icon: "bell", isNotif: true },
    { label: "Mon Planner", icon: "dashboard", active: true },
    { label: "Budget", icon: "wallet" },
    { label: "Invités", icon: "groups" },
    { label: "Messages", icon: "chat" },
    { label: "Planning", icon: "event" },
    { label: "Favoris", icon: "favorite" },
    { label: "Mes Prestataires", icon: "handshake" },
    { label: "Site événement", icon: "share" },
  ]
  // Icônes SVG inline (fallback Material Symbols)
  const ICON: Record<string, React.ReactNode> = {
    home: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z" /></svg>,
    dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zm10 0h8v5h-8zm0 7h8v11h-8zm-10 3h8v8H3z" /></svg>,
    wallet: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 7H5V5h14V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16zM18 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>,
    groups: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 8c0-3 4-5 8-5s8 2 8 5v1H4z"/></svg>,
    chat: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v14H7l-4 4z"/></svg>,
    event: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h2V2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 6v10h14V10z"/></svg>,
    favorite: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-1.5-1.4C5 15 2 12 2 8.5A5.5 5.5 0 0 1 7.5 3c1.7 0 3.4.8 4.5 2.1A6.1 6.1 0 0 1 16.5 3 5.5 5.5 0 0 1 22 8.5c0 3.5-3 6.5-8.5 11.1z"/></svg>,
    handshake: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 6L9 9.5l5.5 5.5 1.5-1.5-2-2 5-5-1.5-1.5-5 5z M5 17l4-4 5.5 5.5L13 20l-3-3-3 3z"/></svg>,
    share: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M9 11l6-4M9 13l6 4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
    bell: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z"/></svg>,
  }

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden", borderRadius: 8 }}>
      {/* FRAME 1 — RSVP form Momento, PJS, tailles encore +30% */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#FAF7F2",
        opacity: showForm ? 1 : 0,
        transform: showForm ? "scale(1)" : "scale(0.94)",
        transition: "opacity 0.5s ease, transform 0.6s ease",
        display: "flex", flexDirection: "column",
        padding: "14px 16px",
        fontFamily: fontMomento,
      }}>
        {/* header bandeau terracotta */}
        <div style={{
          background: "#C1713A", borderRadius: 7,
          padding: "9px 0", textAlign: "center",
          marginBottom: 11,
        }}>
          <span style={{ fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: fontMomento, letterSpacing: "0.01em" }}>
            Yazid & Yasmine — 17 nov 2025
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#8B4513", letterSpacing: "0.18em", fontWeight: 700, textAlign: "center", marginBottom: 13, fontFamily: fontMomento }}>
          CONFIRMEZ VOTRE PRÉSENCE
        </div>

        {/* Nom complet */}
        <div style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 12, color: "#5a3a20", marginBottom: 5, fontWeight: 600, fontFamily: fontMomento }}>Nom complet</div>
          <div style={{
            background: "#fff",
            border: `2px solid ${step === 0 ? "#C1713A" : "rgba(193,113,58,0.25)"}`,
            borderRadius: 8, padding: "7px 10px",
            fontSize: 15, color: "#2a1a0a",
            minHeight: 23, display: "flex", alignItems: "center",
            boxShadow: step === 0 ? "0 0 0 4px rgba(193,113,58,0.15)" : "none",
            transition: "box-shadow 0.2s, border-color 0.2s",
            fontFamily: fontMomento,
            fontWeight: 500,
          }}>
            {typedName || (step !== 0 ? <span style={{ color: "#bbb", fontWeight: 400 }}>Prénom Nom</span> : null)}
            {step === 0 && <span style={{ color: "#C1713A", marginLeft: 1, animation: "rsvpBlink 0.8s infinite" }}>|</span>}
          </div>
        </div>

        {/* Présent ? */}
        <div style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 12, color: "#5a3a20", marginBottom: 5, fontWeight: 600, fontFamily: fontMomento }}>Présent à l&apos;événement ?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1, padding: "8px 0", borderRadius: 99,
              background: ouiSelected ? "#C1713A" : "#fff",
              border: `2px solid ${ouiSelected ? "#C1713A" : "rgba(193,113,58,0.25)"}`,
              color: ouiSelected ? "#fff" : "#5a3a20",
              fontSize: 14, fontWeight: 700, textAlign: "center",
              transition: "all 0.3s ease",
              transform: step === 1 ? "scale(0.93)" : "scale(1)",
              boxShadow: step === 1 ? "0 0 0 4px rgba(193,113,58,0.25)" : "none",
              fontFamily: fontMomento,
            }}>Oui</div>
            <div style={{
              flex: 1, padding: "8px 0", borderRadius: 99,
              background: "#fff", border: "2px solid rgba(193,113,58,0.25)",
              color: "#8a6a5a", fontSize: 14, fontWeight: 700, textAlign: "center",
              fontFamily: fontMomento,
            }}>Non</div>
          </div>
        </div>

        {/* +1 */}
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 12, color: "#5a3a20", marginBottom: 5, fontWeight: 600, fontFamily: fontMomento }}>
            Nom de votre +1
          </div>
          <div style={{
            background: "#fff",
            border: `2px solid ${step === 2 ? "#C1713A" : "rgba(193,113,58,0.25)"}`,
            borderRadius: 8, padding: "7px 10px",
            fontSize: 15, color: "#2a1a0a",
            minHeight: 23, display: "flex", alignItems: "center",
            boxShadow: step === 2 ? "0 0 0 4px rgba(193,113,58,0.15)" : "none",
            transition: "box-shadow 0.2s, border-color 0.2s",
            fontFamily: fontMomento,
            fontWeight: 500,
          }}>
            {typedPlusOne || (step !== 2 ? <span style={{ color: "#bbb", fontWeight: 400 }}>Prénom Nom</span> : null)}
            {step === 2 && <span style={{ color: "#C1713A", marginLeft: 1, animation: "rsvpBlink 0.8s infinite" }}>|</span>}
          </div>
        </div>

        {/* Confirmer / Success */}
        <div style={{ marginTop: "auto" }}>
          {!submitted ? (
            <div style={{
              padding: "12px 0", borderRadius: 99,
              background: "#C1713A", color: "#fff",
              fontSize: 15, fontWeight: 700, textAlign: "center",
              transform: step === 3 ? "scale(0.94)" : "scale(1)",
              transition: "transform 0.3s ease",
              boxShadow: step === 3 ? "0 0 0 5px rgba(193,113,58,0.3)" : "0 4px 12px rgba(193,113,58,0.32)",
              fontFamily: fontMomento,
            }}>
              Confirmer ma réponse
            </div>
          ) : (
            <div style={{
              padding: "14px 0", textAlign: "center",
              animation: "slideIn 0.4s ease",
            }}>
              <div style={{ fontSize: 34, color: "#C1713A", lineHeight: 1, marginBottom: 7, fontFamily: fontMomento, fontWeight: 700 }}>✓</div>
              <div style={{ fontSize: 20, color: "#2a1a0a", fontFamily: fontMomento, fontWeight: 700 }}>
                Merci Omar !
              </div>
              <div style={{ fontSize: 12, color: "#8a6a5a", marginTop: 4, fontFamily: fontMomento }}>Votre réponse a bien été enregistrée.</div>
            </div>
          )}
        </div>
      </div>

      {/* FRAME 2 — DashSidebar pixel-perfect FULL WIDTH (zoom step 6 sur Notifications) */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#15171c",
        opacity: showDashboard ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
        fontFamily: fontMomento,
      }}>
        <div style={{
          width: "100%", height: "100%",
          transform: `translate(${dashTranslateX}, ${dashTranslateY}) scale(${dashZoom})`,
          transformOrigin: `${dashOriginX} ${dashOriginY}`,
          transition: "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header — Logo + Espace client + Toggle dark */}
          <div style={{
            padding: "11px 13px",
            borderBottom: "1px solid rgba(183,191,217,0.1)",
            display: "flex", alignItems: "center", gap: 9,
            flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg,#E11D48,#9333EA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(225,29,72,0.5)",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.05em" }}>M</span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Momento</div>
              <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Espace client</div>
            </div>
            <div style={{
              width: 28, height: 17, borderRadius: 99,
              background: "#E11D48",
              position: "relative", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2.5, left: 13.5,
                width: 12, height: 12, borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }} />
            </div>
          </div>

          {/* Event switcher */}
          <div style={{
            padding: "9px 11px",
            borderBottom: "1px solid rgba(183,191,217,0.07)",
            flexShrink: 0,
          }}>
            <div style={{
              padding: "8px 10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#E11D48",
                boxShadow: "0 0 6px rgba(225,29,72,0.7)",
                flexShrink: 0,
              }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Mariage Yasmine
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Événement actif</div>
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>▾</span>
            </div>
          </div>

          {/* Nav items (Notifications inclus) */}
          <nav style={{
            flex: 1, padding: "6px 7px", overflow: "hidden",
            display: "flex", flexDirection: "column", gap: 1,
          }}>
            {NAV.map((item) => (
              <div key={item.label} style={{
                position: "relative",
                padding: "7px 11px", borderRadius: 8,
                fontSize: 12.5,
                background: item.active
                  ? "linear-gradient(135deg, rgba(225,29,72,0.1), rgba(147,51,234,0.07))"
                  : "transparent",
                display: "flex", alignItems: "center", gap: 9,
                fontWeight: item.active ? 600 : 400,
                color: item.active ? "#fff" : "rgba(255,255,255,0.62)",
              }}>
                {item.active && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, borderRadius: 99,
                    background: "linear-gradient(135deg,#E11D48,#9333EA)",
                  }} />
                )}
                <span style={{
                  color: item.active ? "#E11D48" : "rgba(255,255,255,0.62)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 16, height: 16, flexShrink: 0,
                  position: "relative",
                }}>
                  {ICON[item.icon]}
                </span>
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
                {item.isNotif && showBadge && (
                  <div style={{ position: "relative", width: 18, height: 18, flexShrink: 0 }}>
                    <div key={`ring-${step}`} style={{
                      position: "absolute", inset: 0,
                      borderRadius: "50%",
                      border: "2px solid #E11D48",
                      transformOrigin: "center",
                      animation: "badgeRingPulse 1.2s ease-out 0.2s",
                      pointerEvents: "none",
                    }} />
                    <div key={`badge-${step}`} style={{
                      position: "absolute", inset: 0,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#E11D48,#9333EA)",
                      color: "#fff", fontSize: 11, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "badgePopBig 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: "0 0 0 2px #15171c, 0 0 10px rgba(225,29,72,0.75)",
                      lineHeight: 1,
                      fontFamily: fontMomento,
                    }}>1</div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer user */}
          <div style={{
            padding: "9px 13px",
            borderTop: "1px solid rgba(183,191,217,0.07)",
            display: "flex", alignItems: "center", gap: 9,
            flexShrink: 0,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg,#E11D48,#9333EA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700,
              flexShrink: 0,
            }}>Y</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Yasmine</div>
              <div style={{ fontSize: 9, color: "#E11D48", fontWeight: 500 }}>Voir mon profil →</div>
            </div>
          </div>
        </div>

      </div>

      {/* FRAME 3 — InvitesWidget zoom avec update */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#0E0F12",
        opacity: showWidget ? 1 : 0,
        transform: showWidget ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.5s ease, transform 0.6s ease",
        padding: "12px 14px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 7,
        }}>
          <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em", fontWeight: 700 }}>
            INVITÉS
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
            <div style={{
              fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.4s ease",
            }}>{guestCount}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", paddingBottom: 2 }}>
              invités · <span style={{ color: "#4ade80", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{confirmedCount}</span> confirmés
            </div>
            <div style={{
              marginLeft: "auto",
              padding: "2px 7px", borderRadius: 99,
              background: "rgba(193,113,58,0.2)",
              color: "#C1713A", fontSize: 8, fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
            }}>{pct}%</div>
          </div>
          {/* Bar */}
          <div style={{
            height: 6, borderRadius: 99, overflow: "hidden",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}>
            <div style={{
              height: "100%",
              width: `${(confirmedCount / guestCount) * 100}%`,
              background: "#4ade80",
              transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
            }} />
            <div style={{
              height: "100%",
              width: `${(declinedCount / guestCount) * 100}%`,
              background: "#C1713A",
            }} />
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 8, fontSize: 7, color: "rgba(255,255,255,0.55)" }}>
            <span><span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#4ade80", marginRight: 3, verticalAlign: "middle" }} />{confirmedCount} oui</span>
            <span><span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#C1713A", marginRight: 3, verticalAlign: "middle" }} />{declinedCount} non</span>
            <span><span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#3a3a40", marginRight: 3, verticalAlign: "middle" }} />{pendingCount} attente</span>
          </div>
          {/* Toast nouvelle ligne */}
          {showWidget && (
            <div style={{
              marginTop: 2,
              padding: "5px 7px", borderRadius: 6,
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.3)",
              display: "flex", alignItems: "center", gap: 6,
              animation: "slideIn 0.5s ease 0.6s backwards",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                background: "rgba(193,113,58,0.3)", color: "#C1713A",
                fontSize: 7, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>O</div>
              <div style={{ flex: 1, fontSize: 7, color: "#fff", lineHeight: 1.3 }}>
                <span style={{ fontWeight: 700 }}>Omar</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}> · +1 Mariam</span>
              </div>
              <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 700 }}>✓</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// ── 4. Messages — chat en temps réel ──────────────────────────────────────────
function MessagesPreview() {
  // 9 steps : 0 typing msg1, 1 send, 2 vendor typing, 3 vendor msg1,
  // 4 typing msg2, 5 send, 6 vendor typing, 7 vendor msg2, 8 pause
  const step = useAnimLoop([2800, 800, 1400, 2400, 2700, 800, 1400, 2400, 1600])
  const [typed, setTyped] = useState("")
  const fontMomento = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"

  const MSG_USER_1 = "Vous êtes disponibles le 17 novembre ?"
  const MSG_USER_2 = "Super ! Nous serons 40 personnes, pouvez-vous m'envoyer un devis ?"
  const MSG_VENDOR_1 = "Oui, disponibles le 17 Nov ✓ Pour combien de personnes ?"
  const MSG_VENDOR_2 = "Pas de souci, je vous envoie ça tout de suite."

  useEffect(() => {
    if (step === 0) {
      setTyped("")
      const txt = MSG_USER_1
      let i = 0
      const id = setInterval(() => {
        i++
        setTyped(txt.slice(0, i))
        if (i >= txt.length) clearInterval(id)
      }, 70)
      return () => clearInterval(id)
    }
    if (step === 4) {
      setTyped("")
      const txt = MSG_USER_2
      let i = 0
      const id = setInterval(() => {
        i++
        setTyped(txt.slice(0, i))
        if (i >= txt.length) clearInterval(id)
      }, 60)
      return () => clearInterval(id)
    }
    if (step === 1 || step === 5) setTyped("")
  }, [step])

  // Bubbles visibility
  const showUserMsg1   = step >= 1 && step <= 8
  const showVendorTyp1 = step === 2
  const showVendorMsg1 = step >= 3 && step <= 8
  const showUserMsg2   = step >= 5 && step <= 8
  const showVendorTyp2 = step === 6
  const showVendorMsg2 = step >= 7 && step <= 8
  const inputText = (step === 0 || step === 4) ? typed : ""
  const showCursor = step === 0 || step === 4

  // Bubble styles (convention WhatsApp : user RIGHT gradient, vendor LEFT gris)
  const userBubble: React.CSSProperties = {
    maxWidth: "78%",
    background: "linear-gradient(135deg,#E11D48,#9333EA)",
    color: "#fff",
    fontSize: 13, lineHeight: 1.4,
    padding: "9px 13px",
    borderRadius: "15px 15px 3px 15px",
    fontFamily: fontMomento, fontWeight: 500,
    boxShadow: "0 2px 6px rgba(225,29,72,0.28)",
  }
  const vendorBubble: React.CSSProperties = {
    maxWidth: "78%",
    background: "rgba(255,255,255,0.1)",
    color: "#f5f5f5",
    fontSize: 13, lineHeight: 1.4,
    padding: "9px 13px",
    borderRadius: "15px 15px 15px 3px",
    fontFamily: fontMomento, fontWeight: 500,
    border: "1px solid rgba(255,255,255,0.08)",
  }
  const vendorAvatar = (
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      background: "linear-gradient(135deg,#0369A1,#0891B2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, flexShrink: 0,
    }}>🏛</div>
  )

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      minHeight: 0, overflow: "hidden",
      background: "#0E0F12", borderRadius: 8,
      fontFamily: fontMomento,
    }}>
      {/* HEADER thread */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 13px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#0369A1,#0891B2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0,
        }}>🏛</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Salle des fêtes Royale
          </div>
          <div style={{ fontSize: 10, color: "#22c55e", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> En ligne · Casablanca
          </div>
        </div>
      </div>

      {/* BODY bubbles */}
      <div style={{
        flex: 1, overflow: "hidden",
        padding: "10px 10px 6px",
        display: "flex", flexDirection: "column",
        gap: 6,
        justifyContent: "flex-end",
      }}>
        {showUserMsg1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: step === 1 ? "slideIn 0.32s ease" : undefined }}>
            <div style={userBubble}>{MSG_USER_1}</div>
          </div>
        )}
        {showVendorTyp1 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: "slideIn 0.32s ease" }}>
            {vendorAvatar}
            <div style={{ ...vendorBubble, padding: "8px 12px", display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {showVendorMsg1 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: step === 3 ? "slideIn 0.32s ease" : undefined }}>
            {vendorAvatar}
            <div style={vendorBubble}>{MSG_VENDOR_1}</div>
          </div>
        )}
        {showUserMsg2 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: step === 5 ? "slideIn 0.32s ease" : undefined }}>
            <div style={userBubble}>{MSG_USER_2}</div>
          </div>
        )}
        {showVendorTyp2 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: "slideIn 0.32s ease" }}>
            {vendorAvatar}
            <div style={{ ...vendorBubble, padding: "8px 12px", display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {showVendorMsg2 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: step === 7 ? "slideIn 0.32s ease" : undefined }}>
            {vendorAvatar}
            <div style={vendorBubble}>{MSG_VENDOR_2}</div>
          </div>
        )}
      </div>

      {/* INPUT bar */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        display: "flex", alignItems: "center", gap: 9,
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, minHeight: 34, padding: "8px 14px",
          background: "rgba(255,255,255,0.06)",
          border: `1.5px solid ${showCursor ? "rgba(225,29,72,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 99,
          fontSize: 13, color: inputText ? "#fff" : "rgba(255,255,255,0.4)",
          fontFamily: fontMomento, fontWeight: 500,
          display: "flex", alignItems: "center",
          boxShadow: showCursor ? "0 0 0 3px rgba(225,29,72,0.15)" : "none",
          transition: "border 0.2s, box-shadow 0.2s",
          lineHeight: 1.3,
        }}>
          {inputText || (showCursor ? "" : "Tapez votre message…")}
          {showCursor && (
            <span style={{ color: "#fff", marginLeft: 1, animation: "rsvpBlink 0.8s infinite" }}>|</span>
          )}
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#E11D48,#9333EA)",
          color: "#fff", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700,
          flexShrink: 0,
          transform: (step === 1 || step === 5) ? "scale(0.88)" : "scale(1)",
          transition: "transform 0.2s",
          boxShadow: "0 2px 10px rgba(225,29,72,0.45)",
          cursor: "pointer",
        }}>↑</button>
      </div>
    </div>
  )
}

// ── 5. Agent IA — assistant conseil ───────────────────────────────────────────
function AgentAIPreview() {
  // 14 steps : 3 conversations enchaînées
  // Q1 (presta search) : 0 typing → 1 send → 2 IA dots → 3 réponse + cards
  // Q2 (budget) : 4 typing → 5 send → 6 IA dots → 7 réponse + chart
  // Q3 (couleur) : 8 typing → 9 send → 10 IA dots → 11 réponse + swatches → 12 pause
  const step = useAnimLoop([2400, 700, 1300, 3000, 2400, 700, 1300, 3300, 2200, 700, 1300, 3000, 1500])
  const [typed, setTyped] = useState("")
  const bodyRef = useRef<HTMLDivElement>(null)
  const fontMomento = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"

  // Auto-scroll vers le bas à chaque step (comme une vraie conversation)
  useEffect(() => {
    const id = setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, 50)
    return () => clearTimeout(id)
  }, [step])

  const Q1 = "Photographe sous 8000 Dhs à Rabat ?"
  const Q2 = "Qu'est-ce que tu penses de mon budget ?"
  const Q3 = "Et mon thème de couleur ?"

  useEffect(() => {
    let txt = ""
    if (step === 0) txt = Q1
    else if (step === 4) txt = Q2
    else if (step === 8) txt = Q3
    else { setTyped(""); return }
    setTyped("")
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(txt.slice(0, i))
      if (i >= txt.length) clearInterval(id)
    }, 65)
    return () => clearInterval(id)
  }, [step])

  // Visibility flags
  const showQ1 = step >= 1
  const showA1Typing = step === 2
  const showA1 = step >= 3
  const showQ2 = step >= 5
  const showA2Typing = step === 6
  const showA2 = step >= 7
  const showQ3 = step >= 9
  const showA3Typing = step === 10
  const showA3 = step >= 11
  const inputText = (step === 0 || step === 4 || step === 8) ? typed : ""
  const showCursor = step === 0 || step === 4 || step === 8

  // Bubble styles
  const userBubble: React.CSSProperties = {
    maxWidth: "80%",
    background: "linear-gradient(135deg,#E11D48,#9333EA)",
    color: "#fff",
    fontSize: 12, lineHeight: 1.4,
    padding: "8px 12px",
    borderRadius: "14px 14px 3px 14px",
    fontFamily: fontMomento, fontWeight: 500,
    boxShadow: "0 1px 4px rgba(225,29,72,0.25)",
  }
  const aiBubble: React.CSSProperties = {
    maxWidth: "82%",
    background: "rgba(147,51,234,0.12)",
    color: "#f5f5f5",
    fontSize: 12, lineHeight: 1.4,
    padding: "8px 12px",
    borderRadius: "14px 14px 14px 3px",
    fontFamily: fontMomento, fontWeight: 500,
    border: "1px solid rgba(147,51,234,0.25)",
  }
  const aiAvatar = (
    <div style={{
      width: 22, height: 22, borderRadius: 7,
      background: "linear-gradient(135deg,#E11D48,#9333EA)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, flexShrink: 0,
      boxShadow: "0 1px 4px rgba(147,51,234,0.4)",
    }}>✨</div>
  )

  // 3 photo cards data
  const PHOTOS = [
    { name: "Studio Lumière", price: "6 500 Dhs", match: 92, color: "#22c55e" },
    { name: "Anas Photographie", price: "7 800 Dhs", match: 88, color: "#22c55e" },
    { name: "Yasmine Studio", price: "5 500 Dhs", match: 85, color: "#84cc16" },
  ]
  // Budget categories with proposed change
  const BUDGET_BEFORE = [
    { cat: "Lieu", amount: 22000, color: "#C4532A" },
    { cat: "Traiteur", amount: 12000, color: "#D4733A" },
    { cat: "Photo", amount: 1500, color: "#A03820", flag: "low" },
    { cat: "Déco", amount: 4000, color: "#B84830" },
  ]
  const BUDGET_AFTER = [
    { cat: "Lieu", amount: 18000, color: "#C4532A", changed: true },
    { cat: "Traiteur", amount: 12000, color: "#D4733A" },
    { cat: "Photo", amount: 3000, color: "#A03820", changed: true },
    { cat: "Déco", amount: 4000, color: "#B84830" },
  ]
  const BUDGET_TOTAL_AFTER = BUDGET_AFTER.reduce((s, b) => s + b.amount, 0)

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      minHeight: 0, overflow: "hidden",
      background: "#0E0F12", borderRadius: 8,
      fontFamily: fontMomento,
    }}>
      {/* HEADER Agent Layali ✨ */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 13px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(147,51,234,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: "linear-gradient(135deg,#E11D48,#9333EA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0,
          boxShadow: "0 2px 10px rgba(147,51,234,0.5)",
        }}>✨</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            Agent Layali <span style={{
              background: "linear-gradient(135deg,#E11D48,#9333EA)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>✨</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
            IA · Toujours dispo
          </div>
        </div>
        <div style={{
          fontSize: 9, color: "#fff",
          background: "linear-gradient(135deg,#E11D48,#9333EA)",
          borderRadius: 99, padding: "3px 9px",
          fontWeight: 700, letterSpacing: "0.04em",
          boxShadow: "0 1px 5px rgba(147,51,234,0.4)",
        }}>IA</div>
      </div>

      {/* BODY conversation scrollable (newest at bottom, oldest hidden behind header) */}
      <div ref={bodyRef} className="ai-chat-scroll" style={{
        flex: "1 1 0", minHeight: 0,
        overflowY: "auto", overflowX: "hidden",
        padding: "10px 10px 6px",
        display: "flex", flexDirection: "column",
        gap: 6, justifyContent: "flex-end",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollBehavior: "smooth",
      }}>
        {/* Q1 user */}
        {showQ1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: step === 1 ? "slideIn 0.32s ease" : undefined }}>
            <div style={userBubble}>{Q1}</div>
          </div>
        )}
        {showA1Typing && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: "slideIn 0.32s ease" }}>
            {aiAvatar}
            <div style={{ ...aiBubble, padding: "9px 13px", display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {showA1 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-start", animation: step === 3 ? "slideIn 0.32s ease" : undefined }}>
            {aiAvatar}
            <div style={{ ...aiBubble, display: "flex", flexDirection: "column", gap: 6 }}>
              <span>J&apos;ai trouvé 3 photographes pour toi 📸</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {PHOTOS.map((p, i) => (
                  <div key={p.name} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "5px 7px", borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    animation: step === 3 ? `slideIn 0.4s ease ${0.2 + i * 0.18}s backwards` : undefined,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: "linear-gradient(135deg,#DC2626,#D97706)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, flexShrink: 0,
                    }}>📷</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{p.price}</div>
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700,
                      color: p.color,
                      background: "rgba(34,197,94,0.15)",
                      padding: "2px 6px", borderRadius: 99,
                      flexShrink: 0,
                    }}>{p.match}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Q2 budget */}
        {showQ2 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: step === 5 ? "slideIn 0.32s ease" : undefined }}>
            <div style={userBubble}>{Q2}</div>
          </div>
        )}
        {showA2Typing && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: "slideIn 0.32s ease" }}>
            {aiAvatar}
            <div style={{ ...aiBubble, padding: "9px 13px", display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {showA2 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-start", animation: step === 7 ? "slideIn 0.32s ease" : undefined }}>
            {aiAvatar}
            <div style={{ ...aiBubble, display: "flex", flexDirection: "column", gap: 6 }}>
              <span>
                Le <span style={{ color: "#fbbf24", fontWeight: 700 }}>photographe</span> est sous-représenté 📊 Je propose <span style={{ color: "#22c55e", fontWeight: 700 }}>3 000 Dh</span> au lieu de <span style={{ textDecoration: "line-through", opacity: 0.6 }}>1 500 Dh</span>, et baisser <span style={{ color: "#fbbf24", fontWeight: 700 }}>Lieu</span> à <span style={{ color: "#22c55e", fontWeight: 700 }}>18 000 Dh</span>.
              </span>
              {/* Mini répartition budget */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {BUDGET_AFTER.map((b, i) => {
                  const pct = (b.amount / BUDGET_TOTAL_AFTER) * 100
                  return (
                    <div key={b.cat} style={{
                      animation: step === 7 ? `slideIn 0.4s ease ${0.3 + i * 0.12}s backwards` : undefined,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>
                        <span style={{ fontWeight: b.changed ? 700 : 500, color: b.changed ? "#22c55e" : "rgba(255,255,255,0.7)" }}>
                          {b.cat} {b.changed && "✓"}
                        </span>
                        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                          {b.amount.toLocaleString("fr-FR")} Dh
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: b.color,
                          transition: "width 0.7s ease",
                          borderRadius: 99,
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Q3 thème couleur */}
        {showQ3 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: step === 9 ? "slideIn 0.32s ease" : undefined }}>
            <div style={userBubble}>{Q3}</div>
          </div>
        )}
        {showA3Typing && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-end", animation: "slideIn 0.32s ease" }}>
            {aiAvatar}
            <div style={{ ...aiBubble, padding: "9px 13px", display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {showA3 && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 5, alignItems: "flex-start", animation: step === 11 ? "slideIn 0.32s ease" : undefined }}>
            {aiAvatar}
            <div style={{ ...aiBubble, display: "flex", flexDirection: "column", gap: 6 }}>
              <span>
                J&apos;aime beaucoup le <span style={{ color: "#F5E6D3", fontWeight: 700 }}>Beige crème</span>. À ta place je rajouterais une touche de <span style={{ color: "#C1713A", fontWeight: 700 }}>Terracotta</span> ou de <span style={{ color: "#556B2F", fontWeight: 700 }}>Vert olive</span> 🎨
              </span>
              {/* Swatches */}
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { name: "Beige", color: "#F5E6D3" },
                  { name: "Terracotta", color: "#C1713A" },
                  { name: "Vert olive", color: "#556B2F" },
                ].map((s, i) => (
                  <div key={s.name} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "3px 7px", borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    animation: step === 11 ? `slideIn 0.4s ease ${0.25 + i * 0.13}s backwards` : undefined,
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: s.color,
                      border: "1px solid rgba(255,255,255,0.15)",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 500 }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT bar */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        display: "flex", alignItems: "center", gap: 9,
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, minHeight: 34, padding: "8px 14px",
          background: "rgba(255,255,255,0.06)",
          border: `1.5px solid ${showCursor ? "rgba(147,51,234,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 99,
          fontSize: 12, color: inputText ? "#fff" : "rgba(255,255,255,0.4)",
          fontFamily: fontMomento, fontWeight: 500,
          display: "flex", alignItems: "center",
          boxShadow: showCursor ? "0 0 0 3px rgba(147,51,234,0.15)" : "none",
          transition: "border 0.2s, box-shadow 0.2s",
          lineHeight: 1.3,
        }}>
          {inputText || (showCursor ? "" : "Demande à Layali…")}
          {showCursor && (
            <span style={{ color: "#fff", marginLeft: 1, animation: "rsvpBlink 0.8s infinite" }}>|</span>
          )}
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#E11D48,#9333EA)",
          color: "#fff", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700,
          flexShrink: 0,
          transform: (step === 1 || step === 5 || step === 9) ? "scale(0.88)" : "scale(1)",
          transition: "transform 0.2s",
          boxShadow: "0 2px 10px rgba(147,51,234,0.45)",
          cursor: "pointer",
        }}>↑</button>
      </div>
    </div>
  )
}

// ── 6. Budget — donut SVG fidèle + zoom sur ajout dépense ──────────────────
function BudgetPreview() {
  // 8 steps : 0 wide-shot donut cascade, 1 zoom-in bouton +, 2 form ouvert,
  // 3 typing montant, 4 clic Valider, 5 zoom-out, 6 nouvelle slice + toast, 7 pause
  const step = useAnimLoop([3500, 1300, 1500, 2500, 1000, 1000, 2700, 1500])
  const [typedAmount, setTypedAmount] = useState("")
  const fontMomento = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"

  useEffect(() => {
    if (step === 3) {
      setTypedAmount("")
      const txt = "5 000"
      let i = 0
      const id = setInterval(() => {
        i++
        setTypedAmount(txt.slice(0, i))
        if (i >= txt.length) clearInterval(id)
      }, 200)
      return () => clearInterval(id)
    }
    if (step === 7 || step === 0) setTypedAmount("")
  }, [step])

  // Catégories budget (couleurs réelles BudgetChart.tsx — Traiteur incrémenté +5K)
  type Slice = { name: string; value: number; color: string; isNew?: boolean }
  const SLICES_BASE: Slice[] = [
    { name: "Lieu",     value: 22000, color: "#C4532A" },
    { name: "Traiteur", value: 15000, color: "#D4733A" },
    { name: "Photo",    value: 8000,  color: "#A03820" },
    { name: "Musique",  value: 5000,  color: "#E08050" },
    { name: "Déco",     value: 6000,  color: "#B84830" },
    { name: "Robe",     value: 3000,  color: "#F09060" },
    { name: "Autre",    value: 1000,  color: "#8C6A5A" },
  ]
  const SLICES_AFTER: Slice[] = [
    { name: "Lieu",     value: 22000, color: "#C4532A" },
    { name: "Traiteur", value: 20000, color: "#D4733A", isNew: true },
    { name: "Photo",    value: 8000,  color: "#A03820" },
    { name: "Musique",  value: 5000,  color: "#E08050" },
    { name: "Déco",     value: 6000,  color: "#B84830" },
    { name: "Robe",     value: 3000,  color: "#F09060" },
    { name: "Autre",    value: 1000,  color: "#8C6A5A" },
  ]
  const BUDGET_TOTAL = 100000
  const slices = step >= 6 ? SLICES_AFTER : SLICES_BASE
  const spent = slices.reduce((s, x) => s + x.value, 0)
  const pct = Math.round((spent / BUDGET_TOTAL) * 100)

  // Donut SVG geometry
  const cx = 75, cy = 75, r = 48
  const circumference = 2 * Math.PI * r
  let acc = 0
  const slicesWithGeo = slices.map((s) => {
    const portion = s.value / spent
    const arcLen = portion * circumference
    const offset = -acc * circumference
    acc += portion
    return { ...s, arcLen, offset }
  })

  // 2 layouts crossfade :
  // wide-shot (donut + legend + bouton) actif aux steps 0, 5, 6, 7
  // form-zoom (form ajout dépense) actif aux steps 1-4
  const showWide = step <= 0 || step >= 5
  const showForm = step >= 1 && step <= 4
  const showToast = step === 6 || step === 7

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      minHeight: 0, overflow: "hidden",
      background: "#0E0F12", borderRadius: 8,
      fontFamily: fontMomento,
      position: "relative",
    }}>
      {/* HEADER */}
      <div style={{
        padding: "10px 13px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 9,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18 }}>💰</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Budget</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Yasmine & Yazid · 17 nov 2025</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {spent.toLocaleString("fr-FR")} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>/ 100 000 Dhs</span>
          </div>
        </div>
      </div>

      {/* MAIN content — 2 layouts empilés (wide-shot vs form-zoom) crossfade */}
      <div style={{
        flex: "1 1 0", minHeight: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* WIDE-SHOT : donut + legend + bouton */}
        <div style={{
          position: "absolute", inset: 0,
          padding: "10px 12px",
          display: "flex", flexDirection: "column",
          opacity: showWide ? 1 : 0,
          transform: showWide ? "scale(1)" : "scale(0.5)",
          transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: showWide ? "auto" : "none",
        }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 14,
          }}>
            {/* Donut */}
            <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
              <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                {slicesWithGeo.map((s, i) => (
                  <circle
                    key={s.name}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="18"
                    strokeDasharray={`${s.arcLen} ${circumference - s.arcLen}`}
                    strokeDashoffset={s.offset}
                    style={{
                      opacity: step === 0 ? 0 : 1,
                      animation: step === 0
                        ? `slideIn 0.4s ease ${i * 0.18 + 0.2}s forwards`
                        : (s.isNew && step === 6 ? "slideIn 0.55s ease forwards" : undefined),
                      transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease",
                    }}
                  />
                ))}
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  fontSize: 26, fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  transition: "color 0.5s",
                  color: step === 6 ? "#22c55e" : "#fff",
                }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4, letterSpacing: "0.06em" }}>dépensé</div>
              </div>
            </div>
            {/* Legend (centré vertical avec donut) */}
            <div style={{
              display: "flex", flexDirection: "column",
              gap: 6, minWidth: 0,
              justifyContent: "center",
            }}>
              {slices.slice(0, 5).map((s, i) => (
                <div key={s.name} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13,
                  animation: step === 0 ? `slideIn 0.4s ease ${i * 0.18 + 0.3}s backwards` :
                              (s.isNew && step === 6 ? "slideIn 0.5s ease 0.3s backwards" : undefined),
                }}>
                  <div style={{
                    width: 13, height: 13, borderRadius: 4,
                    background: s.color,
                    flexShrink: 0,
                    boxShadow: s.isNew && step >= 6 ? `0 0 10px ${s.color}` : "none",
                  }} />
                  <span style={{ flex: 1, color: s.isNew && step >= 6 ? "#22c55e" : "rgba(255,255,255,0.85)", fontWeight: s.isNew ? 700 : 600, whiteSpace: "nowrap" }}>{s.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, marginLeft: 4 }}>
                    {s.value.toLocaleString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Bouton "+ Ajouter dépense" centré horizontal */}
          <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <button style={{
              padding: "12px 22px", borderRadius: 11,
              background: step === 1 ? "linear-gradient(135deg,#E11D48,#9333EA)" : "linear-gradient(135deg,rgba(225,29,72,0.18),rgba(147,51,234,0.18))",
              border: `1.5px solid ${step === 1 ? "transparent" : "rgba(225,29,72,0.4)"}`,
              color: "#fff", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              cursor: "pointer",
              transform: step === 1 ? "scale(0.95)" : "scale(1)",
              boxShadow: step === 1 ? "0 0 0 5px rgba(225,29,72,0.25), 0 4px 16px rgba(225,29,72,0.55)" : "0 2px 8px rgba(225,29,72,0.2)",
              transition: "all 0.3s ease",
              fontFamily: fontMomento,
            }}>
              <span style={{ fontSize: 17, lineHeight: 1 }}>＋</span> Ajouter une dépense
            </button>
          </div>
        </div>

        {/* FORM-ZOOM : prend tout l'espace centré */}
        <div style={{
          position: "absolute", inset: 0,
          padding: "10px 12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: showForm ? 1 : 0,
          transform: showForm ? "scale(1)" : "scale(1.4)",
          transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: showForm ? "auto" : "none",
        }}>
          <div style={{
            width: "100%", maxWidth: 280,
            background: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 14,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>
              Nouvelle dépense
            </div>
            {/* Catégorie pré-remplie */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4, fontWeight: 600 }}>Catégorie</div>
              <div style={{
                background: "rgba(212,115,58,0.2)",
                border: "1.5px solid rgba(212,115,58,0.55)",
                borderRadius: 8, padding: "8px 12px",
                fontSize: 14, color: "#fff", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 9,
              }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#D4733A" }} />
                Traiteur
              </div>
            </div>
            {/* Montant */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4, fontWeight: 600 }}>Montant</div>
              <div style={{
                background: "rgba(255,255,255,0.06)",
                border: `2px solid ${step === 3 ? "rgba(225,29,72,0.55)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8, padding: "8px 12px",
                fontSize: 17, color: "#fff", fontWeight: 700,
                minHeight: 28, display: "flex", alignItems: "center",
                boxShadow: step === 3 ? "0 0 0 4px rgba(225,29,72,0.15)" : "none",
                transition: "border 0.2s, box-shadow 0.2s",
                fontVariantNumeric: "tabular-nums",
              }}>
                {typedAmount || (step !== 3 ? <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>0</span> : null)}
                <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 7, fontSize: 13, fontWeight: 500 }}>Dhs</span>
              </div>
            </div>
            {/* Bouton Valider */}
            <button style={{
              padding: "11px 0", borderRadius: 9,
              background: step === 4 ? "#22c55e" : "linear-gradient(135deg,#E11D48,#9333EA)",
              color: "#fff", fontSize: 15, fontWeight: 700, border: "none",
              cursor: "pointer", textAlign: "center",
              transform: step === 4 ? "scale(0.94)" : "scale(1)",
              boxShadow: step === 4 ? "0 0 0 5px rgba(34,197,94,0.3), 0 4px 14px rgba(34,197,94,0.55)" : "0 3px 10px rgba(225,29,72,0.35)",
              transition: "all 0.3s ease",
              fontFamily: fontMomento,
            }}>
              {step === 4 ? "✓ Validé" : "Valider"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast (wrapper centré pour éviter conflit translateX/animation) */}
      {showToast && (
        <div style={{
          position: "absolute", top: 60, left: 0, right: 0,
          display: "flex", justifyContent: "center",
          zIndex: 5, pointerEvents: "none",
        }}>
          <div style={{
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff", padding: "8px 16px",
            borderRadius: 99,
            fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 6px 20px rgba(34,197,94,0.55)",
            animation: "slideIn 0.45s ease",
            fontFamily: fontMomento,
            whiteSpace: "nowrap",
          }}>
            <span>✓</span>
            <span>Traiteur · +5 000 Dhs</span>
          </div>
        </div>
      )}
    </div>
  )
}

const BENTO_FEATURES = [
  { title: "Site événement",    href: "/dashboard/event-site", desc: "Ta page de mariage, à tes couleurs.",      preview: <SiteEventPreview /> },
  { title: "Prestataires",      href: "/explore",              desc: "Swipe, sélectionne, contacte.",             preview: <VendorSwipePreview /> },
  { title: "Invitations & RSVP",href: "/dashboard/event-site", desc: "Partage et suis les réponses en direct.", preview: <RsvpPreview /> },
  { title: "Messages",          href: "/messages",             desc: "Chat direct avec tes prestataires.",        preview: <MessagesPreview /> },
  { title: "Agent IA",          href: "/dashboard",            desc: "Ton assistant mariage intelligent.",        preview: <AgentAIPreview /> },
  { title: "Budget",            href: "/budget",               desc: "Rappels, répartition, zéro surprise.",      preview: <BudgetPreview /> },
]

export default function AntVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef    = useRef<HTMLDivElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)
  const curScale     = useRef(SCALE_MIN)
  const curRadius    = useRef(RADIUS_MIN)

  useEffect(() => {
    const container = containerRef.current
    const win       = windowRef.current
    if (!container || !win) return

    const loop = () => {
      const rect = container.getBoundingClientRect()
      const vh   = window.innerHeight

      /*
       * Ancien déclencheur : démarre quand le container entre dans
       * le viewport PAR LE BAS (pendant que le hero est encore visible).
       *   rect.top = vh  → raw = 0  (container juste au bas du viewport)
       *   rect.top = 0   → raw = 1  (container top au haut du viewport)
       *
       * Container = 130dvh :
       *   – animation se termine exactement au début du sticky (~raw=1)
       *   – 30dvh de hold sticky → puis AntAgentFirst arrive
       */
      const raw   = Math.max(0, Math.min(1, (vh - rect.top) / vh))
      const eased = smoothstep(raw)

      const targetScale  = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * eased
      const targetRadius = RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * eased

      curScale.current  += (targetScale  - curScale.current)  * LERP
      curRadius.current += (targetRadius - curRadius.current) * LERP

      win.style.transform    = `scale(${curScale.current.toFixed(5)})`
      win.style.borderRadius = `${curRadius.current.toFixed(2)}px`
      win.style.opacity      = String(Math.min(1, raw * 5).toFixed(3))

      // Overlay text — apparaît progressivement à partir de 75% de l'animation
      if (overlayRef.current) {
        const scaleProgress = (curScale.current - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)
        const textOpacity   = Math.max(0, (scaleProgress - 0.75) / 0.25)
        overlayRef.current.style.opacity = textOpacity.toFixed(3)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    /* 130dvh : animation termine au moment où le sticky démarre,
       puis ~30dvh de hold avant de laisser passer AntAgentFirst */
    <div ref={containerRef} className="ant-video-shell" style={{ height: "130dvh", position: "relative" }}>
      <div
        className="clone-video-bg ant-video-sticky"
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
          backgroundColor: "var(--dash-bg,#fff)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/*
         * Remplace le placeholder par ta vidéo :
         *   <video autoPlay muted loop playsInline
         *     src="/videos/ton-fichier.mp4"
         *     style={{ width:"100%", height:"100%", objectFit:"cover" }} />
         */}
        <div
          ref={windowRef}
          className="ant-video-window"
          style={{
            position: "absolute",
            inset: 0,
            willChange: "transform, border-radius, opacity",
            transformOrigin: "center center",
            overflow: "hidden",
            transform: `scale(${SCALE_MIN})`,
            borderRadius: `${RADIUS_MIN}px`,
            opacity: 0,
          }}
        >
          {/* ── Contenu bento — remplace le placeholder vidéo ── */}
          <div style={{ width: "100%", height: "100%", background: "#0e0e0e", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Zone principale — flex:1, layout vertical : texte haut + grille bas */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.6vh 4vw 2vh", boxSizing: "border-box", gap: "1.4vh", minHeight: 0 }}>

              {/* Texte en-tête — centré */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "clamp(1.1rem, 1.8vw, 3rem)", fontWeight: 500, lineHeight: 1.15, color: "#f5f5f5", margin: "0 0 0.4vh", letterSpacing: "-0.02em" }}>
                  Tout ce qu&apos;il te faut pour organiser{" "}
                  <span style={{ background: "linear-gradient(90deg,#E11D48,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    le mariage que tu veux.
                  </span>
                </p>
                <p style={{ fontSize: "clamp(0.65rem, 0.7vw, 1.1rem)", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                  Pour chaque jour jusqu&apos;au grand jour.
                </p>
              </div>

              {/* Grille 3×2 fixe — minmax(0,1fr) empêche le contenu intrinsèque
                  des animations zoom de pousser les rows et déformer les cartes */}
              <div className="ant-bento-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1vw", minHeight: 0 }}>
                {BENTO_FEATURES.map((f, i) => (
                  <Link key={i} href={f.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    <div
                      style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 14px 14px", display: "flex", flexDirection: "column", gap: 6, transition: "background 0.2s, border-color 0.2s", overflow: "hidden" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(255,255,255,0.14)" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.07)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "clamp(0.7rem, 0.95vw, 1.35rem)", fontWeight: 600, color: "#f5f5f5" }}>{f.title}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "clamp(0.65rem, 0.85vw, 1.2rem)" }}>→</span>
                      </div>
                      <p style={{ fontSize: "clamp(0.55rem, 0.65vw, 1.05rem)", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", minHeight: 0, containerType: "size" } as React.CSSProperties}>{f.preview}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Overlay fade-in au max de l'animation */}
            <div ref={overlayRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }} />
            <style>{`
              @keyframes typingBounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-3px);opacity:1}}
              .typing-dot{animation:typingBounce 1.2s ease infinite}
              @keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
              @keyframes checkIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
              @keyframes tapPulse{0%{transform:translateY(-50%) scale(0.6);opacity:0}30%{transform:translateY(-50%) scale(1.2);opacity:1}100%{transform:translateY(-50%) scale(1);opacity:0.95}}
              @keyframes detailZoom{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
              @keyframes cursorClick{0%{transform:scale(1)}30%{transform:scale(0.78)}60%{transform:scale(1.05)}100%{transform:scale(1)}}
              @keyframes cursorRing{0%{transform:scale(0);opacity:0.7}100%{transform:scale(2.4);opacity:0}}
              @keyframes rsvpBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
              @keyframes badgePop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.35);opacity:1}100%{transform:scale(1);opacity:1}}
              @keyframes badgePopBig{0%{transform:scale(0);opacity:0}35%{transform:scale(1.7);opacity:1}65%{transform:scale(0.85)}85%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
              @keyframes badgeRingPulse{0%{transform:scale(0.7);opacity:0.8}100%{transform:scale(2.6);opacity:0}}
              .ai-chat-scroll::-webkit-scrollbar{display:none}

              /* Grille 3×2 conservée sur TOUS les écrans desktop/tablet
                 pour garantir une forme et un aspect ratio constants des
                 cartes. Le canvas scale-to-fit (cf JS canvasRef) ajuste
                 l'échelle pour que les 6 cartes tiennent dans 100dvh. */
              /* Mobile vertical : 1 colonne × 6 lignes, full natural scroll */
              @media (max-width: 767px) {
                .ant-video-shell { height: auto !important; }
                .ant-video-sticky {
                  position: static !important;
                  height: auto !important;
                }
                .ant-video-window {
                  position: relative !important;
                  inset: auto !important;
                  transform: none !important;
                  border-radius: 0 !important;
                  opacity: 1 !important;
                  width: 100%;
                  min-height: auto !important;
                }
                .ant-bento-grid {
                  grid-template-columns: 1fr !important;
                  grid-template-rows: repeat(6, minmax(280px, auto)) !important;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  )
}
