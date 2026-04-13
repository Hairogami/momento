import { requireSession } from "@/lib/devAuth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, Palette, Bell, User } from "lucide-react"
import { MomentoLogo } from "@/components/MomentoLogo"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { PaletteSelector } from "@/components/PaletteSelector"
import { SignOut } from "@/components/SignOut"

export default async function SettingsPage() {
  const session = await requireSession()

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Nav */}
      <nav
        className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: C.anthracite, backgroundColor: C.ink }}
      >
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link href="/dashboard" className="text-sm" style={{ color: C.mist }}>
            ← Mon espace
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: C.white }}>
            Paramètres
          </h1>
          <p className="text-sm" style={{ color: C.mist }}>
            Personnalisez votre expérience Momento
          </p>
        </div>

        {/* Settings sections */}
        <div className="space-y-8">
          {/* Appearance Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette size={20} style={{ color: C.terra }} />
              <h2 className="text-lg font-semibold" style={{ color: C.white }}>
                Apparence
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: C.mist }}>
                  Palette de couleurs
                </p>
                <PaletteSelector />
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
          >
            <div className="flex items-center gap-3 mb-6">
              <User size={20} style={{ color: C.terra }} />
              <h2 className="text-lg font-semibold" style={{ color: C.white }}>
                Compte
              </h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/profile"
                className="block p-4 rounded-xl transition-all hover:opacity-75"
                style={{ backgroundColor: C.ink, border: `1px solid ${C.anthracite}` }}
              >
                <p className="text-sm font-medium" style={{ color: C.white }}>
                  Mon profil
                </p>
                <p className="text-xs mt-1" style={{ color: C.mist }}>
                  Voir et modifier vos informations personnelles
                </p>
              </Link>
            </div>
          </div>

          {/* Notifications Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} style={{ color: C.terra }} />
              <h2 className="text-lg font-semibold" style={{ color: C.white }}>
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm" style={{ color: C.mist }}>
                La gestion des notifications sera bientôt disponible.
              </p>
              <Link
                href="/notifications"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: C.terra, color: "#fff" }}
              >
                Voir mes notifications
              </Link>
            </div>
          </div>

          {/* Sign Out Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
          >
            <div className="flex items-center gap-3 mb-6">
              <LogOut size={20} style={{ color: "#EF4444" }} />
              <h2 className="text-lg font-semibold" style={{ color: C.white }}>
                Déconnexion
              </h2>
            </div>
            <SignOut />
          </div>
        </div>
      </div>
    </div>
  )
}
