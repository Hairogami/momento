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
    <div style={{ minHeight: "100vh", background: "#f7f7fb" }}>
      <VendorTopBar email={user.email} />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <VendorSidebar publicSlug={user.vendorSlug} />
        <main style={{ flex: 1, minWidth: 0, padding: "24px 28px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
