"use client"

import { useEffect, useState } from "react"
import EventSiteRenderer from "@/components/event-site/EventSiteRenderer"

type PlaygroundSite = {
  id: string
  slug: string
  template: string
  palette: string
  fontHeading: string
  fontBody: string
  heroImageUrl: string | null
  layoutVariant: string
  content: Record<string, unknown>
  photos: { id: string; url: string; caption: string | null }[]
}

const TEMPLATES = ["mariage", "fete-famille", "corporate", "conference", "generique"]
const PALETTES = ["terracotta", "rose-or", "vert-olive", "baby-tiffany", "noir-rouge", "pastel"]
const FONTS = ["cormorant", "playfair", "pjs", "inter", "poppins"]
const PATTERNS = [
  "triangles", "chevrons", "losanges", "hexagone", "zellige", "art-deco", "arche", "constellations", "vagues",
  "arabesque", "florale", "fleurs-line",
  "cercles", "grille", "contours",
]
const INTENSITIES = ["none", "subtle", "normal", "festive"] as const

const INITIAL_SITE: PlaygroundSite = {
  id: "playground",
  slug: "playground",
  template: "mariage",
  palette: "terracotta",
  fontHeading: "cormorant",
  fontBody: "pjs",
  heroImageUrl: null,
  layoutVariant: "classic",
  content: {
    hero: {
      title: "Yousra & Ali",
      subtitle: "Se marient",
      date: "04 avril 2026",
      venue: "Domaine Terracotta",
    },
    mainEvent: {
      location: "Domaine Terracotta, Casablanca",
      locationResolved: { lat: 33.5731, lng: -7.5898, displayName: "Domaine Terracotta, Casablanca, Maroc" },
      mapsUrl: "https://www.google.com/maps?q=33.5731,-7.5898",
      wazeUrl: "https://waze.com/ul?ll=33.5731,-7.5898&navigate=yes",
      venueName: "Domaine Terracotta",
    },
    welcomeNote: "Nous sommes ravis de vous convier à la célébration de notre union. Votre présence est le plus beau cadeau.",
    dressCode: "Tenue de cocktail — couleurs claires appréciées",
    program: [
      { id: "s1", time: "17h00", label: "Cérémonie religieuse", venueName: "Mosquée Hassan II", description: "Tenue traditionnelle recommandée." },
      { id: "s2", time: "19h30", label: "Cocktail", venueName: "Terrasse du Domaine" },
      { id: "s3", time: "21h00", label: "Dîner & Soirée", description: "Ambiance musicale live." },
    ],
    rsvp: { deadline: "15 mars 2026", allowPlusOne: true },
    countdown: {
      enabled: true,
      targetDate: new Date(Date.now() + 45 * 86400000).toISOString(), // +45 jours
      variant: "grand",
      label: "Jusqu'au grand jour",
    },
    style: {
      pattern: "zellige",
      patternFullPage: false,
      animationIntensity: "none",
    },
  },
  photos: [],
}

