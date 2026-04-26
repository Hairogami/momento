"use client"
import { useEffect, useRef, useState } from "react"

/* ── Event & marketplace icons (cohérent avec la marque) ──── */
const ICONS = [
  "camera_alt","music_note","local_dining","celebration","location_on",
  "favorite","groups","event","verified","message","local_florist","diamond",
  "photo_camera","nightlife","deck","cake","emoji_events","star",
]

const TEXT = "Comparez 1 000+ prestataires, négociez directement, en toute transparence."

export default function AntAgentFirst() {
  const ref          = useRef<HTMLDivElement>(null)
  const [go, setGo]  = useState(false)
  const [typed, setTyped]   = useState("")
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          obs.disconnect()
          requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)))
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!go) return
    let i = 0
    const t = setInterval(() => {
      setTyped(TEXT.slice(0, ++i))
      if (i >= TEXT.length) clearInterval(t)
    }, 38)
    return () => clearInterval(t)
  }, [go])

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 520)
    return () => clearInterval(t)
  }, [])

  return (
    <section ref={ref} style={{ backgroundColor: "var(--dash-bg,#fff)", overflow: "hidden", paddingBottom: 0 }}>

      {/* ── Icon strip — event icons ─────────────────────────── */}
      <div className="overflow-hidden" style={{ paddingBlock: 24, marginBottom: 72 }}>
        <div className="ant-icon-track" style={{ display: "flex", gap: 14, width: "max-content" }}>
          {[...ICONS, ...ICONS, ...ICONS].map((icon, i) => (
            <div
              key={i}
              className="ant-icon-wave"
              style={{ animationDelay: `${(i % ICONS.length) * 0.09}s` } as React.CSSProperties}
            >
              <span className="gs-icon">{icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-col: typewriter left / App preview right ───────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Left — typewriter */}
          <div>
            <h2 className="clone-heading" style={{
              fontSize: "clamp(1.8rem, 0.5rem + 2.8vw, 3.6rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--dash-text,#121317)",
              minHeight: "8rem",
            }}>
              {typed}
              <span style={{
                display: "inline-block", width: 2, height: "0.82em",
                backgroundColor: "var(--dash-text,#121317)", marginLeft: 3,
                verticalAlign: "text-bottom",
                opacity: cursor ? 1 : 0,
                transition: "opacity 0.08s",
              }}/>
            </h2>

            <p className="clone-body" style={{
              fontSize: 15, lineHeight: 1.7, color: "var(--dash-text-2,#6a6a71)",
              marginTop: 16, maxWidth: 380,
              opacity: typed.length >= TEXT.length ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}>
              Ce que voient les 2 300 organisateurs déjà inscrits.
            </p>
          </div>

          {/* Right — Momento app preview */}
          <div style={{
            opacity: go ? undefined : 0,
            animation: go ? "windowExpand 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
            transformOrigin: "top center",
          }}>
            <div className="clone-mockup" style={{
              borderRadius: 16, overflow: "hidden",
              background: "var(--dash-faint,#f8f9fc)",
              border: "1px solid rgba(183,191,217,0.28)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            }}>
              {/* Chrome */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 16px",
                borderBottom: "1px solid rgba(183,191,217,0.18)",
                background: "var(--dash-surface,#fff)",
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>
                  ))}
                </div>
                <div style={{
                  flex: 1, textAlign: "center", fontSize: 10, color: "var(--dash-text-2,#6a6a71)",
                  background: "rgba(183,191,217,0.15)", borderRadius: 99, padding: "2px 8px",
                }}>
                  momentoevents.app/explore
                </div>
              </div>

              {/* App content */}
              <div style={{ padding: "14px 16px", background: "var(--dash-faint,#f8f9fc)" }}>
                {/* Search bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.3)",
                  borderRadius: 99, padding: "7px 14px", marginBottom: 10,
                }}>
                  <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 14, color: "var(--dash-text-2,#6a6a71)" }}>search</span>
                  <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", flex: 1 }}>Photographe · Casablanca...</span>
                  <span className="clone-filter-badge" style={{ fontSize: 10, color: "#fff", background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", padding: "2px 8px", borderRadius: 99 }}>Filtrer</span>
                </div>

                {/* Category chips */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  {["Photographie","DJ","Traiteur","Décoration","Fleuriste"].map((cat, i) => (
                    <span key={cat} className={i === 0 ? "clone-pill-active" : ""} style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 99,
                      background: i === 0 ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))" : "rgba(183,191,217,0.18)",
                      color: i === 0 ? "#fff" : "#45474D",
                      border: i === 0 ? "none" : "1px solid rgba(183,191,217,0.3)",
                    }}>{cat}</span>
                  ))}
                </div>

                {/* Vendor cards */}
                {[
                  { name: "Karim Benali",   city: "Casablanca", price: "3 000 Dhs", r: "4.9", n: 34 },
                  { name: "Studio Lumière", city: "Rabat",       price: "2 500 Dhs", r: "4.7", n: 21 },
                  { name: "Anissa Photo",   city: "Marrakech",   price: "1 800 Dhs", r: "4.8", n: 18 },
                ].map((v, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.2)",
                    borderRadius: 10, padding: "8px 10px", marginBottom: 6,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg,#E11D48,#9333EA)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{v.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{v.name}</div>
                      <div style={{ fontSize: 10, color: "var(--dash-text-2,#6a6a71)" }}>Photographe · {v.city}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>★ {v.r}</div>
                      <div style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>{v.price}</div>
                    </div>
                  </div>
                ))}

                {/* Bottom stats bar */}
                <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(183,191,217,0.15)" }}>
                  {[["1 000+","prestataires"],["41","villes"],["31","catégories"]].map(([val, lbl]) => (
                    <div key={lbl} style={{ flex: 1, textAlign: "center" }}>
                      <div className="clone-stat-num" style={{ fontSize: 12, fontWeight: 700, backgroundImage: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
                      <div style={{ fontSize: 9, color: "var(--dash-text-2,#6a6a71)" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes windowExpand {
          from { opacity: 0; transform: scale(0.68) translateY(40px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
        .ant-icon-track {
          animation: iconScroll 26s linear infinite;
        }
        @keyframes iconScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .ant-icon-wave {
          flex-shrink: 0;
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(183,191,217,0.1);
          border: 1px solid rgba(183,191,217,0.22);
          animation: iconBob 2s ease-in-out infinite;
        }
        @keyframes iconBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .ant-icon-wave .gs-icon {
          font-family: 'Google Symbols', 'Material Symbols Outlined';
          font-weight: normal; font-style: normal;
          font-size: 22px; color: #45474D;
          line-height: 1; user-select: none;
          display: inline-block; vertical-align: middle;
        }
      `}</style>
    </section>
  )
}
