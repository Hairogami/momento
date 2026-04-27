# Dashboard Refactor — Wire DashboardClient to extracted widgets

## Status
DONE

## Widgets wired (18/18)
1. NotesWidget
2. ProgressionWidget
3. ChecklistJXWidget
4. RSVPLiveWidget
5. MoodboardWidget
6. WeatherWidget
7. TransportWidget
8. ContratsWidget
9. CitationWidget
10. DepensesRecentesWidget
11. ObjectifEpargneWidget
12. RepartitionBudgetWidget
13. TimelineWidget
14. PlanTableWidget
15. RegimesWidget
16. AlertesWidget
17. CarteGeographiqueWidget
18. EnvoiFairepartWidget

## Widgets NOT wired
None — all 18 extracted widgets matched the inline call sites exactly. No prop adaptation required.

## Helpers/constants removed (only used by deleted widgets)
- `KpiCol`, `relativeTime` — only used inside RSVPLiveWidget
- `CONTRACT_CYCLE`, `CONTRACT_CFG` — only used inside ContratsWidget
- `CITATIONS_LIST` — only used inside CitationWidget
- `BUDGET_COLORS_LIST`, `donutPath` — only used inside RepartitionBudgetWidget
- `DIET_OPTIONS_LIST` — only used inside RegimesWidget
- `GEO_COLORS` — only used inside CarteGeographiqueWidget

Helpers kept (still used elsewhere in DashboardClient):
- `G` (gradient constant) — used by CountdownWidget area, banner, header, etc.
- `GIcon` — used by header, sidebar, task list
- `shortDate` — used by inline task list rendering
- Types `Task`, `Booking`, `Guest`, `Message`, `BookingStatus`, `TaskPriority` — used by orchestration logic

## Line count
- Before: 1923 lines
- After:  1142 lines
- Delta:  -781 lines (-40.6%)

## Verification
- `npx tsc --noEmit` → exit 0 (clean)
- `npx next build` → ✓ Compiled successfully + ✓ TypeScript clean + ✓ 92 static pages generated

## Strategy
- Single Python rewrite: insert 18 import statements after existing imports, then delete contiguous block lines 397–1195 (the entire inline widget definitions section).
- All call sites already used the correct names (e.g. `<NotesWidget …>`) — no orchestration changes needed.
