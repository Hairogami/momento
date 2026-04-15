const LINKS = {
  "Plateforme": ["Explorer", "Prestataires", "Événements", "Tarifs"],
  "Entreprise": ["À propos", "Contact", "CGU", "Confidentialité"],
}

const SOCIALS = [
  { label: "Instagram", short: "In", href: "#" },
  { label: "Facebook",  short: "Fb", href: "#" },
  { label: "TikTok",    short: "Tt", href: "#" },
]

export default function AntFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--dash-bg,#fff)",
        borderTop: "1px solid rgba(183,191,217,0.2)",
        padding: "56px 0 40px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div>
            <div
              className="clone-heading"
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--dash-text,#121317)",
              }}
            >
              Des événements<br />inoubliables
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  className="clone-border"
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(183,191,217,0.1)",
                    border: "1px solid rgba(183,191,217,0.22)",
                    fontSize: 10, fontWeight: 700, color: "var(--dash-text-2,#6a6a71)",
                    textDecoration: "none",
                  }}
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-16">
            {Object.entries(LINKS).map(([col, links]) => (
              <div key={col} className="flex flex-col gap-3">
                <div className="clone-heading" style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                  {col}
                </div>
                {links.map(link => (
                  <a
                    key={link}
                    href="#"
                    className="clone-body text-sm transition-colors hover:text-black"
                    style={{ color: "var(--dash-text-2,#6a6a71)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div
          className="clone-card"
          style={{
            marginTop: 48,
            padding: "24px 28px",
            borderRadius: 16,
            background: "rgba(183,191,217,0.07)",
            border: "1px solid rgba(183,191,217,0.18)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="clone-heading" style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text,#121317)", marginBottom: 4 }}>
                10 conseils pour organiser votre événement au Maroc
              </div>
              <p className="clone-muted" style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)" }}>
                Guides, check-lists et prestataires du mois — dans votre boîte mail.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="votre@email.com"
                style={{
                  padding: "9px 16px", borderRadius: 99,
                  border: "1px solid rgba(183,191,217,0.3)",
                  fontSize: 13, outline: "none",
                  minWidth: 200, background: "transparent", color: "var(--dash-text,#121317)",
                }}
              />
              <button style={{
                padding: "9px 20px", borderRadius: 99,
                background: "#121317", color: "#fff",
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: "none", whiteSpace: "nowrap",
              }}>
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-6"
          style={{ borderTop: "1px solid rgba(183,191,217,0.2)" }}
        >
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="Momento" width={16} height={16} className="clone-logo-light" style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="Momento" width={16} height={16} className="clone-logo-dark" style={{ objectFit: "contain", display: "none" }} />
            <span className="clone-muted" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)" }}>© 2025 Momento Events · Maroc</span>
          </div>
          <div className="flex gap-5">
            {["À propos", "Confidentialité", "CGU"].map(link => (
              <a key={link} href="#" className="clone-body transition-colors hover:text-black" style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)" }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
