# Momento · Design System — Référence consolidée

> Source unique de vérité pour ne plus avoir à inspecter fichier par fichier.
> Basé sur inspection live de momentoevents.app + lecture de `globals.css`, `ThemeProvider.tsx`, `colors.ts`, composants `Ant*`.

---

## 1. Fondation — thème actif par défaut

**Classes toujours appliquées sur `<html>`** : `dark clone-dark`
**Thème par défaut** (ThemeProvider) : `dark` (localStorage key `momento_theme`)
**Palette par défaut** : `creme` — mais en dark mode elle n'est pas appliquée visuellement (classe vide), les tokens `--dash-*` prennent le relais.

→ **Toute UI qu'on conçoit est en dark mode par défaut.**

---

## 2. Tokens couleur — dashboard system (le "vrai" appliqué sur toute l'app)

### Dark (défaut)
```css
--dash-bg:         #0d0e14   /* fond principal — noir légèrement bleuté */
--dash-surface:    #16171e   /* cards, modals */
--dash-sidebar:    #111218   /* sidebar admin/dashboard */
--dash-border:     rgba(255,255,255,0.07)
--dash-divider:    rgba(255,255,255,0.06)
--dash-text:       #eeeef5   /* texte principal — blanc cassé */
--dash-text-2:     #b0b0cc   /* muted */
--dash-text-3:     #8888aa   /* dim/placeholder */
--dash-faint:      rgba(255,255,255,0.04)
--dash-faint-2:    rgba(255,255,255,0.08)
--dash-ring-track: rgba(255,255,255,0.18)
--dash-surface-dark: #1e1f28
--dash-input-bg:   #1c1d25
--dash-surface-blur: rgba(22,23,30,0.88)
```

### Light (rarement utilisé — admin ranking l'utilise)
```css
--dash-bg:         #f7f7fb
--dash-surface:    #ffffff
--dash-text:       #121317
--dash-text-2:     #6a6a71
--dash-text-3:     #9a9aaa
--dash-border:     rgba(183,191,217,0.15)
```

---

## 3. Gradient signature (CRITIQUE)

Utilisé sur **chaque CTA, chaque état actif, chaque badge, chaque élément "vivant"** :

```css
background: linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA));
```

- `--g1: #E11D48` (rose/rubis)
- `--g2: #9333EA` (violet)
- Fallback toujours ces deux codes (si pas de thème customisé)
- Applications : bouton primaire, pill active, dot actif, barre de progression, badge "Filtrer", text gradient sur stats, check done, nav item actif, vendor count badge

**Règle** : tout ce qui "agit" (CTA, état, info mise en avant) porte ce gradient. Jamais une couleur solide rose ou violet seule.

---

## 4. Typographie

**Fonts chargées** (layout.tsx) :
- `Geist` sans — body, UI, tout par défaut
- `Geist_Mono` — monospace (code)
- `Cormorant_Garamond` — serif (variable `--font-cormorant`, utilisée ponctuellement pour accents éditoriaux)

**Font stack body** :
```
Geist, "Geist Fallback", ui-sans-serif, system-ui, sans-serif
```

**Hiérarchie observée** :
| Élément | Taille | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero H1 | `clamp(2.5rem, 6vw, 5.5rem)` | 600 | -0.03em | 1.08 |
| Section title | `clamp(1.8rem, 3.5vw, 2.6rem)` | 700 | -0.02em | — |
| Card title | 14-15px | 700 | — | — |
| Body | 13-14px | 400 | — | 1.55 |
| Muted/meta | 11-12px | 500 | — | — |

**title-massive** (classe utilitaire) : `clamp(2.4rem, 7vw, 6.5rem)` · line-height 1.06 · letter-spacing -0.02em

---

## 5. Classes utilitaires clone-*

- `.clone-card` — card avec hover (`translateY(-3px) + shadow`)
- `.clone-card-white` — forcée `#fff` en light, `var(--dash-surface)` en dark
- `.clone-surface` — surface background + border
- `.clone-heading` — h1/h2 titre
- `.clone-body` — texte courant
- `.clone-muted` — texte secondaire
- `.clone-progress-fill` — barre progression avec gradient
- `.clone-dark` — appliquée sur `<html>` quand dark actif
- `.clone-dot-active` — dot avec gradient
- `.clone-check-done` — check cochée avec gradient

---

## 6. Composants UI réels — patterns de référence

### Vendor card (`AntVendorCard.tsx`)
- border-radius: **20**
- border: `1px solid rgba(183,191,217,0.18)` (light) / `var(--dash-border)` (dark)
- Structure : photo (ratio ~3/2) → chip catégorie top-left sur photo → coeur favori top-right → nom + note en bas
- Hover : `boxShadow: 0 12px 40px rgba(0,0,0,0.11); transform: translateY(-3px)`
- Rating : étoile ⭐ + nombre (ex `★ 5.0`)
- Photos Unsplash fallback si `photo` absent, gradient coloré par catégorie si pas d'URL

