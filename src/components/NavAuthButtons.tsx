"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, LayoutDashboard, Heart, User, Settings, Briefcase, HelpCircle, Bell, MessageSquare, LogOut, CalendarDays, Users } from "lucide-react"
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

  const isOAuth = user?.provider && user.provider !== "credentials"

  useEffect(() => {
    if (!user) return
    if (isOAuth && user.image) {
      setAvatar(user.image)
      localStorage.setItem("momento_avatar", user.image)
    } else if (!isOAuth) {
      const stored = localStorage.getItem("momento_avatar")
      setAvatar(stored ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.image, user?.provider])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await signOut({ redirectTo: "/" })
  }

  if (user) {
    const displayName = user.name ?? user.username ?? user.firstName ?? user.email.split("@")[0]
    const initials = displayName[0].toUpperCase()

    const AvatarEl = () => avatar ? (
      <img src={avatar} alt={initials} className="w-8 h-8 rounded-full object-cover" />
    ) : (
      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: C.terra, color: "var(--bg)" }}>
        {initials}
      </span>
    )

    if (mobile) {
      return (
        <div className="flex flex-col gap-2 pt-1">
          {/* User header */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: C.anthracite }}>
            <AvatarEl />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.white }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: C.mist }}>{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          {[
            { href: "/dashboard",        label: "Tableau de bord" },
            { href: "/dashboard/vendors", label: "Mes prestataires" },
            { href: "/dashboard/budget",  label: "Mon budget" },
            { href: "/dashboard/guests",  label: "Mes invités" },
            { href: "/favorites",         label: "Mes favoris" },
            { href: "/messages",          label: "Messages" },
            { href: "/notifications",     label: "Notifications" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-4 rounded-xl"
              style={{ backgroundColor: C.anthracite, color: C.white }}>
              {label}
            </Link>
          ))}

          {/* Profile & settings */}
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

          {/* Theme */}
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: C.anthracite }}>
            <PaletteSelector />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ backgroundColor: C.anthracite }}>
            <span className="text-sm font-medium" style={{ color: C.white }}>Mode sombre</span>
            <ThemeToggle />
          </div>

          {/* Partner & logout */}
          <Link href="/prestataire/dashboard" onClick={() => setOpen(false)}
            className="text-sm font-medium py-2.5 px-4 rounded-xl"
            style={{ backgroundColor: C.anthracite, color: C.terra }}>
            Espace partenaire
          </Link>
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
        {/* Mes Événements — même style que "Créer un événement" guest */}
        <Link href="/dashboard"
          className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ backgroundColor: C.terra, color: "var(--bg)" }}>
          Mes Événements
        </Link>

        {/* Pill avatar */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu utilisateur"
            aria-expanded={open}
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
            <AvatarEl />
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-xl"
              style={{ backgroundColor: C.ink, border: `1px solid ${C.anthracite}`, minWidth: 240 }}
            >
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${C.anthracite}` }}>
                <AvatarEl />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: C.white }}>{displayName}</p>
                  <p className="text-xs truncate" style={{ color: C.mist }}>{user.email}</p>
                </div>
              </div>

              {/* Dashboard */}
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <LayoutDashboard size={15} /> Tableau de bord
              </Link>
              <Link href="/dashboard/vendors" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <Briefcase size={15} /> Mes prestataires
              </Link>
              <Link href="/dashboard/budget" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <CalendarDays size={15} /> Mon budget
              </Link>
              <Link href="/dashboard/guests" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <Users size={15} /> Mes invités
              </Link>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Social */}
              <Link href="/messages" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <MessageSquare size={15} /> Messages
              </Link>
              <Link href="/notifications" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <Bell size={15} /> Notifications
              </Link>
              <Link href="/favorites" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <Heart size={15} /> Mes favoris
              </Link>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Account */}
              <Link href="/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <User size={15} /> Mon profil
              </Link>
              <Link href="/profile?tab=compte" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <Settings size={15} /> Paramètres
              </Link>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Appearance */}
              <div className="px-4 py-3">
                <PaletteSelector />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-black/5 transition-colors">
                <span style={{ color: C.white }}>Mode sombre</span>
                <ThemeToggle />
              </div>

              <div style={{ height: 1, backgroundColor: C.anthracite, margin: "4px 0" }} />

              {/* Partner + help */}
              <Link href="/prestataire/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-black/5 transition-colors"
                style={{ color: C.terra }}>
                <Briefcase size={15} /> Espace partenaire
              </Link>
              <Link href="/help" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.white }}>
                <HelpCircle size={15} /> Aide
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/5 transition-colors"
                style={{ color: C.terra }}>
                <LogOut size={15} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

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
          <Link href="/event/new" className="flex-1 text-sm font-bold text-center py-2.5 rounded-xl" style={{ backgroundColor: C.terra, color: "var(--bg)" }}>
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
        style={{ backgroundColor: C.terra, color: "var(--bg)" }}>
        Créer un événement
      </Link>

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
