"use client"
import { useEffect, useRef, useState } from "react"

/* ── Brand icons — event & marketplace themed ──────────────── */
const STRIP_ICONS = [
  "camera_alt","music_note","local_dining","celebration","location_on",
  "star","favorite","groups","event","verified","message","local_florist",
  "diamond","photo_camera","nightlife","deck","cake","emoji_events",
]

const FEATURES = [
  {
    icon: "search",
    title: "Recherche par ville et budget",
    desc: "Filtrez par catégorie, ville, budget et disponibilité parmi 1 000+ profils vérifiés dans 41 villes marocaines.",
    mockup: <SearchMockup />,
  },
  {
    icon: "verified",
    title: "Prestataires vérifiés",
    desc: "Chaque prestataire est vérifié : badge de confiance, avis clients authentiques, liens Instagram et Facebook confirmés.",
    mockup: <VendorProfileMockup />,
  },
  {
    icon: "chat",
    title: "Contact direct, devis en minutes",
    desc: "Contactez vos prestataires en un clic, obtenez un devis en moins de 2h et confirmez votre réservation — sans commission.",
    mockup: <BookingMockup />,
  },
  {
    icon: "event",
    title: "Gestion d'événement",
    desc: "Gérez invités, budget, tâches et timeline depuis votre tableau de bord. Connectez Google Calendar pour ne rien manquer.",
    mockup: <EventDashboardMockup />,
  },
]

/* ── Shared GsIcon ───────────────────────────────────────────── */
function GsIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <span className={`clone-gs-icon ${className}`} style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontWeight: "normal", fontStyle: "normal",
      fontSize: size, lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle",
    }}>
      {icon}
    </span>
  )
}

/* ── Mockups ────────────────────────────────────────────────── */

function SearchMockup() {
  return (
    <div className="clone-mockup rounded-2xl overflow-hidden" style={{ background: "rgba(183,191,217,0.07)", border: "1px solid rgba(183,191,217,0.2)", padding: 20 }}>
      {/* Search bar */}
      <div className="clone-mockup-surface flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.3)" }}>
        <GsIcon icon="search" size={16} />
        <span className="clone-mockup-muted" style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>Photographe mariage Casablanca...</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs clone-mockup-muted" style={{ background: "rgba(183,191,217,0.18)", color: "var(--dash-text-2,#6a6a71)" }}>Filtrer</span>
      </div>
      {/* Category chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["Photographie", "DJ", "Traiteur", "Décoration"].map((cat, i) => (
          <span key={cat} className={`px-3 py-1 rounded-full text-xs${i === 0 ? " clone-pill-active" : ""}`} style={{
            background: i === 0 ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))" : "rgba(183,191,217,0.15)",
            color: i === 0 ? "#fff" : "#45474D",
            border: i === 0 ? "none" : "1px solid rgba(183,191,217,0.3)",
          }}>{cat}</span>
        ))}
      </div>
      {/* Vendor cards */}
      {[
        { name: "Karim Benali",   cat: "Photographe", city: "Casablanca", price: "3 000–8 000 MAD", rating: "4.9" },
        { name: "Studio Lumière", cat: "Photographie", city: "Rabat",       price: "2 500–6 000 MAD", rating: "4.7" },
        { name: "Fatima Zahra",   cat: "Photographe", city: "Marrakech",    price: "1 800–5 000 MAD", rating: "4.8" },
      ].map((v, i) => (
        <div key={i} className="clone-mockup-surface flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.18)" }}>
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {v.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="clone-mockup-text-h" style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{v.name}</span>
              <GsIcon icon="verified" size={12} className="text-rose-600" />
            </div>
            <div className="clone-mockup-muted" style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)" }}>{v.cat} · {v.city}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div style={{ fontSize: 11, fontWeight: 600, color: "#F59E0B" }}>★ {v.rating}</div>
            <div className="clone-mockup-muted" style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>{v.price}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function VendorProfileMockup() {
  return (
    <div className="clone-mockup rounded-2xl" style={{ background: "rgba(183,191,217,0.07)", border: "1px solid rgba(183,191,217,0.2)", padding: 24 }}>
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)", fontSize: 22, color: "#fff", fontWeight: 700 }}>A</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="clone-mockup-text-h" style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Anissa Photography</span>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(225,29,72,0.1)", color: "#E11D48", border: "1px solid rgba(225,29,72,0.18)" }}>✓ Vérifié</span>
          </div>
          <div className="clone-mockup-muted" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)" }}>Photographe · Casablanca, Rabat</div>
          <div className="flex items-center gap-1 mt-1.5">
            <span style={{ fontSize: 13, color: "#F59E0B" }}>★★★★★</span>
            <span className="clone-mockup-muted" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", marginLeft: 4 }}>4.9 · 47 avis</span>
          </div>
        </div>
      </div>
      <div className="clone-mockup-muted" style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Avis clients</div>
      {[
        { author: "Sara M.",   text: "Photos magnifiques, vraiment professionnelle !" },
        { author: "Youssef B.", text: "Très à l'écoute, résultat au-delà des attentes." },
        { author: "Nadia L.",  text: "Ponctuelle et créative — je recommande." },
      ].map((r, i) => (
        <div key={i} className="clone-mockup-surface p-3 rounded-xl mb-2" style={{ background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.18)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="clone-mockup-text-h" style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{r.author}</span>
            <span style={{ fontSize: 11, color: "#F59E0B" }}>★★★★★</span>
          </div>
          <span className="clone-mockup-text" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)" }}>{r.text}</span>
        </div>
      ))}
    </div>
  )
}

