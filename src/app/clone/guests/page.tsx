"use client"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",  date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",       date: "2026-06-21", color: "#7b5ea7" },
]

export default function CloneGuestsPage() {
  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "#f7f7fb" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={EVENTS} activeEventId="1" onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>👥</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#121317", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
            Gestion des invités
          </h1>
          <p style={{ fontSize: 14, color: "#6a6a71", marginBottom: 28, lineHeight: 1.6 }}>
            Gérez votre liste d&apos;invités, suivez les confirmations, organisez les tables et envoyez des rappels.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 99,
            background: "rgba(183,191,217,0.1)", border: "1px solid rgba(183,191,217,0.2)",
            fontSize: 12, color: "#9a9aaa", marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            Bientôt disponible
          </div>
          <br />
          <Link href="/clone/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 999,
            background: G, color: "#fff",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>← Retour au dashboard</Link>
        </div>
      </main>
    </div>
  )
}
