"use client"
import { useEffect, useState } from "react"

// WIDGET-CONTRACT (cf. .claude/rules/widget-contract.md) :
// 1. data : texte libre (string)
// 2. source : localStorage[storageKey] — préférence UI per-event, pas de DB
// 3. empty state : pas pertinent (textarea vide est l'état initial)
// 4. loading : skeleton tant que localStorage n'est pas hydraté (SSR-safe)
// 5. write : save direct dans localStorage à chaque keystroke
export default function NotesWidget({ storageKey }: { storageKey: string }) {
  const [text, setText] = useState("")
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try { setText(localStorage.getItem(storageKey) ?? "") } catch {}
    setLoaded(true)
  }, [storageKey])
  function save(val: string) {
    setText(val)
    try { localStorage.setItem(storageKey, val) } catch {}
  }
  if (!loaded) return null
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <textarea
        value={text}
        onChange={e => save(e.target.value)}
        placeholder="Écrivez vos notes ici…"
        style={{
          flex: 1, width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", fontFamily: "inherit",
          fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--dash-text,#121317)",
          caretColor: "var(--g1,#E11D48)",
        }}
      />
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "right", marginTop: 4 }}>
        {text.length} car.
      </div>
    </div>
  )
}
