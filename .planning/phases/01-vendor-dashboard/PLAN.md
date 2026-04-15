# Phase 1 — Dashboard Prestataire Momento (MVP fonctionnel)

**Goal** : un prestataire marocain peut gérer ses demandes, voir ses perfs 30j, et améliorer sa fiche sans quitter Momento.

**Scope** : 6 features, 4 graphs, layout sidebar + AntNav. Pas de Vercel Blob, pas d'IA, pas d'avis (Phase 2+).

**Status** : ready to execute.

---

## 🗂️ Inventaire de l'existant (ne pas refaire)

| Déjà en place | Utilisation Phase 1 |
|---|---|
| `Vendor` + `VendorProfile` (prisma) | lecture pour complétude, packages, preview |
| `Package` (prisma) | **réutiliser tel quel** pour feature #5 |
| `ContactRequest` (prisma, statuts `pending/confirmed/declined`) | **étendre** statuts pour Inbox (#1) |
| `Conversation` + `Message` (prisma) | liaison Inbox → conversation existante |
| `/api/vendor/dashboard` GET/PATCH | **garder**, étendre (stats, statuts inbox) |
| `/vendor/dashboard/page.tsx` | **refonte** (actuellement liste brute) |
| `AntNav` top | réutiliser tel quel |
| `useSession` NextAuth + dev switcher email | déjà commit 51d7b2d |

---

## 📐 Schema DB — additions minimales

Fichier : `prisma/schema.prisma`

### Nouveau modèle `VendorEvent` (analytics profil)
```prisma
model VendorEvent {
  id         String   @id @default(cuid())
  vendorSlug String
  type       String   // "view" | "contact_click" | "phone_click" | "whatsapp_click" | "instagram_click"
  sessionId  String?  // cookie anonyme, dédupe 30min
  referrer   String?
  createdAt  DateTime @default(now())

  @@index([vendorSlug, type, createdAt])
  @@index([vendorSlug, createdAt])
}
```
> **Pourquoi table flat** : une seule table, un seul index compound, ~5 queries d'agrégation suffisent pour tous les KPIs. Pas de sur-ingénierie (on évite VendorView + VendorClick séparés).

### Nouveau modèle `VendorTemplate` (réponses pré-faites)
```prisma
model VendorTemplate {
  id        String   @id @default(cuid())
  userId    String
  title     String   // ex: "Dispo week-end", "Tarifs standard"
  body      String   // corps du message
  lang      String   @default("fr") // "fr" | "ar" | "darija"
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, order])
}
```
→ Ajouter côté `User` : `vendorTemplates VendorTemplate[]`

### Étendre `ContactRequest.status`
Ajouter `"replied" | "won" | "lost"` aux statuts valides (app code only, string → pas de migration).
Statuts finaux : `pending | replied | won | lost | declined`.

### Migration
```bash
DATABASE_URL=$DIRECT_URL npx prisma db push
npx prisma generate
```

---

## 🌐 Routes API — nouvelles + étendues

| Route | Méthode | Rôle |
|---|---|---|
| `/api/vendor/stats` | GET | KPIs 30j (vues, clics contact, demandes, CVR) + sparkline + funnel + delta vs 30j précédents |
| `/api/vendor/completion` | GET | Score complétude + checklist missing |
| `/api/vendor/packages` | GET, POST | Liste + création package du vendor connecté |
| `/api/vendor/packages/[id]` | PATCH, DELETE | Update/delete (IDOR check : vendor owns package) |
| `/api/vendor/templates` | GET, POST | Liste + création templates |
| `/api/vendor/templates/[id]` | PATCH, DELETE | Update/delete |
| `/api/vendor/requests/[id]` | PATCH | Changer statut demande (pending→replied→won/lost) |
| `/api/vendor/dashboard` | GET | **Étendre** : ajouter stats déjà calculées ici |
| `/api/track` | POST | Tracking event (view/click) côté public `/vendor/[slug]` |

**Contrainte IDOR absolue** : chaque route vendor filtre par `session.user.id` puis vérifie `role === "vendor"` + ownership de la ressource (package.vendor.userId === session.user.id).

**Rate limit `/api/track`** : Upstash (déjà installé) — 60 req/min par IP pour éviter pollution analytics.

---

## 🧩 Composants UI à créer

Dossier : `src/components/vendor/dashboard/`

| Composant | Rôle | Dépendances |
|---|---|---|
| `VendorSidebar.tsx` | Sidebar gauche (Home / Inbox / Packages / Templates / Profil / Paramètres) | calque `DashSidebar` côté client |
| `KPIStrip.tsx` | 4 cards KPI avec delta % | `/api/vendor/stats` |
| `SparklineViews.tsx` | Area chart vues 30j | `recharts` |
| `FunnelChart.tsx` | Funnel 4 étapes (vues→clics→demandes→gagné) | `recharts` ou SVG maison |
| `InboxDonut.tsx` | Donut par statut demande | `recharts` |
| `ProfileScoreCard.tsx` | Jauge % + checklist missing actionable | `/api/vendor/completion` |
| `PreviewCard.tsx` | Lien "Voir ma fiche" + iframe thumbnail | `/vendor/[slug]` |
| `InboxTable.tsx` | Table demandes avec filtres statut + action rapide "répondre avec template" | `/api/vendor/dashboard` |
| `PackageEditor.tsx` | CRUD packages (3 niveaux suggérés) | `/api/vendor/packages` |
| `TemplateManager.tsx` | CRUD templates FR/AR/darija | `/api/vendor/templates` |
| `ReplyWithTemplate.tsx` | Modal : pick template → envoi message → maj statut `replied` | `/api/vendor/templates` + `/api/messages` |

**recharts** : vérifier si déjà installé (`package.json`), sinon `npm i recharts`.

---

## 📄 Pages à créer / refondre

| Route | Action | Contenu |
|---|---|---|
| `/vendor/dashboard` | **Refonte** | Home = KPIStrip + Sparkline + Funnel + InboxDonut + ProfileScoreCard + PreviewCard (grid 2 colonnes desktop, stack mobile) |
| `/vendor/dashboard/inbox` | **Nouveau** | InboxTable full-width + filtres statut + action "répondre" |
| `/vendor/dashboard/packages` | **Nouveau** | PackageEditor (liste + CRUD modal) |
| `/vendor/dashboard/templates` | **Nouveau** | TemplateManager (liste + CRUD) |
| `/vendor/dashboard/profil` | **Nouveau** | Édition bio/tel/email/IG/FB + preview live + score |
| `/vendor/dashboard/layout.tsx` | **Nouveau** | AntNav + VendorSidebar wrapper |

---

## 📋 Tasks — ordre d'exécution

### T1. DB + migration ⏱️ S
- [ ] Ajouter `VendorEvent` + `VendorTemplate` dans schema.prisma
- [ ] `prisma db push` + `prisma generate`
- [ ] Vérifier build passe
- **Dépend de** : rien
- **Fichiers** : `prisma/schema.prisma`

### T2. Tracking route `/api/track` ⏱️ S
- [ ] POST `{slug, type, sessionId?}` → insère `VendorEvent`
- [ ] Rate limit Upstash 60/min par IP
- [ ] Dédup sessionId+slug+type sur fenêtre 30min
- **Dépend de** : T1
- **Fichiers** : `src/app/api/track/route.ts`

### T3. Instrumenter `/vendor/[slug]` page publique ⏱️ S
- [ ] Côté client : fire `POST /api/track` sur mount (type=view) + sur clic contact/phone/IG/FB
- [ ] Générer sessionId (cookie 30min) côté client
- **Dépend de** : T2
- **Fichiers** : `src/app/vendor/[slug]/page.tsx` (+ éventuellement un hook `useTrack.ts`)

### T4. API `/api/vendor/stats` ⏱️ M
- [ ] GET retourne : `{kpi:{views, clicks, requests, cvr}, delta:{views, clicks, requests, cvr}, sparkline:[{date, views}…30], funnel:{views, clicks, requests, won}, inboxByStatus:{pending, replied, won, lost, declined}}`
- [ ] Fenêtres : 30j courants vs 30j précédents
- [ ] 5 queries Prisma parallèles, `groupBy` + `count`
- [ ] IDOR : filtre par `vendorSlug` du session user
- **Dépend de** : T1
- **Fichiers** : `src/app/api/vendor/stats/route.ts`

### T5. API `/api/vendor/completion` ⏱️ S
- [ ] GET retourne `{score:0-100, missing:[{key, label, href}]}`
- [ ] Checklist : cover photo, bio ≥ 100 chars, téléphone, email, WhatsApp, IG, FB, ≥3 photos, ≥1 package, prix range
- **Dépend de** : T1
- **Fichiers** : `src/app/api/vendor/completion/route.ts`

### T6. API Packages CRUD ⏱️ M
- [ ] GET/POST sur `/api/vendor/packages` (filtré par vendorId du user)
- [ ] PATCH/DELETE sur `/api/vendor/packages/[id]` avec ownership check
- [ ] Validation : name, price ≥ 0, duration optionnelle
- **Dépend de** : T1
- **Fichiers** : `src/app/api/vendor/packages/route.ts`, `.../[id]/route.ts`

### T7. API Templates CRUD ⏱️ M
- [ ] GET/POST/PATCH/DELETE sur `/api/vendor/templates[/id]`
- [ ] Validation : title, body, lang ∈ {fr,ar,darija}
- **Dépend de** : T1
- **Fichiers** : `src/app/api/vendor/templates/route.ts`, `.../[id]/route.ts`

### T8. API request status transition ⏱️ S
- [ ] PATCH `/api/vendor/requests/[id]` avec statuts étendus `pending|replied|won|lost|declined`
- [ ] Ownership : `contact.vendorSlug === user.vendorSlug`
- **Dépend de** : T1
- **Fichiers** : `src/app/api/vendor/requests/[id]/route.ts` OU étendre PATCH existant `/api/vendor/dashboard`

### T9. Layout dashboard + sidebar ⏱️ M
- [ ] `/vendor/dashboard/layout.tsx` : AntNav + VendorSidebar + `<main>` enfant
- [ ] `VendorSidebar.tsx` : items (Home, Inbox, Packages, Templates, Profil), active state, dev switcher "Vue client"
- **Dépend de** : rien (mais unlock T10-T14)
- **Fichiers** : `src/app/vendor/dashboard/layout.tsx`, `src/components/vendor/dashboard/VendorSidebar.tsx`

### T10. Home dashboard (composants analytics) ⏱️ L
- [ ] `KPIStrip` (4 cards + deltas colorés)
- [ ] `SparklineViews` (recharts AreaChart)
- [ ] `FunnelChart` (4 barres dégressives)
- [ ] `InboxDonut` (recharts PieChart)
- [ ] `ProfileScoreCard` (jauge + liste missing)
- [ ] `PreviewCard` (lien `/vendor/[slug]` + mini-preview)
- [ ] `page.tsx` assemble tout : grid responsive 2-col desktop
- **Dépend de** : T4, T5, T9
- **Fichiers** : `src/app/vendor/dashboard/page.tsx`, 6 composants

### T11. Inbox page + InboxTable ⏱️ L
- [ ] Table avec colonnes : date, client, eventType, message, statut, actions
- [ ] Filtres par statut (tabs : Tout, Nouveau, Répondu, Gagné, Perdu)
- [ ] Bouton "Répondre" → ouvre `ReplyWithTemplate` modal
- [ ] Modal : liste templates, éditable avant envoi, envoie via `/api/messages` + PATCH statut `replied`
- **Dépend de** : T7, T8, T9
- **Fichiers** : `src/app/vendor/dashboard/inbox/page.tsx`, `InboxTable.tsx`, `ReplyWithTemplate.tsx`

### T12. Packages page ⏱️ M
- [ ] Liste des packages actuels
- [ ] Modal "Ajouter/Éditer" : nom, description, prix (MAD), durée, inclus, max invités
- [ ] Suggestion 3 niveaux (Essentiel/Premium/Signature) au 1er accès si 0 package
- **Dépend de** : T6, T9
- **Fichiers** : `src/app/vendor/dashboard/packages/page.tsx`, `PackageEditor.tsx`

### T13. Templates page ⏱️ M
- [ ] Liste triable (drag ou arrows)
- [ ] Modal édition : titre, langue (dropdown), corps (textarea)
- [ ] Seed suggéré au 1er accès : 3 templates (Dispo, Tarifs, Remerciement) en FR
- **Dépend de** : T7, T9
- **Fichiers** : `src/app/vendor/dashboard/templates/page.tsx`, `TemplateManager.tsx`

### T14. Profil page (édition + preview) ⏱️ M
- [ ] Formulaire : bio, phone, email, WhatsApp, IG, FB, website, priceFrom/priceTo
- [ ] Live preview à droite (desktop) ou en bas (mobile) : iframe `/vendor/[slug]?preview=1`
- [ ] Score complétude + missing cliquable qui scroll vers le champ
- **Dépend de** : T5, T9
- **Fichiers** : `src/app/vendor/dashboard/profil/page.tsx`

### T15. Polish + build + commits ⏱️ S
- [ ] `npx next build` passe sans erreur
- [ ] Toutes routes testées avec session vendor réelle (Youssef/moumene486@gmail.com)
- [ ] Commits atomiques par task ou groupe logique

---

## 🔒 Sécurité — checklist obligatoire

- [ ] Chaque route vendor vérifie `session.user.id` + `role === "vendor"` (pas juste email)
- [ ] Ownership vérifié AVANT toute mutation (package/template/request appartient au vendor)
- [ ] `/api/track` rate-limited, ne leak pas d'info si slug inexistant
- [ ] Pas de SQL brut, tout via Prisma
- [ ] Validation des inputs (zod ou check manuel) sur POST/PATCH
- [ ] `VendorEvent` stocke IP ? → **non**. Juste sessionId anonyme. RGPD-light.

---

## ✅ Vérifications E2E

1. Login en tant que `moumene486@gmail.com` (role vendor)
2. Aller sur `/vendor/dashboard` → 4 KPIs s'affichent, graphs rendered
3. Cliquer "Vue prestataire" depuis `/accueil` → atterrit sur dashboard ✅
4. Ouvrir Inbox → demandes listées, filtres fonctionnent
5. Répondre à une demande via template → message envoyé, statut devient `replied`
6. Créer un package → visible sur fiche publique `/vendor/[slug]`
7. Éditer bio sur page Profil → preview iframe reflète le changement
8. Ouvrir fiche publique dans autre onglet → voir KPI "vues" augmenter (après ~1min, à cause du refresh)
9. Score complétude passe de X% à Y% quand on remplit un champ manquant
10. `npx next build` passe

---

## 🚫 Out of scope (Phase 2+)

- Upload photos Vercel Blob
- Reviews + réponse
- CTR/CVR benchmarking vs concurrents
- Alertes 24h / badges réactivité
- IA Fiche-Doctor, Battle, Heatmap Maroc, Mode Urgence WE
- Chat inter-prestataires
- Calendrier dispo
- Multi-langue UI (seulement templates multi-lang)
- Export CSV

---

## 📊 Estimation globale

| Groupe | Effort |
|---|---|
| DB + tracking (T1-T3) | S+S+S = 1 unité |
| APIs (T4-T8) | M+S+M+M+S = 3 unités |
| Layout (T9) | M = 1 unité |
| Pages UI (T10-T14) | L+L+M+M+M = 5 unités |
| Polish (T15) | S = 0.5 unité |
| **Total** | **~10.5 unités** (chantier dense mais fini) |

Ordre optimal : **T1 → T4/T5/T6/T7/T8 (parallèle possible) → T9 → T10/T11/T12/T13/T14 (parallèle possible) → T2/T3 → T15**.

Tracking (T2/T3) peut être fait en fin de phase si les stats sont OK avec données dummy au début.

---

## 🤖 Protocole validation par feature (gate obligatoire entre tasks)

**Règle** : après chaque task (T1 → T15), on NE PASSE PAS à la suivante sans que l'agent-testeur ait répondu `PASS`. Si `FAIL`, correction immédiate puis re-test jusqu'à PASS.

### Agent : `feature-validator` (spawné avec `subagent_type: "general-purpose"`, modèle Haiku pour vitesse)

### Briefing type (template à adapter par task)

```
Tu es un agent de validation pour la Phase 1 du dashboard prestataire Momento.

TASK VALIDÉE : T{N} — {titre de la task}
FICHIERS TOUCHÉS : {liste}
CRITÈRES À VÉRIFIER :
  1. Le build passe : `npx next build` sans erreur TypeScript
  2. [Critères fonctionnels spécifiques à la task]
  3. [Critères sécurité si route API — IDOR, auth, validation inputs]
  4. Pas de régression : routes/pages voisines toujours fonctionnelles

MÉTHODE :
  - Lire les fichiers modifiés
  - Exécuter le build
  - Pour les routes API : simuler une requête (curl ou analyse statique de la handler)
  - Pour les composants UI : vérifier props typing, pas de key manquante, pas de hook conditionnel
  - Pour la DB : vérifier schema.prisma valide + prisma generate OK

OUTPUT (≤ 200 mots) :
  - STATUS : PASS ou FAIL
  - Si FAIL : liste précise des problèmes avec fichier:ligne
  - Si PASS : 1 phrase de validation + éventuelles remarques mineures (non-bloquantes)
  - Ne recommande JAMAIS de refactor hors scope. Juste : ça marche ou non.
```

### Flow par task
```
[implémentation T{N}] 
     ↓
[commit local atomique "feat(vendor-dashboard): T{N} — xxx"]
     ↓
[spawn feature-validator Haiku]
     ↓
  ┌──────────┐
  ↓          ↓
PASS       FAIL
  ↓          ↓
T{N+1}    [lire output → corriger → re-commit amend → re-spawn validator]
                                     ↑___________________|
                                      (max 3 itérations, sinon escalate user)
```

### Critères spécifiques par task

| Task | Critères additionnels du validator |
|---|---|
| **T1** DB | `prisma validate` OK, `prisma generate` OK, migration appliquée sans drop |
| **T2** /api/track | Rate limit 60/min testable, dédup 30min fonctionne, 400 si body invalide |
| **T3** tracking client | Pas de double-fire, sessionId persisté cookie, pas de 404/erreur console |
| **T4** /api/vendor/stats | IDOR : un autre vendor ne peut PAS lire les stats d'un vendor tiers, 5 queries réellement parallèles |
| **T5** /api/vendor/completion | Score 0-100 cohérent, missing array trié par priorité, href valides |
| **T6** Packages CRUD | IDOR strict, prix ≥ 0, 404 si package pas au vendor |
| **T7** Templates CRUD | Même IDOR, lang validé enum, order unique par user |
| **T8** Requests status | Transitions valides seulement (pas pending→won direct), IDOR vendorSlug |
| **T9** Layout | Sidebar active state correct, mobile collapse, dev switcher visible pour email dev |
| **T10** Home dashboard | 4 KPIs rendered avec données réelles, graphs sans error console, responsive 375px |
| **T11** Inbox | Filtres persistent URL query, modal template s'ouvre, envoi maj statut DB |
| **T12** Packages page | Création package visible immédiatement sur `/vendor/[slug]` |
| **T13** Templates page | Drag-reorder persiste ordre en DB |
| **T14** Profil page | Edit → preview iframe se rafraîchit, score remonte en temps réel |
| **T15** Polish | Build prod OK, no console warning, lighthouse mobile ≥ 80 sur dashboard |

### Escalation
Si le validator FAIL 3× sur la même task → stop, message à l'utilisateur avec :
- ce qui a été tenté
- le blocage précis
- 2 options de résolution

---

## 🎯 Critère de succès

> Un prestataire connecté à Momento pour la première fois sur ce dashboard peut, en moins de 5 minutes : voir ses perfs, répondre à une demande avec un template, créer un package, voir son score de complétude, et cliquer vers sa fiche publique. Sans lire la moindre doc.

**Prêt à exécuter**. Next : `gsd-execute-phase` sur T1-T3, puis T4-T8 en parallèle.
