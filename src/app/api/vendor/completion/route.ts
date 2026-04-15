/**
 * GET /api/vendor/completion
 * Retourne un score de complétude profil (0-100) + checklist actionable.
 *
 * Scoring pondéré selon l'impact réel sur les conversions (photos > tarif > contact).
 * Chaque item de la checklist renvoie un CTA pour guider le prestataire.
 *
 * Auth : role="vendor" + vendorSlug (IDOR-safe).
 */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ChecklistItem = {
  id: string
  label: string
  done: boolean
  weight: number          // points rapportés si done=true
  cta: { label: string; href: string } // action si done=false
}

export async function GET() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || !user.vendorSlug || (user.role !== "vendor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }
  const slug = user.vendorSlug

  // ── Fetch vendor + media count + verification ────────────────────────────
  const [vendor, mediaCount] = await Promise.all([
    prisma.vendor.findUnique({
      where: { slug },
      select: {
        name: true, category: true, description: true,
        city: true, region: true, phone: true, email: true,
        priceMin: true, priceMax: true, priceRange: true,
        instagram: true, facebook: true, website: true,
        verified: true,
      },
    }),
    prisma.vendorMedia.count({ where: { vendor: { slug } } }),
  ])
  if (!vendor) {
    return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })
  }

  // ── Checklist (ordre = priorité visuelle) ────────────────────────────────
  const profilHref = "/vendor/dashboard/profil"
  const checklist: ChecklistItem[] = [
    {
      id: "photos",
      label: "Ajoute au moins 3 photos",
      done: mediaCount >= 3,
      weight: 25,
      cta: { label: "Ajouter des photos", href: `${profilHref}#photos` },
    },
    {
      id: "description",
      label: "Décris ton activité (100 caractères min)",
      done: !!vendor.description && vendor.description.trim().length >= 100,
      weight: 15,
      cta: { label: "Compléter la description", href: `${profilHref}#description` },
    },
    {
      id: "prices",
      label: "Renseigne tes tarifs",
      done: (vendor.priceMin != null && vendor.priceMax != null) || !!vendor.priceRange,
      weight: 15,
      cta: { label: "Ajouter les tarifs", href: `${profilHref}#prices` },
    },
    {
      id: "phone",
      label: "Ajoute ton numéro de téléphone",
      done: !!vendor.phone && vendor.phone.trim().length > 0,
      weight: 10,
      cta: { label: "Ajouter le téléphone", href: `${profilHref}#contact` },
    },
    {
      id: "location",
      label: "Renseigne ville et région",
      done: !!vendor.city && !!vendor.region,
      weight: 10,
      cta: { label: "Compléter la localisation", href: `${profilHref}#location` },
    },
    {
      id: "social",
      label: "Connecte Instagram ou Facebook",
      done: !!vendor.instagram || !!vendor.facebook,
      weight: 10,
      cta: { label: "Connecter un réseau", href: `${profilHref}#social` },
    },
    {
      id: "verified",
      label: "Obtiens le badge Vérifié",
      done: vendor.verified,
      weight: 10,
      cta: { label: "Demander la vérification", href: `${profilHref}#verify` },
    },
    {
      id: "email",
      label: "Ajoute ton email de contact",
      done: !!vendor.email && vendor.email.trim().length > 0,
      weight: 5,
      cta: { label: "Ajouter l'email", href: `${profilHref}#contact` },
    },
  ]

  // ── Score ────────────────────────────────────────────────────────────────
  const score = checklist.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0)
  const maxScore = checklist.reduce((acc, item) => acc + item.weight, 0) // === 100
  const missing = checklist.filter(i => !i.done)
  const nextSteps = missing
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3) // top 3 améliorations par impact

  return NextResponse.json({
    score,
    maxScore,
    percent: Math.round((score / maxScore) * 100),
    itemsDone: checklist.filter(i => i.done).length,
    itemsTotal: checklist.length,
    checklist,
    nextSteps, // pour la home dashboard : 3 meilleures actions à faire
  })
}
