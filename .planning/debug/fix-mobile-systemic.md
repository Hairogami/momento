# Mobile systemic fixes — summary

3 atomic systemic fixes applied across the app to address iOS Safari quirks
reported in the mobile audit.

## FIX 1 — `100vh` → `100dvh` (iOS Safari URL bar)
**Why** : iOS Safari resizes the viewport when the URL bar collapses on scroll.
`100vh` includes the toolbar height even when hidden, so content is cut off.
`100dvh` (dynamic viewport height) tracks the actual visible area.

**How** :
- Added `.min-h-screen-mobile` helper class in `src/app/globals.css` (with `100vh` → `100dvh` cascade fallback alongside the existing `.h-screen-mobile`).
- Replaced inline `minHeight: "100vh"` / `height: "100vh"` / `maxHeight: "100vh"` / `calc(100vh - …)` with `100dvh` directly in 42 component/page files.
- Replaced Tailwind `min-h-screen` class in `src/app/error.tsx` with `min-h-screen-mobile`.

**Files touched** : 43 (1 CSS + 42 .tsx)
- Layouts: `(legal)/layout.tsx`, `admin/layout.tsx`, `vendor/dashboard/layout.tsx`
- Loading skeletons (14): `accueil`, `budget`, `dashboard`, `dashboard/event-site`, `explore`, `favorites`, `guests`, `mes-prestataires`, `messages`, `notifications`, `planner`, `profile`, `settings`, `vendor/[slug]`
- Pages : `not-found`, `error`, `coming-soon`, `welcome-preview`, `login`, `signup`, `forgot-password`, `reset-password`, `upgrade`, `prestataires`, `pro`, `a-propos`, `mes-prestataires`, `settings`, `admin/{ranking,users,vendors}`, `dev`, `dev/event-site-playground`
- Clients : `explore/ExploreClient`, `vendor/[slug]/VendorProfileClient`, `dashboard/event-site/EventSiteList`, `dashboard/event-site/loading`
- Components : `clone/dashboard/DashSidebar`, `vendor/VendorSidebar`, `vendor/messages/VendorMessagesClient`, `event-site/EventSiteRenderer`, `event-site/ui/HeroSection`

**Excluded (P0 parallel agent)** : `DashboardClient.tsx`, `EventSiteEditor.tsx`, `AntNav.tsx` (already converted by parallel P0 task).

**100vh → 100dvh count** : 50 occurrences replaced across 43 files (1 CSS, 49 inline-style).

## FIX 2 — `safe-area-inset-top` on top headers (iOS notch)
**Why** : iOS PWA standalone / fullscreen pushes content under the status bar
+ notch unless `padding-top: env(safe-area-inset-top)` is applied to the top
header.

**How** : Added `paddingTop: "env(safe-area-inset-top)"` (or
`calc(<base> + env(safe-area-inset-top))` when a base padding existed) to every
page-level top header.

**Files touched** : 5
- `src/app/admin/layout.tsx` — admin sticky topbar
- `src/components/vendor/VendorTopBar.tsx` — vendor app sticky header
- `src/components/EmailVerificationBanner.tsx` — sticky verify banner
- `src/components/event-site/ui/SiteNav.tsx` — event-site fixed nav
- `src/components/skeleton/Skeleton.tsx` — DashTopbarMobileSkel

**Safe-area-inset-top count** : 5

**Excluded** :
- `AntNav.tsx` (P0 — handled by parallel agent)
- `EventSiteEditor.tsx` mobile tab strip (P0 — handled by parallel agent)
- `Calendar.tsx`, `DashSidebar.tsx`, `PlaygroundClient.tsx` (sticky/sticky-aside but not page-top headers)

## FIX 3 — `apple-touch-icon` + favicon variants
**Why** : iOS "Add to Home Screen" defaulted to a screenshot of the page
because no `<link rel="apple-touch-icon">` of size 180x180 was emitted.
manifest.json also referenced `/icon-192.png` and `/icon-512.png` that didn't
exist.

**How** :
- Created `public/apple-touch-icon.png`, `public/icon-192.png`,
  `public/icon-512.png` as copies of `public/favicon-momento.png` (512x512 brand
  badge — iOS scales appropriately at install time).
- Updated `metadata.icons` in `src/app/layout.tsx` to expose:
  - `icon[]` with explicit `sizes` for 192x192 and 512x512
  - `shortcut: "/favicon-momento.png"`
  - `apple[]` with `sizes: "180x180"`

**apple-touch-icon status** : DONE via copy of brand badge.
**TODO for user** : regenerate pixel-perfect 180x180, 192x192, 512x512 PNGs
from the high-res master logo to avoid scaling artifacts on retina displays.

## Commit SHAs
- FIX 1 : `e7e0810` — fix(mobile): replace 100vh with 100dvh fallback across 43 files (iOS Safari URL bar)
- FIX 2 : `5efa2b5` — fix(mobile): safe-area-inset-top on fixed/sticky top headers (iOS notch)
- FIX 3 : `b9864d5` — feat(mobile): apple-touch-icon + icon-192/512 variants in metadata

All pushed to `origin/main`.

## Build pass status
- `npx tsc --noEmit` : PASS (no errors after each fix)
- `npx next build` : PASS (full build completed successfully after FIX 3)
