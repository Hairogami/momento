"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import NavAuthButtons from "@/components/NavAuthButtons"
import { MomentoLogo } from "@/components/MomentoLogo"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)

  useEffect(() => {
    let ticking = false
    const fn = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 10); ticking = false })
        ticking = true
      }
    }
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled ? {
        backgroundColor: `${C.ink}F2`,
        backdropFilter: "blur(20px)",
        borderBottom: `0.5px solid ${C.anthracite}`,
      } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <MomentoLogo iconSize={34} />

        <div className="hidden md:flex items-center gap-8" style={{ color: C.mist }}>
          {[
            { href: "#explore", label: "Explorer" },
            { href: "#how",     label: "Comment ça marche" },
            { href: "/prestataires", label: "Prestataires" },
          ].map(({ href, label }) => (
            <a key={label} href={href}
              className="text-xs tracking-widest uppercase hover:opacity-100 transition-opacity"
              style={{ letterSpacing: "0.16em", opacity: 0.7 }}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          <NavAuthButtons />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <DarkModeToggle />
          <button className="p-2 rounded-lg" onClick={() => setMenuOpen(o => !o)} style={{ color: C.white }} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3"
          style={{ backgroundColor: C.dark, borderTop: `0.5px solid ${C.anthracite}` }}>
          <a href="#explore"    className="text-xs tracking-widest uppercase py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Explorer</a>
          <a href="#how"        className="text-xs tracking-widest uppercase py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <Link href="/prestataires" className="text-xs tracking-widest uppercase py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Prestataires</Link>
          <NavAuthButtons mobile />
        </div>
      )}
    </nav>
  )
}
