"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  G, CAT_COLORS, EVENT_TYPE_COLORS, DAYS_LONG, MONTHS_LONG,
  type CalItem, type Step,
  itemsByDay, fmtDayKey,
} from "./Calendar"

function gicon(size = 16, color = "currentColor"): React.CSSProperties {
  return { fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: size, fontWeight: "normal", lineHeight: 1, color, userSelect: "none" }
}

const CAT_OPTIONS: { value: string; label: string }[] = [
  { value: "venue", label: "Lieu" },
  { value: "catering", label: "Traiteur" },
  { value: "flowers", label: "Fleurs" },
  { value: "music", label: "Musique / DJ" },
  { value: "photo", label: "Photo / Vidéo" },
  { value: "dress", label: "Tenues" },
  { value: "general", label: "Général" },
]
const EVT_OPTIONS: { value: string; label: string }[] = [
  { value: "appointment", label: "Rendez-vous" },
  { value: "task", label: "Tâche" },
  { value: "reminder", label: "Rappel" },
]

/* =========================================================
 * DRAWER
 * ========================================================= */
export function DayDrawer({
  open, date, items, focusId, plannerId,
  onClose, onRefresh,
}: {
  open: boolean; date: Date | null; items: CalItem[]; focusId: string | null
  plannerId: string
  onClose: () => void; onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<null | "step" | "event">(null)

  useEffect(() => { setExpanded(focusId) }, [focusId, open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !date) return null

  const byDay = itemsByDay(items)
  const list = byDay.get(fmtDayKey(date)) ?? []
  const steps  = list.filter(i => i.kind === "step")  as Extract<CalItem,{kind:"step"}>[]
  const events = list.filter(i => i.kind === "event") as Extract<CalItem,{kind:"event"}>[]
  const wedding = list.find(i => i.kind === "wedding")

  const dayLabel = `${DAYS_LONG[(date.getDay()+6)%7]} ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,18,30,0.45)",
        zIndex: 80, backdropFilter: "blur(2px)",
      }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)", zIndex: 81,
        background: "var(--dash-surface,#fff)",
        borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(15,18,30,0.2)",
      }} className="clone-surface">
        {/* header */}
        <div style={{
          padding: "18px 20px", borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: "var(--dash-faint-2,rgba(183,191,217,0.15))", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={gicon(18, "var(--dash-text-2,#6a6a71)")}>close</span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "0.1em", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase" }}>Journée</div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {dayLabel}
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {wedding && (
            <div style={{
              padding: "14px 16px", borderRadius: 14, background: G, color: "#fff",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={gicon(20, "#fff")}>favorite</span>
              <div>
                <div style={{ fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "0.1em", opacity: 0.9 }}>JOUR J</div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>Le grand jour</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)" }}>
            <span>{steps.length} étape{steps.length !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{events.length} rendez-vous</span>
          </div>

          {/* events */}
          {events.map(it => (
            <EventCard key={it.id} item={it} />
          ))}

          {/* steps */}
          {steps.map(it => (
            <StepCard
              key={it.id}
              item={it}
              expanded={expanded === it.id}
              onToggle={() => setExpanded(expanded === it.id ? null : it.id)}
              onRefresh={onRefresh}
            />
          ))}

          {steps.length === 0 && events.length === 0 && !wedding && (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xl)", marginBottom: 8 }}>🗓️</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3,#9a9aaa)" }}>Rien de prévu ce jour</div>
            </div>
          )}
        </div>

        {/* footer CTAs */}
        <div style={{
          padding: "14px 20px", borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
          display: "flex", gap: 10,
        }}>
          <button onClick={() => setShowForm("step")} style={{
            flex: 1, height: 40, borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
            background: "var(--dash-surface,#fff)", cursor: "pointer",
            fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={gicon(15)}>task_alt</span>Étape
          </button>
          <button onClick={() => setShowForm("event")} style={{
            flex: 1, height: 40, borderRadius: 10, border: "none",
            background: G, cursor: "pointer",
            fontSize: "var(--text-xs)", fontWeight: 700, color: "#fff", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={gicon(15, "#fff")}>event</span>Rendez-vous
          </button>
        </div>

        {showForm && (
          <QuickForm
            mode={showForm}
            date={date}
            plannerId={plannerId}
            onClose={() => setShowForm(null)}
            onCreated={() => { setShowForm(null); onRefresh() }}
          />
        )}
      </aside>
    </>
  )
}

/* ---------- EVENT CARD ---------- */
function EventCard({ item }: { item: Extract<CalItem,{kind:"event"}> }) {
  const e = item.ref
  const color = e.color || EVENT_TYPE_COLORS[e.type] || "#818cf8"
  return (
    <div style={{
      borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
      background: "var(--dash-surface,#fff)", overflow: "hidden",
    }} className="clone-surface">
      <div style={{
        width: "100%", padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ width: 6, height: 34, borderRadius: 3, background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>{e.title}</div>
          <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
            {e.type === "appointment" ? "Rendez-vous" : e.type === "reminder" ? "Rappel" : "Tâche"}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- STEP CARD ---------- */
function StepCard({ item, expanded, onToggle, onRefresh }: {
  item: Extract<CalItem,{kind:"step"}>; expanded: boolean; onToggle: () => void
  onRefresh: () => void
}) {
  const s: Step = item.ref
  const color = CAT_COLORS[s.category] ?? "#818cf8"
  const vendors = s.vendors ?? []
  const confirmedCount = vendors.filter(v => v.confirmed).length

  async function toggleStatus() {
    const next = s.status === "done" ? "todo" : s.status === "todo" ? "in_progress" : "done"
    try {
      await fetch(`/api/steps/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      onRefresh()
    } catch {}
  }

  return (
    <div style={{
      borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
      background: "var(--dash-surface,#fff)", overflow: "hidden",
    }} className="clone-surface">
      <button onClick={onToggle} style={{
        width: "100%", padding: "12px 14px", border: "none", background: "transparent",
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span
          onClick={(e) => { e.stopPropagation(); toggleStatus() }}
          style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            border: s.status === "done" ? "none" : `2px solid ${color}`,
            background: s.status === "done" ? color : "transparent",
            display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          {s.status === "done" && <span style={gicon(14, "#fff")}>check</span>}
          {s.status === "in_progress" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)",
            textDecoration: s.status === "done" ? "line-through" : "none",
            opacity: s.status === "done" ? 0.6 : 1,
          }}>{s.title}</div>
          <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
            {(CAT_OPTIONS.find(o => o.value === s.category)?.label) ?? s.category}
            {vendors.length > 0 && <span style={{ color: "var(--dash-text-3,#9a9aaa)", textTransform: "none", letterSpacing: 0, fontWeight: 500, marginLeft: 8 }}>
              · {vendors.length} prestataire{vendors.length > 1 ? "s" : ""}{confirmedCount > 0 && ` · ${confirmedCount} confirmé${confirmedCount > 1 ? "s" : ""}`}
            </span>}
          </div>
        </div>
        <span style={gicon(16, "var(--dash-text-3,#9a9aaa)")}>{expanded ? "expand_less" : "expand_more"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {s.description && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.5 }}>{s.description}</div>
          )}
          <StepVendorsBlock step={s} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  )
}

