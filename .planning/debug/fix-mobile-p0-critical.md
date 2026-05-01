# Fix mobile P0 critical (3 blockers)

**Date** : 2026-04-27
**Source** : `.planning/MOBILE_AUDIT.md` — 3 P0 qui bloquent l'usage mobile.
**Build** : `npx next build` → pass (TS clean, prerender complet).

---

## Fix #1 — EventSiteEditor unusable on mobile

**Fichier** : `src/app/dashboard/event-site/EventSiteEditor.tsx`

**Problème** : `gridTemplateColumns: "420px 1fr"` figé → preview off-screen sur mobile.

**Solution** : tabs Édition / Aperçu sur viewport ≤ 900px. Sur desktop, layout 2 colonnes inchangé.

**Changements clés** :
- Hook `isNarrow` (resize listener, breakpoint 900px) déterminant l'unique-vs-2-cols.
- State `mobilePane: "edit" | "preview"` ignoré sur desktop.
- Tabs sticky en haut (mobile only) : pill-style avec G gradient sur l'onglet actif (tokens `--g1` / `--g2`).
- `aside` et `section` masqués via `display: none` selon le pane mobile actif.
- `minHeight: 100vh` → `100dvh` (G1 audit).
- Frame mobile preview : `min(390px, calc(100% - 24px))` au lieu de `390` fixe → plus d'overflow horizontal sur 320px.
- Helper `mobileTabStyle()` ajouté à côté de `chipStyle()`.

**Lignes touchées** : ~70 lignes (delta), inclut le helper.

---

## Fix #2 — DashboardClient drag-and-drop touch

**Fichier** : `src/app/dashboard/DashboardClient.tsx`

**Problème** : HTML5 native drag (`draggable={true}`, `onDragStart`) non supporté tactile → impossible de réorganiser sur mobile.

**Solution** : détection `useIsMobile(900)` → `isTouch` ; sur touch, désactive HTML5 drag et expose boutons ↑ ↓ explicites.

**Changements clés** :
- Import `useIsMobile` (hook existant `src/hooks/useIsMobile.ts`).
- `WidgetCard` : 5 nouvelles props (`isTouch`, `canMoveUp`, `canMoveDown`, `onMoveUp`, `onMoveDown`).
- `draggable` et handlers `onDrag*` conditionnés (`isTouch ? undefined : ...`) → no-op tactile, comportement desktop préservé.
- Nouvelle fonction `moveWidget(id, dir)` dans le composant principal, réutilise la même source de vérité (`widgetOrder`) que le drag desktop.
- Boutons ↑ ↓ rendus dans l'overlay actions (44×44 touch target, `touchAction: "manipulation"`), toujours visibles en mode tactile (vs hover-only desktop), états disabled si début/fin de liste.
- Boutons "ouvrir" / "supprimer" agrandis à 36×36 en mode tactile (vs 22×22 desktop) — cohérent WCAG touch.
- Cursor : `default` en mode tactile (au lieu de `grab` qui n'a pas de sens).
- Texte toolbar adapté : "Boutons ↑ ↓ pour réorganiser" sur mobile.

**Lignes touchées** : ~80 lignes (delta).

**Note** : pas de @dnd-kit ajouté (contrainte respectée). La grille reste en grid 12 colonnes desktop, et le `globals.css` existant force `grid-column: span 1 !important` sur mobile via `dash-widget-grid > *`.

---

## Fix #3 — AntNav mobile menu UX

**Fichier** : `src/components/clone/AntNav.tsx`

**Problèmes** :
1. Pas de `paddingTop: env(safe-area-inset-top)` → logo/hamburger sous notch iOS landscape.
2. Mobile menu = dropdown sous la nav, sans backdrop, sans scroll lock → confus avec long contenu.

**Solution** :
1. `paddingTop: env(safe-area-inset-top)` ajouté au `<header>` fixe.
2. Mobile menu transformé en sheet plein écran (`position: fixed; inset: 0`) avec backdrop semi-transparent blur, scroll lock body, ESC + click backdrop pour fermer.

**Changements clés** :
- `header` : ajout `paddingTop: "env(safe-area-inset-top)"` dans le style inline.
- Nouveau `useEffect` dépendant de `menuOpen` : `body.style.overflow = "hidden"` + listener Escape, restauration en cleanup.
- Mobile menu déplacé hors du `</header>` (en root du fragment) avec `role="dialog" aria-modal="true"`.
- Backdrop : `rgba(0,0,0,0.65)` (dark) ou `rgba(18,19,23,0.45)` (light) avec `backdropFilter: blur(8px)`.
- Click sur backdrop → close. Click sur contenu → `stopPropagation`.
- Header de la sheet : titre "Menu" + bouton close 36×36 (touch target WCAG).
- Padding bottom : `calc(24px + env(safe-area-inset-bottom))` pour la home indicator iPhone X+.
- Padding top sur le wrapper backdrop : `env(safe-area-inset-top)` pour cohérence avec le header notch.
- Avatar agrandi à 36px (était 32) pour cohérence touch.
- CTA Connexion / S'inscrire en flex-column avec gap 8.

**Lignes touchées** : ~160 lignes (delta — restructure majeure du menu mobile).

---

## Validation

- `npx tsc --noEmit` après chaque fix → clean (0 erreur).
- `npx next build` après les 3 fixes → success (compile + prerender complet, 0 type error sur le code de production).

## Commits

À renseigner après commit. 3 commits atomiques :
1. `fix(event-site): tabs Édition/Aperçu mobile (P0)` — EventSiteEditor.tsx
2. `fix(dashboard): boutons ↑ ↓ réorganisation widgets mobile (P0)` — DashboardClient.tsx
3. `fix(nav): mobile menu plein écran + safe-area-inset-top (P0)` — AntNav.tsx

## Reste à faire (hors scope P0)

P0 résolus listés dans `.planning/MOBILE_AUDIT.md` mais non traités ici :
- G1 — `100vh` → `100dvh` global (46 fichiers — fix séparé)
- G2 — manifest.json + apple-touch-icon 180×180
- ExploreClient sticky filter bar `top: 56` non protégé safe-area-inset-top

Suggéré : 1 commit séparé `fix(global): 100vh → 100dvh sur les 46 occurrences` (mass replace, faible risque, ROI énorme iOS).
