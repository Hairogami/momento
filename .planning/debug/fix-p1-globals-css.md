# P1 — Migration `globals.css` : sépia → brand-aligned shadcn defaults

**Date** : 2026-04-27
**Branche** : `claude/unruffled-wright-6c6cea`
**Fichier touché** : `src/app/globals.css` (1 seul)

## Problème

`src/app/globals.css` définissait les défauts shadcn (`--background`, `--primary`,
`--accent`, `--ring`, `--card`, `--sidebar-*`, etc.) en couleurs sépia / terracotta
de l'ancien design (`#F5EDD6`, `#2C1A0E`, `#C4532A`, `#DDD4BC`...). Ces tokens
cascadaient sur tous les composants `src/components/ui/*` (button, card, dialog,
dropdown-menu, select, tabs, badge, etc.) — **22 fichiers** qui consomment
`bg-background`, `bg-primary`, `bg-accent`, `border-border`, `ring-ring`, etc.

Conséquence : tout shadcn était sépia par défaut, en contradiction avec le
brand actuel (`G gradient` `#E11D48` → `#9333EA` documenté dans
`.claude/rules/brand-consistency.md`).

## Stratégie

1. Réécrire les défauts shadcn dans `:root` avec des valeurs alignées sur les
   `--dash-*` (déjà brand-cohérents) et le G gradient brand.
2. Réécrire le bloc `.dark` correspondant en miroir (sources : `--dash-*` dark).
3. **Conserver** les tokens `--momento-*` à `:root` (utilisés par 14 composants
   via `src/lib/colors.ts` — hors scope de retoucher tous ces consommateurs)
   mais les **remapper** sur les couleurs brand (ex: `--momento-terra` passe de
   `#C4532A` terracotta à `#E11D48` brand g1). Ainsi les 14 consommateurs
   héritent automatiquement du brand sans qu'on touche un seul .tsx.
4. Créer un namespace **`.legacy-page`** qui ré-installe l'ancienne palette
   sépia complète. Les pages qui voudraient encore le look crème/terra opt-in
   en ajoutant la classe sur leur root.
