# Mobile Responsive Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all mobile readability and navigation issues across Momento (except landing), keeping existing design language.

**Architecture:** Phase 1 (CRITIQUE) transforme les sidebars desktop en bottom navigation mobile + drawer. Phase 2 corrige les touch targets et typographie de façon systémique. Phase 3 fixe les pages individuelles. Chaque phase est indépendante et déployable seule.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, inline styles + CSS variables `--dash-*`, React hooks, `useEffect` pour window.innerWidth

---

## File Map

**Créer:**
- `src/hooks/useIsMobile.ts` — détection mobile SSR-safe
- `src/components/clone/dashboard/MobileDashNav.tsx` — bottom nav client dashboard
- `src/components/vendor/MobileVendorNav.tsx` — bottom nav vendor dashboard

**Modifier:**
- `src/components/clone/dashboard/DashSidebar.tsx` — masquer sur mobile, render MobileDashNav
- `src/app/vendor/dashboard/layout.tsx` — masquer VendorSidebar, ajouter MobileVendorNav
- `src/app/dashboard/page.tsx` — padding-bottom mobile pour bottom nav
- `src/components/vendor/public/PublicCalendar.tsx` — agrandir touch targets
- `src/components/vendor/VendorTopBar.tsx` — padding mobile
- `src/app/explore/ExploreClient.tsx` — fix filtres + cards mobile
- `src/app/budget/page.tsx` — fix layout mobile
- `src/app/guests/page.tsx` — fix layout mobile
- `src/app/messages/page.tsx` — fix layout mobile

---

## Phase 1 — Navigation mobile (CRITIQUE)

### Task 1: Hook `useIsMobile`

**Files:**
- Create: `src/hooks/useIsMobile.ts`

- [ ] **Step 1: Créer le hook**

```typescript
// src/hooks/useIsMobile.ts
"use client"
import { useEffect, useState } from "react"

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])

  return isMobile
}
```

- [ ] **Step 2: Vérifier le build**

```bash
npx next build
```
Attendu : `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useIsMobile.ts
git commit -m "feat(mobile): add useIsMobile hook"
```

---

### Task 2: `MobileDashNav` — bottom nav client dashboard

**Files:**
- Create: `src/components/clone/dashboard/MobileDashNav.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/clone/dashboard/MobileDashNav.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const PRIMARY_ITEMS = [
  { icon: "home",        label: "Accueil",  href: "/accueil"   },
  { icon: "dashboard",   label: "Dashboard",href: "/dashboard" },
  { icon: "chat_bubble", label: "Messages", href: "/messages"  },
  { icon: "search",      label: "Explorer", href: "/explore"   },
]

const ALL_ITEMS = [
  { icon: "home",                   label: "Accueil",      href: "/accueil"       },
  { icon: "dashboard",              label: "Dashboard",    href: "/dashboard"     },
  { icon: "account_balance_wallet", label: "Budget",       href: "/budget"        },
  { icon: "groups",                 label: "Invités",      href: "/guests"        },
  { icon: "chat_bubble",            label: "Messages",     href: "/messages"      },
  { icon: "event_note",             label: "Planning",     href: "/planner"       },
  { icon: "favorite",               label: "Favoris",      href: "/favorites"     },
  { icon: "search",                 label: "Explorer",     href: "/explore"       },
  { icon: "person",                 label: "Profil",       href: "/profile"       },
  { icon: "settings",               label: "Paramètres",   href: "/settings"      },
  { icon: "notifications",          label: "Notifications",href: "/notifications" },
]

function GIcon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color: color ?? "inherit", fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "block",
    }}>{name}</span>
  )
}

export default function MobileDashNav({ messageUnread = 0 }: { messageUnread?: number }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Bottom nav bar */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--dash-surface,#fff)",
        borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
        display: "flex", alignItems: "stretch",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {PRIMARY_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, textDecoration: "none",
              position: "relative",
            }}>
              <div style={{ position: "relative" }}>
                <GIcon
                  name={item.icon} size={22}
                  color={active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)"}
                />
                {item.href === "/messages" && messageUnread > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -6,
                    width: 14, height: 14, borderRadius: "50%",
                    background: G, color: "#fff",
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{messageUnread}</span>
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                color: active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)",
              }}>{item.label}</span>
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 24, height: 2, borderRadius: 99, background: G,
                }} />
              )}
            </Link>
          )
        })}

        {/* Menu button */}
        <button onClick={() => setDrawerOpen(true)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <GIcon name="menu" size={22} color="var(--dash-text-3,#9a9aaa)" />
          <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Menu</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
            background: "var(--dash-surface,#fff)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 0 calc(24px + env(safe-area-inset-bottom))",
            maxHeight: "80vh", overflowY: "auto",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--dash-border,rgba(183,191,217,0.4))", margin: "0 auto 20px" }} />
            {ALL_ITEMS.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 24px", textDecoration: "none",
                  background: active ? "linear-gradient(135deg,rgba(225,29,72,0.07),rgba(147,51,234,0.05))" : "transparent",
                }}>
                  <GIcon name={item.icon} size={20} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
                  <span style={{
                    fontSize: 15, fontWeight: active ? 600 : 400,
                    color: active ? "var(--dash-text,#121317)" : "var(--dash-text-2,#45474D)",
                  }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npx next build 2>&1 | tail -5
```
Attendu : `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add src/components/clone/dashboard/MobileDashNav.tsx
git commit -m "feat(mobile): MobileDashNav — bottom nav + drawer pour dashboard client"
```

