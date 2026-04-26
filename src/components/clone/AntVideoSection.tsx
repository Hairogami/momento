"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"

/* ── tuning ───────────────────────────────────────────── */
const SCALE_MIN  = 0.26
const SCALE_MAX  = 0.87   // jamais plein écran
const RADIUS_MIN = 36     // très arrondi au départ
const RADIUS_MAX = 24     // clairement arrondi au max
const LERP       = 0.09   // fluide et réactif
/* ─────────────────────────────────────────────────────── */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

// ── Mockups ────────────────────────────────────────────────────────────────
function M({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>{children}</div>
}

const BENTO_FEATURES = [
  {
    title: "Site événement", href: "/dashboard/event-site", desc: "Ta page de mariage prête en 2 min.",
    preview: <M><div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:8 }}><div style={{ width:6,height:6,borderRadius:"50%",background:"#ef4444" }}/><div style={{ width:6,height:6,borderRadius:"50%",background:"#f59e0b" }}/><div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e" }}/><div style={{ flex:1,height:14,borderRadius:4,background:"#f3f4f6",display:"flex",alignItems:"center",padding:"0 6px" }}><span style={{ fontSize:7,color:"#9ca3af",fontFamily:"monospace" }}>yazid-sarah.momentoevents.app</span></div></div><div style={{ height:4,borderRadius:99,background:"linear-gradient(90deg,#E11D48,#9333EA)",width:"65%",marginBottom:4 }}/><div style={{ height:3,borderRadius:99,background:"#e5e7eb",width:"45%",marginBottom:8 }}/><div style={{ height:20,borderRadius:6,background:"linear-gradient(90deg,#E11D48,#9333EA)",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:8,color:"#fff",fontWeight:600 }}>RSVP →</span></div></M>,
  },
  {
    title: "Prestataires", href: "/explore", desc: "1 000+ pros vérifiés, 41 villes.",
    preview: <M><div style={{ display:"flex",gap:6,alignItems:"center",marginBottom:6 }}><div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#E11D48,#9333EA)",flexShrink:0 }}/><div style={{ flex:1 }}><div style={{ height:6,borderRadius:99,background:"#111",width:"60%",marginBottom:3 }}/><div style={{ display:"flex",gap:1 }}>{"★★★★★".split("").map((s,i)=><span key={i} style={{ fontSize:7,color:"#f59e0b" }}>{s}</span>)}</div></div><div style={{ background:"rgba(225,29,72,0.1)",borderRadius:5,padding:"2px 5px" }}><span style={{ fontSize:7,color:"#E11D48",fontWeight:600 }}>Pro</span></div></div><div style={{ display:"flex",gap:4 }}><div style={{ flex:1,height:18,borderRadius:5,background:"#f3f4f6" }}/><div style={{ flex:1,height:18,borderRadius:5,background:"linear-gradient(90deg,#E11D48,#9333EA)" }}/></div></M>,
  },
  {
    title: "Invitations & RSVP", href: "/dashboard/event-site", desc: "Partage RSVP, programme et photos.",
    preview: <M><div style={{ display:"flex",gap:4,marginBottom:6 }}>{["Confirmé ✓","En attente","Décliné"].map((s,i)=><div key={i} style={{ flex:1,padding:"2px 0",borderRadius:5,background:i===0?"rgba(34,197,94,0.12)":"#f3f4f6",textAlign:"center" }}><span style={{ fontSize:7,color:i===0?"#16a34a":"#6b7280" }}>{s}</span></div>)}</div><div style={{ height:4,borderRadius:99,background:"#e5e7eb",overflow:"hidden" }}><div style={{ height:"100%",width:"68%",background:"linear-gradient(90deg,#22c55e,#16a34a)" }}/></div></M>,
  },
  {
    title: "Invités", href: "/guests", desc: "RSVP, tables et régimes — tout en un.",
    preview: <M><div style={{ display:"flex",marginBottom:8 }}>{["S","M","L","K","A"].map((g,i)=><div key={i} style={{ width:22,height:22,borderRadius:"50%",background:["#E11D48","#9333EA","#0EA5E9","#10B981","#F97316"][i],border:"2px solid #fff",marginLeft:i===0?0:-6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff" }}>{g}</div>)}<div style={{ width:22,height:22,borderRadius:"50%",background:"#f3f4f6",border:"2px solid #fff",marginLeft:-6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#6b7280",fontWeight:600 }}>+42</div></div><div style={{ display:"inline-flex",alignItems:"center",gap:3,background:"rgba(225,29,72,0.08)",borderRadius:5,padding:"2px 6px" }}><span style={{ fontSize:7,color:"#E11D48",fontWeight:600 }}>🔔 3 réponses en attente</span></div></M>,
  },
  {
    title: "Budget", href: "/budget", desc: "Chaque dirham, sous contrôle.",
    preview: <M><div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6 }}><span style={{ fontSize:7,color:"#6b7280" }}>Budget total</span><span style={{ fontSize:10,fontWeight:700,color:"#111" }}>120 000 MAD</span></div>{[{l:"Traiteur",p:65,c:"#E11D48"},{l:"Photos",p:42,c:"#9333EA"},{l:"Salle",p:88,c:"#0EA5E9"}].map((it,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:2 }}><span style={{ fontSize:7,color:"#374151" }}>{it.l}</span><span style={{ fontSize:7,color:"#6b7280" }}>{it.p}%</span></div><div style={{ height:3,borderRadius:99,background:"#f3f4f6",overflow:"hidden" }}><div style={{ height:"100%",width:`${it.p}%`,background:it.c,borderRadius:99 }}/></div></div>)}</M>,
  },
  {
    title: "Checklist", href: "/planner", desc: "Ne rate aucune étape du grand jour.",
    preview: <M>{[{done:true,l:"Réserver la salle"},{done:true,l:"Choisir le traiteur"},{done:false,l:"Envoyer les faire-part"},{done:false,l:"Confirmer le DJ"}].map((t,i,arr)=><div key={i} style={{ display:"flex",alignItems:"center",gap:6,paddingBottom:i<arr.length-1?5:0,marginBottom:i<arr.length-1?5:0,borderBottom:i<arr.length-1?"1px solid #f3f4f6":"none" }}><div style={{ width:12,height:12,borderRadius:3,flexShrink:0,border:t.done?"none":"1.5px solid #d1d5db",background:t.done?"#22c55e":"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>{t.done&&<span style={{ fontSize:7,color:"#fff" }}>✓</span>}</div><span style={{ fontSize:7,color:t.done?"#9ca3af":"#111",textDecoration:t.done?"line-through":"none" }}>{t.l}</span></div>)}</M>,
  },
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
          <div style={{ width: "100%", height: "100%", background: "#0e0e0e", overflowY: "auto", position: "relative" }}>
            <div style={{ padding: "clamp(32px,4vw,56px) clamp(24px,4vw,64px)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "clamp(32px,4vw,64px)", alignItems: "center" }}>

                {/* Texte gauche */}
                <div>
                  <p style={{ fontSize: "clamp(1.3rem,2.4vw,2rem)", fontWeight: 500, lineHeight: 1.2, color: "#f5f5f5", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                    Tout ce qu&apos;il te faut pour organiser{" "}
                    <span style={{ background: "linear-gradient(90deg,#E11D48,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      le mariage que tu veux.
                    </span>
                  </p>
                  <p style={{ fontSize: "clamp(0.75rem,1vw,0.875rem)", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
                    Pour chaque jour jusqu&apos;au grand jour.
                  </p>
                </div>

                {/* Grille 3×2 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {BENTO_FEATURES.map((f, i) => (
                    <Link key={i} href={f.href} style={{ textDecoration: "none" }}>
                      <div
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 12px 10px", display: "flex", flexDirection: "column", gap: 8, transition: "background 0.2s, border-color 0.2s" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(255,255,255,0.14)" }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.07)" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "clamp(0.65rem,0.85vw,0.8rem)", fontWeight: 600, color: "#f5f5f5" }}>{f.title}</span>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>→</span>
                        </div>
                        <p style={{ fontSize: "clamp(0.6rem,0.75vw,0.7rem)", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                        <div style={{ marginTop: 2 }}>{f.preview}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay fade-in au max de l'animation */}
            <div ref={overlayRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
