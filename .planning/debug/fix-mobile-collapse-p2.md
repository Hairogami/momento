# Fix mobile : collapse-all + 5 P2 audit findings

**Date** : 2026-04-28
**Auteur** : agent unruffled-wright
**Scope** : DashboardClient collapse-all (skipped par previous agent) + 5 P2 audit picks
**Build** : `npx next build` clean · `npx tsc --noEmit` clean
**Push** : origin/main (autorisé autonomous mobile)

---

## 1. DashboardClient collapse-all

### Problème
Audit P1 noté ~4000 px de scroll sur dashboard mobile (8-12 widgets empilés en 1 colonne).
Refus de l'accordion-by-category (cassait drag-and-drop). Alternative légère : 1 toggle global.

### Implémentation (commit `d53c1cb`)
Fichier : `src/app/dashboard/DashboardClient.tsx`

| Bloc | Localisation | Détail |
|------|--------------|--------|
| State | ~ligne 538 | `const [allCollapsed, setAllCollapsed] = useState(false)` |
| Hydration | nouveau bloc après les autres effects | `useEffect(() => { setAllCollapsed(localStorage.getItem("dashboard_all_collapsed") === "1") }, [])` |
| Persistence | même bloc | `useEffect(() => localStorage.setItem("dashboard_all_collapsed", allCollapsed ? "1" : "0"), [allCollapsed])` |
| Prop WidgetCard | signature ~ligne 188 | `collapsed?: boolean` |
| Wrapper override | style ~ligne 263 | `gridRow: collapsed ? "span 1" : ...` + `minHeight:0, height:auto, alignSelf:start` quand collapsed |
| Title strip | nouveau bloc avant children | quand `collapsed` : barre de titre 56px avec `<span>{title}</span>` ellipsis + paddingRight:96 (laisse place aux boutons overlay) |
| Children | wrapper existant | `display: collapsed ? "none" : undefined` |
| Resize handles | tous les 5 | wrappés dans `{!collapsed && (<>…</>)}` (rien à redimensionner en mode compact) |
| Toggle button | toolbar ligne ~1135 | mobile-only (`isTouch`), pill rose quand actif, icon `unfold_less`/`unfold_more` |

### Préservé
- Drag-and-drop desktop (collapsed inactif, isTouch=false)
- Boutons Monter/Descendre mobile (overlay top:8 right:8 visible même en mode collapsed)
- Drop target highlight (overlay zIndex 10 reste fonctionnel)

### Validation
- TypeScript : clean
- Build Next.js : clean
- Logic : `isTouch && allCollapsed` — desktop ne peut pas accidentellement déclencher

---

## 2. 5 P2 fixes appliqués

Top 5 ROI parmi les 17 P2 du `MOBILE_AUDIT.md`. Critères : 1-line CSS, visible, pas couvert par les vagues précédentes.

### Fix A · Hero scroll indicator safe-area (commit `720e46f`)
- **Fichier** : `src/components/clone/AntHero.tsx:225`
- **Audit** : "Scroll indicator `bottom: 8px` (line 220) — pas de `paddingBottom: env(safe-area-inset-bottom)` ; sur iPhone X+ le chevron bouncy est masqué par la barre home"
- **Change** : Tailwind `bottom-8` → `bottom: max(32px, calc(env(safe-area-inset-bottom) + 16px))`

### Fix B · Vendor profile back button safe-area (commit `720e46f`)
- **Fichier** : `src/app/vendor/[slug]/VendorProfileClient.tsx:114`
- **Audit** : "Bouton retour `position: absolute; top: 72` (line 114) — empiète sur safe-area-inset-top notch"
- **Change** : `top: 72` → `top: "calc(72px + env(safe-area-inset-top))"`

### Fix C · Vendor profile floating actions safe-area (commit `720e46f`)
- **Fichier** : `src/app/vendor/[slug]/VendorProfileClient.tsx:127`
- **Audit** : "Vendor profile actions floating `top: 72, right: 24` (line 127) — pas adapté safe-area-inset-top"
- **Change** : même fix que Fix B sur le wrapper des boutons favori/share

### Fix D · Tableaux guests scroll cue (commit `addae9e`)
- **Fichier** : `src/app/guests/page.tsx:259, 343` (deux tables : invités + RSVPs)
- **Audit** : "Tableau `<table>` overflow-x: auto (line 254) scrollable mobile, mais pas de visual cue qu'on peut scroller. Ajouter shadow gradient ou icône."
- **Change** : ajout d'un overlay `<div aria-hidden>` de 24px sur le bord droit avec `linear-gradient(to left, var(--dash-surface,#fff) 0%, transparent 100%)` — fade-out qui suggère le scroll horizontal

### Fix E · Bouton Supprimer touch target (commit `addae9e`)
- **Fichier** : `src/app/guests/page.tsx:251-254`
- **Audit** : "Bouton 'Supprimer' inline texte (line 245-248) ≈ 20px height sur card → < 44×44 touch target"
- **Change** : `padding: 0` → `padding: "8px 4px", minHeight: 36, touchAction: "manipulation"`. Cible WCAG 44 raisonnable pour un lien texte secondaire (24→36px hauteur cliquable).

### P2 audit items NON pris (raison)
- `<style>` global injecté inline (layout.tsx:124-143) — non-bug, pas un fix CSS
- Hover handlers JS (G8 / G15) — couvert par `@media (hover: hover)` au niveau du système
- Grid `repeat(auto-fill, minmax(280px, 1fr))` ExploreClient:619 — déjà corrigé par sibling commit (utilise `min(100%, 280px)`)
- Logo mixBlendMode hidden lg — pas un bug mobile
- Card signup 36/32 padding — sur 320px iPhone SE, mais peu d'utilisateurs sur ce viewport
- Bouton OAuth height:46 — déjà OK
- `<input type="checkbox">` natif — acceptable WCAG si labelled (déjà le cas)
- Cookie banner safe-area-inset-bottom — déjà appliqué par sibling commit (vérifié: `paddingBottom: max(16px, env(safe-area-inset-bottom))`)
- Header padding (legal layout) — OK mobile
- KPI pills flex-wrap — OK
- Avatar 38×38 messages — limite WCAG mais acceptable
- Bouton send 40×40 messages — limite WCAG mais acceptable
- Sidebar elements 200px width — couvert par DashboardShell `hidden lg:flex`
- Pas de feedback `:active` MobileDashNav — micro-interaction, pas un bug bloquant
- Lightbox swipe gesture — feature, pas un fix 1-liner
- H1 hero clamp coming-soon — déjà OK

---

## Commits & SHAs

| SHA | Message |
|-----|---------|
| `d53c1cb` | feat(dashboard/mobile): collapse-all toggle pour réduire le scroll |
| `720e46f` | fix(mobile/safe-area): hero scroll indicator + vendor profile floating actions |
| `addae9e` | fix(guests/mobile): scroll cue tableaux + touch target bouton Supprimer |

Push : `8a252bb..addae9e  main -> main` (origin/main)

## Build

```
npx tsc --noEmit  ✓ clean (no output)
npx next build    ✓ clean (compile + generate static + dynamic routes)
```
