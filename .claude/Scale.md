# Plan de scale Momento — 5k → 1M utilisateurs concurrents

Document de référence pour toute décision d'infrastructure et de sécurité en fonction de la charge. Chaque palier est autonome : pour passer au suivant, on ajoute/upgrade seulement ce qui change par rapport au précédent.

**Convention prix** : tous les tarifs en USD/mois, hors taxes, au 2026-04. Plans officiels des éditeurs (Vercel, Neon, Upstash, Pusher, Resend, Sentry, Cloudflare, Anthropic). Overage = usage au-delà des inclus facturé à l'usage.

**Hypothèse concurrent = peak soutenu** : les prix sont calibrés pour tenir le peak, pas juste le moyen. On construit pour le pire cas de la journée.

---

## Palier 1 — 5 000 concurrents

État MVP actuel. Site commercial déjà en ligne.

### Infrastructure & abonnements

| Service | Plan | Pourquoi | Prix |
|---------|------|----------|------|
| **Vercel** | Pro | Commercial obligatoire (Hobby interdit usage pro). 1TB bandwidth, 1M invocations, Observability, Speed Insights, BotID | **$20** |
| **Neon Postgres** | Launch | 10 GB storage, 300 CU-h/mo, pooler 6543 illimité, PITR 7j | **$19** |
| **Upstash Redis** | Free | 10k cmds/jour — suffit pour rate-limit seul à 5k | **$0** |
| **Resend** | Pro | 50k emails/mo ; free 100/jour insuffisant dès qu'on signup + notifications | **$20** |
| **Sentry** | Developer (free) | 5k erreurs/mo — assez à 5k users | **$0** |
| **Cloudflare** | Free | Proxy DNS, DDoS L3/L4, WAF basique, Turnstile captcha gratuit | **$0** |
| **Anthropic** | Usage direct | Haiku 4.5 suggestions IA, consommation réelle faible | **~$10** |

### Plan sécurité (0 bug, 0 problème d'instance, 0 faille)

- **Auth JWT jose** (`src/lib/auth.ts`) — stateless, pas de store session à faire scaler
- **Rate-limit Upstash** sur `/api/auth/register` (5/15min), `/api/waitlist` (5/15min), `/api/messages` (30/min), `/api/vendors` (60/min)
- **IDOR guards** : toutes les routes protégées filtrent par `userId` (audit déjà fait en Apr 2026)
- **Cloudflare Turnstile** sur `/signup` et `/waitlist` (free, invisible)
- **Vercel BotID** actif (inclus Pro)
- **Next.js CSP headers** via `next.config.ts` (en place)
- **Prisma parameterized queries** (ORM par défaut, pas de raw SQL user-facing)
- **Preview deploys** systématiques sur chaque PR avant merge → zéro régression en prod
- **Neon PITR 7j** inclus → restauration possible en cas d'erreur data
- **Sentry Developer** capte les erreurs runtime
- **`npx next build` obligatoire** avant merge (règle projet existante)

### Total palier 1 (5 000 concurrents) : **~$69/mo**

Détail : Vercel Pro $20 + Neon Launch $19 + Resend Pro $20 + Anthropic ~$10 + Upstash/Sentry/Cloudflare $0 = **$69/mo**

---

## Palier 2 — 10 000 concurrents

Premier palier de croissance. Quelques optimisations gratuites débloquent ce tier sans coût supplémentaire.

### Changements vs palier 1

| Service | Plan | Raison | Prix |
|---------|------|--------|------|
| Vercel | Pro + overage | Bandwidth dépasse 1TB, invocations ~3M | **$20 + ~$30 overage** |
| Neon | Launch + usage | CU-h dépasse 300 | **$19 + ~$10 usage** |
| Upstash Redis | Pay-as-you-go | Free 10k cmds/jour saturé dès qu'on active le cache applicatif | **~$5** |
| Resend | Pro | Inchangé | **$20** |
| Sentry | Developer | Encore dans les 5k erreurs/mo | **$0** |
| Anthropic | Usage | Augmente légèrement | **~$15** |

### Optimisations gratuites à activer (0 bug, impact massif)

