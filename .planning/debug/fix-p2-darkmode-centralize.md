# P2 — Centraliser les systèmes parallèles de dark mode

## Problème

4 systèmes parallèles de dark mode coexistaient (en plus du provider) :

1. `src/app/dashboard/DashboardClient.tsx` — `useState(darkMode)` + MutationObserver sur `<html>` + 2 `useEffect` qui écrivent `momento_clone_dark_mode` et `classList.toggle("dark")`.
2. `src/app/explore/ExploreClient.tsx` — `useState(dark)` + observer + listener `momento-theme-change` + wrapper `setDark` qui toggle classes + écrit 2 clés localStorage + dispatch CustomEvent.
3. `src/components/clone/dashboard/DashSidebar.tsx` — `useState(darkMode)` + listener CustomEvent + observer + `toggleDark()` qui toggle classes + écrit localStorage + dispatch.
4. `src/app/settings/page.tsx` — `useEffect` qui lit `s.theme` (`light|dark|auto`), calcule `prefersDark`, toggle classes, écrit 3 clés (`momento_clone_dark_mode`, `momento_clone_theme_pref`, `momento_theme`).

Bonus détecté pendant le refactor (fix-everything-as-you-go) :

5. `src/components/clone/AntNav.tsx` — même pattern que DashSidebar (observer + CustomEvent + storage listener + toggle inline avec dispatch).

Risque : un changement futur sur l'un casse la cohérence. Race conditions documentées : observation 4591 (Apr 17), 6274 (Apr 23). FOUC fix Apr 27 a corrigé le boot script mais laissé les 5 systèmes en place.

## Fix

Source unique de vérité : `useTheme()` de `src/components/ThemeProvider.tsx`. Le provider expose déjà :
- `theme: "system" | "light" | "dark"` — choix utilisateur
- `resolved: "light" | "dark"` — rendu effectif
- `setTheme(t)` / `toggleTheme()` — applique classe `.dark`/`.clone-dark`, `colorScheme`, `data-theme`, écrit `momento_theme`, écoute `prefers-color-scheme`.

Chaque composant remplace son état local + side-effects par :

```tsx
const { resolved, setTheme } = useTheme()
const darkMode = resolved === "dark"
// onClick = () => setTheme(darkMode ? "light" : "dark")
```

`settings/page.tsx` mappe la valeur DB `"auto"` (héritée) vers `"system"` du provider.

## Fichiers modifiés (5)

| Fichier | Changement |
|---|---|
| `src/app/dashboard/DashboardClient.tsx` | Supprime `useState(darkMode)`, MutationObserver, 2 `useEffect` (write localStorage + classList.toggle). Import `useTheme`. Toggle button → `setTheme(darkMode ? "light" : "dark")`. |
| `src/app/explore/ExploreClient.tsx` | Supprime `useState(dark)`, observer, listener `momento-theme-change`. Wrapper `setDark` conservé pour compat call-sites (délègue à `setTheme`). Import `useTheme`. |
| `src/components/clone/dashboard/DashSidebar.tsx` | Supprime `useState(darkMode)`, listener CustomEvent, observer. `toggleDark()` → `setTheme(darkMode ? "light" : "dark")`. Import `useTheme`. |
| `src/app/settings/page.tsx` | Supprime classList.toggle + 3 writes localStorage. `useEffect` mappe `s.theme` → `applyTheme(providerTheme)` avec `"auto" → "system"`. Import `useTheme`. |
| `src/components/clone/AntNav.tsx` | Supprime `useState(dark)`, listener CustomEvent, observer, listener `storage`, toggle inline avec dispatch. Import `useTheme`. |

## Logique centralisée dans `useTheme()`

Une seule fonction `applyTheme(resolved, palette)` dans `ThemeProvider.tsx` gère :
- `classList.add/remove("dark", "clone-dark")` sur `<html>`
- `style.colorScheme = "dark" | "light"` (anti-flash UA controls)
- `setAttribute("data-theme", ...)`
- Palette classes (`palette-ocean`, etc.)

Une seule clé localStorage (`momento_theme`) — plus de fragmentation `momento_clone_dark_mode` + `momento_clone_theme_pref`. Le boot script de `layout.tsx` lit toujours le legacy `momento_clone_dark_mode` en fallback (compat utilisateurs existants), mais plus aucun composant ne l'écrit.

## Lignes supprimées (duplication éliminée)

- DashboardClient : ~22 lignes (useState init + observer effect + 2 effets persist/apply)
- ExploreClient : ~38 lignes (useState init + observer + CustomEvent listener + wrapper avec dispatch)
- DashSidebar : ~33 lignes (useState init + 2 effets observer/listener + body de `toggleDark`)
- settings/page.tsx : ~10 lignes (3 writes + classList.toggle redondants — la fonction du `useEffect` est conservée mais réduite)
- AntNav : ~37 lignes (useState init + 3 effets observer/CustomEvent/storage + body inline du onClick)

**Total ≈ 140 lignes de duplication retirées**, remplacées par 5 imports `useTheme` + 5 déclarations `const { resolved, setTheme } = useTheme()`.

## Vérifications

- `npx tsc --noEmit` : 0 erreur sur les fichiers refactorisés. (2 erreurs pré-existantes hors scope : `scripts/backfill-vendor-ranking.ts` et `src/app/api/vendors/route.ts` — champ `rankingScore` absent du schema Prisma.)
- `npx next build` : compile en 7s sans erreur, le typecheck post-compile échoue UNIQUEMENT sur les 2 erreurs Prisma pré-existantes (sans rapport avec ce refactor).
- Aucun `setDarkMode` / `setDarkState` / `classList.toggle("dark"...)` hors `ThemeProvider.tsx` et `AdminThemeLock.tsx` (special-case admin force-dark, intentionnellement préservé).
- Aucune écriture de `momento_clone_dark_mode` / `momento_clone_theme_pref` / `momento-theme-change` restante.

## Smoke test mental

Toggle dark mode dans n'importe quel composant (DashboardClient toolbar, DashSidebar bouton, AntNav header, ExploreClient barre filtres, settings switch) → `setTheme()` met à jour le contexte React → tous les autres consumers se re-renderent automatiquement avec `resolved` mis à jour. Plus de désync possible entre surfaces.

## Hors scope (intentionnellement préservé)

- `src/app/layout.tsx` : script bloquant anti-FOUC + script palette — restent inchangés (déjà corrects, P1).
- `src/components/admin/AdminThemeLock.tsx` : force dark sur `/admin` au mount, restore au unmount. Cas spécial admin (UI dense data-heavy), pas un toggle utilisateur, ne consomme pas `useTheme`.
- CSS dark mode dans `globals.css` : tokens `--dash-*`, classes `.dark` / `.clone-dark` — inchangés.
- Migration palette (`momento_clone_palette` → tokens) : autre chantier (obs 7654).
