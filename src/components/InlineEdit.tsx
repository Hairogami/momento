"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface Props {
  value: string
  endpoint: string
  id: string
  field: string
  className?: string
  style?: React.CSSProperties
  placeholder?: string
}

export function InlineEdit({ value, endpoint, id, field, className, style, placeholder }: Props) {
  const [current, setCurrent] = useState(value)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedRef = useRef(value)

  useEffect(() => { setCurrent(value); setDraft(value); savedRef.current = value }, [value])
  useEffect(() => { if (editing) { ref.current?.focus(); ref.current?.select() } }, [editing])

  const save = useCallback(async (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || trimmed === savedRef.current) return
    savedRef.current = trimmed
    setCurrent(trimmed)
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: trimmed }),
    })
    if (!res.ok) {
      setCurrent(savedRef.current)
      setDraft(savedRef.current)
    }
  }, [endpoint, id, field])

  function handleChange(val: string) {
    setDraft(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => save(val), 800)
  }

  function handleBlur() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setEditing(false)
    save(draft)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={e => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === "Enter") { e.preventDefault(); handleBlur() }
          if (e.key === "Escape") { setEditing(false); setDraft(current) }
        }}
        className={className}
        style={{ ...style, background: "transparent", border: "none", outline: "none", padding: 0, margin: 0, minWidth: 0, width: "100%" }}
      />
    )
  }

  return (
    <span
      onClick={e => { e.stopPropagation(); setEditing(true) }}
      className={className}
      style={{ ...style, cursor: "text" }}
      title="Cliquer pour modifier"
    >
      {current || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
    </span>
  )
}