function BookingMockup() {
  return (
    <div className="clone-mockup rounded-2xl overflow-hidden" style={{ background: "rgba(183,191,217,0.07)", border: "1px solid rgba(183,191,217,0.2)" }}>
      {/* Vendor header */}
      <div className="clone-mockup-surface flex items-center gap-3 p-4" style={{ borderBottom: "1px solid rgba(183,191,217,0.15)", background: "var(--dash-surface,#fff)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff", fontSize: 13, fontWeight: 700 }}>K</div>
        <div className="flex-1">
          <div className="clone-mockup-text-h" style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)" }}>Karim Benali</div>
          <div className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#16A34A" }}>En ligne · répond en &lt; 1h</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(225,29,72,0.1)", color: "#E11D48" }}>✓ Vérifié</span>
      </div>

      {/* Devis card */}
      <div className="px-4 pt-4 pb-2">
        <div className="clone-mockup-surface p-3 rounded-xl mb-3" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="clone-mockup-muted" style={{ fontSize: 10, color: "var(--dash-text-2,#6a6a71)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Devis reçu</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="clone-mockup-text-h" style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Package Mariage Complet</div>
              <div className="clone-mockup-muted" style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)" }}>8h · 2 photographes · retouches incluses</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--dash-text,#121317)" }}>4 500 MAD</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-end">
            <div className="px-3 py-2 rounded-2xl rounded-tr-sm" style={{ background: "#121317", fontSize: 12, color: "#fff", maxWidth: "80%" }}>
              C'est parfait ! On confirme pour le 15 juin 🎊
            </div>
          </div>
          <div className="flex justify-start">
            <div className="clone-mockup-surface px-3 py-2 rounded-2xl rounded-tl-sm" style={{ background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.22)", fontSize: 12, color: "var(--dash-text,#121317)", maxWidth: "80%" }}>
              Super ! J'envoie le contrat maintenant ✓
            </div>
          </div>
        </div>

        {/* Confirm CTA */}
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#16A34A", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12 }}>✓</span>
          </span>
          <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>Réservation confirmée · 15 juin 2025</span>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 pt-2">
        <div className="clone-mockup-surface flex items-center gap-2 px-3 py-2.5 rounded-full" style={{ background: "var(--dash-surface,#fff)", border: "1px solid rgba(183,191,217,0.28)" }}>
          <span className="clone-mockup-muted" style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", flex: 1 }}>Envoyer un message...</span>
          <GsIcon icon="send" size={16} className="text-rose-600" />
        </div>
      </div>
    </div>
  )
}

