import { describe, it, expect } from "vitest";
import { computeCompletion, type CompletionInput } from "@/lib/completionScore";

const empty: CompletionInput = { planner: {} };

describe("computeCompletion", () => {
  it("returns 0 for an empty planner", () => {
    expect(computeCompletion(empty)).toBe(0);
  });

  it("returns 100 for a fully filled planner", () => {
    const cats = ["Photo", "DJ", "Traiteur"];
    const r = computeCompletion({
      planner: {
        eventType: "wedding",
        eventSubType: "civil",
        categories: cats,
        budget: 100000,
        budgetBreakdown: { Photo: 5000 },
        guestCount: 100,
      },
      vendors: [
        { vendor: { category: "Photo" }, status: "confirmed" },
        { vendor: { category: "DJ" }, status: "confirmed" },
        { vendor: { category: "Traiteur" }, status: "confirmed" },
      ],
      guests: [
        { rsvp: "yes" },
        { rsvp: "no" },
      ],
      tasks: [
        { done: true },
        { done: true },
      ],
    });
    expect(r).toBe(100);
  });

  it("clamps to [0, 100]", () => {
    expect(computeCompletion(empty)).toBeGreaterThanOrEqual(0);
    expect(computeCompletion(empty)).toBeLessThanOrEqual(100);
  });

  it("returns integer", () => {
    const r = computeCompletion({
      planner: { eventType: "wedding" },
      tasks: [{ done: true }, { done: false }, { done: false }],
    });
    expect(Number.isInteger(r)).toBe(true);
  });

  it("eventType alone = 5%", () => {
    expect(computeCompletion({ planner: { eventType: "wedding" } })).toBe(5);
  });

  it("eventType + eventSubType = 10%", () => {
    expect(
      computeCompletion({
        planner: { eventType: "wedding", eventSubType: "civil" },
      })
    ).toBe(10);
  });

  it("3+ categories = full 15%", () => {
    expect(
      computeCompletion({ planner: { categories: ["a", "b", "c"] } })
    ).toBe(15);
    expect(
      computeCompletion({ planner: { categories: ["a", "b", "c", "d"] } })
    ).toBe(15);
  });

  it("partial categories (1 of 3) = pro-rata", () => {
    expect(computeCompletion({ planner: { categories: ["a"] } })).toBe(5);
    expect(computeCompletion({ planner: { categories: ["a", "b"] } })).toBe(10);
  });

  it("budget number alone = 7.5 → rounded to 8", () => {
    expect(computeCompletion({ planner: { budget: 1000 } })).toBe(8);
  });

  it("budget + budgetBreakdown = 15%", () => {
    expect(
      computeCompletion({ planner: { budget: 1000, budgetBreakdown: { x: 10 } } })
    ).toBe(15);
  });

  it("vendors covered = ratio of categories covered (30% max)", () => {
    const r = computeCompletion({
      planner: { categories: ["Photo", "DJ"] },
      vendors: [{ vendor: { category: "Photo" } }],
    });
    // categories partial: 2/3 * 15 = 10
    // vendors covered: 1/2 * 30 = 15
    // total = 25
    expect(r).toBe(25);
  });

  it("vendors without categories declared = 0% vendor contribution", () => {
    const r = computeCompletion({
      planner: { categories: [] },
      vendors: [{ vendor: { category: "Photo" } }],
    });
    expect(r).toBe(0);
  });

  it("guestCount alone = 8%", () => {
    expect(computeCompletion({ planner: { guestCount: 100 } })).toBe(8);
  });

  it("guests responded fully = 8 + 7 = 15%", () => {
    const r = computeCompletion({
      planner: { guestCount: 2 },
      guests: [{ rsvp: "yes" }, { rsvp: "no" }],
    });
    expect(r).toBe(15);
  });

  it("pending guests do not contribute to RSVP score", () => {
    const r = computeCompletion({
      planner: { guestCount: 2 },
      guests: [{ rsvp: "pending" }, { rsvp: "pending" }],
    });
    expect(r).toBe(8); // only guestCount contributes
  });

  it("tasks: full done = 15%", () => {
    expect(
      computeCompletion({
        planner: {},
        tasks: [{ done: true }, { done: true }, { done: true }],
      })
    ).toBe(15);
  });

  it("tasks: half done = ~8%", () => {
    expect(
      computeCompletion({
        planner: {},
        tasks: [{ done: true }, { done: false }],
      })
    ).toBe(8); // 0.5 * 15 = 7.5 → rounded
  });

  it("is deterministic (same input → same score)", () => {
    const input: CompletionInput = {
      planner: { eventType: "wedding", categories: ["a", "b", "c"] },
    };
    expect(computeCompletion(input)).toBe(computeCompletion(input));
  });

  it("handles null/undefined fields gracefully", () => {
    const r = computeCompletion({
      planner: {
        eventType: null,
        eventSubType: null,
        categories: null,
        budget: null,
        guestCount: null,
      },
    });
    expect(r).toBe(0);
  });

  it("handles non-array categories gracefully", () => {
    const r = computeCompletion({
      planner: {
        // @ts-expect-error — testing runtime safety
        categories: "not-an-array",
      },
    });
    expect(r).toBe(0);
  });
});
