import Link from "next/link"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: "var(--momento-dark)",
        borderColor: "var(--momento-anthracite)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-bold tracking-[0.2em] uppercase text-base mb-2" style={{ color: "var(--momento-white)" }}>
              Momento
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--momento-mist)" }}>
              La plateforme événementielle du Maroc — prestataires vérifiés, zéro commission.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/momentoevents.ma" target="_blank" rel="noopener noreferrer"
                className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--momento-mist)" }}>
                Instagram
              </a>
              <span style={{ color: "var(--momento-anthracite)" }}>·</span>
              <a href="https://facebook.com/momentoevents" target="_blank" rel="noopener noreferrer"
                className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--momento-mist)" }}>
                Facebook
              </a>
            </div>
          </div>

          {/* Prestataires */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--momento-mist)" }}>
              Prestataires
            </p>
            <ul className="space-y-2">
              {[
                { href: "/explore?sub=Photographe", label: "Photographes" },
                { href: "/explore?sub=DJ", label: "DJs" },
                { href: "/explore?sub=Traiteur", label: "Traiteurs" },
                { href: "/explore?sub=Lieu+de+r%C3%A9ception", label: "Salles de fête" },
                { href: "/explore?sub=D%C3%A9corateur", label: "Décorateurs" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--momento-mist)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Espace */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--momento-mist)" }}>
              Mon espace
            </p>
            <ul className="space-y-2">
              {[
                { href: "/dashboard", label: "Tableau de bord" },
                { href: "/planner", label: "Planning" },
                { href: "/budget", label: "Budget" },
                { href: "/guests", label: "Invités" },
                { href: "/messages", label: "Messages" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--momento-mist)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--momento-mist)" }}>
              Légal
            </p>
            <ul className="space-y-2">
              {[
                { href: "/legal/mentions", label: "Mentions légales" },
                { href: "/legal/privacy", label: "Politique de confidentialité" },
                { href: "/legal/cgv", label: "CGU" },
                { href: "/help", label: "Aide & Contact" },
                { href: "/prestataire", label: "Espace Prestataire" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-opacity hover:opacity-80" style={{ color: "var(--momento-mist)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t"
          style={{ borderColor: "var(--momento-anthracite)" }}>
          <p className="text-xs" style={{ color: "var(--momento-mist)" }}>
            © {year} Momento — Tous droits réservés
          </p>
          <p className="text-xs" style={{ color: "var(--momento-mist)" }}>
            Fait avec ❤️ au Maroc · <a href="mailto:contact@momentoevents.app" className="hover:opacity-80">contact@momentoevents.app</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
