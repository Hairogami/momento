import { describe, it, expect } from "vitest";
import {
  GuestPatchSchema,
  GuestCreateSchema,
  RsvpPatchSchema,
  GuestLinkSchema,
  BudgetItemPatchSchema,
  PlannerCreateSchema,
  PlannerPatchSchema,
  StepPatchSchema,
  MessageCreateSchema,
  WorkspacePatchSchema,
  ReviewCreateSchema,
} from "@/lib/validations";

describe("GuestCreateSchema", () => {
  it("accepts valid input", () => {
    const r = GuestCreateSchema.safeParse({ name: "Yasmine" });
    expect(r.success).toBe(true);
  });

  it("accepts optional email/phone/plannerId", () => {
    const r = GuestCreateSchema.safeParse({
      name: "Yasmine",
      email: "yasmine@test.com",
      phone: "+212600000000",
      plannerId: "ckxyz1234567890123456789",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty name", () => {
    const r = GuestCreateSchema.safeParse({ name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects name > 200 chars", () => {
    const r = GuestCreateSchema.safeParse({ name: "a".repeat(201) });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = GuestCreateSchema.safeParse({ name: "x", email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("accepts SQL-like injection strings (validation only blocks length/format)", () => {
    const r = GuestCreateSchema.safeParse({ name: "Robert'); DROP TABLE users;--" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid plannerId (not cuid)", () => {
    const r = GuestCreateSchema.safeParse({ name: "x", plannerId: "not-a-cuid" });
    expect(r.success).toBe(false);
  });
});

describe("GuestPatchSchema", () => {
  it("accepts valid rsvp enum", () => {
    for (const rsvp of ["yes", "no", "pending", "invited"] as const) {
      expect(GuestPatchSchema.safeParse({ rsvp }).success).toBe(true);
    }
  });

  it("rejects invalid rsvp value", () => {
    expect(GuestPatchSchema.safeParse({ rsvp: "maybe" }).success).toBe(false);
  });

  it("accepts tableNumber 0..9999", () => {
    expect(GuestPatchSchema.safeParse({ tableNumber: 0 }).success).toBe(true);
    expect(GuestPatchSchema.safeParse({ tableNumber: 9999 }).success).toBe(true);
  });

  it("rejects tableNumber out of range", () => {
    expect(GuestPatchSchema.safeParse({ tableNumber: -1 }).success).toBe(false);
    expect(GuestPatchSchema.safeParse({ tableNumber: 10000 }).success).toBe(false);
  });

  it("rejects non-integer tableNumber", () => {
    expect(GuestPatchSchema.safeParse({ tableNumber: 1.5 }).success).toBe(false);
  });

  it("accepts null email/phone (clearing fields)", () => {
    const r = GuestPatchSchema.safeParse({ email: null, phone: null });
    expect(r.success).toBe(true);
  });
});

describe("RsvpPatchSchema (strict)", () => {
  it("accepts valid input", () => {
    const r = RsvpPatchSchema.safeParse({
      guestName: "Omar",
      attendingMain: true,
      message: "Thanks!",
    });
    expect(r.success).toBe(true);
  });

  it("rejects extra/unknown fields (strict)", () => {
    const r = RsvpPatchSchema.safeParse({ guestName: "x", extra: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejects message > 1000 chars", () => {
    const r = RsvpPatchSchema.safeParse({ message: "a".repeat(1001) });
    expect(r.success).toBe(false);
  });

  it("accepts null for optional nullable fields", () => {
    const r = RsvpPatchSchema.safeParse({
      guestEmail: null,
      attendingDayAfter: null,
      message: null,
    });
    expect(r.success).toBe(true);
  });
});

describe("GuestLinkSchema", () => {
  it("accepts valid cuid", () => {
    const r = GuestLinkSchema.safeParse({ rsvpId: "ckxyz1234567890123456789" });
    expect(r.success).toBe(true);
  });

  it("rejects non-cuid", () => {
    expect(GuestLinkSchema.safeParse({ rsvpId: "abc" }).success).toBe(false);
  });

  it("rejects extra fields (strict)", () => {
    const r = GuestLinkSchema.safeParse({ rsvpId: "ckxyz1234567890123456789", evil: 1 });
    expect(r.success).toBe(false);
  });
});

describe("BudgetItemPatchSchema", () => {
  it("accepts valid input", () => {
    const r = BudgetItemPatchSchema.safeParse({ actual: 1000, estimated: 1500, paid: false });
    expect(r.success).toBe(true);
  });

  it("rejects negative amounts", () => {
    expect(BudgetItemPatchSchema.safeParse({ actual: -1 }).success).toBe(false);
    expect(BudgetItemPatchSchema.safeParse({ estimated: -100 }).success).toBe(false);
  });

  it("rejects Infinity / NaN", () => {
    expect(BudgetItemPatchSchema.safeParse({ actual: Infinity }).success).toBe(false);
    expect(BudgetItemPatchSchema.safeParse({ actual: NaN }).success).toBe(false);
  });

  it("accepts null actual (clearing)", () => {
    expect(BudgetItemPatchSchema.safeParse({ actual: null }).success).toBe(true);
  });

  it("rejects empty label", () => {
    expect(BudgetItemPatchSchema.safeParse({ label: "" }).success).toBe(false);
  });
});

describe("PlannerCreateSchema", () => {
  it("accepts valid input", () => {
    const r = PlannerCreateSchema.safeParse({ title: "Mariage 2026" });
    expect(r.success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(PlannerCreateSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("accepts ISO datetime with offset", () => {
    const r = PlannerCreateSchema.safeParse({
      title: "x",
      weddingDate: "2026-09-15T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    expect(
      PlannerCreateSchema.safeParse({ title: "x", weddingDate: "2026-09-15" }).success
    ).toBe(false);
  });

  it("accepts hex color #FF0033", () => {
    expect(PlannerCreateSchema.safeParse({ title: "x", coverColor: "#FF0033" }).success).toBe(true);
  });

  it("rejects 3-char hex / non-hex / wrong length", () => {
    expect(PlannerCreateSchema.safeParse({ title: "x", coverColor: "#FFF" }).success).toBe(false);
    expect(PlannerCreateSchema.safeParse({ title: "x", coverColor: "red" }).success).toBe(false);
    expect(PlannerCreateSchema.safeParse({ title: "x", coverColor: "#GGGGGG" }).success).toBe(false);
  });

  it("rejects negative budget", () => {
    expect(PlannerCreateSchema.safeParse({ title: "x", budget: -1 }).success).toBe(false);
  });
});

describe("PlannerPatchSchema (partial)", () => {
  it("accepts empty object (all optional)", () => {
    expect(PlannerPatchSchema.safeParse({}).success).toBe(true);
  });

  it("accepts only one field", () => {
    expect(PlannerPatchSchema.safeParse({ title: "Updated" }).success).toBe(true);
  });
});

describe("StepPatchSchema", () => {
  it("accepts valid status", () => {
    for (const s of ["todo", "in_progress", "done"] as const) {
      expect(StepPatchSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(StepPatchSchema.safeParse({ status: "blocked" }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(StepPatchSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("MessageCreateSchema", () => {
  it("accepts valid content", () => {
    expect(MessageCreateSchema.safeParse({ content: "Hello" }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(MessageCreateSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("rejects content > 5000 chars", () => {
    expect(MessageCreateSchema.safeParse({ content: "a".repeat(5001) }).success).toBe(false);
  });
});

describe("WorkspacePatchSchema", () => {
  it("accepts valid input", () => {
    const r = WorkspacePatchSchema.safeParse({
      eventName: "Mariage",
      budget: 50000,
      guestCount: 200,
      neededCategories: ["Photo", "DJ"],
    });
    expect(r.success).toBe(true);
  });

  it("rejects budget == 0 (must be positive)", () => {
    expect(WorkspacePatchSchema.safeParse({ budget: 0 }).success).toBe(false);
  });

  it("rejects guestCount < 1", () => {
    expect(WorkspacePatchSchema.safeParse({ guestCount: 0 }).success).toBe(false);
  });

  it("rejects > 50 categories", () => {
    const cats = Array.from({ length: 51 }, (_, i) => `cat${i}`);
    expect(WorkspacePatchSchema.safeParse({ neededCategories: cats }).success).toBe(false);
  });

  it("rejects budget over max", () => {
    expect(WorkspacePatchSchema.safeParse({ budget: 1_000_000_001 }).success).toBe(false);
  });
});

describe("ReviewCreateSchema", () => {
  it("accepts rating 1..5 with valid cuid", () => {
    const r = ReviewCreateSchema.safeParse({
      vendorId: "ckxyz1234567890123456789",
      rating: 5,
    });
    expect(r.success).toBe(true);
  });

  it("rejects rating 0 or 6", () => {
    const cuid = "ckxyz1234567890123456789";
    expect(ReviewCreateSchema.safeParse({ vendorId: cuid, rating: 0 }).success).toBe(false);
    expect(ReviewCreateSchema.safeParse({ vendorId: cuid, rating: 6 }).success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    expect(
      ReviewCreateSchema.safeParse({ vendorId: "ckxyz1234567890123456789", rating: 4.5 }).success
    ).toBe(false);
  });

  it("rejects comment > 2000 chars", () => {
    const r = ReviewCreateSchema.safeParse({
      vendorId: "ckxyz1234567890123456789",
      rating: 5,
      comment: "a".repeat(2001),
    });
    expect(r.success).toBe(false);
  });
});
