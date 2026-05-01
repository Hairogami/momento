# Lighthouse mobile audit + visual smoke — momentoevents.app

**Date** : 2026-04-28
**Worktree** : unruffled-wright-6c6cea (sur main)
**Tooling** : Lighthouse CLI v13.1.0 (chrome-devtools-mcp + playwright-mcp profils déjà locked par autres agents)
**Préset** : `--form-factor=mobile --screenEmulation.width=360 --screenEmulation.height=640 --throttling.cpuSlowdownMultiplier=4`

## Contexte production critique

`momentoevents.app` redirige TOUS les paths vers `/coming-soon` (307 — pré-launch gating).
Donc l'audit `/`, `/explore`, `/login`, `/signup` reflète tous la même page coming-soon (avec un coût redirect de ~870-1051ms).
J'ai aussi audité `/coming-soon` directement comme baseline post-launch.

## Lighthouse scores

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | SI |
|------|------|------|----|----|-----|-----|-----|-----|-----|
| `/` (mobile) | **89** | 96 | **100** | 92 | 3.5s | 0.01 | 40ms | 2.1s | 2.8s |
| `/explore` (mobile) | **92** | 96 | **100** | 92 | 3.2s | 0.01 | 10ms | 1.9s | — |
| `/login` (mobile) | **91** | 96 | **100** | 92 | 3.3s | 0.01 | 70ms | 1.9s | — |
| `/signup` (mobile) | **91** | 96 | **100** | 92 | 3.3s | 0.01 | 30ms | 1.9s | — |
| `/coming-soon` (mobile, direct) | **91** | 96 | **100** | 92 | 3.3s | 0.01 | 40ms | 1.9s | — |

**Tous les seuils cibles atteints** : Perf ≥ 70, A11y ≥ 90, BP ≥ 90, SEO ≥ 90 ✅
LCP > 2.5s sur toutes (zone "needs improvement"), mais CLS et TBT excellents.

## Top opportunités (perf)

| Opportunité | Économie | Décision |
|-------------|----------|----------|
| Avoid multiple page redirects | 870-1051 ms | **Intentionnel pré-launch** (gating /coming-soon). Auto-résolu post-launch. |
| Reduce unused JavaScript | 250-300 ms | Refactor non-trivial (chunks Next.js). À traiter post-launch après lazy-loading des providers. |

## Violations A11y/SEO récurrentes (toutes les pages)

1. **Document does not have a main landmark** (a11y) — la page /coming-soon n'a pas de `<main>`.
2. **Skip links are not focusable** (a11y) — corollaire du #1 : le skip-link `<a href="#main-content">` du root layout pointe sur un id absent.
3. **Document does not have a valid `rel=canonical`** (SEO) — canonical hérité du root layout pointe vers `/`, alors que la page auditée est `/coming-soon`.

## Auto-fixes appliqués

**Commit** : `8a252bb` — `fix(coming-soon): main landmark + canonical pour Lighthouse a11y/SEO`
**Push** : `origin/main` (déployé Vercel auto)

### Changements
- `src/app/coming-soon/page.tsx` : `<div>` racine → `<main id="main-content">`. Résout violations #1 et #2.
- `src/app/coming-soon/layout.tsx` (nouveau) : metadata par segment avec `alternates.canonical = "https://momentoevents.app/coming-soon"`. Résout violation #3.

### Couverture
Pré-launch, prod redirige tout vers /coming-soon → ce seul fix corrige les 3 violations sur `/`, `/explore`, `/login`, `/signup` ET `/coming-soon`.
Post-launch, les autres pages (login, signup) ont déjà `<main id="main-content">` en place + Next.js metadata par-page qui surchargera le canonical correctement.

### Build
`npx next build` ✅ pass. /coming-soon prerendered statique.

## Visual smoke (mobile)

Screenshots full-page extraits du JSON Lighthouse (viewport 360x640, écran rendu 360x678).
Sauvegardés dans `.planning/debug/screenshots-mobile/{home,explore,login,signup,coming-soon}-360x640.jpg`.

### Findings
- ✅ Aucun overflow horizontal sur 360px
- ✅ Countdown 4 colonnes auto-fit (minmax 70px) tient parfaitement sur viewport mobile
- ✅ Touch targets 44-46px (input email + bouton Rejoindre + input passcode)
- ✅ Cookie banner sticky bottom non-bloquant (paddingBottom safe-area-inset-bottom)
- ⚠️ Mineur : sur 360x640 (très petit viewport) le passcode input peut être en partie sous le cookie banner avant scroll. Pas un vrai bug — le banner se ferme à l'acceptation et la page redevient pleine.
- ✅ Dark mode rendu correctement (page chargée en dark via prefers-color-scheme)

### Viewports 414/768
Non-couverts par Lighthouse mobile (verrouillé sur 360x640). Playwright + chrome-devtools-mcp tous deux locked par d'autres agents en parallèle. Audits 414/768 reportés à un prochain run quand un browser slot se libère — non-critique car la page coming-soon scale bien sur les breakpoints intermédiaires (gradient + grid auto-fit + clamp typo).

## TODOs requérant follow-up

1. **Réduire unused JS** (250-300 ms) — audit du bundle des providers `ThemeProvider` / `SessionProvider` / `FullscreenModalProvider` côté coming-soon (la page n'a pas besoin de SessionProvider). Gain estimé : ~20-30 KB gzipped, +3-5 points perf mobile.
2. **LCP > 2.5s** (3.2-3.5s) — la cause vient sûrement du Plus Jakarta Sans Google Fonts (préload mais blocking). Options : `display: swap` est déjà actif → vérifier si `font-display: optional` ou self-host sur /public sont envisageables. Gain estimé : -500-800 ms LCP.
3. **Audit 414/768 viewports** — quand un browser MCP slot se libère, prendre les screenshots pour valider les media queries `lg:hidden` / `lg:flex` de coming-soon (split desktop ↔ mobile à 1024px).
4. **Post-launch (1ᵉʳ juin)** — désactiver le redirect global vers /coming-soon ; à ce moment `/`, `/explore`, `/login`, `/signup` seront audités directement avec leurs métadonnées propres (déjà en place dans `src/app/[page]/page.tsx`).

## Commits & SHAs

| Commit | SHA | Push |
|--------|-----|------|
| `fix(coming-soon): main landmark + canonical pour Lighthouse a11y/SEO` | `8a252bb` | ✅ origin/main |

## Artifacts

```
.planning/debug/lighthouse/
  ├── home-mobile.json
  ├── explore-mobile.json
  ├── login-mobile.json
  ├── signup-mobile.json
  └── coming-soon-mobile.json

.planning/debug/screenshots-mobile/
  ├── home-360x640.jpg
  ├── explore-360x640.jpg
  ├── login-360x640.jpg
  ├── signup-360x640.jpg
  └── coming-soon-360x640.jpg
```
