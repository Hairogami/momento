"use client"

import { useEffect, useRef, useState } from "react"

type Props = { plannerId: string }

export function GuestsExportMenu({ plannerId }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const dl = (format: "csv" | "xlsx") => {
    window.location.href = `/api/planners/${plannerId}/guests/export?format=${format}`
    setOpen(false)
  }
  const printPdf = () => {
    window.print()
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: "relative" }} className="no-print">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "var(--space-2) var(--space-3)",
          fontSize: "var(--text-sm)",
          background: "var(--dash-surface-2)",
          color: "var(--dash-text-1)",
          border: "1px solid var(--dash-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
        }}
      >
        ⬇ Exporter
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "var(--dash-surface-1)",
            border: "1px solid var(--dash-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            zIndex: 10,
            minWidth: 160,
            overflow: "hidden",
          }}
        >
          <Item onClick={() => dl("csv")}>CSV</Item>
          <Item onClick={() => dl("xlsx")}>Excel (.xlsx)</Item>
          <Item onClick={printPdf}>PDF (imprimer)</Item>
        </div>
      )}
    </div>
  )
}

function Item({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-sm)",
        textAlign: "left",
        background: "transparent",
        color: "var(--dash-text-1)",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
