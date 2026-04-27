# SEO Audit & Fix — Pre-launch (Vague 7)

Date : 2026-04-27
Branche : `claude/unruffled-wright-6c6cea`
Scope : sitemap, robots, structured data, vendor metadata, canonical URLs.

---

## 1. State BEFORE

### `src/app/layout.tsx` — déjà solide
- `metadataBase: new URL("https://momentoevents.app")` ✅
- `title.template: "%s | Momento"` ✅
- `description` 200 chars FR avec keywords Maroc/Casablanca/Marrakech/Rabat ✅
- `keywords[]` 7 entrées ciblées ✅
- `openGraph` complet (locale `fr_MA`, type `website`, siteName, image badge) ✅
- `twitter.summary_large_image` ✅
- `alternates.canonical` + `languages.fr-MA` + `x-default` ✅
- `viewport.themeColor` light/dark ✅
- 3 blocs JSON-LD au layout : `WebSite` (avec `SearchAction`), `Organization`, `LocalBusiness` (avec `OfferCatalog` 5 services) ✅

### `src/app/page.tsx` — pas de metadata override → utilise les defaults du layout (OK pour la home).

### `src/app/explore/page.tsx` — basique
- `title` + `description` français ✅
- ❌ Pas de `canonical`
- ❌ Pas d'`openGraph` ni `twitter` override
- ❌ Title trop courte « Explorer les prestataires — Momento » au lieu de cibler la requête « Tous les prestataires mariage au Maroc »

### `src/app/vendor/[slug]/page.tsx` — déjà correct, à enrichir
- `generateMetadata` async OK
- ❌ Pas de troncature description (peut dépasser 160 chars Google)
- ❌ Pas de `twitter` card override
- ❌ Pas de `noindex` quand vendor introuvable
- ❌ Pas d'`openGraph.url` ni `siteName` ni `locale`
- ❌ JSON-LD `LocalBusiness` sans `@id`, `url`, `priceRange`, `bestRating/worstRating`, ni `sameAs`

### `src/app/sitemap.ts` — pages **fantômes** + lastModified bidon
- ❌ Inclut `/explore/musique-dj`, `/explore/traiteur`, etc. — **aucune route Next.js n'existe pour ces URLs** → 12 entrées sitemap qui produisent 404 (signal négatif Google)
- ❌ `lastModified: new Date()` pour les vendors (toujours « maintenant », inutile pour Google)
- ❌ Manque : `/signup`, `/cgu`, `/confidentialite`, `/mentions-legales`, `/accueil`, `/a-propos`, `/pro`, `/coming-soon`
- ✅ Inclut bien `/`, `/explore`, `/login`, `/vendor/<slug>`

### `src/app/robots.ts` — pattern inversé fragile
- `disallow: "/"` + `allow: ["/", "/explore", ...]` → fonctionne mais (a) pattern non standard, (b) casse silencieusement à chaque nouvelle route publique non ajoutée à la liste
- Pas de `host`

### Pas d'`og-image.png` dédié
- Layout utilise `logo-badge-dark.png` (361×359) — sous la taille recommandée 1200×630. Hors scope (asset image), noté pour suivi.

### Routes city/category absentes
- Pas de `src/app/explore/[city]/[category]/page.tsx` ni `src/app/explore/[category]/page.tsx`. Le sitemap pré-existant inventait des URLs sans page → corrigé en les retirant.
- **Recommandation hors-scope** : créer ces routes plus tard pour SEO local long-tail (« photographe mariage casablanca »). Forte valeur SEO mais hors périmètre du fix.

---

## 2. Files MODIFIED

### `src/app/sitemap.ts` — réécrit
- Supprime les 12 entrées fantômes `/explore/<slug-fictif>`
- Ajoute static : `/`, `/accueil`, `/explore`, `/a-propos`, `/pro`, `/signup`, `/login`, `/cgu`, `/confidentialite`, `/mentions-legales` (10 routes)
- Vendors : `prisma.vendor.findMany` direct avec `slug + updatedAt + verified` → `lastModified` réel par vendor, priorité 0.7 si verified / 0.5 sinon
- Drop dépendance circulaire à `getAllVendorSlugs` (sitemap a besoin de updatedAt en plus du slug)

### `src/app/robots.ts` — pattern standard
- `allow: "/"` + `disallow: [...]` explicite avec routes auth/admin/api/dev/dashboard
- Ajout `host: "https://momentoevents.app"`
- Couvre désormais : api, admin, dashboard, dev, _next, budget, guests, messages, notifications, favorites, mes-prestataires, profile, settings, upgrade, planner, vendor/dashboard, forgot-password, reset-password, welcome-preview, evt/preview

### `src/app/explore/page.tsx`
- Title améliorée : « Tous les prestataires mariage au Maroc » (template ajoute « | Momento »)
- Ajout `alternates.canonical: https://momentoevents.app/explore`
- Ajout `openGraph` + `twitter` overrides avec description ciblée

