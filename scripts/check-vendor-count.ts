import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
async function main() {
  const [total, linked, profiles, withPhone, withFacebook, withInstagram, withDescription, withWebsite, withMedia] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { userId: { not: null } } }),
    prisma.vendorProfile.count(),
    prisma.vendor.count({ where: { phone: { not: null } } }),
    prisma.vendor.count({ where: { facebook: { not: null } } }),
    prisma.vendor.count({ where: { instagram: { not: null } } }),
    prisma.vendor.count({ where: { description: { not: null } } }),
    prisma.vendor.count({ where: { website: { not: null } } }),
    prisma.vendorMedia.count(),
  ])
  console.log({ total, linked, profiles, withPhone, withFacebook, withInstagram, withDescription, withWebsite, vendorMediaRows: withMedia })

  const sample = await prisma.vendor.findFirst({
    where: { slug: "dj-azz" },
    select: { slug: true, name: true, phone: true, instagram: true, facebook: true, website: true, description: true, city: true, region: true, priceMin: true, priceMax: true, verified: true, media: { select: { url: true, type: true } } },
  })
  console.log("\nSample (dj-azz):", JSON.stringify(sample, null, 2))
}
main().finally(() => prisma.$disconnect())
