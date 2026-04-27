/**
 * Layout de l'espace prestataire.
 * - Auth gate serveur : role="vendor" + vendorSlug obligatoires.
 * - Chrome dédié (VendorTopBar + VendorSidebar) — esthétique SaaS pro,
 *   volontairement distincte de l'AntNav marketing du site.
 */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import VendorSidebar from "@/components/vendor/VendorSidebar"
import VendorTopBar from "@/components/vendor/VendorTopBar"
import MobileVendorNav from "@/components/vendor/MobileVendorNav"

export const metadata = {
  title: "Espace prestataire — Momento",
  robots: { index: false, follow: false },
}

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/vendor/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, vendorSlug: true },
  })

  // Accès : vendor avec slug, OU admin avec slug (pour test / support)
  const canAccess = user && user.vendorSlug && (user.role === "vendor" || user.role === "admin")
  if (!canAccess) {
    redirect("/dashboard")
  }

  return (
    // Dark forcé sur tout le scope vendor — usage pro intensif (CRM/messagerie/
    // calendrier), souvent le soir après prestas. Le scope client garde son toggle.
    <div className="dark" style={{ minHeight: "100vh", background: "var(--dash-bg)", color: "var(--dash-text)" }}>
      <VendorTopBar email={user.email} />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div className="hidden md:block">
          <VendorSidebar publicSlug={user.vendorSlug} />
        </div>
        <main className="pb-20 md:pb-0" style={{ flex: 1, minWidth: 0, padding: "16px 16px 24px" }}>
          {children}
        </main>
      </div>
      <div className="md:hidden">
        <MobileVendorNav />
      </div>
    </div>
  )
}
