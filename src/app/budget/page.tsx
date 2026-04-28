"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import DashboardShell from "@/components/dashboard/DashboardShell"
import { usePlanners } from "@/hooks/usePlanners"
import { ToastProvider, useToast } from "@/components/Toast"
import { BudgetExpenseModal, type BudgetExpenseValues } from "@/components/budget/BudgetExpenseModal"
import { DeleteConfirmModal } from "@/components/budget/DeleteConfirmModal"
import { getCategory } from "@/lib/budgetCategories"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

interface BudgetItem {
  id: string
  label: string
  category: string
  estimated: number
  actual: number | null
  paid: boolean
  vendorId: string | null
  plannerId: string
  createdAt: string
}

type ModalState =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "edit"; item: BudgetItem }
  | { kind: "delete"; item: BudgetItem }

function DonutChart({ segments, size = 120 }: { segments: { pct: number; color: string }[]; size?: number }) {
  const r = 44
  const cx = 60
  const cy = 60
  const circ = 2 * Math.PI * r
  let offset = -90
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dash-faint-2,rgba(183,191,217,0.12))" strokeWidth={14} />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ
        const gap = circ - dash
        const rot = offset
        offset += (s.pct / 100) * 360
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-(rot / 360) * circ}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          />
        )
      })}
    </svg>
  )
}

