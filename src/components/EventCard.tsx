"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, Wallet, Pencil, Check, X } from "lucide-react"
import { C } from "@/lib/colors"
import { IS_DEV } from "@/lib/devMock"

interface Props {
  eventName: string
  eventDate: string | null
  daysUntil: number | null
  budget: number | null
  guestCount: number | null
  coverColor?: string | null
  plannerId?: string | null
}

export default function EventCard({ eventName, eventDate, daysUntil, budget, guestCount, coverColor, plannerId }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(eventName)
  const [date, setDate] = useState(eventDate ? eventDate.slice(0, 10) : "")
  const [budgetVal, setBudgetVal] = useState(budget !== null ? String(budget) : "")
  const [guestVal, setGuestVal] = useState(guestCount !== null ? String(guestCount) : "")
  const [saving, setSaving] = useState(false)

  // Valeurs affichées (optimistes)
  const [displayName, setDisplayName] = useState(eventName)
  const [displayDate, setDisplayDate] = useState(eventDate)
  const [displayBudget, setDisplayBudget] = useState(budget)
  const [displayGuests, setDisplayGuests] = useState(guestCount)

  // Sync quand on change d'événement dans la sidebar
  useEffect(() => {
    setDisplayName(eventName)
    setName(eventName)
    setDisplayDate(eventDate)
    setDate(eventDate ? eventDate.slice(0, 10) : "")
    setDisplayBudget(budget)
    setBudgetVal(budget !== null ? String(budget) : "")
    setDisplayGuests(guestCount)
    setGuestVal(guestCount !== null ? String(guestCount) : "")
    setEditing(false)
  }, [eventName, eventDate, budget, guestCount])

  async function save() {
    setSaving(true)
    const body: Record<string, unknown> = {}
    body.eventDate = date || null
    if (budgetVal !== "") body.budget = parseFloat(budgetVal)
    if (guestVal !== "") body.guestCount = parseInt(guestVal)

    if (!IS_DEV) {
      try {
        let url: string
        let payload: Record<string, unknown>
        if (plannerId) {
          url = `/api/planners/${plannerId}`
          payload = {
            weddingDate: date || null,
            budget: budgetVal !== "" ? parseFloat(budgetVal) : null,
            guestCount: guestVal !== "" ? parseInt(guestVal) : null,
            coupleNames: name,
          }
        } else {
          url = "/api/workspace"
          payload = { eventName: name, ...body }
        }
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
      } catch {
        setSaving(false)
        return
      }
    }

    setDisplayName(name)
    setDisplayDate(date ? new Date(date).toISOString() : null)
    setDisplayBudget(budgetVal !== "" ? parseFloat(budgetVal) : null)
    setDisplayGuests(guestVal !== "" ? parseInt(guestVal) : null)
    setEditing(false)
    setSaving(false)
    router.refresh()
  }

  function cancel() {
    setName(displayName)
    setDate(displayDate ? displayDate.slice(0, 10) : "")
    setBudgetVal(displayBudget !== null ? String(displayBudget) : "")
    setGuestVal(displayGuests !== null ? String(displayGuests) : "")
    setEditing(false)
  }

  const computedDays = displayDate
    ? Math.max(0, Math.ceil((new Date(displayDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="max-w-[1400px] mx-auto rounded-2xl px-6 py-5 relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${coverColor ?? "var(--border)"}`,
        boxShadow: coverColor ? `0 0 0 1px ${coverColor}22` : undefined,
      }}>
      {/* Barre colorée top si planner sélectionné */}
      {coverColor && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: coverColor }} />
      )}

      {editing ? (
        /* ── Mode édition ── */
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.terra }}>
            ✦ Modifier l&apos;événement
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom de l'événement"
            className="w-full max-w-sm text-center text-xl font-bold rounded-xl px-4 py-2 outline-none"
            style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.terra}60`, color: C.white }}
          />
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: C.mist }}>
                <Calendar size={10} className="inline mr-1" />Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-center text-sm rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}`, color: C.mist, colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: C.mist }}>
                <Users size={10} className="inline mr-1" />Invités
              </label>
              <input
                type="number"
                value={guestVal}
                onChange={e => setGuestVal(e.target.value)}
                placeholder="150"
                className="w-full text-center text-sm rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}`, color: C.mist }}
              />
            </div>
          </div>
          <div className="w-full max-w-sm">
            <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: C.mist }}>
              <Wallet size={10} className="inline mr-1" />Budget total (Dhs)
            </label>
            <input
              type="number"
              value={budgetVal}
              onChange={e => setBudgetVal(e.target.value)}
              placeholder="50000"
              className="w-full text-center text-sm rounded-xl px-3 py-2 outline-none"
              style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}`, color: C.mist }}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={save}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: C.terra, color: "#fff" }}>
              <Check size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition hover:opacity-80"
              style={{ backgroundColor: `${C.anthracite}60`, color: C.mist }}>
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      ) : (
        /* ── Mode affichage ── */
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: C.terra }}>
            ✦ Votre événement
          </p>
          <h1 className="text-2xl font-bold" style={{ color: C.white }}>{displayName}</h1>
          {displayDate && (
            <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: C.mist }}>
              <Calendar size={13} />
              {new Date(displayDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {computedDays !== null && computedDays > 0 && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${C.terra}25`, color: C.terra }}>
                  J-{computedDays}
                </span>
              )}
              {computedDays === 0 && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${C.terra}25`, color: C.terra }}>
                  Aujourd&apos;hui !
                </span>
              )}
            </p>
          )}
          {(displayGuests !== null || displayBudget !== null) && (
            <div className="flex items-center gap-4 mt-2">
              {displayGuests !== null && (
                <span className="text-xs flex items-center gap-1" style={{ color: C.mist }}>
                  <Users size={11} /> {displayGuests} invités prévus
                </span>
              )}
              {displayBudget !== null && (
                <span className="text-xs flex items-center gap-1" style={{ color: C.mist }}>
                  <Wallet size={11} /> {displayBudget.toLocaleString("fr-FR")} Dhs
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bouton édition (droite) */}
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl transition hover:opacity-70"
          style={{ backgroundColor: `${C.anthracite}60`, color: C.mist }}
          title="Modifier">
          <Pencil size={14} />
        </button>
      )}
    </div>
  )
}
