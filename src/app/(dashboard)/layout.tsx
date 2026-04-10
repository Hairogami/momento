"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  Users, Wallet, Store, Settings, MessageSquare, Heart,
  CalendarDays, Bell, ChevronRight, User, Sparkles, Plus,
  Home, MapPin, ChevronDown, Menu, X,
} from "lucide-react";
import { C } from "@/lib/colors"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { MomentoLogo } from "@/components/MomentoLogo"
import { useTheme, type Palette } from "@/components/ThemeProvider"

const PALETTES: { id: Palette; color: string; accent: string; label: string }[] = [
  { id: "creme",   color: "#F5EDD6", accent: "#C4532A", label: "Crème"   },
  { id: "ocean",   color: "#DDE9F5", accent: "#1A6BAD", label: "Océan"   },
  { id: "forest",  color: "#DDE8DD", accent: "#2D7A3A", label: "Forêt"   },
  { id: "ardoise", color: "#E2E2E2", accent: "#3A3A3A", label: "Ardoise" },
]

function PalettePicker() {
  const { palette, setPalette } = useTheme()
  return (
    <div className="px-3 mb-3">
      <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: `${C.mist}60` }}>
        Palette
      </p>
      <div className="flex items-center gap-2">
        {PALETTES.map(p => (
          <button
            key={p.id}
            onClick={() => setPalette(p.id)}
            title={p.label}
            className="w-7 h-7 rounded-full transition-all hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${p.color} 50%, ${p.accent} 50%)`,
              outline: palette === p.id ? `2px solid ${p.accent}` : "2px solid transparent",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

type Planner = {
  id: string;
  coupleNames: string | null;
  title: string | null;
  weddingDate?: string | null;
  location?: string | null;
  coverColor?: string | null;
  guestCount?: number | null;
  budget?: number | null;
};

function eventIcon(p: Planner): string {
  const t = (p.coupleNames || p.title || "").toLowerCase();
  if (t.includes("mariage") || t.includes("wedding")) return "💍";
  if (t.includes("anniversaire") || t.includes("birthday")) return "🎂";
  if (t.includes("baby") || t.includes("naissance")) return "🍼";
  if (t.includes("entreprise") || t.includes("corporate") || t.includes("techco")) return "🏢";
  if (t.includes("soirée") || t.includes("fête") || t.includes("party")) return "🎉";
  if (t.includes("fiançailles") || t.includes("engagement")) return "💎";
  return "📅";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const NAV = [
  { href: "/vendors",       label: "Prestataires",   icon: Store },
  { href: "/planner",       label: "Planning",        icon: CalendarDays },
  { href: "/budget",        label: "Budget",          icon: Wallet },
  { href: "/guests",        label: "Invités",         icon: Users },
  { href: "/favorites",     label: "Favoris",         icon: Heart },
  { href: "/messages",      label: "Messages",        icon: MessageSquare },
  { href: "/notifications", label: "Notifications",   icon: Bell },
];

const BOTTOM_NAV = [
  { href: "/profile",  label: "Mon profil",  icon: User },
  { href: "/settings", label: "Paramètres",  icon: Settings },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [unread, setUnread] = useState({ messages: 0, notifications: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/planners")
      .then(r => r.json())
      .then(setPlanners)
      .catch(() => {});
    fetch("/api/unread")
      .then(r => r.json())
      .then(setUnread)
      .catch(() => {});
  }, []);

  // Intercepteur global : émet momento:stats-refresh après toute mutation
  // sur les routes qui affectent les stats (planners, steps, vendors)
  useEffect(() => {
    const WATCHED = ["/api/planners", "/api/steps", "/api/vendor", "/api/contact"]
    const MUTATE  = ["POST", "PUT", "PATCH", "DELETE"]
    const original = window.fetch
    window.fetch = async (...args) => {
      const res = await original(...args)
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url
      const method = (typeof args[1]?.method === "string" ? args[1].method : "GET").toUpperCase()
      if (res.ok && MUTATE.includes(method) && WATCHED.some(w => url.includes(w))) {
        window.dispatchEvent(new Event("momento:stats-refresh"))
      }
      return res
    }
    return () => { window.fetch = original }
  }, []);

  // Rafraîchit les planners dans la sidebar sur evento stats-refresh
  useEffect(() => {
    function refresh() {
      fetch("/api/planners").then(r => r.json()).then(setPlanners).catch(() => {})
    }
    window.addEventListener("momento:stats-refresh", refresh)
    return () => window.removeEventListener("momento:stats-refresh", refresh)
  }, [setPlanners]);

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  const VISIBLE_MAX = 4;
  const visible = showAll ? planners : planners.slice(0, VISIBLE_MAX);
  const hasMore = planners.length > VISIBLE_MAX;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Logo fixe en haut à droite */}
      <div className="fixed top-4 right-5 z-50 hidden md:block">
        <MomentoLogo iconSize={28} variant="wordmark" />
      </div>

      {/* ── Barre mobile top ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: C.dark, borderBottom: `1px solid ${C.anthracite}` }}
      >
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="p-2 rounded-xl transition hover:opacity-70"
          style={{ color: C.mist }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <MomentoLogo iconSize={24} variant="wordmark" />
        <div className="w-10" />
      </div>

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-30 md:z-auto h-screen flex flex-col py-5 px-3 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          w-56 md:w-56 pt-[4.5rem] md:pt-5`}
        style={{ backgroundColor: C.dark, borderRight: `1px solid ${C.anthracite}` }}
      >
        {/* DarkModeToggle seul en haut */}
        <div className="px-2 mb-5 flex items-center justify-center">
          <DarkModeToggle />
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto min-h-0">

          {/* ── Accueil (toujours visible) ── */}
          <Link
            href="/accueil"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 mb-1"
            style={{
              backgroundColor: pathname === "/accueil" ? C.terra : "transparent",
              color: pathname === "/accueil" ? "#fff" : C.mist,
            }}
          >
            <span className="flex items-center gap-2.5">
              <Home size={16} />
              Accueil
            </span>
            {pathname === "/accueil" && <ChevronRight size={14} />}
          </Link>

          {/* ── Section Mes Événements ── */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: `${C.mist}80` }}>
                <Sparkles size={12} />
                Mes Événements
              </span>
              <Link
                href="/event/new"
                title="Créer un événement"
                className="rounded-lg p-1 transition-all hover:opacity-70"
                style={{ color: C.terra }}
              >
                <Plus size={13} />
              </Link>
            </div>

            {/* Cards événements */}
            <div className="flex flex-col gap-1.5 mt-1 px-1">
              {visible.map(p => {
                const label = p.coupleNames || p.title || "Événement";
                const href = `/dashboard?id=${p.id}`;
                const active = pathname === "/dashboard" && activeId === p.id;
                const color = p.coverColor || C.terra;
                const days = daysUntil(p.weddingDate);

                return (
                  <Link
                    key={p.id}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className="group block rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: active ? `${color}22` : `${C.anthracite}60`,
                      border: `1px solid ${active ? color : `${C.anthracite}`}`,
                      boxShadow: active ? `0 0 0 1px ${color}44` : "none",
                    }}
                  >
                    {/* Barre colorée top */}
                    <div className="h-1 w-full" style={{ backgroundColor: color }} />

                    <div className="px-2.5 py-2">
                      {/* Icône + nom */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm leading-none">{eventIcon(p)}</span>
                        <span
                          className="text-xs font-semibold truncate leading-tight"
                          style={{ color: active ? "#fff" : C.mist }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Date */}
                      {p.weddingDate && (
                        <div className="flex items-center gap-1 mb-1">
                          <CalendarDays size={9} style={{ color: `${C.mist}80` }} />
                          <span className="text-[10px]" style={{ color: `${C.mist}80` }}>
                            {formatDate(p.weddingDate)}
                          </span>
                        </div>
                      )}

                      {/* Lieu + J-countdown */}
                      <div className="flex items-center justify-between">
                        {p.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={9} style={{ color: `${C.mist}60` }} />
                            <span className="text-[10px] truncate" style={{ color: `${C.mist}60` }}>
                              {p.location}
                            </span>
                          </div>
                        )}
                        {days !== null && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto"
                            style={{ backgroundColor: `${color}30`, color }}
                          >
                            J-{days}
                          </span>
                        )}
                      </div>

                      {/* Budget */}
                      {p.budget != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Wallet size={9} style={{ color: `${C.mist}60` }} />
                          <span className="text-[10px]" style={{ color: `${C.mist}60` }}>
                            {p.budget.toLocaleString("fr-FR")} MAD
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Afficher plus / moins */}
              {hasMore && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80 w-full"
                  style={{ color: C.terra }}
                >
                  <ChevronDown
                    size={12}
                    className="transition-transform"
                    style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                  {showAll ? "Réduire" : `Afficher +${planners.length - VISIBLE_MAX}`}
                </button>
              )}

            </div>
          </div>

          {/* Séparateur */}
          <div className="mx-2 my-1 h-px" style={{ backgroundColor: C.anthracite }} />

          {/* Nav principale */}
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const badge = href === "/messages" ? unread.messages
                        : href === "/notifications" ? unread.notifications
                        : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: active ? C.terra : "transparent",
                  color: active ? "#fff" : C.mist,
                }}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {label}
                </span>
                <span className="flex items-center gap-1.5">
                  {badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{ backgroundColor: C.terra, color: "#fff" }}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                  {active && <ChevronRight size={14} />}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-2 my-3 h-px" style={{ backgroundColor: C.anthracite }} />

        {/* Palette de couleurs */}
        <PalettePicker />

        {/* Bottom nav */}
        <nav className="flex flex-col gap-0.5">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: active ? C.terra : "transparent",
                  color: active ? "#fff" : C.mist,
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Espace Prestataire */}
        <div className="mt-3 px-1">
          <Link
            href="/prestataire/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: `${C.terra}18`,
              color: C.terra,
              border: `1px solid ${C.terra}40`,
            }}
          >
            <Store size={13} />
            Espace Prestataire →
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pt-14 md:pt-0" style={{ backgroundColor: C.ink }}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
