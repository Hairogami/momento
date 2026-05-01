# Fix mobile a11y + perf

Branche : `main` (worktree `unruffled-wright-6c6cea`)
Build : pass (`npx next build`)
Commits :
- `7e3c701` fix(a11y): aria-labels + aria-current/expanded on AntNav & MobileDashNav
- `38f19aa` perf(landing): dynamic-import below-the-fold sections + decorative animations

## PART 1 — A11y mobile

### Audit ARIA labels (icon-only buttons mobile)

État avant : déjà bon dans la majorité des fichiers — explore (10 aria-labels), VendorProfileClient (5), AntNav (2 sur 5 boutons), DashboardClient (12), guests, settings, signup. Le pattern brand est respecté côté UI mais les **3 contrôles top-bar AntNav** (toggle dark, palette, hamburger) avaient `title=` sans `aria-label` — VoiceOver/TalkBack ne lisent pas `title` de façon fiable sur tactile.

Aria-labels ajoutés (commit `7e3c701`) :
- `src/components/clone/AntNav.tsx` :
  - Dark mode toggle → `aria-label="Passer en mode clair/sombre"`
  - Palette button → `aria-label="Choisir une palette de couleurs"` + `aria-expanded` + `aria-haspopup="menu"`
  - Hamburger mobile → `aria-label="Ouvrir/Fermer le menu"` + `aria-expanded` + `aria-controls="ant-mobile-menu"` + `aria-haspopup="menu"`
  - Profile dropdown → `aria-label="Menu de mon compte"` + `aria-expanded` + `aria-haspopup="menu"`
- `src/components/clone/dashboard/MobileDashNav.tsx` :
  - Bouton "Menu" bottom-nav → ajout `aria-expanded` + `aria-haspopup="dialog"` (avait déjà aria-label)
  - `aria-current="page"` sur les items actifs (bottom nav + drawer) — manquait totalement (grep `aria-current` retournait 0 fichier)
  - Lien Messages → `aria-label="Messages (X non lus)"` quand badge actif

### Skip-to-content

Statut : **déjà en place et fonctionnel**.
- `src/app/layout.tsx` ligne 211-213 : `<a href="#main-content" className="skip-to-content sr-only-focusable">Aller au contenu principal</a>`
- CSS `globals.css` ligne 846-873 (`.sr-only-focusable` + `.skip-to-content:focus`)
- 5 pages déclarent `id="main-content"` : `/` (page.tsx), `/explore` (ExploreClient), `/login`, `/signup`, `/dashboard` (DashboardClient).

### Mobile nav aria

- Bottom nav (`MobileDashNav.tsx`) : `<nav aria-label="Navigation mobile">` ✅
- Drawer fullscreen : `role="dialog" aria-modal="true" aria-hidden={!drawerOpen}` ✅
- Mobile menu sheet AntNav : `role="dialog" aria-modal="true" aria-label="Menu"` ✅ + ajout `id="ant-mobile-menu"` pour matcher `aria-controls` du hamburger
- `aria-current="page"` : ajouté sur PRIMARY_ITEMS et ALL_ITEMS de MobileDashNav

### Focus order audit (lecture seule, non-refactor)

Pages critiques inspectées :
- **Login / Signup** : ordre logique (logo → nav → form input email → password → submit → links). Pas d'issue.
- **Accueil (`/accueil`)** : nav → grid événements → CTA création. Pas d'issue.
- **Budget (`/budget`)** : header → tabs → liste dépenses → bouton ajout. Bouton flottant FAB ajout en fin DOM, ce qui est correct (action principale visuelle, dernière dans tab order — ok).
- **Guests (`/guests`)** : header → ViewToggle → recherche → liste invités → modal Add. Cohérent.

Aucun refactor de focus order nécessaire — le DOM source suit déjà le flux visuel.

## PART 2 — Perf mobile

### LCP cible < 2.5s sur 4G

