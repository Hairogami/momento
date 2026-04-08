import Link from "next/link"
import Footer from "@/components/Footer"
import { MomentoLogo } from "@/components/MomentoLogo"

export const metadata = {
  title: "Mentions légales — Momento",
  description: "Mentions légales de la plateforme Momento.",
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--momento-ink)" }}>
      <nav className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: "var(--momento-anthracite)", backgroundColor: "var(--momento-ink)" }}>
        <MomentoLogo iconSize={28} />
        <Link href="/" className="text-sm" style={{ color: "var(--momento-mist)" }}>← Accueil</Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--momento-white)" }}>Mentions légales</h1>
        <p className="text-sm mb-10" style={{ color: "var(--momento-mist)" }}>Dernière mise à jour : Avril 2026</p>

        {[
          {
            title: "Éditeur du site",
            content: "Momento est une plateforme éditoriale dédiée à l'événementiel au Maroc. Contact : contact@momentoevents.app",
          },
          {
            title: "Hébergement",
            content: "Le site est hébergé par Vercel Inc., 340 Pine Street, Suite 702, San Francisco, CA 94104, États-Unis.",
          },
          {
            title: "Propriété intellectuelle",
            content: "L'ensemble des contenus présents sur le site Momento (textes, images, graphismes, logo, icônes, etc.) sont protégés par le droit d'auteur. Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.",
          },
          {
            title: "Données personnelles",
            content: "Momento collecte et traite vos données personnelles conformément à sa politique de confidentialité. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant : contact@momentoevents.app",
          },
          {
            title: "Cookies",
            content: "Le site utilise des cookies techniques nécessaires au bon fonctionnement du service (session, préférences d'affichage). Aucun cookie publicitaire n'est utilisé sans votre consentement.",
          },
          {
            title: "Limitation de responsabilité",
            content: "Momento s'efforce de maintenir les informations publiées à jour et exactes. Toutefois, Momento ne garantit pas l'exactitude, la complétude ou l'actualité des informations diffusées sur ce site.",
          },
        ].map(({ title, content }) => (
          <div key={title} className="mb-8">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--momento-white)" }}>{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--momento-mist)" }}>{content}</p>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}
