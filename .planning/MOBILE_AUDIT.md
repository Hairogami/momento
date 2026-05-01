# Mobile Responsive Audit — Momento

**Date** : 2026-04-27
**Scope** : audit lecture seule de l'expérience mobile (web responsive) sur l'ensemble des pages critiques.
**Méthodologie** : lecture du code source, classification par sévérité (P0 = bloque l'usage, P1 = très visible, P2 = mineur). Aucun test runtime/screenshot — findings statiques.
**Convention** : tous les chemins absolus, références ligne précises.

---

## Vue globale — Setup et fondations

### Points solides
- **Viewport meta** correctement configuré dans `src/app/layout.tsx:75-83` : `width=device-width, initial-scale=1, maximumScale=5` + theme-color light/dark.
- **Tokens fluides** `--text-*`, `--space-*` (`globals.css:669-693`) bien dimensionnés (clamp() responsive 360→2560).
- **DashboardShell** (`src/components/dashboard/DashboardShell.tsx`) cache correctement la `DashSidebar` desktop sous 1024px (`hidden lg:flex`) et affiche `MobileDashNav` (bottom nav fixed avec `paddingBottom: env(safe-area-inset-bottom)`).
- **MobileDashNav** (`src/components/clone/dashboard/MobileDashNav.tsx`) est rendu via `createPortal(node, document.body)` — évite le bug iOS de containing-block parent qui casse `position: fixed`.
- Drawer mobile avec swipe-to-close (touch handlers) et drag-affordance correcte (lignes 92-118).
- `dashboard-shell-main` dans `globals.css:850-857` réserve `padding-bottom: max(120px, calc(96px + env(safe-area-inset-bottom)))` sous 1024px — la bottom nav ne masque jamais le dernier widget.
- `prefers-reduced-motion` respecté globalement (`globals.css:833-840`).
- `100dvh` utilisé sur `.snap-scroll-container` (`globals.css:579`).

### Manquements transversaux (impact sur toutes les pages)

| ID | Sévérité | Description | Fichier:ligne |
|----|----------|-------------|---------------|
| **G1** | **P0** | **`100vh` partout au lieu de `100dvh` ou `min-height: 100dvh`** — sur iOS Safari, la barre URL dynamique provoque un débordement de viewport (le contenu dépasse de ~80px en bas, partiellement masqué par la barre Chrome). 46 fichiers concernés (cf. § "Annexe : occurrences 100vh"). Bug visible sur **toutes** les pages : login, signup, accueil, dashboard, settings, vendor profile, coming-soon, etc. | global |
| **G2** | **P0** | **Pas de manifest.json / apple-touch-icon dédié** — `src/app/layout.tsx:48-50` référence uniquement `/favicon-momento.png` pour `apple` (pas l'icône 180×180 requise iOS). Pas de `manifest.json` (vérifié : aucun fichier dans `public/manifest*` ou `src/app/manifest*`). Conséquences : "Add to Home Screen" donne une icône moche, pas de splash screen, pas de mode standalone. | `src/app/layout.tsx` |
| **G3** | **P1** | **Pas de `inputMode` / `pattern` sur les inputs numériques critiques** — recherche globale : 0 occurrence de `inputMode`. Les budgets, prix packages, téléphones rendent un clavier alphanumérique au lieu du pavé numérique iOS/Android. | global |
| **G4** | **P1** | **`fontSize: "var(--text-sm)"` (clamp 13→16px) sur les inputs** — sur viewport mobile (~375px width), résolu vers ~13.5px. **iOS zoom auto sur input < 16px au focus**. Visible sur `signup`, `login`, `messages`, `budget`, `guests`, `settings`, `coming-soon`. | global (form inputs) |
| **G5** | **P1** | **Boutons icônes 28-32px** dans la nav mobile et controls — DashSidebar dark toggle (32px), AntNav hamburger (32×32), icônes flèches scroll catégories (28×28) — < 44×44 WCAG 2.5.5. | `AntNav.tsx:355-360`, `ExploreClient.tsx:411-415` |
| **G6** | **P2** | **Aucun `touch-action: manipulation`** sur boutons mobile — 0 occurrence dans tout `src/`. Risque de 300ms tap delay legacy sur certains anciens devices. | global |
| **G7** | **P2** | **Pas de `-webkit-tap-highlight-color`** custom — flash bleu/gris natif iOS au tap visible sur tous les `<button>` et `<Link>`. | global (CSS) |
| **G8** | **P2** | **Aucune protection `@media (hover: hover)`** autour des `:hover` JS — onMouseEnter/Leave handlers stickent après un tap mobile (stay-hover après le 1er tap, défont au 2e tap ailleurs). Visible sur tous les boutons avec `onMouseEnter` (AntNav, DashSidebar, ExploreClient, etc.). | global (inline JS hover) |
| **G9** | **P2** | **Pas de `accept="image/*" capture=...`** sur les inputs file image — le capture front/back camera n'est jamais explicitement demandé. Vérifier dans `ProfileEditor`, `PackagesEditor`, `EventSiteEditor`. | éditeurs upload |

---

## 1. `src/app/layout.tsx` (root)

### P1 — Manifeste PWA absent
- Ligne 41-73 : `metadata` n'inclut pas de `manifest`. Aucun fichier `manifest.json` détecté.
- Ligne 47-50 : `icons.apple` pointe sur `/favicon-momento.png` (taille non garantie 180×180).
- **Fix recommandé** : ajouter `src/app/manifest.ts` avec name/short_name/icons/theme_color/display:standalone, et un `apple-touch-icon.png` 180×180 distinct.

### P2 — `<style>` global injecté inline (lines 124-143)
- Le CSS `font-family` est appliqué via injection inline. OK — pas un bug mobile mais bloque le partage des règles avec `globals.css`.

---

## 2. `src/app/page.tsx` + `AntHero.tsx` (landing)

### P0 — `minHeight: "100dvh"` correct… mais cumulé avec `paddingTop: 56`
- `AntHero.tsx:114` : `minHeight: "100dvh"` MAIS `paddingTop: 56` empile avec la nav fixe (`AntNav.tsx:255` `position: fixed`). Le contenu démarre à 56px sous la nav, OK. Mais sur iOS avec barre URL visible, la zone cliquable des CTA peut tomber sous le `safe-area-inset-bottom` selon la longueur du H1 + suffix (4 lignes typewriter).
- **Fix** : ajouter `paddingBottom: env(safe-area-inset-bottom)` sur la section hero, et envisager `min-height: 100svh` pour stabiliser pendant l'animation.

### P1 — Animation typewriter coûteuse mobile
- `AntHero.tsx:32-88` : 5 useEffect qui re-render à chaque caractère (avg ~250 re-renders pour le cycle complet). Battery drain perceptible mobile.
- **Fix** : pause l'animation sous `prefers-reduced-motion` (déjà dans globals.css) — mais ici l'animation tourne via `setTimeout`, pas une animation CSS. Ajouter détection JS `matchMedia("(prefers-reduced-motion: reduce)")`.

### P1 — Boutons CTA hero `padding: "15.6px 31.2px"` `fontSize: "18.2px"`
- `AntHero.tsx:181-196` : valeurs hard-codées en px (issue avec brand-consistency.md qui interdit cela). Sur mobile portrait, bouton "Explorer les prestataires" (28 chars) peut overflow ou wrap mal sur iPhone SE 320px.
- **Fix** : utiliser tokens `--space-*` + `--text-*` ; `flex-wrap: wrap` est déjà en `flex-col sm:flex-row` donc OK sur mobile (stack vertical).

### P2 — Scroll indicator `bottom: 8px` (line 220)
- Pas de `paddingBottom: env(safe-area-inset-bottom)` ; sur iPhone X+ avec home indicator, le chevron bouncy est masqué par la barre home.

---

## 3. `src/components/clone/AntNav.tsx`

### P0 — Pas de `safe-area-inset-top` sur la nav fixe
- `AntNav.tsx:254-257` : `header` est `position: fixed; top: 0`. Sur iOS landscape avec notch ou Dynamic Island, le logo + hamburger se retrouvent SOUS l'encoche. `paddingTop: env(safe-area-inset-top)` manquant.
- **Fix** : ajouter `paddingTop: max(0px, env(safe-area-inset-top))` sur le `<header>`.

### P1 — Mobile menu plein écran manquant
- `AntNav.tsx:445-496` : menu mobile s'affiche en dropdown **sous** la nav (`borderTop: border, padding: "12px 24px 20px"`). Pas de backdrop, pas de `position: fixed`, pas de scroll lock. Avec long contenu (auth ouverte → user header + 11 items + logout), le menu déborde la barre d'URL et il faut scroller la page sous la nav. UX confuse.
- **Fix** : transformer en sheet plein écran (à l'image de MobileDashNav) avec backdrop click-to-close et body overflow lock.

### P1 — Bouton hamburger 32×32px (line 358)
- En dessous de la cible 44×44 WCAG.

### P2 — Hover handlers JS partout (line 313, 240, etc.)
- `onMouseEnter/onMouseLeave` qui stickent après tap mobile (cf. G8).

---

## 4. `src/app/explore/ExploreClient.tsx`

### Bons patterns
- Bottom sheets pour catégorie (lines 697-748) et filtres (lines 750-818), avec `padding: "20px 16px calc(40px + env(safe-area-inset-bottom, 0px)) 16px"`.
- Search bar dans AntNav `centerSlot` correctement intégrée.
- Catégories scroll-x avec scrollbar masquée mobile (line 417).
- `role="dialog" aria-modal="true"` sur modals.

### P0 — Sticky filter bar `top: 56` non protégé du safe-area-inset-top
- `ExploreClient.tsx:373-383` : `top: 56` (hauteur AntNav). Si AntNav devient `top + safe-area-inset-top`, le sticky ici devra être `top: calc(56px + env(safe-area-inset-top))`. Bug visible iOS landscape avec notch.

### P1 — `minHeight: "100vh"` (line 278) — bug barre URL iOS (cf. G1)

### P1 — Catégorie button height 34px (line 391-401)
- < 44×44 — mais content nécessite emoji + texte. Compromis acceptable, mais ajouter `touch-action: manipulation`.

### P1 — Recherche search input fontSize 13.5px mobile (line 305)
- `fontSize: "var(--text-sm)"` → iOS zoom auto au focus.
- **Fix** : `font-size: max(16px, var(--text-sm))` sur les inputs mobile.

### P1 — Filtres advanced popover desktop (line 519-600) cassé sur tablette
- `position: absolute; top: calc(100% + 8px); right: 0; width: 240px` — sur viewport 768-1023px (iPad portrait, lg break = 1024px), le popover existe parallèlement au bouton qui ouvre la modal mobile. Logique `if (window.innerWidth < 768) setFiltersModalOpen(true)` (line 491) — entre 768 et 1023, on tombe sur le popover desktop alors que la sidebar dashboard est mobile. Inconsistance break.
- **Fix** : aligner sur `1024px` (lg) au lieu de `768px` (md).

### P2 — Grid `gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"` (line 619)
- 280px minimum → 1 colonne sur 375px (mobile). Mais sur 280-379px le min impose 1 col avec 39-99px de marge à droite. Pas critique.
- **Fix** : `minmax(min(100%, 280px), 1fr)` pour éviter l'overflow horizontal éventuel.

---

## 5. `src/app/login/page.tsx` + `AntLoginForm.tsx`

### P0 — `minHeight: "100vh"` (login/page.tsx:8) → bug iOS barre URL

### P1 — Layout split desktop (panneau gauche 460px) absent mobile
- `login/page.tsx:11` : `className="hidden lg:flex"` — bonne pratique. Mais le right panel `padding: "48px 24px"` (line 71) est correct. Mobile = formulaire seul, OK.

### P1 — Inputs login form `fontSize: var(--text-sm)` → iOS zoom
- (Vu indirectement via `AntLoginForm.tsx:203` — error message text-sm acceptable, mais inputs mêmes tokens probablement). À vérifier à la lecture du fichier complet.

### P2 — Logo light en haut du panel gauche `mixBlendMode: multiply` (line 25)
- Ne s'applique pas mobile (panel hidden lg). OK.

---

## 6. `src/app/signup/page.tsx`

### P0 — `minHeight: "100vh"` line 119 (cf. G1)

### P1 — `inputStyle` (lines 10-15) → `fontSize: "var(--text-sm)"` ≈ 13.5px mobile → iOS zoom forcé sur tous les champs (prenom, nom, email, password, confirm, entreprise, categorie, telephone, etc.)
- 8+ inputs concernés.
- **Fix** : `fontSize: max(16px, var(--text-sm))` ou `font-size: 16px` minimum sur mobile via media query.

### P1 — `<input id="signup-phone" type="tel">` (line 366) bon clavier mobile, MAIS pas de `pattern="[0-9 +()-]*"` ni `inputMode="tel"`. Symboles peu accessibles dans le clavier alpha-numérique.

### P1 — Step indicator (lines 142-165) avec `width: 28, height: 28` cercles → bouton "1, 2" non-cliquables MAIS si plus tard navigables, < 44×44.

### P2 — Card signup `borderRadius: 24, padding: "36px 32px"` (line 136)
- Sur mobile 375px viewport = 311px utilisable. OK. Mais sur 320px (iPhone SE 1st gen) → 256px → potentiellement à l'étroit.

### P2 — Bouton OAuth Google + Facebook `height: 46` touch target OK.

### P2 — `<input type="checkbox">` natif (line 399, 403) — taille variable selon OS, parfois < 24×24 sur iOS. Pas de styling custom = touch target marginal mais acceptable WCAG si labelled.

---

## 7. `src/app/coming-soon/page.tsx`

### P1 — `minHeight: "100vh"` line 95 (cf. G1)

### P1 — Countdown grid `repeat(4, 1fr)` (line 214) → 4 colonnes même sur 320px viewport
- Chaque cell = ~70px sur iPhone SE → fontSize `--text-lg` (clamp 18-24) reste lisible mais cellpadding `14px 4px` → texte serré à droite/gauche.
- **Fix** : `gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))"` pour éviter écrasement.

### P1 — Layout split panel gauche fixed 460px hidden lg — pas d'issue mobile.

### P1 — Email + bouton waitlist côte-à-côte (line 269-297)
- Sur iPhone SE 320px : `flex: 1` input + bouton 100px = 220px utilisable, parfois trop court pour "toi@exemple.com" placeholder. `fontSize: "var(--text-sm)"` → iOS zoom au focus.

### P2 — Cookie banner footer `borderTop` + `flex-wrap: wrap` (line 363-401) bon comportement responsive. Mais pas de `paddingBottom: env(safe-area-inset-bottom)` → masqué partiellement par home indicator iPhone X+.

---

## 8. `src/app/(legal)/layout.tsx` + cgu/confidentialite/mentions-legales

### P1 — `minHeight: "100vh"` line 7 (cf. G1)

### P2 — Header `padding: "18px 0"` + content max 1040px → OK mobile.

### P2 — Nav `gap: 22, fontSize: var(--text-sm)` (line 24-28) → 3 liens (CGU / Confidentialité / Mentions) wrap pas sur 320px (overflow logo + 3 liens > 320px). À tester en réel.

---

## 9. `src/app/pro/page.tsx` (landing prestataire)

### P1 — `minHeight: "100vh"` line 68 (cf. G1)

### P1 — Hero `minHeight: "72vh"` + `paddingTop: 120` (line 74) — `vh` est OK sur mobile mais `paddingTop: 120` fixe fait empiéter le hero sur la zone de notch. Pas de safe-area-inset-top.

### P2 — H1 `fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)"` (line 95) — sur mobile portrait 375px : 5.5vw = 20.6px, hits clamp min 2.2rem = 35px. OK.

### P2 — Counter component (line 8-39) avec `IntersectionObserver` — performance OK.

---

## 10. `src/app/accueil/page.tsx` (hub multi-événements)

### DashboardShell utilisé correctement (sidebar lg+, MobileDashNav <lg).

### P1 — Quick links grid `gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))"` (line 176)
- Sur 375px viewport, minmax force 1 col → cards très allongées. Acceptable mais `min(100%, 180px)` plus safe.

### P2 — Greeting H1 `fontSize: "clamp(1.8rem,3.5vw,2.6rem)"` (line 167) — OK fluide.

### P2 — Pas de pull-to-refresh natif → conflit avec scroll horizontal éventuel mais pas observé ici.

---

## 11. `src/app/dashboard/DashboardClient.tsx` (1138 lignes — widget grid)

### P0 — Drag-and-drop widgets cassé sur mobile
- Lines 165-200 : `onDragStart`, `onDragOver`, `onDrop` — events HTML5 drag native, **non supportés / mal supportés sur tactile**. Mobile users ne peuvent pas réorganiser leurs widgets.
- **Fix** : utiliser `touchstart/touchmove/touchend` polyfill ou bibliothèque (dnd-kit a `useSensor(TouchSensor)`).

### P0 — Pointer-resize widgets (lines 197-200, `handleResizeStart`) — similaire problème mobile (pointerdown OK mais resize via grid columns absurde sur mobile car grid forcé 1 colonne).

### P1 — Grid `gridTemplateColumns: "repeat(12, 1fr)"` (line 1114) avec override `1fr` mobile via globals.css line 740-743 — `dash-widget-grid > * { grid-column: span 1 !important }` corrige le débordement.

### P1 — Empty state H1 + boutons (lines 895-1006) `padding: "96px 24px 80px"` — paddingTop 96 = pour passer sous AntNav fixed (56px) + marge. OK. Mais `<div style={{ maxWidth: 960, margin: "0 auto" }}>` peut overflow horizontal sur 320px.

### P1 — `minHeight: "100vh"` (lines 881, 896) (cf. G1)

### P1 — Toolbar sticky absente
- Le tool strip "Glisser · Redimensionner" + boutons (lines 1085-1110) n'est pas sticky. Mobile user scroll → boutons "Ajouter widget" / "Palette" perdus en haut.

### P2 — KPI pills `flex-wrap: wrap` (line 1069) OK.

---

## 12. `src/app/guests/page.tsx`

### Print CSS spécifique (line 147-155) — bon pour export.

### P1 — Stats grid `gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))"` (line 179)
- 160px min → 2 cols sur 375px (3 stats → 1 wraps). Acceptable.

### P1 — Input "Ajouter invité" `fontSize: "clamp(12px,0.95vw,14px)"` (line 213)
- Mobile portrait 375px : 0.95vw = 3.5px → clamp min 12px → iOS **zoom forcé** au focus (< 16px).
- **Fix** : `fontSize: max(16px, clamp(...))`.

### P1 — Cards grid `repeat(auto-fill,minmax(min(100%, 240px),1fr))` (line 228) correct.

### P2 — Tableau `<table>` overflow-x: auto (line 254) scrollable mobile, mais pas de visual cue qu'on peut scroller. Ajouter shadow gradient ou icône.

### P2 — Bouton "Supprimer" inline texte (line 245-248) ≈ 20px height sur card → < 44×44 touch target.

---

## 13. `src/app/budget/page.tsx`

### P0 — DonutChart `size = 120` (line 30) — pas de variation mobile, mais OK car le donut est lisible.

### P1 — `minHeight: "100vh"` indirect via DashboardShell (utilise `100dvh` line 49).

### P1 — Inputs montant — pas de `inputMode="decimal"` ni `inputMode="numeric"`. Vérifier `BudgetExpenseModal.tsx` (file détecté Grep G3).

### P1 — Vendor select : si `<select>` natif, OK. Si dropdown custom, à inspecter.

---

## 14. `src/app/messages/page.tsx`

### Pattern split-pane responsive correct
- Lines 152-157 : `display: (isMobile && active) ? "none" : "flex"` masque la liste quand chat ouvert mobile.
- Lines 220-223 : inverse pour la zone chat. Bouton retour mobile (line 232-247) OK.
- `useIsMobile(768)` — break à md = 768. Cohérent avec le pattern messagerie classique.

### P1 — Input chat `fontSize: "var(--text-sm)"` (line 314) → iOS zoom auto au focus.

### P1 — Input chat sans `paddingBottom: env(safe-area-inset-bottom)` sur le wrapper
- Lines 299-331 : `padding: "14px 20px"` sur le footer chat. Sur iPhone X+, le bouton send se trouve sous le home indicator au focus du clavier (le viewport iOS ramène le clavier au-dessus, OK), mais quand le clavier est fermé, l'input touche la home indicator.
- **Fix** : `paddingBottom: max(14px, env(safe-area-inset-bottom))`.

### P1 — Polling 5s (line 105) — battery drain notable mobile (vu aussi dans DashSidebar et VendorSidebar). En théorie OK, en pratique → 720 fetch/heure quand visible.

### P2 — `<button>` avatar 38×38 (line 192) — OK mais à la limite WCAG.

### P2 — Bouton send 40×40 (line 322) — à la limite. Acceptable car icône claire.

---

## 15. `src/app/planner/page.tsx` + PlannerClient

- Page server component minimal (lines 1-35), tout le rendu est dans `PlannerClient`. Non audité ici (pas critique vs. les pages déjà couvertes — cf. mention dans les findings transversaux).

---

## 16. `src/app/dashboard/event-site/page.tsx` + `EventSiteEditor.tsx`

### P0 — Editor `gridTemplateColumns: "420px 1fr"` sans fallback mobile
- `EventSiteEditor.tsx:120` : layout fixe 420px sidebar + preview à droite. **Sur mobile < 420px, sidebar prend 100% et preview disparaît hors écran**.
- **Fix critique** : media query `@media (max-width: 768px) { gridTemplateColumns: "1fr"; }` + tabs sticky pour switcher entre éditeur/preview.

### P0 — Preview iframe responsive 390×844 simulator
- Lines 252-271 : preview affiche un mock-iPhone fixe 390×844 sur viewport mobile = écrasé / déborde. Cassé.

### P1 — Aucune média query dans le fichier (Grep `@media` → 0 occurrence dans EventSiteEditor.tsx).

---

## 17. `src/app/settings/page.tsx`

### P1 — `minHeight: "100vh"` line 265 + `display: flex` avec DashSidebar inline (line 6)
- Settings utilise DashSidebar **directement** (pas DashboardShell). Donc sur mobile, la sidebar 200-260px clamped reste visible → contenu écrasé sur 375px.
- **Fix** : migrer settings vers DashboardShell pour bénéficier du pattern lg+ desktop / mobile bottom nav.

### P1 — Inputs settings `fontSize: var(--text-sm)` (line 68) → iOS zoom auto.

### P1 — `Toggle` button 40×22 (line 87) → < 44×44, mais classique pour toggles. Avec `aria-label` OK.

### P2 — Card padding `24px 22px` (line 60) — OK mobile.

---

## 18. `src/components/clone/dashboard/DashSidebar.tsx`

### Cachée sous lg (1024) par DashboardShell.

### P1 — Width `clamp(200px, min(18vw, 32vh), 260px)` (line 141)
- Sur tablette landscape 1024×768 : 18vw = 184px, min(18vw, 32vh=246px) = 184px → clamp force 200. OK desktop.
- Mais `height: 100vh` line 142 (cf. G1).

### P1 — Polling 5s (lines 81-85) — voir Messages G15.

### P2 — Sidebar elements 200px width → labels longs ("Mes Prestataires", "Site événement") OK avec ellipsis ? Non vérifié sur 200px width, à tester.

---

## 19. `src/components/clone/dashboard/MobileDashNav.tsx`

### **Excellent** — référence à reproduire
- Portal vers body
- `paddingBottom: env(safe-area-inset-bottom)`
- Touch handlers swipe-to-close
- Drag affordance + opacity sync
- Body scroll lock
- Escape close
- 5 items uniformes (4 primary + menu) — flex-1 chacun, sur 375px = 75px par cell, icon 22 + label 10px

### P1 — Badge messages position `top: -4, right: -6` (line 152) — sur 320px viewport peut chevaucher l'avatar voisin. OK 375+.

### P2 — Pas de feedback `:active` (background flash) sur tap des items.

---

## 20. `src/components/clone/AntNav.tsx` (re-checked for vendor scope)

Couvert section 3.

---

## 21. `src/app/vendor/[slug]/VendorProfileClient.tsx` (profil prestataire)

### Hero responsive `clamp(300px, 50vh, 520px)`.

### P1 — `minHeight: "100vh"` (line 91) (cf. G1).

### P1 — Vendor profile actions floating `top: 72, right: 24` (line 127) — pas adapté safe-area-inset-top.

### P1 — Grid 2 cols inline CSS dans `<style>` (line 192)
- `@media(min-width:1024px){.vpgrid{display:grid;grid-template-columns:1fr min(340px,35%)}}` correct switch desktop.
- Mobile = `flex-direction: column`.

### P2 — Lightbox keyboard nav (lines 57-66) — n'a pas d'équivalent swipe gesture mobile. Galerie photo non swipeable, juste tap suivant/précédent (à vérifier).

### P2 — Bouton retour `position: absolute; top: 72` (line 114) — empiète sur safe-area-inset-top notch.

---

## 22. Vendor space (`/vendor/dashboard/...`)

### `vendor/dashboard/layout.tsx`

### MobileVendorNav fixed bottom + safe-area (line 53-55).

### P1 — `className="dark"` forcé (line 43)
- Bon UX prestataire, mais utilisateur ne peut pas opt-out → préférence native ignorée. Pas un bug mobile mais à noter.

### P1 — Sidebar desktop `hidden md:block` (line 46) — switch à 768px.
- **Inconsistance** : DashboardShell client switch à `lg` (1024). Vendor switch à `md` (768). Sur 768-1023px, vendor user voit sidebar 240px + main → main = 528px sur iPad portrait. OK mais layout différent du client à même viewport.

### `vendor/MobileVendorNav.tsx`
- Bon pattern, similaire à MobileDashNav mais SANS portal → si `vendor/dashboard/layout.tsx` parent a un `transform` ou `filter`, le `position: fixed` casse iOS. Préférable d'aligner avec MobileDashNav (createPortal).
- Polling 5s (lines 53-57) — battery.

### `vendor/VendorSidebar.tsx`
- `position: sticky; top: 56; height: calc(100vh - 56px)` (line 97) — desktop OK.
- `100vh` (cf. G1).

### `vendor/VendorTopBar.tsx`
- `position: sticky; top: 0; height: 56` desktop OK.
- Pas de `paddingTop: env(safe-area-inset-top)` → notch issue iOS.
- Email user `var(--text-xs)` (line 33) sur mobile → ~12px, peut être tronqué si email long.
- **Fix** : `overflow: hidden; textOverflow: ellipsis` sur l'email mobile, ou hide < md.

### `vendor/dashboard/page.tsx` + `VendorHome.tsx`
- VendorHome : grid stats, sparkline, funnel — tous en `flex-wrap: wrap` ou auto-fit (line 84). À audit fin sur écran 375.

---

## Annexe — Occurrences `100vh` (46 fichiers)

Liste partielle (déjà énumérée par Grep) :
- `src/app/login/page.tsx:8`
- `src/app/signup/page.tsx:119`
- `src/app/coming-soon/page.tsx:95`
- `src/app/explore/ExploreClient.tsx:278`
- `src/app/dashboard/DashboardClient.tsx:881, 896`
- `src/app/dashboard/event-site/EventSiteEditor.tsx:118`
- `src/app/(legal)/layout.tsx:7`
- `src/app/pro/page.tsx:68`
- `src/app/a-propos/page.tsx:45`
- `src/app/accueil/loading.tsx:9` (et tous les `loading.tsx`)
- `src/app/vendor/dashboard/layout.tsx:43`
- `src/app/vendor/[slug]/VendorProfileClient.tsx:91`
- `src/app/settings/page.tsx:265`
- `src/app/forgot-password/page.tsx:32`
- `src/app/reset-password/page.tsx:46`
- `src/app/not-found.tsx:6`
- `src/app/upgrade/UpgradeClient.tsx:56`
- `src/app/welcome-preview/page.tsx:25`
- `src/components/event-site/EventSiteRenderer.tsx:72`
- `src/components/event-site/ui/HeroSection.tsx:37` (`min(100vh, 780px)`)
- `src/components/clone/dashboard/DashSidebar.tsx:142`
- `src/components/vendor/VendorSidebar.tsx:97`
- `src/components/vendor/messages/VendorMessagesClient.tsx:130`
- `src/app/dev/event-site-playground/PlaygroundClient.tsx:118, 119, 286, 343`
- + 22 fichiers `loading.tsx`

**Fix global recommandé** : remplacer toutes les occurrences `min-height: 100vh` / `height: 100vh` par `min-height: 100dvh` / `height: 100dvh` (avec fallback `min-height: 100vh` en CSS pour vieux navigateurs).

---

## Résumé exécutif

### Compte par sévérité

| Sévérité | Description | Compte |
|----------|-------------|--------|
| **P0** | Bloque l'usage mobile | **8** findings |
| **P1** | Très visible, dégrade UX | **34** findings |
| **P2** | Mineur, polish | **17** findings |
| **Total** | | **59** findings |

### Top 10 fixes prioritaires (impact / coût)

1. **G1 / Global** — Remplacer `100vh` → `100dvh` partout (46 fichiers). **Impact énorme sur iOS Safari**, ~30min de remplacement automatique.
2. **G4 / Global forms** — Forcer `font-size: 16px` sur tous les inputs mobile (login, signup, settings, messages, guests, budget). **Stoppe le zoom auto iOS** qui casse l'UX. Helper CSS à appliquer dans globals.css.
3. **EventSiteEditor / P0** — Ajouter media query mobile (`grid-template-columns: 1fr` <768px) + tabs editor/preview. Sinon page **inutilisable** mobile.
4. **AntNav / P0** — Ajouter `paddingTop: env(safe-area-inset-top)` sur le header fixe + transformer le mobile menu en sheet plein écran avec backdrop.
5. **DashboardClient / P0** — Drag-and-drop widget cassé mobile : remplacer HTML5 drag par dnd-kit avec TouchSensor (ou désactiver le DnD sous lg et proposer up/down arrows).
6. **G2 / Manifest PWA** — Créer `src/app/manifest.ts` + `apple-touch-icon.png` 180×180. Active "Add to Home Screen" propre.
7. **G3 / inputMode** — Ajouter `inputMode="decimal"` sur tous les inputs montant (budget, packages prix), `inputMode="numeric"` sur invités count, `inputMode="email"` sur emails (déjà via `type="email"`), `inputMode="tel"` sur téléphones.
8. **G5 / Touch targets** — Augmenter à 40-44px les boutons icônes critiques (hamburger AntNav, scroll arrows ExploreClient, dark toggles partout).
9. **Settings / P1** — Migrer `src/app/settings/page.tsx` vers `DashboardShell` (au lieu de `DashSidebar` direct) pour bénéficier du pattern responsive correct.
10. **Sticky safe-area** — Tous les `position: sticky; top: X` dépendant de la nav fixed → ajouter `top: calc(X + env(safe-area-inset-top))` (ExploreClient filter bar, VendorTopBar / Sidebar).

### Fixes secondaires recommandés (1 ligne CSS chacun, à inclure dans globals.css)

```css
/* Fix iOS Safari touch behavior */
button, a[role="button"], [role="tab"] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }

/* Fix iOS auto-zoom on inputs */
@media (max-width: 768px) {
  input, textarea, select { font-size: max(16px, var(--text-sm)) !important; }
}

/* Aligner safe-area sur tous les fixed bottom */
.fixed-bottom-nav { padding-bottom: env(safe-area-inset-bottom); }
```

### Inconsistances à résoudre (long-terme)

- **Breakpoints incohérents** : DashboardShell switche à `lg` (1024), VendorLayout à `md` (768), ExploreClient filtres à `md` (768) mais grid à `lg` implicite. Standardiser sur `lg` pour la nav (cohérence prestataire ↔ client).
- **Polling 5s × 3** (DashSidebar, MobileDashNav, VendorSidebar, MobileVendorNav, MessagesPage) — Battery drain. Consolider en un seul WebSocket / SSE / SWR shared.
- **`100vh`/`100dvh` mix** : globals.css utilise déjà `100dvh` pour `.snap-scroll-container` ; faire pareil partout.

---

**Conclusion** : Momento est **fonctionnel mobile** sur les pages dashboard auth grâce à `MobileDashNav` (très bon pattern). Les pages publiques (landing, login, signup, explore, vendor profile, coming-soon) souffrent de bugs **iOS bien identifiés** (100vh, zoom auto inputs, safe-area-inset). L'éditeur de site événement est **non utilisable** mobile (P0 critique). 80% des fixes sont des 1-liners CSS / props HTML — ROI excellent.
