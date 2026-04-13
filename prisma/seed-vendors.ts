/**
 * seed-vendors.ts
 * Seeds the Vendor table from VENDOR_BASIC static data.
 * Uses createMany + skipDuplicates for performance (single batch insert).
 * Run: npx tsx prisma/seed-vendors.ts
 */

import * as dotenv from "dotenv"
dotenv.config({ path: ".env" })
dotenv.config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { VENDOR_BASIC } from "../src/lib/vendorData"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const entries = Object.entries(VENDOR_BASIC)

  const data = entries.map(([slug, v]) => ({
    slug,
    name: v.name,
    category: v.category,
    city: v.city,
    rating: v.rating,
    instagram: v.instagram ?? null,
    facebook: v.facebook ?? null,
  }))

  console.log(`Seeding ${data.length} vendors...`)

  const result = await prisma.vendor.createMany({
    data,
    skipDuplicates: true,
  })

  console.log(`\n✅ ${result.count} vendors insérés (doublons ignorés)`)
}

main()
  .catch(e => {
    console.error("Fatal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
