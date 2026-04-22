# Phase 02 — Mes Prestataires : Arbre de sélection prestataires lié à l'événement

## Goal
Le client crée un événement avec ses catégories obligatoires (≥3), accède à `/mes-prestataires` pour voir son tableau de bord par catégorie, clique "Je suis intéressé" sur un prestataire depuis le widget swipe → PlannerVendor créé + message auto (partenaire) ou WhatsApp (non-partenaire) → tout l'arbre Planner→PlannerVendor→Conversation est lié.

**Principe transversal — fix-everything-as-you-go** : à chaque task, avant de committer :
1. Run `npx next build` et corriger TOUTES les erreurs TS/lint rencontrées
2. Si une console error / warning / 500 est visible en chemin → STOP → corriger → reprendre
3. Étendre la correction à tous les cas similaires dans le fichier touché

---

## Schema DB — additions

### Sur model Planner
```prisma
categories String[] @default([])
plannerVendors PlannerVendor[]
```

### Nouveau model PlannerVendor
```prisma
model PlannerVendor {
  id         String   @id @default(cuid())
  plannerId  String
  planner    Planner  @relation(fields: [plannerId], references: [id], onDelete: Cascade)
  vendorSlug String
  vendor     Vendor   @relation(fields: [vendorSlug], references: [slug], onDelete: Cascade)
  status     String   @default("contacted") // contacted | replied | confirmed
  notes      String   @default("")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([plannerId, vendorSlug])
}
```
→ Ajouter `plannerVendors PlannerVendor[]` sur model Vendor également.

### Nouveau model RankingConfig
```prisma
model RankingConfig {
  id        String   @id @default(cuid())
  signal    String   @unique
  weight    Float    @default(1.0)
  label     String   @default("")
  updatedAt DateTime @updatedAt
}
```

### Sur model Vendor
```prisma
plannerVendors PlannerVendor[]
```

---

