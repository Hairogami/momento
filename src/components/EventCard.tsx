"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Pencil, Check, X } from "lucide-react"
import { C } from "@/lib/colors"
import { IS_DEV } from "@/lib/devMock"

interface Props {
  eventName: string
  eventDate: string | null
  daysUntil: number | null
}

export default function EventCard({ eventName, eventDate, daysUntil }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(eventName)
  const [date, setDate] = useState(eventDate ? eventDate.slice(0, 10) : "")
  const [saving, setSaving] = useState(false)

  // Valeurs affichées (optimistes)
  const [displayName, setDisplayName] = useState(eventName)
  const [displayDate, setDisplayDate] = useState(eventDate)

  async function save() {
    setSaving(true)
    const body: Record<string, unknown> = { eventName: name }
    if (date) body.eventDate = date
    else body.eventDate = null

    if (!IS_DEV) {
      try {
        const res = await fetch("/api/workspace", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
      } catch {
        setSaving(false)
        return
      }
    }

    setDisplayName(name)
    setDisplayDate(date ? new Date(date).toISOString() : null)
    setEditing(false)
    setSaving(false)
    router.refresh()
  }

  function cancel() {
    setName(displayName)
    setDate(displayDate ? displayDate.slice(0, 10) : "")
    setEditing(false)
  }

  const computedDays = displayDate
    ? Math.max(0, Math.ceil((new Date(displayDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="max-w-[1400px] mx-auto rounded-2xl px-6 py-5 relative"
      style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)` }}>

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
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-center text-sm rounded-xl px-4 py-2 outline-none"
            style={{ backgroundColor: `${C.anthracite}40`, border: `1px solid ${C.anthracite}`, color: C.mist }}
          />
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
