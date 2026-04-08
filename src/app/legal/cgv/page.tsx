import Link from "next/link"
import Footer from "@/components/Footer"
import { MomentoLogo } from "@/components/MomentoLogo"

export const metadata = {
  title: "Conditions Générales de Vente — Momento",
  description: "Conditions générales de vente et d'utilisation de la plateforme Momento.",
}

export default function CGVPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--momento-ink)" }}>
      <nav className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: "var(--momento-anthracite)", backgroundColor: "var(--momento-ink)" }}>
        <MomentoLogo iconSize={28} />
        <Link href="/" className="text-sm" style={{ color: "var(--momento-mist)" }}>← Accueil</Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--momento-white)" }}>
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--momento-mist)" }}>Dernière mise à jour : Avril 2026</p>

        {[
          {
            title: "1. Objet",
            content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Momento, accessible à l'adresse momentoevents.app. En utilisant la plateforme, vous acceptez sans réserve les présentes CGU.",
          },
          {
            title: "2. Accès au service",
            content: "L'inscription est gratuite pour les particuliers. L'accès complet aux fonctionnalités nécessite la création d'un compte. Momento se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.",
          },
          {
            title: "3. Rôle de la plateforme",
            content: "Momento est une plateforme de mise en relation entre particuliers organisant des événements et des prestataires professionnels. Momento n'est pas partie aux contrats conclus entre les utilisateurs et les prestataires, et n'est pas responsable de l'exécution de ces contrats.",
          },
          {
            title: "4. Responsabilités des prestataires",
            content: "Les prestataires inscrits sur la plateforme sont responsables de l'exactitude des informations qu'ils fournissent. Ils s'engagent à respecter leurs obligations légales et fiscales en tant que professionnels.",
          },
          {
            title: "5. Propriété intellectuelle",
            content: "Le contenu publié par les utilisateurs (textes, photos) reste leur propriété. En le publiant sur Momento, ils accordent à Momento une licence non exclusive d'utilisation à des fins de promotion du service.",
          },
          {
            title: "6. Modification des CGU",
            content: "Momento se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou notification sur la plateforme.",
          },
          {
            title: "7. Droit applicable",
            content: "Les présentes CGU sont soumises au droit marocain. Tout litige sera soumis aux tribunaux compétents du Maroc.",
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
