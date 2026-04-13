import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  await prisma.vendorMedia.deleteMany({ where: { vendor: { slug: "studio-lumiere-casablanca" } } }).catch(() => {})
  await prisma.vendor.deleteMany({ where: { slug: "studio-lumiere-casablanca" } }).catch(() => {})

  const vendor = await prisma.vendor.create({
    data: {
      slug: "studio-lumiere-casablanca",
      name: "Studio Lumière Casablanca",
      category: "Photographe",
      description:
        "Studio de photographie événementielle basé à Casablanca. Spécialisé dans les mariages, fiançailles et événements corporate. Plus de 200 événements réalisés depuis 2018. Notre équipe capture chaque instant avec une sensibilité artistique unique, mêlant style contemporain et tradition marocaine.",
      city: "Casablanca",
      region: "Grand Casablanca-Settat",
      address: "45 Boulevard Anfa, Casablanca 20000",
      lat: 33.595,
      lng: -7.632,
      phone: "+212 6 61 23 45 67",
      email: "contact@studiolumiere.ma",
      website: "https://studiolumiere.ma",
      instagram: "studiolumiere_casa",
      facebook: "https://facebook.com/StudiolumiereCasa",
      priceMin: 8000,
      priceMax: 25000,
      priceRange: "mid",
      rating: 4.8,
      reviewCount: 3,
      verified: true,
      featured: true,
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=1000&fit=crop&q=80",
            order: 0,
            type: "image",
            caption: "Mariage en plein air",
          },
          {
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&q=80",
            order: 1,
            type: "image",
            caption: "Cérémonie traditionnelle",
          },
          {
            url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1000&fit=crop&q=80",
            order: 2,
            type: "image",
            caption: "Réception de mariage",
          },
        ],
      },
    },
    include: { media: true },
  })

  console.log(`✅ ${vendor.name} créé`)
  console.log(`   slug: ${vendor.slug}`)
  console.log(`   verified: ${vendor.verified}`)
  console.log(`   photos: ${vendor.media.length}`)
  console.log(`   url: http://localhost:3000/vendor/${vendor.slug}`)
}

main()
  .catch((e) => console.error("❌", e.message))
  .finally(() => prisma.$disconnect())
