# Fix — Mobile Foundations

**Date** : 2026-04-28
**Scope** : Universal mobile foundations (iOS/Android quirks) — global, low-risk fixes applied à la racine.
**Out of scope** : component-specific responsive layout (séparé).

## Files modified

| File | Change | Lines added |
|------|--------|-------------|
| `src/app/layout.tsx` | `viewportFit: "cover"` ajouté au `viewport` export ; `manifest: "/manifest.json"` ajouté à `metadata` | +2 |
| `src/app/globals.css` | Block "MOBILE FOUNDATIONS" inséré après `@custom-variant dark` (ligne 7) | ~80 |
| `public/manifest.json` | **Créé** (PWA manifest) | +14 |

## Foundations covered (checklist)

- [x] **viewport-fit=cover** — autorise `env(safe-area-inset-*)` à fonctionner (iOS notch / home indicator)
- [x] **theme-color** — déjà présent (light + dark variants conservés, plus précis qu'un seul `#E11D48`)
- [x] **manifest.json** — référencé dans metadata, déclare standalone PWA + brand color
- [x] **Tap highlight transparent** — `-webkit-tap-highlight-color: transparent` sur `*`
- [x] **Callout long-press disable** — `-webkit-touch-callout: none` (réactivé sur contenu lisible : p, span, h*, li, td, code, pre, input, textarea, .markdown-content)
- [x] **iOS auto-zoom fix** — input/select/textarea `font-size: max(16px, var(--text-sm, 14px))` sur viewport ≤ 768px
- [x] **100dvh fallback** — classe utilitaire `.h-screen-mobile` avec fallback 100vh → 100dvh
- [x] **Tap delay** — `touch-action: manipulation` sur button/a/[role="button"]/input/select/textarea
- [x] **iOS legacy scroll smooth** — classe `.scroll-touch` avec `-webkit-overflow-scrolling: touch`
- [x] **Hover guard touch devices** — `@media (hover: none)` neutralise `hover:bg-{gray-100, gray-50, white, neutral-100, slate-100, zinc-100}` (Tailwind classes)
- [x] **Safe-area insets utility classes** — `.safe-top`, `.safe-bottom`, `.safe-left`, `.safe-right`
- [x] **Bottom nav safe-area** — classe `.mobile-bottom-nav` avec `padding-bottom: env(safe-area-inset-bottom)`
- [x] **Overflow-x guard mobile** — safety net global sur html/body pour viewport ≤ 768px

## Build pass status

- [x] `npx tsc --noEmit` — clean (0 erreurs)
- [x] `npx next build` — passe (toutes routes compilées, sitemap OK, middleware proxy actif)
- [x] Pas de duplicate selectors introduit (`html, body` scoped à `@media`, `.snap-scroll-container` séparé)

## Notes / TODO

- **Theme-color** : volontairement laissé en variantes light/dark plutôt que `#E11D48` brand. Justification : `theme-color` colorise la barre browser/PWA → match avec page background donne meilleure intégration visuelle qu'un rose flashy. Le brand reste injecté via le manifest (`theme_color: "#E11D48"`).
- **Hover overrides** : aucune classe `hover:bg-gray-100` ou `hover:bg-white` détectée actuellement dans le code Momento (grep = 0 occurrences). Les overrides restent comme safety net pour usages futurs ou shadcn défaut.
- **MaxScale=5** : conservé (a11y — autorise zoom utilisateur, contrairement au `user-scalable=no` toxique).

### TODO (post-fix, non-bloquant)

- [ ] **Icônes manquantes** : `public/icon-192.png` et `public/icon-512.png` n'existent pas. Le manifest les référence mais elles ne sont pas générées. Action requise : générer 2 PNG depuis `logo-badge-dark.png` aux dimensions exactes (192×192 et 512×512). Sans ces icônes, l'install PWA ne pourra pas afficher l'icône proprement sur Android home screen.
- [ ] **apple-touch-icon dédié** : actuellement `apple` pointe vers `/favicon-momento.png` (cf. `metadata.icons.apple` dans `layout.tsx`). Idéalement créer un `public/apple-touch-icon.png` 180×180 dédié pour homescreen iOS.
- [ ] **Adoption progressive** : les classes `.h-screen-mobile`, `.safe-*`, `.mobile-bottom-nav`, `.scroll-touch` sont disponibles mais pas encore appliquées aux composants existants. À faire au fil du refactor responsive (séparé).

## Effet attendu user

- iOS : plus de tap highlight bleu/gris dégueu sur boutons/links
- iOS notch : safe-area dispo (les composants peuvent maintenant la consommer)
- iOS Safari address bar : ne casse plus les layouts 100vh (via `.h-screen-mobile`)
- iOS forms : plus de zoom forcé quand on tape dans un input < 16px
- Android Chrome / iOS Safari touch : plus de hover qui reste collé après tap
- Mobile global : plus de scroll horizontal accidentel (debug visuel safety net)
- PWA install : metadata correcte, brand color visible quand l'utilisateur ajoute à l'écran d'accueil (sous réserve d'ajouter les 2 PNG icônes)

## Coût d'implémentation

- 1 modif viewport (~2 lignes)
- 1 ajout metadata (1 ligne)
- 1 block CSS (~80 lignes, isolé, marqué `/* === MOBILE FOUNDATIONS === */`)
- 1 fichier JSON nouveau (14 lignes)

**Total** : ~100 lignes ajoutées, 0 fichier supprimé, 0 régression introduite.
