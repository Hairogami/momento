import { describe, it, expect } from "vitest"
import { BudgetItemCreateSchema, BudgetItemPatchSchema } from "../validations"
import { BUDGET_CATEGORIES, getCategory, isBudgetCategoryId } from "../budgetCategories"

describe("BudgetItemCreateSchema", () => {
  it("accepts a valid item", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "Photographe — acompte",
      category: "photographe",
      estimated: 5000,
    })
    expect(r.success).toBe(true)
  })

  it("accepts optional fields", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "Lieu",
      category: "lieu",
      estimated: 50000,
      actual: 48000,
      paid: true,
      vendorId: "cmabc123",
    })
    expect(r.success).toBe(true)
  })

  it("rejects empty label", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "",
      category: "lieu",
      estimated: 1000,
    })
    expect(r.success).toBe(false)
  })

  it("rejects negative estimated", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "Test",
      category: "divers",
      estimated: -100,
    })
    expect(r.success).toBe(false)
  })

  it("rejects non-finite estimated (Infinity, NaN)", () => {
    expect(BudgetItemCreateSchema.safeParse({ label: "X", category: "divers", estimated: Infinity }).success).toBe(false)
    expect(BudgetItemCreateSchema.safeParse({ label: "X", category: "divers", estimated: NaN }).success).toBe(false)
  })

  it("rejects label > 200 chars", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "x".repeat(201),
      category: "divers",
      estimated: 100,
    })
    expect(r.success).toBe(false)
  })

  it("rejects missing required fields", () => {
    expect(BudgetItemCreateSchema.safeParse({ category: "divers", estimated: 100 }).success).toBe(false)
    expect(BudgetItemCreateSchema.safeParse({ label: "X", estimated: 100 }).success).toBe(false)
    expect(BudgetItemCreateSchema.safeParse({ label: "X", category: "divers" }).success).toBe(false)
  })

  it("accepts vendorId null explicitly", () => {
    const r = BudgetItemCreateSchema.safeParse({
      label: "Test",
      category: "divers",
      estimated: 100,
      vendorId: null,
    })
    expect(r.success).toBe(true)
  })
})

describe("BudgetItemPatchSchema", () => {
  it("accepts partial update with single field", () => {
    expect(BudgetItemPatchSchema.safeParse({ paid: true }).success).toBe(true)
    expect(BudgetItemPatchSchema.safeParse({ label: "Renamed" }).success).toBe(true)
    expect(BudgetItemPatchSchema.safeParse({ category: "lieu" }).success).toBe(true)
  })

  it("accepts empty patch (no-op)", () => {
    expect(BudgetItemPatchSchema.safeParse({}).success).toBe(true)
  })

  it("rejects negative actual", () => {
    expect(BudgetItemPatchSchema.safeParse({ actual: -50 }).success).toBe(false)
  })

  it("accepts actual=null (clearing)", () => {
    expect(BudgetItemPatchSchema.safeParse({ actual: null }).success).toBe(true)
  })

  it("accepts vendorId null (unassigning)", () => {
    expect(BudgetItemPatchSchema.safeParse({ vendorId: null }).success).toBe(true)
  })
})

describe("BUDGET_CATEGORIES", () => {
  it("has 10 categories with stable ids", () => {
    expect(BUDGET_CATEGORIES.length).toBe(10)
    const ids = BUDGET_CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length) // unicité
  })

  it("ends with 'divers' (catch-all)", () => {
    expect(BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1].id).toBe("divers")
  })

  it("each category has hex color + icon name", () => {
    for (const c of BUDGET_CATEGORIES) {
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(c.icon.length).toBeGreaterThan(0)
      expect(c.label.length).toBeGreaterThan(0)
    }
  })

  it("getCategory returns 'divers' for unknown id", () => {
    expect(getCategory("foo-bar-unknown").id).toBe("divers")
  })

  it("getCategory returns the right category for known id", () => {
    expect(getCategory("photographe").label).toBe("Photographe")
    expect(getCategory("lieu").color).toBe("#E11D48")
  })

  it("isBudgetCategoryId type-guard", () => {
    expect(isBudgetCategoryId("lieu")).toBe(true)
    expect(isBudgetCategoryId("photographe")).toBe(true)
    expect(isBudgetCategoryId("custom-cat")).toBe(false)
    expect(isBudgetCategoryId("")).toBe(false)
  })

  it("uses brand-aligned colors (no sépia/terracotta from old design)", () => {
    const forbidden = ["#FFF7EE", "#9A3412", "#C4532A", "#FED7AA", "#F5EDD6", "#8B4513"]
    for (const c of BUDGET_CATEGORIES) {
      expect(forbidden.includes(c.color.toUpperCase())).toBe(false)
    }
  })
})
