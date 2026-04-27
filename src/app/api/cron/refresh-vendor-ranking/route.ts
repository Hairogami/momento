/**
 * Cron — recalcule rankingScore pour TOUS les vendors et invalide le cache
 * de la liste publique. Programmé via vercel.json (cron: 0 3 * * * — daily 03:00 UTC).
 *
 * Auth : Vercel injecte automatiquement `authorization: Bearer ${CRON_SECRET}` sur
 * les invocations de cron. On valide ce header pour bloquer les appels externes.
 *
 * Performance : on traite tout en mémoire (≤ 50K vendors raisonnable) puis batch
 * les UPDATE. À très grande échelle, basculer sur des chunks paginés.
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRankingWeights, scoreVendor } from "@/lib/rankingScore"
import { bumpVersion } from "@/lib/cache"
import { captureError } from "@/lib/observability"

// Forcer Node.js runtime (Prisma incompatible Edge)
export const runtime = "nodejs"
// Cap raisonnable pour le cron (5 min). Ajuster si > 50K vendors.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const auth = req.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (!expected) {
    captureError(new Error("CRON_SECRET non configuré — refresh-vendor-ranking refusé"), {
      source: "cron.refresh-vendor-ranking",
      severity: "CRITICAL",
    })
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 })
  }
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    const weights = await getRankingWeights()

    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        featured: true,
        rating: true,
        reviewCount: true,
        _count: { select: { media: true } },
      },
    })

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
    }

    // Invalide le cache liste publique pour servir les nouveaux scores immédiatement.
    await bumpVersion("vendors")

    const durationMs = Date.now() - startedAt
    return NextResponse.json({
      ok: true,
      processed,
      durationMs,
    })
  } catch (e) {
    captureError(e, {
      source: "cron.refresh-vendor-ranking",
      severity: "ERROR",
    })
    return NextResponse.json(
      { error: "Refresh failed.", durationMs: Date.now() - startedAt },
      { status: 500 }
    )
  }
}
