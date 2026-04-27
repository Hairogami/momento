"use client"
import { useEffect, useState } from "react"

const CITATIONS_LIST = [
  { text: "L'amour ne se regarde pas l'un l'autre, il regarde ensemble dans la même direction.", author: "Antoine de Saint-Exupéry" },
  { text: "Un beau mariage, c'est l'union de deux bons pardonneurs.", author: "Ruth Bell Graham" },
  { text: "Le bonheur se multiplie quand il se partage.", author: "Proverbe marocain" },
  { text: "La vie sans amour est comme un arbre sans fleurs ni fruits.", author: "Khalil Gibran" },
  { text: "Aimer, c'est trouver sa richesse en l'autre.", author: "Abbé Huvelin" },
  { text: "Que ton mariage soit le début d'une belle histoire.", author: "Momento" },
  { text: "Le plus grand bonheur de la vie, c'est d'être aimé pour ce que l'on est.", author: "Victor Hugo" },
]

// WIDGET-CONTRACT : data = static, source = constant array, no empty/loading/write.
export default function CitationWidget() {
  const [i, setI] = useState(() => new Date().getDay() % CITATIONS_LIST.length)
  const citation = CITATIONS_LIST[i]
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % CITATIONS_LIST.length), 12000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
      <div style={{ fontSize: "var(--text-lg)" }}>✨</div>
      <blockquote style={{ margin: 0, fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--dash-text,#121317)", lineHeight: 1.65, textAlign: "center", fontFamily: "var(--font-cormorant,serif)" }}>
        &ldquo;{citation.text}&rdquo;
      </blockquote>
      <p style={{ margin: 0, fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center" }}>— {citation.author}</p>
      <div style={{ display: "flex", gap: 4 }}>
        {CITATIONS_LIST.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            style={{ width: idx === i ? 16 : 6, height: 6, borderRadius: 99, border: "none", cursor: "pointer", transition: "all 0.3s", background: idx === i ? "var(--g1,#E11D48)" : "var(--dash-faint,rgba(183,191,217,0.3))", padding: 0 }} />
        ))}
      </div>
    </div>
  )
}
