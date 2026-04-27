# Spec — Intégration RSVP du site événement vers l'espace client

**Date** : 2026-04-27
**Statut** : Validé en brainstorming, prêt pour planification d'implémentation
**Goal** : Remonter les réponses RSVP du site événement public vers l'espace client de l'organisateur, sans surcharger l'UX.

---

## 1. Problème

Aujourd'hui, le site événement public (`EventSite` + form RSVP) collecte 8 champs riches dans `EventRsvp` (nom, email, phone, attendingMain, attendingDayAfter, plusOneName, dietaryNeeds, message). **Aucun de ces champs ne remonte côté espace client.** L'organisateur ne voit ni les confirmations, ni les allergies, ni les messages.

En parallèle, l'organisateur saisit ses propres invités à la main dans `/guests` (modèle `Guest`), avec juste un nom + statut.

Les deux sources ne se parlent pas. Le user ne saisit pas systématiquement email/phone à la main → tout matching automatique échouerait → unification = friction sans bénéfice.

## 2. Décisions structurantes

| # | Décision | Raison |
|---|----------|--------|
| 1 | **2 sections distinctes** : Mes invités (manuel) + Réponses du site (RSVP form) | Sans email/phone côté manuel, le match auto échoue 95% du temps |
| 2 | **Pont optionnel** : bouton "Lier à mes invités" sur chaque RSVP | Permet à l'organisateur de relier manuellement quand pertinent |
| 3 | **KPI haut = source unique** (RSVP site uniquement) | Évite le double comptage entre prévisions et confirmations réelles |
| 4 | **Toggle Cards / Liste** sur chaque section | Cards pour parcours rapide (10-30 invités), Liste pour vue exhaustive (250+) |
| 5 | **Export CSV / Excel / PDF** depuis vue Liste | Documents officiels pour traiteur, plan de table, archivage |
| 6 | **Édition inline** partout | Corriger fautes de frappe sans modal |
| 7 | **Pas de migration de schéma `Guest`** | Tout vit dans `EventRsvp` côté site ; `Guest.linkedRsvpId` ajouté pour le pont |

## 3. Architecture data

### Modèles existants (inchangés)

```prisma
model Guest {
  id          String   @id @default(cuid())
  workspaceId String
  plannerId   String?
  name        String
  email       String?
  phone       String?
  rsvp        String   @default("pending")  // yes | no | pending
  plusOne     Boolean  @default(false)
  // ...
  linkedRsvpId String?  // ← NOUVEAU : pont vers EventRsvp si lié manuellement
}

model EventRsvp {
  id                String    @id @default(cuid())
  eventSiteId       String
  guestName         String
  guestEmail        String?
  guestPhone        String?
  attendingMain     Boolean
  attendingDayAfter Boolean?
  plusOneName       String?
  dietaryNeeds      String?
  message           String?
  ipHash            String
  userAgent         String?
  createdAt         DateTime  @default(now())
}

model EventSite {
  // ... champs existants
  viewCount Int @default(0)  // ← NOUVEAU : tracking vues publiques (hors owner)
}
```

### Migration

- `Guest.linkedRsvpId` : nullable, pas de backfill nécessaire (null = non lié)
- `EventSite.viewCount` : default 0, pas de backfill historique

## 4. Page `/guests` — structure UI

```
┌─────────────────────────────────────────────────┐
│ Mes invités                       [+ Nouveau]   │
├─────────────────────────────────────────────────┤
│  240 vues  ·  53 confirmés  ·  18 +1            │  ← KPI = EventRsvp uniquement
├─────────────────────────────────────────────────┤
│ [◧ Cards] [☰ Liste]              [⬇ Exporter ▼]│  ← Toggle vue + export
├─────────────────────────────────────────────────┤
│  ── SECTION 1 : Mes invités (perso) ──          │
│  Liste légère, ajout 1-input                    │
├─────────────────────────────────────────────────┤
│  ── SECTION 2 : Réponses du site ──             │
│  Cards minimales OU tableau dense selon toggle  │
└─────────────────────────────────────────────────┘
```

Pas de sidebar (suppression de `DashSidebar` sur cette page). Layout pleine largeur.

## 5. Section 1 — Mes invités (manuel)

