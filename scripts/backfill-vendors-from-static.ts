/**
 * M1 — Backfill DB depuis les fichiers statiques VENDOR_BASIC + VENDOR_DETAILS.
 *
 * Stratégie "fill null only" : ne jamais écraser une donnée déjà présente en DB.
 * Rend la DB aussi riche que les fichiers statiques → M2 peut supprimer les fichiers.
 *
 * Idempotent : rejouable sans effet de bord.
 *
 * Traite :
 * - Vendor : name, category, city, rating, description, instagram, facebook, website, phone
 * - VendorMedia : photos issues de VENDOR_DETAILS.photos
 *
 * Ne traite PAS :
 * - Review (requires authorId → réservé aux vrais users authentifiés, géré plus tard par admin)
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { VENDOR_BASIC } from "../src/lib/vendorData"
import { VENDOR_DETAILS, CAT_PHOTOS } from "../src/lib/vendorDetails"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

let stats = {
  scanned: 0,
  vendorCreated: 0,
  vendorUpdated: 0,
  mediaCreated: 0,
  skipped: 0,
}

async function main() {
  const slugs = Object.keys(VENDOR_BASIC)
  console.log(`\n━━━━ M1 Backfill ${slugs.length} vendors ━━━━\n`)

  for (const slug of slugs) {
    stats.scanned++
    const basic = VENDOR_BASIC[slug]
    const extra = VENDOR_DETAILS[slug]

    // ── Champ Vendor ─────────────────────────────────────────────────────────
    const existing = await prisma.vendor.findUnique({
      where: { slug },
      select: {
        id: true, name: true, category: true, city: true, rating: true,
        description: true, instagram: true, facebook: true, website: true, phone: true,
      },
    })

    const wantedFields = {
      name: basic.name,
      category: basic.category,
      city: basic.city,
      rating: basic.rating,
      description: extra?.description ?? null,
      instagram: extra?.instagram ?? basic.instagram ?? null,
      facebook: extra?.facebook ?? basic.facebook ?? null,
      website: extra?.website ?? null,
      phone: extra?.phone ?? null,
    }

    if (!existing) {
      const created = await prisma.vendor.create({
        data: {
          slug,
          name: basic.name,
          category: basic.category,
          city: basic.city,
          rating: basic.rating,
          description: wantedFields.description,
          instagram: wantedFields.instagram,
          facebook: wantedFields.facebook,
          website: wantedFields.website,
          phone: wantedFields.phone,
        },
        select: { id: true },
      })
      stats.vendorCreated++
        await syncMedia(created.id, basic.category, extra)
      if (stats.scanned % 50 === 0) console.log(`  … ${stats.scanned}/${slugs.length}`)
      continue
    }

    // Fill null only — ne jamais écraser
    const updates: Record<string, unknown> = {}
    if (!existing.description && wantedFields.description) updates.description = wantedFields.description
    if (!existing.instagram   && wantedFields.instagram)   updates.instagram   = wantedFields.instagram
    if (!existing.facebook    && wantedFields.facebook)    updates.facebook    = wantedFields.facebook
    if (!existing.website     && wantedFields.website)     updates.website     = wantedFields.website
    if (!existing.phone       && wantedFields.phone)       updates.phone       = wantedFields.phone

    if (Object.keys(updates).length > 0) {
      await prisma.vendor.update({ where: { id: existing.id }, data: updates })
      stats.vendorUpdated++
    } else {
      stats.skipped++
    }

    await syncMedia(existing.id, basic.category, extra)
    if (stats.scanned % 100 === 0) console.log(`  … ${stats.scanned}/${slugs.length}`)
  }

  console.log(`\n━━━━ Done ━━━━`)
  console.log(stats)
}

async function syncMedia(vendorId: string, category: string, extra: typeof VENDOR_DETAILS[string] | undefined) {
  // VendorMedia : n'ajoute QUE les photos riches (VENDOR_DETAILS.photos)
  // On ne push PAS les fallbacks CAT_PHOTOS en DB — ils restent côté UI en fallback d'affichage
  // sinon on polluerait la DB avec des images Unsplash génériques dupliquées sur 100+ vendors.
  const photos = extra?.photos ?? []
  if (photos.length === 0) return

  const existingMedia = await prisma.vendorMedia.findMany({
    where: { vendorId },
    select: { url: true },
  })
  const existingUrls = new Set(existingMedia.map(m => m.url))
  const toCreate = photos.filter(url => !existingUrls.has(url))
  if (toCreate.length === 0) return

  await prisma.vendorMedia.createMany({
    data: toCreate.map((url, i) => ({
      vendorId,
      url,
      type: "image",
      order: existingMedia.length + i,
    })),
  })
  stats.mediaCreated += toCreate.length
}

main()
  .catch(e => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
