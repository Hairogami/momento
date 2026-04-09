"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import InformationsTab from "./InformationsTab"
import AccountTab from "./AccountTab"
import ProjectsTab from "./ProjectsTab"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export type UserData = {
  id: string
  email: string
  role: string
  username: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  location: string | null
  companyName: string | null
  vendorCategory: string | null
  emailVerified: boolean
  createdAt: string
  image: string | null
}

type PlannerData = {
  id: string
  title: string
  coupleNames: string
  weddingDate: Date | null
  budget: number | null
  location: string | null
  coverColor: string
  createdAt: Date
  steps: { status: string }[]
}

type Tab = "informations" | "compte" | "projets"

export default function ProfileClient({ user: initialUser, planners }: { user: UserData; planners: PlannerData[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(initialUser)

  const [localAvatar, setLocalAvatar] = useState<string | null>(null)
  useEffect(() => {
    setLocalAvatar(localStorage.getItem("momento_avatar"))
  }, [])
  // Keep localAvatar in sync when user.image changes (after save)
  useEffect(() => {
    if (user.image) setLocalAvatar(user.image)
  }, [user.image])

  const displayAvatar = localAvatar ?? user.image ?? null

  const tabParam = searchParams.get("tab") as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ["informations", "compte", "projets"].includes(tabParam) ? tabParam : "informations"
  )

  // Sync tab when URL changes (e.g. ?tab=compte from navbar dropdown)
  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null
    if (t && ["informations", "compte", "projets"].includes(t)) {
      setActiveTab(t)
    }
  }, [searchParams])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const displayName = user.username ?? user.email.split("@")[0]

  const initials = displayName.slice(0, 2).toUpperCase()

  const TABS: { id: Tab; label: string }[] = [
    { id: "informations", label: "Informations" },
    { id: "compte",       label: "Compte" },
    { id: "projets",      label: "Projets" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>
      {/* Nav */}
      <header className="w-full px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.anthracite}` }}>
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link href="/dashboard" className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: C.mist }}>
            ← Mon espace
          </Link>
          <button onClick={handleLogout} className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: C.terra }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-10">
          {/* Avatar */}
          {displayAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1
              className="font-display italic text-3xl sm:text-4xl font-normal leading-tight mb-1"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}
            >
              {displayName}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: user.role === "vendor" ? "rgba(var(--momento-terra-rgb),0.12)" : "rgba(44,26,14,0.08)", color: user.role === "vendor" ? C.terra : C.mist }}
              >
                {user.role === "vendor" ? "Prestataire" : "Organisateur"}
              </span>
              <span className="text-xs" style={{ color: C.steel }}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ backgroundColor: C.dark }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? C.ink : "transparent",
                color: activeTab === tab.id ? C.white : C.mist,
                boxShadow: activeTab === tab.id ? "0 1px 4px rgba(26,18,8,0.1)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "informations" && (
          <InformationsTab user={user} onUpdate={setUser} />
        )}
        {activeTab === "compte" && (
          <AccountTab />
        )}
        {activeTab === "projets" && (
          <ProjectsTab planners={planners} />
        )}
      </main>
    </div>
  )
}
