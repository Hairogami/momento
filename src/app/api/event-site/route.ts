import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/event-site
 * Crée un EventSite brouillon lié au planner actif de l'user.
 * Gating : Pro ou Max uniquement. Free → 402.
 * Règle : 1 EventSite par planner (@@unique plannerId).
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? "free"
  if (plan === "free") {
    return NextResponse.json(
      { error: "Feature réservée aux abonnés Pro et Max.", upgradeUrl: "/upgrade?reason=pro-required&from=event-site" },
      { status: 402 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const plannerId = typeof b.plannerId === "string" ? b.plannerId : null
  if (!plannerId) return NextResponse.json({ error: "plannerId requis." }, { status: 400 })

  // Vérif ownership planner
  const planner = await prisma.planner.findFirst({
    where: { id: plannerId, userId: session.user.id, trashedAt: null },
    select: { id: true, eventType: true, title: true, coupleNames: true },
  })
  if (!planner) return NextResponse.json({ error: "Planner introuvable." }, { status: 404 })

  // Existe déjà ?
  const existing = await prisma.eventSite.findUnique({
    where: { plannerId },
    select: { id: true },
  })
  if (existing) return NextResponse.json({ error: "Un site existe déjà pour cet événement.", id: existing.id }, { status: 409 })

  // Choix template auto selon eventType (user peut changer ensuite)
  const familyToTemplate: Record<string, string> = {
    mariage: "mariage",
    fete: "fete-famille",
    naissance: "fete-famille",
    milestones: "fete-famille",
    corporate: "corporate",
    conference: "conference",
    religieux: "generique",
    caritatif: "generique",
    loisirs: "generique",
    autre: "generique",
  }
  const template = typeof b.template === "string"
    ? b.template
    : (familyToTemplate[planner.eventType ?? "autre"] ?? "generique")

  // Slug provisoire (non publié — sera finalisé au publish)
  const { generateUniqueSlug } = await import("@/lib/eventSiteSlug")
  const baseName = planner.coupleNames || planner.title || "event"
  const slug = await generateUniqueSlug(baseName)

  const created = await prisma.eventSite.create({
    data: {
      plannerId,
      slug,
      template,
      content: {
        hero: { title: baseName, subtitle: "", date: null },
        program: [],
        welcomeNote: "",
      },
    },
    select: { id: true, slug: true, template: true, published: true },
  })
  return NextResponse.json(created, { status: 201 })
}
