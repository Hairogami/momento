# Momento

## Vision

> Momento — l'événementiel sans le chaos.

Marketplace événementielle tout-en-un au Maroc. Connecte organisateurs d'événements et prestataires — de la découverte au contrat signé. L'app qui organise ton événement pour toi, et qui remplit le carnet de commandes des prestataires sans qu'ils décrochent le téléphone.

**Marché** : Maroc, 50 000+ mariages/an, zéro plateforme digitale dominante. Le parcours actuel = Instagram + WhatsApp + bouche-à-oreille (~90% du flux). Aucun concurrent direct sérieux — Mariages.net/Zankyou sont des annuaires datés sans outils de gestion.

**Avantage défendable** : les outils de gestion (budget, tâches, invités, contrats, faire-part, site mariage). Instagram ne fera jamais ça. C'est le cheval de Troie — le client vient pour organiser, il reste pour la marketplace.

## Utilisateurs

### Client
Femme marocaine, 25-40 ans. Trois profils :
- **La perdue** : "je sais pas par où commencer" → Momento guide sans imposer
- **L'autonome** : "je veux pas qu'on s'en mêle" → Momento donne le contrôle total
- **L'indépendante** : "l'avis de ma belle-mère, non merci" → Momento = son espace privé

### Prestataire
Photographe, DJ, traiteur, déco — souvent indépendant ou petite équipe (1-5 pers), 25-45 ans. Trouve ses clients par bouche-à-oreille + Instagram. Frustration : 30-40% du temps perdu en messages WhatsApp qui ne mènent nulle part. Pas de site pro, dépend du réseau personnel, saison haute saturée / saison basse morte.

**Pitch presta** : Momento vous apporte des clients qualifiés et prêts à réserver — fini les appels pour rien, les "je réfléchis" et les devis sans suite.

## Modèle économique

### Côté client
| Plan | Prix | Inclus |
|------|------|--------|
| **Free** | 0 MAD | 1 événement, swipe prestas illimité, budget (total), notes, countdown |
| **Pro** | 200 MAD/mois | Événements illimités, messagerie prestas, checklist temporelle, invités, budget détaillé + verdict IA, favoris, thème custom |
| **Pro + Planner** | 500 MAD/mois | Tout Pro + wedding planner réel + agent IA (20% commission sur le planner) |

**Principe** : le swipe (découverte) reste gratuit = moteur marketplace. Paywall sur l'ACTION (contacter un presta), pas la découverte. Dashboard Free avec widgets Pro en "Aperçu" (données de démo) pour créer le FOMO.

### Côté prestataire
- **Court terme (6 mois)** : frais d'inscription 100 MAD, gratuit jusqu'au premier client, puis paiement mensuel selon catégorie
- **Long terme** : abonnement mensuel/annuel réduit + visibilité marketing + database clients qualifiés
- **Zéro commission sur les transactions directes** — le presta garde 100% de ses devis

### Autres revenus
- Marketplace festivals (stands prestas avec commission 10-20%)
- Stands restaurants dans les mariages (commission 10-20%)
- Liste de cadeaux avec visibilité marques (commission 20-30%)
- Planner humain intégré (commission 20%)

## Concurrence

| Concurrent | Menace | Pourquoi |
|------------|--------|----------|
| **Instagram + WhatsApp** | Forte (inertie) | 90% du parcours actuel. Gratuit, ancré culturellement. Mais zéro outil de gestion. |
| **Mariages.net / Zankyou** | Faible | Annuaires datés, UX desktop, pas d'outils, activité Maroc quasi-nulle |
| **Wedding planners traditionnels** | Faible | Chers (5-15% du budget), pas scalable. Momento = alternative digitale |
| **Plateformes MENA (Zola, Jawwy)** | Nulle | Pas présentes au Maroc, culturellement éloignées |

**Le vrai risque** : l'inertie comportementale, pas un concurrent produit.

## Équipe

4 associés, aucune pression externe :
- **Yazid** (fondateur/dev) — construit le produit la nuit, revenu stable en journée
- **Anass** — associé
- **Mehdi** — associé
- **Omar** — associé

Basés au Maroc. Bootstrap, pas de funding externe. Pas de deadline imposée.

## État actuel

**Phase** : pré-lancement. Produit en construction, 0 utilisateur, 0 revenu.
**Objectif 3-6 mois** : outil parfait + catalogue rempli de partenaires vérifiés + lancement public en vue.
**Domaine** : `momentoevents.app` · Vercel project : `ngf1/momento`

### Ce qui existe (MVP)
- Landing page + page explore (1000+ prestas scrapés, 41 villes, 31 catégories)
- Profils prestataires avec photos, packages, reviews
- Espace client : dashboard avec widgets (budget, countdown, tâches, notes, swipe prestas)
- Messagerie client ↔ presta
- Gestion événement : invités, budget, tâches
- Auth : signup email + Google OAuth
- Admin : gestion prestas, vérification, analytics

### En cours (parcours client v2)
- Soft gate sur /explore (signup au clic profil)
- Onboarding : type événement (10 familles) + catégories + budget obligatoire
- Dashboard Free/Pro avec FOMO (widgets aperçu)
- Paywall sur le contact presta

## Stack

Next.js 16 (App Router), TypeScript, Prisma 7, Supabase PostgreSQL (region eu-west-1), Tailwind v4, shadcn/ui v4, NextAuth v5 (beta — JWT strategy), Resend (email), Vercel (hosting), Upstash Redis (rate limiting)

## Patterns & conventions

- Import Prisma : `@/generated/prisma/client` (JAMAIS `@prisma/client` — Prisma 7)
- Auth : NextAuth v5 (beta), strategy JWT, session via `auth()` côté serveur (`src/lib/auth.ts`)
- Middleware : `proxy.ts` (PAS middleware.ts — Next.js 16)
- DB : Supabase pooler (`aws-0-eu-west-1.pooler.supabase.com`) — runtime port 6543 (`DATABASE_URL`), migrations port 5432 (`DIRECT_URL`)
- DB migrations : `DATABASE_URL=$DIRECT_URL npx prisma db push` (port 5432, JAMAIS 6543)
- Commits : `feat(scope): desc` ou `fix(scope): desc`
- IDOR : toujours filtrer par `userId` dans les routes API
- Build check : `npx next build` avant tout commit de feature

## Problèmes connus

- Dashboard invisible pour les nouveaux visiteurs (en cours de résolution avec le parcours client v2)
- Explore 100% public, aucune capture email (gate en cours)
- Photos explore = images génériques, pas les vrais vendors
- Dark mode flash entre les pages
- VendorSwipe widget/modal désynchronisés
