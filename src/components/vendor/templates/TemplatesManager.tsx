"use client"
/**
 * TemplatesManager — réponses préformatées réutilisables dans l'inbox.
 *
 * - GET    /api/vendor/templates
 * - POST   /api/vendor/templates
 * - PATCH  /api/vendor/templates/[id]
 * - DELETE /api/vendor/templates/[id]
 *
 * Langues supportées : fr / darija / ar (RTL auto sur ar).
 * Variables : {{name}} {{eventType}} {{eventDate}} (documentées dans l'UI).
 * Starter pack 1-clic : 3 templates FR + 3 darija + 3 AR pour bootstrapper.
 */
import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/vendor/_shared/EmptyState"

type Lang = "fr" | "darija" | "ar"
type Template = {
  id: string
  title: string
  body: string
  lang: Lang | string
  order: number
}

type Draft = {
  id: string | null
  title: string
  body: string
  lang: Lang
}

const EMPTY: Draft = { id: null, title: "", body: "", lang: "fr" }

const LANG_LABEL: Record<Lang, string> = {
  fr: "Français",
  darija: "Darija",
  ar: "العربية",
}

const STARTER: Record<Lang, { title: string; body: string }[]> = {
  fr: [
    {
      title: "Disponible — accusé de réception",
      body:
        "Bonjour {{name}},\n\nMerci pour votre demande pour votre {{eventType}} du {{eventDate}}. " +
        "Je suis disponible sur cette date et je serai ravi d'en discuter avec vous.\n\n" +
        "Pourriez-vous me préciser le lieu, le nombre d'invités et vos attentes principales ? " +
        "Je vous enverrai une proposition détaillée sous 24h.\n\nBien à vous,",
    },
    {
      title: "Non disponible — alternative",
      body:
        "Bonjour {{name}},\n\nMerci pour votre intérêt pour votre {{eventType}} du {{eventDate}}. " +
        "Malheureusement je ne suis pas disponible à cette date.\n\n" +
        "Si vos dates sont flexibles, n'hésitez pas à revenir vers moi. Sinon je peux vous recommander " +
        "un confrère de confiance.\n\nBien cordialement,",
    },
    {
      title: "Demande d'infos complémentaires",
      body:
        "Bonjour {{name}},\n\nMerci pour votre demande. Pour vous proposer le package le plus adapté " +
        "à votre {{eventType}}, j'aurais besoin de quelques précisions :\n\n" +
        "• Lieu exact\n• Nombre d'invités\n• Heure de début / fin\n• Vos attentes / inspirations\n\n" +
        "Au plaisir d'échanger,",
    },
  ],
  darija: [
    {
      title: "Ana dispo — accusé",
      body:
        "Salam {{name}},\n\nChoukran 3la demande dyalek l {{eventType}} nhar {{eventDate}}. " +
        "Ana dispo f had la date o farhan b la proposition.\n\n" +
        "3afak gouli liya l'endroit, ch7al d les invités o chnou bghiti bezaf. " +
        "Ghadi nsift lik proposition kamla f 24h.\n\nSalamat,",
    },
    {
      title: "Machi dispo",
      body:
        "Salam {{name}},\n\nChoukran 3la thiqa. Malheureusement ana machi dispo nhar {{eventDate}} " +
        "l {{eventType}} dyalek.\n\n" +
        "Ila 3andek flexibilité f la date, rj3 3aliya. Ola n9der nwerrik wa7ed collègue mezyan.\n\n" +
        "Salamat,",
    },
    {
      title: "Bghit ma3loumat",
      body:
        "Salam {{name}},\n\nChoukran 3la demande. Bach n3tik a7sen package l {{eventType}} dyalek, " +
        "khasni ch7aja :\n\n" +
        "• L'endroit\n• Ch7al d les invités\n• L'heure dyal la b'dayat o la nihayat\n• Chnou bghiti\n\n" +
        "Ntsenna jawabek,",
    },
  ],
  ar: [
    {
      title: "متوفر — إشعار استلام",
      body:
        "مرحباً {{name}}،\n\nشكراً لطلبك بخصوص {{eventType}} بتاريخ {{eventDate}}. " +
        "أنا متاح في هذا التاريخ ويسعدني التواصل معك.\n\n" +
        "هل يمكنك تزويدي بالموقع، عدد الضيوف وتوقعاتك الرئيسية؟ " +
        "سأرسل لك عرضاً مفصلاً خلال 24 ساعة.\n\nمع خالص التحية،",
    },
    {
      title: "غير متوفر",
      body:
        "مرحباً {{name}}،\n\nشكراً لاهتمامك. للأسف لست متاحاً في تاريخ {{eventDate}} " +
        "لـ {{eventType}} الخاص بك.\n\n" +
        "إذا كانت تواريخك مرنة، لا تتردد في التواصل معي مجدداً. أو يمكنني تزكية زميل موثوق.\n\n" +
        "تحياتي،",
    },
    {
      title: "طلب معلومات إضافية",
      body:
        "مرحباً {{name}}،\n\nشكراً لطلبك. لأقدم لك الباقة الأنسب لـ {{eventType}} الخاص بك، " +
        "أحتاج بعض التفاصيل:\n\n" +
        "• الموقع\n• عدد الضيوف\n• توقيت البداية والنهاية\n• توقعاتك\n\n" +
        "في انتظار ردك،",
    },
  ],
}

