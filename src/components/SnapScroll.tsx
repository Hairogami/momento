"use client"

import { useEffect, useRef, type ReactNode } from "react"

export default function SnapScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const sections = el.querySelectorAll<HTMLElement>("[data-snap-section]")

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.setAttribute("data-visible", "true")
        })
      },
      { root: el, threshold: 0.35 }
    )

    sections.forEach(s => obs.observe(s))

    // Hero is immediately visible on load
    if (sections[0]) sections[0].setAttribute("data-visible", "true")

    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="snap-scroll-container">
      {children}
    </div>
  )
}
