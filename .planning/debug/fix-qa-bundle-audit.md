# QA — Bundle size audit (pré-lancement)

**Date** : 2026-04-27
**Branch** : claude/unruffled-wright-6c6cea
**Goal** : auditer la taille des bundles client avant lancement, identifier dépendances lourdes différables, installer un analyseur pour suivi continu.

---

## 1. Bundle analyzer — setup

| Étape | Action |
|-------|--------|
| Install | `npm install --save-dev @next/bundle-analyzer` (v16.2.4) |
| Config | `next.config.ts` wrap : `bundleAnalyzer(withMaybeSentry)` quand `ANALYZE=true` |
| Script | `npm run analyze` → `ANALYZE=true npx next build --webpack` |

**Note importante** : `@next/bundle-analyzer` est **incompatible avec Turbopack** (le bundler par défaut de Next 16). Le script `analyze` force `--webpack` pour générer les rapports HTML (`.next/analyze/{client,nodejs,edge}.html`). Pour info, Next.js propose désormais `next experimental-analyze` côté Turbopack — à évaluer plus tard.

---

## 2. Top pages — taille des chunks

⚠️ **Next.js 16 ne fait plus apparaître la colonne "First Load JS"** dans la table de routes du build summary (changement vs Next 14/15). L'audit s'est basé sur :
1. Taille agrégée des chunks (`.next/static/chunks/`)
2. Inspection statique des imports (`grep`/`Glob`) pour identifier les pages tirant des deps lourdes

**Total chunks avant fix** : 2 641 KB (68 fichiers, plus gros 224 KB)
**Total chunks après fix** : 2 537 KB (-104 KB)

### Top 5 plus gros fichiers source (heuristique de ce qui pèse côté client)
| Fichier | Lignes | Page parente | Statut |
|---------|--------|--------------|--------|
| `src/components/DashboardWidgets.tsx` | 2 522 | `/dashboard` | OK — imports light, dynamic widgets déjà en place |
| `src/components/clone/AntVideoSection.tsx` | 2 245 | landing | OK — pas de deps externes lourdes |
| `src/app/dashboard/event-site/EventSiteEditor.tsx` | 1 533 | `/dashboard/event-site/[id]` | OK — `compressImage` natif (canvas), pas de dep |
| `src/app/dashboard/DashboardClient.tsx` | 1 149 | `/dashboard` | ✅ Déjà optimisé : 6 widgets en `dynamic()` |
| `src/components/VendorSwipeModal.tsx` | 899 | `/dashboard` | ✅ Déjà chargé en dynamic |

---

## 3. Dépendances lourdes — état des lieux

| Lib | Poids estimé | Usage | Statut |
|-----|--------------|-------|--------|
| `framer-motion` | ~80–100 KB gz | **1 seul composant** (`SpotlightBackground`) sur `/login` | ❌ → ✅ **REMPLACÉE par CSS keyframes (fix appliqué)** |
| `leaflet` + `react-leaflet` | ~140 KB gz combiné | `LocationMap` (4 templates événement) | ✅ Déjà lazy : `await import('leaflet')` dans `useEffect` |
| `exceljs` | ~700 KB | Export invités XLSX | ✅ Côté serveur uniquement (`await import('exceljs')` dans route API) |
| `@anthropic-ai/sdk` | ~200 KB | AI suggest endpoint | ✅ Côté serveur uniquement (`api/ai/suggest/route.ts`) |
| `puppeteer` | n/a | Non installé | ✅ |
| `recharts` / `chart.js` / `d3-*` | n/a | Non installés (BudgetChart est custom SVG) | ✅ |

### Server libs accidentellement importées côté client
**Aucune trouvée.** Recherche effectuée sur :
- `from "exceljs"` → 0 résultat
- `from "@anthropic-ai/sdk"` → 1 résultat (route API serveur uniquement)
- `from "puppeteer"` → 0 résultat

---

## 4. Quick win appliqué — `/login`

### Diagnostic
La page `/login` est statique (`○`), critical-path pour l'onboarding et le retour user. Elle importait `SpotlightBackground` qui :
- Tirait `framer-motion` (~80–100 KB gz) entièrement
- Pour 3 `motion.div` purement décoratifs (3 spots flottants en boucle infinie)
- Sur un panel `hidden lg:flex` (desktop only) — donc payload chargé pour rien sur mobile

### Fix
Remplacement de `framer-motion` par des keyframes CSS pures :
- `src/components/clone/SpotlightBackground.tsx` : `motion.div` → `<div>` + `className`
- `src/app/globals.css` : 3 keyframes (`momentoSpot1/2/3`) ajoutées (~30 lignes CSS)
- `package.json` : `framer-motion` retiré (`npm uninstall`)

**Résultat** : visuel identique, 0 JS d'animation au runtime, dep externe éliminée du bundle.

### Impact mesuré
- Chunks totaux : **2 641 KB → 2 537 KB** (-104 KB, -3.9%)
- Chunk `0fn4_87r2if3u.js` (136 KB, probable shared framer-motion) **supprimé**
- Animation respecte automatiquement `prefers-reduced-motion` (règle CSS globale existante)

---

## 5. Recommandations follow-up

### Priorité haute
1. **Migrer vers `next experimental-analyze`** (Turbopack-native) quand stabilisé pour avoir First Load JS par route sans devoir build avec `--webpack`.
2. **Audit `/dashboard/event-site/[id]`** (1 533 lignes éditeur) — vérifier que les 4 templates (`MariageTemplate`, `CorporateTemplate`, `FeteFamilleTemplate`, `GeneriqueTemplate`) ne sont pas tous bundlés en même temps. Switcher en `dynamic()` par template choisi peut diviser la page par 3-4.

### Priorité moyenne
3. **`AntVideoSection.tsx`** (2 245 lignes, landing) — investiguer si du contenu peut être lazy-loaded au scroll (intersection observer + dynamic).
4. **Audit récurrent** : ajouter `npm run analyze` au workflow CI pré-merge pour catch les régressions (pas critique avant lancement, mais utile en post-launch).

### Note
Le `du` mesure les **chunks individuels** au repos, pas le payload réseau gzippé. Pour des chiffres plus précis (gzip + brotli), regarder le rapport HTML `.next/analyze/client.html` après `npm run analyze`. Le rapport est éphémère — Vercel le supprime souvent en fin de build.

---

## 6. Verification checklist

- [x] `npm install --save-dev @next/bundle-analyzer` — OK
- [x] `next.config.ts` wrap analyzer — OK (combine Sentry + analyzer dans l'ordre attendu)
- [x] Script `npm run analyze` ajouté — OK (`ANALYZE=true npx next build --webpack`)
- [x] `npx tsc --noEmit` — clean (0 erreurs)
- [x] `npx next build` (Turbopack) — passe
- [x] `npx next build --webpack` (analyzer) — passe + génère reports HTML
- [x] `framer-motion` retiré des deps + zéro usage restant
- [x] Bundle réduit (-104 KB chunks)
- [x] `prefers-reduced-motion` respecté pour les nouvelles animations CSS
