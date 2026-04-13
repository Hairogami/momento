"use client"

import { useEffect, useState, use } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft, Plus, Sparkles, Calendar, CheckCircle2, Circle,
  Clock, MapPin, Phone, Trash2, Star,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { MomentoLogo } from "@/components/MomentoLogo"
import { C } from "@/lib/colors"
import { InlineEdit } from "@/components/InlineEdit"

const CATEGORIES = [
  { value: "general", label: "Général" },
  { value: "venue", label: "Salle" },
  { value: "catering", label: "Traiteur" },
  { value: "flowers", label: "Fleurs" },
  { value: "music", label: "Musique" },
  { value: "photo", label: "Photo" },
  { value: "dress", label: "Tenue" },
  { value: "decor", label: "Décor" },
  { value: "transport", label: "Transport" },
  { value: "honeymoon", label: "Voyage de noces" },
]

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  todo:        { label: "À faire",   icon: <Circle size={14} />,        bg: C.anthracite, color: C.mist },
  in_progress: { label: "En cours",  icon: <Clock size={14} />,         bg: "#D4E8D4",    color: "#2D5A2D" },
  done:        { label: "Fait",      icon: <CheckCircle2 size={14} />,  bg: "#D4E0D4",    color: "#1A3A1A" },
}

type Vendor = { id: string; name: string; category: string; description?: string; phone?: string; address?: string; priceRange?: string }
type StepVendor = { id: string; vendor: Vendor; notes?: string; confirmed: boolean }
type Step = { id: string; title: string; description?: string; status: string; category: string; dueDate?: string; vendors: StepVendor[] }
type CalEvent = { id: string; title: string; date: string; type: string; color: string }
type Planner = { id: string; title: string; coupleNames: string; weddingDate?: string; budget?: number; location?: string; coverColor: string; steps: Step[]; events: CalEvent[] }

