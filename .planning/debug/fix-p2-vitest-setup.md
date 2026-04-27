# P2 — Vitest infrastructure + first unit tests

## Context
Avant ce changement : 0 test unitaire. Seulement Playwright E2E (`/e2e`).
Aucune protection contre les régressions silencieuses sur les helpers critiques (validations Zod, scoring, dédup RSVP, auth helpers).

## Infra installed

### Dependencies (devDependencies)
- `vitest@^4.1.5`
- `@vitest/ui@^4.1.5`
- `@testing-library/react@^16.3.2`
- `@testing-library/jest-dom@^6.9.1`
- `@testing-library/user-event@^14.6.1`
- `happy-dom@^20.9.0`

### Files
- `vitest.config.ts` — happy-dom env, globals, alias `@` → `./src`, exclude `e2e/`+`playwright/`
- `vitest.setup.ts` — imports `@testing-library/jest-dom/vitest`
- `.gitignore` — added `/.vitest-cache` (coverage was already ignored)

### npm scripts
- `test` → `vitest` (watch mode)
- `test:run` → `vitest run` (one-shot, used in CI)
- `test:ui` → `vitest --ui`

## Tests written

| File | Suites | Tests | Notes |
|------|--------|-------|-------|
| `src/lib/__tests__/validations.test.ts` | 11 schemas | 47 | All Zod schemas (Guest, Rsvp, Budget, Planner, Step, Message, Workspace, Review). Valid + invalid + edge cases (empty, max len, SQL-like strings, hex-color regex, datetime format) |
| `src/lib/__tests__/rankingScore.test.ts` | scoreVendor + sortByScore | 14 | Featured boost dominance, monotonicity, saturation caps (log-scale review, media cap at 10), determinism, no mutation. Mocked `@/lib/prisma`. |
| `src/lib/__tests__/completionScore.test.ts` | computeCompletion | 16 | Empty=0, full=100, clamping, partial categories pro-rata, vendor coverage ratio, RSVP excludes pending, null/undefined handling, integer output |
| `src/lib/__tests__/rsvpDedup.test.ts` | dedupRsvps | 12 | Email > phone > name precedence, case-insensitive, whitespace tolerant, most-recent wins, ISO string + Date input, sort desc, no input mutation |
| `src/lib/__tests__/api-auth.test.ts` | getUserId | 6 | IS_DEV branch toggle, null when no session, prod auth() vs dev requireSession() exclusivity. Mocks via `vi.mock` of `@/lib/auth` + `@/lib/devAuth` + `@/lib/devMock`. |

**Total : 5 files / ~95 test cases / 101 individual assertions**

## Run results
```
 Test Files  5 passed (5)
      Tests  101 passed (101)
   Duration  ~700ms
```

`npx tsc --noEmit` clean.

## Bugs found
**None.** All helpers behave per spec. Tests written from reading the source — they validate the existing contract, not bugs.

## Coverage notes
- Coverage tooling not installed yet (would need `@vitest/coverage-v8`). Can be added later via `npx vitest run --coverage` once package is added.
- Helpers covered: validations, rankingScore (scoreVendor/sortByScore — getRankingWeights skipped, DB-bound), completionScore, rsvpDedup, api-auth.
- **Not covered** (out of scope for this pass): `swipeStorage`, `eventLabel`, `cities`, `colors`, `eventSiteSlug`, `locationParser`, `vendorCoords`, `vendorQueries`, `planGate`, `eventTemplateMapping`. Candidates for next pass.

## Why these 5 helpers first
1. **validations** — every API route depends on it; bug = data corruption or auth bypass
2. **rankingScore** — drives `/explore` order; silently wrong = bad UX
3. **completionScore** — dashboard signal exposed to user; wrong number = lost trust
4. **rsvpDedup** — invité counts on dashboard; bug = wrong RSVP totals shown
5. **api-auth** — IS_DEV toggle; bug here = auth bypass in prod (high severity)

## Next steps (not in this commit)
- Add `@vitest/coverage-v8` for coverage reports
- Add tests for `vendorQueries.ts` (DB-bound — needs Prisma mock layer)
- Add tests for `swipeStorage.ts` (localStorage shim under happy-dom)
- Wire `test:run` into CI (Vercel/GitHub Actions)
