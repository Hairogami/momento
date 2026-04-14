import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Momento Events — Trouvez vos prestataires événementiels au Maroc",
  description: "Marketplace événementielle au Maroc — 1 000+ prestataires vérifiés, 41 villes, zéro commission.",
}

export default function CloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Plus Jakarta Sans — closest open-source match to Google Sans Flex */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Google+Symbols:opsz,wght,FILL,GRAD,ROND@40..48,300,0..1,0,50&display=block"
        rel="stylesheet"
      />
      <style>{`
        .ant-root * {
          font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
        }
        .ant-root .gs-icon {
          font-family: 'Google Symbols', 'Material Symbols Outlined';
          font-weight: normal; font-style: normal; display: inline-block;
        }
      `}</style>
      {children}
    </>
  )
}
