import Link from "next/link"
import type { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f7fb",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: "#121317",
    }}>
      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid rgba(183,191,217,0.22)",
        padding: "18px 0",
      }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="Momento" width={26} height={26} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#121317", letterSpacing: "-0.01em" }}>Momento</span>
          </Link>
          <nav style={{ display: "flex", gap: 22, fontSize: 13, fontWeight: 500 }}>
            <Link href="/cgu" style={navLinkStyle}>CGU</Link>
            <Link href="/confidentialite" style={navLinkStyle}>Confidentialité</Link>
            <Link href="/mentions-legales" style={navLinkStyle}>Mentions légales</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>
        {children}
      </main>

      {/* Footer mini */}
      <footer style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 40px", fontSize: 12, color: "#9a9aaa" }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Momento — Questions juridiques : <a href="mailto:contact@momentoevents.app" style={{ color: "#6a6a71" }}>contact@momentoevents.app</a>
        </p>
      </footer>
    </div>
  )
}

const navLinkStyle: React.CSSProperties = {
  color: "#6a6a71",
  textDecoration: "none",
  transition: "color 0.15s",
}
