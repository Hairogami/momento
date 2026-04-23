"use client"

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"

type Props = {
  children: ReactNode
  delay?: number  // ms
  as?: "div" | "section"
  id?: string
  style?: CSSProperties
  /** distance de translate en px — par défaut 24 */
  distance?: number
}

/**
 * Wrapper qui révèle son contenu en fade-in + translate-up quand il entre dans
 * le viewport. Respecte prefers-reduced-motion (révèle instantanément).
 */
export default function Reveal({ children, delay = 0, as = "div", id, style, distance = 24 }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)

    const el = ref.current
    if (!el) return

    if (mq.matches) { setVisible(true); return }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { setVisible(true); io.unobserve(e.target) }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const computed: CSSProperties = {
    ...style,
    opacity: visible || reduced ? 1 : 0,
    transform: visible || reduced ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reduced ? undefined : `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    willChange: reduced ? undefined : "opacity, transform",
  }

  if (as === "section") {
    return <section ref={ref as React.RefObject<HTMLElement>} id={id} style={computed}>{children}</section>
  }
  return <div ref={ref as React.RefObject<HTMLDivElement>} id={id} style={computed}>{children}</div>
}