function BudgetPageInner() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const toast = useToast()

  const [budgetTotal, setBudgetTotal] = useState<number>(0)
  const [items, setItems] = useState<BudgetItem[]>([])
  const [vendors, setVendors] = useState<{ id: string; name: string; category?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({ kind: "none" })
  const [submitting, setSubmitting] = useState(false)

  /** Fetch initial budget total + items + vendors à chaque changement d'event. */
  useEffect(() => {
    if (!activeEventId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/planners/${activeEventId}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/planners/${activeEventId}/budget-items`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/planners/${activeEventId}/vendors`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(
        ([planner, fetchedItems, fetchedVendors]: [
          { budget?: number | null } | null,
          BudgetItem[],
          Array<{ vendor: { id: string; name: string; category: string } }>,
        ]) => {
          if (cancelled) return
          setBudgetTotal(typeof planner?.budget === "number" ? planner.budget : 0)
          setItems(Array.isArray(fetchedItems) ? fetchedItems : [])
          setVendors(
            Array.isArray(fetchedVendors)
              ? fetchedVendors.map((pv) => ({
                  id: pv.vendor.id,
                  name: pv.vendor.name,
                  category: pv.vendor.category,
                }))
              : []
          )
        }
      )
      .catch(() => {
        if (!cancelled) toast.show("Impossible de charger le budget", "error")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeEventId, toast])

  const handleEventChange = useCallback(
    (id: string) => {
      setActiveEventId(id)
      try {
        localStorage.setItem("momento_active_event", id)
      } catch {}
    },
    [setActiveEventId]
  )

  /** ADD — optimistic POST */
  const handleAdd = useCallback(
    async (values: BudgetExpenseValues) => {
      if (!activeEventId) return
      setSubmitting(true)
      const tempId = `tmp-${Date.now()}`
      const optimistic: BudgetItem = {
        id: tempId,
        label: values.label,
        category: values.category,
        estimated: values.estimated,
        actual: null,
        paid: values.paid ?? false,
        vendorId: values.vendorId ?? null,
        plannerId: activeEventId,
        createdAt: new Date().toISOString(),
      }
      setItems((prev) => [optimistic, ...prev])
      setModal({ kind: "none" })

      try {
        const res = await fetch(`/api/planners/${activeEventId}/budget-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created: BudgetItem = await res.json()
        setItems((prev) => prev.map((i) => (i.id === tempId ? created : i)))
        toast.show("✓ Dépense enregistrée", "success")
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== tempId))
        toast.show("Erreur lors de l'enregistrement", "error")
      } finally {
        setSubmitting(false)
      }
    },
    [activeEventId, toast]
  )

  /** EDIT — optimistic PATCH */
  const handleEdit = useCallback(
    async (id: string, values: BudgetExpenseValues) => {
      if (!activeEventId) return
      setSubmitting(true)
      const backup = items.find((i) => i.id === id)
      if (!backup) return
      const optimistic: BudgetItem = {
        ...backup,
        label: values.label,
        category: values.category,
        estimated: values.estimated,
        vendorId: values.vendorId ?? null,
      }
      setItems((prev) => prev.map((i) => (i.id === id ? optimistic : i)))
      setModal({ kind: "none" })

      try {
        const res = await fetch(`/api/planners/${activeEventId}/budget-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const updated: BudgetItem = await res.json()
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
        toast.show("✓ Dépense mise à jour", "success")
      } catch {
        setItems((prev) => prev.map((i) => (i.id === id ? backup : i)))
        toast.show("Erreur lors de la mise à jour", "error")
      } finally {
        setSubmitting(false)
      }
    },
    [activeEventId, items, toast]
  )

  /** TOGGLE PAID — optimistic PATCH */
  const handleTogglePaid = useCallback(
    async (id: string) => {
      if (!activeEventId) return
      const item = items.find((i) => i.id === id)
      if (!item) return
      const newPaid = !item.paid
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, paid: newPaid } : i)))
      try {
        const res = await fetch(`/api/planners/${activeEventId}/budget-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid: newPaid }),
        })
        if (!res.ok) throw new Error()
      } catch {
        setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
        toast.show("Erreur — état non sauvé", "error")
      }
    },
    [activeEventId, items, toast]
  )

  /** DELETE — optimistic DELETE après confirmation */
  const handleDelete = useCallback(async () => {
    if (!activeEventId || modal.kind !== "delete") return
    const item = modal.item
    setSubmitting(true)
    const backup = item
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setModal({ kind: "none" })

    try {
      const res = await fetch(`/api/planners/${activeEventId}/budget-items/${item.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.show("✓ Dépense supprimée", "success")
    } catch {
      setItems((prev) => [...prev, backup])
      toast.show("Erreur lors de la suppression", "error")
    } finally {
      setSubmitting(false)
    }
  }, [activeEventId, modal, toast])

  // ─── Computed ───────────────────────────────────────────────────────────────

  const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0] ?? { id: "", name: "", date: "", color: "#E11D48" }

  const spent = useMemo(() => items.reduce((s, i) => s + i.estimated, 0), [items])
  const paidTotal = useMemo(() => items.filter((i) => i.paid).reduce((s, i) => s + i.estimated, 0), [items])
  const pct = budgetTotal > 0 ? Math.min(100, Math.round((spent / budgetTotal) * 100)) : 0

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) map.set(i.category, (map.get(i.category) ?? 0) + i.estimated)
    return Array.from(map.entries())
      .map(([id, amount]) => ({ id, amount, cat: getCategory(id) }))
      .sort((a, b) => b.amount - a.amount)
  }, [items])

  const segments = useMemo(
    () =>
      categories.map((c) => ({
        pct: spent > 0 ? (c.amount / spent) * 100 : 0,
        color: c.cat.color,
      })),
    [categories, spent]
  )

  /**
   * Groupage des items par prestataire. Items sans vendorId → groupe "Non attribué".
   * Trié par montant total décroissant.
   */
  const byVendor = useMemo(() => {
    const map = new Map<string, { key: string; vendorName: string; items: BudgetItem[]; total: number }>()
    for (const item of items) {
      const key = item.vendorId ?? "__none__"
      const vendorName = item.vendorId
        ? (vendors.find((v) => v.id === item.vendorId)?.name ?? "Prestataire supprimé")
        : "Non attribué"
      const existing = map.get(key) ?? { key, vendorName, items: [], total: 0 }
      existing.items.push(item)
      existing.total += item.estimated
      map.set(key, existing)
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [items, vendors])

  const fmt = (n: number) => n.toLocaleString("fr-MA") + " Dhs"

  const summaryCards = [
    { label: "Budget total", value: fmt(budgetTotal), accent: "var(--dash-text-2, #6a6a71)" },
    { label: "Dépensé", value: fmt(spent), accent: "var(--g1, #E11D48)" },
    { label: "Payé", value: fmt(paidTotal), accent: "#22c55e" },
    { label: "Restant", value: fmt(budgetTotal - spent), accent: "var(--g2, #9333EA)" },
  ]

  return (
    <DashboardShell events={events} activeEventId={activeEventId} onEventChange={handleEventChange}>
      <main
        className="pb-20 md:pb-0"
        style={{ flex: 1, padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px) 64px", overflowY: "auto" }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(1.3rem,2vw,1.7rem)",
                fontWeight: 800,
                color: "var(--dash-text,#121317)",
                letterSpacing: "-0.03em",
                margin: "0 0 4px",
              }}
            >
              Budget
            </h1>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--dash-text-2,#6a6a71)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: activeEvent.color,
                  display: "inline-block",
                }}
              />
              {activeEvent.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: "add" })}
            disabled={!activeEventId || loading}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              background: G,
              color: "#fff",
              border: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: activeEventId && !loading ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--g1) 25%, transparent)",
              opacity: activeEventId && !loading ? 1 : 0.6,
            }}
          >
            + Ajouter une dépense
          </button>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {summaryCards.map((c) => (
            <div
              key={c.label}
              style={{
                background: "var(--dash-surface,#fff)",
                borderRadius: 16,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
                boxShadow: "var(--shadow-card, 0 1px 6px rgba(0,0,0,0.04))",
                padding: "18px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-2xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--dash-text-3,#9a9aaa)",
                  margin: "0 0 6px",
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  fontSize: "var(--text-md)",
                  fontWeight: 800,
                  color: c.accent,
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div
          style={{
            marginBottom: 32,
            background: "var(--dash-surface,#fff)",
            borderRadius: 16,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
            boxShadow: "var(--shadow-card, 0 1px 6px rgba(0,0,0,0.04))",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--dash-text,#121317)" }}>
              Consommation budgétaire
            </span>
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: pct > 80 ? "var(--g1, #E11D48)" : "var(--dash-text,#121317)",
              }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "var(--dash-faint-2,rgba(183,191,217,0.12))",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: pct > 80 ? "linear-gradient(90deg,#f59e0b,var(--g1,#E11D48))" : G,
                borderRadius: 999,
                transition: "width 0.5s",
              }}
            />
          </div>
          {pct > 80 && (
            <p style={{ fontSize: "var(--text-xs)", color: "#f59e0b", margin: "8px 0 0", fontWeight: 600 }}>
              ⚠ Attention — budget presque épuisé
            </p>
          )}
        </div>

        {/* Two columns: donut + expense list */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Donut + legend */}
          <div
            style={{
              background: "var(--dash-surface,#fff)",
              borderRadius: 18,
              border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
              boxShadow: "var(--shadow-elevated, 0 2px 12px rgba(0,0,0,0.05))",
              padding: "20px 24px",
              minWidth: 240,
            }}
          >
            <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 16px" }}>
              Répartition par catégorie
            </p>
            {categories.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "var(--space-lg, 24px) 0", margin: 0 }}>
                Aucune dépense
              </p>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <DonutChart segments={segments} size={120} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                  {categories.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: c.cat.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)" }}>{c.cat.label}</span>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          color: "var(--dash-text,#121317)",
                          marginLeft: "auto",
                        }}
                      >
                        {spent > 0 ? Math.round((c.amount / spent) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Expense list */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              background: "var(--dash-surface,#fff)",
              borderRadius: 18,
              border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
              boxShadow: "var(--shadow-elevated, 0 2px 12px rgba(0,0,0,0.05))",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.10))" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                Détail des dépenses
              </p>
            </div>
            {loading && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "32px 0", margin: 0 }}>
                Chargement…
              </p>
            )}
            {!loading && items.length === 0 && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "32px 0", margin: 0 }}>
                Aucune dépense enregistrée — clique sur « + Ajouter une dépense »
              </p>
            )}
            {!loading &&
              items.map((item, i) => {
                const cat = getCategory(item.category)
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 20px",
                      borderBottom:
                        i < items.length - 1 ? "1px solid var(--dash-divider,rgba(183,191,217,0.10))" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: `${cat.color}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color }} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "edit", item })}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: "var(--dash-text,#121317)",
                          margin: "0 0 2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: "var(--text-2xs)",
                          color: "var(--dash-text-3,#9a9aaa)",
                          margin: 0,
                        }}
                      >
                        {cat.label} · {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </button>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 700,
                        color: "var(--dash-text,#121317)",
                        flexShrink: 0,
                      }}
                    >
                      {item.estimated.toLocaleString("fr-MA")} Dhs
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePaid(item.id)}
                      aria-label={item.paid ? "Marquer comme en attente" : "Marquer comme payé"}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "var(--text-2xs)",
                        fontWeight: 600,
                        fontFamily: "inherit",
                        background: item.paid ? "rgba(34,197,94,0.12)" : "var(--dash-faint,rgba(183,191,217,0.07))",
                        color: item.paid ? "#22c55e" : "var(--dash-text-3,#9a9aaa)",
                        flexShrink: 0,
                      }}
                    >
                      {item.paid ? "✓ Payé" : "En attente"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "delete", item })}
                      aria-label="Supprimer la dépense"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--dash-text-3,#9a9aaa)",
                        padding: 4,
                        flexShrink: 0,
                        fontFamily: "inherit",
                        fontSize: 16,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Répartition par prestataire */}
        <div
          style={{
            marginTop: 24,
            background: "var(--dash-surface,#fff)",
            borderRadius: 18,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
            boxShadow: "var(--shadow-elevated, 0 2px 12px rgba(0,0,0,0.05))",
            padding: "20px 24px",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 16px" }}>
            Répartition par prestataire
          </p>

          {byVendor.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "var(--space-lg, 24px) 0", margin: 0 }}>
              Aucune dépense — assigne un prestataire à tes dépenses pour voir la répartition ici
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {byVendor.map((group) => {
                const pctOfTotal = spent > 0 ? Math.round((group.total / spent) * 100) : 0
                return (
                  <div
                    key={group.key}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "var(--dash-faint, rgba(183,191,217,0.07))",
                      border: "1px solid var(--dash-divider, rgba(183,191,217,0.10))",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: group.key === "__none__" ? "var(--dash-text-3, #9a9aaa)" : "var(--dash-text, #121317)",
                          fontStyle: group.key === "__none__" ? "italic" : "normal",
                        }}
                      >
                        {group.vendorName} <span style={{ color: "var(--dash-text-3, #9a9aaa)", fontWeight: 400 }}>({group.items.length})</span>
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          color: "var(--dash-text, #121317)",
                        }}
                      >
                        {group.total.toLocaleString("fr-MA")} Dhs
                        <span style={{ marginLeft: 8, fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3, #9a9aaa)" }}>
                          {pctOfTotal}%
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: "var(--dash-faint-2, rgba(183,191,217,0.18))",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pctOfTotal}%`,
                          height: "100%",
                          background: group.key === "__none__" ? "var(--dash-text-3, #9a9aaa)" : G,
                          transition: "width 0.4s",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <BudgetExpenseModal
        open={modal.kind === "add"}
        mode="add"
        vendors={vendors}
        onSubmit={handleAdd}
        onCancel={() => setModal({ kind: "none" })}
        busy={submitting}
      />
      <BudgetExpenseModal
        open={modal.kind === "edit"}
        mode="edit"
        vendors={vendors}
        initialValues={
          modal.kind === "edit"
            ? {
                label: modal.item.label,
                category: modal.item.category,
                estimated: modal.item.estimated,
                vendorId: modal.item.vendorId,
              }
            : undefined
        }
        onSubmit={async (v) => {
          if (modal.kind === "edit") await handleEdit(modal.item.id, v)
        }}
        onCancel={() => setModal({ kind: "none" })}
        busy={submitting}
      />
      <DeleteConfirmModal
        open={modal.kind === "delete"}
        title="Supprimer cette dépense ?"
        description={modal.kind === "delete" ? `« ${modal.item.label} » sera retirée définitivement de ce budget.` : undefined}
        onConfirm={handleDelete}
        onCancel={() => setModal({ kind: "none" })}
        busy={submitting}
      />
    </DashboardShell>
  )
}

export default function BudgetPage() {
  return (
    <ToastProvider>
      <BudgetPageInner />
    </ToastProvider>
  )
}