/* ---------- VENDORS BLOCK ---------- */
function StepVendorsBlock({ step, onRefresh }: { step: Step; onRefresh: () => void }) {
  const vendors = step.vendors ?? []

  async function toggleConfirmed(vendorId: string, confirmed: boolean) {
    try {
      await fetch(`/api/steps/${step.id}/vendors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, confirmed: !confirmed }),
      })
      onRefresh()
    } catch {}
  }
  async function removeVendor(vendorId: string) {
    try {
      await fetch(`/api/steps/${step.id}/vendors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      })
      onRefresh()
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "0.1em", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase" }}>
        Prestataires
      </div>
      {vendors.length === 0 ? (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", fontStyle: "italic" }}>Aucun prestataire lié</div>
      ) : vendors.map(v => (
        <div key={v.vendor.id} style={{
          padding: "8px 10px", borderRadius: 10,
          background: "var(--dash-faint,rgba(183,191,217,0.08))",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: v.confirmed ? G : "var(--dash-faint-2,rgba(183,191,217,0.2))",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--text-2xs)", fontWeight: 800, color: v.confirmed ? "#fff" : "var(--dash-text-2,#6a6a71)",
          }}>{v.vendor.name.slice(0,2).toUpperCase()}</div>
          <Link href={`/vendor/${v.vendor.slug}`} style={{
            flex: 1, minWidth: 0, textDecoration: "none", cursor: "pointer",
          }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {v.vendor.name}
            </div>
            <div style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: v.confirmed ? "#22c55e" : "#f59e0b" }}>
              {v.confirmed ? "● Confirmé" : "○ En contact"}
            </div>
          </Link>
          <button onClick={() => toggleConfirmed(v.vendor.id, v.confirmed)} title={v.confirmed ? "Annuler la confirmation" : "Confirmer"} style={iconBtn()}>
            <span style={gicon(14, v.confirmed ? "#22c55e" : "var(--dash-text-3,#9a9aaa)")}>{v.confirmed ? "check_circle" : "radio_button_unchecked"}</span>
          </button>
          <Link href={`/messages?vendor=${v.vendor.slug}`} title="Contacter" style={iconBtn() as React.CSSProperties}>
            <span style={gicon(14, "var(--dash-text-2,#6a6a71)")}>chat</span>
          </Link>
          <button onClick={() => removeVendor(v.vendor.id)} title="Retirer" style={iconBtn()}>
            <span style={gicon(14, "var(--dash-text-3,#9a9aaa)")}>close</span>
          </button>
        </div>
      ))}
      <Link href={`/explore?category=${encodeURIComponent(step.category)}`} style={{
        marginTop: 4, padding: "8px 12px", borderRadius: 10,
        border: "1px dashed var(--dash-border,rgba(183,191,217,0.35))",
        background: "transparent", color: "var(--dash-text-2,#6a6a71)",
        fontSize: "var(--text-xs)", fontWeight: 600, textDecoration: "none",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <span style={gicon(14)}>search</span>
        Chercher un prestataire
      </Link>
    </div>
  )
}
function iconBtn(): React.CSSProperties {
  return {
    width: 26, height: 26, borderRadius: "50%", border: "none", background: "transparent",
    display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    textDecoration: "none", flexShrink: 0,
  }
}

