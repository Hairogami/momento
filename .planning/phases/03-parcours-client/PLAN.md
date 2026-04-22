# Plan — Parcours Client Momento : Gate Explore + Onboarding + Dashboard Contextuel

## Contexte & Problèmes identifiés

**Problème 1 — Dashboard invisible.** Le client arrive sur landing + explore, trouve des prestataires, et PART sans savoir que Momento offre un outil complet d'organisation (budget, tâches, invités, timeline, messagerie). La valeur profonde de l'app n'est pas mise en avant → pas de conversion, pas de rétention, pas de business model activable.

**Problème 2 — Explore sans gate.** La page /explore est 100% publique. Le visiteur voit tout sans créer de compte → 0 capture email, 0 levier emailing/nurturing, 0 data utilisateur pour les campagnes.

## Décisions validées (brainstorm en cours)

### 1. Soft gate progressif sur /explore
- Le visiteur voit les vrais vendors, scroll librement, filtre par catégorie/ville
- **Gate au clic sur un profil vendor** (pas au scroll — pas agressif)
- Le SEO est préservé (Google indexe les cards, pas les profils détaillés)
- Le moment du clic = intention claire = meilleur taux de conversion

### 2. Modal signup avec value props dashboard
- Au clic profil sans compte → modal d'inscription
- La modal met en avant 4 features du dashboard : budget intelligent, checklist personnalisée, messagerie directe, 100% gratuit
- OAuth Google/Facebook + email/password
- Résout les 2 problèmes d'un coup : gate + mise en avant du dashboard

### 3. Dashboard contextuel par type d'événement
- Le dashboard s'adapte au TYPE d'événement (un mariage ≠ un corporate ≠ un iftar)
- Widgets, tâches, budget, catégories prestas : tout est conditionnel
- Le client arrive sur un dashboard DÉJÀ REMPLI (pas vide)

### 4. Onboarding wizard 3 étapes post-inscription
- **Étape 1** : Type d'événement (10 familles → sous-type) + Nom + Date + Ville
- **Étape 2** : Catégories de prestataires (pré-cochées intelligemment selon le type)
- **Étape 2.5** : Budget obligatoire — total + répartition par catégorie (sliders), verdict IA temps réel (réaliste/serré/ambitieux), pas de skip

### 4b. Signup — CGU + marketing
- Checkbox CGU obligatoire (Conditions Générales + Politique de confidentialité)
- Checkbox marketing opt-out (pré-cochée, décochable) — switch opt-in si expansion UE (RGPD)

### 4c. Modèle Free / Pro
- **Free** : 1 événement, swipe illimité, budget (total seul), notes, countdown, découvrir prestas
- **Pro** : événements illimités, messagerie prestas, checklist temporelle, gestion invités, budget répartition + verdict IA, favoris + comparaison, thème visuel custom
- **Principe** : le swipe (découverte) reste gratuit = moteur marketplace. Le paywall est sur l'ACTION (contacter un presta) pas la découverte
- **FOMO dashboard** : widgets Pro visibles en mode "Aperçu" avec données de démo + bandeau "Pro", sidebar liens grisés avec badge 🔒
- **Conversion trigger** : client swipe → trouve son presta → "Je suis intéressé" → paywall Pro

