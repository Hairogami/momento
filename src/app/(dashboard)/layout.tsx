"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Store,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/vendors", label: "Prestataires", icon: Store },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/guests", label: "Invités", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-card flex flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <span className="text-xl font-bold tracking-tight">momento</span>
        </div>
        <Separator className="mb-3" />
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
