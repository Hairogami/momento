import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Admin — Momento",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined
  if (!user?.id) {
    redirect("/login?next=/admin/vendors")
  }
  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7fb" }}>
      {/* Top bar */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 56, padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0b0d12", color: "#fff",
          borderBottom: "1px solid #1f2430",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/admin/vendors" style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            Momento · Admin
          </Link>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link href="/admin/vendors" style={{ fontSize: 13, color: "#cfd3dc", textDecoration: "none" }}>Prestataires</Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#9aa0ad" }}>{user.email}</span>
          <Link href="/dashboard" style={{ fontSize: 12, color: "#9aa0ad", textDecoration: "none" }}>
            ← Retour app
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
