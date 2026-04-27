import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function GET() {
  // En IS_DEV: utiliser requireSession (mêmes mocks que les autres routes)
  // pour que /api/me renvoie le VRAI user.id de la session dev. Renvoyer
  // un id 'mock-user-id' hardcodé cassait toute logique côté front qui
  // compare myId aux senderId réels (ex: alignement messages chat).
  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })
    userId = session.user.id
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, image: true, phone: true, location: true, companyName: true, emailVerified: true },
  })
  if (!user) return Response.json({ error: "Not found" }, { status: 404 })

  return Response.json(user)
}
