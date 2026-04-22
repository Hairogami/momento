# Mobile Responsive Fix — Momento
**Date:** 2026-04-16
**Scope:** Fix lisibilité et ergonomie mobile sur tout le site (hors landing)
**Approche:** Garde l'UI/UX existante, corrige les breakpoints et touch targets

---

## Problème

Le site est conçu desktop-first. Les dashboards (client + vendor) utilisent des sidebars fixes de 240px sans aucun responsive mobile, rendant les pages inutilisables sur téléphone. Des problèmes systémiques de touch targets et font sizes dégradent l'expérience sur toutes les pages.

---

## Architecture de la solution

### Phase 1 — Sidebars → Drawer mobile (CRITIQUE)

**DashSidebar (dashboard client)**
- Desktop (≥768px) : comportement actuel inchangé (sidebar 240px fixe)
- Mobile (<768px) : sidebar masquée, remplacée par :
  - Bottom navigation bar (5 items principaux : Accueil, Dashboard, Messages, Explorer, Menu)
  - Hamburger → drawer latéral plein écran pour les items secondaires
- Implémentation : `useMediaQuery` ou breakpoint CSS + `translate-x` pour le drawer

**VendorSidebar (dashboard vendor)**
- Même pattern : sidebar desktop → bottom nav + drawer mobile
- Items : Accueil, Inbox, Calendrier, Profil, Menu

**Layout wrappers**
- `src/app/vendor/dashboard/layout.tsx` : ajouter conditional rendering mobile
- Dashboard client layout : même chose

### Phase 2 — Fix systémique composants

**Touch targets**
- Minimum 44×44px sur tous les boutons interactifs
- Calendrier public : augmenter taille des cases jour sur mobile
- Boutons d'action principaux : padding minimum `py-3 px-5`

**Typography**
- Labels 10-11px → 12px minimum sur mobile
- Titres de sections : rester lisibles à 14-16px

**Grids et layouts**
- Vérifier que tous les grids 2-colonnes ont `flex-col` sur mobile
- Cards explore : 1 colonne sur mobile si nécessaire

### Phase 3 — Pages spécifiques

Pages à auditer et fixer individuellement :
- `/explore` — barre de recherche + filtres + cards
- `/dashboard` — widgets (BudgetWidget, CountdownWidget, VendorSwipeWidget)
- `/budget` — tableau/liste budget
- `/guests` — liste invités
- `/messages` — interface chat
- `/planner` — calendrier planning
- `/vendor/dashboard/inbox` — liste demandes
- `/vendor/dashboard/packages` — éditeur packages

---

## Contraintes

- Ne pas toucher à la landing (`/`, `/pro`, `/a-propos`) — déjà bien faite
- Garder tous les CSS variables `--dash-*` et `--g1/g2` — le dark mode doit rester fonctionnel
- Pas de dépendances externes ajoutées
- Build must pass avant chaque commit

---

## Définition de "done"

- Tous les dashboards navigables sur iPhone SE (375px) et iPhone 14 (390px)
- Aucun overflow horizontal sur les pages listées
- Touch targets ≥ 44px sur les CTA principaux
- Font sizes ≥ 12px sur tout le contenu lisible