### Comportement
- **Ajout ultra-rapide** : input "Tante Fatima" → Enter → ajouté instantanément
- Aucun champ obligatoire au-delà du nom
- **Card minimale** : nom · statut perso (✓ confirmé / ⏳ relancer / ✗ refuse / 📞 invité) · note libre
- Édition inline : clic nom = renommer, clic statut = cycle entre les 4 états
- Statuts utiles : la liste sert de checklist mentale (qui inviter, qui relancer)

### Card vue
```
┌─────────────────────────────┐
│ Tante Fatima         ✓      │
│ note libre optionnelle      │
└─────────────────────────────┘
```

### Tableau vue
| Statut | Nom | Note |
|--------|-----|------|
| ✓ | Tante Fatima | venue avec mari |
| ⏳ | Mehdi cousin | à rappeler |

## 6. Section 2 — Réponses du site (RSVP form)

### Card minimale (champs vides masqués)
```
┌──────────────────────────────────┐
│ Karim Bennani         ✓          │
│ +1  Sara Mokri                   │
│ 🍽  Sans gluten                  │
│ 💬  "On a hâte, merci !"         │
└──────────────────────────────────┘
```

**Champs affichés** : nom · check ✓/✗ · ligne +1 (si oui, avec nom) · ligne allergie (si remplie) · ligne message (si rempli).

**Champs cachés en card** (mais éditables en vue Liste, et stockés en DB) : email · phone · attendingDayAfter · ipHash · userAgent · createdAt.

**Champs jamais affichés** : ipHash, userAgent (techniques anti-spam, RGPD).

### Tableau vue (dense)
| ✓ | Nom | +1 | Nom +1 | Allergie | Message | Lendemain |
|---|-----|-----|--------|----------|---------|-----------|
| ✓ | Karim Bennani | ✓ | Sara Mokri | Sans gluten | "On a hâte..." | ✓ |
| ✗ | Laila Idrissi | — | — | — | — | — |

- Lignes ~36px de haut, sticky header
- Tronquage message à ~40 chars + tooltip au hover
- Tri sur colonnes (clic header)
- Édition inline (clic cellule)

### Pont vers Mes invités
Petit bouton "✓ Lier à mes invités" en hover de chaque card (et bouton dans tableau) :
- Ouvre dropdown des Guest existants + option "Créer un invité"
- Si lié → card RSVP affiche chip "→ Tante Fatima" + Guest passe à statut "Confirmé via site ✓" avec lien retour vers la card RSVP

Optionnel, jamais obligatoire.

## 7. Toggle vue Cards ↔ Liste

- Boutons icône en haut de page : `[◧ Cards] [☰ Liste]`
- Préférence stockée `localStorage.momento_guests_view`
- S'applique aux 2 sections en même temps (cohérence)
- Toggle fluide, pas de reload

## 8. Export

Bouton `⬇ Exporter ▼` → menu :

### CSV — `GET /api/planners/[id]/guests/export?format=csv`
- Génération server-side, IDOR check
- Une feuille = Mes invités + Réponses site concaténées avec colonne "Source"
- Colonnes : Source · Statut · Nom · Email · Téléphone · +1 · Nom +1 · Allergie · Message · Lendemain · Date réponse
- ~30 lignes de code

### Excel — `GET /api/planners/[id]/guests/export?format=xlsx`
- Lib `xlsx` (sheetjs) en **dynamic import** (pas dans le bundle global)
- 2 feuilles séparées : "Mes invités" + "Réponses site"
- ~50 lignes

### PDF — print CSS
- `window.print()` côté client avec `@media print` ciblé
- Layout tableau propre : header Momento + nom événement + date export
- **Pas de Puppeteer** (lourd, lent sur Vercel)
- PDF "moche mais fonctionnel" assumé en MVP

## 9. API

### Routes nouvelles
- `GET /api/planners/[id]/rsvps` → liste EventRsvp + stats (vues, confirmés, +1)
- `PATCH /api/rsvps/[id]` → édition inline EventRsvp (IDOR : ownership via EventSite.planner.userId)
- `POST /api/guests/[id]/link` → lier un Guest à un EventRsvp (set `linkedRsvpId`)
- `GET /api/planners/[id]/guests/export?format=csv|xlsx` → exports