export default function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [planner, setPlanner] = useState<Planner | null>(null)
  const [tab, setTab] = useState<"steps" | "calendar">("steps")
  const [addStepOpen, setAddStepOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<Step | null>(null)
  const [suggestions, setSuggestions] = useState<Vendor[]>([])
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [newStep, setNewStep] = useState({ title: "", category: "general", dueDate: "" })
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", date: "", type: "task", color: C.accent })

  useEffect(() => {
    fetch(`/api/planners/${id}`).then(r => r.json()).then(setPlanner)
  }, [id])

  async function addStep() {
    const res = await fetch(`/api/planners/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStep),
    })
    const step = await res.json()
    setPlanner(p => p ? { ...p, steps: [...p.steps, step] } : p)
    setAddStepOpen(false)
    setNewStep({ title: "", category: "general", dueDate: "" })
  }

  async function cycleStatus(stepId: string, current: string) {
    const next = current === "todo" ? "in_progress" : current === "in_progress" ? "done" : "todo"
    await fetch(`/api/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
    setPlanner(p => p ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, status: next } : s) } : p)
  }

  async function deleteStep(stepId: string) {
    await fetch(`/api/steps/${stepId}`, { method: "DELETE" })
    setPlanner(p => p ? { ...p, steps: p.steps.filter(s => s.id !== stepId) } : p)
  }

  async function suggestVendors(step: Step) {
    setActiveStep(step)
    setSuggestOpen(true)
    setLoadingSuggest(true)
    setSuggestions([])
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepTitle: step.title,
        stepCategory: step.category,
        weddingLocation: planner?.location,
        budget: planner?.budget,
      }),
    })
    const data = await res.json()
    setSuggestions(data.vendors || [])
    setLoadingSuggest(false)
  }

  async function linkVendor(vendor: Vendor) {
    if (!activeStep) return
    const res = await fetch(`/api/steps/${activeStep.id}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    })
    const link = await res.json()
    setPlanner(p => p ? {
      ...p,
      steps: p.steps.map(s => s.id === activeStep.id ? { ...s, vendors: [...s.vendors, link] } : s)
    } : p)
  }

  async function addEvent() {
    const res = await fetch(`/api/planners/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
    const event = await res.json()
    setPlanner(p => p ? { ...p, events: [...p.events, event] } : p)
    setAddEventOpen(false)
    setNewEvent({ title: "", date: "", type: "task", color: C.accent })
  }

  if (!planner) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: C.ink, color: C.mist }}>
      Loading…
    </div>
  )

  const done = planner.steps.filter(s => s.status === "done").length
  const progress = planner.steps.length ? Math.round((done / planner.steps.length) * 100) : 0

  const inputStyle = {
    backgroundColor: C.anthracite,
    border: `1px solid ${C.steel}`,
    color: C.white,
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
    width: "100%",
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* Cover bar */}
      <div className="h-32 relative" style={{ backgroundColor: planner.coverColor }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.05) 20px, rgba(0,0,0,0.05) 40px)" }} />
        <Link href={`/dashboard?id=${id}`}
          className="absolute top-4 left-5 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={14} /> Tableau de bord
        </Link>
        <div className="absolute top-3 right-5">
          <MomentoLogo iconSize={22} />
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 -mt-6 pb-24">

        {/* Title card */}
        <div className="rounded-2xl p-6 mb-6 shadow-sm" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: C.white }}>
            <InlineEdit value={planner.title} endpoint="/api/planners" id={planner.id} field="title" style={{ color: C.white }} />
          </h1>
          {planner.coupleNames && (
            <p className="text-sm mb-3" style={{ color: C.mist }}>
              <InlineEdit value={planner.coupleNames} endpoint="/api/planners" id={planner.id} field="coupleNames" style={{ color: C.mist }} />
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: C.mist }}>
            {planner.weddingDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {format(new Date(planner.weddingDate), "MMMM d, yyyy")}
              </span>
            )}
            {planner.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                <InlineEdit value={planner.location} endpoint="/api/planners" id={planner.id} field="location" style={{ color: C.mist }} />
              </span>
            )}
            {planner.budget && (
              <span className="font-semibold" style={{ color: C.silver }}>
                Budget : {planner.budget.toLocaleString()} €
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: C.mist }}>
              <span>{done} sur {planner.steps.length} étapes complètes</span>
              <span className="font-bold" style={{ color: C.silver }}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: C.accent }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ backgroundColor: C.dark }}>
          {(["steps", "calendar"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 text-sm font-medium py-2 rounded-lg transition-all"
              style={tab === t
                ? { backgroundColor: C.accent, color: C.ink }
                : { color: C.mist }}>
              {t === "steps" ? "Étapes" : "Calendrier"}
            </button>
          ))}
        </div>

        {/* STEPS TAB */}
        {tab === "steps" && (
          <div className="space-y-2">
            {planner.steps.length === 0 && (
              <div className="text-center py-12" style={{ color: C.mist }}>
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm">Aucune étape. Ajoutez votre première étape ci-dessous.</p>
              </div>
            )}

            {planner.steps.map(step => {
              const sc = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.todo
              return (
                <div key={step.id}
                  className="rounded-2xl p-4 transition-all"
                  style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                  <div className="flex items-start gap-3">
                    {/* Status toggle */}
                    <button onClick={() => cycleStatus(step.id, step.status)}
                      className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {sc.icon}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <InlineEdit value={step.title} endpoint="/api/steps" id={step.id} field="title"
                          className={`text-sm font-medium ${step.status === "done" ? "line-through opacity-50" : ""}`}
                          style={{ color: C.white }} />
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: C.anthracite, color: C.mist }}>
                          {CATEGORIES.find(c => c.value === step.category)?.label ?? step.category}
                        </span>
                      </div>

                      {step.dueDate && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: C.mist }}>
                          <Calendar size={10} />
                          Due {format(new Date(step.dueDate), "MMM d")}
                        </p>
                      )}

                      {step.vendors.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {step.vendors.map(sv => (
                            <div key={sv.id}
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                              style={{ backgroundColor: C.anthracite, color: C.silver, border: `1px solid ${C.steel}` }}>
                              <span className="font-medium">{sv.vendor.name}</span>
                              {sv.vendor.phone && (
                                <a href={`tel:${sv.vendor.phone}`} style={{ color: C.mist }}>
                                  <Phone size={10} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => suggestVendors(step)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: C.anthracite, color: C.accent, border: `1px solid ${C.steel}` }}>
                        <Sparkles size={11} /> Find
                      </button>
                      <button onClick={() => deleteStep(step.id)}
                        className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ color: C.steel }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add step */}
            <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
              <DialogTrigger
                render={
                  <button
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium py-4 rounded-2xl transition-all hover:opacity-80"
                    style={{ border: `2px dashed ${C.anthracite}`, color: C.mist, backgroundColor: "transparent" }}>
                    <Plus size={15} /> Ajouter une étape
                  </button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle style={{ color: C.white }}>Nouvelle étape</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <input
                    placeholder="Titre (ex. Réserver la salle)"
                    value={newStep.title}
                    onChange={e => setNewStep(s => ({ ...s, title: e.target.value }))}
                    style={inputStyle}
                  />
                  <select
                    value={newStep.category}
                    onChange={e => setNewStep(s => ({ ...s, category: e.target.value }))}
                    style={inputStyle}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value} style={{ backgroundColor: C.dark }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newStep.dueDate}
                    onChange={e => setNewStep(s => ({ ...s, dueDate: e.target.value }))}
                    style={inputStyle}
                  />
                  <button
                    onClick={addStep}
                    disabled={!newStep.title}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: C.terra, color: "#fff" }}>
                    Ajouter
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base" style={{ color: C.white }}>Événements & Échéances</h3>
              <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
                <DialogTrigger
                  render={
                    <button
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:opacity-80"
                      style={{ backgroundColor: C.terra, color: "#fff" }}>
                      <Plus size={13} /> Ajouter
                    </button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle style={{ color: C.white }}>Nouvel événement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-2">
                    <input
                      placeholder="Titre"
                      value={newEvent.title}
                      onChange={e => setNewEvent(v => ({ ...v, title: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={e => setNewEvent(v => ({ ...v, date: e.target.value }))}
                      style={inputStyle}
                    />
                    <select
                      value={newEvent.type}
                      onChange={e => setNewEvent(v => ({ ...v, type: e.target.value }))}
                      style={inputStyle}>
                      <option value="task" style={{ backgroundColor: C.dark }}>Tâche</option>
                      <option value="appointment" style={{ backgroundColor: C.dark }}>Rendez-vous</option>
                      <option value="deadline" style={{ backgroundColor: C.dark }}>Échéance</option>
                    </select>
                    <button
                      onClick={addEvent}
                      disabled={!newEvent.title || !newEvent.date}
                      className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: C.terra, color: "#fff" }}>
                      Ajouter
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {planner.events.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">📅</div>
                <p className="text-sm" style={{ color: C.mist }}>Aucun événement. Ajoutez des échéances et rendez-vous.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...planner.events]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(ev => (
                    <div key={ev.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl"
                      style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}` }}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: C.white }}>{ev.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.mist }}>
                          {format(new Date(ev.date), "EEEE, MMM d yyyy · HH:mm")}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg capitalize"
                        style={{ backgroundColor: C.dark, color: C.mist, border: `1px solid ${C.steel}` }}>
                        {ev.type}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Vendor Suggestions Dialog */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: C.white }}>
              <Sparkles size={15} style={{ color: C.accent }} />
              Suggestions — {activeStep?.title}
            </DialogTitle>
          </DialogHeader>
          {loadingSuggest ? (
            <div className="py-10 text-center" style={{ color: C.mist }}>
              <Sparkles className="mx-auto mb-3 animate-pulse" size={24} style={{ color: C.accent }} />
              <p className="text-sm">Recherche en cours…</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((v, i) => (
                <div key={i} className="rounded-xl p-3.5"
                  style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}` }}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: C.white }}>{v.name}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: C.mist }}>{v.category}</p>
                      {v.description && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: C.mist }}>{v.description}</p>}
                      {v.address && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: C.steel }}>
                          <MapPin size={9} />{v.address}
                        </p>
                      )}
                      {v.phone && (
                        <p className="text-xs flex items-center gap-1" style={{ color: C.steel }}>
                          <Phone size={9} />{v.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {v.priceRange && (
                        <span className="text-xs px-2 py-0.5 rounded-lg capitalize"
                          style={{ backgroundColor: C.dark, color: C.mist, border: `1px solid ${C.steel}` }}>
                          {v.priceRange}
                        </span>
                      )}
                      <button
                        onClick={() => linkVendor(v)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: C.terra, color: "#fff" }}>
                        + Lier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && !loadingSuggest && (
                <div className="text-center py-6">
                  <Star size={20} className="mx-auto mb-2" style={{ color: C.steel }} />
                  <p className="text-sm" style={{ color: C.mist }}>Aucune suggestion. Ajoutez votre clé Anthropic pour activer les recommandations IA.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