## Routes API

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/planners` | POST | créer planner avec categories (min 3) |
| `/api/planners/[id]` | PATCH | update planner + categories |
| `/api/planners/[id]/vendors` | GET | liste PlannerVendors avec data vendor |
| `/api/planners/[id]/vendors` | POST | créer PlannerVendor (status: contacted) |
| `/api/planners/[id]/vendors/[vendorSlug]` | PATCH | update statut/notes |
| `/api/vendors` | GET | smart ranking RankingConfig + ?category= + media |
| `/api/prestataires/interest` | POST | "Je suis intéressé" flow complet |
| `/api/admin/ranking` | GET/PATCH | lire/modifier les poids RankingConfig |

---

## Composants et pages

| Fichier | Action | Notes |
|---------|--------|-------|
| `src/components/clone/dashboard/CreateEventModal.tsx` | CREATE | Modal 2 étapes |
| `src/components/prestataires/VendorDiscoverCard.tsx` | CREATE | adapté de VendorSwipeModal |
| `src/app/mes-prestataires/page.tsx` | CREATE | tableau de bord par catégorie |
| `src/app/admin/ranking/page.tsx` | CREATE | UI admin poids RankingConfig |
| `src/components/clone/dashboard/DashSidebar.tsx` | MODIFY | nav + CreateEventModal |
| `src/app/dashboard/page.tsx` | FIX | widget reste ouvert sur swipe |
| `src/proxy.ts` | MODIFY | ajouter `/mes-prestataires` dans PROTECTED |

---

## Tasks

### T0 — Pre-flight audit
**Objectif** : base saine avant toute modification
**Actions** :
1. `npx next build` — lister et corriger TOUTES les erreurs existantes
2. Grep pour `@prisma/client` dans src/ → remplacer par `@/generated/prisma/client`
3. Vérifier que `/mes-prestataires` n'existe pas déjà (conflict URL)
4. Confirmer que `/prestataires/page.tsx` est la landing prestataire (ne pas toucher)
5. Grep `console.error` sans handler dans les routes API → corriger
**Fichiers** : `src/**/*.ts`, `src/**/*.tsx`, `prisma/schema.prisma`
**Critère** : build pass, 0 import `@prisma/client` dans src/
**Fix-everything** : toute erreur TS découverte → corriger avant T1

---

### T1 — Schema DB + migration
**Objectif** : base de données prête
**Dépend de** : T0
**Actions** :
1. Ajouter `categories String[] @default([])` + `plannerVendors PlannerVendor[]` sur model Planner
2. Créer model PlannerVendor (voir spec ci-dessus)
3. Ajouter `plannerVendors PlannerVendor[]` sur model Vendor
4. Créer model RankingConfig
5. `npx prisma generate`
6. `DATABASE_URL=$DIRECT_URL npx prisma db push`
7. Vérifier que Prisma client est régénéré dans `src/generated/prisma/client`
**Fichiers** : `prisma/schema.prisma`
**Critère** : `db push` sans erreur, types Prisma générés incluent PlannerVendor + RankingConfig
**Fix-everything** : si d'autres relations cassées dans le schema → corriger en même temps

---

### T2 — API POST /api/planners — catégories obligatoires
**Objectif** : création événement persistante avec catégories
**Dépend de** : T1
**Actions** :
1. Lire `src/app/api/planners/route.ts`
2. Accepter `categories: string[]` dans le body
3. Valider : `categories.length >= 3` → 400 si non respecté (message explicite)
4. Persister via `prisma.planner.create({ data: { ...fields, categories } })`
5. Retourner le planner créé avec ses categories
**Fichiers** : `src/app/api/planners/route.ts`
**Critère** : POST avec `categories: ["photo","dj","traiteur"]` → planner créé avec ces catégories en DB
**Fix-everything** : si d'autres champs non validés dans le handler → ajouter la validation

---

### T3 — API PATCH /api/planners/[id] — update catégories
**Objectif** : permettre ajout/modification des catégories d'un événement existant
**Dépend de** : T1
**Actions** :
1. Lire `src/app/api/planners/[id]/route.ts`
2. Accepter `categories?: string[]` dans le PATCH body
3. Si fourni, valider `categories.length >= 3`
4. IDOR : vérifier que le planner appartient au user connecté avant update
**Fichiers** : `src/app/api/planners/[id]/route.ts`
**Critère** : PATCH `{ categories: ["photo","dj","musique","lieu"] }` → categories mises à jour
**Fix-everything** : si d'autres champs PATCH ne vérifient pas IDOR → corriger

---

### T4 — Smart ranking partagé : /api/vendors + /explore
**Objectif** : vendors classés par poids admin-configurables sur LES DEUX surfaces (API + explore page)
**Dépend de** : T1
**Note** : `/explore` utilise `getAllVendorsForExplore()` dans `src/lib/vendorQueries.ts` (Prisma direct, `orderBy: { name: "asc" }`) — ne passe PAS par /api/vendors. Les deux sources doivent partager la même logique.
**Actions** :
1. Créer une fonction utilitaire `src/lib/rankingScore.ts` :
   - `getRankingWeights()` → lit RankingConfig depuis Prisma (avec seed si table vide : featured=100, rating=30, reviewCount=20, mediaCount=10)
   - `scoreVendor(vendor, weights)` → calcule Σ(signal_value × weight)
   - `sortVendorsByScore(vendors, weights)` → tri décroissant
2. **GET /api/vendors** :
   - Importer `getRankingWeights` + `sortVendorsByScore`
   - Remplacer `orderBy` basique par le score calculé
   - Ajouter param `?category=` → filter `{ category: { contains: category, mode: "insensitive" } }`
   - Inclure `media: { take: 3 }` dans le select
3. **`getAllVendorsForExplore()`** dans `src/lib/vendorQueries.ts` :
   - Remplacer `orderBy: { name: "asc" }` par appel à `getRankingWeights` + `sortVendorsByScore`
   - Même logique, même poids — /explore et /api/vendors sont synchronisés
**Fichiers** : `src/lib/rankingScore.ts` (NEW), `src/app/api/vendors/route.ts`, `src/lib/vendorQueries.ts`
**Critère** : vendors `featured=true` apparaissent en premier sur /explore ET /api/vendors ; modifier le poids admin impacte les deux
**Fix-everything** : si rate limit ou cache cassé dans la route → corriger

---

### T5 — API /api/planners/[id]/vendors — CRUD PlannerVendor
**Objectif** : lier un vendor à un événement avec un statut
**Dépend de** : T1
**Actions** :
1. Créer `src/app/api/planners/[id]/vendors/route.ts`
   - GET : liste PlannerVendors du planner (avec vendor data : name, slug, category, featured, rating, photos)
   - POST `{ vendorSlug }` : crée PlannerVendor status=contacted (upsert si déjà existant)
   - IDOR : vérifier planner.userId === session.user.id
2. Créer `src/app/api/planners/[id]/vendors/[vendorSlug]/route.ts`
   - PATCH `{ status?, notes? }` : update statut/notes
   - DELETE : supprimer le lien
**Fichiers** : `src/app/api/planners/[id]/vendors/route.ts` + `[vendorSlug]/route.ts`
**Critère** : POST crée PlannerVendor unique, GET retourne la liste avec vendor enrichi
**Fix-everything** : si la structure de dossier API casse d'autres routes → corriger le conflit

---

### T6 — API POST /api/prestataires/interest — "Je suis intéressé"
**Objectif** : flow complet CTA → message/WhatsApp selon type partenaire
**Dépend de** : T5
**Actions** :
1. Créer `src/app/api/prestataires/interest/route.ts`
2. Body : `{ vendorSlug, plannerId, lang: "fr"|"darija"|"ar" }`
3. Récupérer le vendor + vérifier session.user.id
4. Créer PlannerVendor (upsert, status=contacted) via logique T5
5. Si `vendor.featured === true` (partenaire) :
   - Templates auto par lang :
     - fr: "Bonjour, je suis intéressé(e) par vos services pour mon événement. Pouvez-vous me contacter pour plus d'informations ?"
     - darija: "Salam, bghit n3ref aktar 3la khadamatek. Wach imken tnessni ?"
     - ar: "مرحباً، أنا مهتم بخدماتكم لحفلي. هل يمكنكم التواصل معي للمزيد من المعلومات؟"
   - POST interne sur /api/messages logic : créer Conversation + Message
   - Retourner `{ type: "message", conversationId }`
6. Si `vendor.featured === false` :
   - Retourner `{ type: "whatsapp", phone: vendor.phone }` (client ouvre WhatsApp côté front)
**Fichiers** : `src/app/api/prestataires/interest/route.ts`
**Critère** : partenaire → Message créé en DB + conversationId retourné ; non-partenaire → `{ type: "whatsapp" }`
**Fix-everything** : si /api/messages a des bugs → corriger en même temps

---

### T7 — API /api/admin/ranking — CRUD RankingConfig
**Objectif** : admin peut modifier les poids du smart ranking
**Dépend de** : T4
**Actions** :
1. Créer `src/app/api/admin/ranking/route.ts`
2. GET : retourner tous les RankingConfig
3. PATCH `{ signal, weight }` : update le poids
4. Vérifier `session.user.role === "admin"` → 403 sinon
5. Valider : weight entre 0 et 100
**Fichiers** : `src/app/api/admin/ranking/route.ts`
**Critère** : admin peut changer `featured` de 100 à 50 → GET /api/vendors retrie
**Fix-everything** : si d'autres routes admin n'ont pas de vérification de rôle → corriger

---

### T8 — Composant CreateEventModal
**Objectif** : modal 2 étapes pour créer un événement avec catégories obligatoires
**Dépend de** : T2
**Actions** :
1. Créer `src/components/clone/dashboard/CreateEventModal.tsx`
2. Étape 1 — Informations : title (obligatoire), weddingDate, budget, eventType (mariage/anniversaire/corporate/autre)
3. Étape 2 — Catégories : grid de toutes les catégories disponibles (API /api/vendors?distinct=category ou liste hardcodée des 31 catégories)
   - Min 3 sélectionnées obligatoires (bouton "Continuer" désactivé sinon)
   - Badge count "X/3 minimum"
   - Catégories les plus communes en premier (photo, dj, traiteur, décor, fleur, vidéo, musique, lieu…)
4. Submit → POST /api/planners avec `{ title, weddingDate, budget, categories }`
5. Success → fermer modal + refresh la liste des événements + toast "Événement créé !"
6. Export du composant avec props `{ open: boolean, onClose: () => void, onCreated: (planner) => void }`
**Fichiers** : `src/components/clone/dashboard/CreateEventModal.tsx`
**Critère** : impossible de valider l'étape 2 avec moins de 3 catégories ; événement créé avec categories en DB
**Fix-everything** : si d'autres modals du projet ont des issues (focus trap, scroll, accessibilité) → corriger

---

### T9 — Composant VendorDiscoverCard avec "Je suis intéressé"
**Objectif** : card vendor avec photos, badges, CTA "Je suis intéressé"
**Dépend de** : T6
**Actions** :
1. Créer `src/components/prestataires/VendorDiscoverCard.tsx`
   - Basé sur VendorSwipeModal (src/components/VendorSwipeModal.tsx — NE PAS réécrire from scratch, adapter)
   - Photos swipeables : carousel avec dots (depuis `vendor.media`)
   - Badge "⭐ Partenaire" si `vendor.featured === true` (rose/rose gradient)
   - Badges sociaux : icônes Instagram, Facebook, website, phone (si les champs sont renseignés)
   - Rating + nombre d'avis
   - Bouton "Je suis intéressé 🎉" :
     - POST /api/prestataires/interest
     - Si partenaire → toast "Message envoyé !" + lien "/messages"
     - Si non-partenaire → toast "Redirection WhatsApp" + `window.open(whatsapp://...)`
2. Sélecteur de langue FR/darija/AR (dropdown ou tabs discrets)
**Fichiers** : `src/components/prestataires/VendorDiscoverCard.tsx`
**Critère** : badge Partenaire visible, "Je suis intéressé" déclenche le bon flow selon featured

---

### T10 — Page /mes-prestataires — tableau de bord par catégorie
**Objectif** : client voit ses prestataires sélectionnés par catégorie avec leur statut
**Dépend de** : T5, T8, T9
**Actions** :
1. Créer `src/app/mes-prestataires/page.tsx`
2. Récupérer le planner actif (via cookie/localStorage userId + API /api/planners)
3. Récupérer PlannerVendors du planner actif (GET /api/planners/[id]/vendors)
4. Layout : une section par catégorie (catégories du planner.categories)
5. Dans chaque section :
   - Header "Photo" (catégorie) + badge count "2 sélectionnés"
   - Cards horizontales des vendors sélectionnés : photo, nom, rating, statut (contacted/replied/confirmed)
   - Statut modifiable : dropdown simple
   - Bouton "Ajouter" (ouvre un mini-modal avec VendorDiscoverCard filtrée sur cette catégorie)
6. Empty state si aucun vendor pour une catégorie : "Aucun [catégorie] sélectionné — Trouver un prestataire →" (link vers VendorSwipeModal filtré)
7. Header de la page : nom de l'événement actif + date + bouton "Changer d'événement"
**Fichiers** : `src/app/mes-prestataires/page.tsx`
**Critère** : page affiche les catégories de l'événement actif + vendors sélectionnés + statuts modifiables
**Fix-everything** : si d'autres pages sidebar n'ont pas l'événement actif → corriger (voir T14)

---

### T11 — Admin /admin/ranking — UI poids smart ranking
**Objectif** : admin peut visualiser et modifier les poids du classement
**Dépend de** : T7
**Actions** :
1. Créer `src/app/admin/ranking/page.tsx`
2. Tableau : signal | label | weight (%) | slider ou input number
3. Bouton "Sauvegarder" → PATCH /api/admin/ranking par signal
4. Prévisualisation live : "Avec ces poids, un vendor featured=true, rating=4.8, 50 avis = score X"
5. Ajouter lien dans la nav admin
**Fichiers** : `src/app/admin/ranking/page.tsx`
**Critère** : admin modifie le poids "featured" → save → GET /api/vendors retrie

---

### T12 — DashSidebar — nav Prestataires + CreateEventModal
**Objectif** : sidebar avec "Mes Prestataires" + bouton création événement modal
**Dépend de** : T8, T10
**Actions** :
1. Lire `src/components/clone/dashboard/DashSidebar.tsx`
2. Ajouter nav item : `{ icon: "handshake", label: "Mes Prestataires", href: "/mes-prestataires" }` après "Favoris"
3. Remplacer `<Link href="/planner">Créer un événement</Link>` par un `<button>` qui ouvre `<CreateEventModal>`
4. Importer et brancher CreateEventModal (T8) avec state local `showCreateModal`
5. Si categories chip strip dans sidebar (per-event) → afficher les catégories de l'événement actif
**Fichiers** : `src/components/clone/dashboard/DashSidebar.tsx`
**Critère** : "Mes Prestataires" visible dans la sidebar, "Créer un événement" ouvre la modal

---

### T13 — Fix cross-cutting : widget swipe + sidebar per-event + proxy
**Objectif** : stabilité transversale du site
**Dépend de** : T12
**Actions** :
1. **VendorSwipeWidget bug (dashboard)** :
   - Lire `src/app/dashboard/page.tsx` ligne ~1529
   - Trouver le handler qui ferme VendorSwipeModal sur swipe et supprimer la fermeture automatique
   - VendorSwipeModal doit rester ouvert jusqu'au click ✕ explicite de l'utilisateur
2. **Sidebar per-event enrichissement** :
   - Vérifier `/budget`, `/guests`, `/planner`, `/favorites` — ces pages lisent-elles l'événement actif ?
   - Si non : ajouter la lecture du planner actif (cookie `activePlannerId` ou context)
   - Si oui mais mal : corriger l'enrichissement
3. **proxy.ts** :
   - Ajouter `/mes-prestataires` dans la liste PROTECTED
4. **VendorSwipeWidget emoji** :
   - Remplacer l'emoji dans l'empty state si différent de 🎉
**Fichiers** : `src/app/dashboard/page.tsx`, `src/proxy.ts`, pages sidebar, `src/components/clone/dashboard/VendorSwipeWidget.tsx`
**Critère** : modal ne se ferme plus sur swipe ; `/mes-prestataires` protégé ; pages sidebar enrichies
**Fix-everything** : tout bug visible dans les pages touchées → corriger

---

### T14 — Accueil page — lien vers CreateEventModal
**Objectif** : page /accueil cohérente avec le nouveau flow
**Dépend de** : T8, T12
**Actions** :
1. Lire `src/app/accueil/page.tsx`
2. Vérifier que "Créer un événement" et les event cards pointent vers le bon flow
3. Le lien "Créer un événement" sur accueil → ouvre CreateEventModal (ou /planner — arbitrer)
4. Les event cards existantes : lien vers `/mes-prestataires?plannerId=X` (enrichissement)
**Fichiers** : `src/app/accueil/page.tsx`
**Critère** : depuis /accueil, créer un événement déclenche le flow modal avec catégories obligatoires

---

### T15 — Final fix-everything + build check
**Objectif** : site stable, zéro régression
**Dépend de** : tous les tasks précédents
**Actions** :
1. `npx next build` complet → corriger TOUTES les erreurs restantes
2. Grep `TODO` / `FIXME` / `console.log` laissés en chemin → nettoyer
3. Grep `@prisma/client` → 0 occurrence dans src/
4. Vérifier que toutes les nouvelles routes API ont :
   - Vérification session (non-null)
   - Filtre userId (IDOR)
   - Gestion d'erreur (try/catch → 500 propre)
5. Vérifier que PlannerVendor @@unique([plannerId, vendorSlug]) → pas de doublons possibles
6. Run `npx prisma validate` → schema valide
7. Commit final avec message `feat(prestataires): Phase 2 — arbre sélection prestataires`
**Fichiers** : tous les fichiers touchés dans la phase
**Critère** : `npx next build` passe sans erreur ni warning TypeScript

---

## Critère E2E de fin de phase

```
1. Client se connecte → Dashboard
2. Clique "Créer un événement" → CreateEventModal s'ouvre
3. Étape 1 : renseigne titre + date + type
4. Étape 2 : sélectionne photo + dj + traiteur + lieu (4 catégories)
   → bouton "Créer" activé
5. Événement créé → sidebar affiche "Mes Prestataires"
6. Widget Découvrir (Dashboard) → swipe right sur un photographe partenaire
   → "Je suis intéressé 🎉" → toast "Message envoyé" → link /messages
7. Aller sur /mes-prestataires → voir la section "Photo" avec le photographe (statut: contacted)
8. Modifier le statut → "replied" → persisté en DB
9. Aller sur /messages → conversation avec le photographe visible
10. npx next build → 0 erreur
```

---

## Out of scope (Phase 3+)

- Vidéo auto-play dans les cartes
- Rewind button
- Widget "catégories couvertes" sur le dashboard
- Notifications in-app quand le vendor répond
- Export liste prestataires PDF
- Compare mode
- Budget estimé live pendant le swipe
- PlannerVendor avec historique des échanges
- Admin toggle vendor partenaire depuis dashboard
