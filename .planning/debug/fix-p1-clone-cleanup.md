# Fix P1 — `src/components/clone/` cleanup

## Objectif

Auditer le répertoire legacy `src/components/clone/*` (ancien design, palette terracotta/sépia, prefix "Ant") et supprimer les fichiers non importés. Les fichiers encore utilisés sont conservés et seront refactorés vers les tokens brand dans une tâche dédiée.

## État avant

26 fichiers `.tsx` dans `src/components/clone/` :

```
AntAgentFirst.tsx
AntConfetti.tsx
AntDownload.tsx
AntFeatureBento.tsx
AntFeatureExplorer.tsx
AntFireworks.tsx
AntFooter.tsx
AntHero.tsx
AntNav.tsx
AntPricing.tsx
AntTestimonials.tsx
AntUseCases.tsx
AntVendorCard.tsx
AntVideoSection.tsx
PageSkeleton.tsx
SpotlightBackground.tsx
dashboard/BudgetWidget.tsx
dashboard/CountdownWidget.tsx
dashboard/CreateEventModal.tsx
dashboard/DashboardProgressBanner.tsx
dashboard/DashSidebar.tsx
dashboard/MesPrestatairesWidget.tsx
dashboard/MobileDashNav.tsx
dashboard/VendorSwipeWidget.tsx
planner/Calendar.tsx
planner/DayDrawer.tsx
```

## Méthode

1. Glob de tous les fichiers de `src/components/clone/`.
2. Grep `from ["'][^"']*clone/` et `import\(["'][^"']*clone/` (dynamic imports) sur tout `src/`.
3. Grep relatifs internes `from ["']\.\.?/` dans `src/components/clone/` pour cartographier la chaîne d'imports interne.
4. Pour chaque fichier : vérifier s'il a au moins 1 importeur externe au répertoire `clone/`, ou bien s'il sert d'autres fichiers `clone/` qui eux sont importés à l'extérieur.
5. Seuls les fichiers réellement orphelins (zéro chaîne d'utilisation jusqu'à un point d'entrée extérieur) sont supprimés.

## Carte d'utilisation

### Importés depuis l'extérieur de `clone/`

| Fichier | Importeurs externes |
|---|---|
| `AntNav.tsx` | `app/page.tsx`, `app/a-propos/page.tsx`, `app/pro/page.tsx`, `app/prestataires/page.tsx`, `app/explore/ExploreClient.tsx`, `app/dashboard/DashboardClient.tsx`, `app/dashboard/event-site/EventSiteList.tsx`, `app/planner/PlannerClient.tsx`, `app/vendor/[slug]/VendorProfileClient.tsx`, `app/mes-prestataires/page.tsx`, `app/profile/page.tsx`, `app/messages/page.tsx`, `app/notifications/page.tsx`, `app/guests/page.tsx`, `app/favorites/page.tsx`, `app/budget/page.tsx`, `app/settings/page.tsx`, `app/upgrade/UpgradeClient.tsx` |
| `AntFooter.tsx` | `app/page.tsx`, `app/a-propos/page.tsx`, `app/pro/page.tsx`, `app/prestataires/page.tsx` |
| `AntHero.tsx` | `app/page.tsx` |
| `AntVideoSection.tsx` | `app/page.tsx` |
| `AntAgentFirst.tsx` | `app/page.tsx` |
| `AntFeatureExplorer.tsx` | `app/page.tsx` |
| `AntUseCases.tsx` | `app/page.tsx` |
| `AntTestimonials.tsx` | `app/page.tsx` |
| `AntPricing.tsx` | `app/page.tsx` |
| `AntDownload.tsx` | `app/page.tsx` |
| `AntVendorCard.tsx` | `app/explore/ExploreClient.tsx` |
| `PageSkeleton.tsx` | `app/mes-prestataires/page.tsx`, `app/profile/page.tsx`, `app/messages/page.tsx`, `app/notifications/page.tsx`, `app/settings/page.tsx`, `components/vendor/messages/VendorMessagesClient.tsx` |
| `SpotlightBackground.tsx` | `app/login/page.tsx` |
| `dashboard/DashSidebar.tsx` | `app/accueil/page.tsx`, `app/dashboard/DashboardClient.tsx`, `app/dashboard/event-site/EventSiteList.tsx`, `app/planner/PlannerClient.tsx`, `app/mes-prestataires/page.tsx`, `app/profile/page.tsx`, `app/messages/page.tsx`, `app/notifications/page.tsx`, `app/guests/page.tsx`, `app/favorites/page.tsx`, `app/budget/page.tsx`, `app/settings/page.tsx` |
| `dashboard/CreateEventModal.tsx` | `app/accueil/page.tsx`, `app/dashboard/event-site/EventSiteList.tsx`, `app/dashboard/DashboardClient.tsx` (dynamic) |
| `dashboard/CountdownWidget.tsx` | `app/dashboard/DashboardClient.tsx` |
| `dashboard/BudgetWidget.tsx` | `app/dashboard/DashboardClient.tsx` (dynamic + type-only) |
| `dashboard/VendorSwipeWidget.tsx` | `app/dashboard/DashboardClient.tsx` (dynamic) |
| `dashboard/MesPrestatairesWidget.tsx` | `app/dashboard/DashboardClient.tsx` (dynamic) |
| `dashboard/DashboardProgressBanner.tsx` | `app/dashboard/DashboardClient.tsx` (dynamic) |
| `planner/Calendar.tsx` | `app/planner/PlannerClient.tsx` |
| `planner/DayDrawer.tsx` | `app/planner/PlannerClient.tsx` |

### Utilisés uniquement en interne via la chaîne `clone/` (mais la chaîne aboutit à un fichier importé à l'extérieur — donc gardés)

| Fichier | Importé par |
|---|---|
| `AntConfetti.tsx` | `AntHero.tsx`, `AntPricing.tsx`, `AntDownload.tsx` (tous trois importés par `app/page.tsx`) |
| `AntFireworks.tsx` | `AntHero.tsx` (importé par `app/page.tsx`) |
| `dashboard/MobileDashNav.tsx` | `dashboard/DashSidebar.tsx` (importé par 11 pages) |
| `planner/Calendar.tsx` (helpers) | `planner/DayDrawer.tsx` (importé par PlannerClient) |

### Zéro importeur (à supprimer)

| Fichier | Lignes | Statut |
|---|---|---|
| `AntFeatureBento.tsx` | 328 | Aucun grep ne trouve d'import. Composant orphelin. |

## Action

```bash
git rm src/components/clone/AntFeatureBento.tsx
```

## Vérification

- `npx tsc --noEmit` → exit 0, aucune erreur.
- `git status` montre uniquement la suppression de `AntFeatureBento.tsx` + ce summary.

## Files conservés à refactorer (tâche future)

Les 25 autres fichiers de `src/components/clone/` doivent être refactorés vers les tokens brand (`--g1/--g2`, `--dash-*`) — ils utilisent encore les couleurs terracotta/sépia interdites par `.claude/rules/brand-consistency.md`. Cette tâche est hors-scope du présent cleanup (qui ne supprime que les fichiers morts), mais reste à planifier comme dette technique P1.

Pistes prioritaires en termes de surface visible :
- `AntNav.tsx` (visible sur ~18 pages)
- `dashboard/DashSidebar.tsx` (visible sur 11 pages auth)
- `AntFooter.tsx`, `PageSkeleton.tsx` (très exposés)
- `AntHero.tsx`, `AntPricing.tsx` (homepage)
