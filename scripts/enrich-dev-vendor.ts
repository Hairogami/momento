/**
 * Enrichit le vendor dev (prestige-photo) avec des données contact réalistes
 * pour tester toutes les chips (phone, whatsapp, instagram, facebook) sur /vendor/[slug].
 *
 * Idempotent : ne remplit que les champs null, ne touche pas les valeurs existantes.
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const SLUG = "prestige-photo"

async function main() {
  const v = await prisma.vendor.findUnique({ where: { slug: SLUG } })
  if (!v) throw new Error(`Vendor ${SLUG} introuvable`)

  const updates: Record<string, unknown> = {}
  if (!v.phone)       updates.phone       = "+212612345678"
  if (!v.email)       updates.email       = "contact@prestige-photo.ma"
  if (!v.website)     updates.website     = "https://prestige-photo.ma"
  if (!v.instagram)   updates.instagram   = "prestige_photo_maroc"
  if (!v.facebook)    updates.facebook    = "prestigephotomaroc"
  if (!v.description) updates.description = "Studio photo spécialisé mariage et événementiel à Rabat. 10 ans d'expérience, équipe de 3 photographes, livraison sous 15 jours."
  if (!v.city)        updates.city        = "Rabat"
  if (!v.region)      updates.region      = "Rabat-Salé-Kénitra"
  if (v.priceMin == null) updates.priceMin = 5000
  if (v.priceMax == null) updates.priceMax = 15000
  if (!v.priceRange)  updates.priceRange  = "mid"
  if (!v.verified)    updates.verified    = true

  if (Object.keys(updates).length === 0) {
    console.log(`✓ ${SLUG} déjà enrichi, rien à faire`)
    return
  }

  await prisma.vendor.update({ where: { slug: SLUG }, data: updates })
  console.log(`✓ ${SLUG} enrichi avec :`)
  for (const [k, val] of Object.entries(updates)) console.log(`  ${k.padEnd(12)} → ${val}`)

  // Mirror sur VendorProfile si présent
  const hasProfile = await prisma.vendorProfile.findUnique({ where: { slug: SLUG }, select: { id: true } })
  if (hasProfile) {
    const profileUpdates: Record<string, unknown> = {}
    if (updates.priceMin != null) profileUpdates.priceFrom = updates.priceMin
    if (updates.priceMax != null) profileUpdates.priceTo   = updates.priceMax
    if (updates.address)          profileUpdates.address   = updates.address
    if (Object.keys(profileUpdates).length > 0) {
      await prisma.vendorProfile.update({ where: { slug: SLUG }, data: profileUpdates })
      console.log(`  → VendorProfile mirror synced`)
    }
  }
}

main()
  .catch(e => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
