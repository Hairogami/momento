"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PALETTES, FONTS, MOODS, type FontId } from "@/lib/eventSiteTokens"
import PatternPicker, { type PatternId } from "./PatternPicker"
import { compressImage } from "@/lib/imageCompress"
import { isAdminEmail } from "@/lib/adminConstants"

type Planner = {
  id: string
  title: string
  coupleNames: string
  weddingDate: string | Date | null
  location: string | null
  eventType: string | null
}

type EventSite = {
  id: string
  slug: string
  published: boolean
  template: string
  palette: string
  fontHeading: string
  fontBody: string
  heroImageUrl: string | null
  layoutVariant: string
  content: unknown
  photos: { id: string; url: string; caption: string | null }[]
}

type Tab = "content" | "style" | "photos"

const TEMPLATES = [
  { id: "mariage",      label: "Mariage",         emoji: "💍" },
  { id: "fete-famille", label: "Fête familiale",  emoji: "🎉" },
  { id: "corporate",    label: "Corporate",       emoji: "💼" },
  { id: "conference",   label: "Conférence",      emoji: "🎤" },
  { id: "generique",    label: "Générique",       emoji: "✨" },
]

export default function EventSiteEditor({ planner, eventSite }: { planner: Planner; eventSite: EventSite }) {
  const router = useRouter()
  const [site, setSite] = useState<EventSite>(eventSite)
  const [tab, setTab] = useState<Tab>("content")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [viewport, setViewport] = useState<"web" | "mobile">("web")

  // Sync state quand la prop change (router.refresh côté serveur)
  useEffect(() => { setSite(eventSite) }, [eventSite])

  const content = (site.content ?? {}) as Record<string, unknown>
  const hero = (content.hero as Record<string, string> | undefined) ?? {}

  async function patch(partial: Partial<EventSite>) {
    setSite(prev => ({ ...prev, ...partial }))
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSaveState("saving")
    try {
      const r = await fetch(`/api/event-site/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setPreviewKey(k => k + 1)
      setSaveState("saved")
      savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2000)
    } catch {
      setSaveState("error")
    }
  }

  async function updateContent(path: string, value: unknown) {
    const next = { ...content }
    // Path simple : "hero.title" → next.hero.title = value
    const parts = path.split(".")
    let cursor: Record<string, unknown> = next
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i]!
      if (typeof cursor[k] !== "object" || cursor[k] === null) cursor[k] = {}
      cursor = cursor[k] as Record<string, unknown>
    }
    cursor[parts[parts.length - 1]!] = value
    patch({ content: next } as Partial<EventSite>)
  }

  async function togglePublish() {
    setPublishing(true)
    try {
      const r = await fetch(`/api/event-site/${site.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !site.published }),
      })
      if (r.ok) {
        const data = await r.json()
        setSite(prev => ({ ...prev, published: data.published }))
      } else {
        const { error } = await r.json().catch(() => ({ error: "Erreur" }))
        alert(error ?? "Impossible de changer le statut")
      }
    } finally {
      setPublishing(false)
    }
  }

  const publicUrl = `/evt/${site.slug}`

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "420px 1fr",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: "var(--dash-bg,#f7f7fb)",
    }}>
      {/* ── Panel gauche : contrôles ── */}
      <aside style={{
        background: "var(--dash-surface,#fff)",
        borderRight: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
        <header style={{ padding: "18px 20px", borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.15))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Link href="/dashboard/event-site" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", textDecoration: "none" }}>← Tous mes sites</Link>
            {saveState === "saving" && (
              <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Sauvegarde…</span>
            )}
            {saveState === "saved" && (
              <span style={{ fontSize: 11, color: "#16a34a" }}>✓ Enregistré</span>
            )}
            {saveState === "error" && (
              <span style={{ fontSize: 11, color: "#dc2626" }}>⚠ Erreur de sauvegarde</span>
            )}
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
            Site événement
          </h1>
          <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: "3px 0 12px" }}>
            {site.published ? (
              <>🟢 Publié · <a href={publicUrl} target="_blank" rel="noopener" style={{ color: "var(--g1,#E11D48)" }}>{publicUrl}</a></>
            ) : (
              <>🔒 Brouillon · non publié</>
            )}
          </p>
          <button
            onClick={togglePublish}
            disabled={publishing}
            style={{
              width: "100%",
              padding: "9px", borderRadius: 10, border: "none",
              background: site.published
                ? "var(--dash-faint-2,rgba(183,191,217,0.15))"
                : "linear-gradient(135deg,#E11D48,#9333EA)",
              color: site.published ? "var(--dash-text,#121317)" : "#fff",
              fontSize: 13, fontWeight: 600, cursor: publishing ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {publishing ? "…" : site.published ? "Retirer de la publication" : "Publier le site"}
          </button>

          {site.published && (
            <ShareBlock publicUrl={publicUrl} eventTitle={(hero.title as string) ?? "notre événement"} />
          )}
        </header>

        {/* Tabs */}
        <nav style={{ display: "flex", padding: "12px 12px 0", gap: 4, borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.15))" }}>
          {(["content", "style", "photos"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "9px 8px", borderRadius: "9px 9px 0 0", border: "none",
                background: tab === t ? "var(--dash-faint,rgba(183,191,217,0.08))" : "transparent",
                color: tab === t ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)",
                fontSize: 12, fontWeight: tab === t ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
                borderBottom: tab === t ? "2px solid var(--g1,#E11D48)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t === "content" ? "📝 Contenu" : t === "style" ? "🎨 Style" : "🖼️ Photos"}
            </button>
          ))}
        </nav>

        <div style={{ padding: "20px", flex: 1 }}>
          {tab === "content" && (
            <ContentTab content={content} hero={hero} template={site.template} onUpdate={updateContent} />
          )}
          {tab === "style" && (
            <StyleTab site={site} onPatch={patch} onUpdateContent={updateContent} content={content} />
          )}
          {tab === "photos" && (
            <PhotosTab site={site} onPatch={patch} onReload={() => router.refresh()} />
          )}
        </div>
      </aside>

      {/* ── Panel droit : preview live ── */}
      <section style={{ position: "relative", background: "var(--dash-bg,#f7f7fb)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 10,
          display: "flex", gap: 8, alignItems: "center",
        }}>
          <div style={{
            padding: "6px 12px", borderRadius: 99, background: "rgba(0,0,0,0.7)",
            color: "#fff", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Aperçu live</div>
          <div style={{
            display: "flex", gap: 2, padding: 3, borderRadius: 99,
            background: "rgba(0,0,0,0.7)",
          }}>
            <button
              type="button"
              onClick={() => setViewport("web")}
              aria-label="Vue ordinateur"
              title="Vue ordinateur"
              style={viewportBtnStyle(viewport === "web")}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="4" width="20" height="13" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-label="Vue mobile"
              title="Vue mobile"
              style={viewportBtnStyle(viewport === "mobile")}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={{
            width: viewport === "mobile" ? 390 : "100%",
            maxWidth: viewport === "mobile" ? 390 : "100%",
            height: viewport === "mobile" ? "min(844px, calc(100vh - 80px))" : "100%",
            background: "#000",
            borderRadius: viewport === "mobile" ? 28 : 0,
            overflow: "hidden",
            boxShadow: viewport === "mobile" ? "0 30px 60px rgba(0,0,0,0.25)" : "none",
            transition: "all 250ms ease",
            border: viewport === "mobile" ? "8px solid #111" : "none",
          }}
        >
          <iframe
            key={previewKey}
            src={`/evt/preview/${site.id}`}
            style={{ width: "100%", height: "100%", border: 0, background: "var(--dash-bg,#f7f7fb)" }}
            title="Preview site événement"
          />
        </div>
      </section>
    </div>
  )
}

function ContentTab({
  content, hero, template, onUpdate,
}: {
  content: Record<string, unknown>
  hero: Record<string, string>
  template: string
  onUpdate: (path: string, value: unknown) => void
}) {
  const main = (content.mainEvent as Record<string, string> | undefined) ?? {}
  const rsvp = (content.rsvp as Record<string, string | boolean> | undefined) ?? {}
  const visibility = (content.visibility as Record<string, boolean> | undefined) ?? {}
  const isVisible = (key: string) => visibility[key] !== false
  const toggleVisible = (key: string) => onUpdate(`visibility.${key}`, !isVisible(key))
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <FieldGroup label="Le titre principal">
        <Input value={hero.title ?? ""} onChange={v => onUpdate("hero.title", v)} placeholder="Ex: Yousra & Ali" />
      </FieldGroup>

      <FieldGroup label="Date de l'événement (affichée)" visible={isVisible("heroDate")} onToggleVisible={() => toggleVisible("heroDate")}>
        <Input value={hero.date ?? ""} onChange={v => onUpdate("hero.date", v)} placeholder="Ex: 04 avril 2026" />
      </FieldGroup>

      <FieldGroup label="Lieu principal (nom visible)" visible={isVisible("heroVenue")} onToggleVisible={() => toggleVisible("heroVenue")}>
        <Input value={hero.venue ?? ""} onChange={v => onUpdate("hero.venue", v)} placeholder="Ex: Domaine Terracotta" />
      </FieldGroup>

      <FieldGroup label="Localisation" collapsible>
        <LocationField
          current={(main.location as string) ?? ""}
          resolved={(main as Record<string, unknown>).locationResolved as { lat: number; lng: number; displayName?: string } | undefined}
          onResolved={r => {
            onUpdate("mainEvent.location", r.input)
            onUpdate("mainEvent.locationResolved", r.resolved)
            onUpdate("mainEvent.mapsUrl", r.mapsUrl)
            onUpdate("mainEvent.wazeUrl", r.wazeUrl)
          }}
          onClear={() => {
            onUpdate("mainEvent.location", "")
            onUpdate("mainEvent.locationResolved", null)
            onUpdate("mainEvent.mapsUrl", "")
            onUpdate("mainEvent.wazeUrl", "")
          }}
        />
        <div style={{ padding: "10px 12px", background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 9, fontSize: 11, color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.5, marginTop: 10 }}>
          🔒 L&apos;adresse exacte n&apos;est jamais affichée en toutes lettres aux invités. Ils voient une carte + boutons Google Maps / Waze.
        </div>
      </FieldGroup>

      <FieldGroup label="Compte à rebours (facultatif)" visible={isVisible("countdown")} onToggleVisible={() => toggleVisible("countdown")} collapsible>
        <CountdownEditor
          countdown={(content.countdown as CountdownState | undefined) ?? {}}
          onChange={next => onUpdate("countdown", next)}
        />
      </FieldGroup>

      <FieldGroup label="Un mot à vos invités (facultatif)" visible={isVisible("welcomeNote")} onToggleVisible={() => toggleVisible("welcomeNote")} collapsible>
        <Textarea value={(content.welcomeNote as string) ?? ""} onChange={v => onUpdate("welcomeNote", v)} placeholder="Ex: Nous sommes ravis de vous convier à la célébration de notre union…" rows={3} />
      </FieldGroup>

      <FieldGroup label="Programme (facultatif)" visible={isVisible("program")} onToggleVisible={() => toggleVisible("program")} collapsible>
        <ProgramEditor
          steps={(content.program as ProgramStepData[] | undefined) ?? []}
          onChange={next => onUpdate("program", next)}
        />
      </FieldGroup>

      {template === "mariage" && (
        <FieldGroup label="Dress code (facultatif)" visible={isVisible("dressCode")} onToggleVisible={() => toggleVisible("dressCode")}>
          <Input value={(content.dressCode as string) ?? ""} onChange={v => onUpdate("dressCode", v)} placeholder="Ex: tenue de cocktail, couleurs claires" />
        </FieldGroup>
      )}

      <FieldGroup label="Date limite RSVP (facultatif)" visible={isVisible("rsvp")} onToggleVisible={() => toggleVisible("rsvp")}>
        <Input value={(rsvp.deadline as string) ?? ""} onChange={v => onUpdate("rsvp.deadline", v)} placeholder="Ex: 15 février 2026" />
      </FieldGroup>

      {template === "mariage" && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dash-text,#121317)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={rsvp.allowPlusOne !== false}
            onChange={e => onUpdate("rsvp.allowPlusOne", e.target.checked)}
          />
          <span>Autoriser les invités à amener un +1</span>
        </label>
      )}
    </div>
  )
}

