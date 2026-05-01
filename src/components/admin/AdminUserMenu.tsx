"use client"
import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"

const C = {
  border:    "#252633",
  text:      "#f0f0f5",
  textMuted: "#9a9aaa",
  textDim:   "#6a6a78",
  panel:     "#13141c",
  accent:    "#9333EA",
  danger:    "#ef4444",
  bg:        "#0b0b10",
}

export default function AdminUserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "transparent", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "5px 10px", cursor: "pointer",
          color: C.textMuted, fontSize: "var(--text-xs)", fontFamily: "inherit",
        }}
      >
        <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </span>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "6px", minWidth: 180,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 100,
        }}>
          <Link
            href="/admin/profile"
            onClick={() => setOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 7, color: C.text,
              textDecoration: "none", fontSize: "var(--text-xs)", fontWeight: 500,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={8} r={4}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Mon profil
          </Link>

          <div style={{ height: 1, background: C.border, margin: "4px 0" }} />

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "8px 12px", borderRadius: 7, color: C.danger,
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "var(--text-xs)", fontWeight: 500, fontFamily: "inherit", textAlign: "left",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1={21} y1={12} x2={9} y2={12}/>
            </svg>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
