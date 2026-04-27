# RSVP Espace Client — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remonter les réponses RSVP du site événement public vers l'espace client (`/guests`), avec 2 sections distinctes (Mes invités manuel + Réponses site), toggle Cards/Liste, export CSV/Excel/PDF, et widget dashboard cohérent.

**Architecture:** Pas de migration data destructive. `Guest` reste source du manuel, `EventRsvp` reste source des réponses publiques. Pont optionnel via `Guest.linkedRsvpId`. Nouveau endpoint consolidé `GET /api/planners/[id]/rsvps`. Tracking `EventSite.viewCount` côté route publique avec exclusion owner via session.

**Tech Stack:** Next.js 16 App Router, Prisma 7 (`@/generated/prisma/client`), NextAuth v5 beta (JWT), Zod, React 19, Tailwind v4, `xlsx` (sheetjs) en dynamic import pour Excel, print-CSS pour PDF.

**Référence spec:** [`docs/superpowers/specs/2026-04-27-rsvp-espace-client-design.md`](../specs/2026-04-27-rsvp-espace-client-design.md)

---

## File Structure

### Création
- `src/app/api/planners/[id]/rsvps/route.ts` — GET liste RSVP + stats viewCount
- `src/app/api/rsvps/[id]/route.ts` — PATCH/DELETE RSVP individuel (édition inline)
- `src/app/api/guests/[id]/link/route.ts` — POST lier Guest à un EventRsvp
- `src/app/api/planners/[id]/guests/export/route.ts` — GET export CSV/XLSX
- `src/lib/validations.ts` — étendre avec `RsvpPatchSchema`, `GuestLinkSchema`
- `src/components/guests/RsvpCard.tsx` — card minimale RSVP
- `src/components/guests/RsvpTable.tsx` — vue tableau dense RSVP
- `src/components/guests/GuestCard.tsx` — card minimale Guest manuel
- `src/components/guests/GuestTable.tsx` — vue tableau Guest manuel
- `src/components/guests/GuestsExportMenu.tsx` — menu export CSV/Excel/PDF
- `src/components/guests/ViewToggle.tsx` — toggle Cards/Liste
- `src/components/guests/StatsBar.tsx` — bandeau 3 KPI
- `src/components/guests/LinkRsvpDialog.tsx` — dropdown "Lier à mes invités"

### Modification
- `prisma/schema.prisma` — ajout `Guest.linkedRsvpId String?` + `EventSite.viewCount Int @default(0)`
- `src/app/guests/page.tsx` — refonte complète (suppression sidebar, layout 2 sections)
- `src/app/api/planners/[id]/dashboard-data/route.ts` — ajout stats RSVP au payload
- `src/app/api/event-site/[id]/route.ts` — incrément viewCount sur GET (exclusion owner+bots)
- `src/app/dashboard/DashboardClient.tsx` — réécriture `InvitesWidget` consommant nouveaux KPI

---

## Task 1: Migration schéma Prisma

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Ajouter `linkedRsvpId` au modèle Guest**

Dans `prisma/schema.prisma`, repérer le modèle `Guest` (ligne ~184) et ajouter le champ après `inviteSent` :

```prisma
model Guest {
  id          String   @id @default(cuid())
  workspaceId String
  plannerId   String?
  name        String
  email       String?
  phone       String?
  rsvp        String   @default("pending")
  plusOne     Boolean  @default(false)
  tableNumber Int?
  notes       String?
  city        String?
  inviteSent  Boolean  @default(false)
  linkedRsvpId String? // ← AJOUT : pont vers EventRsvp si lié manuellement
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Ajouter `viewCount` au modèle EventSite**

Dans le modèle `EventSite`, ajouter le champ avant `createdAt` :

```prisma
viewCount Int @default(0)
```

- [ ] **Step 3: Pousser le schéma vers Supabase**

Run :
```bash
DATABASE_URL=$DIRECT_URL npx prisma db push
```
Expected: `🚀 Your database is now in sync with your Prisma schema.`

- [ ] **Step 4: Régénérer le client Prisma**

Run :
```bash
npx prisma generate
```
Expected: `✔ Generated Prisma Client`

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): Guest.linkedRsvpId + EventSite.viewCount"
```

---

## Task 2: Validations Zod

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Ajouter `RsvpPatchSchema` et `GuestLinkSchema`**

Dans `src/lib/validations.ts`, ajouter à la fin du fichier :

```ts
import { z } from "zod"

export const RsvpPatchSchema = z.object({
  guestName: z.string().min(1).max(120).trim().optional(),
  guestEmail: z.string().email().nullable().optional(),
  guestPhone: z.string().min(4).max(40).nullable().optional(),
  attendingMain: z.boolean().optional(),
  attendingDayAfter: z.boolean().nullable().optional(),
  plusOneName: z.string().max(120).nullable().optional(),
  dietaryNeeds: z.string().max(300).nullable().optional(),
  message: z.string().max(1000).nullable().optional(),
}).strict()

export const GuestLinkSchema = z.object({
  rsvpId: z.string().cuid(),
}).strict()
```

- [ ] **Step 2: Vérifier qu'il n'y a pas d'import en doublon**

Si `import { z }` est déjà au top du fichier, ne pas le redéclarer.

- [ ] **Step 3: Vérifier la compilation**

Run :
```bash
npx tsc --noEmit
```
Expected: 0 erreur sur `src/lib/validations.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat(validations): RsvpPatchSchema + GuestLinkSchema"
```

---

## Task 3: Route GET /api/planners/[id]/rsvps

**Files:**
- Create: `src/app/api/planners/[id]/rsvps/route.ts`

- [ ] **Step 1: Créer la route GET**

```ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  // IDOR : planner doit appartenir au user
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true, eventSite: { select: { id: true, viewCount: true } } },
  })
  if (!planner || planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const eventSiteId = planner.eventSite?.id
  if (!eventSiteId) {
    return NextResponse.json({
      rsvps: [],
      stats: { viewCount: 0, confirmed: 0, plusOnes: 0, total: 0 },
    })
  }

  const rsvps = await prisma.eventRsvp.findMany({
    where: { eventSiteId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      guestPhone: true,
      attendingMain: true,
      attendingDayAfter: true,
      plusOneName: true,
      dietaryNeeds: true,
      message: true,
      createdAt: true,
    },
  })

  const confirmed = rsvps.filter(r => r.attendingMain).length
  const plusOnes = rsvps.filter(r => r.attendingMain && r.plusOneName && r.plusOneName.trim().length > 0).length

  return NextResponse.json({
    rsvps,
    stats: {
      viewCount: planner.eventSite?.viewCount ?? 0,
      confirmed,
      plusOnes,
      total: rsvps.length,
    },
  })
}
```

- [ ] **Step 2: Tester manuellement**

Run dev server `npm run dev`, login, puis :
```bash
curl http://localhost:3001/api/planners/<plannerId>/rsvps -H "Cookie: <session-cookie>"
```
Expected: JSON `{ rsvps: [...], stats: { viewCount, confirmed, plusOnes, total } }`.

- [ ] **Step 3: Vérifier IDOR avec un autre user**

Tester avec un plannerId qui n'appartient pas au user → 403 Forbidden.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/planners/[id]/rsvps/route.ts
git commit -m "feat(api): GET /api/planners/[id]/rsvps avec stats viewCount/confirmed/plusOnes"
```

---

## Task 4: Route PATCH/DELETE /api/rsvps/[id]

**Files:**
- Create: `src/app/api/rsvps/[id]/route.ts`

- [ ] **Step 1: Créer la route PATCH + DELETE**

```ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"
import { RsvpPatchSchema } from "@/lib/validations"

async function getUserId(): Promise<string | null> {
  if (IS_DEV) {
    const s = await requireSession()
    return s.user.id
  }
  const session = await auth()
  return session?.user?.id ?? null
}

async function checkOwnership(rsvpId: string, userId: string) {
  const rsvp = await prisma.eventRsvp.findUnique({
    where: { id: rsvpId },
    select: { eventSite: { select: { planner: { select: { userId: true } } } } },
  })
  return rsvp?.eventSite?.planner?.userId === userId
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await checkOwnership(id, userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = RsvpPatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  const updated = await prisma.eventRsvp.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await checkOwnership(id, userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.eventRsvp.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Tester PATCH manuellement**

```bash
curl -X PATCH http://localhost:3001/api/rsvps/<rsvpId> \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"guestName":"Karim B."}'
```
Expected: JSON RSVP modifié.

- [ ] **Step 3: Tester DELETE**

```bash
curl -X DELETE http://localhost:3001/api/rsvps/<rsvpId> -H "Cookie: <session>"
```
Expected: `{ ok: true }`.

- [ ] **Step 4: Vérifier IDOR**

PATCH/DELETE sur un rsvpId d'un autre user → 403 Forbidden.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/rsvps/[id]/route.ts
git commit -m "feat(api): PATCH/DELETE /api/rsvps/[id] avec IDOR ownership"
```

---

## Task 5: Route POST /api/guests/[id]/link

**Files:**
- Create: `src/app/api/guests/[id]/link/route.ts`

- [ ] **Step 1: Créer la route POST**

```ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"
import { GuestLinkSchema } from "@/lib/validations"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: guestId } = await params

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = GuestLinkSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })

  // IDOR Guest
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { workspace: { select: { userId: true } } },
  })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // IDOR EventRsvp
  const rsvp = await prisma.eventRsvp.findUnique({
    where: { id: parsed.data.rsvpId },
    select: { attendingMain: true, eventSite: { select: { planner: { select: { userId: true } } } } },
  })
  if (!rsvp || rsvp.eventSite.planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: {
      linkedRsvpId: parsed.data.rsvpId,
      rsvp: rsvp.attendingMain ? "yes" : "no",
    },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Créer la route DELETE pour délier**

Dans le même fichier, ajouter :

```ts
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: guestId } = await params

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { workspace: { select: { userId: true } } },
  })
  if (!guest || guest.workspace.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: { linkedRsvpId: null },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 3: Tester**

```bash
curl -X POST http://localhost:3001/api/guests/<guestId>/link \
  -H "Content-Type: application/json" -H "Cookie: <session>" \
  -d '{"rsvpId":"<rsvpId>"}'
```
Expected: Guest mis à jour avec `linkedRsvpId` set + `rsvp` synchronisé.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/guests/[id]/link/route.ts
git commit -m "feat(api): POST/DELETE /api/guests/[id]/link — pont Guest <-> EventRsvp"
```

---

## Task 6: Route GET /api/planners/[id]/guests/export

**Files:**
- Create: `src/app/api/planners/[id]/guests/export/route.ts`

- [ ] **Step 1: Créer la route avec format CSV**

```ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export const runtime = "nodejs"

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return ""
  const s = String(v)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params
  const url = new URL(req.url)
  const format = url.searchParams.get("format") ?? "csv"

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true, workspaceId: true, eventSite: { select: { id: true } } },
  })
  if (!planner || planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [guests, rsvps] = await Promise.all([
    prisma.guest.findMany({
      where: { workspaceId: planner.workspaceId, plannerId },
      orderBy: { createdAt: "desc" },
    }),
    planner.eventSite
      ? prisma.eventRsvp.findMany({
          where: { eventSiteId: planner.eventSite.id },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  if (format === "csv") {
    const header = ["Source", "Statut", "Nom", "Email", "Téléphone", "+1", "Nom +1", "Allergie", "Message", "Lendemain", "Date"]
    const lines = [header.map(csvEscape).join(",")]
    for (const g of guests) {
      lines.push([
        "Mes invités", g.rsvp, g.name, g.email ?? "", g.phone ?? "",
        g.plusOne ? "oui" : "", "", "", g.notes ?? "", "", g.createdAt.toISOString(),
      ].map(csvEscape).join(","))
    }
    for (const r of rsvps) {
      lines.push([
        "Site", r.attendingMain ? "yes" : "no", r.guestName, r.guestEmail ?? "", r.guestPhone ?? "",
        r.plusOneName ? "oui" : "", r.plusOneName ?? "",
        r.dietaryNeeds ?? "", r.message ?? "",
        r.attendingDayAfter ? "oui" : (r.attendingDayAfter === false ? "non" : ""),
        r.createdAt.toISOString(),
      ].map(csvEscape).join(","))
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="invites-${plannerId}.csv"`,
      },
    })
  }

  if (format === "xlsx") {
    const XLSX = (await import("xlsx")).default ?? (await import("xlsx"))
    const wb = XLSX.utils.book_new()

    const guestRows = guests.map(g => ({
      Statut: g.rsvp,
      Nom: g.name,
      Email: g.email ?? "",
      Téléphone: g.phone ?? "",
      "+1": g.plusOne ? "oui" : "",
      Note: g.notes ?? "",
      Date: g.createdAt.toISOString(),
    }))
    const rsvpRows = rsvps.map(r => ({
      Statut: r.attendingMain ? "yes" : "no",
      Nom: r.guestName,
      Email: r.guestEmail ?? "",
      Téléphone: r.guestPhone ?? "",
      "+1": r.plusOneName ? "oui" : "",
      "Nom +1": r.plusOneName ?? "",
      Allergie: r.dietaryNeeds ?? "",
      Message: r.message ?? "",
      Lendemain: r.attendingDayAfter ? "oui" : (r.attendingDayAfter === false ? "non" : ""),
      Date: r.createdAt.toISOString(),
    }))

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(guestRows), "Mes invités")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rsvpRows), "Réponses site")

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="invites-${plannerId}.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: "Format non supporté." }, { status: 400 })
}
```

- [ ] **Step 2: Installer xlsx**

Run :
```bash
npm install xlsx
```
Expected: package added.

- [ ] **Step 3: Tester CSV**

Naviguer dans le navigateur :
```
http://localhost:3001/api/planners/<plannerId>/guests/export?format=csv
```
Expected: téléchargement du fichier .csv avec lignes Mes invités + Site.

- [ ] **Step 4: Tester XLSX**

```
http://localhost:3001/api/planners/<plannerId>/guests/export?format=xlsx
```
Expected: téléchargement .xlsx, ouvrable dans Excel/Libreoffice avec 2 feuilles.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/planners/[id]/guests/export/route.ts package.json package-lock.json
git commit -m "feat(api): export invités CSV + XLSX (xlsx en dynamic import)"
```

