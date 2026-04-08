"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { useSessionUser } from "@/components/SessionProvider"
import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/ThemeProvider"
import { PaletteSelector } from "@/components/PaletteSelector"
import { C } from "@/lib/colors"

export default function NavAuthButtons({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter()
  const user = useSessionUser()
  const [open, setOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("momento_avatar")
    if (stored) {
      setAvatar(stored)
    } else if (user?.image) {
      // Seed from OAuth provider image (Discord/GitHub/Google)
      setAvatar(user.image)
      localStorage.setItem("momento_avatar", user.image)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.image])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  if (user) {
    const displayName = user.username ?? user.firstName ?? user.email.split("@")[0]
    const initials = displayName[0].toUpperCase()

    if (mobile) {
      return (
        <div className="flex flex-col gap-2 pt-1">
          <Link href="/dashboard" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            Mes projets
          </Link>
          <Link href="/favorites" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            Mes favoris
          </Link>
          <Link href="/profile" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            Mon profil
          </Link>
          <Link href="/profile?tab=compte" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            Paramètres
          </Link>
          <Link href="/prestataire/dashboard" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.terra }}>
            Espace partenaire
          </Link>
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ backgroundColor: C.anthracite }}>
            <span className="text-sm font-medium" style={{ color: C.white }}>Mode sombre</span>
            <ThemeToggle />
          </div>
          <button onClick={handleLogout}
            className="text-sm font-medium py-2.5 px-4 rounded-xl text-left"
            style={{ backgroundColor: C.anthracite, color: C.terra }}>
            Déconnexion
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        {/* Mes projets */}
        <Link
          href="/dashboard"
          className="hidden sm:block text-sm font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-70"
          style={{ color: C.white }}
        >
          Mes projets
        </Link>

        {/* Airbnb-style pill — border, shadow on hover */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
            style={{
              backgroundColor: C.ink,
              border: `1px solid ${C.anthracite}`,
              boxShadow: open ? "rgba(0,0,0,0.12) 0px 2px 8px" : "none",
              color: C.white,
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.12) 0px 2px 8px")}
            onMouseLeave={e => { if (!open) e.currentTarget.style.boxShadow = "none" }}
          >
            <Menu size={16} strokeWidth={2.5} />
            {avatar ? (
              <img
                src={avatar}
                alt={initials}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: "#717171", color: "#fff" }}
              >
                {initials}
              </span>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-xl"
              style={{
                backgroundColor: C.ink,
                border: `1px solid ${C.anthracite}`,
                minWidth: 220,
              }}
            >
              {/* Top section — high-traffic */}
              <Link href="/messages" onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 text-sm font-semibold hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Messages
              </Link>
              <Link href="/notifications" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3.5 text-sm font-semibold hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Notifications
              </Link>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Mid section — account */}
              <Link href="/favorites" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Mes favoris
              </Link>
              <Link href="/profile" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Mon profil
              </Link>
              <Link href="/profile?tab=compte" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Paramètres
              </Link>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Bottom section */}
              <Link href="/prestataire/dashboard" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-semibold hover:bg-black/5 transition-colors"
                style={{ color: C.terra }}>
                Espace partenaire
              </Link>
              <Link href="/help" onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                Aide
              </Link>
              <div className="flex items-center justify-between px-4 py-3 text-sm hover:bg-black/5 transition-colors">
                <span style={{ color: C.white }}>Mode sombre</span>
                <ThemeToggle />
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.terra }}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Not logged in — hamburger menu accessible à tous
  return <GuestMenu mobile={mobile} />
}

function GuestMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  if (mobile) {
    return (
      <div className="flex flex-col gap-2 pt-1">
        <Link href="/explore" className="flex items-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl" style={{ backgroundColor: C.anthracite, color: C.white }}>
          🔍 Explorer les prestataires
        </Link>
        <Link href="/favorites" className="flex items-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl" style={{ backgroundColor: C.anthracite, color: C.white }}>
          ❤️ Favoris
        </Link>
        <Link href="/help" className="flex items-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl" style={{ backgroundColor: C.anthracite, color: C.white }}>
          💬 Aide
        </Link>
        <Link href="/prestataire/dashboard" className="flex items-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl" style={{ backgroundColor: C.anthracite, color: C.terra }}>
          🤝 Espace partenaire
        </Link>
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.anthracite }}>
          <PaletteSelector />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ backgroundColor: C.anthracite }}>
          <span className="text-sm font-medium" style={{ color: C.white }}>Mode sombre</span>
          <ThemeToggle />
        </div>
        <div className="flex gap-3 pt-1">
          <Link href="/login" className="flex-1 text-sm font-medium text-center py-2.5 rounded-xl" style={{ backgroundColor: C.anthracite, color: C.white }}>
            Connexion
          </Link>
          <Link href="/event/new" className="flex-1 text-sm font-bold text-center py-2.5 rounded-xl" style={{ backgroundColor: C.terra, color: "#fff" }}>
            Commencer →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login"
        className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-70"
        style={{ color: C.mist }}>
        Connexion
      </Link>
      <Link href="/event/new"
        className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
        style={{ backgroundColor: C.terra, color: "#fff" }}>
        Créer un événement
      </Link>

      {/* Hamburger menu — visible même sans compte */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
          style={{
            backgroundColor: C.ink,
            border: `1px solid ${C.anthracite}`,
            boxShadow: open ? "rgba(0,0,0,0.12) 0px 2px 8px" : "none",
            color: C.white,
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.12) 0px 2px 8px")}
          onMouseLeave={e => { if (!open) e.currentTarget.style.boxShadow = "none" }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-xl"
            style={{ backgroundColor: C.ink, border: `1px solid ${C.anthracite}`, minWidth: 260 }}
          >
            <Link href="/explore" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold hover:bg-black/5 transition-colors"
              style={{ color: C.white }}>
              🔍 Explorer les prestataires
            </Link>
            <Link href="/favorites" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/5 transition-colors"
              style={{ color: C.white }}>
              ❤️ Favoris
            </Link>
            <Link href="/help" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/5 transition-colors"
              style={{ color: C.white }}>
              💬 Aide
            </Link>
            <Link href="/prestataire/dashboard" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-black/5 transition-colors"
              style={{ color: C.terra }}>
              🤝 Espace partenaire
            </Link>

            <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

            {/* Palette + dark mode */}
            <div className="px-4 py-3">
              <PaletteSelector />
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm hover:bg-black/5 transition-colors">
              <span style={{ color: C.white }}>Mode sombre</span>
              <ThemeToggle />
            </div>

            <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

            <Link href="/login" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-3 text-sm hover:bg-black/5 transition-colors"
              style={{ color: C.white }}>
              Connexion
            </Link>
            <Link href="/event/new" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-3 text-sm font-bold hover:bg-black/5 transition-colors"
              style={{ color: C.terra }}>
              Créer un événement →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
