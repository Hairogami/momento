# Dashboard Prestataire — Phase 1 MVP

Espace de travail autonome pour les prestataires Momento. Goal Phase 1 :
un prestataire gère ses demandes de bout en bout, comprend ses perfs 30j,
et sait quoi améliorer sans quitter Momento.

## Layout

Défini par `src/app/vendor/dashboard/layout.tsx` : AntNav (header public) +
sidebar dédiée `VendorSidebar` avec liens Home / Inbox / Calendrier / Packages /
Templates / Profil. Auth gardée au niveau layout (`role === "vendor"` + `vendorSlug`).

## Routes

| Route | Fichier | Composant client | Rôle |
|---|---|---|---|
| `/vendor/dashboard` | `page.tsx` | `VendorHome` | Home — KPIs, charts, calendrier, preview |
| `/vendor/dashboard/inbox` | `inbox/page.tsx` | `InboxClient` | Demandes clients + réponse 1-clic |
| `/vendor/dashboard/packages` | `packages/page.tsx` | `PackagesEditor` | CRUD packages 3 tiers + starter packs |
| `/vendor/dashboard/templates` | `templates/page.tsx` | `TemplatesManager` | CRUD réponses FR/darija/AR |
| `/vendor/dashboard/profil` | `profil/page.tsx` | `ProfileEditor` | Édition profil + score live |

Toutes les pages sont `force-dynamic`, `robots: noindex` et passent par un
server component fin qui délègue à un client component.

## APIs consommées

| Endpoint | Méthodes | Source | Fait quoi |
|---|---|---|---|
| `/api/vendor/stats` | GET `?period=today\|7d\|30d\|custom` | `api/vendor/stats/route.ts` | KPIs avec delta période précédente, sparkline, funnel, donut |
| `/api/vendor/completion` | GET | `api/vendor/completion/route.ts` | Score /100 + checklist actionable (top 3 steps pondérés) |
| `/api/vendor/requests` | GET `?status&q&page`, PATCH `/[id]` | `api/vendor/requests/` | Liste paginée + transitions statut |
| `/api/vendor/calendar` | GET `?from&to` | `api/vendor/calendar/route.ts` | Agenda privé agrégé par jour (booked/pending) |
| `/api/vendor/packages` | GET/POST/PATCH/DELETE | `api/vendor/packages/` | CRUD, cap 10 |
| `/api/vendor/templates` | GET/POST/PATCH/DELETE | `api/vendor/templates/` | CRUD, cap 20 |
| `/api/vendor/profile` | GET/PATCH | `api/vendor/profile/route.ts` | Édition champs profil (IDOR-safe, Zod) |

**IDOR** : chaque route résout `vendorSlug` depuis la session auth et filtre
toutes ses opérations Prisma par ce slug. Les champs `verified`, `featured`,
`rating`, `reviewCount`, `slug`, `id`, `userId`, `createdAt` sont en lecture
seule côté API — contrôlés par admin/système.

## Statuts `ContactRequest`

Machine d'état tolérante au legacy :
- `new` ↔ `pending` (legacy DB)
- `read` (timestamp `readAt`)
- `replied` (timestamp `repliedAt`)
- `won` ↔ `confirmed` (legacy DB)
- `lost` ↔ `declined` (legacy DB)

Transitions côté API (`PATCH /api/vendor/requests/[id]`) :
- `new → read|replied|won|lost`
- `read → replied|won|lost`
- `replied → won|lost`
- `won|lost` terminaux (pas de transition)

## Score de complétude (pondération)

Total = 100 pts. Items :
- Photos ≥ 3 — 25 pts (upload = Phase 2)
- Description ≥ 100 car — 15 pts
- Tarifs (fourchette OU gamme) — 15 pts
- Téléphone — 10 pts
- Ville + région — 10 pts
- Instagram ou Facebook — 10 pts
- Badge vérifié — 10 pts
- Email — 5 pts

Chaque item expose un CTA `href` qui pointe vers `/vendor/dashboard/profil#<anchor>` —
les ancres doivent exister dans `ProfileEditor.tsx` (`#description`, `#contact`,
`#location`, `#prices`, `#social`, `#photos`, `#verify`).

## Composants partagés

- `_shared/EmptyState.tsx` — empty state uniforme (icon + titre + subtitle + CTA)
  utilisé par inbox (pas de demande / pas de résultat) et templates (pas de
  template dans cette langue).

## Conventions de code

- Composants client préfixés `"use client"`, pas d'accès DB direct.
- Pages serveur : `export const dynamic = "force-dynamic"`, métadata `robots: noindex`.
- Toutes les grids responsives : `repeat(auto-fit, minmax(<min>, 1fr))` pour
  éviter le cassage mobile.
- Styles inline (pas de CSS modules). Palette : `#E11D48` (rouge primaire),
  `#9333EA` (violet accent), `#121317` (texte), `#6b7280` (subtitle),
  `#f0f1f6` (surface alt).
- Validation : Zod sur toutes les routes PATCH/POST, avec `.safeParse` +
  renvoi de `parsed.error.issues[0]?.message`.

## Hors-scope Phase 1 → Phase 2+

- Upload photos (Vercel Blob) + galerie éditable
- Calendrier public sur `/vendor/[slug]` + model `VendorBlockedDate`
- Réponse aux avis + distribution rating
- Alertes "demande sans réponse > 24h"
- Benchmark ville + heatmap Maroc
- Mode urgence week-end
- IA Fiche-Doctor + Battle vs concurrents
