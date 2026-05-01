# Pressure Test — Momento
*Framework Paul Graham · 5 étapes · Avril 2026*

---

## Step 1 — Pressure Test de l'idée

**Core Assumption :**
Les mariées marocaines vont changer de comportement (Instagram + WhatsApp → Momento) si les outils de gestion sont suffisamment supérieurs ET si les prestas présents sont réels et accessibles.

### Fatal Flaws (par ordre de dangerosité)

1. **Cold start existentiel.** Les 1000+ prestas "scrapés" ne savent pas que Momento existe. Une bride qui découvre un presta via Momento et lui envoie un message pour ne jamais avoir de réponse → abandon immédiat + perte de confiance irréversible. Tu n'as pas 1000 prestas partenaires. Tu as 1000 fiches vides.

2. **Le paywall est sur le mauvais levier.** Payer 200 MAD/mois pour contacter un presta qui est aussi sur Instagram et répond gratuitement là-bas → friction fatale. La bride va contourner. Le paywall doit créer une valeur que personne d'autre ne donne, pas bloquer un accès qu'Instagram offre gratis.

3. **Les outils ne sont pas assez collants seuls.** Google Sheets + Trello + WhatsApp font "la même chose" pour 0 MAD. Pour que ces outils soient un cheval de Troie, ils doivent être 10× meilleurs, pas juste "pratiques".

4. **Côté presta : valeur nulle à J0.** 100 MAD d'inscription pour accéder à une plateforme avec 0 clients. Un presta rationnel dit non. Tu dois d'abord prouver des leads avant de charger.

5. **Inertie : la douleur n'est pas assez aiguë.** Les mariages se font depuis des siècles sans Momento. La friction est réelle mais supportable. Ce n'est pas une urgence.

### Problem Validation
Réel. Fréquent. Mais modéré en intensité — painkiller conditionnel, pas automatique.

### Founder-Market Fit
Fort côté tech, incertain côté terrain. L'avantage défendable d'une marketplace est opérationnel : acquérir et engager les deux côtés. Yazid construit, mais connaît-il les prestas marocains intimement ? A-t-il organisé ou vécu un mariage marocain de l'intérieur ?

### Verdict brutal
**Idée forte sur papier, exécution à risque élevé.** Marché réel, concurrence faible, timing bon. Mais sans résoudre le cold start en premier, tout le reste est beau et inutile. La question n'est pas "est-ce que l'idée est bonne" — elle l'est — c'est "comment tu obtiens les 10 premiers prestas réactifs et les 10 premières brides actives avant de scaler quoi que ce soit."

---

## Step 2 — Validation du vrai problème

### Douleur spécifique

- **Bride :** "Je passe des heures sur Instagram, je sais pas si le presta est fiable, je compare pas les prix, et je gère tout sur WhatsApp avec 15 personnes différentes en parallèle." Fréquence : quotidienne pendant 6-12 mois. Intensité : haute (c'est le mariage, l'event de vie).
- **Presta :** "50% de mes leads WhatsApp ne mènent nulle part — des heures perdues. En basse saison j'ai rien, en haute saison j'ai plus le temps de gérer."

### Profil early adopter

- **Bride :** Femme 26-34 ans, Casablanca/Rabat, active pro, mariage dans 3-7 mois, pas de planner, gère déjà son budget sur Excel mais trouve ça pénible, suit des comptes mariage sur Instagram.
- **Presta :** Photographe ou DJ 28-38 ans, Casablanca, compte Instagram actif avec 2k-15k followers, zéro site web, cherche à stabiliser son carnet en basse saison.

### 5 Discovery Questions (comportement passé, pas intention future)

1. "Raconte-moi comment tu as trouvé ton traiteur — depuis le début jusqu'à la signature."
2. "Quel moment de l'organisation t'a le plus stressée et fait perdre du temps ?"
3. "Qu'est-ce que tu as essayé pour t'organiser — Excel, groupes WhatsApp, autre chose ?"
4. "Est-ce que tu as déjà perdu ou failli perdre un presta que tu voulais parce que la communication était trop chaotique ?"
5. "Qu'est-ce qui t'aurait empêchée d'utiliser une app dédiée mariage si elle avait existé ?"

