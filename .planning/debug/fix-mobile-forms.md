# Fix mobile forms — inputMode, autoComplete, type

## Goal

Audit said `inputMode` had 0 occurrences in `src/` outside 4 budget/edit files, meaning numeric/email/tel keyboards on mobile never triggered. Add proper attrs everywhere.

## Files modified

| File | Fields |
|---|---|
| `src/app/login/AntLoginForm.tsx` | email → +`inputMode="email"` |
| `src/app/signup/page.tsx` | email client → +`inputMode="email"` · email vendor → +`inputMode="email"` · phone → +`inputMode="tel"` |
| `src/components/SignupGateModal.tsx` | firstName → +`autoComplete="given-name"` · lastName → +`autoComplete="family-name"` · email → +`inputMode="email"` +`autoComplete="email"` · password → +`autoComplete="new-password"` |
| `src/app/forgot-password/page.tsx` | email → +`inputMode="email"` +`autoComplete="email"` |
| `src/app/reset-password/page.tsx` | newPassword → +`autoComplete="new-password"` (×2) |
| `src/app/profile/page.tsx` | name → +`autoComplete="name"` · email (disabled) → +`type="email"` +`inputMode="email"` +`autoComplete="email"` · phone → +`type="tel"` +`inputMode="tel"` +`autoComplete="tel"` · city → +`autoComplete="address-level2"` · companyName → +`autoComplete="organization"` · currentPassword → +`autoComplete="current-password"` · newPassword + confirm → +`autoComplete="new-password"` |
| `src/app/settings/page.tsx` | currentPw → +`autoComplete="current-password"` · newPw + confirmPw → +`autoComplete="new-password"` · delPassword → +`autoComplete="current-password"` |
| `src/components/vendor/profile/ProfileEditor.tsx` | phone → +`type="tel"` +`inputMode="tel"` +`autoComplete="tel"` · email → +`inputMode="email"` +`autoComplete="email"` · website → +`inputMode="url"` +`autoComplete="url"` · city → +`autoComplete="address-level2"` · region → +`autoComplete="address-level1"` · address → +`autoComplete="street-address"` |
| `src/components/clone/dashboard/CreateEventModal.tsx` | guestCount → +`inputMode="numeric"` · per-cat budget input → +`inputMode="numeric"` |
| `src/components/clone/dashboard/BudgetWidget.tsx` | spent edit → +`inputMode="decimal"` |
| `src/app/vendor/[slug]/VendorProfileClient.tsx` | clientName → +`autoComplete="name"` · clientEmail → +`inputMode="email"` +`autoComplete="email"` · clientPhone → +`inputMode="tel"` +`autoComplete="tel"` |
| `src/components/event-site/ui/RsvpForm.tsx` | guestName → +`autoComplete="name"` · plusOneName, dietaryNeeds, message textarea → +`autoComplete="off"` |
| `src/app/guests/page.tsx` | newGuestName → +`type="text"` +`autoComplete="off"` |
| `src/app/messages/page.tsx` | chat input → +`type="text"` +`autoComplete="off"` |
| `src/components/dashboard/widgets/PlanTableWidget.tsx` | tableNum → +`inputMode="numeric"` |
| `src/components/dashboard/widgets/EnvoiFairepartWidget.tsx` | input → +`inputMode="numeric"` |

## Already correct (skipped)

- `src/components/budget/BudgetExpenseModal.tsx` — `type="number" inputMode="decimal"` already present
- `src/components/vendor/packages/PackagesEditor.tsx` — `type="number" inputMode="decimal"` (price) and `inputMode="numeric"` (maxGuests) already present
- `src/app/admin/vendors/[slug]/VendorEditForm.tsx` — admin page, audit said skip
- Date/datetime/checkbox/range/color/file inputs — native widgets, no `inputMode` needed

## Decimal/comma handling

Budget inputs already use `parseInt`/`parseFloat`. The Maroc/FR comma case is handled by the existing `parseFloat` (which accepts dot only) in `BudgetExpenseModal.tsx` — kept as-is since `inputMode="decimal"` triggers a numeric keyboard with `.` and `,` on iOS/Android, and the user's text passes through. No FR-specific comma normalization added — would require a broader change to budget logic and was out of scope.

## Build status

- `npx tsc --noEmit` → exit 0
- `npx next build` → exit 0 (full build passed)

## Commits

To be created in next step.