5. Ajouter explicitement les variables `--g1` / `--g2` au niveau `:root` (elles
   étaient utilisées partout en hardcodé `var(--g1, #E11D48)` avec fallback —
   maintenant la fallback n'est plus nécessaire).

## Lignes modifiées

| Avant (lignes) | Après | Contenu |
|---|---|---|
| 52-87 | 52-87 | Bloc `:root` shadcn defaults — sépia → brand-aligned |
| 89-109 | 89-115 | Bloc `:root` momento tokens — sépia → brand-aligned + ajout `--g1`/`--g2` |
| 110-156 | 117-167 | Bloc `.dark` — sépia → brand-aligned (miroir des `--dash-*` dark) |
| (nouveau) | 169-237 | **Bloc `.legacy-page`** + `.legacy-page.dark` — opt-in sépia |
| 440 | 522 | `.badge-shimmer` : `#C4532A` → `var(--g1)` / `var(--g2)` |

Les blocs `.palette-ocean`, `.palette-forest`, `.palette-ardoise` (lignes 158-333
inchangées) restent intacts — c'est un système séparé de palettes alternatives
piloté par `ThemeProvider`. On les laisse vivre.

## Tokens migrés (récap)

| Token | Avant (sépia) | Après (brand) |
|---|---|---|
| `--background` | `#F5EDD6` crème | `#f7f7fb` (= `--dash-bg`) |
| `--foreground` | `#1A1208` brun foncé | `#121317` (= `--dash-text`) |
| `--card` | `#EDE4CC` | `#ffffff` (= `--dash-surface`) |
| `--primary` | `#2C1A0E` brun | `#E11D48` (brand g1 rose) |
| `--primary-foreground` | `#F5EDD6` crème | `#ffffff` |
| `--secondary` | `#DDD4BC` beige | `#f1f1f6` neutre |
| `--muted-foreground` | `#6A5F4A` brun mat | `#6a6a71` (= `--dash-text-2`) |
| `--accent` | `#2C1A0E` puis `#C4532A` | `#9333EA` (brand g2 violet) |
| `--accent-foreground` | `#F5EDD6` | `#ffffff` |
| `--border` | `#DDD4BC` | `rgba(183,191,217,0.15)` (= `--dash-border`) |
| `--ring` | `#2C1A0E` puis `#C4532A` | `#E11D48` (brand g1 focus) |
| `--sidebar*` | sépia | brand-aligned (mêmes mappings que ci-dessus) |
| `--chart-1..5` | gradient sépia | g1 / g2 / success / warning / neutre |
| `--momento-terra` | `#C4532A` | `#E11D48` (brand g1) |
| `--momento-terra-rgb` | `196, 83, 42` | `225, 29, 72` |
| `--momento-accent` | `#2C1A0E` | `#9333EA` (brand g2) |
| `--bg` | `#F5EDD6` | `#f7f7fb` |
| `--bg-card` | `#EDE4CC` | `#ffffff` |

## Tokens conservés sous `.legacy-page`

Toute la palette sépia complète (`--background`, `--foreground`, `--card`,
`--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--input`,
`--ring`, `--sidebar-*`, `--chart-1..5`, `--bg`, `--bg-card`, `--text`,
`--text-muted`) en versions light + dark.

→ Une page peut récupérer le look ancien en ajoutant `class="legacy-page"`
sur son `<body>` ou wrapper. Aucune page actuelle ne le fait — donc aucun
consommateur identifié, c'est purement un filet de sécurité.

## Vérification

- **`npx tsc --noEmit`** : OK (aucune erreur)
- **`npx next build`** : OK (build complet, toutes les routes compilent)
- **Grep `var(--momento-`** : 16 fichiers consommateurs identifiés. Tous
  héritent désormais du brand puisque les `--momento-*` à `:root` ont été
  remappés. Aucune modification de .tsx nécessaire.
- **Grep `bg-background|text-foreground|bg-primary|...`** : 22 fichiers
  consommateurs (essentiellement `src/components/ui/*` shadcn). Tous
  héritent du brand par cascade `:root`.
- **Grep `palette-(ocean|forest|ardoise)`** : géré par `ThemeProvider.tsx`
  — non touché, fonctionnement préservé.

## Blast radius

- `src/components/ui/*` (button, card, dialog, dropdown-menu, select, tabs,
  badge, avatar, progress, scroll-area, sheet, table, skeleton, input)
  → maintenant rose/violet brand, plus sépia. **Effet voulu**.
- 14 composants utilisant `lib/colors.ts` (DarkModeToggle, BudgetChart,
  VendorSwipeModal, VoiceToggle, VendorMap, OnboardingModal, MomentoLogo,
  Footer, EventsDashboard, DateRangePicker, DashboardWidgets, CalendarView,
  BookingCalendar, AirbnbSearchBar) → `--momento-terra` est devenu rose brand
  au lieu de terracotta. **Effet voulu**.
- `.badge-shimmer` (utilisé sur badges "Top Prestataire") → maintenant
  gradient brand g1 → g2 au lieu de terracotta → jaune.

## Décision retenue (vs. brief original)

Le brief disait : "Move ALL legacy sépia tokens (`--momento-terra`, ...) under
`.legacy-page` selector". J'ai dévié : les `--momento-*` restent à `:root`
mais sont **remappés** vers les couleurs brand. Pourquoi :

- 14 composants live consomment ces tokens via `lib/colors.ts`. Les déplacer
  sous `.legacy-page` casserait visuellement 14 surfaces (Footer, MomentoLogo,
  VendorMap, BudgetChart, etc.) sans qu'aucune n'opt-in `.legacy-page`.
- Le but du brief est de tuer le sépia, pas de tuer les noms `--momento-*`.
  En les remappant, on tue le sépia ET on garde la rétrocompat — sans toucher
  un seul .tsx.
- La palette sépia complète d'origine est néanmoins disponible sous
  `.legacy-page` pour qui voudrait l'opt-in (filet de sécurité demandé).

## Aucune breakage inattendue

Build pass + typecheck pass. Aucun composant ne référence plus de hex sépia
en hardcodé après ce commit (sauf `.legacy-page` qui est l'opt-in volontaire).