const VARIABLES = [
  { code: "{{name}}",      label: "Nom du client" },
  { code: "{{eventType}}", label: "Type d'événement" },
  { code: "{{eventDate}}", label: "Date" },
]

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState<Lang | "all">("all")
  const [draft,     setDraft]     = useState<Draft | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [bootLang,  setBootLang]  = useState<Lang | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/vendor/templates")
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur")
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    if (!templates) return []
    if (filter === "all") return templates
    return templates.filter(t => t.lang === filter)
  }, [templates, filter])

  const counts = useMemo(() => {
    const base = { all: 0, fr: 0, darija: 0, ar: 0 } as Record<"all" | Lang, number>
    for (const t of templates ?? []) {
      base.all += 1
      if (t.lang === "fr" || t.lang === "darija" || t.lang === "ar") base[t.lang] += 1
    }
    return base
  }, [templates])

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      const body = {
        title: draft.title.trim(),
        body:  draft.body.trim(),
        lang:  draft.lang,
      }
      if (!body.title) throw new Error("Le titre est requis.")
      if (!body.body)  throw new Error("Le corps est requis.")

      const url    = draft.id ? `/api/vendor/templates/${draft.id}` : "/api/vendor/templates"
      const method = draft.id ? "PATCH" : "POST"
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur sauvegarde")
      setDraft(null)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce template ?")) return
    try {
      const res = await fetch(`/api/vendor/templates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur")
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    }
  }

  async function bootstrap(lang: Lang) {
    setBootLang(lang)
    setError(null)
    try {
      for (const s of STARTER[lang]) {
        await fetch("/api/vendor/templates", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: s.title, body: s.body, lang }),
        })
      }
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur bootstrap")
    } finally {
      setBootLang(null)
    }
  }

  function startEdit(t: Template) {
    const lang: Lang = (t.lang === "fr" || t.lang === "darija" || t.lang === "ar") ? t.lang : "fr"
    setDraft({ id: t.id, title: t.title, body: t.body, lang })
  }

  // Insertion variable dans le body (curseur à la fin pour simplicité)
  function insertVar(code: string) {
    if (!draft) return
    setDraft({ ...draft, body: (draft.body + " " + code).trim() })
  }

  const langTabs: { id: Lang | "all"; label: string; count: number }[] = [
    { id: "all",    label: "Toutes",    count: counts.all    },
    { id: "fr",     label: "Français",  count: counts.fr     },
    { id: "darija", label: "Darija",    count: counts.darija },
    { id: "ar",     label: "العربية",    count: counts.ar     },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>
            Templates de réponse
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2)", margin: "4px 0 0" }}>
            Répondez en 1 clic depuis vos messages. Variables disponibles :
            <code style={{ background: "var(--dash-faint-2)", padding: "1px 5px", borderRadius: 4, fontSize: "var(--text-xs)", margin: "0 3px" }}>{"{{name}}"}</code>
            <code style={{ background: "var(--dash-faint-2)", padding: "1px 5px", borderRadius: 4, fontSize: "var(--text-xs)", margin: "0 3px" }}>{"{{eventType}}"}</code>
            <code style={{ background: "var(--dash-faint-2)", padding: "1px 5px", borderRadius: 4, fontSize: "var(--text-xs)", margin: "0 3px" }}>{"{{eventDate}}"}</code>
          </p>
        </div>
        {templates && templates.length < 20 && (
          <button
            onClick={() => setDraft({ ...EMPTY })}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 700,
              background: "linear-gradient(135deg,#E11D48,#9333EA)",
              color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Nouveau template
          </button>
        )}
      </header>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {langTabs.map(t => {
          const active = filter === t.id
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: "var(--text-sm)", fontWeight: 600,
                border: active ? "none" : "1px solid rgba(183,191,217,0.25)",
                background: active ? "linear-gradient(135deg,#E11D48,#9333EA)" : "#fff",
                color: active ? "#fff" : "#45474D",
                cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {t.label}
              <span style={{
                fontSize: "var(--text-xs)", padding: "1px 7px", borderRadius: 99,
                background: active ? "rgba(255,255,255,0.22)" : "rgba(183,191,217,0.2)",
                color: active ? "#fff" : "#6b7280", fontWeight: 700,
              }}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#991B1B", fontSize: "var(--text-sm)",
        }}>{error}</div>
      )}

      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--dash-text-3)", fontSize: "var(--text-sm)" }}>
          Chargement…
        </div>
      )}

      {/* Empty state + starter pack */}
      {templates && templates.length === 0 && !draft && (
        <div style={{
          background: "var(--dash-surface)", borderRadius: 14, padding: 24,
          border: "1px solid var(--dash-border)", textAlign: "center",
        }}>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--dash-text)", marginBottom: 6 }}>
            Démarrez avec un starter pack
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2)", margin: "0 0 16px", maxWidth: 540, marginInline: "auto" }}>
            3 templates prêts à l&apos;emploi par langue (disponible / indisponible / demande d&apos;infos).
            Modifiables ensuite à volonté.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {(["fr", "darija", "ar"] as Lang[]).map(l => (
              <button
                key={l}
                disabled={bootLang !== null}
                onClick={() => bootstrap(l)}
                style={{
                  padding: "9px 16px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 600,
                  background: "var(--dash-faint)", color: "var(--dash-text)",
                  border: "1px solid var(--dash-border)",
                  cursor: bootLang !== null ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                {bootLang === l ? "…" : `+ Starter ${LANG_LABEL[l]} (3)`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grille */}
      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(t => {
            const rtl = t.lang === "ar"
            return (
              <div
                key={t.id}
                style={{
                  background: "var(--dash-surface)", borderRadius: 14, padding: 16,
                  border: "1px solid var(--dash-border)",
                  display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)" }}>{t.title}</div>
                  <span style={{
                    fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--dash-text-2)",
                    background: "var(--dash-faint-2)", padding: "2px 7px", borderRadius: 99,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    {t.lang === "fr" ? "FR" : t.lang === "ar" ? "AR" : t.lang === "darija" ? "DAR" : t.lang}
                  </span>
                </div>
                <p
                  dir={rtl ? "rtl" : "ltr"}
                  style={{
                    fontSize: "var(--text-xs)", color: "var(--dash-text-2)", lineHeight: 1.6,
                    whiteSpace: "pre-line", margin: 0, flex: 1,
                    maxHeight: 180, overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {t.body}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button
                    onClick={() => startEdit(t)}
                    style={{
                      flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
                      background: "var(--dash-surface)", color: "var(--dash-text-2)",
                      border: "1px solid var(--dash-border)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    style={{
                      padding: "7px 10px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
                      background: "rgba(239,68,68,0.06)", color: "#991B1B",
                      border: "1px solid rgba(239,68,68,0.2)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && templates && templates.length > 0 && filter !== "all" && (
        <div style={{ background: "var(--dash-surface)", borderRadius: 14, border: "1px solid var(--dash-border)" }}>
          <EmptyState
            icon="💬"
            title="Aucun template dans cette langue"
            subtitle="Créez-en un nouveau ou changez de langue au-dessus."
            compact
          />
        </div>
      )}

      {/* Editor modal */}
      {draft && (
        <DraftEditor
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setDraft(null)}
          onSave={save}
          saving={saving}
          onInsertVar={insertVar}
        />
      )}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
function DraftEditor({
  draft, setDraft, onCancel, onSave, saving, onInsertVar,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
  onInsertVar: (code: string) => void
}) {
  const isNew = !draft.id
  const rtl = draft.lang === "ar"

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(11,13,18,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto",
          background: "var(--dash-surface)", borderRadius: 16, padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: 0, color: "var(--dash-text)" }}>
            {isNew ? "Nouveau template" : "Modifier le template"}
          </h2>
          <button onClick={onCancel} style={{
            background: "none", border: "none", fontSize: "var(--text-lg)", cursor: "pointer",
            color: "var(--dash-text-3)", padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text-2)", marginBottom: 4 }}>
              Titre
            </label>
            <input
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex : Disponible — accusé de réception"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text-2)", marginBottom: 4 }}>
              Langue
            </label>
            <select
              value={draft.lang}
              onChange={e => setDraft({ ...draft, lang: e.target.value as Lang })}
              style={inputStyle}
            >
              <option value="fr">Français</option>
              <option value="darija">Darija</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* Variables insertables */}
        <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2)" }}>Insérer :</span>
          {VARIABLES.map(v => (
            <button
              key={v.code}
              onClick={() => onInsertVar(v.code)}
              title={v.label}
              style={{
                padding: "3px 8px", borderRadius: 6, fontSize: "var(--text-xs)", fontWeight: 600,
                background: "var(--dash-faint-2)", color: "var(--dash-text-2)",
                border: "1px solid rgba(183,191,217,0.2)",
                cursor: "pointer", fontFamily: "ui-monospace, monospace",
              }}
            >
              {v.code}
            </button>
          ))}
        </div>

        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--dash-text-2)", marginBottom: 4 }}>
          Corps du message
        </label>
        <textarea
          value={draft.body}
          onChange={e => setDraft({ ...draft, body: e.target.value })}
          rows={10}
          dir={rtl ? "rtl" : "ltr"}
          placeholder="Bonjour {{name}}, merci pour votre demande…"
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: "9px 16px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 600,
              background: "var(--dash-surface)", color: "var(--dash-text-2)",
              border: "1px solid var(--dash-border)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 700,
              background: saving ? "#d1d5db" : "linear-gradient(135deg,#E11D48,#9333EA)",
              color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {saving ? "Enregistrement…" : isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid var(--dash-border)",
  fontSize: "var(--text-sm)", fontFamily: "inherit", background: "var(--dash-surface)", color: "var(--dash-text)",
}
