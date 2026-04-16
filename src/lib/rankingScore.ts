/**
 * Smart ranking partagé pour les prestataires.
 * Utilisé par : GET /api/vendors + getAllVendorsForExplore()
 * Admin-configurable via RankingConfig en DB.
 */
import { prisma } from "@/lib/prisma"

export type RankingWeights = {
  featured: number
  rating: number
  reviewCount: number
  mediaCount: number
}

const DEFAULTS: RankingWeights = {
  featured: 100,
  rating: 30,
  reviewCount: 20,
  mediaCount: 10,
}

// Module-level cache (survit aux requêtes dans le même process)
let _cached: RankingWeights | null = null
let _expiry = 0
const TTL = 5 * 60 * 1000 // 5 min

export async function getRankingWeights(): Promise<RankingWeights> {
  if (_cached && Date.now() < _expiry) return _cached

  let configs = await prisma.rankingConfig.findMany()

  if (configs.length === 0) {
    // Seed defaults si table vide
    await prisma.rankingConfig.createMany({
      data: [
        { signal: "featured",     weight: 100, label: "Partenaire premium" },
        { signal: "rating",       weight: 30,  label: "Note moyenne (0-5)" },
        { signal: "reviewCount",  weight: 20,  label: "Nombre d'avis" },
        { signal: "mediaCount",   weight: 10,  label: "Photos" },
      ],
      skipDuplicates: true,
    })
    configs = await prisma.rankingConfig.findMany()
  }

  const weights = { ...DEFAULTS }
  for (const c of configs) {
    if (c.signal in weights) {
      (weights as Record<string, number>)[c.signal] = c.weight
    }
  }

  _cached = weights
  _expiry = Date.now() + TTL
  return weights
}

/** Invalide le cache (appelé après un PATCH /api/admin/ranking) */
export function invalidateRankingCache() {
  _cached = null
  _expiry = 0
}

type Scorable = {
  featured: boolean
  rating?: number | null
  reviewCount?: number
  mediaCount?: number // nombre de médias (optionnel si calculé ailleurs)
}

export function scoreVendor(v: Scorable, w: RankingWeights): number {
  const featuredScore  = v.featured ? w.featured : 0
  const ratingScore    = ((v.rating ?? 0) / 5) * w.rating
  // log scale pour ne pas écraser les petits vendors avec 5 avis
  const reviewScore    = Math.min(1, Math.log10((v.reviewCount ?? 0) + 1) / 2) * w.reviewCount
  const mediaScore     = Math.min(1, (v.mediaCount ?? 0) / 10) * w.mediaCount
  return featuredScore + ratingScore + reviewScore + mediaScore
}

export function sortByScore<T extends Scorable>(vendors: T[], weights: RankingWeights): T[] {
  return [...vendors].sort((a, b) => scoreVendor(b, weights) - scoreVendor(a, weights))
}
