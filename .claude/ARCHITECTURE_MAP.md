# Architecture Map — Momento
~300 tokens

## Chemin projet
`C:\Users\moume\Documents\momento`
Vercel : `ngf1/momento` → `momentoevents.app`

## Structure src/app/

```
src/app/
├── (auth)/login/          # Page connexion
├── (dashboard)/           # Espace utilisateur connecté
│   ├── accueil/           # Page d'accueil dashboard
│   ├── budget/            # Gestion budget
│   ├── dashboard/         # Dashboard principal
│   ├── favorites/         # Favoris prestataires
│   ├── guests/            # Gestion invités
│   ├── messages/          # Messagerie
│   ├── notifications/     # Notifications
│   └── vendors/           # Prestataires favoris
├── api/                   # Routes API (voir ci-dessous)
├── coming-soon/           # Page coming soon
├── event/                 # Gestion événements
├── explore/               # Exploration marketplace
├── forgot-password/       # Mot de passe oublié
├── help/                  # Aide
├── legal/                 # CGV, mentions légales, privacy
├── planner/               # Planners événements
├── prestataire/           # Espace prestataire
├── prestataires/          # Liste prestataires
├── profile/               # Profil utilisateur
├── reset-password/        # Réinitialisation MDP
├── settings/              # Paramètres compte
├── signup/                # Inscription
├── vendor/[slug]/         # Fiche prestataire publique
├── HeroTitle.tsx           # Composant héro homepage
├── LandingNav.tsx          # Nav landing
├── layout.tsx             # Layout racine
└── page.tsx               # Homepage
```

## Routes API principales

```
api/
├── ai/suggest/            # Suggestions IA (Anthropic)
├── auth/                  # Login, register, logout, me, google, google/callback, forgot-password, reset-password, verify-email, update-profile, change-password, account
├── budget-items/[id]/     # CRUD budget
├── calendar/google/       # Intégration Google Calendar
├── contact/               # Formulaire contact
├── guests/[id]/           # CRUD invités
├── messages/              # GET/POST messages + [conversationId]
├── planners/              # GET/POST + [id] + steps/events
├── reviews/               # Avis prestataires
├── stats/                 # Statistiques
├── steps/[id]/            # CRUD étapes + vendors
├── tasks/[id]/            # CRUD tâches
├── unlock/                # Déblocage accès
├── unread/                # Compteur non-lus
├── vendor/                # claim, dashboard
├── vendor-requests/       # Demandes prestataires
├── vendors/               # Liste vendors
├── waitlist/              # Waitlist
└── workspace/             # Workspace utilisateur
```

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `proxy.ts` (racine) | Middleware Next.js 16 (renommé depuis middleware.ts) |
| `prisma/schema.prisma` | Schéma base de données complet |
| `src/lib/auth.ts` | Logique JWT (jose) + session management |
| `src/lib/prisma.ts` | Client Prisma singleton |
| `src/components/ui/` | Composants shadcn/ui |
| `src/components/` | Composants métier Momento |

## Patterns courants

- **Server Components** par défaut, `'use client'` si hooks React
- **Server Actions** pour mutations depuis le client
- **Route Handlers** (`route.ts`) pour API REST
- **Auth** : vérifier JWT dans chaque route API via `src/lib/auth.ts`