### 5. Dashboard pré-rempli à l'ouverture
- **Banner de progression** : phrase en Cormorant italic en haut du dashboard — *« Votre [nom de l'événement] est organisé à [X]% »* où `[nom de l'événement]` est dynamique (ex: "mariage traditionnel", "séminaire d'entreprise", "Aqiqa") et `[X]%` est calculé en temps réel selon les étapes complétées. Sous la phrase, une **barre de chargement fluide animée** (height 6px, gradient `var(--g1) → var(--g2)` signature, sweep continu 3s linear infinite, fill animé au changement 1.4s cubic-bezier). **Pas de jalons/étapes en dessous. Pas de curseur d'écriture/typewriter sur le chiffre.** Juste la phrase + la barre. Sobre, animé, couleurs de la palette utilisateur.
- **Prochaine action recommandée** : "Choisir un photographe (recommandé 4 mois avant)"
- **Budget estimé** : répartition auto par catégorie selon le type d'événement
- **Checklist temporelle** : tâches avec deadlines calculées depuis la date de l'événement
- **Vendor cliqué sur /explore** : déjà ajouté en favoris (continuité du parcours)
- **Widget découvrir** : catégories-first, filtrées sur les catégories choisies
- **Thème visuel dynamique** : palette + animations selon le type d'événement

### 6. Types d'événements — 10 familles, 61 sous-types

| # | Famille | Exemples de sous-types | Icône |
|---|---------|----------------------|-------|
| 1 | Mariage & Union | Mariage traditionnel, micro-mariage, destination, fiançailles, henné, EVJG/EVJF | 💍 |
| 2 | Fête & Célébration | Anniversaire adulte/enfant, soirée privée, thème, pool party, rooftop | 🎉 |
| 3 | Naissance & Famille | Aqiqa, baby shower, gender reveal, baptême, réunion de famille | 👶 |
| 4 | Milestones | Remise de diplôme, crémaillère, retraite, lancement business | 🎓 |
| 5 | Corporate | Séminaire, team building, gala, lancement produit, inauguration | 💼 |
| 6 | Conférence & Formation | Conférence, workshop, hackathon, salon pro, webinaire | 🎤 |
| 7 | Religieux & Culturel | Iftar collectif, Aïd el-Fitr, Aïd el-Adha, Mawlid, Moussem | 🌙 |
| 8 | Caritatif | Gala caritatif, collecte de fonds, événement associatif | 🤝 |
| 9 | Loisirs & Expériences | Festival, tournoi, dégustation, retraite bien-être, glamping | 🎵 |
| 10 | Autre / Personnalisé | Free-form | ✨ |

### 7. Matrice widgets par type d'événement

| Widget | Mariage | Fête | Corporate | Religieux | Loisirs |
|--------|---------|------|-----------|-----------|---------|
| Progression % | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prochaine action | ✅ | ✅ | ✅ | ✅ | ✅ |
| Budget (réparti) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tâches (timeline) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Découvrir prestas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invités | ✅ | optionnel | ❌ | ✅ | ❌ |
| Countdown | ✅ | ✅ | ✅ | ✅ | ✅ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Plan d'implémentation — T0→T12

### Sous-phase A — Fondation DB + Subscription (T0-T2)

**T0 — Schema Prisma : subscription client + event types**
- Ajouter `plan String @default("free")` sur model `User` (free | pro)
- Ajouter `planExpiresAt DateTime?` sur model `User`
- Ajouter `eventType String?` sur model `Planner` (famille : mariage, fete, corporate, etc.)
- Ajouter `eventSubType String?` sur model `Planner`
- Ajouter `marketingOptIn Boolean @default(true)` sur model `User`
- Ajouter `agreedTosAt DateTime?` sur model `User`
- Migration : `DATABASE_URL=$DIRECT_URL npx prisma db push`
- Fichiers : `prisma/schema.prisma`
- Critère : `npx prisma generate` + build pass

**T1 — Constantes event types + seed data**
- Créer `src/lib/eventTypes.ts` : 10 familles + sous-types + icônes + catégories prestas par défaut + budgets moyens Maroc
- Données seed : budget moyen mariage Casa = 150k MAD, anniversaire = 30k, corporate = 80k, etc.
- Catégories par défaut : mariage → [photographe, traiteur, DJ, déco, fleuriste, vidéaste, maquillage, salle], corporate → [traiteur, salle, technique, photographe], etc.
- Fichier : `src/lib/eventTypes.ts`
- Critère : import fonctionne, types TypeScript corrects, build pass

**T2 — API subscription + dev panel**
- `GET /api/user/plan` → retourne plan + features disponibles
- `POST /api/user/plan` → upgrade/downgrade (pour l'instant : toggle direct, pas de paiement)
- Helper `src/lib/planGate.ts` : `canAccess(plan, feature) → boolean` — liste de features par plan
- Route `/dev` : page accessible uniquement si `user.email === "moumene486@gmail.com"`, toggle Free/Pro/Admin
- Fichiers : `src/app/api/user/plan/route.ts`, `src/lib/planGate.ts`, `src/app/dev/page.tsx`
- Critère : toggle plan dans /dev, `canAccess` retourne correctement true/false par feature

### Sous-phase B — Gate Explore + Signup Modal (T3-T4)

**T3 — Signup modal avec value props**
- Créer `src/components/SignupGateModal.tsx` : modal overlay
  - 4 value props (budget intelligent, checklist, messagerie, 100% gratuit)
  - OAuth Google + email/password
  - Checkbox CGU obligatoire + checkbox marketing opt-out (pré-cochée)
  - POST `/api/auth/register` existant (adapter si nécessaire pour CGU + marketing)
- Style : cohérent avec le design system Momento (dark theme, gradients)
- Fichier : `src/components/SignupGateModal.tsx`
- Critère : modal s'ouvre, signup fonctionne, CGU obligatoire bloque si non coché

**T4 — Gate sur /explore au clic profil**
- Modifier `src/components/clone/AntVendorCard.tsx` : intercepter le clic si non connecté
  - Connecté → navigation `/vendor/${slug}` (comportement actuel)
  - Non connecté → ouvrir `SignupGateModal` (stocker le slug du vendor cliqué dans state/localStorage)
- Modifier `src/app/explore/ExploreClient.tsx` : passer callback `onGatedClick` aux cards
- Après signup réussi → redirect vers `/vendor/${slug}` (continuité)
- Fichiers : `AntVendorCard.tsx`, `ExploreClient.tsx`
- Critère : visiteur anonyme clique card → modal signup. Après signup → arrive sur le profil vendor

### Sous-phase C — Onboarding étendu (T5-T7)

**T5 — Étendre CreateEventModal — types d'événements**
- Modifier `src/components/clone/dashboard/CreateEventModal.tsx`
  - Étape 1 : remplacer le select `eventType` (5 valeurs) par la grille 10 familles avec icônes
  - Ajouter sélection sous-type (liste déroulante conditionnelle)
  - Persister `eventType` + `eventSubType` dans le POST `/api/planners`
- Modifier `src/app/api/planners/route.ts` : accepter `eventType`, `eventSubType`
- Fichiers : `CreateEventModal.tsx`, `/api/planners/route.ts`
- Critère : création événement avec type + sous-type, données persistées en DB

**T6 — Étape catégories intelligentes**
- Modifier `CreateEventModal.tsx` étape 2 :
  - Pré-cocher les catégories selon le type d'événement (via `eventTypes.ts`)
  - Minimum 3 obligatoire (déjà en place, vérifier)
  - Afficher un label "Recommandé pour votre [type]" sur les pré-cochées
- Fichier : `CreateEventModal.tsx`
- Critère : changer le type → les catégories pré-cochées changent automatiquement

**T7 — Étape budget obligatoire**
- Ajouter étape 2.5 dans `CreateEventModal.tsx` :
  - Slider budget total (fourchette selon type d'événement, via `eventTypes.ts`)
  - Répartition par catégorie (sliders proportionnels)
  - Verdict IA temps réel : `src/lib/budgetVerdict.ts` — calcule réaliste/serré/ambitieux selon type + ville + catégories
  - Pas de skip — bouton "Valider mon budget"
- Persister budget total + répartition dans Planner (champ `budgetBreakdown Json?` à ajouter au schema)
- Fichiers : `CreateEventModal.tsx`, `budgetVerdict.ts`, `schema.prisma`, `/api/planners/route.ts`
- Critère : budget obligatoire, verdict affiché, données persistées

### Sous-phase D — Dashboard Free/Pro (T8-T10)

**T8 — Dashboard gating par plan**
- Modifier `src/app/dashboard/page.tsx` :
  - Charger `user.plan` au mount
  - Widgets Free (countdown, budget total, notes, découvrir) → actifs
  - Widgets Pro (checklist, messages, invités, favoris) → mode "Aperçu" avec données de démo
- Créer `src/components/clone/dashboard/ProOverlay.tsx` : bandeau "APERÇU — PRO" + bouton "Débloquer"
- Fichiers : `dashboard/page.tsx`, `ProOverlay.tsx`
- Critère : user Free voit widgets Pro en aperçu, user Pro voit tout actif

**T9 — Sidebar gating**
- Modifier `DashSidebar.tsx` :
  - Liens Pro (Messages, Invités, Checklist, Favoris, Contrats, Faire-part, Mon site) → grisés avec badge 🔒
  - Clic sur lien Pro → modal upsell "Passez Pro"
  - Liens Free (Dashboard, Budget, Découvrir, Notes) → actifs
- Fichiers : `DashSidebar.tsx`
- Critère : sidebar affiche les locks, clic → modal upsell

**T10 — Dashboard pré-rempli par type d'événement**
- Créer `src/components/clone/dashboard/DashboardProgressBanner.tsx` :
  - Props : `{ eventLabel: string; completionPct: number }` (ex: `eventLabel="mariage traditionnel"`, `completionPct=65`)
  - Render : phrase en Cormorant italic — *« Votre **[eventLabel]** est organisé à **[completionPct]%** »* · le nom d'événement et le % en gradient `var(--g1) → var(--g2)` (text-gradient)
  - Sous la phrase : **barre fluide animée, sans jalons, sans chiffre, sans curseur typewriter**
    - `height: 6px` · `background: var(--dash-faint-2)` · `border-radius: 99px`
    - Fill : `width: ${pct}%` · `background: linear-gradient(90deg, var(--g1), var(--g2), var(--g1))` · `background-size: 200% 100%` · `animation: fluid-sweep 3s linear infinite, width-grow 1.4s cubic-bezier(.22,1,.36,1) both` · `box-shadow: 0 2px 12px rgba(225,29,72,0.25)`
    - Petit halo radial pulsant en tête de fill (`pulse-dot 1.8s ease-in-out infinite`)
  - Respecte la palette utilisateur — utilise `--g1/--g2` (change avec la palette sélectionnée)
  - Largeur max 520px, aligné à gauche
- Helper `src/lib/eventLabel.ts` : `getEventLabel(eventType, eventSubType) → string` retournant le libellé humain (ex: `{ eventType:"mariage", eventSubType:"traditionnel" } → "mariage traditionnel"`)
- Helper `src/lib/completionScore.ts` : `computeCompletion(planner, vendors, budget) → number` — pondère les jalons (Événement 10%, Catégories 15%, Budget 15%, Prestataires 30% par catégorie couverte, Invités 15%, Tâches 15%)
- Intégration : afficher `<DashboardProgressBanner>` en haut de `dashboard/page.tsx`, avant le widget grid
- Budget réparti auto (depuis `budgetBreakdown` du planner)
- Tâches temporelles pré-générées (depuis `eventTypes.ts` → tâches par défaut avec deadlines relatives)
- Prochaine action recommandée (basée sur les catégories + date)
- Créer `src/lib/dashboardSeed.ts` : génère les données initiales selon type + date + catégories
- Fichiers : `DashboardProgressBanner.tsx`, `eventLabel.ts`, `completionScore.ts`, `dashboard/page.tsx`, `dashboardSeed.ts`
- Critère : nouveau planner → dashboard montre banner avec phrase dynamique + barre fluide animée (sans jalons, sans curseur), budget réparti, tâches. Changer la palette utilisateur → couleurs du banner/barre changent instantanément.

**T10b — Carrousel prestataires recommandés sur /mes-prestataires**
- Modifier `src/app/mes-prestataires/page.tsx` : ajouter une **section carrousel horizontale en haut de page**, avant le choix presta par catégorie
- Composant à créer : `src/components/prestataires/RecommandedCarousel.tsx`
  - Section intro : titre Cormorant italic « ✨ *Nos recommandations pour vous* » + sous-titre « Sélection automatique selon votre budget, votre ville et votre type d'événement »
  - Carrousel horizontal scrollable (snap-x, touch-friendly, flèches navigation sur desktop)
  - 1 card par catégorie du planner (ex: 8 cards si 8 catégories)
  - Card réutilise le style `AntVendorCard` (photo 4/3, chip catégorie + badge **Reco ✨** gradient, nom, étoile, ville, prix estimé)
  - CTA double par card : `Voir le profil` (primary gradient) + `Changer` (ghost)
  - Tap "Changer" → ouvre un bottom-sheet/modal avec top 5 alternatives filtrées par budget + catégorie
  - État empty par catégorie : card dashed « Aucun dans ton budget — élargir la recherche → »
- API nouvelle ou étendue : `/api/planners/[id]/recommendations` — retourne 1 top match par catégorie du planner, filtré par `budgetBreakdown[cat]` et `ville`
- Logique de ranking : `featured × 3 + rating × 2 + reviewCount × 0.5` + filtre prix dans fourchette budget (±20%)
- Le carrousel vit **au-dessus** de la section existante « choix par catégorie » (garde le pattern original pour ceux qui veulent chercher manuellement)
- Fichiers : `RecommandedCarousel.tsx`, `mes-prestataires/page.tsx`, `/api/planners/[id]/recommendations/route.ts`
- Critère : arriver sur /mes-prestataires montre en premier les recommandés en carrousel horizontal. Tap "Changer" → bottom-sheet alternatives. La cliente peut ignorer et descendre vers le choix manuel en dessous.

### Sous-phase E — Paywall + Polish (T11-T12)

**T11 — Paywall "Je suis intéressé" → Pro**
- Modifier le bouton "Contacter" sur les cards presta (dashboard + mes-prestataires) :
  - Si user.plan === "pro" → comportement actuel (envoyer message / WhatsApp)
  - Si user.plan === "free" → modal upsell "Passez Pro pour contacter ce prestataire"
- Même logique sur la page `/vendor/[slug]` : bouton contact → gate Pro
- Fichiers : composants contact/message, VendorProfileClient
- Critère : user Free clique Contacter → modal Pro. User Pro → message envoyé

**T12 — Migration utilisateurs existants**
- Script one-shot : tous les users existants → `plan: "free"`, `agreedTosAt: now`
- Tous les planners existants sans `eventType` → `eventType: "autre"`
- Route API `/api/admin/migrate` protégée admin
- Fichier : `src/app/api/admin/migrate/route.ts`
- Critère : après migration, aucun user sans plan, aucun planner sans eventType

---

## Dépendances

```
T0 (schema) → T1 (constantes) → T2 (API plan + dev panel)
T0 → T3 (signup modal) → T4 (gate explore)
T1 → T5 (event types UI) → T6 (catégories smart) → T7 (budget)
T2 → T8 (dashboard gating) → T9 (sidebar gating)
T7 + T8 → T10 (dashboard pré-rempli)
T7 → T10b (carrousel recommandés sur /mes-prestataires)
T9 → T11 (paywall contact)
T0 → T12 (migration)
```

## Ordre d'exécution recommandé

```
Bloc 1 — Fondation (séquentiel)
  T0 → T1 → T2
  → build + test /dev panel

