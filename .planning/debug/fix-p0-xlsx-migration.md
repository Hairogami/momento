# P0 — xlsx → exceljs migration

**CVE:** GHSA-4r6h-8v6p-xvw6 (xlsx@0.18.5 prototype-pollution, no fix available)
**Decision:** replace `xlsx` with `exceljs` (maintained, no known CVE).

## Files migrated

| File | Change |
|------|--------|
| `src/app/api/planners/[id]/guests/export/route.ts` | Rewrote `xlsx` xlsx-format branch using `exceljs` Workbook/Worksheet API |
| `package.json` | `xlsx` removed, `exceljs ^4.4.0` added |
| `package-lock.json` | regenerated |

`src/components/guests/GuestsExportMenu.tsx` only triggers `window.location.href = .../guests/export?format=xlsx` — no code change needed.

## API differences encountered

| xlsx | exceljs |
|------|---------|
| `XLSX.utils.book_new()` | `new ExcelJS.Workbook()` |
| `XLSX.utils.json_to_sheet(rows)` | `workbook.addWorksheet(name)` + `sheet.columns = [{header,key,width},...]` + `sheet.addRow({...})` |
| `XLSX.utils.book_append_sheet(wb, sheet, name)` | implicit (sheet name passed to `addWorksheet`) |
| `XLSX.write(wb, { type: "buffer", bookType: "xlsx" })` (sync) | `await workbook.xlsx.writeBuffer()` (async, returns `ArrayBuffer`-like) |
| import: `await import("xlsx")` | import: `(await import("exceljs")).default` (CJS interop) |

Other notes:
- exceljs returns a buffer that types as `Excel.Buffer`. Cast to `ArrayBuffer` for `NextResponse` body: `new NextResponse(buf as ArrayBuffer, ...)`.
- Column widths added (xlsx version had no widths) — minor visual improvement, not a regression.
- Sheet names preserved: "Mes invités", "Réponses site". Header order preserved exactly.

## Build / typecheck status

- `npx tsc --noEmit` — clean (no errors).
- `npx next build` — **TypeScript Compiled successfully** (`✓ Compiled successfully in 3.4s`, `Finished TypeScript in 8.9s`).
- Build later fails at static-prerender step with `ECONNREFUSED` on `prisma.rankingConfig.findMany()` for `/explore` and missing `NEXT_PUBLIC_APP_URL` for email routes — both **pre-existing**, unrelated to xlsx migration (no DB / no env vars in the build sandbox here).
- `grep` of the build output confirmed zero references to `xlsx`, `exceljs`, or `guests/export` in any error.

## Smoke test

Not run end-to-end (requires running dev server + auth + planner with guests). Code path is straightforward: same input data shape → same sheet names → same column ordering → buffer returned with same `Content-Type` / `Content-Disposition` headers as before.

## Result

CVE GHSA-4r6h-8v6p-xvw6 eliminated by removing `xlsx` from dependency tree. `exceljs@4.4.0` has no known critical CVEs.
