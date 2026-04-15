"use client"
/**
 * Calendrier privé du prestataire — grille mensuelle navigable.
 * Lit /api/vendor/calendar et surligne :
 *   - 🔴 dates bookées (status won/confirmed)
 *   - 🟠 dates en négociation (new/read/replied/pending)
 *   - ⚫ dates bloquées manuellement (VendorBlockedDate)
 *
 * Clic sur un jour → panneau latéral avec :
 *   - Les demandes liées (si existe)
 *   - Bouton "Bloquer cette date" (si jour libre futur)
 *   - Bouton "Débloquer" (si déjà bloquée)
 *
 * Props :
 *   - slugOverride : admin uniquement. Cible un autre prestataire.
 *   - isAdminMode  : affiche un badge "admin" et passe le slug dans les mutations.
 */
import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"

type Entry = {
  id: string
  clientName: string
  eventType: string | null
  status: string
}

type Blocked = {
  reason: string | null
}

type DayData = {
  date: string // YYYY-MM-DD
  booked: Entry[]
  pending: Entry[]
  blocked: Blocked | null
}

const MONTHS_FULL = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const WEEKDAYS = ["L","M","M","J","V","S","D"]

function keyOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function firstWeekdayMonOffset(y: number, m: number): number {
  const d = new Date(Date.UTC(y, m, 1)).getUTCDay()
  return (d + 6) % 7
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}

type Props = {
  slugOverride?: string
  isAdminMode?: boolean
}

