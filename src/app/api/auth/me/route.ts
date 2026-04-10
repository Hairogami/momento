import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

  // I05: select only the fields returned — avoid loading passwordHash etc.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      username: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      location: true,
      companyName: true,
      vendorCategory: true,
    },
  })
  if (!user) return NextResponse.json({ error: "Introuvable." }, { status: 404 })

  return NextResponse.json(user)
}
