"use client"

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

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
  const [inView, setInView] = useState(false)
  const reduced = usePrefersReducedMotion()
  // Reduced motion → révélé instantanément, sans observer
  const visible = inView || reduced

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { setInView(true); io.unobserve(e.target) }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

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