---

### Task 3: Intégrer `MobileDashNav` dans `DashSidebar`

**Files:**
- Modify: `src/components/clone/dashboard/DashSidebar.tsx`

- [ ] **Step 1: Ajouter import `useIsMobile` et `MobileDashNav`**

En haut du fichier, après les imports existants :

```tsx
import { useIsMobile } from "@/hooks/useIsMobile"
import MobileDashNav from "./MobileDashNav"
```

- [ ] **Step 2: Ajouter détection mobile dans le composant**

Dans la fonction `DashSidebar`, après les autres `useState` :

```tsx
const isMobile = useIsMobile()
```

- [ ] **Step 3: Conditional render au début du return**

Remplacer le `return (` par :

```tsx
if (isMobile) {
  return <MobileDashNav messageUnread={messageUnread} />
}

return (
```

- [ ] **Step 4: Build check**

```bash
npx next build 2>&1 | tail -5
```
Attendu : `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add src/components/clone/dashboard/DashSidebar.tsx
git commit -m "feat(mobile): DashSidebar — render MobileDashNav sur mobile"
```

---

### Task 4: Padding bottom sur le dashboard client

Le contenu est masqué par le bottom nav (64px). Il faut ajouter un padding-bottom sur la zone de contenu.

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Trouver le wrapper principal du contenu**

Dans `dashboard/page.tsx`, localiser le `<main>` ou le `<div>` wrapper qui contient le contenu à côté de DashSidebar. Ajouter `className="pb-20 md:pb-0"` (80px de padding bottom sur mobile, 0 sur desktop).

Le wrapper de la page ressemble à :
```tsx
<div style={{ display: "flex", height: "100vh", overflow: "hidden", ... }}>
  <DashSidebar ... />
  <main style={{ flex: 1, overflowY: "auto", ... }}>
```

Modifier le `<main>` pour ajouter le padding :
```tsx
<main className="pb-20 md:pb-0" style={{ flex: 1, overflowY: "auto", ... }}>
```

- [ ] **Step 2: Build check**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "fix(mobile): padding-bottom contenu dashboard pour bottom nav"
```

---

### Task 5: `MobileVendorNav` — bottom nav vendor dashboard

**Files:**
- Create: `src/components/vendor/MobileVendorNav.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
// src/components/vendor/MobileVendorNav.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

function GIcon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color: color ?? "inherit", fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "block",
    }}>{name}</span>
  )
}

