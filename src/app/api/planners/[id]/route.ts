import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function parseDate(val: unknown): Date | undefined {
  if (typeof val !== "string" || !val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

// WR-01: Safe budget parse — rejects NaN, Infinity, negatives
function parseBudget(val: unknown): number | undefined {
  if (val === undefined) return undefined
  const n = parseFloat(String(val))
  if (!isFinite(n) || n < 0) return undefined
  return n
}

async function findPlannerOwnership(id: string) {
  return prisma.planner.findUnique({ where: { id }, select: { userId: true } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = IS_DEV ? await requireSession() : await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await findPlannerOwnership(id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const planner = await prisma.planner.findUnique({
    where: { id },
    include: {
      steps: {
        include: {
          vendors: {
            include: {
              vendor: { select: { id: true, name: true, slug: true, category: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
      events: { orderBy: { date: "asc" } },
    },
  })
  if (!planner) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(planner)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = IS_DEV ? await requireSession() : await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await findPlannerOwnership(id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }

  // Validate categories if provided
  let categoriesUpdate: string[] | undefined
  if (Array.isArray(body.categories)) {
    const cats = (body.categories as unknown[])
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .map(c => c.trim().slice(0, 100))
    if (cats.length < 3) {
      return Response.json({ error: "Sélectionnez au moins 3 catégories de prestataires." }, { status: 400 })
    }
    categoriesUpdate = cats
  }

  const planner = await prisma.planner.update({
    where: { id },
    data: {
      title:       typeof body.title === "string"       ? body.title.trim().slice(0, 200)       : undefined,
      coupleNames: typeof body.coupleNames === "string" ? body.coupleNames.trim().slice(0, 200) : undefined,
      weddingDate: parseDate(body.weddingDate),
      budget:      parseBudget(body.budget),
      guestCount:  typeof body.guestCount === "number" && Number.isInteger(body.guestCount) && body.guestCount >= 0
        ? body.guestCount
        : undefined,
      location:    typeof body.location === "string"    ? body.location.trim().slice(0, 200)    : undefined,
      coverColor:  typeof body.coverColor === "string" && HEX_COLOR.test(body.coverColor)
        ? body.coverColor
        : undefined,
      categories:  categoriesUpdate,
    },
  })
  return Response.json(planner)
}

/**
 * DELETE /api/planners/[id]
 * - Par défaut : soft delete (corbeille). L'événement reste 15 jours avant purge.
 * - Avec ?hard=true : suppression définitive immédiate (depuis la corbeille).
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = IS_DEV ? await requireSession() : await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ownership = await findPlannerOwnership(id)
  if (!ownership || ownership.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const url = new URL(req.url)
  const hard = url.searchParams.get("hard") === "true"

  if (hard) {
    await prisma.planner.delete({ where: { id } })
  } else {
    await prisma.planner.update({
      where: { id },
      data: { trashedAt: new Date() },
    })
  }
  return new Response(null, { status: 204 })
}