### Nav (AntNav.tsx)
- Fixed top, hauteur 56 (h-14), padding 6
- Logo `Momento` + pills centraux ("Dashboard", "Explorer", "À propos")
- "Vous êtes prestataire ?" pill gradient rose→violet (full fill)
- Right : palette toggle 🎨, theme toggle ☀️/🌙, Connexion (ghost), **S'inscrire** (gradient pill)

### Filters (explore page)
- Scrollable horizontal pills
- Pill active : **gradient rose→violet** + compteur en chip blanc (ex `+ Tous 829`)
- Pill inactive : fond `--dash-faint`, texte `--dash-text-2`

### CTA primaire
```tsx
style={{
  background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))",
  color: "#fff",
  padding: "15.6px 31.2px",
  fontSize: "18.2px",
  borderRadius: 99,  // pill entier
}}
```

### CTA secondaire (ghost)
- Classe `clone-cta-ghost`
- Border subtil, texte `--dash-text`, fond transparent
- Pill entier `borderRadius: 99`

### Modal pattern (CreateEventModal.tsx existant)
- 2 steps
- Gradient G en header/CTA
- 5 event types actuellement → à étendre à 10 familles dans notre phase 03

### Admin page pattern (ranking/page.tsx)
- Layout centré `maxWidth: 680, padding: "48px 24px"`
- Cards : `background: #fff, borderRadius: 16, border: 1px solid rgba(183,191,217,0.2), boxShadow: 0 1px 4px rgba(0,0,0,0.04)`
- Slider range `accentColor: #E11D48`
- Input number `width: 72, padding: "6px 10px", borderRadius: 8, border: 1.5px solid rgba(183,191,217,0.4)`
- Fetch PATCH + state update immédiat + flash "✓ Enregistré"

---

## 7. Palettes alternatives (user-switchable)

Classes `.palette-ocean`, `.palette-forest`, `.palette-ardoise` sur `<html>` → redéfinissent les vars `--accent`, `--primary`, `--bg`, etc. Ne touchent PAS aux `--dash-*` ni aux `--g1/--g2`. Donc le gradient rose→violet reste toujours la signature.

| Palette | Accent | bg light | bg dark |
|---|---|---|---|
| creme | `#C4532A` terracotta | `#F5EDD6` crème | `#1A1208` marron |
| ocean | `#1A6BAD` bleu | `#EEF4FA` | `#0A1628` |
| forest | `#2D7A3A` vert | `#EEF3EE` | `#0E1E0E` |
| ardoise | gris anthracite | — | — |

→ Ces palettes changent le "cadre" mais la "lumière" (gradient + dash-*) reste.

---

## 8. Ce qu'on retient pour phase 03 (parcours client)

**Fond** : `#0d0e14` (dark-bg) — PAS noir pur, PAS crème
**Cards** : `#16171e` (surface) avec border `rgba(255,255,255,0.07)`
**Texte** : `#eeeef5` principal · `#b0b0cc` muted · `#8888aa` dim
**Gradient signature** : `linear-gradient(135deg, #E11D48, #9333EA)` sur CTA, pill active, progress, badge, nav actif
**Radius** : 14-20 pour cards/tiles · 99 (pill) pour boutons et chips
**Font** : Geist sans (NE PAS mettre Cormorant en display)
**Hover** : `transform: translateY(-2 ou -3px) + shadow 0 12px 40px rgba(0,0,0,0.11)`
**Modals** : même fond surface + border, gradient sur header/CTA

**Pour l'admin** (/admin/budgets-subtypes) : on reste en **light mode** (comme /admin/ranking), cards blanches, accent `#E11D48` sur sliders et numbers. Le mode dark peut venir plus tard.

---

## 9. Fichiers à importer quand on code

```tsx
// Tokens (React)
import { C } from "@/lib/colors"  // C.ink, C.terra, C.accent…

// Thème
import { useTheme } from "@/components/ThemeProvider"

// Gradient inline
const G = "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))"
```

**Source des tokens brut** : `src/app/globals.css` (569 lignes)
**Source du provider** : `src/components/ThemeProvider.tsx`
**Patterns de référence** :
- `src/components/clone/AntHero.tsx` (CTA primaire + h1)
- `src/components/clone/AntVendorCard.tsx` (card)
- `src/components/clone/AntNav.tsx` (pills + gradient)
- `src/app/admin/ranking/page.tsx` (admin pattern)
- `src/components/clone/dashboard/CreateEventModal.tsx` (modal 2 steps à étendre)
