# Règle — Cohérence brand Momento (UI/UX)

## ⚡ TRIGGER PERMANENT — Avant TOUTE création/modification de composant visible

Avant 1 ligne de JSX ou modif de style inline → STOP → lire cette règle.
Si je m'apprête à écrire une couleur hex, un fontSize en pixel, un padding numérique random, un border-radius bizarre → utiliser le token correspondant.

---

## 🚫 INTERDICTION ABSOLUE — Ne JAMAIS reprendre les couleurs de l'ancien design

L'ancien design avait des couleurs qui ne sont PLUS le brand Momento. Si je vois dans un fichier existant :
- Orange clair `#FFF7ED`, brique `#9A3412`, peach `#FED7AA`
- Rouge brique `#C4532A`, beige `#F5EDD6`, marron `#8B4513`
- Toute teinte terracotta/sépia/vintage qui ne correspond pas aux tokens ci-dessous

→ **NE PAS LES COPIER**. Remplacer par les tokens brand actuels.

Le brand Momento ACTUEL = G gradient (rose `#E11D48` → violet `#9333EA`) + tokens neutres `--dash-*`. Point.

Toute exception (ex: site événement template choisi par le user via palette éditeur) doit être explicitement passée en prop, jamais hardcodée dans un composant générique.

---

## 1. Couleurs (tokens uniquement)

### Brand
- **Primary gradient** : `const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"`
- **Primary** : `var(--g1, #E11D48)` rose · **Secondary** : `var(--g2, #9333EA)` violet

### Texte
- Principal : `var(--dash-text, #121317)`
- Secondaire : `var(--dash-text-2, #6a6a71)`
- Muted : `var(--dash-text-3, #9a9aaa)`

### Surfaces
- Page bg : `var(--dash-bg, #f7f7fb)`
- Card : `var(--dash-surface, #fff)`
- Hover faint : `var(--dash-faint, rgba(183,191,217,0.07))`
- Hover plus marqué : `var(--dash-faint-2, rgba(183,191,217,0.18))`

### Bordures
- Border : `var(--dash-border, rgba(183,191,217,0.15))`
- Divider : `var(--dash-divider, rgba(183,191,217,0.10))`

### Statuts (sémantique, identiques light/dark)
- Success `#22c55e` · Warning `#f59e0b` · Danger `#ef4444`

**INTERDIT** : tout hex aléatoire. Si vraiment besoin d'une teinte custom, utiliser `color-mix(in srgb, var(--g1) 25%, transparent)`.

---

## 2. Typographie (tokens fluides clamp 1024→2560)

`--text-2xs` (10-12) · `--text-xs` (12-14) · `--text-sm` (13-16) · `--text-base` (15-18) · `--text-md` (17-20) · `--text-lg` (21-24) · `--text-xl` (25-32) · `--text-2xl` (33-44) · `--text-3xl` (45-60) · `--text-4xl` (61+)

**INTERDIT** : `fontSize: 13`, `"16px"`, `"1.2rem"`. Toujours token ou `clamp()` direct.

**Lisibilité** : line-height 1.5 corps, 1.2 titres. Max 70 chars / 65ch pour readability blocs longs. Truncation : `overflow:hidden; textOverflow:ellipsis; whiteSpace:nowrap`.

---

## 3. Spacing tokens

`--space-2xs` (4) · `--space-xs` (8) · `--space-sm` (12) · `--space-md` (16) · `--space-lg` (24) · `--space-xl` (32)

Padding card responsive : `clamp(12px, 1.6vw, 18px) clamp(14px, 1.8vw, 20px)`.

---

## 4. Border-radius standardisés

`4` (inputs micro) · `8` (boutons compacts) · `10` (inputs/boutons standard) · `12` (cards petites) · `16` (cards principales/modals) · `999` (pills/avatars) · `50%` (avatars ronds)

**INTERDIT** : 7, 13, 17, valeurs random.

---

## 5. Shadows (tokenisées light/dark)

```css
:root { --shadow-card: 0 1px 6px rgba(0,0,0,0.04); --shadow-elevated: 0 2px 12px rgba(0,0,0,0.05); --shadow-modal: 0 8px 24px rgba(0,0,0,0.12); }
.dark { --shadow-card: 0 1px 6px rgba(0,0,0,0.30); --shadow-elevated: 0 4px 16px rgba(0,0,0,0.40); --shadow-modal: 0 12px 40px rgba(0,0,0,0.50); }
```
Hover brand : `0 4px 14px color-mix(in srgb, var(--g1) 25%, transparent)`.

---

## 6. Patterns composants — RÉUTILISER les références officielles

| Pattern | Référence à copier exactement |
|---------|-------------------------------|
| Pill / Dropdown filter | `src/app/explore/ExploreClient.tsx` (PillSelect) |
| Modal / Dialog | `src/components/guests/LinkRsvpDialog.tsx` |
| Banner sticky | `src/components/EmailVerificationBanner.tsx` |
| Toggle Cards/List | `src/components/guests/ViewToggle.tsx` |
| Export menu dropdown | `src/components/guests/GuestsExportMenu.tsx` |
| Card invité | inline dans `src/app/guests/page.tsx` |

