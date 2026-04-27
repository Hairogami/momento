import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEV_OWNER_EMAIL } from "@/lib/adminAuth"
import { logAdminAction } from "@/lib/adminAudit"

// DEV_OWNER_EMAIL centralisé via @/lib/adminAuth (DEV_OWNER_EMAIL)

/**
 * POST /api/dev/switch-role — bascule role client ↔ vendor.
 * Réservé à moumene486@gmail.com uniquement.
 * Désactivé en production stricte (pas de preview).
 */
export async function POST(_req: NextRequest) {
  // H-2: désactiver en production pour éviter l'exposition de cette route dev
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }
  const session = await auth()
  if (!session?.user?.id || session.user.email !== DEV_OWNER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, vendorSlug: true, name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (user.role === "vendor") {
    // → retour client
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "client" },
    })
    await logAdminAction({
      adminId:    user.id,
      adminEmail: user.email ?? DEV_OWNER_EMAIL,
      action:     "dev.switch-role",
      targetType: "User",
      targetId:   user.id,
      changes:    {
        role: { from: "vendor", to: "client" },
        env:  { from: null, to: process.env.VERCEL_ENV ?? "local" },
      },
    })
    return NextResponse.json({ role: "client", redirect: "/accueil" })
  }

  // → passe vendor. Crée un Vendor dummy si absent.
  let vendorSlug = user.vendorSlug
  if (!vendorSlug) {
    vendorSlug = "dev-yazid"
    const existing = await prisma.vendor.findUnique({ where: { slug: vendorSlug }, select: { id: true, userId: true } })
    if (!existing) {
      await prisma.vendor.create({
        data: {
          slug: vendorSlug,
          name: user.name ?? "Dev Vendor",
          category: "Photographe",
          city: "Casablanca",
          email: user.email,
          description: "Compte dev prestataire.",
          verified: true,
          rating: 4.9,
          reviewCount: 12,
          userId: user.id,
        },
      })
    } else if (existing.userId && existing.userId !== user.id) {
      vendorSlug = `dev-yazid-${Date.now().toString(36)}`
      await prisma.vendor.create({
        data: {
          slug: vendorSlug,
          name: user.name ?? "Dev Vendor",
          category: "Photographe",
          city: "Casablanca",
          email: user.email,
          verified: true,
          userId: user.id,
        },
      })
    } else if (existing && !existing.userId) {
      await prisma.vendor.update({ where: { slug: vendorSlug }, data: { userId: user.id } })
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "vendor", vendorSlug },
  })

  await logAdminAction({
    adminId:    user.id,
    adminEmail: user.email ?? DEV_OWNER_EMAIL,
    action:     "dev.switch-role",
    targetType: "User",
    targetId:   user.id,
    changes:    {
      role:       { from: user.role, to: "vendor" },
      vendorSlug: { from: user.vendorSlug, to: vendorSlug },
      env:        { from: null, to: process.env.VERCEL_ENV ?? "local" },
    },
  })

  return NextResponse.json({ role: "vendor", vendorSlug, redirect: "/vendor/dashboard" })
}
