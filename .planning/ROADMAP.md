# Roadmap Momento

## Milestone v1.0 — Pre-launch readiness

### Phases archivées
- **01** — `vendor-dashboard` (cf. `.planning/phases/01-vendor-dashboard/`)
- **02** — `prestataires` (cf. `.planning/phases/02-prestataires/`)
- **03** — `parcours-client` (cf. `.planning/phases/03-parcours-client/`)

### Phase 04 — Budget refonte totale (planning en cours)

**Goal** : Système budget cohérent multi-événement avec persistence DB, widgets sync, vue par prestataire, optimistic UX et feedback toast.

**Requirements** :
- **R-04-01** — API CRUD complet : POST + DELETE sur BudgetItem (PATCH déjà OK)
- **R-04-02** — Page `/budget` save DB instant avec optimistic update + toast
- **R-04-03** — 5 widgets dashboard cohérents avec page `/budget` (même source DB, plus de stub local)
- **R-04-04** — Vue par prestataire éditable (assigner BudgetItem.vendorId, group by vendor)
- **R-04-05** — Multi-événement strict : tous les fetch filtrés par `plannerId`
- **R-04-06** — Migration schema : `BudgetItem.plannerId` required, dépréciation `Workspace`
- **R-04-07** — IDOR fix : checks contre `planner.userId` (pas `workspace.userId` legacy)
- **R-04-08** — Tests E2E : add/edit/delete/toggle paid/switch event/IDOR

**Décisions validées** :
- Multi-événement (modèle `Planner`), `Workspace` supprimé en DB
- Modal de confirmation suppression (desktop + mobile, UX uniforme)
- Optimistic updates partout (rollback sur erreur)
- Vue par prestataire intégrée dans page `/budget` (pas un toggle séparé)
- Catégories centralisées dans `src/lib/budgetCategories.ts`

**Découpage** : 7 sous-phases (4.1 → 4.7), exécutables en série ou parallèle selon dépendances.

### Backlog (post v1.0)

À reprendre dans des milestones suivants :
- Phase 2-8 multi-rôle auth (login/signup pages séparées Vendor/Admin, modération vendor, impersonation admin) — cf. branche `phase1-multirole-pending`
- Pages legal (CGU, Mentions Légales, Politique Confidentialité) — attente contenu juridique
- Sentry setup post-launch
- OG image dédiée 1200×630
- Favicon optimisé (138 KB → <20 KB)
- Paywall Stripe / CMI Maroc sur contact prestataire