**Avant de créer un composant : vérifier si un de ces patterns fait déjà 80% du job.** Si oui, copier puis adapter. JAMAIS réinventer.

### Bouton primary
```tsx
{ padding: "9px 20px", borderRadius: 999, background: G, color: "#fff", border: "none",
  fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  boxShadow: "0 2px 8px color-mix(in srgb, var(--g1) 25%, transparent)", transition: "transform 0.15s" }
```
Hover : `translateY(-1px)`.

### Bouton secondary (outline)
```tsx
{ padding: "8px 16px", borderRadius: 10, background: "var(--dash-surface)",
  color: "var(--dash-text)", border: "1px solid var(--dash-border)",
  fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }
```

### Bouton ghost
```tsx
{ background: "transparent", color: "var(--dash-text-2)", border: "none",
  padding: "6px 12px", fontSize: "var(--text-xs)", cursor: "pointer" }
```
Hover : background `var(--dash-faint)`.

### Card standard
```tsx
{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)",
  borderRadius: 16, padding: "clamp(12px, 1.6vw, 18px) clamp(14px, 1.8vw, 20px)",
  boxShadow: "var(--shadow-card)" }
```

### Input texte
```tsx
{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border)",
  background: "var(--dash-surface)", color: "var(--dash-text)",
  fontSize: "var(--text-sm)", fontFamily: "inherit", outline: "none" }
```
Focus : `outline: 2px solid var(--g1); outlineOffset: 2px`.

### Empty state
```tsx
<p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", textAlign: "center", padding: "var(--space-lg) 0", margin: 0 }}>
  Aucun X · <Link href="/Y" style={{ color: "var(--g1)" }}>Ajouter →</Link>
</p>
```

### Avatar
```tsx
{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, color, // 18 = ~10% opacity hex
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "var(--text-sm)", fontWeight: 700, flexShrink: 0 }
```

### Toast (à créer si besoin, pattern unique)
```tsx
// Position bottom-center, auto-dismiss 3s, stack max 3
{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
  background: "var(--dash-text)", color: "var(--dash-bg)",
  padding: "10px 20px", borderRadius: 999, fontSize: "var(--text-sm)",
  boxShadow: "var(--shadow-modal)", zIndex: 2000 }
```

### Scrollbar custom (à appliquer en style jsx global sur tout container scroll visible)
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--dash-border); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: var(--dash-text-3); }
```

---

## 7. Dark/Light mode — règles absolues

### Toggle global
- Géré au layout root via classe `.dark` sur `<html>`. JAMAIS de useState dark dans un composant individuel.
- Préférence en `localStorage.theme`, init au mount via script bloquant en `<head>` (anti-flash).
- Préférer media query `(prefers-color-scheme: dark)` comme défaut.

### Tokens couvrent les 2 modes
Tous les `--dash-*` sont définis en `:root` (light) ET `.dark` (dark) dans `globals.css`. Si je hardcode `#fff` ou `#000` dans un composant → je casse l'autre mode.

### Couleurs identiques 2 modes
- Brand `--g1` `--g2` (vibrants → OK partout)
- Status `#22c55e` `#f59e0b` `#ef4444`
- Texte sur G gradient : toujours `#fff`

### Box-shadows : tokenisées (cf. section 5) — atténuées en light, plus marquées en dark
### Images claires sur surface dark : ajouter `border: 1px solid var(--dash-border)` pour séparation
### SVG icônes : `fill="currentColor" stroke="currentColor"` toujours
### Hover : géré par `--dash-faint*` (s'adapte automatiquement)
### Focus visible : `outline: 2px solid var(--g1); outlineOffset: 2px` — JAMAIS `outline: none` sans remplacer

### Autofill browser (fix global dans `globals.css`)
```css
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--dash-text);
  -webkit-box-shadow: 0 0 0 1000px var(--dash-surface) inset;
  transition: background-color 5000s ease-in-out 0s;
}
```

### Vérification systématique avant commit
Mentalement : "si je toggle dark mode, est-ce que ce composant reste lisible ?". Si une seule couleur est statique sur fond/texte → bug. Pour tester en vrai, ouvrir DevTools → toggle `.dark` sur `<html>` → screenshot.

---

## 8. Responsive / container queries

- **Container parent** : `containerType: "inline-size"` pour permettre le `cqw` aux enfants
- **Padding/fontSize** : `clamp()` partout (cf. tokens fluides)
- **Breakpoints Tailwind** : sm (640) md (768) lg (1024) xl (1280) 2xl (1536)
- **Test viewports cibles** : 1920, 1536, 1280, 1024, 768, 414, 375
- **Touch target min** : 44×44 sur mobile (boutons icônes : ne pas descendre sous 36px)
- **Grid responsive** : `gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))"` (jamais 240px fixe)

