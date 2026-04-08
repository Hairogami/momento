import { notFound, redirect } from "next/navigation"
import { VENDOR_BASIC } from "@/lib/vendorData"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import ClaimPageClient from "./ClaimPageClient"

export default async function ClaimPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = VENDOR_BASIC[slug]
  if (!vendor) notFound()

  const session = await auth()

  const [existingProfile] = await Promise.all([
    prisma.vendorProfile.findUnique({ where: { slug }, select: { id: true } }),
  ])

  // If logged-in user already owns this profile, redirect to dashboard
  if (session?.user?.id && existingProfile) {
    const userProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id }, select: { slug: true }
    })
    if (userProfile?.slug === slug) {
      redirect("/prestataire/dashboard")
    }
  }

  return (
    <ClaimPageClient
      slug={slug}
      vendor={vendor}
      alreadyClaimed={!!existingProfile}
      loggedInEmail={session?.user?.email ?? null}
      loggedInUserId={session?.user?.id ?? null}
    />
  )
}
