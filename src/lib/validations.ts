import { z } from "zod"

// ── Guest ────────────────────────────────────────────────────────────────────
export const GuestPatchSchema = z.object({
  rsvp: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  table: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// ── Budget item ──────────────────────────────────────────────────────────────
export const BudgetItemPatchSchema = z.object({
  actual: z.number().nonnegative().finite().nullable().optional(),
  estimated: z.number().nonnegative().finite().optional(),
  name: z.string().min(1).max(200).optional(),
  paid: z.boolean().optional(),
})

// ── Planner ──────────────────────────────────────────────────────────────────
export const PlannerCreateSchema = z.object({
  title: z.string().min(1).max(200),
  coupleNames: z.string().max(200).optional(),
  weddingDate: z.string().datetime({ offset: true }).optional().nullable(),
  budget: z.number().nonnegative().finite().optional().nullable(),
  location: z.string().max(200).optional(),
  coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export const PlannerPatchSchema = PlannerCreateSchema.partial()

// ── Step ─────────────────────────────────────────────────────────────────────
export const StepPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  category: z.string().max(100).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
})

// ── Message ──────────────────────────────────────────────────────────────────
export const MessageCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  conversationId: z.string().cuid().optional(),
  vendorId: z.string().cuid().optional(),
})

// ── Workspace ────────────────────────────────────────────────────────────────
export const WorkspacePatchSchema = z.object({
  eventName: z.string().min(1).max(200).optional(),
  eventDate: z.string().datetime({ offset: true }).optional().nullable(),
  budget: z.number().positive().finite().max(1_000_000_000).optional().nullable(),
  guestCount: z.number().int().min(1).max(100_000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  neededCategories: z.array(z.string().max(100)).max(50).optional(),
})

// ── Review ───────────────────────────────────────────────────────────────────
export const ReviewCreateSchema = z.object({
  vendorId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
})