### Critères de validation

- 15+ brides confirmant gérer leur mariage dans 3+ endroits différents → problème réel
- 5+ brides ayant manqué ou failli manquer un presta à cause de la désorganisation → urgence réelle
- 5+ prestas estimant perdre >30% de leur temps en leads non-qualifiés → painkiller côté presta
- Signal fort : quelqu'un qui paie déjà pour réduire ce chaos (planner, groupe FB premium)

### Verdict Vitamin vs Painkiller
**Painkiller conditionnel** — pour la bride dans les 4-6 mois précédant le mariage (intensité maximale, chaque semaine compte). Pour le presta en basse saison (zéro revenu = douleur aiguë). Mais vitamin pour le presta en haute saison. **Stratégie : acquérir les brides d'abord, les prestas en basse saison (automne-hiver) en second.**

---

## Step 3 — Carte de la concurrence réelle

### Comportement actuel (le vrai concurrent #1)

- **Bride :** Instagram (découverte) → WhatsApp (contact) → Google Sheets (budget) → groupes Facebook mariage Maroc (avis) → mère/belle-mère (validation) → bouche-à-oreille
- **Presta :** Instagram (vitrine) + WhatsApp (gestion devis) + réseau personnel

### Concurrents directs

| Concurrent | Menace réelle | Faiblesses exploitables |
|---|---|---|
| Mariages.net / Zankyou | Faible | UX desktop datée, zéro outil, quasi-absent au Maroc |
| Wedding planners | Faible | 5-15% du budget, inaccessible classe moyenne |
| Hmizate | Nulle | Pas spécialisé mariage |

### Concurrents indirects

- **Instagram + DMs :** gratuit, 90% des prestas y sont — c'est le vrai benchmark
- **Google Sheets :** budget et listes invités pour 0 MAD
- **Trello/Notion :** gestion tâches
- **Groupes Facebook mariage Maroc :** 50k+ membres, recommandations et avis gratuits

### Le vrai ennemi
**Instagram.** Pas Mariages.net. Instagram a les photos, les avis (via tags), les DMs, les stories, et la masse critique de tous les prestas marocains actifs. C'est gratuit et ancré culturellement.

### Différenciation réelle
Une seule chose qu'Instagram ne fera jamais : **l'intégration complète** (budget + invités + contrats + messagerie structurée + timeline + comparaison prestas depuis un seul endroit). C'est le seul levier qui justifie le switch.

**Implication stratégique :** Le pitch ne devrait pas être "trouve des prestas" (Instagram le fait). Il devrait être "organise ton mariage entièrement depuis un seul endroit, et tes prestas y sont intégrés."

---

## Step 4 — Les 10 premiers clients

### Où ils sont maintenant

- **Brides :** groupes Facebook "Mariage Maroc", "Wedding Casablanca", "Mariage Rabat" (certains à 50k+ membres), hashtags Instagram #mariagemaroc #mariageMaroc2026
- **Prestas :** groupes Facebook pro "Photographes mariage Maroc", "DJ mariage Casablanca", leurs propres DMs Instagram

### Approche manuelle (sans automation, sans pub)

1. Rejoindre les 5 plus grands groupes FB mariage Maroc en tant que personne, pas marque
2. Observer 2-3 jours, identifier posts de brides stressées, questions sur les prestas
3. Répondre personnellement avec de la valeur réelle, puis mentionner Momento
4. Contacter 20 prestas Instagram avec compte actif mais zéro site web — profil vérifié gratuit en échange de réactivité

### Premier message bride

> *"Salam [Prénom], j'ai vu ton post dans [groupe] — on lance Momento, une app pour organiser les mariages marocains depuis un seul endroit (budget, prestas vérifiés, invités, tout ça intégré). On cherche 10 mariées à tester gratuitement avant le lancement officiel, en échange de feedback honnête. Si ça t'intéresse je t'envoie l'accès direct."*

