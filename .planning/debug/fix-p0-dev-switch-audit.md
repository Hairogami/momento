# P0 fix — Audit log on dev privilege-escalation routes

## Context (CONCERNS.md)

Routes `dev/switch-role` and `dev/switch-plan` are gated by:
- `process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview"` → 404 in pure prod, allowed on preview
- Email check: `session.user.email !== DEV_OWNER_EMAIL` → 403

Before this fix: any successful role/plan change on preview produced **no trace**. If `DEV_OWNER_EMAIL` session cookie were hijacked on a preview branch, an attacker could promote/demote roles silently.

## Routes modified

| Route | Action logged | Sites added |
|-------|---------------|-------------|
| `src/app/api/dev/switch-role/route.ts` | `dev.switch-role` | 2 (vendor → client branch + client → vendor branch) |
| `src/app/api/dev/switch-plan/route.ts` | `dev.switch-plan` | 1 (after plan update) |

## adminAudit signature used

From `src/lib/adminAudit.ts`:

```ts
logAdminAction({
  adminId:    string
  adminEmail: string
  action:     string
  targetType: string
  targetId:   string
  changes?:   AuditChange  // Record<string, { from: unknown; to: unknown }>
})
```

Calls follow the same pattern as the existing admin routes (`api/admin/users/[id]/route.ts`).

### Example (switch-role, vendor → client branch)

```ts
await logAdminAction({
  adminId:    user.id,
  adminEmail: user.email ?? DEV_OWNER_EMAIL,
  action:     "dev.switch-role",
  targetType: "User",
  targetId:   user.id,
  changes:    {
    role: { from: "vendor", to: "client" },
    env:  { from: null, to: process.env.VERCEL_ENV ?? "local" },
  },
})
```

### switch-plan diff

Snapshot of `plan` and `planExpiresAt` taken **before** `prisma.user.update`, so the audit log records true `from`/`to`.

`env` field captured (`process.env.VERCEL_ENV ?? "local"`) — visibility on whether the escalation happened on `preview`, `development`, or local.

## Gating before / after

### switch-role
- **Before**: `NODE_ENV==="production" && VERCEL_ENV!=="preview"` → 404 / `email !== DEV_OWNER_EMAIL` → 403. **No audit log.**
- **After**: same gating (unchanged — already correct per task brief). **Audit log on every successful role flip.**

### switch-plan
- **Before**: same gating. No audit log.
- **After**: same gating. Audit log captures `plan` + `planExpiresAt` diff + env.

Gating itself was **not tightened** — existing checks already enforce `email === DEV_OWNER_EMAIL` strictly. The fix is purely additive (audit trail).

## Failure mode

`logAdminAction` wraps the Prisma write in `try/catch` → audit log failure does **not** block the role/plan switch. Any DB error is `console.error`'d.

## Verification

- `npx tsc --noEmit` → exit 0, no output, clean pass
- Grep `logAdminAction\(` in `src/app/api/dev` → 3 hits (switch-role L36, switch-role L93, switch-plan L54)
- Underlying role/plan logic untouched

## Coût de ne pas faire

If a preview deploy got compromised, role/plan changes would happen without leaving a forensic trail. With audit: full diff (`from`/`to` + env) lands in `AdminAuditLog` indexed by `[adminId, createdAt]` — queryable in Prisma Studio for incident response.
