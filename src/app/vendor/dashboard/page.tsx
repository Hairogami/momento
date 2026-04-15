/**
 * Home dashboard prestataire — Server Component.
 * Layout parent (vendor/dashboard/layout.tsx) garantit déjà role="vendor" + vendorSlug.
 * On résout ici le nom public du prestataire puis on passe la main à <VendorHome/> (client).
 */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import VendorHome from "@/components/vendor/home/VendorHome"

export const dynamic = "force-dynamic"

export default async function VendorDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/vendor/dashboard")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vendorSlug: true },
  })
  if (!user?.vendorSlug) redirect("/dashboard")

  const vendor = await prisma.vendor.findUnique({
    where: { slug: user.vendorSlug },
    select: { name: true },
  })

  return (
    <VendorHome
      publicSlug={user.vendorSlug}
      vendorName={vendor?.name ?? "Prestataire"}
    />
  )
}
