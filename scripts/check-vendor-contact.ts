import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
async function main() {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: "prestige-photo" },
    select: { id: true, slug: true, category: true, region: true, phone: true, priceMin: true, priceMax: true, verified: true, rating: true },
  })
  console.log("\nVendor (table principale) :\n", vendor)
  const profile = await prisma.vendorProfile.findUnique({
    where: { slug: "prestige-photo" },
    select: { displayName: true, city: true, phone: true, whatsapp: true, email: true, website: true, instagram: true, facebook: true, tiktok: true, description: true, priceMin: true, priceMax: true, verified: true, rating: true },
  })
  console.log("\nVendorProfile (mirror denormalisé) :\n", profile)
}
main().finally(() => prisma.$disconnect())
