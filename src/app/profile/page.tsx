import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/profile")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/login")

  const planners = await prisma.planner.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { steps: true },
  })

  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    location: user.location,
    companyName: user.companyName,
    vendorCategory: user.vendorCategory,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    image: user.image ?? null,
  }

  return (
    <Suspense fallback={null}>
      <ProfileClient user={userData} planners={planners} />
    </Suspense>
  )
}
