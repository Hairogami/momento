# Fix Mobile P1 — findings non couverts

**Date** : 2026-04-27
**Source** : `.planning/MOBILE_AUDIT.md` — P1 résiduels après les agents foundations / forms / a11y / nav.
**Branche** : `main` (worktree `unruffled-wright-6c6cea`)

## Périmètre traité

11 findings P1 du rapport, regroupés en 4 commits atomiques :

### B. Polling rationalize (battery drain mobile)
- `src/app/messages/page.tsx` — chat actif 5s
- `src/components/MessageThread.tsx` — chat actif 5s
- `src/components/vendor/messages/VendorMessagesClient.tsx` — convs 30s + chat actif 5s

Pattern Page Visibility API (aligné sur `DashSidebar` / `VendorSidebar` / `MobileVendorNav`) :
- Quand `document.visibilityState !== "visible"` → `clearInterval` + `pollRef = null`
- `visibilitychange` listener → refresh immédiat au retour + restart interval
- Cleanup propre dans le `return` de l'effet

Économie : jusqu'à 720 fetch/heure quand l'app est en arrière-plan (3 onglets ouverts).

### C. Modal scroll lock body
- `src/components/budget/BudgetExpenseModal.tsx`
- `src/components/budget/DeleteConfirmModal.tsx`
- `src/components/SignupGateModal.tsx`
- `src/components/guests/LinkRsvpDialog.tsx` (+ `aria-modal="true"` + Escape)
- `src/app/dashboard/event-site/EventSiteList.tsx` (`OrphanPickerModal` interne)

Pattern : `useEffect` qui set `document.body.style.overflow = "hidden"` quand `open=true`, restore `prev` au cleanup. Compat SSR (`typeof document` check).

### Portal + truncate + perf liste
- `src/components/vendor/MobileVendorNav.tsx` — `createPortal` vers `document.body` (alignement avec `MobileDashNav`) + body lock + Escape close drawer
- `src/components/vendor/VendorTopBar.tsx` — email avec ellipsis `maxWidth: 200` + `hidden sm:inline-block` + `whiteSpace: nowrap` sur le retour-au-site
- `src/app/explore/ExploreClient.tsx` — `content-visibility: auto` + `contain-intrinsic-size: 360px` sur chaque card vendor + grid `minmax(min(100%, 280px), 1fr)` (fix overflow horizontal 320px)

### Safe-area + countdown grid
- `src/app/coming-soon/page.tsx` — countdown grid `repeat(auto-fit, minmax(70px, 1fr))` (évite écrasement iPhone SE) + cookie banner `paddingBottom: max(16px, env(safe-area-inset-bottom))`
- `src/app/messages/page.tsx` — chat input wrapper `paddingBottom: max(14px, env(safe-area-inset-bottom))`
- `src/components/vendor/messages/VendorMessagesClient.tsx` — idem

## Commits

| SHA | Description |
|-----|-------------|
| `c57c716` | perf(mobile/polling): pause message polling when tab hidden (battery) |
| `895dfd4` | fix(mobile/modals): lock body scroll when modal open (P1 audit) |
| `ec55f01` | fix(mobile): MobileVendorNav portal + email truncate + content-visibility explore |
| `b78e400` | fix(mobile): safe-area + countdown grid responsive (P1 audit) — rebase de `95759c8` sur `1500a7e` (StickyCta) |

Tous poussés sur `origin/main`. Build Next.js + tsc passent.

## TODOs déférés (avec raison)

- **Settings page → DashboardShell migration** (P1 §17) : touche `DashSidebar` (parallel agent), différé.
- **DashboardClient toolbar sticky** (P1 §11) : touche `DashboardClient.tsx` (blocked file).
- **AntHero scroll indicator safe-area-inset-bottom** (P2 §2) : `AntHero.tsx` — scope landing, agent landing recommandé.
- **EventSiteEditor mobile fixes** (P0 §16) : `EventSiteEditor.tsx` (blocked, déjà couvert par `a2e28c4`).
- **content-visibility sur `/guests`** : <100 invités typiquement → ROI faible, peut introduire des sauts de scroll via `contain-intrinsic-size`.
- **VendorProfileClient gallery scroll-snap** (E) : la galerie a déjà un scroll-x horizontal (thumbs). Lightbox + keyboard nav OK. Swipe natif iOS suffit pour scroll-x. Ajout scroll-snap = polish P2, différé.
- **Inputs file `accept="image/*" capture="environment"`** (G9) : nécessite audit des éditeurs (`ProfileEditor`, `PackagesEditor`) — différé.
- **Number formatting fr-FR** (G) : pas trouvé d'incohérence évidente sur mobile dans le scope — différé pour audit dédié.

## Verification

- `npx tsc --noEmit` : clean après chaque commit
- `npx next build` : 91/91 pages générées, "Compiled successfully in 7.0s"
- Rebase propre sur `1500a7e` (StickyCta), pas de conflit
- Pas de modification des fichiers verrouillés (DashboardClient, EventSiteEditor, AntNav, MobileDashNav, AntVendorCard, layout.tsx, globals.css)