---

## Task 7: Tracking viewCount sur GET /api/event-site/[id]

**Files:**
- Modify: `src/app/api/event-site/[id]/route.ts`

- [ ] **Step 1: Lire la fonction GET existante**

Run :
```bash
grep -n "export async function GET" src/app/api/event-site/[id]/route.ts
```
Identifier la signature actuelle.

- [ ] **Step 2: Ajouter le tracking viewCount au début de GET**

Avant le `return NextResponse.json(...)` final dans GET, ajouter (après la lecture de l'`eventSite`) :

```ts
import { auth } from "@/lib/auth"

// ... dans la fonction GET, après avoir récupéré eventSite avec planner.userId :
try {
  const session = await auth().catch(() => null)
  const isOwner = session?.user?.id === eventSite.planner.userId
  const ua = req.headers.get("user-agent") ?? ""
  const isBot = /bot|crawler|spider|google|bing|yahoo|duckduck/i.test(ua)
  if (!isOwner && !isBot) {
    await prisma.eventSite.update({
      where: { id: eventSite.id },
      data: { viewCount: { increment: 1 } },
    })
  }
} catch {
  // tracking non-critique : ne jamais bloquer la réponse
}
```

S'assurer que la requête `findUnique` sur `eventSite` inclut `planner: { select: { userId: true } }` dans le select.

- [ ] **Step 3: Tester en owner (pas d'incrément)**

Connecté en tant qu'owner, ouvrir le site :
```bash
curl http://localhost:3001/api/event-site/<id> -H "Cookie: <session-owner>"
```
Vérifier en DB que `viewCount` n'a pas bougé.

- [ ] **Step 4: Tester en visiteur anonyme (incrément)**

```bash
curl http://localhost:3001/api/event-site/<id>
```
Vérifier en DB que `viewCount` a +1.

- [ ] **Step 5: Tester avec UA bot (pas d'incrément)**

```bash
curl http://localhost:3001/api/event-site/<id> -A "Googlebot/2.1"
```
Vérifier que `viewCount` n'a pas bougé.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/event-site/[id]/route.ts
git commit -m "feat(event-site): viewCount tracking avec exclusion owner+bots"
```

---

## Task 8: Étendre dashboard-data avec stats RSVP

**Files:**
- Modify: `src/app/api/planners/[id]/dashboard-data/route.ts`

- [ ] **Step 1: Ajouter le fetch RSVP au Promise.all**

Repérer le `Promise.all([...])` existant et ajouter :

```ts
prisma.eventSite.findUnique({
  where: { plannerId },
  select: {
    id: true,
    viewCount: true,
    rsvps: {
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        guestName: true,
        attendingMain: true,
        plusOneName: true,
        dietaryNeeds: true,
        message: true,
        createdAt: true,
      },
    },
    _count: { select: { rsvps: { where: { attendingMain: true } } } },
  },
}),
```

Renommer la variable destructurée en `eventSiteWithRsvps`.

- [ ] **Step 2: Calculer stats et sérialiser au response**

Après le Promise.all, ajouter :

```ts
const allRsvps = eventSiteWithRsvps
  ? await prisma.eventRsvp.findMany({
      where: { eventSiteId: eventSiteWithRsvps.id },
      select: { attendingMain: true, plusOneName: true },
    })
  : []
const confirmedCount = allRsvps.filter(r => r.attendingMain).length
const plusOnesCount = allRsvps.filter(r => r.attendingMain && r.plusOneName && r.plusOneName.trim().length > 0).length

const rsvpStats = {
  viewCount: eventSiteWithRsvps?.viewCount ?? 0,
  confirmed: confirmedCount,
  plusOnes: plusOnesCount,
  total: allRsvps.length,
  recent: eventSiteWithRsvps?.rsvps ?? [],
}
```

Puis dans le `return NextResponse.json({...})`, ajouter `rsvpStats`.

- [ ] **Step 3: Tester**

```bash
curl http://localhost:3001/api/planners/<plannerId>/dashboard-data -H "Cookie: <session>"
```
Expected: JSON contient `rsvpStats: { viewCount, confirmed, plusOnes, total, recent: [...] }`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/planners/[id]/dashboard-data/route.ts
git commit -m "feat(api): dashboard-data inclut rsvpStats (viewCount + confirmés + +1 + 3 récents)"
```

---

## Task 9: Composant StatsBar

**Files:**
- Create: `src/components/guests/StatsBar.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
"use client"

type Props = {
  viewCount: number
  confirmed: number
  plusOnes: number
}

export function StatsBar({ viewCount, confirmed, plusOnes }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-4)",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--dash-surface-2)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-5)",
        flexWrap: "wrap",
      }}
    >
      <Stat label="vues" value={viewCount} />
      <Stat label="confirmés" value={confirmed} />
      <Stat label="+1" value={plusOnes} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--dash-text-1)" }}>{value}</span>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>{label}</span>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier compilation**

```bash
npx tsc --noEmit
```
Expected: 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/guests/StatsBar.tsx
git commit -m "feat(guests): composant StatsBar (3 KPI)"
```

---

## Task 10: Composant ViewToggle

**Files:**
- Create: `src/components/guests/ViewToggle.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
"use client"

export type GuestsView = "cards" | "list"

type Props = {
  value: GuestsView
  onChange: (v: GuestsView) => void
}

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--dash-surface-2)",
        borderRadius: "var(--radius-md)",
        padding: 2,
      }}
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        style={btnStyle(value === "cards")}
      >
        ◧ Cards
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        style={btnStyle(value === "list")}
      >
        ☰ Liste
      </button>
    </div>
  )
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "var(--space-2) var(--space-3)",
    fontSize: "var(--text-sm)",
    color: active ? "var(--dash-text-1)" : "var(--dash-text-3)",
    background: active ? "var(--dash-surface-1)" : "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guests/ViewToggle.tsx
git commit -m "feat(guests): composant ViewToggle (Cards/Liste)"
```

---

## Task 11: Composant RsvpCard

**Files:**
- Create: `src/components/guests/RsvpCard.tsx`

- [ ] **Step 1: Créer le composant minimal (champs vides masqués)**

```tsx
"use client"

import { useState } from "react"

export type Rsvp = {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  attendingMain: boolean
  attendingDayAfter: boolean | null
  plusOneName: string | null
  dietaryNeeds: string | null
  message: string | null
  createdAt: string
}

type Props = {
  rsvp: Rsvp
  onPatch: (id: string, patch: Partial<Rsvp>) => Promise<void>
  onLink?: (rsvpId: string) => void
}

export function RsvpCard({ rsvp, onPatch, onLink }: Props) {
  const [editing, setEditing] = useState<keyof Rsvp | null>(null)
  const hasPlusOne = !!rsvp.plusOneName?.trim()
  const hasDiet = !!rsvp.dietaryNeeds?.trim()
  const hasMsg = !!rsvp.message?.trim()

  return (
    <article
      style={{
        background: "var(--dash-surface-1)",
        border: "1px solid var(--dash-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-2)" }}>
        <EditableText
          value={rsvp.guestName}
          editing={editing === "guestName"}
          onStart={() => setEditing("guestName")}
          onSave={async (v) => { await onPatch(rsvp.id, { guestName: v }); setEditing(null) }}
          onCancel={() => setEditing(null)}
          style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text-1)" }}
        />
        <span style={{ fontSize: "var(--text-lg)" }}>{rsvp.attendingMain ? "✓" : "✗"}</span>
      </header>

      {hasPlusOne && (
        <Row icon="+1" text={rsvp.plusOneName!} />
      )}
      {hasDiet && (
        <Row icon="🍽" text={rsvp.dietaryNeeds!} />
      )}
      {hasMsg && (
        <Row icon="💬" text={`"${rsvp.message}"`} />
      )}

      {onLink && (
        <button
          type="button"
          onClick={() => onLink(rsvp.id)}
          style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--text-xs)",
            color: "var(--dash-text-3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          ✓ Lier à mes invités
        </button>
      )}
    </article>
  )
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--dash-text-2)" }}>
      <span style={{ minWidth: 18 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function EditableText({
  value, editing, onStart, onSave, onCancel, style,
}: {
  value: string
  editing: boolean
  onStart: () => void
  onSave: (v: string) => void
  onCancel: () => void
  style?: React.CSSProperties
}) {
  const [draft, setDraft] = useState(value)
  if (!editing) {
    return <span onClick={onStart} style={{ ...style, cursor: "pointer" }}>{value}</span>
  }
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onSave(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave(draft)
        if (e.key === "Escape") onCancel()
      }}
      style={{ ...style, border: "1px solid var(--dash-border)", padding: "2px 6px", borderRadius: 4, background: "var(--dash-surface-2)" }}
    />
  )
}
```

- [ ] **Step 2: Vérifier compilation**

```bash
npx tsc --noEmit
```
Expected: 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/guests/RsvpCard.tsx
git commit -m "feat(guests): RsvpCard minimale + édition inline du nom"
```

---

## Task 12: Composant RsvpTable

**Files:**
- Create: `src/components/guests/RsvpTable.tsx`

- [ ] **Step 1: Créer le tableau dense**

```tsx
"use client"

import type { Rsvp } from "./RsvpCard"

type Props = {
  rsvps: Rsvp[]
  onPatch: (id: string, patch: Partial<Rsvp>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function RsvpTable({ rsvps, onPatch, onDelete }: Props) {
  if (rsvps.length === 0) {
    return (
      <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", padding: "var(--space-4)" }}>
        Aucune réponse pour le moment.
      </p>
    )
  }

  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--dash-border)", borderRadius: "var(--radius-lg)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead style={{ position: "sticky", top: 0, background: "var(--dash-surface-2)" }}>
          <tr>
            <Th>✓</Th>
            <Th>Nom</Th>
            <Th>+1</Th>
            <Th>Nom +1</Th>
            <Th>Allergie</Th>
            <Th>Message</Th>
            <Th>Lendemain</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--dash-border)" }}>
              <Td>{r.attendingMain ? "✓" : "✗"}</Td>
              <Td>{r.guestName}</Td>
              <Td>{r.plusOneName ? "✓" : "—"}</Td>
              <Td>{r.plusOneName ?? "—"}</Td>
              <Td>{r.dietaryNeeds ?? "—"}</Td>
              <Td title={r.message ?? ""}>{truncate(r.message, 40)}</Td>
              <Td>{r.attendingDayAfter === null ? "—" : r.attendingDayAfter ? "✓" : "✗"}</Td>
              <Td>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Supprimer la réponse de ${r.guestName} ?`)) await onDelete(r.id)
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dash-text-3)" }}
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 600, color: "var(--dash-text-2)" }}>{children}</th>
}

function Td({ children, title }: { children: React.ReactNode; title?: string }) {
  return <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--dash-text-1)" }} title={title}>{children}</td>
}

function truncate(s: string | null, n: number): string {
  if (!s) return "—"
  return s.length <= n ? s : s.slice(0, n) + "…"
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guests/RsvpTable.tsx
git commit -m "feat(guests): RsvpTable (vue dense, sticky header, delete)"
```

---

## Task 13: Composants GuestCard + GuestTable

**Files:**
- Create: `src/components/guests/GuestCard.tsx`
- Create: `src/components/guests/GuestTable.tsx`

- [ ] **Step 1: Créer GuestCard**

```tsx
"use client"

export type Guest = {
  id: string
  name: string
  rsvp: string
  notes: string | null
  linkedRsvpId: string | null
}

type Props = {
  guest: Guest
  onPatch: (id: string, patch: Partial<Guest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const STATUSES = ["pending", "yes", "no", "invited"] as const
const LABELS: Record<string, string> = { pending: "⏳ En attente", yes: "✓ Confirmé", no: "✗ Refuse", invited: "📞 Invité" }

export function GuestCard({ guest, onPatch, onDelete }: Props) {
  const cycle = () => {
    const idx = STATUSES.indexOf(guest.rsvp as typeof STATUSES[number])
    const next = STATUSES[(idx + 1) % STATUSES.length]
    onPatch(guest.id, { rsvp: next })
  }
  return (
    <article style={{
      background: "var(--dash-surface-1)",
      border: "1px solid var(--dash-border)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text-1)" }}>{guest.name}</span>
        <button type="button" onClick={cycle} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: "var(--text-sm)", color: "var(--dash-text-2)",
        }}>{LABELS[guest.rsvp] ?? guest.rsvp}</button>
      </header>
      {guest.notes && (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", margin: 0 }}>{guest.notes}</p>
      )}
      {guest.linkedRsvpId && (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>→ Lié à une réponse site</span>
      )}
      <button type="button" onClick={() => {
        if (confirm(`Supprimer ${guest.name} ?`)) onDelete(guest.id)
      }} style={{
        alignSelf: "flex-end", background: "transparent", border: "none",
        cursor: "pointer", color: "var(--dash-text-3)", fontSize: "var(--text-xs)",
      }}>Supprimer</button>
    </article>
  )
}
```

- [ ] **Step 2: Créer GuestTable**

```tsx
"use client"

import type { Guest } from "./GuestCard"

type Props = {
  guests: Guest[]
  onPatch: (id: string, patch: Partial<Guest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const LABELS: Record<string, string> = { pending: "En attente", yes: "Confirmé", no: "Refuse", invited: "Invité" }

export function GuestTable({ guests, onPatch, onDelete }: Props) {
  if (guests.length === 0) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", padding: "var(--space-4)" }}>Aucun invité.</p>
  }
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--dash-border)", borderRadius: "var(--radius-lg)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead style={{ background: "var(--dash-surface-2)" }}>
          <tr>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>Note</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id} style={{ borderTop: "1px solid var(--dash-border)" }}>
              <td style={tdStyle}>{LABELS[g.rsvp] ?? g.rsvp}</td>
              <td style={tdStyle}>{g.name}</td>
              <td style={tdStyle}>{g.notes ?? "—"}</td>
              <td style={tdStyle}>
                <button type="button" onClick={() => {
                  if (confirm(`Supprimer ${g.name} ?`)) onDelete(g.id)
                }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dash-text-3)" }}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 600, color: "var(--dash-text-2)" }
const tdStyle: React.CSSProperties = { padding: "var(--space-2) var(--space-3)", color: "var(--dash-text-1)" }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/guests/GuestCard.tsx src/components/guests/GuestTable.tsx
git commit -m "feat(guests): GuestCard + GuestTable (Mes invités, manuel)"
```

---

## Task 14: Composant GuestsExportMenu

**Files:**
- Create: `src/components/guests/GuestsExportMenu.tsx`

- [ ] **Step 1: Créer le menu déroulant export**

```tsx
"use client"

import { useState } from "react"

type Props = { plannerId: string }

export function GuestsExportMenu({ plannerId }: Props) {
  const [open, setOpen] = useState(false)
  const dl = (format: "csv" | "xlsx") => {
    window.location.href = `/api/planners/${plannerId}/guests/export?format=${format}`
    setOpen(false)
  }
  const printPdf = () => {
    window.print()
    setOpen(false)
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "var(--space-2) var(--space-3)",
          fontSize: "var(--text-sm)",
          background: "var(--dash-surface-2)",
          color: "var(--dash-text-1)",
          border: "1px solid var(--dash-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
        }}
      >
        ⬇ Exporter
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "var(--dash-surface-1)",
            border: "1px solid var(--dash-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            zIndex: 10,
            minWidth: 140,
          }}
        >
          <Item onClick={() => dl("csv")}>CSV</Item>
          <Item onClick={() => dl("xlsx")}>Excel (.xlsx)</Item>
          <Item onClick={printPdf}>PDF (imprimer)</Item>
        </div>
      )}
    </div>
  )
}

function Item({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-sm)",
        textAlign: "left",
        background: "transparent",
        color: "var(--dash-text-1)",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guests/GuestsExportMenu.tsx
git commit -m "feat(guests): GuestsExportMenu (CSV/Excel/PDF print)"
```

---

## Task 15: Composant LinkRsvpDialog

**Files:**
- Create: `src/components/guests/LinkRsvpDialog.tsx`

- [ ] **Step 1: Créer le dialog**

```tsx
"use client"

import { useState } from "react"
import type { Guest } from "./GuestCard"

type Props = {
  rsvpId: string
  guests: Guest[]
  onLink: (guestId: string, rsvpId: string) => Promise<void>
  onClose: () => void
}

export function LinkRsvpDialog({ rsvpId, guests, onLink, onClose }: Props) {
  const [selected, setSelected] = useState<string>("")
  const handleConfirm = async () => {
    if (!selected) return
    await onLink(selected, rsvpId)
    onClose()
  }
  return (
    <div
      role="dialog"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--dash-surface-1)", padding: "var(--space-5)",
          borderRadius: "var(--radius-lg)", minWidth: 320, maxWidth: 480,
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text-1)" }}>
          Lier à un invité
        </h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
            background: "var(--dash-surface-2)", color: "var(--dash-text-1)",
            border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)",
          }}
        >
          <option value="">— Choisir un invité —</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Annuler</button>
          <button type="button" onClick={handleConfirm} disabled={!selected} style={btnPrimary}>Lier</button>
        </div>
      </div>
    </div>
  )
}

const btnSecondary: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
  background: "transparent", color: "var(--dash-text-2)",
  border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)", cursor: "pointer",
}
const btnPrimary: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
  background: "var(--dash-text-1)", color: "var(--dash-surface-1)",
  border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guests/LinkRsvpDialog.tsx
git commit -m "feat(guests): LinkRsvpDialog (dropdown lier RSVP -> Guest)"
```

---

## Task 16: Refonte page /guests

**Files:**
- Modify: `src/app/guests/page.tsx` (réécriture complète)

- [ ] **Step 1: Récupérer la structure actuelle pour conserver les imports/auth**

Run :
```bash
head -50 src/app/guests/page.tsx
```

- [ ] **Step 2: Réécrire la page complète**

Remplacer tout le contenu de `src/app/guests/page.tsx` par :

```tsx
"use client"

import { useEffect, useState } from "react"
import { StatsBar } from "@/components/guests/StatsBar"
import { ViewToggle, type GuestsView } from "@/components/guests/ViewToggle"
import { RsvpCard, type Rsvp } from "@/components/guests/RsvpCard"
import { RsvpTable } from "@/components/guests/RsvpTable"
import { GuestCard, type Guest } from "@/components/guests/GuestCard"
import { GuestTable } from "@/components/guests/GuestTable"
import { GuestsExportMenu } from "@/components/guests/GuestsExportMenu"
import { LinkRsvpDialog } from "@/components/guests/LinkRsvpDialog"

type RsvpsPayload = {
  rsvps: Rsvp[]
  stats: { viewCount: number; confirmed: number; plusOnes: number; total: number }
}

export default function GuestsPage() {
  const [plannerId, setPlannerId] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvpData, setRsvpData] = useState<RsvpsPayload | null>(null)
  const [view, setView] = useState<GuestsView>("cards")
  const [linkingRsvpId, setLinkingRsvpId] = useState<string | null>(null)
  const [newGuestName, setNewGuestName] = useState("")

  useEffect(() => {
    try {
      const v = localStorage.getItem("momento_guests_view")
      if (v === "cards" || v === "list") setView(v)
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try { localStorage.setItem("momento_guests_view", view) } catch {}
  }, [view])

  useEffect(() => {
    fetch("/api/planners")
      .then((r) => r.json())
      .then((arr: { id: string }[]) => {
        if (Array.isArray(arr) && arr[0]) setPlannerId(arr[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!plannerId) return
    Promise.all([
      fetch(`/api/guests?plannerId=${plannerId}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/planners/${plannerId}/rsvps`).then((r) => r.json()).catch(() => null),
    ]).then(([gs, rs]) => {
      if (Array.isArray(gs)) setGuests(gs)
      if (rs && rs.rsvps) setRsvpData(rs)
    })
  }, [plannerId])

  async function addGuest() {
    if (!newGuestName.trim() || !plannerId) return
    const name = newGuestName.trim()
    setNewGuestName("")
    const r = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, plannerId }),
    })
    if (r.ok) {
      const created = await r.json()
      setGuests((g) => [created, ...g])
    }
  }

  async function patchGuest(id: string, patch: Partial<Guest>) {
    setGuests((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  async function deleteGuest(id: string) {
    setGuests((g) => g.filter((x) => x.id !== id))
    await fetch(`/api/guests/${id}`, { method: "DELETE" }).catch(() => {})
  }

  async function patchRsvp(id: string, patch: Partial<Rsvp>) {
    setRsvpData((d) => d ? { ...d, rsvps: d.rsvps.map((r) => r.id === id ? { ...r, ...patch } : r) } : d)
    await fetch(`/api/rsvps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  async function deleteRsvp(id: string) {
    setRsvpData((d) => d ? { ...d, rsvps: d.rsvps.filter((r) => r.id !== id) } : d)
    await fetch(`/api/rsvps/${id}`, { method: "DELETE" }).catch(() => {})
  }

  async function linkRsvp(guestId: string, rsvpId: string) {
    await fetch(`/api/guests/${guestId}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpId }),
    }).catch(() => {})
    setGuests((g) => g.map((x) => (x.id === guestId ? { ...x, linkedRsvpId: rsvpId } : x)))
  }

  return (
    <div style={{
      maxWidth: 1200, margin: "0 auto", padding: "var(--space-5)",
      display: "flex", flexDirection: "column", gap: "var(--space-5)",
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--dash-text-1)", margin: 0 }}>
          Mes invités
        </h1>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <ViewToggle value={view} onChange={setView} />
          {plannerId && <GuestsExportMenu plannerId={plannerId} />}
        </div>
      </header>

      <StatsBar
        viewCount={rsvpData?.stats.viewCount ?? 0}
        confirmed={rsvpData?.stats.confirmed ?? 0}
        plusOnes={rsvpData?.stats.plusOnes ?? 0}
      />

      <section>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text-1)", marginBottom: "var(--space-3)" }}>
          Mes invités ({guests.length})
        </h2>
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <input
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addGuest() }}
            placeholder="Ajouter un invité (ex: Tante Fatima)"
            style={{
              flex: 1, padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
              background: "var(--dash-surface-2)", color: "var(--dash-text-1)",
              border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)",
            }}
          />
          <button type="button" onClick={addGuest} style={{
            padding: "var(--space-2) var(--space-4)", background: "var(--dash-text-1)",
            color: "var(--dash-surface-1)", border: "none", borderRadius: "var(--radius-md)",
            cursor: "pointer", fontSize: "var(--text-sm)",
          }}>+ Ajouter</button>
        </div>
        {view === "cards" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-3)" }}>
            {guests.map((g) => <GuestCard key={g.id} guest={g} onPatch={patchGuest} onDelete={deleteGuest} />)}
          </div>
        ) : (
          <GuestTable guests={guests} onPatch={patchGuest} onDelete={deleteGuest} />
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text-1)", marginBottom: "var(--space-3)" }}>
          Réponses du site ({rsvpData?.stats.total ?? 0})
        </h2>
        {view === "cards" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-3)" }}>
            {rsvpData?.rsvps.map((r) => (
              <RsvpCard key={r.id} rsvp={r} onPatch={patchRsvp} onLink={(id) => setLinkingRsvpId(id)} />
            ))}
          </div>
        ) : (
          <RsvpTable rsvps={rsvpData?.rsvps ?? []} onPatch={patchRsvp} onDelete={deleteRsvp} />
        )}
      </section>

      {linkingRsvpId && (
        <LinkRsvpDialog
          rsvpId={linkingRsvpId}
          guests={guests}
          onLink={linkRsvp}
          onClose={() => setLinkingRsvpId(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Vérifier compilation**

```bash
npx tsc --noEmit
```
Expected: 0 erreur.

- [ ] **Step 4: Vérifier visuellement**

```bash
npm run dev
```
Naviguer sur `http://localhost:3001/guests`. Vérifier :
- Bandeau 3 KPI affiché en haut
- Toggle Cards/Liste fonctionne
- Section Mes invités avec input ajout
- Section Réponses du site avec cards/tableau

- [ ] **Step 5: Commit**

```bash
git add src/app/guests/page.tsx
git commit -m "feat(guests): refonte page — 2 sections + toggle + export + lien manuel"
```

---

## Task 17: Réécriture InvitesWidget dashboard

**Files:**
- Modify: `src/app/dashboard/DashboardClient.tsx`

- [ ] **Step 1: Trouver la définition d'`InvitesWidget`**

Run :
```bash
grep -n "InvitesWidget\|Invités\|guests" src/app/dashboard/DashboardClient.tsx
```

- [ ] **Step 2: Remplacer le widget par la version source RSVP**

Trouver le composant `InvitesWidget` (ou équivalent rendu dans le case `"invites"` du switch widget). Le réécrire :

```tsx
function InvitesWidget({ stats }: { stats: { viewCount: number; confirmed: number; plusOnes: number; recent: Array<{ id: string; guestName: string; attendingMain: boolean }> } | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", height: "100%" }}>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <KpiMini label="vues" value={stats?.viewCount ?? 0} />
        <KpiMini label="confirmés" value={stats?.confirmed ?? 0} />
        <KpiMini label="+1" value={stats?.plusOnes ?? 0} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {(stats?.recent ?? []).slice(0, 3).map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
            <span style={{ color: "var(--dash-text-1)" }}>{r.guestName}</span>
            <span style={{ color: "var(--dash-text-3)" }}>{r.attendingMain ? "✓" : "✗"}</span>
          </div>
        ))}
        {(!stats || stats.recent.length === 0) && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>Aucune réponse pour le moment.</p>
        )}
      </div>
      <a href="/guests" style={{ marginTop: "auto", fontSize: "var(--text-xs)", color: "var(--dash-text-2)" }}>
        Voir tout →
      </a>
    </div>
  )
}

function KpiMini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text-1)" }}>{value}</div>
      <div style={{ fontSize: "var(--text-2xs, 10px)", color: "var(--dash-text-3)" }}>{label}</div>
    </div>
  )
}
```

- [ ] **Step 3: Étendre le state `dashboardData` avec `rsvpStats`**

Trouver la définition du state `dashboardData` (recherche `setDashboardData`), ajouter le champ :
```ts
rsvpStats: { viewCount: number; confirmed: number; plusOnes: number; total: number; recent: Array<{ id: string; guestName: string; attendingMain: boolean }> } | null
```

Dans le useEffect qui hydrate `dashboardData` depuis `/api/planners/[id]/dashboard-data`, lire `data.rsvpStats` et l'inclure dans le `setDashboardData`.

- [ ] **Step 4: Brancher le widget sur les nouvelles données**

Remplacer le case `"invites"` du switch widget :
```ts
case "invites":
  return <InvitesWidget stats={dashboardData?.rsvpStats ?? null} />
```

- [ ] **Step 5: Vérifier visuellement**

`npm run dev`, login, ouvrir `/dashboard`. Vérifier :
- Widget Invités affiche 3 KPI (vues / confirmés / +1)
- 3 dernières RSVP listées en dessous (si présentes)
- Lien "Voir tout →" mène à `/guests`

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/DashboardClient.tsx
git commit -m "feat(dashboard): InvitesWidget consomme rsvpStats (vues/confirmés/+1 + récents)"
```

---

## Task 18: Print CSS pour PDF

**Files:**
- Modify: `src/app/guests/page.tsx`

- [ ] **Step 1: Ajouter un bloc style print**

Ajouter en haut du JSX retourné par `GuestsPage` :

```tsx
<style jsx global>{`
  @media print {
    nav, header button, .no-print { display: none !important; }
    body { background: white !important; color: black !important; }
    article, table { break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px; }
  }
`}</style>
```

Ajouter `className="no-print"` sur le bouton "+ Ajouter", sur `ViewToggle`, sur `GuestsExportMenu`, sur les boutons "Supprimer" individuels et le bouton "Lier".

- [ ] **Step 2: Tester**

Sur `/guests`, cliquer Exporter → PDF (imprimer). Dans la fenêtre de print, vérifier que les boutons d'action ont disparu et que le tableau est lisible.

- [ ] **Step 3: Commit**

```bash
git add src/app/guests/page.tsx
git commit -m "feat(guests): print CSS pour export PDF (impression propre)"
```

---

## Task 19: Vérification finale + build

- [ ] **Step 1: Build complet**

Run :
```bash
npx next build
```
Expected: build success, 0 erreur TS.

- [ ] **Step 2: Tester E2E manuellement**

1. Login en local sur `localhost:3001`
2. Aller sur `/guests` — vérifier 2 sections + KPI + toggle
3. Ajouter un invité manuel "Test Invité"
4. Submit une RSVP via le site événement public (form sur `/event-site/<id>` ou équivalent public)
5. Refresh `/guests` — la nouvelle RSVP apparaît dans Section 2
6. Cliquer "Lier à mes invités" sur la RSVP → choisir "Test Invité" → vérifier le statut Guest passe à confirmé
7. Exporter CSV → ouvrir, vérifier 2 lignes
8. Exporter Excel → ouvrir, vérifier 2 feuilles
9. Cliquer PDF (imprimer) → vérifier preview propre
10. Aller sur `/dashboard` — vérifier widget Invités affiche les bonnes stats

- [ ] **Step 3: Vérifier IDOR**

Tenter PATCH/DELETE sur un rsvpId d'un autre user (depuis curl ou DevTools) → confirmer 403.

- [ ] **Step 4: Commit final si ajustements**

Si bugs trouvés et fixés :
```bash
git add -A
git commit -m "fix(guests): ajustements post-vérification E2E"
```

---

## Critères de succès (rappel spec)

- [x] Une nouvelle RSVP apparaît instantanément (ou après refresh max) sur `/guests`
- [x] L'organisateur peut visualiser, éditer, supprimer une RSVP sans quitter `/guests`
- [x] L'organisateur peut basculer Cards ↔ Liste sans perdre les filtres
- [x] L'organisateur peut exporter ses 250 invités en CSV en < 2s
- [x] Le viewCount s'incrémente uniquement pour les visiteurs externes (pas l'owner)
- [x] Toutes les routes API filtrent par `userId` (IDOR)
- [x] Le widget dashboard reflète la même source que `/guests`
- [x] Aucun double comptage entre Mes invités et Réponses site dans les KPI
