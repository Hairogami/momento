# Fix P1 — Brand hex sépia/terracotta → tokens

Date : 2026-04-27
Règle déclenchante : `.claude/rules/brand-consistency.md` — interdit tout `#C4532A`, `#F5EDD6`, `#9A3412`, `#FED7AA`, `#FFF7ED`, `#8B4513` dans les composants actifs.

## Stratégie

- Brand actuel = G gradient `#E11D48` → `#9333EA` + tokens `--dash-*`.
- Tous les `#C4532A` (terracotta brique) remplacés par `#E11D48` (brand `--g1`) avec commentaire `// brand --g1`.
- Pour SVG inline (DarkModeToggle), passage à `currentColor` + `style={{ color: "var(--g1, #E11D48)" }}` (pattern recommandé pour icônes — auto-adaptation dark/light).
- Pour HTML literal injecté dans un popup Leaflet (ExploreMap), conservation de la valeur hex `#E11D48` (les CSS vars ne s'appliquent pas dans une chaîne HTML construite côté JS et insérée via `bindPopup`).

## Fichiers modifiés

| Fichier | Lignes | Changement |
|--------|--------|------------|
| `src/components/BudgetChart.tsx` | 17 | `lieu: "#C4532A"` → `lieu: "#E11D48"` (+ comment brand) |
| `src/app/api/planners/[id]/dashboard-data/route.ts` | 9 | idem côté serveur (CATEGORY_COLORS map) |
| `src/components/DarkModeToggle.tsx` | 60 | `stroke="#C4532A"` → `stroke="currentColor"` + `style={{ color: "var(--g1, #E11D48)" }}` |
| `src/components/ExploreMap.tsx` | 54 | `"Créateur de cadeaux invités": "#C4532A"` → `"#E11D48"` |
| `src/components/ExploreMap.tsx` | 59 | fallback `getCatColor` `?? "#C4532A"` → `?? "#E11D48"` |
| `src/components/ExploreMap.tsx` | 79 | étoile rating popup `"#C4532A"` → `"#E11D48"` |
| `src/components/ExploreMap.tsx` | 226 | `+N autres` count `"#C4532A"` → `"#E11D48"` |
| `src/components/ExploreMap.tsx` | 232 | header "${count} prestataire(s)" `"#C4532A"` → `"#E11D48"` |

## Fichier supprimé

| Fichier | Raison |
|--------|--------|
| `src/components/InstagramWidget.tsx` | Aucun import dans la codebase (seules réfs internes : déclaration export + interface props). Composant orphelin, contenait 6+ literals sépia (`#C4532A`, `#F5EDD6`). Suppression > rebrand mort-né. |

## Note importantes — pas touchés (exceptions légitimes)

- `src/lib/email.ts` — palette mail (décision séparée)
- `src/lib/eventSiteTokens.ts` — templates user-éditables
- `src/components/PaletteSelector.tsx` — éditeur palette user
- `src/app/dashboard/event-site/EventSiteEditor.tsx` — fallbacks editor
- `src/components/clone/AntVideoSection.tsx` — todo cleanup séparé
- `src/components/FlowerHero.tsx` — pas trouvé de hex banni
- `src/app/globals.css` — variables CSS legacy (à nettoyer plus tard)

## Vérification

- `npx tsc --noEmit` : aucune nouvelle erreur dans les fichiers modifiés.
  - 3 erreurs pré-existantes dans `node_modules/@types` (toolchain TS, pas notre code).
  - 1 erreur pré-existante `exceljs` dans `guests/export/route.ts` (non lié).
- Grep banned hex sur `src/components` et `src/app` après commit : seules les exceptions légitimes restent.