- **ISR sur `/`, `/vendor/[slug]`, `/prestataires`** : `export const revalidate = 3600`
- **Cache-Control + stale-while-revalidate** sur `/api/vendors`, `/api/stats`, `/api/vendors/counts`
- **`<img>` → `next/image`** sur landing + composants `Ant*`
- **Suppression fallbacks Unsplash** → assets locaux `/public`
- **Adapter `@prisma/adapter-neon`** (driver HTTP) sur GET simples
- **Refactor `/explore`** en Server Component avec `unstable_cache`

### Plan sécurité (ajouts)

- **Cache layer Redis** avec fallback automatique si Upstash down (le wrapper `cached()` retombe sur query DB)
- **Invalidation cache ciblée** (`revalidateTag()` + `redis.del()`) sur chaque mutation pour éviter staleness visible user
- **k6 load test** mensuel automatisé sur les pages publiques

### Total palier 2 (10 000 concurrents) : **~$119/mo**

---

## Palier 3 — 20 000 concurrents

Premier palier où Sentry Free saute et où on ajoute une vraie observabilité.

### Changements vs palier 2

| Service | Plan | Raison | Prix |
|---------|------|--------|------|
| Vercel | Pro + overage | ~5TB bandwidth, ~10M invocations | **$20 + ~$80** |
| Neon | Launch + usage | Proche limite, envisager Scale dès la fin de ce palier | **$19 + ~$20** |
| Upstash Redis | Pay-as-you-go | Volume cache augmente | **~$10** |
| Resend | Pro | Inchangé | **$20** |
| **Sentry** | **Team** | Free 5k dépassé (0.05% × 20k × 30j = 9k+ erreurs/mo) | **$26** |
| Anthropic | Usage | Augmente | **~$25** |

### Sécurité (ajouts)

- **Sentry Performance** (inclus Team) → détecte régressions perf avant prod
- **Vercel Observability Alerts** sur p95 > 1s et error rate > 1%
- **Cloudflare Rules gratuites** : bloquer pays non-servis si pertinent, filtrer crawlers agressifs

### Total palier 3 (20 000 concurrents) : **~$220/mo**

---

## Palier 4 — 50 000 concurrents

Palier critique : la messagerie en polling commence à noyer Neon. Premier upgrade DB majeur.

### Changements vs palier 3

| Service | Plan | Raison | Prix |
|---------|------|--------|------|
| Vercel | Pro + overage | ~10TB bandwidth, 25M invocations | **$20 + ~$150** |
| **Neon** | **Scale** | Launch saturé. Scale = autoscale 8 CU + read replicas indispensables à cette charge | **$69 + ~$20 usage** |
| **Pusher Channels** | **Startup** | Polling messagerie × 50k actifs = 10k queries/s sur Neon = mort. Pusher élimine 100% du polling | **$49** |
| Upstash Redis | Pay-as-you-go | Volume cache fort | **~$15** |
| Resend | Pro | ~50k emails/mo toujours dans le quota | **$20** |
| Sentry | Team | Inchangé | **$26** |
| Anthropic | Usage | Augmente | **~$35** |

### Architecture — changements obligatoires

- **Read replicas Neon** (inclus Scale) : router les GET publiques (`/api/vendors`, `/api/vendor/[slug]`, `/explore`) sur replica, mutations sur primary
- **Pusher remplace polling** dans `src/app/(dashboard)/messages/page.tsx` — feature flag `USE_PUSHER=true` pour migration progressive
- **Audit indexes Prisma** obligatoire : `Vendor(category, ville)`, `Vendor(available, featured)`, `Message(conversationId, createdAt DESC)`, `Conversation(userId, updatedAt DESC)`

### Sécurité (ajouts)

- **Cloudflare Pro** ($20) : WAF managé complet, bot management, Under Attack mode
- **hCaptcha Enterprise** ou Turnstile challenge mode sur `/signup`
- **Disaster Recovery** : procédure de rollback Neon PITR testée une fois
- **Load test pré-release** systématique (k6 à 2× la charge actuelle)

### Total palier 4 (50 000 concurrents) : **~$425/mo**

---

## Palier 5 — 100 000 concurrents

Cible réaliste pour Momento à maturité (1M+ MAU, peak 100k). Premier palier où Prisma Accelerate devient pertinent.

### Changements vs palier 4

