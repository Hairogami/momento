/**
 * POST   /api/vendor/calendar/block  — bloque une date manuellement
 * DELETE /api/vendor/calendar/block  — débloque une date
 *
 * Body JSON : { date: "YYYY-MM-DD", reason?: string, slug?: string }
 *
 * Auth :
 *   - Si session.role === "vendor"  → toujours sur son propre vendorSlug (IDOR-safe)
 *   - Si session.role === "admin"   → accepte un `slug` optionnel pour cibler
 *     n'importe quel prestataire (support téléphonique, édition pour le compte
 *     du presta). Audit-loggé dans AdminAuditLog.
 *
 * Post-action : revalidatePath("/vendor/[slug]") pour que la fiche publique
 * reflète la nouvelle dispo instantanément (cache ISR 1h sinon).
 */
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD attendu)."),
  reason: z.string().max(200).optional(),
  slug: z.string().max(120).optional(), // utilisé uniquement si admin
})

async function resolveContext(slugOverride?: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non authentifié.", status: 401 as const }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, vendorSlug: true, email: true },
  })
  if (!user) return { error: "Utilisateur introuvable.", status: 401 as const }

  // Admin : peut cibler un autre slug
  if (user.role === "admin" && slugOverride) {
    const v = await prisma.vendor.findUnique({
      where: { slug: slugOverride },
      select: { id: true, slug: true },
    })
    if (!v) return { error: "Prestataire introuvable.", status: 404 as const }
    return { vendorId: v.id, slug: v.slug, actor: user, isAdmin: true as const }
  }

  // Vendor : uniquement son propre profil
  if (user.role === "vendor" && user.vendorSlug) {
    const v = await prisma.vendor.findUnique({
      where: { slug: user.vendorSlug },
      select: { id: true, slug: true },
    })
    if (!v) return { error: "Fiche prestataire introuvable.", status: 404 as const }
    return { vendorId: v.id, slug: v.slug, actor: user, isAdmin: false as const }
  }

  return { error: "Accès réservé aux prestataires et admins.", status: 403 as const }
}

function parseDateUTC(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const ctx = await resolveContext(parsed.data.slug)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const date = parseDateUTC(parsed.data.date)

  const created = await prisma.vendorBlockedDate.upsert({
    where: { vendorId_date: { vendorId: ctx.vendorId, date } },
    create: {
      vendorId: ctx.vendorId,
      date,
      reason: parsed.data.reason ?? null,
      createdBy: ctx.actor.id,
    },
    update: { reason: parsed.data.reason ?? null, createdBy: ctx.actor.id },
  })

  if (ctx.isAdmin) {
    await prisma.adminAuditLog.create({
      data: {
        adminId: ctx.actor.id,
        adminEmail: ctx.actor.email ?? "unknown",
        action: "vendor.calendar.block",
        targetType: "Vendor",
        targetId: ctx.slug,
        changes: { date: parsed.data.date, reason: parsed.data.reason ?? null },
      },
    })
  }

  revalidatePath(`/vendor/${ctx.slug}`)

  return NextResponse.json({ ok: true, block: created })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    )
  }

  const ctx = await resolveContext(parsed.data.slug)
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const date = parseDateUTC(parsed.data.date)

  await prisma.vendorBlockedDate.deleteMany({
    where: { vendorId: ctx.vendorId, date },
  })

  if (ctx.isAdmin) {
    await prisma.adminAuditLog.create({
      data: {
        adminId: ctx.actor.id,
        adminEmail: ctx.actor.email ?? "unknown",
        action: "vendor.calendar.unblock",
        targetType: "Vendor",
        targetId: ctx.slug,
        changes: { date: parsed.data.date },
      },
    })
  }

  revalidatePath(`/vendor/${ctx.slug}`)

  return NextResponse.json({ ok: true })
}
