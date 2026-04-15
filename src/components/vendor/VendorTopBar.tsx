"use client"
/**
 * Top bar dédiée espace prestataire — chrome app, pas la nav marketing.
 * Gauche : logo + bascule vers le site. Droite : email user + logout.
 */
import Link from "next/link"

export default function VendorTopBar({ email }: { email: string | null }) {
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 56, padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0b0d12", color: "#fff",
        borderBottom: "1px solid #1f2430",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link
          href="/vendor/dashboard"
          style={{
            fontSize: 14, fontWeight: 700, color: "#fff",
            textDecoration: "none", letterSpacing: "-0.01em",
          }}
        >
          Momento <span style={{ fontWeight: 400, color: "#9aa0ad" }}>· Espace pro</span>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {email && (
          <span style={{ fontSize: 12, color: "#9aa0ad" }}>{email}</span>
        )}
        <Link
          href="/"
          style={{
            fontSize: 12, color: "#cfd3dc",
            textDecoration: "none",
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #1f2430",
          }}
        >
          ← Retour au site
        </Link>
      </div>
    </header>
  )
}
