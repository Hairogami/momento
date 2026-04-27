import { describe, it, expect, vi } from "vitest";

// rankingScore imports prisma at the top — mock it so we can import scoreVendor / sortByScore
// without requiring a DB connection. getRankingWeights is not unit-tested here (DB-bound).
vi.mock("@/lib/prisma", () => ({
  prisma: {
    rankingConfig: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

import { scoreVendor, sortByScore, type RankingWeights } from "@/lib/rankingScore";

const W: RankingWeights = {
  featured: 100,
  rating: 30,
  reviewCount: 20,
  mediaCount: 10,
};

describe("scoreVendor", () => {
  it("returns 0 for empty vendor (no signals)", () => {
    expect(scoreVendor({ featured: false }, W)).toBe(0);
  });

  it("applies featured boost when featured=true", () => {
    const featured = scoreVendor({ featured: true }, W);
    const notFeatured = scoreVendor({ featured: false }, W);
    expect(featured - notFeatured).toBe(W.featured);
  });

  it("rating contributes proportionally to weight (5/5 = full weight)", () => {
    const top = scoreVendor({ featured: false, rating: 5 }, W);
    expect(top).toBeCloseTo(W.rating, 5);
  });

  it("rating 0 or null contributes 0", () => {
    expect(scoreVendor({ featured: false, rating: 0 }, W)).toBe(0);
    expect(scoreVendor({ featured: false, rating: null }, W)).toBe(0);
  });

  it("more reviews = higher score (monotonic)", () => {
    const a = scoreVendor({ featured: false, reviewCount: 0 }, W);
    const b = scoreVendor({ featured: false, reviewCount: 5 }, W);
    const c = scoreVendor({ featured: false, reviewCount: 50 }, W);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it("review score saturates (capped via Math.min(1, …))", () => {
    const huge = scoreVendor({ featured: false, reviewCount: 1_000_000 }, W);
    expect(huge).toBeLessThanOrEqual(W.reviewCount + 0.0001);
  });

  it("more media = higher score until 10 (saturates)", () => {
    const a = scoreVendor({ featured: false, mediaCount: 0 }, W);
    const b = scoreVendor({ featured: false, mediaCount: 5 }, W);
    const c = scoreVendor({ featured: false, mediaCount: 10 }, W);
    const d = scoreVendor({ featured: false, mediaCount: 100 }, W);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBe(d); // saturated
  });

  it("is deterministic (same input → same score)", () => {
    const v = { featured: true, rating: 4.2, reviewCount: 17, mediaCount: 8 };
    expect(scoreVendor(v, W)).toBe(scoreVendor(v, W));
  });

  it("featured boost dominates non-featured even with maxed signals", () => {
    const featuredEmpty = scoreVendor({ featured: true }, W);
    const ratedFull = scoreVendor(
      { featured: false, rating: 5, reviewCount: 1000, mediaCount: 100 },
      W
    );
    expect(featuredEmpty).toBeGreaterThan(ratedFull);
  });

  it("handles missing optional fields gracefully", () => {
    expect(() => scoreVendor({ featured: true }, W)).not.toThrow();
  });
});

describe("sortByScore", () => {
  it("sorts vendors descending by score", () => {
    const vendors = [
      { id: "a", featured: false, rating: 3 },
      { id: "b", featured: true },
      { id: "c", featured: false, rating: 5, reviewCount: 100 },
    ];
    const sorted = sortByScore(vendors, W);
    expect(sorted[0].id).toBe("b"); // featured wins
    expect(sorted[1].id).toBe("c");
    expect(sorted[2].id).toBe("a");
  });

  it("does not mutate the input array", () => {
    const vendors = [
      { id: "a", featured: false },
      { id: "b", featured: true },
    ];
    const original = [...vendors];
    sortByScore(vendors, W);
    expect(vendors).toEqual(original);
  });

  it("returns same length as input", () => {
    const vendors = [
      { id: "a", featured: false },
      { id: "b", featured: true },
      { id: "c", featured: false, rating: 4 },
    ];
    expect(sortByScore(vendors, W)).toHaveLength(3);
  });

  it("empty array returns empty array", () => {
    expect(sortByScore([] as { featured: boolean }[], W)).toEqual([]);
  });
});
