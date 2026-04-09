import Link from "next/link"
import { HelpCircle, Mail, MessageSquare, ChevronRight } from "lucide-react"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import Footer from "@/components/Footer"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default function HelpPage() {
  const faqItems = [
    {
      question: "Comment trouver un prestataire ?",
      answer: "Utilisez la page Explore pour parcourir nos prestataires par catégorie. Vous pouvez filtrer par ville et consulter les avis de chaque professionnel.",
    },
    {
      question: "Comment ajouter un prestataire à mes favoris ?",
      answer: "Cliquez sur le cœur (♡) sur la fiche du prestataire. Vos favoris seront enregistrés et accessible depuis la page 'Mes favoris'.",
    },
    {
      question: "Comment contacter un prestataire ?",
      answer: "Accédez à la fiche du prestataire et cliquez sur 'Contacter'. Un conversation sera créée et vous pourrez échanger via la page Messages.",
    },
    {
      question: "Comment créer un événement ?",
      answer: "Allez dans Mon espace et cliquez sur 'Créer un événement'. Vous pouvez alors planifier les détails et inviter des prestataires.",
    },
    {
      question: "Comment gérer mon profil ?",
      answer: "Accédez à la page Profil via le menu pour modifier vos informations personnelles, vos préférences et vos paramètres.",
    },
    {
      question: "Comment puis-je devenir prestataire Momento ?",
      answer: "Visitez notre page 'Devenir prestataire' pour créer un compte professionnel et présenter vos services à nos clients.",
    },
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Contactez-nous à tout moment",
      action: "support@momentoweddings.com",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Parlez directement avec notre équipe",
      action: "Envoyer un message",
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Nav */}
      <nav
        className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: C.anthracite, backgroundColor: C.ink }}
      >
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm transition-opacity hover:opacity-70" style={{ color: C.mist }}>
            ← Accueil
          </Link>
          <DarkModeToggle />
          <Link href="/login" className="text-sm" style={{ color: C.mist }}>
            Connexion
          </Link>
          <Link
            href="/prestataires"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Devenir prestataire
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle size={32} style={{ color: C.terra }} />
            <h1 className="text-4xl font-bold" style={{ color: C.white }}>
              Centre d'aide
            </h1>
          </div>
          <p className="text-base" style={{ color: C.mist }}>
            Trouvez les réponses aux questions courantes et apprenez à utiliser Momento
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: C.white }}>
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="rounded-xl border transition-all hover:border-opacity-75"
                style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer p-6 font-semibold select-none"
                  style={{ color: C.white }}
                >
                  <span>{item.question}</span>
                  <ChevronRight
                    size={20}
                    style={{ color: C.terra, transition: "transform 0.3s" }}
                    className="group-open:rotate-90"
                  />
                </summary>
                <div className="px-6 pb-6 pt-0" style={{ color: C.mist }}>
                  <p className="text-sm leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: C.white }}>
            Vous n'avez pas trouvé la réponse ?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {contactMethods.map((method, idx) => {
              const Icon = method.icon
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 border flex flex-col gap-4"
                  style={{ backgroundColor: C.dark, borderColor: C.anthracite }}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={24} style={{ color: C.terra, flexShrink: 0 }} />
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: C.white }}>
                        {method.title}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: C.mist }}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80 w-fit"
                    style={{ backgroundColor: C.terra, color: "#fff" }}
                  >
                    {method.action}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="rounded-2xl p-8 border text-center" style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
          <p className="text-base font-semibold mb-4" style={{ color: C.white }}>
            Découvrez comment Momento peut transformer votre événement
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Retour à l'accueil
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