/* ---------- QUICK FORM ---------- */
function QuickForm({ mode, date, plannerId, onClose, onCreated }: {
  mode: "step" | "event"; date: Date; plannerId: string
  onClose: () => void; onCreated: () => void
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("general")
  const [type, setType] = useState("appointment")
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const iso = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString()

  async function submit() {
    if (!title.trim() || submitting) return
    setSubmitting(true); setErr(null)
    try {
      const url = mode === "step"
        ? `/api/planners/${plannerId}/steps`
        : `/api/planners/${plannerId}/events`
      const body = mode === "step"
        ? { title: title.trim(), category, dueDate: iso }
        : { title: title.trim(), type, date: iso }
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) { const d = await r.json().catch(() => ({})); setErr(d.error ?? "Erreur"); setSubmitting(false); return }
      onCreated()
    } catch { setErr("Erreur réseau"); setSubmitting(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,18,30,0.55)", zIndex: 90 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "min(440px,92vw)", zIndex: 91,
        background: "var(--dash-surface,#fff)", borderRadius: 16,
        border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
        boxShadow: "0 30px 80px rgba(15,18,30,0.3)",
        padding: 22, display: "flex", flexDirection: "column", gap: 14,
      }} className="clone-surface">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 800, color: "var(--dash-text,#121317)" }}>
            Nouvelle {mode === "step" ? "étape" : "date"}
          </h3>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "var(--dash-faint-2,rgba(183,191,217,0.15))", cursor: "pointer" }}>
            <span style={gicon(16, "var(--dash-text-2,#6a6a71)")}>close</span>
          </button>
        </div>

        <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>
          {DAYS_LONG[(date.getDay()+6)%7]} {date.getDate()} {MONTHS_LONG[date.getMonth()]} {date.getFullYear()}
        </div>

        <Field label="Titre">
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
            placeholder={mode === "step" ? "Ex. Choisir le photographe" : "Ex. Dégustation traiteur"}
            style={inputStyle()} />
        </Field>

        {mode === "step" ? (
          <Field label="Catégorie">
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle()}>
              {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle()}>
              {EVT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        )}

        {err && <div style={{ fontSize: "var(--text-xs)", color: "#ef4444" }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 42, borderRadius: 10,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
            background: "var(--dash-surface,#fff)", cursor: "pointer",
            fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)", fontFamily: "inherit",
          }}>Annuler</button>
          <button onClick={submit} disabled={submitting || !title.trim()} style={{
            flex: 1, height: 42, borderRadius: 10, border: "none", background: G, color: "#fff",
            cursor: submitting || !title.trim() ? "default" : "pointer",
            opacity: submitting || !title.trim() ? 0.5 : 1,
            fontSize: "var(--text-sm)", fontWeight: 700, fontFamily: "inherit",
          }}>{submitting ? "Création…" : "Créer"}</button>
        </div>
      </div>
    </>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "0.1em", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase" }}>{label}</span>
      {children}
    </label>
  )
}
function inputStyle(): React.CSSProperties {
  return {
    height: 40, padding: "0 12px",
    border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
    borderRadius: 10, background: "var(--dash-bg,#f7f7fb)",
    fontSize: "var(--text-sm)", color: "var(--dash-text,#121317)", fontFamily: "inherit", outline: "none", width: "100%",
  }
}

