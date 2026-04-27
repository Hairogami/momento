/**
 * One-off : recalcule rankingScore pour tous les vendors et les persiste en DB.
 *
 * À lancer après avoir appliqué la migration schema (rankingScore + rankingUpdatedAt) :
 *   DATABASE_URL=$DIRECT_URL npx prisma db push
 *   npx tsx scripts/backfill-vendor-ranking.ts
 *
 * Idempotent : peut être rejoué sans danger (UPDATE écrase la valeur précédente).
 * Logs : progression toutes les 100 vendors.
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
import { scoreVendor, type RankingWeights } from "../src/lib/rankingScore"

dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

// Defaults — alignés sur src/lib/rankingScore.ts. On lit la table RankingConfig
// si elle existe pour respecter les overrides admin, sinon on utilise les defaults.
const DEFAULT_WEIGHTS: RankingWeights = {
  featured: 100,
  rating: 30,
  reviewCount: 20,
  mediaCount: 10,
}

async function loadWeights(): Promise<RankingWeights> {
  try {
    const configs = await prisma.rankingConfig.findMany()
    if (configs.length === 0) return DEFAULT_WEIGHTS
    const w = { ...DEFAULT_WEIGHTS }
    for (const c of configs) {
      if (c.signal in w) {
        (w as Record<string, number>)[c.signal] = c.weight
      }
    }
    return w
  } catch {
    return DEFAULT_WEIGHTS
  }
}

async function main() {
  const weights = await loadWeights()
  console.log("Weights:", weights)

  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      featured: true,
      rating: true,
      reviewCount: true,
      _count: { select: { media: true } },
    },
  })
  console.log(`→ ${vendors.length} vendors à scorer`)

  const now = new Date()
  let processed = 0

  for (const v of vendors) {
    const score = scoreVendor(
      {
        featured: v.featured,
        rating: v.rating,
        reviewCount: v.reviewCount,
        mediaCount: v._count.media,
      },
      weights
    )
    await prisma.vendor.update({
      where: { id: v.id },
      data: { rankingScore: score, rankingUpdatedAt: now },
    })
    processed++
    if (processed % 100 === 0) {
      console.log(`  ${processed}/${vendors.length} mis à jour`)
    }
  }

  console.log(`✅ Backfill terminé : ${processed} vendors`)
}

main()
  .catch(e => {
    console.error("❌ Backfill failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
