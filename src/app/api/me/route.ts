import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"

export async function GET() {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, image: true, phone: true, location: true, companyName: true, emailVerified: true },
  })
  if (!user) return Response.json({ error: "Not found" }, { status: 404 })

  return Response.json(user)
}
