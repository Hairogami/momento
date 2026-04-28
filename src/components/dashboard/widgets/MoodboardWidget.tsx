"use client"
import { useRef, useState } from "react"

// WIDGET-CONTRACT :
// 1. data : array of 6 string|null (data:url images)
// 2. source : localStorage[moodboard_images_${eventId}] — décor purement UI,
//    pas la peine de pousser en DB pour le MVP
// 3. empty state : slots vides avec "+", visuel suffit
// 4. loading : useState init synchrone localStorage (lazy initializer)
// 5. write : setItem direct
export default function MoodboardWidget({ eventId }: { eventId: string }) {
  const MOODBOARD_KEY = `moodboard_images_${eventId}`
  const [images, setImages] = useState<(string | null)[]>(() => {
    try { const s = localStorage.getItem(MOODBOARD_KEY); return s ? JSON.parse(s) : Array(6).fill(null) } catch { return Array(6).fill(null) }
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const slotRef = useRef<number | null>(null)

  function handleSlotClick(i: number) {
    if (images[i]) return
    slotRef.current = i
    fileRef.current?.click()
  }

  async function compressImage(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = ev => res(ev.target?.result as string)
      r.onerror = rej
      r.readAsDataURL(file)
    })
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = dataUrl
    })
    const MAX = 800
    const scale = Math.min(1, MAX / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL("image/jpeg", 0.7)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || slotRef.current === null) return
    const slot = slotRef.current
    e.target.value = ""
    slotRef.current = null
    try {
      const compressed = await compressImage(file)
      setImages(prev => {
        const next = [...prev]
        next[slot] = compressed
        try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)) }
        catch (err) { console.error("Moodboard localStorage quota exceeded:", err) }
        return next
      })
    } catch (err) {
      console.error("Moodboard image compression failed:", err)
    }
  }

  function removeImage(i: number) {
    setImages(prev => {
      const next = [...prev]
      next[i] = null
      try { localStorage.setItem(MOODBOARD_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} onClick={() => handleSlotClick(i)} style={{
            borderRadius: 8, overflow: "hidden", position: "relative", cursor: images[i] ? "default" : "pointer",
            background: images[i] ? "transparent" : "var(--dash-faint,rgba(183,191,217,0.1))",
            border: images[i] ? "none" : "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))",
            display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1",
          }}>
            {images[i] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={e => { e.stopPropagation(); removeImage(i) }} style={{
                  position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer",
                  fontSize: "var(--text-2xs)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </>
            ) : (
              <span style={{ fontSize: "var(--text-md)", opacity: 0.25 }}>+</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
