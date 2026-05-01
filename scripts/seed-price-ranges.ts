import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local before anything else
config({ path: resolve(process.cwd(), ".env.local") })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

const ranges = [
  { category: "Lieu de réception",         tier1Max: 10000, tier2Max: 25000, tier3Max: 50000 },
  { category: "Traiteur",                   tier1Max: 5000,  tier2Max: 15000, tier3Max: 30000 },
  { category: "Photographe",               tier1Max: 3000,  tier2Max: 7000,  tier3Max: 15000 },
  { category: "Vidéaste",                  tier1Max: 3000,  tier2Max: 8000,  tier3Max: 15000 },
  { category: "DJ",                         tier1Max: 2000,  tier2Max: 5000,  tier3Max: 10000 },
  { category: "Orchestre",                  tier1Max: 5000,  tier2Max: 15000, tier3Max: 30000 },
  { category: "Chanteur / chanteuse",       tier1Max: 2000,  tier2Max: 6000,  tier3Max: 15000 },
  { category: "Violoniste",                 tier1Max: 1500,  tier2Max: 4000,  tier3Max: 8000  },
  { category: "Décorateur",                 tier1Max: 3000,  tier2Max: 10000, tier3Max: 25000 },
  { category: "Fleuriste événementiel",     tier1Max: 2000,  tier2Max: 6000,  tier3Max: 15000 },
  { category: "Wedding planner",            tier1Max: 5000,  tier2Max: 15000, tier3Max: 40000 },
  { category: "Event planner",              tier1Max: 5000,  tier2Max: 15000, tier3Max: 40000 },
  { category: "Makeup Artist",              tier1Max: 1500,  tier2Max: 4000,  tier3Max: 8000  },
  { category: "Hairstylist",               tier1Max: 1000,  tier2Max: 3000,  tier3Max: 6000  },
  { category: "Neggafa",                    tier1Max: 2000,  tier2Max: 5000,  tier3Max: 10000 },
  { category: "Pâtissier / Cake designer",  tier1Max: 2000,  tier2Max: 6000,  tier3Max: 15000 },
  { category: "Service de bar / mixologue", tier1Max: 1500,  tier2Max: 4000,  tier3Max: 8000  },
  { category: "Robes de mariés",            tier1Max: 2000,  tier2Max: 7000,  tier3Max: 15000 },
  { category: "Magicien",                   tier1Max: 1500,  tier2Max: 4000,  tier3Max: 8000  },
  { category: "Animateur enfants",          tier1Max: 1500,  tier2Max: 4000,  tier3Max: 8000  },
]

async function main() {
  for (const r of ranges) {
    await prisma.categoryPriceRange.upsert({
      where: { category: r.category },
      create: r,
      update: { tier1Max: r.tier1Max, tier2Max: r.tier2Max, tier3Max: r.tier3Max },
    })
    process.stdout.write(".")
  }
  console.log(` done (${ranges.length} catégories)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