const PRIMARY = [
  { icon: "home",        label: "Accueil",   href: "/vendor/dashboard"           },
  { icon: "chat_bubble", label: "Demandes",  href: "/vendor/dashboard/inbox"     },
  { icon: "event",       label: "Calendrier",href: "/vendor/dashboard"           },
  { icon: "person",      label: "Profil",    href: "/vendor/dashboard/profil"    },
]

const ALL = [
  { icon: "home",          label: "Accueil",      href: "/vendor/dashboard"           },
  { icon: "chat_bubble",   label: "Demandes",     href: "/vendor/dashboard/inbox"     },
  { icon: "inventory_2",   label: "Packages",     href: "/vendor/dashboard/packages"  },
  { icon: "description",   label: "Templates",    href: "/vendor/dashboard/templates" },
  { icon: "person",        label: "Mon profil",   href: "/vendor/dashboard/profil"    },
  { icon: "explore",       label: "Explorer",     href: "/explore"                    },
]

export default function MobileVendorNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--dash-surface,#fff)",
        borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
        display: "flex", alignItems: "stretch", height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {PRIMARY.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href + item.label} href={item.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, textDecoration: "none", position: "relative",
            }}>
              <GIcon name={item.icon} size={22} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)"} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)" }}>{item.label}</span>
              {active && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 2, borderRadius: 99, background: G }} />}
            </Link>
          )
        })}
        <button onClick={() => setDrawerOpen(true)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <GIcon name="menu" size={22} color="var(--dash-text-3,#9a9aaa)" />
          <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Menu</span>
        </button>
      </nav>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
            background: "var(--dash-surface,#fff)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 0 calc(24px + env(safe-area-inset-bottom))",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--dash-border,rgba(183,191,217,0.4))", margin: "0 auto 20px" }} />
            {ALL.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href + item.label} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", textDecoration: "none",
                  background: active ? "linear-gradient(135deg,rgba(225,29,72,0.07),rgba(147,51,234,0.05))" : "transparent",
                }}>
                  <GIcon name={item.icon} size={20} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
                  <span style={{ fontSize: 15, fontWeight: active ? 600 : 400, color: active ? "var(--dash-text,#121317)" : "var(--dash-text-2,#45474D)" }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/vendor/MobileVendorNav.tsx
git commit -m "feat(mobile): MobileVendorNav — bottom nav + drawer pour espace prestataire"
```

---

### Task 6: Intégrer `MobileVendorNav` dans le layout vendor

**Files:**
- Modify: `src/app/vendor/dashboard/layout.tsx`

- [ ] **Step 1: Ajouter l'import**

```tsx
import MobileVendorNav from "@/components/vendor/MobileVendorNav"
```

- [ ] **Step 2: Modifier le return du layout**

Remplacer :
```tsx
return (
  <div style={{ minHeight: "100vh", background: "#f7f7fb" }}>
    <VendorTopBar email={user.email} />
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <VendorSidebar publicSlug={user.vendorSlug} />
      <main style={{ flex: 1, minWidth: 0, padding: "24px 28px" }}>
        {children}
      </main>
    </div>
  </div>
)
```

Par :
```tsx
return (
  <div style={{ minHeight: "100vh", background: "#f7f7fb" }}>
    <VendorTopBar email={user.email} />
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <div className="hidden md:block">
        <VendorSidebar publicSlug={user.vendorSlug} />
      </div>
      <main className="pb-20 md:pb-0" style={{ flex: 1, minWidth: 0, padding: "16px 16px 24px" }}>
        {children}
      </main>
    </div>
    <div className="md:hidden">
      <MobileVendorNav />
    </div>
  </div>
)
```

- [ ] **Step 3: Build check**

```bash
npx next build 2>&1 | tail -5
```
Attendu : `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/app/vendor/dashboard/layout.tsx
git commit -m "feat(mobile): layout vendor — masquer sidebar + MobileVendorNav sur mobile"
```

---

## Phase 2 — Touch targets & typographie

### Task 7: Calendrier public — touch targets mobile

**Files:**
- Modify: `src/components/vendor/public/PublicCalendar.tsx`

- [ ] **Step 1: Augmenter la taille des boutons jour sur mobile**

Dans `MonthGrid`, remplacer le style du bouton jour :

```tsx
style={{
  aspectRatio: "1", padding: 0, border,
  borderRadius: 6, background: bg, color,
  fontSize: 11, fontWeight: isToday ? 700 : 500,
  cursor: clickable ? "pointer" : "default",
  fontFamily: "inherit",
  transition: "transform 80ms ease",
  minHeight: 36,  // ← ajout : touch target minimum
}}
```

Et dans la grille, changer le gap :
```tsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
```
(3 → 4 pour un peu plus d'espace entre les jours)

- [ ] **Step 2: Build check**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/vendor/public/PublicCalendar.tsx
git commit -m "fix(mobile): calendrier public — touch targets minimum 36px"
```

---

### Task 8: VendorTopBar — padding mobile

**Files:**
- Modify: `src/components/vendor/VendorTopBar.tsx`

- [ ] **Step 1: Lire le fichier**

```bash
head -60 src/components/vendor/VendorTopBar.tsx
```

- [ ] **Step 2: Ajouter padding responsive**

Localiser le wrapper principal (header ou div). Remplacer le padding fixe desktop par un padding responsive :
- Desktop : `padding: "0 28px"` → garder
- Mobile : ajouter `className="px-4 md:px-7"` ou équivalent inline via `clamp`

Exemple si padding inline :
```tsx
style={{ padding: "0 clamp(16px, 4vw, 28px)", height: 56 }}
```

- [ ] **Step 3: Build check + Commit**

```bash
npx next build 2>&1 | tail -5
git add src/components/vendor/VendorTopBar.tsx
git commit -m "fix(mobile): VendorTopBar — padding responsive"
```

---

### Task 9: Pages vendor dashboard — padding mobile

Les pages internes (`/vendor/dashboard`, inbox, packages, templates, profil) ont souvent des grids ou sections avec padding 24-28px fixe. Sur mobile : trop dense.

**Files:**
- Modify: `src/app/vendor/dashboard/page.tsx`
- Modify: `src/app/vendor/dashboard/inbox/page.tsx`
- Modify: `src/app/vendor/dashboard/packages/page.tsx`
- Modify: `src/app/vendor/dashboard/profil/page.tsx`
- Modify: `src/app/vendor/dashboard/templates/page.tsx`

- [ ] **Step 1: Pour chaque page, lire le wrapper principal**

Pattern à appliquer sur chaque wrapper `<div>` principal de chaque page :

Remplacer les paddings fixes `padding: "24px 28px"` ou similaires par :
```tsx
style={{ padding: "clamp(16px, 4vw, 28px)" }}
```

Ou via className si le style est Tailwind :
```tsx
className="p-4 md:p-7"
```

- [ ] **Step 2: Grids multi-colonnes**

Pour chaque grid `gridTemplateColumns: "repeat(N, 1fr)"` ou `"1fr 1fr"` sans responsive :
```tsx
// Avant
style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}

// Après
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

- [ ] **Step 3: Build check**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/vendor/dashboard/
git commit -m "fix(mobile): vendor dashboard pages — padding et grids responsives"
```

---

## Phase 3 — Pages publiques et dashboard client

### Task 10: Explore page mobile

**Files:**
- Modify: `src/app/explore/ExploreClient.tsx`

- [ ] **Step 1: Lire les 80 premières lignes**

```bash
head -80 src/app/explore/ExploreClient.tsx
```

- [ ] **Step 2: Barre de filtres**

La barre de filtres/recherche est probablement un `flex` horizontal avec overflow. Sur mobile :
- Ajouter `overflowX: "auto", scrollbarWidth: "none"` si c'est un scroll horizontal
- Ou passer en `flexWrap: "wrap"` avec `gap: 8`

- [ ] **Step 3: Cards grid**

Localiser le grid des vendor cards. Appliquer :
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

- [ ] **Step 4: Build check + Commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/explore/ExploreClient.tsx
git commit -m "fix(mobile): explore — filtres + grid cards responsives"
```

---

### Task 11: Dashboard client — widgets mobile

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Lire les widgets section (lignes 60-200)**

```bash
sed -n '60,200p' src/app/dashboard/page.tsx
```

- [ ] **Step 2: Widgets grid**

Le layout principal des widgets est probablement un flex ou grid 2-3 colonnes. Appliquer :
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

- [ ] **Step 3: CountdownWidget et BudgetWidget**

Vérifier que ces composants ont `minWidth: 0` pour éviter l'overflow dans le grid.

- [ ] **Step 4: Build check + Commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/dashboard/page.tsx
git commit -m "fix(mobile): dashboard client — widgets grid responsive"
```

---

### Task 12: Pages client — budget, invités, messages, planner

**Files:**
- Modify: `src/app/budget/page.tsx`
- Modify: `src/app/guests/page.tsx`
- Modify: `src/app/messages/page.tsx`
- Modify: `src/app/planner/page.tsx`

- [ ] **Step 1: Lire chaque page (head -50)**

```bash
head -50 src/app/budget/page.tsx
head -50 src/app/guests/page.tsx
head -50 src/app/messages/page.tsx
head -50 src/app/planner/page.tsx
```

- [ ] **Step 2: Pattern commun à appliquer sur chaque page**

1. Wrapper principal : ajouter `className="pb-20 md:pb-0"` (space pour bottom nav)
2. Padding : `padding: "clamp(16px, 4vw, 32px)"`
3. Tableaux/listes : `overflowX: "auto"` sur le wrapper
4. Headers de section : `fontSize: "clamp(1rem, 4vw, 1.4rem)"`

- [ ] **Step 3: Build check**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/budget/page.tsx src/app/guests/page.tsx src/app/messages/page.tsx src/app/planner/page.tsx
git commit -m "fix(mobile): pages client (budget/invités/messages/planner) — layout responsive"
```

---

### Task 13: Fiche vendor publique — padding + contact card

**Files:**
- Modify: `src/app/vendor/[slug]/VendorProfileClient.tsx`

- [ ] **Step 1: Content area padding**

Localiser : `padding: "32px 24px 64px"`. Remplacer par :
```tsx
style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 80px" }}
```

- [ ] **Step 2: Contact card sticky**

Sur mobile, la colonne de droite (contact card sticky) doit apparaître AVANT les avis (pas après) pour que le CTA soit visible sans scroller.

La grid est déjà `flex flex-col lg:grid`. Ajouter `order` pour réordonner sur mobile :

Sur le `<div>` de la colonne droite (contact card), ajouter :
```tsx
className="order-first lg:order-last"
```

- [ ] **Step 3: Build check + Commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/vendor/[slug]/VendorProfileClient.tsx
git commit -m "fix(mobile): fiche vendor — padding + contact card en premier sur mobile"
```

---

### Task 14: Deploy

- [ ] **Step 1: Build final complet**

```bash
npm run build
```
Attendu : `✓ Generating static pages` sans erreur TypeScript

- [ ] **Step 2: Deploy**

```bash
npx vercel deploy --prod --yes
```

- [ ] **Step 3: Vérification post-deploy**

Ouvrir `momentoevents.app` sur mobile et vérifier :
- `/accueil` → bottom nav visible
- `/dashboard` → sidebar absente, bottom nav présente
- `/vendor/dashboard` → sidebar absente, bottom nav présente
- `/vendor/[slug]` → contact card en premier sur mobile
- Aucun overflow horizontal visible

---

## Récapitulatif

| Phase | Tâches | Impact |
|-------|--------|--------|
| 1 — Navigation | T1–T6 | CRITIQUE — dashboards navigables sur mobile |
| 2 — Touch/Typo | T7–T9 | Amélioration UX sur tous les écrans |
| 3 — Pages | T10–T14 | Finition complète du site |

**Ordre recommandé :** Phase 1 complète → deploy → Phase 2 → Phase 3 → deploy final.
