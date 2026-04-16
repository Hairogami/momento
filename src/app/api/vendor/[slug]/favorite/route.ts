/**
 * GET  /api/vendor/[slug]/favorite — état favori de l'utilisateur connecté
 * POST /api/vendor/[slug]/favorite — toggle (ajoute ou retire)
 *
 * Retourne { favorited: boolean }
 * 401 si non authentifié.
 */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const IS_DEV = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"

async function getUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id
  // En dev, fallback sur le premier user admin si pas de session
  if (IS_DEV) {
    const first = await prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } })
    return first?.id ?? null
  }
  return null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ favorited: false })

    const { slug } = await params
    const vendor = await prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
    if (!vendor) return NextResponse.json({ favorited: false })

    const fav = await prisma.favorite.findFirst({
      where: { userId, vendorId: vendor.id, plannerId: null },
      select: { id: true },
    })
    return NextResponse.json({ favorited: !!fav })
  } catch (err) {
    console.error("[favorite] GET error:", err)
    return NextResponse.json({ favorited: false })
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })

    const { slug } = await params
    const vendor = await prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
    if (!vendor) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })

    const existing = await prisma.favorite.findFirst({
      where: { userId, vendorId: vendor.id, plannerId: null },
      select: { id: true },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.favorite.create({ data: { userId, vendorId: vendor.id, plannerId: null } })
      return NextResponse.json({ favorited: true })
    }
  } catch (err) {
    console.error("[favorite] POST error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
