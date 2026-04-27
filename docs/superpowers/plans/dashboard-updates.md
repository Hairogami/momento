# Dashboard Updates — Implementation Plan

> **For agentic workers:** Plan post-audit (`DASHBOARD-AUDIT.md` du 2026-04-27). Couvre les 17 findings (3 CRITICAL · 6 HIGH · 5 MEDIUM · 3 LOW). Structuré en 4 phases qu'on peut exécuter indépendamment via `superpowers:executing-plans` ou `gsd-plan-phase` + `gsd-execute-phase`.
>
> **Status** : SET ASIDE (créé 2026-04-27 après chantier RSVP, en attente — on reprend Phase 4 responsive d'abord).

**Goal** : Stabiliser l'espace client Momento (cohérence DB ↔ UI, widgets conformes au contrat, tokens CSS valides, sécurité plan gating).

**Architecture** : Pas de breaking change. Toutes les corrections respectent : (1) widget-contract.md, (2) security-by-design.md, (3) IDOR-by-default. On corrige aux 4 niveaux (DB → API → state → UI) en partant du symptôme utilisateur.

**Tech Stack** : Next.js 16 App Router, Prisma 7, NextAuth v5, Zod, Tailwind v4, React 19.

**Référence audit** : `DASHBOARD-AUDIT.md` (à supprimer après exécution complète).

---

## Phase A — Quick wins CRITICAL (3 fixes, ~6h)

Goal : tuer les 3 features fantômes qui mentent à l'utilisateur.

### Task A.1 — Tokens CSS Guest components (1h, finding #3)

**Files** :
- Modify: `src/components/guests/GuestCard.tsx`
- Modify: `src/components/guests/RsvpCard.tsx`
- Modify: `src/components/guests/RsvpTable.tsx`
- Modify: `src/components/guests/GuestTable.tsx`
- Modify: `src/components/guests/StatsBar.tsx`
- Modify: `src/components/guests/LinkRsvpDialog.tsx`

**Mapping de remplacement** (à exécuter via `Edit replace_all` par fichier) :

| Inexistant | À utiliser |
|------------|------------|
| `--dash-text-1` | `--dash-text` |
| `--dash-surface-1` | `--dash-surface` |
| `--dash-surface-2` | `--dash-faint-2` |
| `--space-2` | `--space-xs` |
| `--space-3` | `--space-sm` |
| `--space-4` | `--space-md` |
| `--space-5` | `--space-lg` |

**Vérif** : `grep -r "dash-text-1\|dash-surface-1\|dash-surface-2\|--space-[2-5]" src/components/guests/` → 0 résultat.

**Commit** : `fix(guests): tokens CSS valides — remplace vars inexistantes`

---

### Task A.2 — Page `/notifications` (2h, finding #2)

**Décision tranchée** : court terme, transformer la page en vue "messages non lus" (la donnée existe). Pas de modèle Notification Prisma pour l'instant (YAGNI).

**Files** :
- Modify: `src/app/notifications/page.tsx`
- Modify: `src/app/api/unread/route.ts` (renommer ou créer alias `/api/notifications`)

**Steps** :
- [ ] Step 1 : Créer `/api/notifications/route.ts` (GET) qui renvoie `Array<{ id, type: "message", title, snippet, href, createdAt, read }>` depuis les conversations avec messages non-lus du user.
- [ ] Step 2 : Modifier `notifications/page.tsx` pour fetch `/api/notifications`, supprimer `Array.isArray` workaround.
- [ ] Step 3 : Ajouter PATCH `/api/notifications/[id]/read` qui marque le message comme lu.
- [ ] Step 4 : Tester : envoyer un message vendor → user → vérifier qu'il apparaît dans `/notifications`. Cliquer → marquer lu → disparaît.

**Commit** : `feat(notifications): page affiche messages non-lus depuis DB`

---

### Task A.3 — Page `/budget` persistance DB (3h, finding #1 + #10 + #19 lié)

**Le plus gros** : refactor complet pour éliminer le state local et brancher sur `BudgetItem` Prisma.

**Files** :
- Create: `src/app/api/budget-items/route.ts` (GET + POST)
- Modify: `src/app/api/budget-items/[id]/route.ts` (vérifier PATCH/DELETE existent + IDOR)
- Modify: `src/app/budget/page.tsx` (refactor lecture + écriture)
- Modify: `src/lib/validations.ts` (ajouter `BudgetItemCreateSchema`)

**Steps** :
- [ ] Step 1 : Créer `BudgetItemCreateSchema` dans validations.ts (category, label, estimated, plannerId).
- [ ] Step 2 : Créer route `POST /api/budget-items` (auth + IDOR plannerId → userId, Zod parse, prisma.budgetItem.create).
- [ ] Step 3 : Créer route `GET /api/budget-items?plannerId=X` (auth + IDOR, retourne items du planner).
- [ ] Step 4 : Refactor `src/app/budget/page.tsx` :
  - useEffect → fetch GET au mount
  - addExpense → POST puis update state
  - togglePaid / deleteExpense → PATCH/DELETE existants
  - Mapping front (`Expense.amount`) ↔ DB (`BudgetItem.estimated/actual`)
- [ ] Step 5 : Vérifier que `DepensesRecentesWidget` du dashboard reflète maintenant les ajouts (via `dashboard-data.recentExpenses`).
- [ ] Step 6 : Vérifier widget `BudgetWidget` (donut) montre les bons items après création.

**Commit** : `feat(budget): persistance DB — POST /api/budget-items + UI sync`

---

### Task A.4 — Build + smoke test fin Phase A

- [ ] `npx next build` → 0 erreur
- [ ] Login local → `/budget` → ajout dépense → refresh → présente
- [ ] `/notifications` → message non-lu visible
- [ ] `/guests` → cards correctement stylées (texte visible, paddings OK)

**Commit** : N/A (vérif)

---

## Phase B — HIGH : cohérence data + sécurité (5 fixes, ~1.5 jours)

### Task B.1 — Tasks vs Steps : décision modèle (3h, finding #4)

**Décision tranchée** : `Task` = source de vérité pour les "à faire" (cycle de vie court, dueDate). `Step` = source pour les jalons planning (workflow long, status). Ne pas merger. Ajouter affichage des tasks dans `/planner`.

**Files** :
- Modify: `src/app/planner/PlannerClient.tsx` (ajout section "Tâches actives" sous les steps)
- Modify: `src/app/api/planners/[id]/route.ts` (inclure `tasks` dans le payload si pas déjà fait)

**Steps** :
- [ ] Step 1 : Vérifier `/api/planners/[id]` retourne déjà `tasks`. Sinon l'ajouter.
- [ ] Step 2 : Dans `PlannerClient.tsx`, ajouter une section "Mes tâches" sous les steps avec checklist + lien vers dashboard widget.
- [ ] Step 3 : Bidirectionnel : marker une task `done` depuis `/planner` → PATCH `/api/tasks/[id]`.

**Commit** : `feat(planner): affiche tasks à côté des steps`

---

### Task B.2 — `/api/messages` POST plan gating (2h, finding #6)

**Files** :
- Modify: `src/app/api/messages/route.ts`

**Steps** :
- [ ] Step 1 : Avant `prisma.conversation.upsert`, fetch `prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })`.
- [ ] Step 2 : Si `user.plan !== "pro"` : compter conversations existantes du user. Si ≥ 3, return 403 `{ error: "Limite Free atteinte. Passez Pro." }`.
- [ ] Step 3 : Tester avec compte Free → 4ème POST = 403.

**Commit** : `fix(security): /api/messages POST — plan gating server-side (Free max 3 convs)`

---

### Task B.3 — Labels confirmés clarifiés (30min, finding #7)

**Files** :
- Modify: `src/app/dashboard/DashboardClient.tsx` (badge top + widget RSVPLive)

**Steps** :
- [ ] Step 1 : Badge top dashboard : `${edata.guestConfirmed}/${edata.guestCount} confirmés` → `${edata.guestConfirmed}/${edata.guestCount} invités confirmés (manuel)`
- [ ] Step 2 : Widget RSVPLive label "confirmés" → "confirmés (site)"
- [ ] Step 3 : Vérif sur `/guests` que les labels sont déjà "Confirmés (site)" — déjà en place ✓

**Commit** : `fix(dashboard): clarification labels confirmés manuel vs site`

---

### Task B.4 — Moodboard / Faire-part / Transport en DB (1 jour, finding #8)

**Décision** : modèle générique `PlannerStorage` (key/value JSON) pour éviter 3 nouvelles tables.

**Files** :
- Modify: `prisma/schema.prisma` (ajout modèle `PlannerStorage`)
- Create: `src/app/api/planners/[id]/storage/route.ts` (GET + PUT par key)
- Modify: `src/app/dashboard/DashboardClient.tsx` (3 widgets : moodboard, envoi, transport)

**Steps** :
- [ ] Step 1 : Schema Prisma :
  ```prisma
  model PlannerStorage {
    id        String   @id @default(cuid())
    plannerId String
    key       String   // "moodboard" | "envoi" | "transport"
    value     Json
    updatedAt DateTime @updatedAt
    planner   Planner  @relation(fields: [plannerId], references: [id], onDelete: Cascade)
    @@unique([plannerId, key])
  }
  ```
- [ ] Step 2 : `DATABASE_URL=$DIRECT_URL npx prisma db push && npx prisma generate`
- [ ] Step 3 : Route `GET /api/planners/[id]/storage?key=X` + `PUT` (auth + IDOR + Zod validation).
- [ ] Step 4 : Refactor `MoodboardWidget` : `useEffect` GET au mount, `setItems` PUT debounced (1s).
- [ ] Step 5 : Idem `EnvoiFairepartWidget` (compteur faireParts) et `TransportWidget` (selected guests + datetime).
- [ ] Step 6 : Migration douce : si localStorage existant détecté au mount, faire 1 PUT puis nettoyer localStorage.

**Commit** : `feat(planner): PlannerStorage table — moodboard/envoi/transport persistés DB`

---

### Task B.5 — Console errors `<img>` (15min, finding #9)

**Files** :
- Modify: `src/app/dashboard/DashboardClient.tsx:574` (moodboard)
- Modify: `src/app/profile/page.tsx:170` (avatar)

**Steps** :
- [ ] Step 1 : Moodboard `<img>` data:url → garder `<img>` mais avec `// eslint-disable-next-line @next/next/no-img-element` au-dessus + commentaire (justification : data:url non optimisable Image).
- [ ] Step 2 : Profile avatar : remplacer `<img>` par `<Image src width height alt />`.

**Commit** : `fix(dashboard,profile): élimine warnings img native`

---

## Phase C — MEDIUM : hygiène (5 fixes, ~1 jour)

### Task C.1 — Empty states widgets manquants (4h, findings #10, #FLAG list)

Pour les 12 widgets en FLAG (audit table widgets), ajouter empty state explicite quand data vide.

**Files** :
- Modify: `src/app/dashboard/DashboardClient.tsx` (renderTasks, renderBookings, renderMessages, BudgetWidget, DepensesRecentesWidget, RepartitionBudgetWidget, ContratsWidget, AlertesWidget, TimelineMariageWidget)

**Pattern à appliquer** :
```tsx
{items.length === 0 && (
  <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)", textAlign: "center", padding: "var(--space-md)" }}>
    Aucun X enregistré · <Link href="/X">Ajouter →</Link>
  </p>
)}
```

**Commit** : `fix(widgets): empty states explicites pour 9 widgets en FLAG`

---

### Task C.2 — ChecklistJX persistance (30min, finding #11)

**Files** :
- Modify: `src/app/dashboard/DashboardClient.tsx:451-462`

**Steps** :
- [ ] Step 1 : `setExtra` → POST `/api/tasks` avec `{ title, plannerId, category: "Checklist J-X" }`.
- [ ] Step 2 : Liste extra = filter `dashboardData.tasks.filter(t => t.category?.startsWith("Checklist"))`.
- [ ] Step 3 : Cocher → PATCH `/api/tasks/[id]`.

**Commit** : `fix(dashboard): ChecklistJX persisté en DB via /api/tasks`

---

### Task C.3 — `/api/me` audit IDOR (1h, finding #12)

**Files** :
- Audit: `src/app/api/me/route.ts`

**Steps** :
- [ ] Step 1 : Vérifier que GET utilise `session.user.id` UNIQUEMENT, jamais `req.url` query param.
- [ ] Step 2 : Si OK → noter "vérifié" dans audit. Si KO → fix immédiat.

**Commit** : `chore(security): vérification IDOR /api/me confirmée` (ou fix si bug trouvé)

---

### Task C.4 — Tokens `--dash-text-X` (1h, finding #13)

**Décision** : ajouter alias `--dash-text-1: var(--dash-text);` dans globals.css plutôt que renommer 200+ occurrences.

**Files** :
- Modify: `src/app/globals.css`

**Commit** : `chore(css): alias --dash-text-1 pour cohérence avec --dash-text-2/3`

---

### Task C.5 — Settings flashTimer cleanup (15min, finding #14)

**Files** :
- Modify: `src/app/settings/page.tsx`

**Steps** :
- [ ] Step 1 : Ajouter `useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current) }, [])`.

**Commit** : `fix(settings): cleanup flashTimer au unmount`

---

## Phase D — LOW : refactor (3 items, ~3h)

### Task D.1 — Extract widgets into separate files (2h, finding #15)

**Files** :
- Create: `src/components/clone/dashboard/widgets/*.tsx` (1 fichier par widget)
- Modify: `src/app/dashboard/DashboardClient.tsx` (imports)

**Strategy** : extraire 1 widget à la fois, vérifier visuel inchangé après chaque, commit.

**Commit pattern** : `refactor(dashboard): extract <WidgetName> widget`

---

### Task D.2 — Vérification liens `/event-site` (30min, finding #16)

**Files** :
- Audit: `src/components/clone/dashboard/DashSidebar.tsx`
- Audit: `src/components/clone/AntNav.tsx`

**Steps** :
- [ ] Step 1 : Grep tous les liens contenant `event-site` → vérifier qu'ils pointent vers `/dashboard/event-site` (existant) ou `/evt/[slug]` (public).
- [ ] Step 2 : Corriger si liens cassés vers `/event-site` direct.

**Commit** : `fix(nav): liens event-site corrigés` (ou rien si tout OK)

---

### Task D.3 — Renommer `--text-muted` → `--color-muted` (30min, finding #17)

**Files** :
- Modify: `src/app/globals.css` (renommer la var)
- Modify: tous les usages (grep `--text-muted`)

**Commit** : `chore(css): renomme --text-muted → --color-muted (évite confusion typographie)`

---

## Vérification finale (post-Phase A à D)

- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] `npx next build` → 0 erreur
- [ ] Smoke test :
  - `/budget` ajout → refresh → présent
  - `/notifications` affiche messages non-lus
  - `/guests` cards stylées
  - Dashboard widgets : tous ont empty state ou data
  - Free user → 4ème conv → 403
  - Moodboard/Transport survivent au refresh
- [ ] Re-run `momento-dashscan` → vérifier 0 CRITICAL, 0 HIGH restants
- [ ] Supprimer `DASHBOARD-AUDIT.md` (rapport obsolète)

---

## Mode d'exécution recommandé

**Inline** (1 session, ~3 jours) si focus complet possible.
**GSD phase-by-phase** (Phase A → review → Phase B → review …) pour validation utilisateur entre chaque chunk.
**Subagent-driven** : `superpowers:subagent-driven-development` peut dispatch chaque Task dans un agent isolé pour parallélisation.

Quand prêt à reprendre :
1. Lire ce fichier
2. Choisir Phase de départ (recommandé : A)
3. `superpowers:executing-plans` ou `gsd-execute-phase` pour démarrer

---

## Notes finales

- Plan rédigé après chantier RSVP-espace-client (mergé sur main 2026-04-27).
- À reprendre **après** Phase 4 responsive (VendorProfileClient, ExploreClient, 14 pages secondaires, Ant* hygiène).
- Estimation totale : Phase A (6h) + B (1.5j) + C (1j) + D (3h) ≈ **3-4 jours focus**.
- Aucune migration de schéma destructive. Backward-compat garanti.
