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

// ── 2. Prestataires — VendorSwipe ─────────────────────────────────────────────
function VendorSwipePreview() {
  const step = useAnimLoop([2000, 500, 800, 2500])
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {step < 3 ? (
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
          <div style={{ width: "90%", background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "9px 9px 7px", border: "1px solid rgba(255,255,255,0.1)", transform: step === 1 ? "translateX(70%) rotate(14deg)" : "translateX(0) rotate(0deg)", opacity: step === 1 ? 0 : 1, transition: step === 1 ? "transform 0.4s ease, opacity 0.3s ease 0.2s" : "none" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#5B21B6,#1E40AF)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎻</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#f5f5f5", marginBottom: 2 }}>Orchestre El Maghrib</div>
                <div style={{ display: "flex", gap: 1 }}>{"★★★★★".split("").map((s,i)=><span key={i} style={{ fontSize: 8, color: "#f59e0b" }}>{s}</span>)}</div>
              </div>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>Casa</span>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ flex: 1, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 11 }}>✕</span></div>
              <div style={{ flex: 1, height: 20, borderRadius: 6, background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 11 }}>✓</span></div>
            </div>
          </div>
          {step === 2 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "checkIn 0.3s ease" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(34,197,94,0.2)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, color: "#22c55e" }}>✓</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minHeight: 0 }}>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", flexShrink: 0 }}>MES PRESTATAIRES</div>
          {[
            { emoji: "🎻", name: "Orchestre El Maghrib", tag: "Musique", isNew: true },
            { emoji: "📸", name: "Studio Lumière",       tag: "Photo" },
            { emoji: "🌸", name: "Fleurs & Art",         tag: "Décoration" },
          ].map((v,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: v.isNew ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${v.isNew ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, padding: "5px 7px", animation: v.isNew ? "slideIn 0.4s ease" : "none" }}>
              <span style={{ fontSize: 12 }}>{v.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 600, color: v.isNew ? "#4ade80" : "#f5f5f5" }}>{v.name}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>{v.tag}</div>
              </div>
              {v.isNew && <span style={{ fontSize: 7, color: "#4ade80", fontWeight: 600 }}>Nouveau ✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 3. Invitations & RSVP — clic "Oui" ───────────────────────────────────────
function RsvpPreview() {
  const step = useAnimLoop([2000, 400, 1600, 2000])
  const pct = step >= 2 ? 72 : 68
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
      <div style={{ borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ height: 19, background: "linear-gradient(90deg,#C2410C,#B45309)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Yazid & Sara — 17 Nov 2025</span>
        </div>
        <div style={{ padding: "6px 7px", display: "flex", gap: 5 }}>
          <div style={{ flex: 1, height: 20, borderRadius: 6, background: step === 1 ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.15)", border: `1px solid ${step === 1 ? "#4ade80" : "rgba(34,197,94,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, border 0.2s", transform: step === 1 ? "scale(0.94)" : "scale(1)" }}>
            <span style={{ fontSize: 9, color: "#4ade80", fontWeight: 600 }}>✓ Oui</span>
          </div>
          <div style={{ flex: 1, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>✗ Non</span>
          </div>
        </div>
      </div>
      {step >= 2 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
          <div style={{ fontSize: 9, color: "#4ade80", textAlign: "center", fontWeight: 500, animation: "slideIn 0.4s ease" }}>Merci ! Ta place est confirmée 🎉</div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", transition: "width 0.8s ease", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Confirmés</span>
            <span style={{ fontSize: 8, color: "#4ade80", fontWeight: 600 }}>{pct}%</span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>RSVP reçus</span>
            <span style={{ fontSize: 8, color: "#4ade80", fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[{s:"68 Oui ✓",g:true},{s:"12 Attente",g:false},{s:"8 Non",g:false}].map((x,i) => (
              <div key={i} style={{ flex: 1, padding: "3px 0", borderRadius: 5, background: x.g ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)", textAlign: "center" }}>
                <span style={{ fontSize: 7, color: x.g ? "#4ade80" : "rgba(255,255,255,0.35)" }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 4. Messages — chat en temps réel ──────────────────────────────────────────
function MessagesPreview() {
  const step = useAnimLoop([1200, 1000, 2500, 1000, 2000])
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 7px", background: "rgba(255,255,255,0.05)", borderRadius: 8, flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#0369A1,#0891B2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>🏛</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#f5f5f5" }}>Salle des fêtes Royale</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>Casablanca</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4, overflow: "hidden", minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: "82%", background: "linear-gradient(135deg,#E11D48,#9333EA)", borderRadius: "9px 9px 2px 9px", padding: "4px 7px" }}>
            <span style={{ fontSize: 8, color: "#fff" }}>Bonjour, disponibles le 17 Nov ?</span>
          </div>
        </div>
        {step === 1 && (
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", animation: "slideIn 0.3s ease" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#0369A1,#0891B2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🏛</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "9px 9px 9px 2px", padding: "5px 9px", display: "flex", gap: 3, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {step >= 2 && (
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", animation: step === 2 ? "slideIn 0.3s ease" : "none" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#0369A1,#0891B2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🏛</div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: "9px 9px 9px 2px", padding: "4px 7px" }}>
              <span style={{ fontSize: 8, color: "#f5f5f5", lineHeight: 1.4 }}>Oui, disponibles le 17 Nov ✓ Pour combien de personnes ?</span>
            </div>
          </div>
        )}
        {step >= 4 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: "slideIn 0.3s ease" }}>
            <div style={{ maxWidth: "78%", background: "linear-gradient(135deg,#E11D48,#9333EA)", borderRadius: "9px 9px 2px 9px", padding: "4px 7px" }}>
              <span style={{ fontSize: 8, color: "#fff" }}>Merci ! Pouvons-nous nous appeler ?</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 5. Agent IA — assistant conseil ───────────────────────────────────────────
function AgentAIPreview() {
  const step = useAnimLoop([1200, 1200, 3000, 2000])
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: 7, background: "linear-gradient(135deg,#E11D48,#9333EA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>✨</div>
        <span style={{ fontSize: 9, fontWeight: 600, color: "#f5f5f5" }}>Agent Momento</span>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "2px 5px" }}>IA</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4, overflow: "hidden", minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: "85%", background: "rgba(255,255,255,0.1)", borderRadius: "9px 9px 2px 9px", padding: "4px 7px" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.85)" }}>Quelle palette pour un mariage élégant ?</span>
          </div>
        </div>
        {step === 1 && (
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", animation: "slideIn 0.3s ease" }}>
            <div style={{ width: 16, height: 16, borderRadius: 6, background: "linear-gradient(135deg,#E11D48,#9333EA)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>✨</div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "9px 9px 9px 2px", padding: "5px 9px", display: "flex", gap: 3, alignItems: "center" }}>
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animationDelay: "150ms" }} />
              <div className="typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {step >= 2 && (
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", animation: step === 2 ? "slideIn 0.3s ease" : "none" }}>
            <div style={{ width: 16, height: 16, borderRadius: 6, background: "linear-gradient(135deg,#E11D48,#9333EA)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>✨</div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: "9px 9px 9px 2px", padding: "4px 7px" }}>
              <span style={{ fontSize: 8, color: "#f5f5f5", lineHeight: 1.5 }}>Je recommande <span style={{ color: "#f87171", fontWeight: 600 }}>Bordeaux</span> + <span style={{ color: "#fbbf24", fontWeight: 600 }}>Or</span> — raffiné et intemporel ✨</span>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: "flex", justifyContent: "flex-end", animation: "slideIn 0.3s ease" }}>
            <div style={{ maxWidth: "78%", background: "linear-gradient(135deg,#E11D48,#9333EA)", borderRadius: "9px 9px 2px 9px", padding: "4px 7px" }}>
              <span style={{ fontSize: 8, color: "#fff" }}>Très bonne idée ! 🎉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 6. Budget — rappel paiement + barres animées ──────────────────────────────
function BudgetPreview() {
  const step = useAnimLoop([2000, 600, 2200, 800])
  const showNotif = step === 1 || step === 2
  const items = [
    { l: "Traiteur", p: 65, c: "#E11D48", hi: step === 2 },
    { l: "Photos",   p: 42, c: "#9333EA", hi: false },
    { l: "Salle",    p: 88, c: "#0EA5E9", hi: false },
  ]
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 0, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexShrink: 0 }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Budget total</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f5f5f5" }}>120 000 MAD</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7 }}>
        {items.map((it,i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 8, color: it.hi ? "#fbbf24" : "rgba(255,255,255,0.5)", transition: "color 0.4s", fontWeight: it.hi ? 600 : 400 }}>{it.l}</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{it.p}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${it.p}%`, background: it.hi ? "#fbbf24" : it.c, transition: "background 0.5s", borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 8, padding: "5px 7px", display: "flex", alignItems: "center", gap: 5, opacity: showNotif ? 1 : 0, transform: showNotif ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.35s, transform 0.35s", pointerEvents: "none" }}>
        <span style={{ fontSize: 11 }}>⏰</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: "#fbbf24" }}>Rappel paiement</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>Traiteur — 5 000 MAD dû ce mois</div>
        </div>
      </div>
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
    <div ref={containerRef} style={{ height: "130dvh", position: "relative" }}>
      <div
        className="clone-video-bg"
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
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "3vh 4vw", boxSizing: "border-box", gap: "2.5vh", minHeight: 0 }}>

              {/* Texte en-tête — centré */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "clamp(1.4rem,2.4vw,2.2rem)", fontWeight: 500, lineHeight: 1.25, color: "#f5f5f5", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Tout ce qu&apos;il te faut pour organiser{" "}
                  <span style={{ background: "linear-gradient(90deg,#E11D48,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    le mariage que tu veux.
                  </span>
                </p>
                <p style={{ fontSize: "clamp(0.8rem,1.1vw,0.95rem)", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                  Pour chaque jour jusqu&apos;au grand jour.
                </p>
              </div>

              {/* Grille 3×2 — remplit toute la hauteur restante */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "1fr 1fr", gap: "1vw", minHeight: 0 }}>
                {BENTO_FEATURES.map((f, i) => (
                  <Link key={i} href={f.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    <div
                      style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 14px 14px", display: "flex", flexDirection: "column", gap: 6, transition: "background 0.2s, border-color 0.2s", overflow: "hidden" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(255,255,255,0.14)" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.07)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "clamp(0.78rem,1vw,0.95rem)", fontWeight: 600, color: "#f5f5f5" }}>{f.title}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>→</span>
                      </div>
                      <p style={{ fontSize: "clamp(0.65rem,0.8vw,0.78rem)", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", minHeight: 0 }}>{f.preview}</div>
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
            `}</style>
          </div>
        </div>
      </div>
    </div>
  )
}
