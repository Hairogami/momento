"use client"

import { useEffect, useState } from "react"
import { BUDGET_CATEGORIES, getCategory } from "@/lib/budgetCategories"
import BottomSheet from "@/components/mobile/BottomSheet"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

export interface BudgetExpenseValues {
  label: string
  category: string
  estimated: number
  actual?: number | null
  vendorId?: string | null
  paid?: boolean
}

interface BudgetExpenseModalProps {
  open: boolean
  /** Mode "add" pour création, "edit" pour modification d'un item existant. */
  mode: "add" | "edit"
  /** Valeurs initiales — pour mode "edit" ou pré-remplissage en "add". */
  initialValues?: Partial<BudgetExpenseValues>
  /**
   * Liste des prestataires du planner pour le dropdown vendor (optionnel).
   * Vide ou undefined → champ vendor masqué.
   * `id` = Vendor.id (CUID Prisma), utilisé comme valeur stockée dans BudgetItem.vendorId.
   */
  vendors?: { id: string; name: string; category?: string }[]
  onSubmit: (values: BudgetExpenseValues) => void | Promise<void>
  onCancel: () => void
  busy?: boolean
}

/**
 * Modal d'ajout/édition d'une dépense budget.
 *
 * UX : focus auto sur premier input, Enter submit, Escape cancel, backdrop click cancel.
 * Brand : tokens --dash-*, gradient G sur primary, dropdown catégorie depuis BUDGET_CATEGORIES.
 */
export function BudgetExpenseModal({
  open,
  mode,
  initialValues,
  vendors = [],
  onSubmit,
  onCancel,
  busy = false,
}: BudgetExpenseModalProps) {
  const [label, setLabel] = useState(initialValues?.label ?? "")
  const [category, setCategory] = useState(initialValues?.category ?? "divers")
  const [estimated, setEstimated] = useState(
    initialValues?.estimated != null ? String(initialValues.estimated) : ""
  )
  const [paid, setPaid] = useState(initialValues?.paid ?? false)
  const [vendorId, setVendorId] = useState<string | null>(initialValues?.vendorId ?? null)
  const [error, setError] = useState<string | null>(null)

  // Reset state quand le modal se rouvre avec de nouvelles valeurs
  useEffect(() => {
    if (open) {
      setLabel(initialValues?.label ?? "")
      setCategory(initialValues?.category ?? "divers")
      setEstimated(initialValues?.estimated != null ? String(initialValues.estimated) : "")
      setPaid(initialValues?.paid ?? false)
      setVendorId(initialValues?.vendorId ?? null)
      setError(null)
    }
  }, [open, initialValues])

  // Escape pour fermer
  // ESC + body scroll lock gérés par BottomSheet wrapper.

  if (!open) return null

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    const trimmedLabel = label.trim()
    const amount = parseFloat(estimated)
    if (!trimmedLabel) {
      setError("Le libellé est requis.")
      return
    }
    if (!isFinite(amount) || amount <= 0) {
      setError("Le montant doit être un nombre positif.")
      return
    }
    await onSubmit({
      label: trimmedLabel,
      category,
      estimated: amount,
      paid,
      vendorId: vendorId || null,
    })
  }

  const cat = getCategory(category)

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
    background: "var(--dash-surface, #fff)",
    color: "var(--dash-text, #121317)",
    fontSize: "var(--text-sm)",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--dash-text-2, #6a6a71)",
    marginBottom: 6,
    display: "block",
  }

  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      title={mode === "add" ? "Nouvelle dépense" : "Modifier la dépense"}
      maxWidth={480}
      ariaLabelledBy="expense-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "clamp(16px, 4vw, 24px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${cat.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              className="clone-gs-icon"
              style={{
                fontFamily: "'Google Symbols','Material Symbols Outlined'",
                fontSize: 20,
                color: cat.color,
              }}
            >
              {cat.icon}
            </span>
          </div>
          <span
            id="expense-modal-title"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--dash-text-2, #6a6a71)",
            }}
          >
            Catégorie : {cat.label}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label htmlFor="exp-label" style={labelStyle}>Libellé <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              id="exp-label"
              type="text"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex : Photographe — acompte"
              maxLength={200}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="exp-category" style={labelStyle}>Catégorie <span style={{ color: "#ef4444" }}>*</span></label>
            <select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exp-amount" style={labelStyle}>Montant (Dhs) <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              id="exp-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>

          <label
            htmlFor="exp-paid"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              userSelect: "none",
              padding: "4px 0",
            }}
          >
            <input
              id="exp-paid"
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: "var(--g1, #E11D48)", cursor: "pointer" }}
            />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--dash-text, #121317)" }}>
              Payé
            </span>
          </label>

          {vendors.length > 0 && (
            <div>
              <label htmlFor="exp-vendor" style={labelStyle}>Prestataire (optionnel)</label>
              <select
                id="exp-vendor"
                value={vendorId ?? ""}
                onChange={(e) => setVendorId(e.target.value || null)}
                style={inputStyle}
              >
                <option value="">— Non attribué —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}{v.category ? ` · ${v.category}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: "var(--text-xs)", color: "#ef4444", margin: "12px 0 0", fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: "var(--dash-faint, rgba(183,191,217,0.07))",
              color: "var(--dash-text-2, #6a6a71)",
              border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: busy ? "var(--dash-faint-2, rgba(183,191,217,0.18))" : G,
              color: "#fff",
              border: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: busy ? "none" : "0 2px 8px color-mix(in srgb, var(--g1) 25%, transparent)",
            }}
          >
            {busy ? "Enregistrement…" : mode === "add" ? "Ajouter" : "Enregistrer"}
          </button>
        </div>

        <style jsx>{`
          input:focus, select:focus {
            outline: 2px solid var(--g1, #E11D48);
            outline-offset: 1px;
          }
        `}</style>
      </form>
    </BottomSheet>
  )
}