type CountdownState = {
  enabled?: boolean
  targetDate?: string
  variant?: "grand" | "minimal" | "flip" | "circle"
  label?: string
}

function CountdownEditor({
  countdown, onChange,
}: {
  countdown: CountdownState
  onChange: (next: CountdownState) => void
}) {
  const variants: { id: NonNullable<CountdownState["variant"]>; label: string }[] = [
    { id: "grand", label: "Grand" },
    { id: "minimal", label: "Minimal" },
    { id: "flip", label: "Flip digital" },
    { id: "circle", label: "Cercle" },
  ]
  // Conversion datetime-local (YYYY-MM-DDTHH:mm) pour l'input
  const inputValue = countdown.targetDate
    ? (() => {
        const d = new Date(countdown.targetDate)
        if (isNaN(d.getTime())) return ""
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      })()
    : ""

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dash-text,#121317)", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={countdown.enabled === true}
          onChange={e => onChange({ ...countdown, enabled: e.target.checked })}
        />
        <span>Activer le compte à rebours</span>
      </label>

      {countdown.enabled && (
        <>
          <div>
            <div style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Date & heure cible</div>
            <input
              type="datetime-local"
              value={inputValue}
              onChange={e => {
                const val = e.target.value
                if (!val) return onChange({ ...countdown, targetDate: undefined })
                onChange({ ...countdown, targetDate: new Date(val).toISOString() })
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 9,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                background: "var(--dash-surface,#fff)",
                color: "var(--dash-text,#121317)",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Style</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {variants.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChange({ ...countdown, variant: v.id })}
                  style={chipStyle((countdown.variant ?? "grand") === v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            value={countdown.label ?? ""}
            onChange={v => onChange({ ...countdown, label: v })}
            placeholder="Label (facultatif) — Ex: Jusqu'au grand jour"
          />
        </>
      )}
    </div>
  )
}

type ProgramStepData = {
  id?: string
  time: string
  label: string
  venueName?: string | null
  description?: string | null
}

function ProgramEditor({
  steps, onChange,
}: {
  steps: ProgramStepData[]
  onChange: (next: ProgramStepData[]) => void
}) {
  function update(idx: number, partial: Partial<ProgramStepData>) {
    const next = steps.map((s, i) => (i === idx ? { ...s, ...partial } : s))
    onChange(next)
  }
  function remove(idx: number) {
    onChange(steps.filter((_, i) => i !== idx))
  }
  function add() {
    const id = (globalThis.crypto?.randomUUID?.() ?? `step-${Date.now()}`)
    onChange([...steps, { id, time: "", label: "" }])
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    const [moved] = next.splice(idx, 1)
    next.splice(target, 0, moved!)
    onChange(next)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", padding: "8px 2px" }}>
          Aucune étape pour l&apos;instant. Ajoutez la première ci-dessous.
        </div>
      )}

      {steps.map((step, idx) => (
        <div
          key={step.id ?? idx}
          style={{
            border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
            borderRadius: 10,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--dash-surface,rgba(255,255,255,0.02))",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 88 }}>
              <Input
                value={step.time}
                onChange={v => update(idx, { time: v })}
                placeholder="17h00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                value={step.label}
                onChange={v => update(idx, { label: v })}
                placeholder="Cérémonie"
              />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                aria-label="Monter"
                style={miniBtn(idx === 0)}
              >↑</button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === steps.length - 1}
                aria-label="Descendre"
                style={miniBtn(idx === steps.length - 1)}
              >↓</button>
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Supprimer"
                style={{ ...miniBtn(false), color: "#dc2626" }}
              >✕</button>
            </div>
          </div>
          <Input
            value={step.venueName ?? ""}
            onChange={v => update(idx, { venueName: v || null })}
            placeholder="Lieu (facultatif) — Ex: Mosquée Hassan II"
          />
          <Textarea
            value={step.description ?? ""}
            onChange={v => update(idx, { description: v || null })}
            placeholder="Description (facultative)"
            rows={2}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        style={{
          padding: "8px 12px",
          border: "1px dashed var(--dash-border,rgba(183,191,217,0.35))",
          borderRadius: 9,
          background: "transparent",
          color: "var(--dash-text,#121317)",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        + Ajouter une étape
      </button>
    </div>
  )
}

function miniBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 7,
    border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
    background: "transparent",
    color: "var(--dash-text,#121317)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontSize: 13,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }
}

/**
 * Section Template (W2.4) :
 * - Admin (moumene486) → picker complet visible (escape pour tester tous les templates)
 * - User normal → read-only badge "Template : X (lié au type d'événement)"
 *   Le template est dérivé du eventType côté serveur, le user ne peut pas le changer.
 */
function TemplateSection({ site, onPatch }: { site: EventSite; onPatch: (p: Partial<EventSite>) => void }) {
  const { data: session } = useSession()
  const isAdmin = isAdminEmail(session?.user?.email)
  const currentLabel = TEMPLATES.find(t => t.id === site.template)?.label ?? site.template

  if (isAdmin) {
    return (
      <FieldGroup label="Template (admin)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onPatch({ template: t.id })} style={chipStyle(site.template === t.id)}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </FieldGroup>
    )
  }
  return (
    <FieldGroup label="Template">
      <div style={{
        padding: "10px 12px", borderRadius: 9,
        border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
        background: "var(--dash-faint,rgba(183,191,217,0.05))",
        fontSize: 13, color: "var(--dash-text,#121317)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      }}>
        <span>{TEMPLATES.find(t => t.id === site.template)?.emoji ?? "✨"} {currentLabel}</span>
        <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>lié au type d&apos;événement</span>
      </div>
    </FieldGroup>
  )
}

function StyleTab({ site, onPatch, onUpdateContent, content }: {
  site: EventSite
  onPatch: (p: Partial<EventSite>) => void
  onUpdateContent: (path: string, value: unknown) => void
  content: Record<string, unknown>
}) {
  const style = (content.style as { pattern?: string } | undefined) ?? {}
  const currentPalette = PALETTES.find(p => p.id === site.palette)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <TemplateSection site={site} onPatch={onPatch} />

      <FieldGroup label="Palette de couleurs" collapsible>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {PALETTES.map(p => {
            const isActive = site.palette === p.id && !((style as { customColors?: unknown }).customColors)
            return (
              <button
                key={p.id}
                onClick={() => {
                  // Désactive custom colors si active, puis applique la palette
                  if ((style as { customColors?: unknown }).customColors) {
                    onUpdateContent("style.customColors", null)
                  }
                  onPatch({ palette: p.id })
                }}
                style={{
                  ...chipStyle(isActive),
                  justifyContent: "space-between",
                  paddingRight: 10,
                }}
              >
                <span>{p.label}</span>
                <span style={{ display: "flex", gap: 3 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.main }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.accent }} />
                </span>
              </button>
            )
          })}

          <CustomPaletteButton
            active={Boolean((style as { customColors?: unknown }).customColors)}
            mainValue={(style as { customColors?: { main?: string } }).customColors?.main ?? currentPalette?.main ?? "#C1713A"}
            accentValue={(style as { customColors?: { accent?: string } }).customColors?.accent ?? currentPalette?.accent ?? "#8B4513"}
            onActivate={() => {
              // Active le mode custom en seed avec la palette actuelle (batch en 1 seul patch — évite race condition)
              onUpdateContent("style.customColors", {
                main: currentPalette?.main ?? "#C1713A",
                accent: currentPalette?.accent ?? "#8B4513",
              })
            }}
            onChangeColor={(field, value) => onUpdateContent(`style.customColors.${field}`, value)}
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Police des titres" collapsible>
        <FontSelector
          current={site.fontHeading}
          onChange={v => onPatch({ fontHeading: v })}
          preview="Yousra & Ali"
        />
      </FieldGroup>

      <FieldGroup label="Police du corps de texte" collapsible>
        <FontSelector
          current={site.fontBody}
          onChange={v => onPatch({ fontBody: v })}
          preview="Nous sommes ravis de vous convier"
        />
      </FieldGroup>

      <FieldGroup label="Motif décoratif" collapsible>
        <PatternPicker
          current={style.pattern as PatternId | undefined}
          onPick={id => onUpdateContent("style.pattern", id)}
          accent={currentPalette?.main}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dash-text,#121317)", cursor: "pointer", marginTop: 10 }}>
          <input
            type="checkbox"
            checked={(style as { patternFullPage?: boolean }).patternFullPage === true}
            onChange={e => onUpdateContent("style.patternFullPage", e.target.checked)}
          />
          <span>Appliquer le motif sur toute la page</span>
        </label>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dash-text-2,#6a6a71)", marginBottom: 6 }}>
            <span>Opacité du motif</span>
            <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
              {typeof (style as { patternOpacity?: number }).patternOpacity === "number"
                ? `${Math.round(((style as { patternOpacity?: number }).patternOpacity as number) * 100)}%`
                : "auto"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={typeof (style as { patternOpacity?: number }).patternOpacity === "number"
              ? Math.round(((style as { patternOpacity?: number }).patternOpacity as number) * 100)
              : 22}
            onChange={e => onUpdateContent("style.patternOpacity", Number(e.target.value) / 100)}
            style={{ width: "100%", accentColor: currentPalette?.main ?? "#E11D48" }}
          />
          {typeof (style as { patternOpacity?: number }).patternOpacity === "number" && (
            <button
              type="button"
              onClick={() => onUpdateContent("style.patternOpacity", null)}
              style={{
                marginTop: 4,
                padding: "4px 9px",
                borderRadius: 6,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                background: "transparent",
                color: "var(--dash-text-2,#6a6a71)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              réinitialiser (auto)
            </button>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label="Animations">
        <AnimationIntensityPicker
          current={((style as { animationIntensity?: string }).animationIntensity as "none" | "subtle" | "normal" | "festive" | undefined) ?? "none"}
          onChange={v => onUpdateContent("style.animationIntensity", v)}
          accent={currentPalette?.main}
        />
      </FieldGroup>
    </div>
  )
}

function CustomPaletteButton({
  active, mainValue, accentValue, onActivate, onChangeColor,
}: {
  active: boolean
  mainValue: string
  accentValue: string
  onActivate: () => void
  onChangeColor: (field: "main" | "accent", value: string) => void
}) {
  // State local pour les couleurs — PATCH débouncé pour éviter 60 req/s lors du drag
  const [localMain, setLocalMain] = useState(mainValue)
  const [localAccent, setLocalAccent] = useState(accentValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync si la prop externe change (switch de palette, etc.)
  useEffect(() => { setLocalMain(mainValue) }, [mainValue])
  useEffect(() => { setLocalAccent(accentValue) }, [accentValue])

  function scheduleSave(field: "main" | "accent", value: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { onChangeColor(field, value) }, 350)
  }

  return (
    <div
      onClick={() => { if (!active) onActivate() }}
      style={{
        ...chipStyle(active),
        justifyContent: "space-between",
        paddingRight: 8,
        cursor: active ? "default" : "pointer",
      }}
    >
      <span>Personnalisé</span>
      <span style={{ display: "flex", gap: 4, position: "relative" }}>
        <label style={{
          width: 14, height: 14, borderRadius: "50%", background: localMain,
          cursor: "pointer", display: "inline-block",
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          <input
            type="color"
            value={localMain}
            onChange={e => { setLocalMain(e.target.value); scheduleSave("main", e.target.value) }}
            onClick={e => { e.stopPropagation(); if (!active) onActivate() }}
            style={{ opacity: 0, width: 1, height: 1, position: "absolute" }}
            tabIndex={-1}
          />
        </label>
        <label style={{
          width: 14, height: 14, borderRadius: "50%", background: localAccent,
          cursor: "pointer", display: "inline-block",
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          <input
            type="color"
            value={localAccent}
            onChange={e => { setLocalAccent(e.target.value); scheduleSave("accent", e.target.value) }}
            onClick={e => { e.stopPropagation(); if (!active) onActivate() }}
            style={{ opacity: 0, width: 1, height: 1, position: "absolute" }}
            tabIndex={-1}
          />
        </label>
      </span>
    </div>
  )
}

function PhotosTab({ site, onPatch, onReload }: { site: EventSite; onPatch: (p: Partial<EventSite>) => void; onReload: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)

  const GALLERY_MAX = 20
  const photos = site.photos ?? []
  const remaining = GALLERY_MAX - photos.length

  async function uploadHero(raw: File) {
    setUploading(true)
    try {
      // Compression client-side : 1920px max, WebP 82% qualité
      // Photo iPhone 5 MB → ~250 KB sans perte visible
      const file = await compressImage(raw).catch(() => raw)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("kind", "hero")
      const r = await fetch(`/api/event-site/${site.id}/photos`, {
        method: "POST",
        body: formData,
      })
      const data = await r.json().catch(() => ({ error: "Réponse serveur invalide." }))
      if (r.ok) {
        onPatch({ heroImageUrl: data.url })
      } else {
        alert(data.error ?? `Upload échoué (HTTP ${r.status})`)
      }
    } catch (e) {
      alert(`Upload échoué : ${e instanceof Error ? e.message : "erreur réseau"}`)
    } finally {
      setUploading(false)
    }
  }

  async function uploadGallery(files: FileList) {
    if (files.length === 0) return
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length < files.length) {
      setGalleryError(`Limite de ${GALLERY_MAX} photos atteinte — ${files.length - toUpload.length} fichier(s) ignoré(s).`)
    } else {
      setGalleryError(null)
    }

    setGalleryUploading(true)
    try {
      for (const raw of toUpload) {
        const file = await compressImage(raw).catch(() => raw)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("kind", "gallery")
        const r = await fetch(`/api/event-site/${site.id}/photos`, {
          method: "POST",
          body: formData,
        })
        if (!r.ok) {
          const data = await r.json().catch(() => ({ error: "Upload échoué." }))
          setGalleryError(data.error ?? `Upload échoué (HTTP ${r.status})`)
          break
        }
      }
      onReload()
    } catch (e) {
      setGalleryError(`Upload échoué : ${e instanceof Error ? e.message : "erreur réseau"}`)
    } finally {
      setGalleryUploading(false)
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Supprimer cette photo ?")) return
    try {
      const r = await fetch(`/api/event-site/${site.id}/photos/${photoId}`, {
        method: "DELETE",
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({ error: "Suppression échouée." }))
        setGalleryError(data.error ?? `Suppression échouée (HTTP ${r.status})`)
        return
      }
      onReload()
    } catch (e) {
      setGalleryError(`Suppression échouée : ${e instanceof Error ? e.message : "erreur réseau"}`)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <FieldGroup label="Photo hero (fond principal)">
        {site.heroImageUrl ? (
          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.heroImageUrl} alt="" style={{ width: "100%", borderRadius: 10, display: "block" }} />
            <button
              onClick={() => onPatch({ heroImageUrl: null })}
              style={{
                position: "absolute", top: 8, right: 8,
                padding: "5px 10px", background: "rgba(0,0,0,0.7)", color: "#fff",
                borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
              }}
            >Retirer</button>
          </div>
        ) : (
          <label style={{
            display: "block", padding: "32px 16px", borderRadius: 10,
            border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))",
            textAlign: "center", cursor: "pointer", background: "var(--dash-faint,rgba(183,191,217,0.04))",
          }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadHero(f) }}
            />
            <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>
              {uploading ? "Upload en cours…" : "Cliquez pour uploader"}
            </div>
            <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 3 }}>JPG, PNG, WebP · 5MB max</div>
          </label>
        )}
      </FieldGroup>

      <div style={{ padding: "12px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 9, fontSize: 11, color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.55 }}>
        💡 Pas de photo ? Pas de problème — un fond unique est généré automatiquement pour votre site, basé sur votre mood et palette.
      </div>

      <FieldGroup label={`Galerie photos (${photos.length}/${GALLERY_MAX})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {photos.map(p => (
                <div key={p.id} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", background: "var(--dash-faint,rgba(183,191,217,0.05))" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button
                    type="button"
                    onClick={() => deletePhoto(p.id)}
                    aria-label="Supprimer"
                    style={{
                      position: "absolute", top: 4, right: 4,
                      width: 24, height: 24, borderRadius: "50%",
                      background: "rgba(0,0,0,0.75)", color: "#fff",
                      border: "none", cursor: "pointer", fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {remaining > 0 ? (
            <label style={{
              display: "block", padding: "18px 16px", borderRadius: 10,
              border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))",
              textAlign: "center", cursor: galleryUploading ? "wait" : "pointer",
              background: "var(--dash-faint,rgba(183,191,217,0.04))",
              opacity: galleryUploading ? 0.6 : 1,
            }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                disabled={galleryUploading}
                onChange={e => { if (e.target.files) uploadGallery(e.target.files); e.target.value = "" }}
              />
              <div style={{ fontSize: 18, marginBottom: 4 }}>🖼️</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>
                {galleryUploading ? "Upload en cours…" : `Ajouter des photos (jusqu'à ${remaining} restante${remaining > 1 ? "s" : ""})`}
              </div>
              <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 3 }}>JPG, PNG, WebP · 5MB max chacune · multi-sélection</div>
            </label>
          ) : (
            <div style={{ padding: "12px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 9, fontSize: 12, color: "var(--dash-text-2,#6a6a71)", textAlign: "center" }}>
              Limite atteinte ({GALLERY_MAX} photos max). Supprimez-en pour en ajouter d&apos;autres.
            </div>
          )}

          {galleryError && (
            <div style={{ padding: "10px 12px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 9, fontSize: 12, color: "#dc2626" }}>
              {galleryError}
            </div>
          )}
        </div>
      </FieldGroup>
    </div>
  )
}

function ShareBlock({ publicUrl, eventTitle }: { publicUrl: string; eventTitle: string }) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState<string>(publicUrl)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}${publicUrl}`)
    }
  }, [publicUrl])

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard denied */
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Vous êtes invité·e à ${eventTitle} ! Toutes les infos + RSVP : ${fullUrl}`,
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`
  const mailSubject = encodeURIComponent(`Invitation — ${eventTitle}`)
  const mailBody = encodeURIComponent(
    `Bonjour,\n\nVous êtes invité·e à ${eventTitle}.\n\nToutes les infos + RSVP : ${fullUrl}\n\nAu plaisir de vous voir !`,
  )
  const mailUrl = `mailto:?subject=${mailSubject}&body=${mailBody}`

  return (
    <div style={{
      marginTop: 12, padding: 12,
      borderRadius: 10,
      border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
      background: "var(--dash-surface,rgba(255,255,255,0.02))",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-text-2,#6a6a71)" }}>
        Partager avec les invités
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <div style={{
          flex: 1,
          padding: "8px 10px",
          borderRadius: 7,
          border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
          background: "var(--dash-surface,#fff)",
          color: "var(--dash-text,#121317)",
          fontSize: 11,
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {fullUrl}
        </div>
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "8px 12px",
            borderRadius: 7,
            border: "none",
            background: copied ? "#16a34a" : "linear-gradient(135deg,#E11D48,#9333EA)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Copié" : "Copier"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          style={{
            flex: 1,
            padding: "9px 10px",
            borderRadius: 7,
            border: "1px solid rgba(37,211,102,0.4)",
            background: "rgba(37,211,102,0.08)",
            color: "#25D366",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          WhatsApp
        </a>
        <a
          href={mailUrl}
          style={{
            flex: 1,
            padding: "9px 10px",
            borderRadius: 7,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-surface,#fff)",
            color: "var(--dash-text,#121317)",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          Email
        </a>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener"
          style={{
            flex: 1,
            padding: "9px 10px",
            borderRadius: 7,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-surface,#fff)",
            color: "var(--dash-text,#121317)",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          Ouvrir
        </a>
      </div>

      <div style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", lineHeight: 1.5 }}>
        Lien public — pas besoin de compte pour consulter ou RSVP.
      </div>
    </div>
  )
}

function AnimationIntensityPicker({
  current, onChange, accent = "#8B3A3A",
}: {
  current: "none" | "subtle" | "normal" | "festive"
  onChange: (v: "none" | "subtle" | "normal" | "festive") => void
  accent?: string
}) {
  const options: { id: "none" | "subtle" | "normal" | "festive"; label: string; hint: string }[] = [
    { id: "none", label: "Aucune", hint: "Pas d'animation — site statique" },
    { id: "subtle", label: "Subtil", hint: "Discret — seulement hero" },
    { id: "normal", label: "Normal", hint: "Équilibré (recommandé)" },
    { id: "festive", label: "Festif", hint: "Max visuel — partout" },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-surface,#fff)" }}>
        {options.map(o => {
          const active = current === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 7,
                border: "none",
                background: active ? `color-mix(in srgb, ${accent} 16%, transparent)` : "transparent",
                color: active ? "var(--dash-text,#121317)" : "var(--dash-text-2,#6a6a71)",
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 120ms ease",
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>
        {options.find(o => o.id === current)?.hint}
      </div>
    </div>
  )
}

function FontSelector({ current, onChange, preview }: { current: string; onChange: (v: string) => void; preview: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(Object.keys(FONTS) as FontId[]).map(id => {
        const f = FONTS[id]
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              ...chipStyle(current === id),
              justifyContent: "space-between",
              padding: "10px 14px",
              fontFamily: f.stack,
            }}
          >
            <span style={{ fontSize: 15 }}>{preview}</span>
            <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function FieldGroup({
  label, children, visible, onToggleVisible, collapsible = false, defaultCollapsed = true,
}: {
  label: string
  children: React.ReactNode
  /** Si défini, active l'œil de visibilité — la section peut être masquée sur le site rendu. */
  visible?: boolean
  onToggleVisible?: () => void
  /** Si true, la section est repliable. Header click → toggle. */
  collapsible?: boolean
  /** Quand collapsible=true : repliée par défaut au premier mount. */
  defaultCollapsed?: boolean
}) {
  const isHideable = typeof visible === "boolean" && typeof onToggleVisible === "function"
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, opacity: isHideable && !visible ? 0.5 : 1 }}>
      <div
        onClick={collapsible ? () => setCollapsed(c => !c) : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: collapsible ? "pointer" : "default",
          userSelect: collapsible ? "none" : "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {collapsible && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                fontSize: 9,
                color: "var(--dash-text-3,#9a9aaa)",
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 150ms ease",
              }}
            >▼</span>
          )}
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-2,#6a6a71)", letterSpacing: "0.05em", textTransform: "uppercase", cursor: collapsible ? "pointer" : "default" }}>{label}</label>
        </div>
        {isHideable && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggleVisible?.() }}
            title={visible ? "Masquer cette section sur le site" : "Afficher cette section sur le site"}
            aria-label={visible ? "Masquer" : "Afficher"}
            style={{
              padding: "4px 7px",
              borderRadius: 6,
              border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
              background: "transparent",
              color: visible ? "var(--dash-text,#121317)" : "var(--dash-text-3,#9a9aaa)",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
              {!visible && <line x1="3" y1="3" x2="21" y2="21" />}
            </svg>
          </button>
        )}
      </div>
      {!collapsed && children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function emit(v: string) {
    setLocal(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), 400)
  }
  return (
    <input
      type="text"
      value={local}
      onChange={e => emit(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "10px 12px", borderRadius: 9,
        border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
        background: "var(--dash-surface,#fff)",
        color: "var(--dash-text,#121317)",
        fontSize: 13, fontFamily: "inherit", outline: "none",
      }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function emit(v: string) {
    setLocal(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), 400)
  }
  return (
    <textarea
      value={local}
      onChange={e => emit(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        padding: "10px 12px", borderRadius: 9,
        border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
        background: "var(--dash-surface,#fff)",
        color: "var(--dash-text,#121317)",
        fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical",
      }}
    />
  )
}

function LocationField({
  current, resolved, onResolved, onClear,
}: {
  current: string
  resolved: { lat: number; lng: number; displayName?: string } | undefined
  onResolved: (r: {
    input: string
    resolved: { lat: number; lng: number; displayName?: string }
    mapsUrl: string
    wazeUrl: string
  }) => void
  onClear: () => void
}) {
  const [input, setInput] = useState(current)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setInput(current) }, [current])

  async function resolve() {
    const q = input.trim()
    if (!q) { setError("Entrez une adresse, un lien ou des coordonnées."); return }
    setLoading(true); setError(null)
    try {
      const r = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: q }),
      })
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: "Impossible de localiser." }))
        setError(error ?? "Impossible de localiser.")
        return
      }
      const data = await r.json() as {
        lat: number; lng: number; displayName: string; mapsUrl: string; wazeUrl: string
      }
      onResolved({
        input: q,
        resolved: { lat: data.lat, lng: data.lng, displayName: data.displayName },
        mapsUrl: data.mapsUrl,
        wazeUrl: data.wazeUrl,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FieldGroup label="📍 Localisation (n'importe quel format)">
      <div style={{ display: "flex", gap: 6 }}>
        <Input
          value={input}
          onChange={v => { setInput(v); if (error) setError(null) }}
          placeholder="Adresse, lien Maps/Waze, coordonnées 33.57,-7.58…"
        />
        <button
          onClick={resolve}
          disabled={loading || !input.trim()}
          style={{
            flexShrink: 0,
            padding: "0 14px", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff",
            fontSize: 12, fontWeight: 600, cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap", fontFamily: "inherit",
            opacity: (loading || !input.trim()) ? 0.6 : 1,
          }}
        >
          {loading ? "…" : "Trouver"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#dc2626" }}>{error}</div>
      )}

      {resolved && (
        <div style={{
          marginTop: 10, padding: "10px 12px", borderRadius: 10,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600, marginBottom: 2 }}>
              ✓ Localisé · {resolved.lat.toFixed(4)}, {resolved.lng.toFixed(4)}
            </div>
            <div style={{
              fontSize: 11, color: "var(--dash-text-2,#6a6a71)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {resolved.displayName ?? ""}
            </div>
          </div>
          <button
            onClick={onClear}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 16, color: "var(--dash-text-3,#9a9aaa)", padding: 2,
            }}
            aria-label="Retirer la localisation"
            title="Retirer"
          >
            ✕
          </button>
        </div>
      )}
    </FieldGroup>
  )
}

function viewportBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 24,
    padding: 0,
    borderRadius: 99,
    border: "none",
    background: active ? "rgba(255,255,255,0.95)" : "transparent",
    color: active ? "#111" : "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 120ms ease",
  }
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 12px", borderRadius: 9,
    border: active ? "1.5px solid var(--g1,#E11D48)" : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
    background: active ? "rgba(225,29,72,0.06)" : "var(--dash-surface,#fff)",
    color: "var(--dash-text,#121317)",
    fontSize: 13, fontWeight: active ? 600 : 500,
    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  }
}