### Routes existantes étendues
- `GET /api/planners/[id]/dashboard-data` → ajoute `rsvps` + `viewCount` aux stats du widget invités dashboard
- `GET /api/event-site/[id]` (route publique de visualisation) → tracking viewCount :
  ```ts
  const session = await auth().catch(() => null)
  const isOwner = session?.user?.id === eventSite.planner.userId
  const isBot = /bot|crawler|spider|google/i.test(userAgent ?? "")
  if (!isOwner && !isBot) {
    await prisma.eventSite.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  }
  ```

### Sécurité
- Toutes les routes filtrent par `userId` (IDOR-by-default)
- `PATCH /api/rsvps/[id]` : check `eventRsvp.eventSite.planner.userId === session.user.id`
- Export : pareil, IDOR sur le planner

## 10. Dashboard widget

Le widget `InvitesWidget` du dashboard est réécrit pour consommer la nouvelle data :
- 3 KPI vedette identiques à la page `/guests` (`240 vues · 53 confirmés · 18 +1`)
- 3 dernières réponses (avatar + nom + statut)
- CTA "Voir tout" → `/guests`
- Hydraté via `dashboard-data` (pas de fetch direct)

Respecte le `widget-contract.md`.

## 11. Risques (associé)

| # | Risque | Mitigation |
|---|--------|------------|
| 1 | viewCount surévalué (refresh, bots non détectés) | UA filter MVP, raffiner avec Plausible plus tard |
| 2 | xlsx alourdit le bundle | Dynamic import, route runtime Node-only |
| 3 | PDF moche pas brandé | Assumé en MVP, jsPDF ou Puppeteer plus tard si besoin |
| 4 | Lien manuel Guest ↔ RSVP peu utilisé | Option discrète, pas obligatoire, ne bloque rien si ignoré |
| 5 | Tableau 250 lignes lent à render | Virtualisation (react-window) si > 100 lignes |

## 12. Hors-scope (pour ce spec)

- Notifications email/push à l'organisateur quand nouvelle RSVP arrive
- Statut "lu / non lu" sur les RSVP
- Réponse de l'organisateur à un message RSVP (pas de canal retour)
- Reminder automatique aux invités qui n'ont pas répondu
- Plan de table visuel (drag-and-drop)

Ces features sont notées dans le backlog produit mais ne font pas partie de ce chantier.

## 13. Fichiers touchés

### Création
- `src/app/api/planners/[id]/rsvps/route.ts` (GET)
- `src/app/api/rsvps/[id]/route.ts` (PATCH, DELETE)
- `src/app/api/guests/[id]/link/route.ts` (POST)
- `src/app/api/planners/[id]/guests/export/route.ts` (GET csv/xlsx)
- `src/components/guests/RsvpCard.tsx`
- `src/components/guests/RsvpTable.tsx`
- `src/components/guests/GuestCard.tsx`
- `src/components/guests/GuestTable.tsx`
- `src/components/guests/GuestsExportMenu.tsx`
- `src/components/guests/ViewToggle.tsx`

### Modification
- `prisma/schema.prisma` — ajout `Guest.linkedRsvpId` + `EventSite.viewCount`
- `src/app/guests/page.tsx` — refonte complète layout 2 sections
- `src/app/api/planners/[id]/dashboard-data/route.ts` — ajout stats RSVP
- `src/app/api/event-site/[id]/route.ts` (ou équivalent) — tracking viewCount
- `src/app/dashboard/DashboardClient.tsx` — réécriture `InvitesWidget`

## 14. Critères de succès

- [ ] Une nouvelle RSVP apparaît instantanément (ou après refresh max) sur `/guests`
- [ ] L'organisateur peut visualiser, éditer, supprimer une RSVP sans quitter `/guests`
- [ ] L'organisateur peut basculer Cards ↔ Liste sans perdre les filtres
- [ ] L'organisateur peut exporter ses 250 invités en CSV en < 2s
- [ ] Le viewCount s'incrémente uniquement pour les visiteurs externes (pas l'owner)
- [ ] Toutes les routes API filtrent par `userId` (IDOR)
- [ ] Le widget dashboard reflète la même source que `/guests`
- [ ] Aucun double comptage entre Mes invités et Réponses site dans les KPI