function EventDashboardMockup() {
  return (
    <div className="clone-mockup rounded-2xl" style={{ background: "rgba(183,191,217,0.07)", border: "1px solid rgba(183,191,217,0.2)", padding: 24 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="clone-mockup-text-h" style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)" }}>Mariage Yasmine & Ali</div>
          <div className="clone-mockup-muted" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", marginTop: 2 }}>15 juin 2025 · Casablanca · 87 invités</div>
        </div>
        <div className="px-3 py-1 rounded-lg" style={{ background: "rgba(225,29,72,0.1)", color: "#E11D48", fontSize: 12, fontWeight: 700 }}>J-42</div>
      </div>
      {/* Budget */}
      <div className="mb-5">
        <div className="flex justify-between mb-1.5">
          <span className="clone-mockup-muted" style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)" }}>Budget utilisé</span>
          <span className="clone-mockup-text-h" style={{ fontSize: 11, fontWeight: 700, color: "var(--dash-text,#121317)" }}>62 000 / 100 000 MAD</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, background: "rgba(183,191,217,0.25)" }}>
          <div className="clone-progress-fill" style={{ width: "62%", height: "100%", background: "linear-gradient(90deg, var(--g1, #E11D48), var(--g2, #9333EA))", borderRadius: 99 }} />
        </div>
      </div>
      <div className="clone-mockup-muted" style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Tâches</div>
      {[
        { done: true,  label: "Photographe réservé",  sub: "Karim Benali" },
        { done: true,  label: "Salle confirmée",       sub: "Dar Zitoun, Casablanca" },
        { done: false, label: "Traiteur à confirmer",  sub: "2 devis en attente" },
        { done: false, label: "DJ — devis en cours",   sub: "Réponse attendue" },
      ].map((t, i) => (
        <div key={i} className="flex items-start gap-3 mb-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5${t.done ? " clone-check-done" : ""}`}
            style={{ background: t.done ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))" : "transparent", border: t.done ? "none" : "1.5px solid rgba(183,191,217,0.4)" }}>
            {t.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
          </div>
          <div>
            <div className={t.done ? "clone-mockup-muted" : "clone-mockup-text-h"} style={{ fontSize: 12, color: t.done ? "#9a9aaa" : "#121317", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</div>
            <div className="clone-mockup-muted" style={{ fontSize: 10, color: "var(--dash-text-2,#6a6a71)" }}>{t.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */

export default function AntFeatureExplorer() {
  const [active, setActive] = useState(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = itemRefs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i) },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  const f = FEATURES[active]

  return (
    <section style={{ backgroundColor: "var(--dash-bg,#fff)" }}>
      {/* Icon strip — event & marketplace icons */}
      <div className="overflow-hidden clone-border" style={{ borderBottom: "1px solid rgba(183,191,217,0.15)", paddingBlock: 20 }}>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", padding: "0 24px" }}>
          {STRIP_ICONS.map((icon, idx) => (
            <div
              key={icon}
              className="clone-icon-item"
              style={{
                width: 52, height: 52,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                background: "rgba(183,191,217,0.1)",
                border: "1px solid rgba(183,191,217,0.22)",
                animation: "iconBobFE 2s ease-in-out infinite",
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <span className="clone-gs-icon" style={{
                fontFamily: "'Google Symbols','Material Symbols Outlined'",
                fontWeight: "normal", fontStyle: "normal",
                fontSize: 22, color: "var(--dash-text-2,#45474D)",
                lineHeight: 1, userSelect: "none",
              }}>
                {icon}
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes iconBobFE {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-9px); }
          }
        `}</style>
      </div>

      {/* Main split */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — sticky */}
          <div className="lg:sticky top-24 self-start py-16 lg:py-32">
            <div className="flex flex-col gap-4 transition-all duration-500" key={active}>
              <div className="clone-icon-item w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(183,191,217,0.12)", border: "1px solid rgba(183,191,217,0.25)" }}>
                <span className="clone-gs-icon" style={{
                  fontFamily: "'Google Symbols','Material Symbols Outlined'",
                  fontSize: 18, color: "var(--dash-text,#121317)",
                  fontWeight: "normal", lineHeight: 1,
                }}>
                  {f.icon}
                </span>
              </div>
              <h3 className="clone-heading"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--dash-text,#121317)" }}
              >
                {f.title}
              </h3>
              <p className="clone-body" style={{ fontSize: 15, lineHeight: 1.7, color: "var(--dash-text-2,#6a6a71)", maxWidth: 420 }}>
                {f.desc}
              </p>

              {/* Progress dots */}
              <div className="flex gap-2 mt-4">
                {FEATURES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className={`transition-all duration-300${i === active ? " clone-dot-active" : ""}`}
                    style={{
                      width: i === active ? 20 : 6,
                      height: 6,
                      borderRadius: 99,
                      background: i === active ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))" : "rgba(183,191,217,0.4)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            <a
              href="/explore"
              className="clone-cta-ghost inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(183,191,217,0.12)", color: "var(--dash-text,#121317)", border: "1px solid rgba(183,191,217,0.25)" }}
            >
              Explorer la plateforme →
            </a>
          </div>

          {/* Right — scrolling mockups */}
          <div className="flex flex-col gap-0">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                ref={el => { itemRefs.current[i] = el }}
                className="flex items-center"
                style={{ minHeight: 500, paddingBlock: 80 }}
              >
                <div className="w-full">{feat.mockup}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
