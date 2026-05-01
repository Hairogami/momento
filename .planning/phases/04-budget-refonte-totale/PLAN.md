# Phase 04 — Budget refonte totale (v2 — État réel)

> **Statut audit (2026-05-01)** : Phases 4.1, 4.3, 4.5a, 4.6 = DONE.
> Reste : 2 bugs critiques dashboard + nettoyage Workspace.

---

## Bugs confirmés (priorité décroissante)

### Bug 1 — CRITIQUE : Clés catégories incompatibles entre dashboardData.ts et budgetCategories.ts

**Symptôme** : Dans le dashboard (BudgetWidget, DepensesRecentesWidget), tous les items
"photographe", "decoration", "tenue", "transport", "papeterie", "divers" s'affichent
avec la couleur fallback `#8C6A5A` (brun) au lieu de leurs couleurs brand.

**Cause** : `dashboardData.ts` a ses propres tables `CATEGORY_COLORS` et `CATEGORY_ICONS`
avec les ANCIENNES clés (`photo`, `deco`, `robe`, `autre`) et les ANCIENNES couleurs
terracotta. La page `/budget` écrit en DB avec les NOUVELLES clés (`photographe`,
`decoration`, `tenue`, `divers`) de `budgetCategories.ts`. Résultat : lookup → miss →
fallback gris-brun systématique.

**Fichier** : `src/lib/dashboardData.ts`, lignes 4–24

**Fix** : Supprimer `CATEGORY_COLORS` et `CATEGORY_ICONS` locaux. Importer `getCategory`
depuis `budgetCategories.ts` et l'utiliser partout dans `dashboardData.ts`.

---

### Bug 2 — IMPORTANT : Filtre qui cache les items sans montant réel

**Symptôme** : Dans `DepensesRecentesWidget`, les items avec seulement un montant
`estimated` (sans `actual`) sont invisibles, même s'ils sont enregistrés en DB.

**Cause** : `dashboardData.ts` ligne 215 :
```typescript
.filter(b => (b.actual ?? 0) > 0)
```
Un item fraîchement ajouté sans dépense réelle (`actual = null`) est filtré.

**Fix** : Inclure les items avec estimated OU actual > 0 :
```typescript
.filter(b => (b.estimated ?? 0) > 0 || (b.actual ?? 0) > 0)
```

---

### Bug 3 — MINEUR : `actual` non exposé dans BudgetExpenseModal

**Symptôme** : Le formulaire d'ajout/édition de dépense n'a pas de champ "Dépensé réel"
(`actual`), pourtant le champ existe en DB et dans budgetCategories.

**Fix** : Ajouter champ `actual` (optionnel, numeric, label "Montant réel") dans
`BudgetExpenseModal` entre `estimated` et `paid`.

---

### Bug 4 — DETTE : Workspace model legacy toujours présent

**Symptôme** : Le modèle `Workspace` existe dans le schema Prisma (lignes 130+) et
8 routes API l'utilisent encore pour IDOR. La migration vers `Planner` n'est pas terminée.

**Impact actuel** : Aucun bug prod direct. La dette existe mais les routes fonctionnent.

**Scope de la migration** :

| Fichier | Usage workspace |
|---------|----------------|
| `src/app/api/guests/route.ts` | GET filtres + POST écrit workspaceId |
| `src/app/api/guests/[id]/route.ts` | IDOR via workspace.userId |
| `src/app/api/guests/[id]/link/route.ts` | IDOR via workspace.userId |
| `src/app/api/tasks/route.ts` | GET filtres + POST écrit workspaceId |
| `src/app/api/tasks/[id]/route.ts` | IDOR via workspace.userId |
| `src/app/api/bookings/route.ts` | POST écrit workspaceId + IDOR |
| `src/app/api/budget-items/[id]/route.ts` | IDOR fallback workspace.userId |
| `src/app/api/planners/[id]/budget-items/route.ts` | POST écrit workspaceId |

---

## Plan d'exécution

### Phase A — Fix dashboardData.ts (CRITIQUE, ~20 min)

**Fichier** : `src/lib/dashboardData.ts`

**Step A1** : Remplacer CATEGORY_COLORS + CATEGORY_ICONS par import de budgetCategories.ts

```typescript
// SUPPRIMER les 2 blocs const CATEGORY_COLORS et CATEGORY_ICONS (lignes 4–24)
// AJOUTER en haut du fichier :
import { getCategory } from "@/lib/budgetCategories"

// SUPPRIMER les fonctions colorFor() et iconFor() (lignes 26–33)
// PARTOUT où colorFor(x) ou iconFor(x) est appelé, remplacer par :
//   colorFor(x) → getCategory(x).color
//   iconFor(x)  → getCategory(x).icon
```

**Step A2** : Fix filtre DepensesRecentesWidget (ligne 215)

```typescript
// AVANT :
.filter(b => (b.actual ?? 0) > 0)
// APRÈS :
.filter(b => (b.estimated ?? 0) > 0 || (b.actual ?? 0) > 0)
```

**Vérification** :
- `npx tsc --noEmit` — zéro erreur
- Ouvrir dashboard → BudgetWidget et DepensesRecentesWidget montrent les bonnes couleurs brand
- Ajouter item sans `actual` → apparaît dans DepensesRecentesWidget

---

### Phase B — Bug 3 : Champ actual dans BudgetExpenseModal (~20 min)

