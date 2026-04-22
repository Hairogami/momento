/**
 * Momento — Event Types Reference
 *
 * Source unique de vérité pour :
 *   • Les 10 familles d'événements + sous-types
 *   • Le budget médian MAD par sous-type et ville
 *   • Les catégories prestataires pré-cochées par sous-type
 *   • La répartition budget par catégorie (doit sommer à 100)
 *
 * Les labels catégories correspondent aux valeurs stockées dans Vendor.category (DB).
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type EventFamilyId =
  | "mariage"
  | "fete"
  | "naissance"
  | "milestones"
  | "corporate"
  | "conference"
  | "religieux"
  | "caritatif"
  | "loisirs"
  | "autre"

export type City = "casablanca" | "rabat" | "marrakech" | "default"

export type BudgetByCity = Partial<Record<City, number>> & { default: number }

export type EventSubType = {
  id: string                  // slug stable (persisté sur Planner.eventSubType)
  label: string               // libellé humain affiché au client
  description?: string
  emoji?: string
  budgetMedian: BudgetByCity  // MAD
  defaultCategories: string[] // catégories pré-cochées (matchent Vendor.category)
  budgetBreakdown: Record<string, number> // % par catégorie (doit sommer à 100)
}

export type EventFamily = {
  id: EventFamilyId
  label: string
  emoji: string
  description: string
  subtypes: EventSubType[]
}

// ── Catégories canoniques (subset des 31 en DB, utilisées pour la répartition) ─

export const CATEGORY = {
  photo:      "Photographe",
  video:      "Vidéaste",
  traiteur:   "Traiteur",
  salle:      "Lieu de réception",
  dj:         "DJ",
  orchestre:  "Orchestre",
  decor:      "Décorateur",
  fleur:      "Fleuriste événementiel",
  mua:        "Makeup Artist",
  coiffure:   "Hairstylist",
  neggafa:    "Neggafa",
  dekka:      "Dekka Marrakchia / Issawa",
  robe:       "Robes de mariés",
  patissier:  "Pâtissier / Cake designer",
  bar:        "Service de bar / mixologue",
  transport:  "VTC / Transport invités",
  voiture:    "Location de voiture de mariage",
  animateur:  "Animateur enfants",
  magicien:   "Magicien",
  chanteur:   "Chanteur / chanteuse",
  violoniste: "Violoniste",
  eventPlanner:  "Event planner",
  weddingPlanner:"Wedding planner",
  securite:   "Sécurité événementielle",
  structures: "Structures événementielles",
  lumiere:    "Créateur d'ambiance lumineuse",
  cadeaux:    "Créateur de cadeaux invités",
  fairePart:  "Créateur de faire-part",
  jeuxEnfants:"Jeux & animations enfants",
  gonflables: "Structures gonflables",
  spa:        "Spa / soins esthétiques",
} as const

export type CategoryKey = keyof typeof CATEGORY

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getBudgetMedian(subtype: EventSubType, city: string): number {
  const key = city.toLowerCase().replace(/\s+/g, "") as City
  return subtype.budgetMedian[key] ?? subtype.budgetMedian.default
}

export function getEventFamily(id: EventFamilyId): EventFamily | undefined {
  return EVENT_FAMILIES.find(f => f.id === id)
}

export function getEventSubType(familyId: EventFamilyId, subtypeId: string): EventSubType | undefined {
  return getEventFamily(familyId)?.subtypes.find(s => s.id === subtypeId)
}

export function getAllSubTypes(): Array<EventSubType & { familyId: EventFamilyId }> {
  return EVENT_FAMILIES.flatMap(f => f.subtypes.map(s => ({ ...s, familyId: f.id })))
}

// ── Familles + sous-types ────────────────────────────────────────────────────

const MARIAGE: EventFamily = {
  id: "mariage",
  label: "Mariage & Union",
  emoji: "💍",
  description: "Cérémonies de mariage et unions festives",
  subtypes: [
    {
      id: "traditionnel",
      label: "Mariage traditionnel",
      description: "Cérémonie complète avec dekka, neggafa, tenues traditionnelles",
      emoji: "🏛️",
      budgetMedian: { default: 150_000, casablanca: 150_000, rabat: 130_000, marrakech: 180_000 },
      defaultCategories: [
        CATEGORY.photo, CATEGORY.video, CATEGORY.traiteur, CATEGORY.salle,
        CATEGORY.dj, CATEGORY.decor, CATEGORY.fleur, CATEGORY.mua,
      ],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 30, [CATEGORY.salle]: 25, [CATEGORY.photo]: 15,
        [CATEGORY.dj]: 10, [CATEGORY.video]: 8, [CATEGORY.decor]: 7,
        [CATEGORY.fleur]: 3, [CATEGORY.mua]: 2,
      },
    },
    {
      id: "micro",
      label: "Micro-mariage",
      description: "Intime, famille proche, ≤ 40 invités",
      emoji: "💒",
      budgetMedian: { default: 55_000, casablanca: 55_000, rabat: 48_000, marrakech: 65_000 },
      defaultCategories: [
        CATEGORY.photo, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.video,
        CATEGORY.decor, CATEGORY.mua,
      ],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 45, [CATEGORY.photo]: 18, [CATEGORY.salle]: 12,
        [CATEGORY.video]: 10, [CATEGORY.decor]: 6, [CATEGORY.dj]: 5,
        [CATEGORY.fleur]: 3, [CATEGORY.mua]: 1,
      },
    },
    {
      id: "destination",
      label: "Destination wedding",
      description: "Marrakech, Essaouira, Fès — logistique lourde",
      emoji: "🏖️",
      budgetMedian: { default: 320_000, marrakech: 320_000, casablanca: 280_000 },
      defaultCategories: [
        CATEGORY.photo, CATEGORY.video, CATEGORY.traiteur, CATEGORY.salle,
        CATEGORY.dj, CATEGORY.decor, CATEGORY.transport, CATEGORY.weddingPlanner,
      ],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.traiteur]: 18, [CATEGORY.transport]: 15,
        [CATEGORY.photo]: 12, [CATEGORY.video]: 10, [CATEGORY.dj]: 5,
        [CATEGORY.decor]: 3, [CATEGORY.mua]: 2,
      },
    },
    {
      id: "fiancailles",
      label: "Fiançailles (khotba)",
      description: "Cérémonie familiale, 50-80 invités",
      emoji: "💐",
      budgetMedian: { default: 45_000, casablanca: 45_000, rabat: 40_000, marrakech: 55_000 },
      defaultCategories: [
        CATEGORY.photo, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj,
        CATEGORY.decor, CATEGORY.fleur, CATEGORY.mua,
      ],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 40, [CATEGORY.salle]: 25, [CATEGORY.photo]: 12,
        [CATEGORY.dj]: 10, [CATEGORY.decor]: 8, [CATEGORY.fleur]: 3, [CATEGORY.mua]: 2,
      },
    },
    {
      id: "henne",
      label: "Soirée du henné",
      description: "Soirée femmes traditionnelle avant le mariage",
      emoji: "🌿",
      budgetMedian: { default: 30_000, casablanca: 30_000, rabat: 26_000, marrakech: 38_000 },
      defaultCategories: [
        CATEGORY.photo, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj,
        CATEGORY.decor, CATEGORY.neggafa, CATEGORY.mua,
      ],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 35, [CATEGORY.salle]: 25, [CATEGORY.decor]: 12,
        [CATEGORY.dj]: 10, [CATEGORY.neggafa]: 10, [CATEGORY.photo]: 6, [CATEGORY.mua]: 2,
      },
    },
    {
      id: "evjg-evjf",
      label: "EVJG / EVJF",
      description: "Enterrement de vie — weekend ou soirée",
      emoji: "🍾",
      budgetMedian: { default: 12_000 },
      defaultCategories: [CATEGORY.photo, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.traiteur]: 30, [CATEGORY.dj]: 20,
        [CATEGORY.photo]: 10, [CATEGORY.decor]: 5,
      },
    },
  ],
}

const FETE: EventFamily = {
  id: "fete",
  label: "Fête & Célébration",
  emoji: "🎉",
  description: "Anniversaires, soirées privées, célébrations",
  subtypes: [
    {
      id: "anniv-adulte",
      label: "Anniversaire adulte",
      emoji: "🎂",
      budgetMedian: { default: 22_000 },
      defaultCategories: [CATEGORY.photo, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj, CATEGORY.decor, CATEGORY.patissier],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 38, [CATEGORY.salle]: 28, [CATEGORY.dj]: 12,
        [CATEGORY.photo]: 10, [CATEGORY.decor]: 5, [CATEGORY.patissier]: 5, [CATEGORY.mua]: 2,
      },
    },
    {
      id: "anniv-enfant",
      label: "Anniversaire enfant",
      emoji: "🎈",
      budgetMedian: { default: 8_000 },
      defaultCategories: [CATEGORY.animateur, CATEGORY.patissier, CATEGORY.decor, CATEGORY.photo, CATEGORY.jeuxEnfants],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 25, [CATEGORY.animateur]: 20, [CATEGORY.decor]: 15,
        [CATEGORY.patissier]: 12, [CATEGORY.jeuxEnfants]: 12, [CATEGORY.photo]: 10, [CATEGORY.gonflables]: 6,
      },
    },
    {
      id: "soiree-privee",
      label: "Soirée privée",
      emoji: "🌙",
      budgetMedian: { default: 18_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj, CATEGORY.decor, CATEGORY.bar],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 35, [CATEGORY.salle]: 25, [CATEGORY.dj]: 15,
        [CATEGORY.bar]: 10, [CATEGORY.decor]: 10, [CATEGORY.photo]: 5,
      },
    },
    {
      id: "theme",
      label: "Soirée à thème",
      emoji: "🎭",
      budgetMedian: { default: 25_000 },
      defaultCategories: [CATEGORY.decor, CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.decor]: 30, [CATEGORY.traiteur]: 25, [CATEGORY.salle]: 20,
        [CATEGORY.dj]: 12, [CATEGORY.photo]: 8, [CATEGORY.bar]: 5,
      },
    },
    {
      id: "pool-party",
      label: "Pool party",
      emoji: "🏊",
      budgetMedian: { default: 20_000, marrakech: 25_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj, CATEGORY.bar, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.traiteur]: 25, [CATEGORY.bar]: 15,
        [CATEGORY.dj]: 12, [CATEGORY.photo]: 8, [CATEGORY.decor]: 5,
      },
    },
    {
      id: "rooftop",
      label: "Soirée rooftop",
      emoji: "🌆",
      budgetMedian: { default: 28_000, casablanca: 35_000, marrakech: 30_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.dj, CATEGORY.bar, CATEGORY.decor, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.traiteur]: 25, [CATEGORY.dj]: 15,
        [CATEGORY.bar]: 12, [CATEGORY.decor]: 10, [CATEGORY.photo]: 8,
      },
    },
  ],
}

const NAISSANCE: EventFamily = {
  id: "naissance",
  label: "Naissance & Famille",
  emoji: "👶",
  description: "Célébrations autour de la naissance",
  subtypes: [
    {
      id: "aqiqa",
      label: "Aqiqa",
      description: "Cérémonie traditionnelle, 7e jour après la naissance",
      emoji: "🕊️",
      budgetMedian: { default: 18_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.dj, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 45, [CATEGORY.salle]: 22, [CATEGORY.decor]: 12,
        [CATEGORY.dj]: 8, [CATEGORY.photo]: 10, [CATEGORY.fleur]: 3,
      },
    },
    {
      id: "baby-shower",
      label: "Baby shower",
      emoji: "👶",
      budgetMedian: { default: 10_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.patissier, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 30, [CATEGORY.salle]: 20, [CATEGORY.decor]: 20,
        [CATEGORY.patissier]: 15, [CATEGORY.photo]: 10, [CATEGORY.fleur]: 5,
      },
    },
    {
      id: "gender-reveal",
      label: "Gender reveal",
      emoji: "💙💗",
      budgetMedian: { default: 8_000 },
      defaultCategories: [CATEGORY.decor, CATEGORY.patissier, CATEGORY.photo, CATEGORY.traiteur],
      budgetBreakdown: {
        [CATEGORY.decor]: 30, [CATEGORY.traiteur]: 25, [CATEGORY.patissier]: 20,
        [CATEGORY.photo]: 15, [CATEGORY.fleur]: 10,
      },
    },
    {
      id: "bapteme",
      label: "Baptême",
      emoji: "✨",
      budgetMedian: { default: 15_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.photo, CATEGORY.patissier],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 40, [CATEGORY.salle]: 25, [CATEGORY.patissier]: 12,
        [CATEGORY.decor]: 10, [CATEGORY.photo]: 8, [CATEGORY.fleur]: 5,
      },
    },
    {
      id: "reunion-famille",
      label: "Réunion de famille",
      emoji: "👨‍👩‍👧‍👦",
      budgetMedian: { default: 12_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.photo, CATEGORY.jeuxEnfants],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 50, [CATEGORY.salle]: 25, [CATEGORY.photo]: 10,
        [CATEGORY.jeuxEnfants]: 10, [CATEGORY.decor]: 5,
      },
    },
  ],
}

const MILESTONES: EventFamily = {
  id: "milestones",
  label: "Milestones",
  emoji: "🎓",
  description: "Grandes étapes de la vie",
  subtypes: [
    {
      id: "diplome",
      label: "Remise de diplôme",
      emoji: "🎓",
      budgetMedian: { default: 14_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.photo, CATEGORY.decor, CATEGORY.dj],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 40, [CATEGORY.salle]: 25, [CATEGORY.photo]: 15,
        [CATEGORY.decor]: 10, [CATEGORY.dj]: 10,
      },
    },
    {
      id: "cremaillere",
      label: "Crémaillère",
      emoji: "🏡",
      budgetMedian: { default: 9_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.decor, CATEGORY.photo, CATEGORY.dj],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 45, [CATEGORY.decor]: 20, [CATEGORY.dj]: 15,
        [CATEGORY.photo]: 12, [CATEGORY.bar]: 8,
      },
    },
    {
      id: "retraite",
      label: "Départ en retraite",
      emoji: "🌺",
      budgetMedian: { default: 16_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.photo, CATEGORY.decor, CATEGORY.dj],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 38, [CATEGORY.salle]: 25, [CATEGORY.decor]: 12,
        [CATEGORY.photo]: 15, [CATEGORY.dj]: 10,
      },
    },
    {
      id: "lancement-business",
      label: "Lancement business",
      emoji: "🚀",
      budgetMedian: { default: 35_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.photo, CATEGORY.video, CATEGORY.decor, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.traiteur]: 25, [CATEGORY.video]: 15,
        [CATEGORY.photo]: 12, [CATEGORY.decor]: 10, [CATEGORY.eventPlanner]: 8,
      },
    },
  ],
}

const CORPORATE: EventFamily = {
  id: "corporate",
  label: "Corporate",
  emoji: "💼",
  description: "Événements d'entreprise",
  subtypes: [
    {
      id: "seminaire",
      label: "Séminaire d'entreprise",
      emoji: "🎯",
      budgetMedian: { default: 80_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner, CATEGORY.video, CATEGORY.photo, CATEGORY.transport],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.traiteur]: 30, [CATEGORY.eventPlanner]: 12,
        [CATEGORY.transport]: 8, [CATEGORY.video]: 8, [CATEGORY.photo]: 7,
      },
    },
    {
      id: "team-building",
      label: "Team building",
      emoji: "🤝",
      budgetMedian: { default: 45_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner, CATEGORY.photo, CATEGORY.animateur],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.eventPlanner]: 25, [CATEGORY.traiteur]: 20,
        [CATEGORY.animateur]: 10, [CATEGORY.photo]: 8, [CATEGORY.transport]: 7,
      },
    },
    {
      id: "gala-corporate",
      label: "Gala corporate",
      emoji: "🎭",
      budgetMedian: { default: 150_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.decor, CATEGORY.video, CATEGORY.photo, CATEGORY.dj, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 28, [CATEGORY.traiteur]: 25, [CATEGORY.decor]: 15,
        [CATEGORY.video]: 10, [CATEGORY.photo]: 8, [CATEGORY.dj]: 8, [CATEGORY.eventPlanner]: 6,
      },
    },
    {
      id: "lancement-produit",
      label: "Lancement produit",
      emoji: "🎁",
      budgetMedian: { default: 100_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.video, CATEGORY.traiteur, CATEGORY.decor, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 28, [CATEGORY.video]: 22, [CATEGORY.traiteur]: 18,
        [CATEGORY.decor]: 15, [CATEGORY.photo]: 10, [CATEGORY.eventPlanner]: 7,
      },
    },
    {
      id: "inauguration",
      label: "Inauguration",
      emoji: "🎗️",
      budgetMedian: { default: 55_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.decor, CATEGORY.video, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 30, [CATEGORY.decor]: 25, [CATEGORY.video]: 15,
        [CATEGORY.photo]: 12, [CATEGORY.salle]: 10, [CATEGORY.eventPlanner]: 8,
      },
    },
  ],
}

const CONFERENCE: EventFamily = {
  id: "conference",
  label: "Conférence & Formation",
  emoji: "🎤",
  description: "Conférences, workshops, formations",
  subtypes: [
    {
      id: "conference",
      label: "Conférence",
      emoji: "🎙️",
      budgetMedian: { default: 60_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.video, CATEGORY.eventPlanner, CATEGORY.traiteur, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.salle]: 40, [CATEGORY.video]: 20, [CATEGORY.traiteur]: 20,
        [CATEGORY.eventPlanner]: 10, [CATEGORY.photo]: 10,
      },
    },
    {
      id: "workshop",
      label: "Workshop",
      emoji: "🛠️",
      budgetMedian: { default: 15_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 50, [CATEGORY.traiteur]: 30, [CATEGORY.eventPlanner]: 15, [CATEGORY.photo]: 5,
      },
    },
    {
      id: "hackathon",
      label: "Hackathon",
      emoji: "💻",
      budgetMedian: { default: 35_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner, CATEGORY.video],
      budgetBreakdown: {
        [CATEGORY.salle]: 45, [CATEGORY.traiteur]: 30, [CATEGORY.eventPlanner]: 12,
        [CATEGORY.video]: 8, [CATEGORY.photo]: 5,
      },
    },
    {
      id: "salon-pro",
      label: "Salon professionnel",
      emoji: "🏢",
      budgetMedian: { default: 120_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.structures, CATEGORY.eventPlanner, CATEGORY.traiteur, CATEGORY.video, CATEGORY.photo, CATEGORY.securite],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.structures]: 25, [CATEGORY.eventPlanner]: 15,
        [CATEGORY.traiteur]: 12, [CATEGORY.securite]: 8, [CATEGORY.video]: 5, [CATEGORY.photo]: 5,
      },
    },
    {
      id: "webinaire",
      label: "Webinaire (hybride)",
      emoji: "📡",
      budgetMedian: { default: 12_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.video, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.video]: 55, [CATEGORY.salle]: 25, [CATEGORY.eventPlanner]: 15, [CATEGORY.photo]: 5,
      },
    },
  ],
}

const RELIGIEUX: EventFamily = {
  id: "religieux",
  label: "Religieux & Culturel",
  emoji: "🌙",
  description: "Cérémonies religieuses et culturelles marocaines",
  subtypes: [
    {
      id: "iftar-collectif",
      label: "Iftar collectif",
      emoji: "🕌",
      budgetMedian: { default: 25_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 55, [CATEGORY.salle]: 25, [CATEGORY.decor]: 10,
        [CATEGORY.photo]: 5, [CATEGORY.fleur]: 5,
      },
    },
    {
      id: "aid-fitr",
      label: "Aïd el-Fitr",
      emoji: "🌙",
      budgetMedian: { default: 18_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.patissier, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 45, [CATEGORY.salle]: 25, [CATEGORY.patissier]: 12,
        [CATEGORY.decor]: 10, [CATEGORY.photo]: 8,
      },
    },
    {
      id: "aid-adha",
      label: "Aïd el-Adha",
      emoji: "🕋",
      budgetMedian: { default: 22_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 60, [CATEGORY.salle]: 20, [CATEGORY.decor]: 10, [CATEGORY.photo]: 10,
      },
    },
    {
      id: "mawlid",
      label: "Mawlid",
      emoji: "✨",
      budgetMedian: { default: 20_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.decor, CATEGORY.orchestre, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 40, [CATEGORY.salle]: 25, [CATEGORY.orchestre]: 15,
        [CATEGORY.decor]: 10, [CATEGORY.photo]: 10,
      },
    },
    {
      id: "moussem",
      label: "Moussem",
      emoji: "🎪",
      budgetMedian: { default: 35_000 },
      defaultCategories: [CATEGORY.traiteur, CATEGORY.salle, CATEGORY.structures, CATEGORY.orchestre, CATEGORY.photo, CATEGORY.securite],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.traiteur]: 25, [CATEGORY.structures]: 15,
        [CATEGORY.orchestre]: 12, [CATEGORY.securite]: 10, [CATEGORY.photo]: 8,
      },
    },
  ],
}

const CARITATIF: EventFamily = {
  id: "caritatif",
  label: "Caritatif",
  emoji: "🤝",
  description: "Galas, collectes, actions associatives",
  subtypes: [
    {
      id: "gala-caritatif",
      label: "Gala caritatif",
      emoji: "🎗️",
      budgetMedian: { default: 120_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner, CATEGORY.video, CATEGORY.photo, CATEGORY.decor, CATEGORY.dj],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.traiteur]: 28, [CATEGORY.decor]: 12,
        [CATEGORY.video]: 10, [CATEGORY.eventPlanner]: 10, [CATEGORY.photo]: 6, [CATEGORY.dj]: 4,
      },
    },
    {
      id: "collecte-fonds",
      label: "Collecte de fonds",
      emoji: "💝",
      budgetMedian: { default: 40_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.video, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.traiteur]: 25, [CATEGORY.video]: 15,
        [CATEGORY.eventPlanner]: 12, [CATEGORY.photo]: 8, [CATEGORY.decor]: 5,
      },
    },
    {
      id: "evenement-associatif",
      label: "Événement associatif",
      emoji: "🌱",
      budgetMedian: { default: 20_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 40, [CATEGORY.traiteur]: 30, [CATEGORY.eventPlanner]: 12,
        [CATEGORY.photo]: 10, [CATEGORY.decor]: 8,
      },
    },
  ],
}

const LOISIRS: EventFamily = {
  id: "loisirs",
  label: "Loisirs & Expériences",
  emoji: "🎵",
  description: "Festivals, tournois, expériences",
  subtypes: [
    {
      id: "festival",
      label: "Festival",
      emoji: "🎪",
      budgetMedian: { default: 180_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.structures, CATEGORY.orchestre, CATEGORY.traiteur, CATEGORY.securite, CATEGORY.video, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 22, [CATEGORY.structures]: 20, [CATEGORY.orchestre]: 20,
        [CATEGORY.traiteur]: 12, [CATEGORY.securite]: 10, [CATEGORY.video]: 6,
        [CATEGORY.photo]: 5, [CATEGORY.eventPlanner]: 5,
      },
    },
    {
      id: "tournoi",
      label: "Tournoi sportif",
      emoji: "🏆",
      budgetMedian: { default: 50_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.eventPlanner, CATEGORY.photo, CATEGORY.video, CATEGORY.securite],
      budgetBreakdown: {
        [CATEGORY.salle]: 40, [CATEGORY.traiteur]: 22, [CATEGORY.eventPlanner]: 12,
        [CATEGORY.securite]: 10, [CATEGORY.photo]: 8, [CATEGORY.video]: 8,
      },
    },
    {
      id: "degustation",
      label: "Dégustation (vin, thé, chocolat)",
      emoji: "🍷",
      budgetMedian: { default: 18_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.bar, CATEGORY.photo, CATEGORY.decor],
      budgetBreakdown: {
        [CATEGORY.traiteur]: 35, [CATEGORY.salle]: 25, [CATEGORY.bar]: 20,
        [CATEGORY.decor]: 10, [CATEGORY.photo]: 10,
      },
    },
    {
      id: "retraite-bien-etre",
      label: "Retraite bien-être",
      emoji: "🧘",
      budgetMedian: { default: 45_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.spa, CATEGORY.eventPlanner, CATEGORY.photo],
      budgetBreakdown: {
        [CATEGORY.salle]: 35, [CATEGORY.spa]: 25, [CATEGORY.traiteur]: 22,
        [CATEGORY.eventPlanner]: 10, [CATEGORY.photo]: 8,
      },
    },
    {
      id: "glamping",
      label: "Glamping / retraite nature",
      emoji: "⛺",
      budgetMedian: { default: 60_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.structures, CATEGORY.transport, CATEGORY.photo, CATEGORY.eventPlanner],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.structures]: 20, [CATEGORY.traiteur]: 20,
        [CATEGORY.transport]: 12, [CATEGORY.eventPlanner]: 10, [CATEGORY.photo]: 8,
      },
    },
  ],
}

const AUTRE: EventFamily = {
  id: "autre",
  label: "Autre / Personnalisé",
  emoji: "✨",
  description: "Événement sur-mesure",
  subtypes: [
    {
      id: "personnalise",
      label: "Événement personnalisé",
      emoji: "✨",
      budgetMedian: { default: 50_000 },
      defaultCategories: [CATEGORY.salle, CATEGORY.traiteur, CATEGORY.photo, CATEGORY.decor],
      budgetBreakdown: {
        [CATEGORY.salle]: 30, [CATEGORY.traiteur]: 30, [CATEGORY.decor]: 15,
        [CATEGORY.photo]: 10, [CATEGORY.dj]: 8, [CATEGORY.fleur]: 7,
      },
    },
  ],
}

// ── Export ──────────────────────────────────────────────────────────────────

export const EVENT_FAMILIES: EventFamily[] = [
  MARIAGE, FETE, NAISSANCE, MILESTONES, CORPORATE,
  CONFERENCE, RELIGIEUX, CARITATIF, LOISIRS, AUTRE,
]