Bloc 2 — Gate (séquentiel)
  T3 → T4
  → test : visiteur anonyme → clic card → signup → redirect profil

Bloc 3 — Onboarding (séquentiel)
  T5 → T6 → T7
  → test : création événement complet avec type + catégories + budget

Bloc 4 — Dashboard (séquentiel)
  T8 → T9 → T10
  → test : dashboard Free avec FOMO vs dashboard Pro complet

Bloc 5 — Paywall + Migration
  T11 → T12
  → test E2E complet
```

## Contraintes

- Build `npx next build` doit passer avant chaque commit
- DB migrations → `DATABASE_URL=$DIRECT_URL npx prisma db push` (port 5432)
- Commits atomiques : `feat(scope): desc` ou `fix(scope): desc`
- IDOR : toujours filtrer par userId dans les routes API
- Import Prisma : `@/generated/prisma/client` (JAMAIS `@prisma/client`)
- Post-commit : `git status` + `git log origin/main..HEAD --oneline`

## Vérification E2E finale

1. Visiteur anonyme → /explore → clic card → modal signup avec value props + CGU
2. Signup → onboarding (type mariage + catégories pré-cochées + budget obligatoire)
3. Dashboard Free : countdown + budget total + notes actifs, checklist/messages/invités en aperçu Pro
4. Sidebar : liens Pro grisés avec 🔒, clic → modal upsell
5. Swipe prestas → "Je suis intéressé" → paywall Pro
6. /dev → toggle Pro → tout se débloque instantanément
7. Toggle Free → retour aux aperçus + locks

### 8. Dev panel — switch plans
- Toggle accessible uniquement pour `moumene486@gmail.com`
- Permet de switcher Free / Pro / Admin pour tester chaque plan séparément
- Route `/dev` ou panel dans settings

### 9. Features Pro futures (phases séparées, visibles grisées dans sidebar)
- **Contrats type** par prestation (templates juridiques, signature) — Phase Pro 1
- **Site mariage** personnalisé (builder pages, domaine custom, RSVP) — Phase Pro 2
- **Templates faire-part** (éditeur visuel, export PDF/WhatsApp) — Phase Pro 3

Calendrier dans barre de recherche → reporté en phase séparée (confirmé par l'utilisateur).

---

## Backlog — Bugs vague 4 (phase séparée)

Les bugs T1-T17 identifiés précédemment (photos explore, VendorSwipe sync, dark mode flash, etc.) sont déplacés dans une phase séparée. Voir historique git pour le détail.
