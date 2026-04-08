import type { Metadata } from "next"

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "musique-dj":     { title: "Musique & DJ",          description: "Trouvez les meilleurs DJs, chanteurs et orchestres pour votre mariage ou événement au Maroc." },
  "traiteur":       { title: "Traiteur & Cuisine",     description: "Découvrez les meilleurs traiteurs, pâtissiers et mixologues pour vos événements au Maroc." },
  "photo-video":    { title: "Photographe & Vidéaste", description: "Immortalisez votre mariage avec les meilleurs photographes et vidéastes événementiels au Maroc." },
  "lieu":           { title: "Lieux de réception",     description: "Trouvez la salle de fête idéale pour votre mariage ou événement au Maroc." },
  "decor-lumieres": { title: "Décoration & Lumières",  description: "Décorateurs, fleuristes et créateurs d'ambiance pour sublimer votre événement au Maroc." },
  "beaute":         { title: "Beauté & Coiffure",      description: "Hairstylists, makeup artists et neggafas pour le plus beau jour de votre vie au Maroc." },
  "neggafa":        { title: "Neggafa traditionnelle", description: "Les meilleures neggafas du Maroc pour habiller la mariée selon la tradition marocaine." },
  "planification":  { title: "Wedding Planner",        description: "Confiez l'organisation de votre mariage à un wedding planner ou event planner au Maroc." },
  "animation":      { title: "Animation & Spectacles", description: "Animateurs, magiciens et attractions pour divertir vos invités lors de votre événement." },
  "transport":      { title: "Transport & Location",   description: "Location de voitures de mariage et VTC pour transporter vos invités au Maroc." },
  "securite":       { title: "Sécurité événementielle",description: "Services de sécurité professionnels pour vos événements et mariages au Maroc." },
  "cadeaux":        { title: "Cadeaux & Faire-part",   description: "Créateurs de cadeaux invités, faire-part et papeterie pour votre mariage au Maroc." },
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const meta = CATEGORY_META[category]

  if (!meta) {
    return {
      title: "Prestataires événementiels au Maroc | Momento",
      description: "Découvrez les meilleurs prestataires pour votre mariage et événements au Maroc sur Momento.",
    }
  }

  const title = `${meta.title} au Maroc — Prestataires événementiels | Momento`
  const description = meta.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://momentoevents.app/explore/${category}`,
      siteName: "Momento",
      locale: "fr_MA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://momentoevents.app/explore/${category}`,
    },
  }
}

export default function CategoryLayout({ children }: { children: import("react").ReactNode }) {
  return <>{children}</>
}