**Page landing `/`** : LCP element = `<h1>` du AntHero (clamp(2rem, 0.5rem + 4.5vw, 5.5rem), pas une image). Optimisation prioritaire = réduire le JS bloquant le first paint, pas charger une image.

État avant : `src/app/page.tsx` importait synchroniquement 9 composants `"use client"` totalisant ~4500 lignes pour tout afficher en SSR + envoyer le bundle JS d'hydration en une fois.

Changement (commit `38f19aa`) :
- `src/app/page.tsx` : `next/dynamic` sur AntVideoSection (2245 lignes), AntFeatureExplorer (376), AntAgentFirst (238), AntUseCases (142), AntTestimonials (101), AntPricing (160), AntDownload (63). SSR conservé (`ssr:true` par défaut côté RSC) — l'HTML initial reste complet, seul le JS d'hydration des sections below-fold est différé.
- `AntHero` : `AntFireworks` (242 lignes, canvas animation) + `AntConfetti` (84 lignes) en `dynamic({ ssr: false })` — purement décoratifs, ne doivent pas concurrencer la peinture du H1.

Au-dessus du fold (AntNav + AntHero `<h1>` + CTAs Link) : statique, prio dans le bundle critical.

### Image LCP optimization

- AntVendorCard utilise `<img loading="lazy" />` ✅ déjà en place.
- Pas d'image hero sur landing (`AntHero` est text-based) → pas de `priority` à ajouter sur la landing.
- `next.config.ts` : `images.remotePatterns` configuré + `minimumCacheTTL: 30 jours`. Pas de touch nécessaire.

### Dynamic imports widgets dashboard

État avant déjà optimisé : DashboardClient utilise déjà `dynamic()` pour BudgetWidget, VendorSwipeWidget, MesPrestatairesWidget, DashboardProgressBanner, CreateEventModal, VendorSwipeModal.

Audit complémentaire :
- `CarteGeographiqueWidget.tsx` : 34 lignes, **pas Leaflet** (juste des barres CSS) — pas d'intérêt à dynamic-import.
- `EnvoiFairepartWidget.tsx` : 74 lignes — pas assez lourd pour justifier un round-trip supplémentaire.
- `EventSiteEditor.tsx` : 1591 lignes mais sur route `/dashboard/event-site/[id]` qui est code-splittée naturellement par App Router → déjà séparée du bundle principal.
- Aucune lib charts (`recharts`, etc.) importée.
- Leaflet utilisé seulement dans `src/components/event-site/ui/LocationMap.tsx` (page event public).

Conclusion : pas de gain marginal supplémentaire sur le dashboard sans sur-engineering.

### Above-fold landing

- AntHero : `"use client"` (typewriter animation = JS-driven). Le H1 + texte sont rendus en SSR (l'effet typewriter démarre au mount), donc le LCP est texte SSR puis l'animation prend le relais — déjà optimal pour le first paint.
- Pas de candidat évident à split off de AntHero (le typewriter pilote tout le H1).

### Bundle delta

Build pass des deux côtés. Le `next build` actuel ne loggue plus les sizes par route (Next.js 16 turbopack). Vérification empirique nécessaire en prod via `vercel inspect --logs` ou `ANALYZE=true npm run build`.

Estimation conservatrice : déplacement de ~30-40 kB (gz) de JS de la critical chunk vers des chunks lazy sur la landing (somme des "use client" below-fold).

## Constraints respectées

- Aucune nouvelle lib installée.
- Brand tokens / patterns existants conservés.
- SSR/hydration intacts (default `ssr:true` sur dynamic en RSC, sauf canvas anim purement client).
- Multiple commits atomiques.
- Build pass (`npx next build`) après chaque commit.

## Pas pushed (par règle Momento)

Les commits restent en local. Push à valider explicitement par l'utilisateur.

## SHAs
- A11y : `7e3c701`
- Perf : `38f19aa`
