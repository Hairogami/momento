/**
 * GET /api/favorites — liste des favoris de l'utilisateur connecté
 * Retourne les vendors favoris avec infos pour affichage carte.
 */
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const IS_DEV = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"

async function getUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id
  if (IS_DEV) {
    const first = await prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } })
    return first?.id ?? null
  }
  return null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      vendor: {
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          city: true,
          rating: true,
          priceMin: true,
          media: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
      },
    },
  })

  const mapped = favorites.map(f => ({
    id: f.vendor.slug,
    name: f.vendor.name,
    category: f.vendor.category,
    city: f.vendor.city ?? "",
    rating: f.vendor.rating ?? 0,
    priceMin: f.vendor.priceMin ?? undefined,
    photo: f.vendor.media[0]?.url ?? null,
    favoriteId: f.id,
    createdAt: f.createdAt,
  }))

  return Response.json(mapped)
}
