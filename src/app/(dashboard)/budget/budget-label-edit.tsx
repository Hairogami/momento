"use client"
import { InlineEdit } from "@/components/InlineEdit"

export function BudgetLabelEdit({ id, label, paid }: { id: string; label: string; paid: boolean }) {
  return (
    <InlineEdit
      value={label}
      endpoint="/api/budget-items"
      id={id}
      field="label"
      placeholder="Libellé"
      className={paid ? "line-through text-muted-foreground" : ""}
    />
  )
}