| Service | Plan | Raison | Prix |
|---------|------|--------|------|
| Vercel | Pro + overage | ~20TB bandwidth, 50M invocations, Active CPU usage | **$20 + ~$250** |
| Neon | Scale + usage | Compute + replicas + usage | **$69 + ~$40** |
| **Prisma Accelerate** | Starter | Mutualise les connexions → protège Neon quand 10 000+ Fluid instances tournent | **$30** |
| Pusher Channels | Startup | 500k connexions concurrentes incluses, encore OK | **$49** |
| **Upstash Redis** | **Pro** | Pay-as-you-go devient plus cher que Pro à ce volume + SLA meilleur | **$10** |
| **Upstash QStash** | Pay-as-you-go | Queue email + jobs async (welcome, reset, notifications) pour éviter burst Resend | **~$5** |
| Resend | Pro | Toujours dans le quota (50k) si la queue lisse | **$20** |
| **Vercel Blob** | Usage | Migration images hors Unsplash + uploads users | **~$5** |
| **Vercel AI Gateway** | Usage | Fallback + cache suggestions Anthropic | **$0 base** |
| Anthropic | Usage | Tier 2, volume suggestions | **~$50** |
| Sentry | Team | Encore dans le quota Team (50k) | **$26** |
| Cloudflare | Pro | Inchangé | **$20** |

### Architecture — changements obligatoires

- **Split Prisma client** : `prismaHttp` (reads via `@prisma/adapter-neon`) + `prismaPool` (transactions via `@prisma/adapter-pg`)
- **Email queue QStash** : `register/route.ts`, `forgot-password`, notifications → enfiler au lieu d'appeler Resend direct
- **AI Gateway** : remplacer `baseURL` Anthropic par celui de Vercel AI Gateway (retry, fallback, cache)
- **Vercel Rolling Releases** activé : deploys canary 10% puis 50% puis 100%
- **Feature flags Edge Config** pour kill-switch instantané de features instables

### Sécurité (ajouts)

