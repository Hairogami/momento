# Deployment — Momento
~350 tokens

## Infra
- **Vercel** — projet `ngf1/momento`
- **Domaine** : `momentoevents.app`
- **Git** : `git push origin main` déclenche build auto sur Vercel

## Règle deploy
**Ne JAMAIS deployer sans confirmation explicite du maître.**
```bash
vercel deploy --prod    # Uniquement après confirmation
```

## Variables d'environnement Vercel
```bash
vercel env pull .env.local         # Récupérer les vars depuis Vercel
vercel env add VARIABLE_NAME       # Ajouter une variable
vercel env ls                      # Lister toutes les variables
```

Variables critiques à configurer sur Vercel :
| Variable | Environnement | Usage |
|----------|--------------|-------|
| `DATABASE_URL` | Production | Neon pooled (6543) |
| `DIRECT_URL` | Production | Neon direct (5432) — migrations |
| `JWT_SECRET` | All | Auth JWT |
| `GOOGLE_CLIENT_ID` | All | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | All | OAuth Google |
| `RESEND_API_KEY` | All | Emails |
| `LAUNCH_PUBLIC` | Production | `true` = site public |
| `NEXT_PUBLIC_APP_URL` | All | URL de base |

## Google OAuth — config prod
Pour activer OAuth Google en production :
1. `vercel env add GOOGLE_CLIENT_ID` (credentials web prod)
2. `vercel env add GOOGLE_CLIENT_SECRET`
3. Ajouter dans Google Cloud Console → OAuth Redirect URIs :
   `https://momentoevents.app/api/auth/google/callback`
4. `vercel deploy --prod`

## Domaine momentoevents.app — dépannage
Si le domaine n'est pas mis à jour après deploy :
```bash
npx vercel alias list    # Doit afficher momentoevents.app
npx vercel ls            # Voir les derniers déploiements
```
Si alias vide → aller sur vercel.com → projet ngf1/momento → Settings → Domains.

DNS manual (si "Configure Automatically" échoue) :
- A record : `@` → `216.198.79.1`
- CNAME : `www` → `cname.vercel-dns.com`

## Logs Vercel
```bash
vercel logs                          # Logs du dernier déploiement
vercel logs <deployment-url>         # Logs d'un déploiement spécifique
```

## Diagnostic build
```bash
npx next build                       # Tester le build en local d'abord
# Si erreur TypeScript → corriger avant de deployer
```
