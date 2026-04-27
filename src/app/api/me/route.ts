import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const IS_DEV = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"

export async function GET() {
  if (IS_DEV) {
    return Response.json({ id: "mock-user-id", email: "moumene486@gmail.com", name: "Dev User", role: "admin", emailVerified: new Date().toISOString() })
  }

  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, image: true, phone: true, location: true, companyName: true, emailVerified: true },
  })
  if (!user) return Response.json({ error: "Not found" }, { status: 404 })

  return Response.json(user)
}