export default function CalendarWidget({ slugOverride, isAdminMode }: Props = {}) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getUTCFullYear())
  const [month, setMonth] = useState(today.getUTCMonth())
  const [dates, setDates] = useState<DayData[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const slugQuery = slugOverride ? `&slug=${encodeURIComponent(slugOverride)}` : ""

  // Fetch plage du mois affiché
  useEffect(() => {
    setLoading(true)
    const from = keyOf(year, month, 1)
    const toD  = daysInMonth(year, month)
    const to   = keyOf(year, month, toD)
    fetch(`/api/vendor/calendar?from=${from}&to=${to}${slugQuery}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setDates(data.dates ?? []))
      .catch(() => setDates([]))
      .finally(() => setLoading(false))
  }, [year, month, slugQuery, reloadKey])

  const byDate = useMemo(() => {
    const map = new Map<string, DayData>()
    for (const d of dates) map.set(d.date, d)
    return map
  }, [dates])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }
  const goToday = () => {
    setYear(today.getUTCFullYear())
    setMonth(today.getUTCMonth())
    setSelected(keyOf(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  }

  const mutateBlock = useCallback(async (date: string, action: "block" | "unblock", reason?: string) => {
    setMutating(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { date }
      if (slugOverride) body.slug = slugOverride
      if (reason && action === "block") body.reason = reason
      const res = await fetch("/api/vendor/calendar/block", {
        method: action === "block" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.error ?? "Échec de la mise à jour.")
      }
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.")
    } finally {
      setMutating(false)
    }
  }, [slugOverride])

  const offset = firstWeekdayMonOffset(year, month)
  const nDays  = daysInMonth(year, month)
  const todayKey = keyOf(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())

  const cells: Array<{ key: string; day: number } | null> = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= nDays; d++) cells.push({ key: keyOf(year, month, d), day: d })
  while (cells.length % 7 !== 0) cells.push(null)

  const bookedCount  = dates.reduce((a, d) => a + d.booked.length,  0)
  const pendingCount = dates.reduce((a, d) => a + d.pending.length, 0)
  const blockedCount = dates.reduce((a, d) => a + (d.blocked ? 1 : 0), 0)

  const selectedData = selected ? byDate.get(selected) : null
  const selectedIsPast = selected ? selected < todayKey : false
  const selectedIsBooked = (selectedData?.booked.length ?? 0) > 0
  const selectedIsBlocked = !!selectedData?.blocked
  const selectedIsFreeFuture = !!selected && !selectedIsPast && !selectedIsBooked && !selectedIsBlocked

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid rgba(183,191,217,0.18)",
      padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#121317", display: "flex", alignItems: "center", gap: 8 }}>
            Agenda · {MONTHS_FULL[month]} {year}
            {isAdminMode && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                background: "#fef3c7", color: "#92400e", letterSpacing: "0.04em",
              }}>ADMIN</span>
            )}
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
            {loading
              ? "Chargement…"
              : `${bookedCount} prise${bookedCount > 1 ? "s" : ""} · ${pendingCount} en négo · ${blockedCount} bloquée${blockedCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavBtn onClick={prevMonth} label="‹" />
          <button
            onClick={goToday}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "#fff", color: "#45474D",
              border: "1px solid rgba(183,191,217,0.3)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Aujourd&apos;hui
          </button>
          <NavBtn onClick={nextMonth} label="›" />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: selected ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
        gap: 16,
      }}>
        {/* Grille */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAYS.map((w, i) => (
              <div key={i} style={{
                fontSize: 10, fontWeight: 700, color: "#9a9aaa",
                textAlign: "center", textTransform: "uppercase",
              }}>{w}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} />
              const data = byDate.get(c.key)
              const isBooked  = (data?.booked.length  ?? 0) > 0
              const isPending = (data?.pending.length ?? 0) > 0
              const isBlocked = !!data?.blocked
              const isToday = c.key === todayKey
              const isSelected = c.key === selected
              const isPast = c.key < todayKey

              let bg = "transparent"
              let fg = "#45474D"
              let border = "1px solid transparent"
              if (isBooked)       { bg = "#E11D48"; fg = "#fff" }
              else if (isBlocked) { bg = "#374151"; fg = "#fff" }
              else if (isPending) { bg = "rgba(245,158,11,0.15)"; fg = "#B45309" }
              if (isSelected) border = "2px solid #121317"
              else if (isToday) border = "1px solid #9333EA"

              // Désormais : tout jour non-passé est cliquable (pour bloquer/débloquer)
              const clickable = !isPast

              return (
                <button
                  key={c.key}
                  disabled={!clickable}
                  onClick={() => setSelected(isSelected ? null : c.key)}
                  style={{
                    aspectRatio: "1", minHeight: 40,
                    borderRadius: 8, border,
                    background: bg, color: isPast ? "#c7c9d2" : fg,
                    cursor: clickable ? "pointer" : "default",
                    fontSize: 13, fontWeight: (isBooked || isPending || isBlocked) ? 700 : 500,
                    fontFamily: "inherit",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    position: "relative", padding: 0,
                    opacity: isPast ? 0.45 : 1,
                  }}
                >
                  {c.day}
                  {(isBooked || isPending) && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {Array.from({ length: Math.min((data?.booked.length ?? 0) + (data?.pending.length ?? 0), 3) }).map((_, k) => (
                        <span key={k} style={{
                          width: 3, height: 3, borderRadius: "50%",
                          background: isBooked ? "#fff" : "#B45309",
                        }} />
                      ))}
                    </div>
                  )}
                  {isBlocked && !isBooked && !isPending && (
                    <span style={{ fontSize: 9, marginTop: 1, opacity: 0.85 }}>bloqué</span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: "#6b7280", flexWrap: "wrap" }}>
            <LegendDot color="#E11D48" label="Date prise (gagnée)" />
            <LegendDot color="rgba(245,158,11,0.6)" label="En négociation" />
            <LegendDot color="#374151" label="Bloquée manuellement" />
            <LegendDot color="#9333EA" label="Aujourd'hui" outline />
          </div>
        </div>

        {/* Panneau latéral */}
        {selected && (
          <aside style={{
            background: "#fafbfd", borderRadius: 10, padding: 14,
            border: "1px solid rgba(183,191,217,0.18)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#121317", marginBottom: 2 }}>
              {new Date(`${selected}T00:00:00.000Z`).toLocaleDateString("fr-MA", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </div>

            {selectedIsPast && (
              <div style={{ fontSize: 11, color: "#9a9aaa", marginTop: 6 }}>
                Date passée — lecture seule.
              </div>
            )}

            {!selectedIsPast && (
              <>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                  {((selectedData?.booked.length ?? 0) + (selectedData?.pending.length ?? 0))} demande
                  {((selectedData?.booked.length ?? 0) + (selectedData?.pending.length ?? 0)) > 1 ? "s" : ""}
                </div>

                {selectedData && selectedData.booked.length > 0 && (
                  <PanelSection title="✓ Confirmé" color="#166534" items={selectedData.booked} />
                )}
                {selectedData && selectedData.pending.length > 0 && (
                  <PanelSection title="… En négociation" color="#B45309" items={selectedData.pending} />
                )}

                {selectedIsBlocked && (
                  <BlockedBanner
                    reason={selectedData?.blocked?.reason ?? null}
                    mutating={mutating}
                    onUnblock={() => mutateBlock(selected, "unblock")}
                  />
                )}

                {selectedIsFreeFuture && (
                  <BlockAction
                    mutating={mutating}
                    onBlock={(reason) => mutateBlock(selected, "block", reason)}
                  />
                )}

                {error && (
                  <div style={{ marginTop: 10, fontSize: 11, color: "#b91c1c" }}>{error}</div>
                )}

                {(selectedData?.booked.length ?? 0) + (selectedData?.pending.length ?? 0) > 0 && (
                  <Link
                    href="/vendor/dashboard/inbox"
                    style={{
                      display: "block", marginTop: 12, fontSize: 12,
                      color: "#E11D48", textDecoration: "none", fontWeight: 600,
                    }}
                  >
                    Voir dans l&apos;inbox →
                  </Link>
                )}
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

function BlockedBanner({ reason, mutating, onUnblock }: { reason: string | null; mutating: boolean; onUnblock: () => void }) {
  return (
    <div style={{
      marginTop: 8, padding: 10, borderRadius: 8,
      background: "#f3f4f6", border: "1px solid #d1d5db",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
        ⛔ Bloquée manuellement
      </div>
      {reason && (
        <div style={{ fontSize: 12, color: "#45474D", marginBottom: 8 }}>{reason}</div>
      )}
      <button
        type="button"
        disabled={mutating}
        onClick={onUnblock}
        style={{
          padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: "#fff", color: "#374151",
          border: "1px solid #d1d5db", cursor: mutating ? "wait" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {mutating ? "…" : "Débloquer"}
      </button>
    </div>
  )
}

function BlockAction({ mutating, onBlock }: { mutating: boolean; onBlock: (reason?: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 4, width: "100%",
          padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: "#fff", color: "#374151",
          border: "1px dashed #9ca3af", cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ⛔ Bloquer cette date
      </button>
    )
  }

  return (
    <div style={{
      marginTop: 4, padding: 10, borderRadius: 8,
      background: "#fff", border: "1px solid #e5e7eb",
    }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
        Raison (optionnel)
      </label>
      <input
        type="text"
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="ex: congés, autre event…"
        maxLength={200}
        style={{
          width: "100%", padding: "6px 8px", fontSize: 12,
          border: "1px solid #d1d5db", borderRadius: 6,
          fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          disabled={mutating}
          onClick={() => { onBlock(reason.trim() || undefined); setOpen(false); setReason("") }}
          style={{
            flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: "#374151", color: "#fff",
            border: "none", cursor: mutating ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {mutating ? "…" : "Confirmer"}
        </button>
        <button
          type="button"
          disabled={mutating}
          onClick={() => { setOpen(false); setReason("") }}
          style={{
            padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: "#fff", color: "#6b7280",
            border: "1px solid #e5e7eb", cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

function NavBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: "#fff", color: "#45474D",
        border: "1px solid rgba(183,191,217,0.3)",
        cursor: "pointer", fontFamily: "inherit",
        fontSize: 18, fontWeight: 600,
      }}
    >
      {label}
    </button>
  )
}

function LegendDot({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 10, height: 10, borderRadius: "50%",
        background: outline ? "transparent" : color,
        border: outline ? `2px solid ${color}` : "none",
      }} />
      {label}
    </span>
  )
}

function PanelSection({ title, color, items }: { title: string; color: string; items: Entry[] }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(it => (
          <div key={it.id} style={{
            fontSize: 12, padding: "6px 8px", borderRadius: 6,
            background: "#fff", border: "1px solid rgba(183,191,217,0.18)",
          }}>
            <div style={{ fontWeight: 600, color: "#121317" }}>{it.clientName}</div>
            {it.eventType && <div style={{ fontSize: 11, color: "#6b7280" }}>{it.eventType}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
