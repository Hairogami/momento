# Momento — Project Definition

## Vision

Marketplace événementielle tout-en-un au Maroc. Connecte organisateurs d'événements et prestataires — de la découverte au contrat signé. L'app qui organise ton événement pour toi, et qui remplit le carnet de commandes des prestataires sans qu'ils décrochent le téléphone.

**Tagline** : *Momento — l'événementiel sans le chaos.*

## Marché

- **Géo** : Maroc, focus 41 villes (Casablanca, Marrakech, Rabat, Tanger, Fès, etc.)
- **TAM** : 50 000+ mariages/an + événements corporate/anniversaires/festivals
- **Concurrence** : Instagram + WhatsApp (90% du flux actuel), Mariages.net/Zankyou (annuaires datés), wedding planners traditionnels
- **Avantage défendable** : outils de gestion intégrés (budget, tâches, invités, contrats, faire-part) — Instagram ne fera jamais ça

## Utilisateurs

### Client
Femme marocaine 25-40 ans. 3 profils : la perdue, l'autonome, l'indépendante.

### Prestataire
Photographe/DJ/traiteur/déco — indépendant ou petite équipe (1-5 pers), 25-45 ans.

## Modèle économique

| Plan | Prix | Cible |
|---|---|---|
| Free | 0 MAD | Acquisition / FOMO Pro |
| Pro | 200 MAD/mois | Coeur de revenu B2C |
| Pro + Planner | 500 MAD/mois | Premium humain + IA |

**Côté prestataire** : freemium + abonnement + visibilité marketing + 0% commission directe.

## Équipe

- **Yazid** — fondateur/dev (nuit), revenu stable jour
- **Anass, Mehdi, Omar** — associés
- 4 associés, bootstrap, pas de funding externe, pas de deadline imposée

## Stack technique

- **Frontend** : Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui v4
- **Backend** : Prisma 7, NextAuth v5 beta JWT
- **DB** : Supabase Postgres (eu-west-1, pooler 6543 + pgbouncer transaction mode)
- **Email** : Resend
- **Cache/Rate-limit** : Upstash Redis
- **Hosting** : Vercel (`ngf1/momento`)
- **Domaine** : `momentoevents.app`
- **Repo** : `Hairogami/momento`

## Phase actuelle

**Pré-launch** — produit en construction, 0 utilisateur, 0 revenu, coming-soon mode actif.

**Objectif 3-6 mois** : outil parfait + catalogue 1000+ partenaires vérifiés + lancement public.
