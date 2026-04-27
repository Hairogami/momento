import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "var(--dash-bg,#f7f7fb)",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {/* 404 */}
        <div style={{
          fontSize: "clamp(80px,15vw,140px)",
          fontWeight: 800,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 16,
          fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
          fontStyle: "italic",
        }}>
          404
        </div>

        <h1 style={{
          fontSize: "clamp(1.2rem,3vw,1.6rem)",
          fontWeight: 700,
          color: "var(--dash-text,#121317)",
          margin: "0 0 10px",
          letterSpacing: "-0.02em",
        }}>
          Page introuvable
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--dash-text-2,#6a6a71)",
          margin: "0 0 32px",
          lineHeight: 1.6,
        }}>
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            padding: "11px 24px",
            borderRadius: 999,
            background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
            color: "#fff",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Retour à l&apos;accueil
          </Link>
          <Link href="/explore" style={{
            padding: "11px 24px",
            borderRadius: 999,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
            color: "var(--dash-text,#121317)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            textDecoration: "none",
            background: "var(--dash-surface,#fff)",
          }}>
            Explorer
          </Link>
        </div>
      </div>
    </div>
  )
}
