/**
 * T0 — Link dev user (moumene486@gmail.com) à un VRAI Vendor pris au hasard.
 *
 * Pré-requis :
 *   - User existe (signup déjà fait)
 *   - Au moins 1 Vendor sans userId (non claimé) en DB
 *
 * Run :
 *   npx dotenv -e .env.local -- npx tsx scripts/link-dev-vendor.ts
 *
 * Effet :
 *   - User.role = "vendor"
 *   - User.vendorSlug = <vendor.slug>
 *   - User.vendorCategory = <vendor.category>
 *   - User.companyName = <vendor.name>
 *   - Vendor.userId = <user.id> (claim)
 *   - VendorProfile créé (si absent) lié au user et au slug
 *
 * Idempotent : si user déjà lié à un vendor, affiche les infos et sort.
 */

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const DEV_EMAIL = "moumene486@gmail.com"

async function main() {
  // 1. Trouver le user dev
  const user = await prisma.user.findUnique({
    where: { email: DEV_EMAIL },
    include: { vendor: true, vendorProfile: true },
  })

  if (!user) {
    console.error(`❌ User ${DEV_EMAIL} introuvable. Fais le signup d'abord.`)
    process.exit(1)
  }

  console.log(`👤 User trouvé : ${user.id} (role actuel: ${user.role})`)

  // 2. Si déjà lié, on affiche et on sort
  if (user.vendor && user.vendorSlug) {
    console.log(`✅ Déjà lié au vendor "${user.vendor.name}" (slug: ${user.vendorSlug})`)
    console.log(`   → fiche publique : http://localhost:3000/vendor/${user.vendorSlug}`)
    console.log(`   → dashboard     : http://localhost:3000/vendor/dashboard`)
    return
  }

  // 3. Prendre un Vendor au hasard parmi ceux sans userId
  const unclaimedCount = await prisma.vendor.count({ where: { userId: null } })
  if (unclaimedCount === 0) {
    console.error(`❌ Aucun Vendor disponible (tous claimés). Impossible de faire le link.`)
    process.exit(1)
  }

  const skip = Math.floor(Math.random() * unclaimedCount)
  const vendor = await prisma.vendor.findFirst({
    where: { userId: null },
    skip,
    orderBy: { createdAt: "asc" },
    include: { media: true, packages: true },
  })

  if (!vendor) {
    console.error(`❌ Vendor random introuvable (race condition ?).`)
    process.exit(1)
  }

  console.log(`🎲 Vendor tiré au sort : ${vendor.name}`)
  console.log(`   slug      : ${vendor.slug}`)
  console.log(`   catégorie : ${vendor.category}`)
  console.log(`   ville     : ${vendor.city ?? "—"}`)
  console.log(`   photos    : ${vendor.media.length}`)
  console.log(`   packages  : ${vendor.packages.length}`)

  // 4. Claim le vendor + update user (tx)
  await prisma.$transaction(async (tx) => {
    await tx.vendor.update({
      where: { id: vendor.id },
      data: { userId: user.id },
    })

    await tx.user.update({
      where: { id: user.id },
      data: {
        role: "vendor",
        vendorSlug: vendor.slug,
        vendorCategory: vendor.category,
        companyName: vendor.name,
      },
    })

    // VendorProfile (mirror simplifié utilisé ailleurs dans l'app)
    const existingProfile = await tx.vendorProfile.findUnique({ where: { userId: user.id } })
    if (!existingProfile) {
      await tx.vendorProfile.create({
        data: {
          userId: user.id,
          slug: vendor.slug,
          description: vendor.description,
          phone: vendor.phone,
          email: vendor.email,
          website: vendor.website,
          instagram: vendor.instagram,
          facebook: vendor.facebook,
          priceFrom: vendor.priceMin ? Math.round(vendor.priceMin) : null,
          priceTo: vendor.priceMax ? Math.round(vendor.priceMax) : null,
          address: vendor.address,
          photos: vendor.media.map(m => m.url),
          claimed: true,
          verified: vendor.verified,
          plan: "free",
        },
      })
    }
  })

  console.log(`\n✅ Link établi.`)
  console.log(`   → fiche publique : http://localhost:3000/vendor/${vendor.slug}`)
  console.log(`   → dashboard     : http://localhost:3000/vendor/dashboard`)
  console.log(`\n💡 Le dev switcher "Vue prestataire" dans la sidebar client mène directement ici.`)
}

main()
  .catch((e) => {
    console.error("❌", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