---

## 9. Accessibility

- `aria-label` sur tout bouton icône sans texte
- `aria-live="polite"` sur toasts/notifs dynamiques
- `role="dialog"` + `aria-modal="true"` sur modals
- Focus trap dans modals (Tab cycle), Esc pour close
- Keyboard nav : tous les items cliquables doivent être `<button>` ou `<a>`, jamais `<div onClick>`
- Contraste WCAG AA min : 4.5:1 corps, 3:1 large texte

---

## 10. Forms

- Label au-dessus de l'input (jamais placeholder-only)
- Required indicator visuel `*` rouge
- Error inline sous le champ, couleur `#ef4444`, fontSize `--text-xs`
- Submit button disabled tant que validation client pas OK
- Validation Zod côté client EN MIROIR du serveur (mêmes schémas dans `src/lib/validations.ts`)

---

## 11. Loading / async UX

- **Skeleton** : `background: var(--dash-faint-2)`, `animation: pulse 1.5s infinite`
- **Spinner** : seulement pour actions courtes (<1s) ; sinon skeleton
- **Texte "Chargement…"** : minimum acceptable si rien d'autre possible
- **Optimistic update** : toujours pour PATCH/DELETE/toggle, avec rollback en cas d'erreur réseau
- **Suspense boundaries** : pour data lourdes côté serveur

---

## 12. Navigation après action

- POST réussi : toast success + reste sur place (par défaut), OU navigue vers la page de l'objet créé (cas création)
- POST échec : toast error avec message clair (jamais "Erreur 500"), garde le form rempli
- Loading pendant navigation : disable bouton + texte "…" ou spinner
- Liens : `<Link>` Next.js pour interne, `<a target="_blank" rel="noopener noreferrer">` pour externe
- Confirmation pour actions destructives : `confirm()` natif acceptable, idéalement modal custom

---

## 13. i18n / format (Maroc, fr-FR)

- Dates : `new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })`
- Devise : `12 500 MAD` (espace insécable U+00A0 entre nombre et MAD)
- Pluralisation : 1 invité / 2 invités, 0 → "Aucun"
- Tous les strings UI en français correct (accents complets : à, é, è, ê, ç, ï, ô, û)

---

## 14. Performance

- **Images** : `<Image />` Next.js obligatoire (sauf data:url justifié, avec `// eslint-disable-next-line` + raison)
- **Widgets lourds** : `dynamic(() => import('...'), { ssr: false })`
- **Listes longues** : virtualization si >100 items (react-window)
- **Bundle** : pas d'import lourd côté client (xlsx, puppeteer) → dynamic import dans route API uniquement

---

## 15. Anti-patterns à bannir IMMÉDIATEMENT

- ❌ Hex aléatoire (`#FFF7ED`, `#9A3412`, `#C4532A`, `#FED7AA`) → **les couleurs de l'ancien design sont mortes**
- ❌ `fontSize: 13` numérique → token
- ❌ `padding: 17` random → multiple de 4 ou clamp() ou token
- ❌ `borderRadius: 7` random → 4/8/10/12/16/999
- ❌ Bouton sans `fontFamily: "inherit"`
- ❌ Élément cliquable sans `cursor: "pointer"`
- ❌ Modal sans backdrop click-to-close + Esc
- ❌ Empty state sans CTA
- ❌ Loading sans skeleton/texte
- ❌ Réinventer un pattern qui existe (PillSelect, Dialog, Card, Banner, ViewToggle)
- ❌ `<div onClick>` au lieu de `<button>`
- ❌ `outline: none` sans focus visible alternatif
- ❌ Hardcoded `#fff` ou `#000` (casse dark/light)
- ❌ Box-shadow non tokenisée (casse dark mode)

---

## 16. Workflow obligatoire avant write/edit composant visible

1. **Identifier le pattern** parmi la table section 6. Si match → copier la référence.
2. **Tokens uniquement** : aucun hex, aucun fontSize/padding/radius numérique random.
3. **States prévus** : hover + disabled + focus + loading.
4. **Test mental dark mode** : si je hardcode une couleur de surface/texte → STOP.
5. **Test mental responsive** : viewport 375 (mobile) ↔ 1920 (desktop), tout doit tenir.
6. **Cohérence finale** : si je fais quelque chose de nouveau, vérifier qu'aucun pattern existant ne le fait déjà à 80%.

---

## Coût de ne pas respecter

- Le user redemande à chaque fois "rends ça plus brand" → perte cumulative énorme (déjà arrivé : email banner orange brique, page /guests refaite 3 fois)
- Sentiment d'amateur (couleurs incohérentes, espacements aléatoires)
- Dark mode cassé → perte confiance utilisateur
- Refactor massif futur pour homogénéiser → exponentiel

**Cette règle remplace le besoin de redire "rends ça UI/UX cohérent". Appliquée à l'écriture, le résultat est brand-cohérent par construction.**
