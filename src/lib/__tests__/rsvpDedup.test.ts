import { describe, it, expect } from "vitest";
import { dedupRsvps, type RsvpForDedup } from "@/lib/rsvpDedup";

const make = (
  id: string,
  fields: Partial<RsvpForDedup> & { createdAt: Date | string }
): RsvpForDedup => ({
  id,
  guestName: fields.guestName ?? "Anonymous",
  guestEmail: fields.guestEmail ?? null,
  guestPhone: fields.guestPhone ?? null,
  createdAt: fields.createdAt,
});

describe("dedupRsvps", () => {
  it("returns empty array for empty input", () => {
    expect(dedupRsvps([])).toEqual([]);
  });

  it("keeps single rsvp untouched", () => {
    const r = make("a", { guestEmail: "x@y.com", createdAt: new Date(1000) });
    expect(dedupRsvps([r])).toEqual([r]);
  });

  it("dedups by email (case-insensitive)", () => {
    const a = make("a", { guestEmail: "X@y.com", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "x@Y.COM", createdAt: new Date(2000) });
    const out = dedupRsvps([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("b"); // most recent kept
  });

  it("dedups by email (whitespace tolerant)", () => {
    const a = make("a", { guestEmail: "  x@y.com  ", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "x@y.com", createdAt: new Date(2000) });
    expect(dedupRsvps([a, b])).toHaveLength(1);
  });

  it("different emails produce separate records", () => {
    const a = make("a", { guestEmail: "x@y.com", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "z@y.com", createdAt: new Date(2000) });
    expect(dedupRsvps([a, b])).toHaveLength(2);
  });

  it("dedups by phone if no email (whitespace stripped)", () => {
    const a = make("a", { guestPhone: "+212 600 00 00 00", createdAt: new Date(1000) });
    const b = make("b", { guestPhone: "+212600000000", createdAt: new Date(2000) });
    const out = dedupRsvps([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("b");
  });

  it("dedups by name if no email/phone (lowercase)", () => {
    const a = make("a", { guestName: "Yasmine", createdAt: new Date(1000) });
    const b = make("b", { guestName: "YASMINE", createdAt: new Date(2000) });
    const out = dedupRsvps([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("b");
  });

  it("email takes precedence over phone for keying", () => {
    const a = make("a", { guestEmail: "x@y.com", guestPhone: "+212600000000", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "z@y.com", guestPhone: "+212600000000", createdAt: new Date(2000) });
    // Different email → both kept even though phone is the same
    expect(dedupRsvps([a, b])).toHaveLength(2);
  });

  it("keeps the most recent record on conflict", () => {
    const older = make("old", { guestEmail: "x@y.com", createdAt: new Date(1000) });
    const newer = make("new", { guestEmail: "x@y.com", createdAt: new Date(5000) });
    const out = dedupRsvps([newer, older]); // any order
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("new");
  });

  it("handles ISO string createdAt", () => {
    const a = make("a", { guestEmail: "x@y.com", createdAt: "2026-01-01T00:00:00.000Z" });
    const b = make("b", { guestEmail: "x@y.com", createdAt: "2026-02-01T00:00:00.000Z" });
    const out = dedupRsvps([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("b");
  });

  it("returns records sorted by createdAt desc", () => {
    const a = make("a", { guestEmail: "a@y.com", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "b@y.com", createdAt: new Date(3000) });
    const c = make("c", { guestEmail: "c@y.com", createdAt: new Date(2000) });
    const out = dedupRsvps([a, b, c]);
    expect(out.map(r => r.id)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate input array", () => {
    const a = make("a", { guestEmail: "x@y.com", createdAt: new Date(1000) });
    const b = make("b", { guestEmail: "x@y.com", createdAt: new Date(2000) });
    const arr = [a, b];
    const original = [...arr];
    dedupRsvps(arr);
    expect(arr).toEqual(original);
  });
});
