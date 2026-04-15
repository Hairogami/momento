"use client"
/**
 * Inbox prestataire — vue tableau avec filtres, recherche, transitions de statut
 * et modal de réponse avec sélection de template (FR/darija/AR).
 *
 * Endpoints consommés :
 *   - GET   /api/vendor/requests?status=...&q=...
 *   - PATCH /api/vendor/requests/:id          (transitions statut)
 *   - GET   /api/vendor/templates             (liste templates)
 *
 * Le "envoi 1-clic" utilise mailto: — on pré-remplit sujet+corps avec les variables
 * {{name}}, {{eventType}}, {{eventDate}} substituées depuis la demande.
 */
import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/vendor/_shared/EmptyState"

// ── Types ────────────────────────────────────────────────────────────────────
type Status = "new" | "read" | "replied" | "won" | "lost"
type StatusFilter = "all" | Status

type Request = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  eventType: string | null
  eventDate: string | null
  message: string
  status: string // peut contenir legacy (pending/confirmed/declined)
  readAt: string | null
  repliedAt: string | null
  createdAt: string
}

type Template = {
  id: string
  title: string
  lang: string // "fr" | "ar" | "darija"
  body: string
  order: number
}

// ── Config UI ────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<Status, string> = {
  new: "Nouvelles",
  read: "Lues",
  replied: "Répondues",
  won: "Gagnées",
  lost: "Perdues",
}

