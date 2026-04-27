import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { captureError } from "@/lib/observability"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const allowed = ["firstName", "lastName", "name", "username", "phone", "location", "companyName", "vendorCategory", "image"] as const
  type AllowedKey = typeof allowed[number]

  const updates: Partial<Record<AllowedKey, string | null>> = {}

  for (const key of allowed) {
    if (key in body) {
      const val = body[key]
      if (typeof val === "string") {
        if (key === "image") {
          if (val) {
            try {
              const parsed = new URL(val)
              if (!["http:", "https:"].includes(parsed.protocol)) {
                return NextResponse.json({ error: "URL d'image invalide." }, { status: 400 })
              }
              // W01: allowlist known safe domains to prevent SSRF via next/image optimizer
              const ALLOWED_IMAGE_HOSTS = [
                /^.*\.googleusercontent\.com$/,
                /^.*\.fbcdn\.net$/,
                /^.*\.facebook\.com$/,
                /^.*\.cloudinary\.com$/,
                /^.*\.githubusercontent\.com$/,
                /^.*\.vercel-storage\.com$/,
                /^momentoevents\.app$/,
                /^.*\.momentoevents\.app$/,
              ]
              const isAllowed = ALLOWED_IMAGE_HOSTS.some(r => r.test(parsed.hostname))
              if (!isAllowed) {
                return NextResponse.json({ error: "Domaine d'image non autorisé." }, { status: 400 })
              }
              updates[key] = val
            } catch {
              return NextResponse.json({ error: "URL d'image invalide." }, { status: 400 })
            }
          } else {
            updates[key] = null
          }
        } else {
          updates[key] = val.trim().slice(0, 200) || null
        }
      } else {
        updates[key] = null
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        location: true,
        companyName: true,
        vendorCategory: true,
        image: true,
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    captureError(err, { route: "/api/auth/update-profile" })
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