export default function PlaygroundClient() {
  const [site, setSite] = useState<PlaygroundSite>(INITIAL_SITE)

  function patch(partial: Partial<PlaygroundSite>) {
    setSite(prev => ({ ...prev, ...partial }))
  }
  function patchStyle(key: string, value: unknown) {
    setSite(prev => ({
      ...prev,
      content: {
        ...prev.content,
        style: { ...(prev.content.style as Record<string, unknown> ?? {}), [key]: value },
      },
    }))
  }
  function patchContent(key: string, value: unknown) {
    setSite(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }))
  }
  function patchHero(key: string, value: string) {
    setSite(prev => ({
      ...prev,
      content: {
        ...prev.content,
        hero: { ...(prev.content.hero as Record<string, string> ?? {}), [key]: value },
      },
    }))
  }

  const style = (site.content.style as Record<string, unknown> | undefined) ?? {}
  const hero = (site.content.hero as Record<string, string> | undefined) ?? {}

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#eee" }}>
      <aside style={{ width: 360, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.1)", padding: 20, overflow: "auto", maxHeight: "100vh", position: "sticky", top: 0 }}>
        <h1 style={{ fontSize: 18, margin: "0 0 16px", fontWeight: 700 }}>🧪 Event Site Playground</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 24px", lineHeight: 1.5 }}>
          Page dev-only. Modifie le code dans src/components/event-site/** → HMR recharge.
        </p>

        <Section title="Template">
          <Chips options={TEMPLATES} value={site.template} onChange={v => patch({ template: v })} />
        </Section>

        <Section title="Palette">
          <Chips options={PALETTES} value={site.palette} onChange={v => patch({ palette: v })} />
        </Section>

        <Section title="Font titres">
          <Chips options={FONTS} value={site.fontHeading} onChange={v => patch({ fontHeading: v })} />
        </Section>

        <Section title="Font corps">
          <Chips options={FONTS} value={site.fontBody} onChange={v => patch({ fontBody: v })} />
        </Section>

        <Section title="Motif">
          <Chips options={PATTERNS} value={(style.pattern as string) ?? ""} onChange={v => patchStyle("pattern", v)} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={style.patternFullPage === true}
              onChange={e => patchStyle("patternFullPage", e.target.checked)}
            />
            Motif sur toute la page
          </label>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
              <span>Opacité du motif</span>
              <span style={{ fontFamily: "monospace" }}>
                {typeof style.patternOpacity === "number" ? `${Math.round((style.patternOpacity as number) * 100)}%` : "auto"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={typeof style.patternOpacity === "number" ? Math.round((style.patternOpacity as number) * 100) : 22}
              onChange={e => patchStyle("patternOpacity", Number(e.target.value) / 100)}
              style={{ width: "100%", accentColor: "#E11D48" }}
            />
            {typeof style.patternOpacity === "number" && (
              <button
                type="button"
                onClick={() => patchStyle("patternOpacity", undefined)}
                style={{
                  marginTop: 4,
                  padding: "3px 8px",
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                réinitialiser (auto)
              </button>
            )}
          </div>
        </Section>

        <Section title="Animation">
          <Chips options={INTENSITIES as unknown as string[]} value={(style.animationIntensity as string) ?? "normal"} onChange={v => patchStyle("animationIntensity", v)} />
        </Section>

        <Section title="Countdown">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={((site.content.countdown as { enabled?: boolean } | undefined)?.enabled) === true}
              onChange={e => {
                const cd = (site.content.countdown as Record<string, unknown> | undefined) ?? {}
                patchContent("countdown", { ...cd, enabled: e.target.checked })
              }}
            />
            Activer countdown
          </label>
          <Chips
            options={["grand", "minimal", "flip", "circle"]}
            value={((site.content.countdown as { variant?: string } | undefined)?.variant) ?? "grand"}
            onChange={v => {
              const cd = (site.content.countdown as Record<string, unknown> | undefined) ?? {}
              patchContent("countdown", { ...cd, variant: v })
            }}
          />
          <input
            type="datetime-local"
            value={(() => {
              const iso = (site.content.countdown as { targetDate?: string } | undefined)?.targetDate
              if (!iso) return ""
              const d = new Date(iso)
              if (isNaN(d.getTime())) return ""
              const pad = (n: number) => String(n).padStart(2, "0")
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
            })()}
            onChange={e => {
              const cd = (site.content.countdown as Record<string, unknown> | undefined) ?? {}
              const val = e.target.value
              patchContent("countdown", { ...cd, targetDate: val ? new Date(val).toISOString() : undefined })
            }}
            style={{ ...inputStyle, marginTop: 4 }}
          />
          <input
            type="text"
            placeholder="Label (ex: Jusqu'au grand jour)"
            value={((site.content.countdown as { label?: string } | undefined)?.label) ?? ""}
            onChange={e => {
              const cd = (site.content.countdown as Record<string, unknown> | undefined) ?? {}
              patchContent("countdown", { ...cd, label: e.target.value })
            }}
            style={inputStyle}
          />
        </Section>

        <Section title="Hero image (URL)">
          <input
            type="text"
            placeholder="https://..."
            value={site.heroImageUrl ?? ""}
            onChange={e => patch({ heroImageUrl: e.target.value || null })}
            style={inputStyle}
          />
        </Section>

        <Section title="Hero — Titre / Date / Lieu">
          <input style={inputStyle} placeholder="Titre" value={hero.title ?? ""} onChange={e => patchHero("title", e.target.value)} />
          <input style={inputStyle} placeholder="Sous-titre" value={hero.subtitle ?? ""} onChange={e => patchHero("subtitle", e.target.value)} />
          <input style={inputStyle} placeholder="Date" value={hero.date ?? ""} onChange={e => patchHero("date", e.target.value)} />
          <input style={inputStyle} placeholder="Lieu" value={hero.venue ?? ""} onChange={e => patchHero("venue", e.target.value)} />
        </Section>

        <Section title="Mot d'accueil">
          <textarea
            rows={4}
            value={(site.content.welcomeNote as string) ?? ""}
            onChange={e => patchContent("welcomeNote", e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Section>

        <Section title="Dress code">
          <input
            style={inputStyle}
            value={(site.content.dressCode as string) ?? ""}
            onChange={e => patchContent("dressCode", e.target.value)}
          />
        </Section>

        <Section title="Partager avec les invités (preview)">
          <ShareBlockPlayground slug={site.slug} title={hero.title ?? "notre événement"} />
        </Section>

        <div style={{ marginTop: 24, padding: 12, background: "rgba(59,130,246,0.1)", borderRadius: 8, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>
          💡 État en mémoire seulement — rien n'est sauvegardé. Rafraîchir la page = reset.
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", maxHeight: "100vh", position: "relative" }}>
        <EventSiteRenderer site={site} />
      </main>
    </div>
  )
}

function ShareBlockPlayground({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState(`/evt/${slug}`)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}/evt/${slug}`)
    }
  }, [slug])

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* denied */
    }
  }

  const whatsappMsg = encodeURIComponent(`Vous êtes invité·e à ${title} ! Toutes les infos + RSVP : ${fullUrl}`)
  const mailSubject = encodeURIComponent(`Invitation — ${title}`)
  const mailBody = encodeURIComponent(`Bonjour,\n\nVous êtes invité·e à ${title}.\n\nToutes les infos + RSVP : ${fullUrl}\n\nAu plaisir !`)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{
          flex: 1,
          padding: "7px 9px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.85)",
          fontSize: 10,
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{fullUrl}</div>
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "7px 10px",
            borderRadius: 6,
            border: "none",
            background: copied ? "#16a34a" : "#E11D48",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >{copied ? "✓" : "Copier"}</button>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener"
          style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "1px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.1)", color: "#25D366", fontSize: 10, fontWeight: 600, textAlign: "center", textDecoration: "none", fontFamily: "inherit" }}>
          WhatsApp
        </a>
        <a href={`mailto:?subject=${mailSubject}&body=${mailBody}`}
          style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 600, textAlign: "center", textDecoration: "none", fontFamily: "inherit" }}>
          Email
        </a>
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
        Lien public — aucun compte requis pour les invités.
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  )
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {options.map(o => {
        const active = value === o
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            style={{
              padding: "5px 9px",
              borderRadius: 6,
              border: active ? "1px solid #E11D48" : "1px solid rgba(255,255,255,0.15)",
              background: active ? "rgba(225,29,72,0.15)" : "transparent",
              color: active ? "#fff" : "rgba(255,255,255,0.7)",
              fontSize: 11,
              fontFamily: "inherit",
              cursor: "pointer",
              fontWeight: active ? 600 : 400,
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 7,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.03)",
  color: "#eee",
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
}