### Premier message presta

> *"Salam [Prénom], j'ai vu ton travail sur Instagram — vraiment beau. On lance Momento, une plateforme pour connecter les mariées marocaines avec des prestas vérifiés. On cherche 10 prestas pionniers pour créer leur profil gratuitement avant l'ouverture. Pas de commission, tu gardes 100% de tes devis. Tu aurais 15 min pour qu'on en parle ?"*

### Critères de succès (comportement, pas intention)

- **Bride :** crée compte → ajoute un événement → met au moins 1 presta en favoris → revient J+3 sans relance
- **Presta :** complète son profil (photos + packages + tarif visible) → répond à une bride dans les 24h
- **Signal fort :** une bride contacte un presta VIA Momento (pas par Instagram en parallèle)

### Plan semaine par semaine

| Semaine | Actions |
|---|---|
| S1 | Rejoindre 10 groupes FB, identifier 30 brides candidates, contacter manuellement 20 |
| S2 | Contacter 15 prestas Instagram qualifiés, onboarder les 5 premiers volontaires |
| S3 | Lancer les 10 premières brides, observer chaque friction en direct |
| S4 | Entretien individuel avec chaque bride et presta actif — bilan qualitatif complet |

---

## Step 5 — MVP en 2 semaines

### Core Assumption à tester
Une bride marocaine utilise Momento pour organiser son mariage SI les outils sont supérieurs à Excel ET si les prestas affichés sont réels, réactifs, et joignables via la plateforme.

> **Bonne nouvelle : le MVP technique existe déjà.** Auth, événement, budget, messagerie, profils prestas — tout est là. Le vrai MVP à construire n'est pas technique, c'est opérationnel.

### Feature set minimum (doit FONCTIONNER parfaitement)

- Auth (signup/login) ✅
- Créer un événement ✅
- Budget tracker ✅
- Favoriser un presta ✅
- Messagerie bride → presta ✅
- **10-15 profils prestas RÉELS, briefés, engagés à répondre dans les 24h ← manquant**

### Ce qui est coupé

- Site événement / faire-part personnalisé
- Paywall (suspendu pour les 10 premiers)
- Widget aperçu Pro avec données démo (confus, pas de valeur Day 1)
- Onboarding 10 familles événements (simplifié à 3 types)
- SEO, landing page optimisée

### Test Criteria (comportement, pas ressenti)

- 3 brides sur 10 contactent un presta VIA Momento (pas via Instagram en parallèle)
- 1 presta sur 5 répond à une bride dans les 24h
- 5 brides sur 10 reviennent spontanément J+3 sans relance

### Plan 14 jours

| Jours | Action |
|---|---|
| J1-J2 | Contacter et briefer 15 prestas réels, convaincre les 10 meilleurs, compléter leurs profils |
| J3-J5 | Identifier 30 brides dans les groupes FB, contacter manuellement 20 |
| J6-J7 | Onboarder les 10 premières brides, observer chaque friction en direct |
| J8-J10 | Première mise en relation bride→presta via Momento — documenter chaque friction |
| J11-J12 | Appeler 5 brides et 3 prestas — entretiens qualitatifs |
| J13-J14 | Corriger les 3 frictions majeures, mesurer taux de retour J+3 |

---

## Verdict global

**Ce que tu as :** bonne idée, bon timing, bon marché, MVP technique prêt.

**Ce qui manque :** des prestas réels et engagés AVANT de lancer les brides. Tout le reste s'effondre sans ça. Ce n'est pas un problème de code — c'est 2 semaines de terrain.

**Priorité #1 avant tout :** aller chercher 10 prestas qui s'engagent à répondre dans les 24h. Pas de scraping. Des gens qui savent qu'ils sont sur Momento et qui veulent des clients. Sans ça, le reste ne sert à rien.

---

*Généré avec le framework Paul Graham Pressure Test · Momento · Avril 2026*
