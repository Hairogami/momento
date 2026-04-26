"use client"

import { useState } from "react"
import { Edit3, Check, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { C } from "@/lib/colors"

interface Props {
  eventName: string
  eventDate: string | null
  budget: number | null
  guestCount: number | null
}

export default function EditEventInfo({ eventName, eventDate, budget, guestCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    eventName: eventName || "",
    eventDate: eventDate ? eventDate.slice(0, 10) : "",
    budget: budget ? String(budget) : "",
    guestCount: guestCount ? String(guestCount) : "",
  })

  async function handleSave() {
    setLoading(true)
    const body: Record<string, unknown> = { eventName: form.eventName }
    if (form.eventDate) body.eventDate = form.eventDate
    else body.eventDate = null
    if (form.budget) body.budget = parseFloat(form.budget)
    else body.budget = null
    if (form.guestCount) body.guestCount = parseInt(form.guestCount)
    else body.guestCount = null

    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ backgroundColor: `${C.terra}15`, color: C.terra, border: `1px solid ${C.terra}30` }}
      >
        <Edit3 size={11} />
        Modifier
      </button>
    )
  }

  return (
    <div
      className="rounded-2xl p-4 mt-4"
      style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: C.mist }}>
            Nom de l&apos;événement
          </label>
          <input
            value={form.eventName}
            onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
            placeholder="Mon mariage"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: C.mist }}>
            Date de l&apos;événement
          </label>
          <input
            type="date"
            value={form.eventDate}
            onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: C.mist }}>
            Budget total (Dhs)
          </label>
          <input
            type="number"
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
            placeholder="50000"
            min="0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: C.mist }}>
            Nombre d&apos;invités
          </label>
          <input
            type="number"
            value={form.guestCount}
            onChange={e => setForm(f => ({ ...f, guestCount: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
            placeholder="150"
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ backgroundColor: C.anthracite, color: C.mist }}
        >
          <X size={13} /> Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Sauvegarder
        </button>
      </div>
    </div>
  )
}
