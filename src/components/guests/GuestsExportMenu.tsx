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
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          fontSize: "clamp(12px, 0.9vw, 13px)",
          fontWeight: 600,
          background: "var(--dash-surface, #fff)",
          color: "var(--dash-text, #121317)",
          border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
          borderRadius: 10,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ fontSize: 14 }}>⬇</span>
        <span>Exporter</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 30,
            minWidth: 180,
            overflow: "hidden",
            padding: 4,
          }}
        >
          <Item icon="📄" onClick={() => dl("csv")}>CSV</Item>
          <Item icon="📊" onClick={() => dl("xlsx")}>Excel (.xlsx)</Item>
          <Item icon="🖨" onClick={printPdf}>PDF (imprimer)</Item>
        </div>
      )}
    </div>
  )
}

function Item({ icon, children, onClick }: { icon: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 12px",
        fontSize: "clamp(12px, 0.9vw, 13px)",
        textAlign: "left",
        background: "transparent",
        color: "var(--dash-text, #121317)",
        border: "none",
        cursor: "pointer",
        borderRadius: 8,
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--dash-faint, rgba(183,191,217,0.10))" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{children}</span>
    </button>
  )
}