const STATUS_COLOR: Record<Status, { fg: string; bg: string; border: string }> = {
  new:     { fg: "#B45309", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  read:    { fg: "#374151", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
  replied: { fg: "#1D4ED8", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  won:     { fg: "#166534", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)"  },
  lost:    { fg: "#991B1B", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)" },
}

const LANG_LABEL: Record<string, string> = {
  fr: "Français",
  ar: "العربية",
  darija: "Darija",
}

// Normalise statut legacy → canonique pour l'UI
function canonStatus(s: string): Status {
  if (s === "pending") return "new"
  if (s === "confirmed") return "won"
  if (s === "declined") return "lost"
  return (["new","read","replied","won","lost"] as const).includes(s as Status)
    ? (s as Status)
    : "new"
}

// Remplace {{name}} {{eventType}} {{eventDate}} dans un template
function fillTemplate(body: string, req: Request): string {
  return body
    .replaceAll("{{name}}", req.clientName)
    .replaceAll("{{eventType}}", req.eventType ?? "événement")
    .replaceAll("{{eventDate}}", req.eventDate ?? "")
    .trim()
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) {
    return `aujourd'hui, ${d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" })}`
  }
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

// ── Component ────────────────────────────────────────────────────────────────
export default function InboxClient() {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [q, setQ] = useState("")
  const [requests, setRequests] = useState<Request[]>([])
  const [counts, setCounts] = useState<Record<StatusFilter, number>>({
    all: 0, new: 0, read: 0, replied: 0, won: 0, lost: 0,
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyOpen, setReplyOpen] = useState<Request | null>(null)

  // Debounced search
  const [qDebounced, setQDebounced] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  // Fetch requests + templates
  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (filter !== "all") params.set("status", filter)
    if (qDebounced) params.set("q", qDebounced)
    fetch(`/api/vendor/requests?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => {
        setRequests(data.requests)
        setCounts(data.statusCounts)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [filter, qDebounced])

  useEffect(() => {
    fetch("/api/vendor/templates")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setTemplates(data.templates ?? []))
      .catch(() => setTemplates([]))
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────
  async function transition(id: string, next: Status) {
    // optimistic
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: next } : r))
    try {
      const res = await fetch(`/api/vendor/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur")
      const { request } = await res.json()
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...request } : r))
    } catch (e) {
      // revert en rechargeant
      setError(e instanceof Error ? e.message : String(e))
      setFilter(f => f) // triggers refetch
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "all",     label: "Toutes" },
    { key: "new",     label: STATUS_LABEL.new },
    { key: "read",    label: STATUS_LABEL.read },
    { key: "replied", label: STATUS_LABEL.replied },
    { key: "won",     label: STATUS_LABEL.won },
    { key: "lost",    label: STATUS_LABEL.lost },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#121317", margin: 0 }}>
          Inbox
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
          Gérez vos demandes clients — du premier contact à la réservation.
        </p>
      </header>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {filterTabs.map(t => {
          const active = filter === t.key
          const count = counts[t.key] ?? 0
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: active ? "none" : "1px solid rgba(183,191,217,0.25)",
                background: active ? "linear-gradient(135deg,#E11D48,#9333EA)" : "#fff",
                color: active ? "#fff" : "#45474D",
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "inherit",
              }}
            >
              {t.label}
              <span style={{
                fontSize: 11, padding: "1px 7px", borderRadius: 99,
                background: active ? "rgba(255,255,255,0.22)" : "rgba(183,191,217,0.2)",
                color: active ? "#fff" : "#6b7280", fontWeight: 700,
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher par nom, email ou message…"
          style={{
            width: "100%", maxWidth: 420,
            padding: "10px 14px", borderRadius: 10,
            border: "1px solid rgba(183,191,217,0.3)",
            fontSize: 13, fontFamily: "inherit",
            background: "#fff", color: "#121317",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#991B1B", fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid rgba(183,191,217,0.18)",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9a9aaa", fontSize: 13 }}>
            Chargement…
          </div>
        ) : requests.length === 0 ? (
          qDebounced ? (
            <EmptyState
              icon="🔍"
              title="Aucun résultat"
              subtitle="Aucune demande ne correspond à votre recherche. Essayez avec un autre mot-clé."
            />
          ) : (
            <EmptyState
              icon="📭"
              title="Pas encore de demandes"
              subtitle={<>Les demandes des clients apparaîtront ici. En attendant, complétez votre profil pour être plus visible.</>}
              cta={{ label: "Améliorer mon profil", href: "/vendor/dashboard/profil" }}
            />
          )
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafbfd", textAlign: "left" }}>
                <Th>Client</Th>
                <Th>Événement</Th>
                <Th>Reçu</Th>
                <Th>Statut</Th>
                <Th style={{ textAlign: "right" }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const s = canonStatus(r.status)
                const col = STATUS_COLOR[s]
                const isNew = s === "new"
                return (
                  <tr key={r.id} style={{
                    borderTop: "1px solid rgba(183,191,217,0.14)",
                    background: isNew ? "rgba(245,158,11,0.03)" : "transparent",
                  }}>
                    <Td>
                      <div style={{ fontWeight: isNew ? 700 : 600, color: "#121317" }}>
                        {r.clientName}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {r.clientEmail}{r.clientPhone ? ` · ${r.clientPhone}` : ""}
                      </div>
                    </Td>
                    <Td>
                      <div>{r.eventType ?? "—"}</div>
                      {r.eventDate && (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          📅 {new Date(r.eventDate).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div style={{ fontSize: 12, color: "#45474D" }}>{fmtDate(r.createdAt)}</div>
                      {r.readAt && (
                        <div style={{ fontSize: 11, color: "#9a9aaa" }}>Vue {fmtDate(r.readAt)}</div>
                      )}
                    </Td>
                    <Td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px",
                        borderRadius: 99, background: col.bg,
                        color: col.fg, border: `1px solid ${col.border}`,
                      }}>
                        {STATUS_LABEL[s]}
                      </span>
                    </Td>
                    <Td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <ActionMenu
                        status={s}
                        onRead={() => transition(r.id, "read")}
                        onReply={() => {
                          setReplyOpen(r)
                          if (s === "new") transition(r.id, "read")
                        }}
                        onWon={() => transition(r.id, "won")}
                        onLost={() => transition(r.id, "lost")}
                      />
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reply modal */}
      {replyOpen && (
        <ReplyModal
          request={replyOpen}
          templates={templates}
          onClose={() => setReplyOpen(null)}
          onSent={() => {
            transition(replyOpen.id, "replied")
            setReplyOpen(null)
          }}
        />
      )}
    </div>
  )
}

// ── Primitives ───────────────────────────────────────────────────────────────
function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      padding: "12px 16px", fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.05em",
      color: "#6b7280", ...style,
    }}>{children}</th>
  )
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "12px 16px", verticalAlign: "top", ...style }}>{children}</td>
}

// ── Menu d'actions contextuel ────────────────────────────────────────────────
function ActionMenu({
  status, onRead, onReply, onWon, onLost,
}: {
  status: Status
  onRead: () => void
  onReply: () => void
  onWon: () => void
  onLost: () => void
}) {
  const terminal = status === "won" || status === "lost"

  const btn = (label: string, onClick: () => void, color: string) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
        background: "transparent", border: `1px solid ${color}33`,
        color, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {!terminal && status === "new" && btn("Marquer lu", onRead, "#6b7280")}
      {!terminal && btn("Répondre", onReply, "#E11D48")}
      {!terminal && btn("Gagnée", onWon, "#166534")}
      {!terminal && btn("Perdue", onLost, "#991B1B")}
      {terminal && <span style={{ fontSize: 12, color: "#9a9aaa" }}>—</span>}
    </div>
  )
}