### `src/app/vendor/[slug]/page.tsx`
- Helper `truncateForMeta(text, 160)` qui coupe sur le dernier espace > 80 chars + ajoute `…`
- `generateMetadata` :
  - 404 vendor → `robots: { index: false, follow: false }`
  - title format `<name> — <category> à <city>` (template ajoute `| Momento`)
  - description tronquée propre, fallback FR généré depuis name/category/city
  - `alternates.canonical` absolu
  - `openGraph` complet (url, siteName, locale `fr_MA`, type `profile`, image avec alt)
  - `twitter.summary_large_image` avec image hero
- JSON-LD enrichi :
  - `@id` + `url` (déduplique entité Schema.org)
  - `image` avec fallback catégorie
  - `areaServed: vendor.city`
  - `priceRange: "$$"`
  - `aggregateRating.bestRating: 5, worstRating: 1`
  - `sameAs: [instagram, facebook, website]` filtrés (que les non-null)

### Files NOT touched
- `src/app/layout.tsx` : déjà bien, aucune modification nécessaire (3 blocs JSON-LD, OG, Twitter, alternates, viewport, metadataBase tous présents)
- `src/app/page.tsx` (homepage) : héritage du layout suffisant
- Pages légales `(legal)/*` : metadata simple déjà présent, suffisant pour ces pages low-priority
- `src/app/signup,login,accueil,pro,a-propos/*/page.tsx` : metadata existante non vérifiée individuellement (hors scope du fix immédiat — note pour audit ultérieur)

---

## 3. Sitemap entry count

**Static** : 10 routes
- `/`, `/accueil`, `/explore`, `/a-propos`, `/pro`, `/signup`, `/login`, `/cgu`, `/confidentialite`, `/mentions-legales`

**Dynamic** : N entrées vendors où N = `prisma.vendor.count()` (toutes fiches, verified ou non)
- D'après CLAUDE.md : ~1000+ vendors scrapés / 41 villes / 31 catégories
- Build output confirme `/sitemap.xml` prerendered en static à build-time

**Total** : ≈ 10 + 1000+ = **~1010+ URLs**

Suppression : 12 entrées fantômes (`/explore/musique-dj`…) qui produisaient 404.

---

## 4. Verification

### TypeScript
```
npx tsc --noEmit
→ exit 0, aucune erreur
```

### Build
```
npx next build
→ Compiled successfully
→ /sitemap.xml ○ Static
→ /robots.txt ○ Static
→ /explore ○ Static (revalidate 1h, expire 1y)
→ /vendor/[slug] ● SSG (generateStaticParams empty + revalidate 3600 → ISR on-demand)
→ Aucun error/warning lié au SEO
```

### Couverture des constraints
- ✅ DO NOT modify visual design (zéro fichier UI touché)
- ✅ DO NOT break existing meta tags (layout intact, vendor metadata enrichi sans casse)
- ✅ French language partout (descriptions, fallbacks, keywords)
- ✅ `https://momentoevents.app` hardcodé (pas de fallback `process.env` cassable au build)

---

## 5. Out of scope — backlog SEO

À traiter dans une vague ultérieure (forte valeur, mais hors périmètre du fix actuel) :

1. **Routes city/category** `src/app/explore/[city]/[category]/page.tsx` (ex: `/explore/casablanca/photographe`) → SEO local long-tail crucial. Inclure dans sitemap dynamique avec `generateStaticParams` croisant villes×catégories réellement peuplées en DB.
2. **OG image dédiée 1200×630** `public/og-image.png` ou route dynamique `app/opengraph-image.tsx` via `next/og` (ImageResponse). Actuellement on sert `logo-badge-dark.png` 361×359, sous-dimensionné pour Twitter/Facebook.
3. **Pages signup/login/accueil/pro/a-propos** : auditer leurs metadata individuellement (canonical, OG, twitter).
4. **BreadcrumbList JSON-LD** sur les fiches vendor (`Home > Explore > <vendor>`).
5. **FAQ JSON-LD** sur `/pro` et `/a-propos` si pertinent.
6. **Robots noindex côté HTTP** pour les pages `/dashboard/*`, `/admin/*` etc. (déjà couvert par robots.txt mais belt-and-suspenders avec `<meta robots noindex>` côté layout).

---

## 6. Status

- TS check : **PASS**
- Build : **PASS**
- Sitemap : **valid**, ~1010 entrées (10 static + 1000+ vendors)
- Robots : **valid**, allow-all + disallow-private
- Structured data : **WebSite + Organization + LocalBusiness** (layout, sitewide) + **LocalBusiness + AggregateRating + Review[] + sameAs** (vendor pages)
- Canonical : **layout** (root), **explore** (override), **vendor/[slug]** (per-vendor)
