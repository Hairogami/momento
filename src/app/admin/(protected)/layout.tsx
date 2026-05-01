import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminThemeLock from "@/components/admin/AdminThemeLock"
import AdminUserMenu from "@/components/admin/AdminUserMenu"

export const metadata = {
  title: "Admin — Momento",
  robots: { index: false, follow: false },
}

const C = {
  bg:        "#0b0b10",
  topbar:    "#08080d",
  border:    "#252633",
  text:      "#f0f0f5",
  textMuted: "#9a9aaa",
  textDim:   "#6a6a78",
  accent:    "#9333EA",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined
  if (!user?.id) {
    redirect("/admin/login")
  }
  const { isAdminEmail } = await import("@/lib/adminConstants")
  if (user.role !== "admin" && !isAdminEmail(user.email)) {
    redirect("/admin/login?error=access_denied")
  }

  return (
    <div style={{ minHeight: "100dvh", background: C.bg, color: C.text }}>
      <AdminThemeLock />

      {/* Top bar */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 56, padding: "0 24px",
          paddingTop: "env(safe-area-inset-top)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: C.topbar, color: C.text,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/admin" style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text, textDecoration: "none", letterSpacing: "-0.01em" }}>
            Momento <span style={{ color: C.accent }}>·</span> Admin
          </Link>
          <nav style={{ display: "flex", gap: 18 }}>
            <Link href="/admin/users"   style={navLink}>Users</Link>
            <Link href="/admin/vendors" style={navLink}>Prestataires</Link>
            <Link href="/admin/ranking" style={navLink}>Ranking</Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ fontSize: "var(--text-xs)", color: C.textMuted, textDecoration: "none" }}>
            ← Retour app
          </Link>
          <AdminUserMenu email={user.email ?? ""} />
        </div>
      </header>
      {children}
    </div>
  )
}

const navLink: React.CSSProperties = {
  fontSize: "var(--text-sm)", color: "#cfd3dc", textDecoration: "none",
  fontWeight: 500, letterSpacing: "-0.005em",
}
