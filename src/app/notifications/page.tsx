import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/notifications")

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
            Notifications
          </h1>
          <p className="text-sm" style={{ color: C.mist }}>
            Rester informé de vos mises à jour
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.dark }}
          >
            <Bell size={48} style={{ color: C.terra }} />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-xl font-semibold mb-2" style={{ color: C.white }}>
              Vous êtes à jour !
            </p>
            <p className="text-sm mb-6" style={{ color: C.mist }}>
              Revenez après votre prochain contact avec un prestataire pour voir les mises à jour importantes ici.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              Retour à mon espace
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
