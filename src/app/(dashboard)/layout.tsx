"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Wallet,
  Store,
  Settings,
  MessageSquare,
  Heart,
  CalendarDays,
  Bell,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";
import { C } from "@/lib/colors"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { MomentoLogo } from "@/components/MomentoLogo"

const NAV = [
  { href: "/dashboard",     label: "Mes Événements", icon: Sparkles },
  { href: "/prestataires",  label: "Prestataires",   icon: Store },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col py-5 px-3 sticky top-0 h-screen"
        style={{ backgroundColor: C.dark, borderRight: `1px solid ${C.anthracite}` }}
      >
        {/* Logo + Dark mode toggle */}
        <div className="px-2 mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <MomentoLogo iconSize={30} />
          </Link>
          <DarkModeToggle />
        </div>

        {/* Main nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
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
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-2 my-3 h-px" style={{ backgroundColor: C.anthracite }} />

        {/* Bottom nav */}
        <nav className="flex flex-col gap-0.5">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
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

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: C.ink }}>
        {children}
      </main>
    </div>
  );
}
