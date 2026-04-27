# Fix P2 — Eliminate dashboard hydration round-trip flash

## Goal

The dashboard had a 200–500 ms flash on every load: the RSC fetched planners,
the client hydrated, then `DashboardClient` fired `GET /api/planners/[id]/dashboard-data`
to fill the widgets. Visible result: widgets pop in 1–2 frames after the shell
paints.

Fix: pre-fetch the dashboard data during SSR (parallel to planners) and pass it
as `initialDashboardData` to `DashboardClient`. The client seeds its
`dashboardData` state from that prop on mount when the SSR-resolved planner
matches the localStorage-pinned one. The existing client-side fetch becomes the
"refetch" path (event switch, post-mutation, localStorage override).

## Function extracted

- **New file**: `src/lib/dashboardData.ts`
- **Export**: `buildDashboardData(plannerId, userId): Promise<DashboardData | null>`
- **Behavior**: identical to the route's previous handler. Performs IDOR check,
  returns `null` if planner missing or doesn't belong to user. Same response
  shape (typed via exported `DashboardData`).
- **Reused**: same `CATEGORY_COLORS`, `CATEGORY_ICONS`, `colorFor`, `iconFor`
  helpers (moved to the lib, no logic change).

## API route

- **Path**: `src/app/api/planners/[id]/dashboard-data/route.ts`
- **Before**: 226 lines (handler did all the data assembly inline).
- **After**: 18 lines. Thin HTTP wrapper:
  ```ts
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await buildDashboardData(id, userId)
  if (!data) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(data)
  ```
- **Still used by**: client refetches (event switch, post-mutation), and any
  external/future caller. Kept intentionally per task constraint.

## `page.tsx` parallel fetch pattern

```ts
// 1) auth → 2) Promise.all(planners, user) → 3) Promise.all wasn't needed
//    after that because dashboardData depends on the resolved active planner
//    id, but it runs in the same RSC pass (no HTTP hop).
const [planners, user] = await Promise.all([...])
let initialDashboardData: DashboardData | null = null
let initialActivePlannerId: string | null = null
if (planners.length > 0) {
  initialActivePlannerId = planners[0].id
  initialDashboardData = await buildDashboardData(initialActivePlannerId, userId)
}
```

The two awaits run sequentially because the second depends on `planners[0].id`
— but both are server-side direct DB calls (no HTTP). Total RTT cost: just
the DB round trips for the dashboard queries (which already run in their own
internal `Promise.all` of 6 parallel queries inside `buildDashboardData`).

## DashboardClient changes

New props:
- `initialDashboardData?: DashboardDataShape | null`
- `initialActivePlannerId?: string | null`

State seeding:
- `activeEventId` initial state now falls back to `initialActivePlannerId` when
  localStorage is empty or unavailable (SSR-safe).
- `dashboardData` initial state lazily reads `initialDashboardData` when the
  resolved active planner id matches the SSR-built one. If a stored
  `momento_active_event` differs from `initialActivePlannerId`, we fall back
  to `null` and the existing client-side `useEffect` fires the refetch path —
  same UX as before, but only for the minority case.

Existing behaviors preserved:
- The `useEffect([activeEventId])` still fetches all 3 endpoints on event
  switch (planner details, vendors, dashboard data). Optimistic updates
  (toggle task, add task) still mutate `dashboardData` locally.

## Constraints honored

- Data shape: unchanged (same JSON response from API; same `DashboardData`
  consumed by widgets).
- API route: kept (now a thin wrapper).
- IDOR: `buildDashboardData` performs the planner-belongs-to-user check
  before any data query.
- Conflict with parallel dark-mode agent: detected mid-edit (md5 changed
  from `d8bc19ca…` to `aee72059…`). Re-read modified prop section, confirmed
  the parallel agent only touched the dark-mode block (lines ~466–476) which
  is below my edits to props/state. No semantic conflict — both edits coexist.

## Verification

- `npx tsc --noEmit` → clean (pre-existing `rankingScore` errors fixed via
  `npx prisma generate` along the way; not part of this commit but unblocked
  the build).
- `npx next build` → passes. All routes including `/dashboard` and
  `/api/planners/[id]/dashboard-data` compile.
- TS errors in dashboard files: zero (`grep -E "dashboard"` on tsc output is empty).

## Expected user-visible result

- First paint of `/dashboard` already shows real data (no `0 / 0` widget flash).
- Switching events still triggers a refetch via the existing useEffect — same
  300 ms loading window for that case (acceptable: it's a deliberate user
  action, not first-load).
- Optimistic mutation paths unchanged.

## Files touched

- `src/lib/dashboardData.ts` (new, 271 lines)
- `src/app/api/planners/[id]/dashboard-data/route.ts` (226 → 18 lines)
- `src/app/dashboard/page.tsx` (39 → 60 lines)
- `src/app/dashboard/DashboardClient.tsx` (props + 2 state initializers)
