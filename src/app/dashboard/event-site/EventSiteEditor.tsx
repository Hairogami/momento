"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PALETTES, FONTS, MOODS, type FontId } from "@/lib/eventSiteTokens"

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
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  // Sync state quand la prop change (router.refresh côté serveur)
  useEffect(() => { setSite(eventSite) }, [eventSite])

  const content = (site.content ?? {}) as Record<string, unknown>
  const hero = (content.hero as Record<string, string> | undefined) ?? {}

  async function patch(partial: Partial<EventSite>) {
    setSite(prev => ({ ...prev, ...partial }))
    setSaving(true)
    try {
      await fetch(`/api/event-site/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      })
      setPreviewKey(k => k + 1)
    } finally {
      setSaving(false)
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
            <Link href="/accueil" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", textDecoration: "none" }}>← Retour</Link>
            {saving && <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>Sauvegarde…</span>}
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
            <StyleTab site={site} onPatch={patch} />
          )}
          {tab === "photos" && (
            <PhotosTab site={site} onPatch={patch} onReload={() => router.refresh()} />
          )}
        </div>
      </aside>

      {/* ── Panel droit : preview live ── */}
      <section style={{ position: "relative", background: "var(--dash-bg,#f7f7fb)", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 10,
          padding: "6px 12px", borderRadius: 99, background: "rgba(0,0,0,0.7)",
          color: "#fff", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>Aperçu live</div>
        <iframe
          key={previewKey}
          src={`/evt/preview/${site.id}`}
          style={{ width: "100%", height: "100%", border: 0 }}
          title="Preview site événement"
        />
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <FieldGroup label="Le titre principal">
        <Input value={hero.title ?? ""} onChange={v => onUpdate("hero.title", v)} placeholder="Ex: Yousra & Ali" />
      </FieldGroup>

      <FieldGroup label="Date de l'événement (affichée)">
        <Input value={hero.date ?? ""} onChange={v => onUpdate("hero.date", v)} placeholder="Ex: 04 avril 2026" />
      </FieldGroup>

      <FieldGroup label="Lieu principal (nom visible)">
        <Input value={hero.venue ?? ""} onChange={v => onUpdate("hero.venue", v)} placeholder="Ex: Domaine Terracotta" />
      </FieldGroup>

      <div style={{ height: 1, background: "var(--dash-border,rgba(183,191,217,0.15))", margin: "4px 0" }} />

      <FieldGroup label="🗺️ Lien Google Maps (pour itinéraire)">
        <Input value={main.mapsUrl ?? ""} onChange={v => onUpdate("mainEvent.mapsUrl", v)} placeholder="https://maps.app.goo.gl/..." />
      </FieldGroup>

      <FieldGroup label="🚗 Lien Waze (facultatif)">
        <Input value={main.wazeUrl ?? ""} onChange={v => onUpdate("mainEvent.wazeUrl", v)} placeholder="https://waze.com/ul?..." />
      </FieldGroup>

      <div style={{ padding: "10px 12px", background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 9, fontSize: 11, color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.5 }}>
        🔒 L&apos;adresse exacte ne sera jamais affichée publiquement. Les invités cliquent sur "Itinéraire" → ouvre Maps/Waze.
      </div>

      <div style={{ height: 1, background: "var(--dash-border,rgba(183,191,217,0.15))", margin: "4px 0" }} />

      <FieldGroup label="Un mot à vos invités (facultatif)">
        <Textarea value={(content.welcomeNote as string) ?? ""} onChange={v => onUpdate("welcomeNote", v)} placeholder="Ex: Nous sommes ravis de vous convier à la célébration de notre union…" rows={3} />
      </FieldGroup>

      {template === "mariage" && (
        <FieldGroup label="Dress code (facultatif)">
          <Input value={(content.dressCode as string) ?? ""} onChange={v => onUpdate("dressCode", v)} placeholder="Ex: tenue de cocktail, couleurs claires" />
        </FieldGroup>
      )}

      <FieldGroup label="Date limite RSVP (facultatif)">
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

function StyleTab({ site, onPatch }: { site: EventSite; onPatch: (p: Partial<EventSite>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <FieldGroup label="Template">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onPatch({ template: t.id })} style={chipStyle(site.template === t.id)}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Palette de couleurs">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {PALETTES.map(p => (
            <button key={p.id} onClick={() => onPatch({ palette: p.id })} style={{
              ...chipStyle(site.palette === p.id),
              justifyContent: "space-between",
              paddingRight: 10,
            }}>
              <span>{p.label}</span>
              <span style={{ display: "flex", gap: 3 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.main }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.accent }} />
              </span>
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Police des titres">
        <FontSelector
          current={site.fontHeading}
          onChange={v => onPatch({ fontHeading: v })}
          preview="Yousra & Ali"
        />
      </FieldGroup>

      <FieldGroup label="Police du corps de texte">
        <FontSelector
          current={site.fontBody}
          onChange={v => onPatch({ fontBody: v })}
          preview="Nous sommes ravis de vous convier"
        />
      </FieldGroup>
    </div>
  )
}

function PhotosTab({ site, onPatch, onReload }: { site: EventSite; onPatch: (p: Partial<EventSite>) => void; onReload: () => void }) {
  const [uploading, setUploading] = useState(false)

  async function uploadHero(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("kind", "hero")
      const r = await fetch(`/api/event-site/${site.id}/photos`, {
        method: "POST",
        body: formData,
      })
      if (r.ok) {
        const data = await r.json()
        onPatch({ heroImageUrl: data.url })
      } else {
        alert("Upload échoué")
      }
    } finally {
      setUploading(false)
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

      {/* Galerie V2 — on laisse un placeholder pour montrer qu'on prévoit */}
      <FieldGroup label="Galerie photos">
        <div style={{ padding: "20px 16px", background: "var(--dash-faint,rgba(183,191,217,0.05))", borderRadius: 10, textAlign: "center", fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>
          Bientôt disponible — upload de plusieurs photos pour la galerie
        </div>
      </FieldGroup>
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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-2,#6a6a71)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      {children}
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
