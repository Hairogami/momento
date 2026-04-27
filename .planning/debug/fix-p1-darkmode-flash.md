# P1 — Dark Mode FOUC Fix

## Problem

Sur navigation entre pages, les utilisateurs en dark mode voyaient un flash de
thème clair avant que le JS hydrate et applique la classe `.dark`. Source : le
script de boot existait déjà dans `src/app/layout.tsx` mais :

1. Il était positionné APRÈS les `<link rel="stylesheet">` des fonts Google,
   ce qui pouvait retarder son exécution.
2. Il n'appliquait pas explicitement `color-scheme` inline sur `<html>` —
   il dépendait uniquement de la cascade CSS `.dark { color-scheme: dark }`
   définie dans `globals.css`. Si la feuille n'était pas encore parsée au
   premier paint, les contrôles natifs UA (scrollbars, autofill, form widgets,
   thème de la barre du navigateur) flashaient en light.
3. Pas d'attribut `data-theme` sur `<html>` — utile pour les sélecteurs CSS
   ne dépendant pas de la classe `.dark`.

## Fix

### `src/app/layout.tsx`
- Extrait les 2 IIFE inline dans des constantes nommées `THEME_BOOT_SCRIPT`
  et `PALETTE_BOOT_SCRIPT` au top du fichier (lisibilité + annotations
  ESLint propres).
- **Déplacé les 2 balises script en TÊTE de `<head>`**, avant les
  `<link rel="preconnect">` et `<link rel="stylesheet">` Google Fonts.
  Garantit l'exécution synchrone avant tout parsing CSS et avant tout paint.
- Le script applique désormais :
  - `classList.add('dark', 'clone-dark')` ou `classList.remove(...)`
  - `style.colorScheme = 'dark' | 'light'` directement inline —
    ne dépend plus du parsing CSS pour que le navigateur applique le bon
    `color-scheme` aux contrôles UA.
  - `setAttribute('data-theme', 'dark' | 'light')` pour les sélecteurs
    qui voudraient cibler `[data-theme=dark]`.
- Wrapping IIFE `(function(){...})();` propre.
- Ajoute la valeur `"auto"` (legacy migration) au branchement `system`.

### `src/components/ThemeProvider.tsx`
- `applyTheme()` met aussi à jour `style.colorScheme` et `data-theme` après
  hydration, pour rester cohérent avec ce que le boot script a posé.
  Sinon, un toggle de thème via le provider laissait `colorScheme` figé
  sur la valeur initiale.

### `src/components/admin/AdminThemeLock.tsx`
- Au unmount, restore le `colorScheme` PRÉCÉDENT (capturé au mount) au lieu
  de le clear (`""`). Sans ça, retour à `/dashboard` depuis `/admin`
  causait un flash des contrôles UA (ils perdaient leur `color-scheme: dark`
  jusqu'à ce que le ThemeProvider re-render).

## Sub-layouts vérifiés

| Layout | Theme handling | Conflit ? |
|--------|----------------|-----------|
| `src/app/admin/layout.tsx` | utilise `<AdminThemeLock />` | Non — fix appliqué |
| `src/app/vendor/dashboard/layout.tsx` | classe `dark` sur un `<div>` wrapper, pas sur `<html>` | Non |
| `src/app/dashboard/layout.tsx` | rien | Non |
| `src/app/(legal)/layout.tsx` | rien | Non |
| `src/app/accueil/layout.tsx`, `settings`, `messages`, etc. | rien | Non |

## Vérifications

- `npx tsc --noEmit` : OK (zéro erreur).
- Script en tête de `<head>` : confirmé via lecture du fichier post-edit
  (lignes 102–112 dans `src/app/layout.tsx`).
- Pattern existant conservé — contenu 100% statique contrôlé, aucun input
  utilisateur n'arrive dans la chaîne d'inline.

## Reste à tester en navigateur (E2E manuel)

1. Set `localStorage.theme = 'dark'`, refresh : aucun flash light avant paint.
2. Set `localStorage.theme = 'light'` sur OS dark : aucun flash dark.
3. Set `localStorage.theme = 'system'`, OS dark : pas de flash light.
4. Navigation `/dashboard` <-> `/admin` <-> `/dashboard` : pas de flash UA controls.
5. Toggle thème via `ThemeToggle` : `<html>` reflète `colorScheme` + `data-theme`.

## Limites connues (hors scope de ce fix)

- 4 systèmes parallèles de dark mode existent encore (`DashboardClient`,
  `ExploreClient`, `DashSidebar`, `settings/page.tsx`) — voir observation
  6274 dans claude-mem. Centralisation = chantier P2 séparé.
- `momento_clone_palette` reste en localStorage et lu par 2e script.
  Migration vers `--palette-*` tokens est un autre chantier (obs. 7654).