**Fichier** : `src/components/dashboard/BudgetExpenseModal.tsx` (ou similaire)

Ajouter input `actual` (type number, min 0, label "Montant réel (optionnel)") entre
`estimated` et `paid` dans le formulaire. Valider et transmettre dans le PATCH/POST.

**Vérification** :
- Ajouter une dépense avec montant réel différent de l'estimé
- Le champ survit au round-trip (rechargement) et s'affiche correctement dans le widget

---

### Phase C — Workspace cleanup (~90 min)

> ⚠️ **Ordre obligatoire** : code d'abord, migration DB ensuite.

**Stratégie** : remplacer le pattern IDOR `workspace.userId` par `userId` direct sur chaque
modèle. Guest, Task, Booking reçoivent un champ `userId` (déjà vrai pour planner-scoped ou
ajouter via migration). Workspace model supprimé en dernier.

#### C1 — Schéma Prisma

```prisma
// AJOUTER userId directement sur Guest, Task, Booking (si absent)
// SUPPRIMER les champs workspaceId + relation workspace sur BudgetItem, Guest, Task, Booking
// SUPPRIMER le model Workspace complet (lignes 130–163)
// SUPPRIMER la relation workspace sur User (ligne 39)
```

#### C2 — Migration DB

```bash
DATABASE_URL=$DIRECT_URL npx prisma db push
# Ou si migration formelle :
DATABASE_URL=$DIRECT_URL npx prisma migrate dev --name remove_workspace
```

> ⚠️ Si `workspaceId` est `NOT NULL` en DB : d'abord `migrate dev --name make_workspaceid_optional`
> (nullable), puis migrer les données, puis `--name remove_workspace`.

#### C3 — Mettre à jour les 8 routes API

Pour chaque route :
1. Remplacer `workspace.userId` par `userId` direct (sur model ou via planner)
2. Supprimer les `prisma.workspace.findUnique/create`
3. IDOR : `where: { id, userId: session.user.id }` (pattern standard)

**Ordre recommandé** (du plus simple au plus couplé) :
1. `budget-items/[id]/route.ts` — déjà planner-aware, retirer fallback workspace
2. `planners/[id]/budget-items/route.ts` — retirer lookup workspace pour workspaceId
3. `tasks/[id]/route.ts` — IDOR direct userId
4. `tasks/route.ts` — filtres + create sans workspace
5. `guests/[id]/route.ts` + `guests/[id]/link/route.ts` — IDOR direct userId
6. `guests/route.ts` — filtres + create sans workspace
7. `bookings/route.ts` — IDOR + create sans workspace

#### C4 — Prisma generate + build

```bash
npx prisma generate
npx next build
```

---

## Fichiers à modifier (résumé)

| Fichier | Phase | Changement |
|---------|-------|-----------|
| `src/lib/dashboardData.ts` | A | Supprimer CATEGORY_COLORS/ICONS + colorFor/iconFor + fix filtre |
| `src/components/dashboard/BudgetExpenseModal.tsx` | B | Ajouter champ actual |
| `prisma/schema.prisma` | C | Supprimer Workspace + workspaceId FKs |
| `src/app/api/budget-items/[id]/route.ts` | C | Retirer fallback workspace |
| `src/app/api/planners/[id]/budget-items/route.ts` | C | Retirer workspace lookup |
| `src/app/api/tasks/route.ts` | C | IDOR sans workspace |
| `src/app/api/tasks/[id]/route.ts` | C | IDOR sans workspace |
| `src/app/api/guests/route.ts` | C | IDOR sans workspace |
| `src/app/api/guests/[id]/route.ts` | C | IDOR sans workspace |
| `src/app/api/guests/[id]/link/route.ts` | C | IDOR sans workspace |
| `src/app/api/bookings/route.ts` | C | IDOR sans workspace |

---

## Vérification E2E finale

1. `npx tsc --noEmit` — zéro erreur TS
2. `npx next build` — build propre
3. Dashboard : BudgetWidget montre couleurs brand (rose, violet, ambre, etc.)
4. DepensesRecentesWidget : items avec estimated sans actual = visibles
5. BudgetExpenseModal : champ `actual` présent + sauvegarde
6. Page /guests, /planner (tâches), /bookings — CRUD toujours fonctionnel
7. `npx prisma studio` — modèle Workspace absent

---

## Ordre d'exécution recommandé

1. **Phase A** (20 min) — Fix dashboardData.ts → commit `fix(budget): category colors + filter`
2. **Phase B** (20 min) — Champ actual → commit `feat(budget): expose actual field in modal`
3. **Phase C** (90 min) — Workspace cleanup → commit `refactor: remove Workspace model`
4. Build + vérif E2E + push

**Estimation totale : 130 min** — exécutable en une session.

---

## Risques Phase C

| Risque | Probabilité | Mitigation |
|--------|-------------|-----------|
| `workspaceId NOT NULL` en prod → migration fail | Haute | Rendre nullable d'abord (step intermédiaire) |
| Données orphelines (items sans userId) | Moyenne | Data migration script avant suppression FK |
| IDOR cassé pendant transition | Faible | Tests manuels CRUD après chaque route |

> **Décision** : si la migration directe échoue (NOT NULL constraint), couper en 2 commits :
> commit A (nullable) + deploy prod + commit B (remove). Jamais force-push sur main.