// ── Modal de réponse ─────────────────────────────────────────────────────────
function ReplyModal({
  request, templates, onClose, onSent,
}: {
  request: Request
  templates: Template[]
  onClose: () => void
  onSent: () => void
}) {
  const [lang, setLang] = useState<string>("fr")
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [subject, setSubject] = useState(`Votre demande — ${request.eventType ?? "événement"}`)
  const [body, setBody] = useState("")

  // Templates groupés par langue
  const byLang = useMemo(() => {
    const map: Record<string, Template[]> = {}
    for (const t of templates) {
      (map[t.lang] ??= []).push(t)
    }
    return map
  }, [templates])

  const languages = Object.keys(byLang).length > 0 ? Object.keys(byLang) : ["fr"]

  // Applique un template
  function applyTemplate(t: Template) {
    setTemplateId(t.id)
    setLang(t.lang)
    setBody(fillTemplate(t.body, request))
  }

  // Envoi mailto
  function sendEmail() {
    const mailto = `mailto:${encodeURIComponent(request.clientEmail)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    onSent()
  }

  return (
    <div
      onClick={onClose}
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
          width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto",
          background: "#fff", borderRadius: 16, padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#121317" }}>
              Répondre à {request.clientName}
            </h2>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{request.clientEmail}</p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 24, cursor: "pointer",
            color: "#9a9aaa", padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        {/* Message original */}
        <div style={{
          background: "#fafbfd", borderRadius: 10, padding: 12, marginBottom: 16,
          border: "1px solid rgba(183,191,217,0.14)", fontSize: 13,
          color: "#45474D", lineHeight: 1.5, maxHeight: 120, overflow: "auto",
        }}>
          {request.message}
        </div>

        {/* Sélecteur langue */}
        {templates.length > 0 && (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                Langue
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {languages.map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                      padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: lang === l ? "#121317" : "#fff",
                      color: lang === l ? "#fff" : "#45474D",
                      border: "1px solid rgba(183,191,217,0.3)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {LANG_LABEL[l] ?? l}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates pour la langue courante */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                Templates
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(byLang[lang] ?? []).map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12,
                      background: templateId === t.id ? "rgba(225,29,72,0.1)" : "#fff",
                      color: templateId === t.id ? "#E11D48" : "#45474D",
                      border: `1px solid ${templateId === t.id ? "#E11D48" : "rgba(183,191,217,0.3)"}`,
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                    }}
                  >
                    {t.title}
                  </button>
                ))}
                {(byLang[lang] ?? []).length === 0 && (
                  <span style={{ fontSize: 12, color: "#9a9aaa", fontStyle: "italic" }}>
                    Aucun template dans cette langue. Créez-en dans Templates.
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {templates.length === 0 && (
          <div style={{
            padding: 12, borderRadius: 10, marginBottom: 14,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
            color: "#B45309", fontSize: 12,
          }}>
            Aucun template créé. Gagnez du temps en préparant vos réponses types dans l&apos;onglet Templates.
          </div>
        )}

        {/* Sujet + corps */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
            Sujet
          </label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid rgba(183,191,217,0.3)",
              fontSize: 13, fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
            Message
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={10}
            dir={lang === "ar" ? "rtl" : "ltr"}
            placeholder="Rédigez votre réponse ou sélectionnez un template ci-dessus…"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid rgba(183,191,217,0.3)",
              fontSize: 13, fontFamily: "inherit", lineHeight: 1.5,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "#fff", color: "#45474D",
              border: "1px solid rgba(183,191,217,0.3)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={sendEmail}
            disabled={!body.trim()}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: body.trim() ? "linear-gradient(135deg,#E11D48,#9333EA)" : "#d1d5db",
              color: "#fff", border: "none",
              cursor: body.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
            }}
          >
            Envoyer par email
          </button>
        </div>
      </div>
    </div>
  )
}
