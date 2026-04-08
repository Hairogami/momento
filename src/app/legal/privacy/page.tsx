import Link from "next/link"
import Footer from "@/components/Footer"
import { MomentoLogo } from "@/components/MomentoLogo"

export const metadata = {
  title: "Politique de confidentialité — Momento",
  description: "Politique de confidentialité et protection des données de Momento.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--momento-ink)" }}>
      <nav className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: "var(--momento-anthracite)", backgroundColor: "var(--momento-ink)" }}>
        <MomentoLogo iconSize={28} />
        <Link href="/" className="text-sm" style={{ color: "var(--momento-mist)" }}>← Accueil</Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--momento-white)" }}>
          Politique de confidentialité
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--momento-mist)" }}>Dernière mise à jour : Avril 2026</p>

        {[
          {
            title: "Données collectées",
            content: "Lors de votre inscription, Momento collecte votre nom, adresse email et, optionnellement, votre photo de profil (depuis votre fournisseur OAuth). Lors de l'utilisation du service, nous collectons les données que vous saisissez (tâches, budget, liste d'invités, messages).",
          },
          {
            title: "Utilisation des données",
            content: "Vos données sont utilisées exclusivement pour le fonctionnement du service Momento : authentification, personnalisation de votre espace, communication avec les prestataires. Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.",
          },
          {
            title: "Conservation des données",
            content: "Vos données sont conservées pendant la durée de vie de votre compte. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment en contactant : contact@momentoevents.app",
          },
          {
            title: "Sécurité",
            content: "Vos données sont stockées de manière sécurisée sur des serveurs hébergés par Neon (base de données) et Vercel (application). Les communications sont chiffrées via HTTPS/TLS.",
          },
          {
            title: "Vos droits",
            content: "Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à : contact@momentoevents.app",
          },
          {
            title: "Contact",
            content: "Pour toute question relative à la protection de vos données personnelles : contact@momentoevents.app",
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