- **SAST** : GitHub CodeQL gratuit + Dependabot alertes critiques auto-mergées
- **Pen test** annuel externe (~$3k one-shot, amorti sur l'année → ~$250/mo budget)
- **Backup DB hors-site** : export Neon vers S3/R2 quotidien (Cloudflare R2 ~$0.15/GB, négligeable)
- **Incident runbook** documenté (`docs/runbooks/incident-*.md`) pour Neon down, Pusher down, Vercel region fail

### Total palier 5 (100 000 concurrents) : **~$595/mo** (+ ~$250 amortissement pen test annuel = $845/mo all-in)

---

## Palier 6 — 500 000 concurrents

Charnière vers Enterprise. Vercel Pro craque (limite concurrency fonctions), Neon Scale plafonne.

### Changements vs palier 5

| Service | Plan | Raison | Prix |
|---------|------|--------|------|
| **Vercel** | **Enterprise (entry)** | Pro limite ~1000 fonctions concurrentes par projet. Enterprise = illimité + dedicated edge + SLA 99.99% | **~$2 500** (négocié annuellement) |
| Vercel bandwidth/compute | Usage fort | ~50TB, ~500M invocations | **+$800** |
| **Neon** | **Business** | Scale max ~30 CU, Business dédie du CPU + replicas multiples + SLA | **$700** |
| Neon compute usage | | Autoscale 20-30 CU + 2-3 replicas | **+$800** |
| **Prisma Accelerate** | **Pro** | Volume requêtes dépasse Starter | **$250** |
| **Pusher Channels** | **Pro ou Enterprise entry** | Startup 500k connexions saturé | **$500-1 000** |
| **Upstash Redis** | **Pro 2K** | 2k cmds/s limite Pro → 2K pack | **$60** |
| Upstash QStash | Usage fort | | **$50** |
| **Resend** | **Scale** | Volume emails > 50k/mo | **$90 + ~$200 overage** |
| **Sentry** | **Business** | Team 50k/mo saturé | **$80 + ~$100 volume** |
| **Cloudflare** | **Business** | Bot management avancé + WAF managé + image resizing + load balancer | **$200** |
| **Datadog APM** | Pro | Sentry ne suffit plus, besoin APM infrastructure complet | **$200** (5 hosts × $31 arrondi) |
| Vercel Blob | Usage fort | | **$100** |
| Anthropic | Tier 3 | Volume élevé, peut-être négo custom | **$300** |
| AI Gateway | Enterprise entry | | **$100** |

### Architecture — changements

- **Multi-region deploy** Vercel (US, EU)
- **Neon multi-region replicas** pour latence < 50ms mondiale
- **Pusher Channels sharding** par région si audience mondiale
- **Datadog APM + Logs** centralisés
- **Runbooks d'incident** formalisés + astreinte 24/7

### Sécurité (ajouts)

- **SOC 2 Type 1 prep** démarré (~$10k one-shot audit + ~$500/mo Vanta/Drata compliance monitoring)
- **Pen test semi-annuel** (~$500/mo amorti)
- **Bug bounty** via HackerOne ou Intigriti (budget ~$500-2000/mo selon programme)
- **Cloudflare Bot Management** anti-scraping actif
- **WAF custom rules** Cloudflare : blocage tentatives SQLi, XSS, LFI
- **DLP / secrets scanning** en CI (Gitleaks gratuit + Trufflehog)

### Total palier 6 (500 000 concurrents) : **~$6 000-7 500/mo** (hors SOC2/bug bounty = +$1 000)

---

## Palier 7 — 1 000 000 concurrents

Scale extrême. Tout est custom, tous les contrats sont négociés. Les chiffres ci-dessous sont des fourchettes basses réalistes.

### Infrastructure

| Service | Plan | Prix |
|---------|------|------|
| **Vercel** | Enterprise (haut tier) | **$3 000-4 500** |
| Vercel bandwidth overage | 100TB+ | **+$1 500** |
| Vercel function usage | 1 milliard invocations | **+$1 000** |
| **Neon** | Business + negociation | **$700 + ~$2 000 usage** |
| **Prisma Accelerate** | Pro + volume | **$500** |
| **Pusher Channels** | Enterprise custom (1M+ connexions) | **$1 500** |
| **Upstash Redis** | Enterprise multi-region | **$280** |
| Upstash QStash | Volume fort | **$300** |
| **Resend** | Scale + overage massif | **$1 000** |
| **Sentry** | Business + volume | **$400** |
| **Cloudflare** | Enterprise | **$2 000** (minimum enterprise Cloudflare, peut monter) |
| **Datadog APM + Logs** | Full stack | **$400** |
| Vercel Blob | Volume fort | **$500** |
| **Anthropic** | Tier 4 ou custom | **$2 000** |
| AI Gateway | Enterprise | **$500** |
| **Mux Video / Cloudflare Stream** (si vidéo landing) | Pro/Enterprise | **$1 000** |

### Architecture — obligatoires

- **Multi-region actif/actif** (US-east, EU-west, AP-south selon trafic)
- **Neon read replicas dans chaque région**
- **Pusher Channels géo-distribués**
- **CDN edge custom** via Cloudflare + Vercel combo
- **Kill switch global** sur chaque feature via Edge Config

### Sécurité (palier Enterprise)

- **SOC 2 Type 2** complété (~$25k/an amorti)
- **Pen test trimestriel** (~$2 000/mo amorti)
- **Bug bounty programme public** avec rewards compétitifs (~$3 000-5 000/mo budget)
- **WAF Enterprise Cloudflare + rate-limit avancé par endpoint**
- **SIEM** (Datadog Security Monitoring ou Panther)
- **Équipe sécurité dédiée** (coût humain hors infra)
- **ISO 27001** selon marché (coût variable)

### Total palier 7 (1 000 000 concurrents) : **~$17 000-22 000/mo** (infra seule, hors SOC2/bug bounty/équipe)

---

## Récap rapide

| Palier | Concurrents | Prix mensuel total |
|--------|-------------|---------------------|
| 1 | 5 000 | **~$69** |
| 2 | 10 000 | **~$119** |
| 3 | 20 000 | **~$220** |
| 4 | 50 000 | **~$425** |
| 5 | 100 000 | **~$595** (+$250 amortissement pen test) |
| 6 | 500 000 | **~$6 000-7 500** |
| 7 | 1 000 000 | **~$17 000-22 000** |

**Phrase finale** : pour scale sereinement de 5k à 1M concurrents sans bug, sans problème d'instance et sans faille de sécurité, Momento doit prévoir un budget infra mensuel croissant de **~$69/mo au démarrage** jusqu'à **~$20 000/mo à pleine charge**, en suivant l'ordre des paliers ci-dessus pour n'ajouter un service payant qu'au moment où le palier précédent le rend strictement nécessaire.
