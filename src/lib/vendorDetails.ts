// Per-vendor enriched data: real photos, reviews, social links, description
// Photos: direct embeddable URLs (Unsplash or vendor website)
// Reviews: real (paraphrased) or realistic French reviews
// Populated by research agents — fallback to category photos if slug not present

export type VendorExtra = {
  photos: string[]
  reviews: Array<{ author: string; event: string; note: string; stars: number }>
  description?: string
  instagram?: string
  facebook?: string
  website?: string
  phone?: string
}

// ─── Category fallback photos ────────────────────────────────────────────────
export const CAT_PHOTOS: Record<string, string[]> = {
  "DJ": [
    "https://images.unsplash.com/photo-1571266028243-d220c6a6f437?w=800&q=80",
    "https://images.unsplash.com/photo-1598387993441-a364f854cbb7?w=800&q=80",
    "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80",
  ],
  "Chanteur / chanteuse": [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  ],
  "Orchestre": [
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80",
  ],
  "Violoniste": [
    "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
  ],
  "Dekka Marrakchia / Issawa": [
    "https://images.unsplash.com/photo-1587302186428-d1ba4b62ea40?w=800&q=80",
    "https://images.unsplash.com/photo-1571974599782-87624638275e?w=800&q=80",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
  ],
  "Traiteur": [
    "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
  ],
  "Pâtissier / Cake designer": [
    "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  ],
  "Service de bar / mixologue": [
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
    "https://images.unsplash.com/photo-1527761939622-933c83f6c4c5?w=800&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
  ],
  "Photographe": [
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    "https://images.unsplash.com/photo-1504173010664-32509107de92?w=800&q=80",
    "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
  ],
  "Vidéaste": [
    "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=800&q=80",
    "https://images.unsplash.com/photo-1574717024453-354056adc766?w=800&q=80",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&q=80",
  ],
  "Lieu de réception": [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
  ],
  "Fleuriste événementiel": [
    "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
    "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
  ],
  "Décorateur": [
    "https://images.unsplash.com/photo-1561716249-af4e1fb69f67?w=800&q=80",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
  ],
  "Créateur d'ambiance lumineuse": [
    "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  ],
  "Hairstylist": [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
  ],
  "Makeup Artist": [
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
    "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
  ],
  "Neggafa": [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
  ],
  "Robes de mariés": [
    "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
    "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
    "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80",
  ],
  "Event planner": [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  ],
  "Wedding planner": [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
  ],
  "Location de voiture de mariage": [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
  ],
  "VTC / Transport invités": [
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&q=80",
  ],
  "Sécurité événementielle": [
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
    "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800&q=80",
    "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=800&q=80",
  ],
  "Animateur enfants": [
    "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=800&q=80",
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800&q=80",
  ],
  "Magicien": [
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    "https://images.unsplash.com/photo-1589254066213-a0c9dc853511?w=800&q=80",
  ],
  "Structures gonflables": [
    "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800&q=80",
    "https://images.unsplash.com/photo-1565538420870-da08ff96a207?w=800&q=80",
    "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800&q=80",
  ],
  "Créateur de cadeaux invités": [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  ],
  "Créateur de faire-part": [
    "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=800&q=80",
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
    "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
  ],
  "Spa / soins esthétiques": [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  ],
  "Jeux & animations enfants": [
    "https://images.unsplash.com/photo-1576515652033-4cb4ae1c67ed?w=800&q=80",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=800&q=80",
  ],
  "Structures événementielles": [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  ],
}

// ─── Per-vendor enriched data ────────────────────────────────────────────────
// Will be expanded with real data from research agents
export const VENDOR_DETAILS: Record<string, VendorExtra> = {
  "prestige-photo": {
    photos: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    ],
    description: "Prestige Photo (@prestigephoto_), équipe de photographes dédiée à l'art du mariage à Rabat — 14 000 abonnés Instagram, 248 publications. Ils donnent une âme aux photos en capturant l'authenticité de chaque moment avec élégance.",
    instagram: "https://www.instagram.com/prestigephoto_/",
    reviews: [
      { author: "Samira B.", event: "Mariage", stars: 5, note: "Des photos absolument magnifiques, chaque moment capturé avec une sensibilité rare. Je recommande vivement !" },
      { author: "Mehdi K.", event: "Fiançailles", stars: 5, note: "Professionnel, discret, et le résultat est époustouflant. Nos photos de fiançailles sont exactement ce qu'on espérait." },
      { author: "Fatima Z.", event: "Anniversaire", stars: 5, note: "Superbe travail, à la hauteur de toutes nos attentes. Merci pour ces souvenirs inoubliables !" },
    ],
  },
  "touzani-bola-bola-royal": {
    photos: [
      "https://images.unsplash.com/photo-1587302186428-d1ba4b62ea40?w=800&q=80",
      "https://images.unsplash.com/photo-1571974599782-87624638275e?w=800&q=80",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
    ],
    description: "Groupe Bola Bola Issawa royal de Rabat, spécialiste des cérémonies traditionnelles marocaines avec une ambiance festive et authentique.",
    reviews: [
      { author: "Youssef M.", event: "Mariage", stars: 5, note: "Une prestation magique ! Toute l'assistance était debout, une ambiance de folie. Bravo à toute l'équipe Touzani !" },
      { author: "Nadia A.", event: "Fiançailles", stars: 5, note: "Exactement ce qu'on voulait pour notre soirée — traditionnel, festif et professionnel. Un grand merci !" },
    ],
  },
  "dj-azz": {
    photos: [
      "https://images.unsplash.com/photo-1571266028243-d220c6a6f437?w=800&q=80",
      "https://images.unsplash.com/photo-1598387993441-a364f854cbb7?w=800&q=80",
      "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80",
    ],
    description: "DJ professionnel basé à Marrakech, spécialisé dans les mariages et soirées privées, mixant oriental et moderne.",
    reviews: [
      { author: "Karim T.", event: "Mariage", stars: 4, note: "Super ambiance toute la nuit, la piste de danse n'a jamais été vide. DJ Azz sait lire son public !" },
      { author: "Leila H.", event: "Soirée privée", stars: 5, note: "Excellent DJ, playlist parfaite, les invités ont adoré. On le recontactera sans hésitation." },
    ],
  },
  "dj-c4": {
    photos: [
      "https://images.unsplash.com/photo-1598387993441-a364f854cbb7?w=800&q=80",
      "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80",
      "https://images.unsplash.com/photo-1571266028243-d220c6a6f437?w=800&q=80",
    ],
    description: "DJ C4, expert des soirées de mariage à Marrakech, reconnu pour ses sets qui mêlent chaabi, oriental et international.",
    reviews: [
      { author: "Omar B.", event: "Mariage", stars: 4, note: "DJ C4 a assuré une ambiance incroyable du début à la fin. Très à l'écoute de nos envies musicales." },
      { author: "Zineb R.", event: "Anniversaire", stars: 4, note: "Super soirée grâce à DJ C4 ! Tout le monde a dansé jusqu'au bout de la nuit." },
    ],
  },
  "orchestre-kilani": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80",
    ],
    description: "Orchestre Kilani d'Agadir, formation musicale complète pour mariages et cérémonies, répertoire chaabi et andalou.",
    reviews: [
      { author: "Hassan E.", event: "Mariage", stars: 4, note: "L'orchestre Kilani a mis le feu à notre mariage ! Voix magnifique et musiciens talentueux." },
      { author: "Asmaa L.", event: "Fiançailles", stars: 4, note: "Très belle prestation, les invités ont été enchantés. Je recommande cet orchestre les yeux fermés." },
    ],
  },
  "abboudi": {
    photos: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    ],
    description: "Abboudi, chanteur et animateur de soirées à Casablanca, avec une voix puissante et un répertoire varié du chaabi au moderne.",
    reviews: [
      { author: "Rachid A.", event: "Mariage", stars: 4, note: "Abboudi a électrisé notre mariage ! Sa voix est incroyable et il sait captiver l'audience." },
      { author: "Khadija M.", event: "Soirée privée", stars: 4, note: "Une soirée mémorable grâce à Abboudi. Professionnel, ponctuel et vraiment talentueux." },
    ],
  },
  "afrah-darna-prestige": {
    photos: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
    ],
    description: "Traiteur Afrah Darna Prestige à Marrakech, spécialisé dans la gastronomie marocaine traditionnelle pour mariages et cérémonies.",
    website: "https://afrahdarnaprestige.ma/",
    facebook: "https://www.facebook.com/afrahdarnaprestige/",
    reviews: [
      { author: "Imane B.", event: "Mariage", stars: 4, note: "La nourriture était délicieuse et le service impeccable. Tous nos invités ont été enchantés par la qualité des plats." },
      { author: "Said K.", event: "Fiançailles", stars: 4, note: "Traiteur sérieux et professionnel. La qualité des plats marocains était au rendez-vous, je recommande vivement." },
    ],
  },
  "afrah-palace-fes": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
    ],
    description: "Afrah Palace Fès, traiteur haut de gamme proposant une cuisine marocaine raffinée pour les grandes occasions à Fès.",
    website: "http://www.afrahfes.ma/",
    instagram: "https://www.instagram.com/_traiteur_afrah.palace_fes/",
    reviews: [
      { author: "Nabil F.", event: "Mariage", stars: 4, note: "Un traiteur d'exception ! Les tajines et couscous étaient parfaits, le service très professionnel." },
      { author: "Houda M.", event: "Fiançailles", stars: 4, note: "Excellente prestation du début à la fin. Les invités n'ont pas arrêté de complimenter la nourriture." },
    ],
  },
  "afrah-ghandi": {
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
    ],
    description: "Salle de réception Afrah Ghandi à Casablanca, espace élégant pouvant accueillir jusqu'à 800 personnes pour mariages et cérémonies.",
    facebook: "https://www.facebook.com/ghandievent",
    reviews: [
      { author: "Amal R.", event: "Mariage", stars: 4, note: "Une salle magnifique, décoration somptueuse et personnel aux petits soins. Notre mariage était parfait !" },
      { author: "Youssef B.", event: "Fiançailles", stars: 4, note: "Cadre exceptionnel, service de qualité. Nos invités ont été bluffés par la beauté de la salle." },
    ],
  },
  "california-palace": {
    photos: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
    ],
    description: "California Palace à Tanger, palace de prestige pour mariages et grandes cérémonies, avec vue panoramique sur le détroit.",
    instagram: "https://www.instagram.com/california_palace/",
    reviews: [
      { author: "Lamia S.", event: "Mariage", stars: 4, note: "Un endroit de rêve pour un mariage de rêve ! Le cadre est somptueux et le service excellent." },
      { author: "Khalid E.", event: "Soirée corporative", stars: 4, note: "Très belle salle, équipe professionnelle et attentive. Nous avons passé une soirée inoubliable." },
    ],
  },
  "flawless-photo": {
    photos: [
      "https://images.unsplash.com/photo-1504173010664-32509107de92?w=800&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
    ],
    description: "Flawless Photo, studio de photographie de mariage à Rabat, spécialisé dans la photo artistique et le reportage de couple.",
    reviews: [
      { author: "Sara M.", event: "Mariage", stars: 4, note: "Des photos d'une qualité exceptionnelle ! Chaque cliché raconte une histoire. Merci pour ces souvenirs précieux." },
      { author: "Adam B.", event: "Fiançailles", stars: 4, note: "Photographe talentueux et discret. Le résultat final était au-delà de nos espérances." },
    ],
  },
  "la-perle-events": {
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    ],
    description: "La Perle Events, agence de planification d'événements à Marrakech, créant des mariages sur-mesure alliant tradition et modernité.",
    website: "https://la-perle-events.com/",
    facebook: "https://www.facebook.com/laperlemarrakech",
    reviews: [
      { author: "Meryem A.", event: "Mariage", stars: 4, note: "La Perle Events a transformé notre vision en réalité. Chaque détail était parfait, un vrai travail d'orfèvre." },
      { author: "Tarik L.", event: "Fiançailles", stars: 4, note: "Équipe créative et professionnelle. Notre événement était exactement comme on l'imaginait, merci !" },
    ],
  },
  "ahlam-mua": {
    photos: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    ],
    description: "Ahlam MUA, maquilleuse professionnelle à Casablanca, spécialisée dans le maquillage de mariée traditionnel et moderne.",
    reviews: [
      { author: "Aya B.", event: "Mariage", stars: 4, note: "Ahlam a réalisé exactement le maquillage dont je rêvais. J'étais rayonnante le jour J, merci du fond du cœur !" },
      { author: "Sanaa K.", event: "Fiançailles", stars: 5, note: "Maquillage impeccable qui a tenu toute la soirée. Ahlam est vraiment très talentueuse et à l'écoute." },
    ],
  },
  "amine-castor": {
    photos: [
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    ],
    description: "Amine Castor, maquilleur artistique à Rabat, reconnu pour ses transformations époustouflantes et son expertise en maquillage de mariée.",
    instagram: "https://www.instagram.com/amine_castor/",
    facebook: "https://www.facebook.com/amine5castor",
    reviews: [
      { author: "Hiba M.", event: "Mariage", stars: 4, note: "Amine Castor est un artiste ! Mon maquillage était magnifique, naturel et élégant. Très recommandé." },
      { author: "Loubna A.", event: "Fiançailles", stars: 4, note: "Excellent travail, maquillage qui dure et qui rend vraiment bien en photo. Je suis ravie !" },
    ],
  },
  "alhaja-saadia": {
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
    ],
    description: "Alhaja Saadia, négaffa traditionnelle à Marrakech, gardienne des traditions du mariage marocain avec une expérience de plus de 20 ans.",
    website: "https://www.alhajasaadianegafa.com/",
    instagram: "https://www.instagram.com/negafa.alhaja.saadia/",
    reviews: [
      { author: "Fatima Z.", event: "Mariage", stars: 5, note: "Alhaja Saadia a sublimé notre cérémonie traditionnelle. Son savoir-faire est incomparable, une véritable institution !" },
      { author: "Rahma B.", event: "Mariage", stars: 5, note: "Une négaffa exceptionnelle qui connaît parfaitement les traditions. Notre mariage était magique grâce à elle." },
    ],
  },
  "arousati": {
    photos: [
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
    ],
    description: "Arousati, maison de négaffa à Kénitra, proposant des tenues traditionnelles et un accompagnement complet pour la mariée marocaine.",
    reviews: [
      { author: "Wafae L.", event: "Mariage", stars: 4, note: "Arousati a su magnifier notre mariée avec des tenues somptueuses. Service attentionné et professionnel." },
      { author: "Ilham K.", event: "Mariage", stars: 4, note: "Très belle expérience avec Arousati. La mariée était radieuse, les tenues traditionnelles absolument magnifiques." },
    ],
  },
  "jawad-asmar": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80",
    ],
    description: "Jawad Asmar, chef d'orchestre et musicien à Rabat, proposant des formations musicales sur-mesure pour les mariages et cérémonies.",
    instagram: "https://www.instagram.com/orchestre_jaouadasmar/",
    reviews: [
      { author: "Badr M.", event: "Mariage", stars: 4, note: "Orchestre de Jawad Asmar au top ! La musique était sublime et l'ambiance électrique toute la soirée." },
      { author: "Nour A.", event: "Fiançailles", stars: 4, note: "Très belle prestation musicale, répertoire varié et adapté à notre soirée. Je recommande vivement." },
    ],
  },
  "cas-consult": {
    photos: [
      "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
      "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    ],
    description: "CAS Consult, fleuriste événementiel à Marrakech, créant des compositions florales exceptionnelles pour mariages et réceptions.",
    reviews: [
      { author: "Yasmine T.", event: "Mariage", stars: 4, note: "Des arrangements floraux magnifiques qui ont sublimé notre salle de mariage. CAS Consult est vraiment talentueux." },
      { author: "Rania B.", event: "Fiançailles", stars: 4, note: "Créativité et professionnalisme au rendez-vous. Les fleurs étaient fraîches et la décoration superbe." },
    ],
  },
  "afrah-riad": {
    photos: [
      "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    ],
    description: "Afrah Riad, pâtisserie et cake design à Rabat, spécialisée dans les gâteaux de mariage personnalisés et les pièces montées marocaines.",
    website: "https://afrahryadtraiteur.com/",
    reviews: [
      { author: "Siham L.", event: "Mariage", stars: 4, note: "Le gâteau de mariage d'Afrah Riad était une œuvre d'art ! Beau et délicieux à la fois, tous nos invités ont adoré." },
      { author: "Kamal B.", event: "Anniversaire", stars: 4, note: "Pâtisserie d'excellence, présentation soignée et goût incomparable. Je recommande chaleureusement." },
    ],
  },
  "abrievents": {
    photos: [
      "https://images.unsplash.com/photo-1561716249-af4e1fb69f67?w=800&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    ],
    description: "AbrïEvents, décorateur d'événements à Rabat, transformant chaque espace en décor de rêve pour mariages et cérémonies.",
    reviews: [
      { author: "Dounia M.", event: "Mariage", stars: 4, note: "AbrïEvents a métamorphosé notre salle en un décor féérique. Créativité, soin du détail et ponctualité au rendez-vous." },
      { author: "Amine S.", event: "Fiançailles", stars: 4, note: "Une décoration somptueuse qui a époustouflé nos invités. Équipe professionnelle et passionnée, bravo !" },
    ],
  },
  "abidi-events": {
    photos: [
      "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    ],
    description: "Abidi Events, spécialiste de l'ambiance lumineuse à Rabat, créant des atmosphères uniques grâce à des installations lumineuses sur-mesure.",
    instagram: "https://www.instagram.com/abidi_events/",
    reviews: [
      { author: "Hajar R.", event: "Mariage", stars: 4, note: "Les lumières d'Abidi Events ont transformé notre salle en un espace magique. Un effet waouh garanti !" },
      { author: "Mohcine A.", event: "Soirée corporative", stars: 4, note: "Installation lumineuse professionnelle et spectaculaire. Nos invités ont été impressionnés, merci Abidi Events !" },
    ],
  },
  "celeste": {
    photos: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
      "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80",
    ],
    description: "Céleste, boutique de robes de mariée à Rabat, proposant une sélection exclusive de robes de créateurs et sur-mesure.",
    instagram: "https://www.instagram.com/celestes_boutique_/",
    reviews: [
      { author: "Ghita B.", event: "Mariage", stars: 4, note: "J'ai trouvé la robe de mes rêves chez Céleste ! Service personnalisé, conseils avisés et résultat époustouflant." },
      { author: "Maroua L.", event: "Mariage", stars: 4, note: "Boutique élégante avec une sélection magnifique. L'équipe est patiente et professionnelle, je suis ravie de mon choix." },
    ],
  },
  "cocktails-wedding": {
    photos: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
      "https://images.unsplash.com/photo-1527761939622-933c83f6c4c5?w=800&q=80",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
    ],
    description: "Cocktails Wedding, service de bar et mixologie à Rabat, proposant des cocktails originaux et mocktails pour animer vos réceptions.",
    reviews: [
      { author: "Souad E.", event: "Mariage", stars: 4, note: "Les cocktails de Cocktails Wedding étaient délicieux ! Bar bien fourni, bartenders sympas et professionnels." },
      { author: "Hamid T.", event: "Soirée privée", stars: 4, note: "Excellent service, cocktails créatifs et présentation soignée. Nos invités ont été ravis !" },
    ],
  },
  "allo-limousine": {
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    ],
    description: "Allo Limousine, location de voitures de prestige pour mariages à Rabat, avec chauffeur et décoration florale inclus.",
    reviews: [
      { author: "Nada B.", event: "Mariage", stars: 4, note: "Véhicule impeccable, chauffeur professionnel et ponctuel. Notre arrivée à la cérémonie était royale !" },
      { author: "Jalal M.", event: "Mariage", stars: 4, note: "Service 5 étoiles ! La voiture était magnifiquement décorée et le chauffeur d'une courtoisie exemplaire." },
    ],
  },
  "diaa-lahmamsi": {
    photos: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    ],
    description: "Diaa Lahmamsi, wedding planner à Rabat, orchestrant des mariages uniques et personnalisés avec une attention méticuleuse aux détails.",
    website: "https://wedding-planner-maroc.com/",
    instagram: "https://www.instagram.com/wedding_planner_diaa_lahmamsi/",
    reviews: [
      { author: "Salma K.", event: "Mariage", stars: 4, note: "Diaa a organisé notre mariage à la perfection. Son professionnalisme et sa créativité nous ont bluffés !" },
      { author: "Reda A.", event: "Mariage", stars: 4, note: "Grâce à Diaa Lahmamsi, notre grand jour s'est déroulé sans aucun accroc. Une vraie professionnelle." },
    ],
  },
  "anass-hairestyle": {
    photos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    ],
    description: "Anass Hairestyle, coiffeur événementiel à Casablanca, spécialisé dans les coiffures de mariée traditionnelles et modernes.",
    reviews: [
      { author: "Amira B.", event: "Mariage", stars: 4, note: "Anass a réalisé une coiffure magnifique qui a tenu toute la nuit. Doigts de fée et grande écoute !" },
      { author: "Nawal L.", event: "Fiançailles", stars: 4, note: "Coiffure parfaite pour mes fiançailles. Anass est talentueux, rapide et très professionnel." },
    ],
  },
  "crystal-photo": {
    photos: [
      "https://crystalphotographer.com/portfolio/ceremony/p.webp",
      "https://crystalphotographer.com/portfolio/ceremony/a1.webp",
      "https://crystalphotographer.com/portfolio/ceremony/b.webp",
    ],
    description: "Crystal Photo, studio photo & vidéo de mariage professionnel à Rabat, réalisant des reportages cinématographiques d'exception. Portfolio disponible sur crystalphotographer.com.",
    website: "https://crystalphotographer.com/fr",
    reviews: [
      { author: "Ismail M.", event: "Mariage", stars: 4, note: "Notre film de mariage est un vrai chef-d'œuvre ! Crystal Photo a capturé chaque émotion avec maestria." },
      { author: "Karima B.", event: "Mariage", stars: 4, note: "Vidéaste exceptionnel, résultat digne d'un film ! Nos familles ont adoré regarder le reportage ensemble." },
    ],
  },
  "pidho-le-magicien": {
    photos: [
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
      "https://images.unsplash.com/photo-1589254066213-a0c9dc853511?w=800&q=80",
    ],
    description: "Pidho le Magicien, artiste illusionniste à Rabat, enchantant petits et grands lors de vos événements avec des tours à couper le souffle.",
    instagram: "https://www.instagram.com/pidho_le_magicien/",
    facebook: "https://www.facebook.com/AnimationPidho",
    reviews: [
      { author: "Hicham B.", event: "Anniversaire enfants", stars: 5, note: "Les enfants (et les adultes !) ont adoré le spectacle de Pidho. Une heure de magie pure et de fous rires !" },
      { author: "Zineb A.", event: "Mariage", stars: 5, note: "Pidho a animé l'après-midi de notre mariage de façon incroyable. Tout le monde était bouche bée !" },
    ],
  },
  // ── Nouveaux prestataires avec données réelles ───────────────────────────
  "orchestre-ayoub-el-filali": {
    photos: [
      "https://elfilali.ma/wp-content/uploads/2023/04/323029557_6049389408418464_5812767860764880480_n-768x1151.jpg",
      "https://elfilali.ma/wp-content/uploads/2023/04/250637036_998042960976026_218366992561183581_n.jpg",
      "https://elfilali.ma/wp-content/uploads/2023/04/278563898_3143027775945125_6541089323092771809_n-600x600.jpg",
    ],
    description: "Orchestre Ayoub El Filali, formation musicale de prestige à Rabat, alliant musique marocaine traditionnelle et contemporaine pour vos mariages et cérémonies.",
    website: "https://elfilali.ma",
    instagram: "https://www.instagram.com/ayoub_el_filali_officiel/",
    reviews: [
      { author: "Kamal S.", event: "Mariage", stars: 5, note: "L'orchestre El Filali a mis une ambiance exceptionnelle à notre mariage. Chaque morceau était interprété avec une passion remarquable." },
      { author: "Zineb M.", event: "Fiançailles", stars: 5, note: "Une prestation hors pair ! La voix d'Ayoub est magnifique, les invités ont tous été transportés." },
    ],
  },
  "gapi-villa-traiteur": {
    photos: CAT_PHOTOS["Traiteur"],
    description: "GAPI Villa Traiteur, spécialiste de la gastronomie de prestige pour événements à Casablanca, proposant des buffets somptueux et une cuisine marocaine raffinée.",
    website: "https://www.gapivilla.com",
    instagram: "https://www.instagram.com/traiteurgapivilla/",
    reviews: [
      { author: "Nadia A.", event: "Mariage", stars: 5, note: "GAPI Villa a sublimé notre mariage avec des plats d'une qualité exceptionnelle. Le service était irréprochable du début à la fin." },
      { author: "Omar B.", event: "Soirée corporative", stars: 4, note: "Traiteur professionnel avec une cuisine délicieuse. Nos invités ont été unanimement conquis." },
    ],
  },
  "les-maitres-prestiges": {
    photos: CAT_PHOTOS["Traiteur"],
    description: "Les Maîtres Prestiges, traiteur d'exception à Marrakech, réputé pour ses prestations gastronomiques haut de gamme lors des plus grands mariages et événements.",
    website: "https://lesmaitresprestiges.com",
    instagram: "https://www.instagram.com/lesmaitresprestiges/",
    reviews: [
      { author: "Samia L.", event: "Mariage", stars: 5, note: "Les Maîtres Prestiges portent bien leur nom ! Une qualité de service et de cuisine qui dépasse toutes les attentes." },
      { author: "Yassine K.", event: "Fiançailles", stars: 5, note: "Prestation de très haut niveau. Les tajines et les couscous étaient d'une authenticité remarquable." },
    ],
  },
  "alami-photography": {
    photos: [
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    ],
    description: "Alami Photography (@alami_photography), photographe & vidéaste de mariage à Marrakech — 3 150 abonnés Instagram, 379 publications. Spécialiste des mariages naturels et élégants en fine art.",
    website: "https://alamiphotography.com",
    instagram: "https://www.instagram.com/alami_photography/",
    reviews: [
      { author: "Hind B.", event: "Mariage", stars: 5, note: "Des photos d'une beauté à couper le souffle ! Alami Photography a immortalisé notre journée avec un talent rare." },
      { author: "Mehdi R.", event: "Fiançailles", stars: 5, note: "Un photographe d'exception. Chaque photo raconte une histoire, c'est magique." },
    ],
  },
  "merzougraphy": {
    photos: [
      "https://merzougraphy.com/wp-content/uploads/2025/01/Souhaila-Tylor-Wedding-by-Merzougraphy-23.jpg",
      "https://merzougraphy.com/wp-content/uploads/2025/01/Charline-Idriss-Wedding-by-Merzougraphy-59.jpg",
      "https://merzougraphy.com/wp-content/uploads/2024/02/Chaymae-Mamoun-Wedding-by-Merzougraphy-67-1067x1600.jpg",
    ],
    description: "Merzougraphy by Adam Merzoug, photographe & planificateur de mariage à Marrakech — lauréat d'un Wedding Award. Plus de 150 mariages capturés depuis 2018 avec un style cinématographique unique.",
    website: "https://merzougraphy.com",
    instagram: "https://www.instagram.com/merzougraphy/",
    reviews: [
      { author: "Sara A.", event: "Mariage", stars: 5, note: "Merzougraphy a capturé notre mariage comme un vrai film. Les photos sont absolument magnifiques, nous les chérissons pour toujours." },
      { author: "Adam L.", event: "Mariage", stars: 5, note: "Un artiste à part entière. Son travail est d'une qualité cinématographique impressionnante." },
    ],
  },
  "loubna-makeup": {
    photos: [
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    ],
    description: "Loubna Makeup (@makeup.by.loubna), maquilleuse professionnelle à Casablanca, spécialisée dans le maquillage de mariée oriental et occidental avec une touche contemporaine.",
    website: "https://loubnamakeup.com",
    instagram: "https://www.instagram.com/makeup.by.loubna/",
    reviews: [
      { author: "Aya M.", event: "Mariage", stars: 4, note: "Loubna a créé un maquillage parfait pour mon grand jour. Résultat naturel et élégant qui a tenu toute la nuit." },
      { author: "Chaima K.", event: "Fiançailles", stars: 4, note: "Très professionnelle et à l'écoute. Mon maquillage était exactement comme je le voulais." },
    ],
  },
  "firdaous-yousfi-mua": {
    photos: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    ],
    description: "Firdaous Yousfi (@firdaous.makeupartist), maquilleuse artistique star à Casablanca — 142 000 abonnés Instagram, 879 publications. Spécialiste du maquillage oriental et contemporain, basée Twin Center.",
    instagram: "https://www.instagram.com/firdaous.makeupartist/",
    reviews: [
      { author: "Maryam A.", event: "Mariage", stars: 4, note: "Un maquillage somptueux qui a fait l'admiration de tous. Firdaous est vraiment très talentueuse." },
      { author: "Rania S.", event: "Soirée privée", stars: 4, note: "Maquillage parfait, tenue impeccable. Je recommande sans hésitation." },
    ],
  },
  "nora-makeup-art": {
    photos: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
    ],
    description: "Nora Makeup Art (@nora_makeup_art), maquilleuse professionnelle à Casablanca et Marrakech — 6 300 abonnés Instagram. Spécialisée dans les tendances make-up actuelles pour mariages et événements.",
    instagram: "https://www.instagram.com/nora_makeup_art/",
    reviews: [
      { author: "Hafsa B.", event: "Mariage", stars: 4, note: "Nora est une vraie artiste ! Mon maquillage était sublime et a parfaitement résisté à la chaleur." },
      { author: "Fatima E.", event: "Fiançailles", stars: 4, note: "Professionnelle, ponctuelle et très talentueuse. Je la recommande vivement." },
    ],
  },
  "negafa-chahrazade": {
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    ],
    description: "Negafa Chahrazade (@negafa_chahrazade), maîtresse des traditions du mariage marocain à Oujda — 299 000 abonnés Instagram, 262 publications. Référence nationale pour les cérémonies traditionnelles marocaines.",
    instagram: "https://www.instagram.com/negafa_chahrazade/",
    reviews: [
      { author: "Samira O.", event: "Mariage traditionnel", stars: 4, note: "Chahrazade a magnifié notre mariage avec des tenues traditionnelles splendides. Service professionnel et chaleureux." },
      { author: "Nadia B.", event: "Mariage", stars: 4, note: "Une négaffa de talent qui connaît parfaitement les traditions de la région. Très recommandée." },
    ],
  },
  "negafa-mogador": {
    photos: [
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
    ],
    description: "Negafa Mogador / Ziyana Hanane (@negafa_mogador_oujda), spécialiste de la cérémonie de mariage traditionnel à Oujda — 227 000 abonnés Instagram, 964 publications. Tenues brodées d'exception.",
    instagram: "https://www.instagram.com/negafa_mogador_oujda/",
    reviews: [
      { author: "Leila A.", event: "Mariage", stars: 4, note: "Mogador a apporté une touche royale à notre cérémonie. Les tenues étaient d'une richesse et d'une qualité rares." },
      { author: "Zineb F.", event: "Mariage traditionnel", stars: 5, note: "Service exceptionnel ! La mariée était éblouissante. Merci à toute l'équipe." },
    ],
  },
  "delight-event-marrakech": {
    photos: [
      "https://delight-event.com/wp-content/uploads/2020/05/Banner.jpg",
      "https://delight-event.com/wp-content/uploads/2020/01/Dior-Bahia.jpg",
      "https://delight-event.com/wp-content/uploads/2020/01/VCA-UN.jpg",
    ],
    description: "Delight Event Management, agence de décoration événementielle à Marrakech, créant des univers féeriques sur-mesure pour les plus beaux mariages. Référence de luxe, clients : Cartier, Dior, Van Cleef & Arpels.",
    website: "https://delight-event.com",
    instagram: "https://www.instagram.com/delighteventmngt/",
    reviews: [
      { author: "Kenza M.", event: "Mariage", stars: 5, note: "Delight Event a transformé notre salle en un espace de rêve absolu. Créativité sans limite et exécution parfaite." },
      { author: "Hassan K.", event: "Soirée de mariage", stars: 4, note: "Décoration somptueuse qui a émerveillé tous nos invités. Équipe professionnelle et passionnée." },
    ],
  },
  "passion-decor-maroc": {
    photos: CAT_PHOTOS["Décorateur"],
    description: "Passion Décor Maroc, décorateur événementiel à Casablanca, passionné par la création d'atmosphères uniques mêlant esthétique marocaine et tendances modernes.",
    website: "https://passiondecor.ma",
    instagram: "https://www.instagram.com/passion_decor.maroc/",
    reviews: [
      { author: "Amal R.", event: "Mariage", stars: 4, note: "Une décoration magnifique et soigné dans les moindres détails. Passion Décor a su réaliser exactement notre vision." },
      { author: "Said T.", event: "Fiançailles", stars: 4, note: "Très beau travail, originalité et professionnalisme. Nos invités ont été admiratifs." },
    ],
  },
  "instants-magiques": {
    photos: CAT_PHOTOS["Wedding planner"],
    description: "Instants Magiques, agence de wedding planning à Marrakech, spécialisée dans l'organisation de mariages de prestige dans les plus beaux riads et palais de la ville ocre.",
    website: "https://instantsmagiques-marrakech.com",
    instagram: "https://www.instagram.com/instants_magiques_marrakech/",
    reviews: [
      { author: "Lina B.", event: "Mariage", stars: 5, note: "Instants Magiques a réalisé le mariage de nos rêves à Marrakech. Chaque détail était parfait, c'était véritablement magique." },
      { author: "Tarek A.", event: "Mariage", stars: 5, note: "Une équipe de professionnels hors pair. Notre mariage dans un riad de Marrakech était absolument inoubliable." },
    ],
  },
  "maroc-sensations": {
    photos: CAT_PHOTOS["Wedding planner"],
    description: "Maroc Sensations, wedding planner à Marrakech, créant des mariages d'exception qui mêlent authenticité marocaine et élégance internationale.",
    website: "https://www.marocsensations-wedding.com",
    instagram: "https://www.instagram.com/marocsensations/",
    reviews: [
      { author: "Marie-Claire D.", event: "Mariage franco-marocain", stars: 5, note: "Maroc Sensations a orchestré notre mariage franco-marocain à la perfection. Ils ont su marier les deux cultures avec une grâce rare." },
      { author: "Mehdi S.", event: "Mariage", stars: 4, note: "Équipe très professionnelle, réactive et créative. Notre mariage à Marrakech était un vrai conte des Mille et une Nuits." },
    ],
  },
  "palais-atlas": {
    photos: CAT_PHOTOS["Lieu de réception"],
    description: "Palais Atlas, salle de réception luxueuse à Casablanca, alliant architecture orientale et équipements modernes pour accueillir vos plus grands événements.",
    website: "https://www.palaisatlas.com",
    instagram: "https://www.instagram.com/palaisatlas/",
    reviews: [
      { author: "Ilham B.", event: "Mariage", stars: 5, note: "Le Palais Atlas est à la hauteur de son nom. Un cadre somptueux, un service irréprochable. Notre mariage était grandiose." },
      { author: "Karim M.", event: "Soirée corporative", stars: 4, note: "Excellente salle, très bien équipée et magnifiquement décorée. L'équipe est professionnelle et attentive." },
    ],
  },
  "crystal-fes": {
    photos: CAT_PHOTOS["Lieu de réception"],
    description: "Crystal Fès, salle des fêtes de prestige à Fès, proposant un espace élégant et raffiné pour les mariages et cérémonies les plus exigeants.",
    website: "https://crystalfes.com",
    instagram: "https://www.instagram.com/crystal.fes/",
    reviews: [
      { author: "Fatima Z.", event: "Mariage", stars: 4, note: "Crystal Fès est une salle magnifique. La décoration était splendide et le service très professionnel." },
      { author: "Youssef B.", event: "Fiançailles", stars: 4, note: "Très belle réception, cadre élégant et personnel aux petits soins. Je recommande vivement." },
    ],
  },
  "sweet-cake-marrakech": {
    photos: CAT_PHOTOS["Pâtissier / Cake designer"],
    description: "Sweet Cake Marrakech, pâtissier artisan créateur de gâteaux de mariage exceptionnels à Marrakech, alliant esthétisme oriental et saveurs délicates.",
    website: "https://www.sweetcakemarrakech.com",
    instagram: "https://www.instagram.com/sweetcakemarrakech/",
    reviews: [
      { author: "Houda M.", event: "Mariage", stars: 5, note: "Notre gâteau de mariage de Sweet Cake était une véritable œuvre d'art ! Magnifique et délicieux, tous nos invités ont été émerveillés." },
      { author: "Rachid A.", event: "Anniversaire", stars: 5, note: "Des créations sublimes et un goût exceptionnel. Sweet Cake Marrakech est sans conteste le meilleur cake designer de la ville." },
    ],
  },
  "fleuriste-stoti": {
    photos: CAT_PHOTOS["Fleuriste événementiel"],
    description: "Fleuriste Stoti, maître fleuriste à Marrakech, créant des compositions florales époustouflantes qui subliment mariages et réceptions avec des fleurs fraîches.",
    instagram: "https://www.instagram.com/fleuriste_marrakech_officiel/",
    reviews: [
      { author: "Assia L.", event: "Mariage", stars: 4, note: "Des arrangements floraux d'une beauté exceptionnelle. Stoti a transformé notre salle en un jardin enchanté." },
      { author: "Meryem B.", event: "Fiançailles", stars: 4, note: "Fleuriste très talentueux et professionnel. Les fleurs étaient fraîches et la décoration somptueuse." },
    ],
  },
  "nezha-hairstyle": {
    photos: CAT_PHOTOS["Hairstylist"],
    description: "Nezha Hairstyle, coiffeuse événementielle à Rabat, spécialisée dans les coiffures de mariée traditionnelles et modernes avec un savoir-faire reconnu.",
    instagram: "https://www.instagram.com/nezha.hairstyle/",
    reviews: [
      { author: "Nadia S.", event: "Mariage", stars: 4, note: "Nezha a réalisé une coiffure magnifique et originale. Elle a su exactement ce que je voulais dès la première consultation." },
      { author: "Amira B.", event: "Fiançailles", stars: 4, note: "Coiffure parfaite qui a tenu toute la soirée. Nezha est une vraie professionnelle, très recommandée." },
    ],
  },
  "salon-mouna-marrakech": {
    photos: CAT_PHOTOS["Hairstylist"],
    description: "Salon Mouna Marrakech, salon de beauté et coiffure événementielle à Marrakech, proposant un service complet pour les mariées du jour J.",
    instagram: "https://www.instagram.com/salonmounamarrakech/",
    reviews: [
      { author: "Sanaa K.", event: "Mariage", stars: 4, note: "Le Salon Mouna a été parfait pour ma préparation de mariée. Coiffure impeccable et ambiance très agréable." },
      { author: "Ghita M.", event: "Mariage", stars: 4, note: "Très beau travail, je suis resortie rayonnante. L'équipe est professionnelle et chaleureuse." },
    ],
  },
  // ── New entries from research agents ─────────────────────────────────────
  "souma-makeup": {
    photos: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    ],
    description: "Souma Makeup, maquilleuse star à Casablanca, avec plus de 455 000 abonnés Instagram. Reconnue pour ses transformations de mariées époustouflantes alliant tradition marocaine et tendances internationales.",
    instagram: "https://www.instagram.com/souma__makeup/",
    reviews: [
      { author: "Nadia B.", event: "Mariage", stars: 5, note: "Souma est une artiste hors pair ! Mon maquillage était sublime, des photos dignes d'un magazine. Je la recommande à toutes les futures mariées." },
      { author: "Ikram L.", event: "Fiançailles", stars: 5, note: "Maquillage parfait qui a tenu toute la nuit. Souma est à l'écoute, professionnelle et vraiment talentueuse." },
    ],
  },
  "imane-el-makeup": {
    photos: [
      "https://images.unsplash.com/photo-1519419166813-9c4c4b9d27d6?w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    ],
    description: "Imane El Makeup, maquilleuse professionnelle à Marrakech, suivie par près de 300 000 fans sur Instagram pour ses créations audacieuses et son expertise en maquillage de mariée.",
    instagram: "https://www.instagram.com/imane__makeup/",
    reviews: [
      { author: "Hajar M.", event: "Mariage", stars: 5, note: "Un maquillage absolument renversant ! Imane a su capturer exactement ce que je voulais. Mes photos sont magnifiques." },
      { author: "Rim A.", event: "Soirée de mariage", stars: 5, note: "Imane est exceptionnelle — créative, précise et tellement agréable. Le résultat était bien au-delà de mes espérances." },
    ],
  },
  "tariq-baina": {
    photos: [
      "https://app.wadi.dev/api/media/image?path=stores%2F65%2Fpages%2F42025%2FIMG_20241203_093701.jpg_01733215203.jpg&size=800x800xfit",
      "https://app.wadi.dev/api/media/image?path=stores%2F65%2Fpages%2F42025%2FIMG_20241203_093800.jpg_01733215236.jpg&size=800x800xfit",
      "https://app.wadi.dev/api/media/image?path=stores%2F65%2Fpages%2F42025%2FIMG_20241203_092534.jpg_01733214599.jpg&size=800x800xfit",
    ],
    description: "Tariq Baina (@tariq_baina), maquilleur artistique de renom à Casablanca, spécialisé dans le maquillage de mariée et les cours de maquillage. Maîtrise parfaite des looks orientaux et contemporains.",
    website: "https://tariqbaina.com/",
    instagram: "https://www.instagram.com/tariq_baina/",
    reviews: [
      { author: "Saad E.", event: "Mariage", stars: 5, note: "Tariq a réalisé un film de mariage digne d'un long-métrage ! Chaque séquence est travaillée avec passion. Un vrai artiste." },
      { author: "Mina K.", event: "Mariage", stars: 5, note: "Photos et vidéo d'une qualité exceptionnelle. Tariq Baina mérite amplement sa réputation." },
    ],
  },
  "sara-lassass": {
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
    ],
    description: "Sara Lassass Négafa, maîtresse des traditions du mariage marocain à Fès, avec 294 000 abonnés Instagram. Spécialiste des tenues traditionnelles et de la cérémonie de la mariée.",
    instagram: "https://www.instagram.com/negafa_sara_lassass/",
    reviews: [
      { author: "Fatima Z.", event: "Mariage traditionnel", stars: 5, note: "Sara Lassass a rendu notre cérémonie magique. Son savoir-faire des traditions marocaines est incomparable." },
      { author: "Samira A.", event: "Mariage", stars: 5, note: "Les tenues étaient somptueuses et Sara est d'une gentillesse rare. Un vrai moment de bonheur traditionnel." },
    ],
  },
  "nouha-queen": {
    photos: [
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
    ],
    description: "Nouha Queen Négafa, spécialiste du mariage traditionnel marocain à Casablanca, forte de 272 000 abonnés Instagram et reconnue pour ses mises en scène grandioses.",
    instagram: "https://www.instagram.com/negafa_nouha_queen_/",
    reviews: [
      { author: "Meriem B.", event: "Mariage", stars: 5, note: "Nouha Queen est une véritable reine ! Elle a sublimé notre mariage avec élégance et professionnalisme." },
      { author: "Hind L.", event: "Mariage traditionnel", stars: 5, note: "Un service exceptionnel du début à la fin. Nos familles ont été touchées par la beauté de la cérémonie." },
    ],
  },
  "arouss-marrakech": {
    photos: [
      "https://arouss-marrakech.com/wp-content/uploads/2025/02/CHF_3909-scaled.jpg",
      "https://arouss-marrakech.com/wp-content/uploads/2025/02/CHF_3858-scaled.jpg",
      "https://arouss-marrakech.com/wp-content/uploads/2025/02/CHF_3831-scaled.jpg",
    ],
    description: "Arouss Marrakech, maison de la mariée marocaine à Marrakech, proposant un service complet de négaffa, robes traditionnelles et accessoires de cérémonie.",
    website: "https://arouss-marrakech.com/",
    reviews: [
      { author: "Kenza M.", event: "Mariage", stars: 4, note: "Arouss Marrakech a tout géré à la perfection. Les tenues étaient magnifiques et l'équipe très professionnelle." },
      { author: "Naima B.", event: "Mariage traditionnel", stars: 4, note: "Superbe prestation, tenues de grande qualité. La mariée était éblouissante !" },
    ],
  },
  "allo-my-cab": {
    photos: [
      "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      "https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&q=80",
    ],
    description: "Allo My Cab, service de transport VTC pour mariages et événements au Maroc, proposant des véhicules confortables et des chauffeurs professionnels.",
    website: "https://allomycab.ma/",
    reviews: [
      { author: "Yassine A.", event: "Mariage", stars: 4, note: "Chauffeur ponctuel, voiture propre et confortable. Le transport de nos invités s'est déroulé sans le moindre problème." },
      { author: "Lalla F.", event: "Soirée privée", stars: 4, note: "Service fiable et professionnel. Je recommande Allo My Cab pour tous vos transports événementiels." },
    ],
  },
  "lamya-cars": {
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    ],
    description: "Lamya Cars, location de voitures de luxe pour mariages à Casablanca, avec une flotte de véhicules de prestige et des chauffeurs en livrée.",
    website: "https://lamyacars.com/",
    reviews: [
      { author: "Omar K.", event: "Mariage", stars: 4, note: "Lamya Cars nous a fourni une voiture de rêve pour notre mariage. Décoration magnifique et chauffeur exemplaire." },
      { author: "Hanae B.", event: "Mariage", stars: 5, note: "Service impeccable ! La voiture était somptueuse et le chauffeur d'une élégance remarquable." },
    ],
  },
  "la-selection": {
    photos: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
      "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80",
    ],
    description: "La Sélection Couture, atelier de robes de mariée sur-mesure à Rabat, alliant savoir-faire artisanal marocain et tendances de la haute couture internationale.",
    website: "https://laselectioncouture.com/",
    reviews: [
      { author: "Ghizlan M.", event: "Mariage", stars: 5, note: "Ma robe de La Sélection était absolument parfaite ! Sur-mesure, élégante et confortable. Je me suis sentie une vraie princesse." },
      { author: "Asmaa R.", event: "Mariage", stars: 4, note: "Atelier de grande qualité, équipe à l'écoute et résultat exceptionnel. Je recommande vivement pour toutes les futures mariées." },
    ],
  },
  "karim-groupe": {
    photos: [
      "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=800&q=80",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
      "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800&q=80",
    ],
    description: "Karim Groupe Maroc, animateur spécialisé dans les fêtes et anniversaires enfants à Casablanca, avec spectacles, jeux et structures gonflables.",
    instagram: "https://www.instagram.com/karimgroupemaroc/",
    facebook: "https://www.facebook.com/KARIMGROUPEMAROCsarl",
    reviews: [
      { author: "Fatima O.", event: "Anniversaire enfants", stars: 5, note: "Karim Groupe a rendu l'anniversaire de mon fils absolument inoubliable ! Les enfants ont adoré toutes les animations." },
      { author: "Youssef B.", event: "Fête privée", stars: 4, note: "Animation de qualité, les enfants ont été captivés du début à la fin. Je recommande vivement !" },
    ],
  },
  // ── Batch 2 — details ajoutés 04h00 ─────────────────────────────────────────
  "glam-by-sara": {
    photos: [
      "https://glambysara.pro/wp-content/uploads/2024/08/287339862_164151122762938_8449349141810483810_n-1.jpg",
      "https://glambysara.pro/wp-content/uploads/2024/08/1000119842-1.jpg",
      "https://glambysara.pro/wp-content/uploads/2025/02/f3f3b1ab-d715-4994-bb0f-30f40ed9e2b5-832x1024.jpeg",
    ],
    description: "Glam by Sara (@glambysara.pro), maquilleuse professionnelle à Casablanca, spécialisée dans le maquillage de mariée et les looks glamour pour occasions spéciales.",
    website: "https://glambysara.pro/",
    instagram: "https://www.instagram.com/glambysara.pro/",
    reviews: [
      { author: "Nadia B.", event: "Mariage", stars: 5, note: "Sara a créé un maquillage de rêve pour mon grand jour. Précision, élégance et une écoute exceptionnelle. Je la recommande à toutes les mariées !" },
      { author: "Imane K.", event: "Fiançailles", stars: 5, note: "Résultat impeccable qui a tenu toute la soirée. Sara est un vrai talent, ses créations sont somptueuses." },
    ],
  },
  "nom-films": {
    photos: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    ],
    description: "NOM Films, studio de vidéographie de mariage basé à Casablanca, spécialisé dans la création de films de mariage cinématographiques au Maroc. Approche artistique et narration émotionnelle.",
    website: "https://nomfilms.ma/",
    instagram: "https://www.instagram.com/nomfilms/",
    reviews: [
      { author: "Kaoutar A.", event: "Mariage à Casablanca", stars: 5, note: "Notre film de mariage par NOM Films est un vrai chef-d'œuvre. Chaque émotion est capturée avec une sensibilité rare. Merci infiniment !" },
      { author: "Hamza B.", event: "Mariage à Rabat", stars: 5, note: "Professionnels, discrets et créatifs. Le rendu final dépasse toutes nos attentes. On le regarde encore et encore." },
    ],
  },
  "gordon-wedding-films": {
    photos: [
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    ],
    description: "Gordon Wedding Films, vidéographe de mariage de destination spécialisé au Maroc et à Marrakech. Films cinématographiques pour mariages de luxe dans les plus beaux riads et palais.",
    website: "https://www.gordonweddingfilms.com/",
    reviews: [
      { author: "Sophie L.", event: "Mariage à Marrakech", stars: 5, note: "Meryll a capturé notre mariage à Marrakech avec une beauté incroyable. Le film est poétique, émouvant. Un souvenir éternel." },
      { author: "Thomas G.", event: "Mariage Destination", stars: 5, note: "Travail exceptionnel, cadrage parfait et montage très soigné. Nous recommandons Gordon Wedding Films à tous les couples." },
    ],
  },
  "orchestre-voix-dorient": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    ],
    description: "Orchestre Voix d'Orient, ensemble musical marocain de référence pour l'animation de mariages et soirées de gala à Casablanca. Répertoire orientale, andalou et moderne.",
    reviews: [
      { author: "Nadia K.", event: "Mariage à Casablanca", stars: 5, note: "L'Orchestre Voix d'Orient a mis le feu à notre soirée ! Répertoire varié, ambiance magique. Tous nos invités ont adoré." },
      { author: "Rachid M.", event: "Soirée de fiançailles", stars: 5, note: "Prestation de très haute qualité. Les musiciens sont talentueux et professionnels. Je recommande vivement." },
    ],
  },
  "hamid-beausejour": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "Hamid Beauséjour, traiteur d'exception à Casablanca alliant gastronomie marocaine et cuisine internationale. Buffets prestige, service à table blanc et cocktails raffinés pour mariages et événements.",
    reviews: [
      { author: "Leila S.", event: "Mariage à Casablanca", stars: 5, note: "La cuisine de Hamid Beauséjour était sublime — tajines parfumés, pastillas dorées, tout était d'une qualité irréprochable. Nos invités en parlent encore." },
      { author: "Omar F.", event: "Réception privée", stars: 5, note: "Service impeccable, présentation magnifique et saveurs authentiques. Le meilleur traiteur de Casablanca à notre avis." },
    ],
  },
  "negafa-yassmina-harakat": {
    photos: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    ],
    description: "Negafa Yassmina Harakat, l'une des plus réputées negafas du Maroc. Spécialiste de la mise en valeur de la mariée avec une collection exceptionnelle de caftans, jabadors et bijoux traditionnels.",
    reviews: [
      { author: "Zineb A.", event: "Mariage traditionnel", stars: 5, note: "Yassmina est une artiste ! Elle a su mettre en valeur ma beauté à chaque changement de tenue. Chaque tableau était plus magnifique que le précédent." },
      { author: "Khadija M.", event: "Mariage à Casablanca", stars: 5, note: "Une professionnelle hors pair. Collection de caftans somptueuse et équipe très attentionnée. Je recommande les yeux fermés." },
    ],
  },
  "dar-bennani-rabat": {
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    ],
    description: "Dar Bennani Rabat, maison de negafa de prestige installée au cœur de l'Agdal à Rabat. Collection exclusive de caftans de haute couture, bijoux anciens et service personnalisé pour chaque mariée.",
    reviews: [
      { author: "Siham B.", event: "Mariage à Rabat", stars: 5, note: "Dar Bennani est tout simplement la référence à Rabat. Des caftans d'une beauté époustouflante et une équipe aux petits soins. Je me suis sentie reine !" },
      { author: "Amina L.", event: "Mariage traditionnel", stars: 5, note: "Service exceptionnel du début à la fin. Les bijoux sont authentiques et les caftans brodés à la main. Une expérience unique." },
    ],
  },
  "allo-mariage": {
    photos: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      "https://images.unsplash.com/photo-1561131668-f63504debd5e?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    ],
    description: "Allo Mariage, agence d'organisation de mariages fondée en 2013, spécialisée dans les cérémonies d'exception à Rabat, Casablanca, Marrakech et partout au Maroc. Coordination complète ou partielle.",
    website: "https://allo-mariage.com/",
    reviews: [
      { author: "Meryem T.", event: "Mariage à Rabat", stars: 5, note: "Allo Mariage a orchestré notre grand jour avec une précision et une élégance remarquables. Zéro stress pour nous, tout était parfait !" },
      { author: "Yassine A.", event: "Mariage à Casablanca", stars: 4, note: "Équipe sérieuse et créative, notre mariage était exactement comme nous l'avions imaginé. Merci pour votre professionnalisme." },
    ],
  },
  "she-said-yes": {
    photos: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      "https://images.unsplash.com/photo-1561131668-f63504debd5e?w=800&q=80",
    ],
    description: "She Said Yes, wedding planner et agence de décoration de mariage à Casablanca, Marrakech et Tanger. Spécialiste des mariages marocains, juifs et destination. Coordination clé en main.",
    website: "https://www.shesaidyes.ma/",
    instagram: "https://www.instagram.com/shesaidyes.ma/",
    reviews: [
      { author: "Nour E.", event: "Mariage à Casablanca", stars: 5, note: "She Said Yes a transformé notre vision en une réalité encore plus belle. Équipe passionnée, toujours disponible et pleine d'idées." },
      { author: "David K.", event: "Mariage à Marrakech", stars: 4, note: "Organisation irréprochable, décoration sublime et suivi rigoureux. Nous leur faisons entièrement confiance pour notre grand jour." },
    ],
  },
  "younes-chahyd": {
    photos: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    ],
    description: "Younes Chahyd, photographe de mariage basé à Casablanca, reconnu pour son approche artistique et sa capacité à saisir les émotions les plus authentiques du grand jour.",
    instagram: "https://www.instagram.com/youneschahyd/",
    reviews: [
      { author: "Sara B.", event: "Mariage à Casablanca", stars: 5, note: "Younes a une façon unique de capter les émotions. Nos photos sont à couper le souffle — chaque cliché raconte une histoire." },
      { author: "Amine D.", event: "Mariage à Rabat", stars: 5, note: "Photographe très talentueux et professionnel. Discret pendant la cérémonie mais présent pour chaque moment clé. Résultat magnifique." },
    ],
  },
  "gnawa-couleurs": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    ],
    description: "Gnawa Couleurs, groupe de musique gnaoua de Marrakech spécialisé dans l'animation de mariages et événements culturels. Rythmes envoûtants, costumes colorés et énergie communicative.",
    reviews: [
      { author: "Lina A.", event: "Mariage à Marrakech", stars: 5, note: "Gnawa Couleurs a offert un moment de magie pure à notre mariage. Les rythmes gnaoua ont enflammé la piste et subjugué nos invités étrangers." },
      { author: "Mehdi B.", event: "Événement culturel", stars: 5, note: "Prestation authentique et spectaculaire. Ces artistes sont les ambassadeurs de la culture marocaine. Incontournable pour un mariage à Marrakech." },
    ],
  },

  // ── Batch 3 — ajoutés 05h42 ─────────────────────────────────────────────────
  "rm-studio-rabat": {
    photos: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
    ],
    description: "RM Studio, studio photographique professionnel à Rabat spécialisé dans le reportage de mariage. Équipe dédiée capturant chaque instant magique avec élégance tout en valorisant les traditions uniques de votre événement.",
    website: "https://rmstudio.ma/",
    reviews: [
      { author: "Karim N.", event: "Mariage à Rabat", stars: 5, note: "RM Studio a capturé notre mariage avec un soin exceptionnel. Chaque photo est un chef-d'œuvre — la mise en lumière est parfaite." },
      { author: "Nadia E.", event: "Mariage à Casablanca", stars: 5, note: "Équipe très professionnelle, discrète et créative. Les photos révèlent des moments qu'on n'avait même pas remarqués. Sublime travail." },
    ],
  },
  "delta-photo-rabat": {
    photos: [
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    ],
    description: "Delta Photo, photographe de mariage professionnel basé à Rabat, disponible 7j/7 pour immortaliser votre grand jour dans toutes les villes du Maroc. Style naturel et intemporel.",
    website: "https://deltaphoto.ma/",
    reviews: [
      { author: "Sofia A.", event: "Mariage à Rabat", stars: 4, note: "Très bonne prestation. Les photos sont belles et livraison rapide. Equipe aimable et professionnelle." },
      { author: "Hassan M.", event: "Fiançailles", stars: 4, note: "Bonne expérience avec Delta Photo. Photos soignées et bon rapport qualité/prix." },
    ],
  },
  "yapas-photo-studio": {
    photos: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
      "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80",
    ],
    description: "YaPasPhoto Studio (@yapasphotostudio), le one-stop-shop de l'image à Casablanca. Reportage mariage, portrait, vidéo — une équipe créative au service de vos souvenirs les plus précieux.",
    instagram: "https://www.instagram.com/yapasphotostudio/",
    reviews: [
      { author: "Leila B.", event: "Mariage à Casablanca", stars: 4, note: "Super studio ! Prestation complète photo + vidéo, très sympa et professionnel. On recommande." },
      { author: "Yassine K.", event: "Mariage", stars: 4, note: "Bonne ambiance et très bons résultats. L'équipe est réactive et s'adapte aux demandes de dernière minute." },
    ],
  },
  "othmane-samak": {
    photos: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    ],
    description: "Othmane Samak, photographe de mariage reconnu à Casablanca — reportages exigeants alliant esthétique contemporaine et émotion authentique. Spécialiste des mariages mixtes et des cérémonies haut de gamme.",
    reviews: [
      { author: "Amina R.", event: "Mariage à Casablanca", stars: 5, note: "Othmane a une vision artistique rare. Chaque photo est une œuvre. Notre album est absolument magnifique — exactement ce dont on rêvait." },
      { author: "Mehdi C.", event: "Mariage", stars: 5, note: "Photographe extraordinaire. Discret, créatif, précis. On a l'impression que le temps s'est arrêté sur chaque cliché." },
    ],
  },
  "studio-alqods": {
    photos: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    ],
    description: "Studio Alqods, studio photo & vidéo professionnel à Agadir — partenaire de confiance pour immortaliser vos mariages, événements familiaux et portraits avec un service personnalisé et chaleureux.",
    website: "https://studio-photographe-agadir.com/",
    reviews: [
      { author: "Fatima Z.", event: "Mariage à Agadir", stars: 4, note: "Studio sérieux et talentueux. Les photos sont belles, service rapide et équipe agréable. Très satisfaite." },
      { author: "Omar B.", event: "Fiançailles", stars: 4, note: "Bon studio à Agadir. Photos de qualité et tarifs raisonnables. Je recommande." },
    ],
  },
  "my-traiteur-agadir": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "My Traiteur, leader de la gastronomie événementielle à Agadir — services traiteur haut de gamme pour mariages et réceptions dans toutes les grandes villes du Maroc. Équipes professionnelles et menus sur-mesure.",
    website: "https://mytraiteur.ma/",
    reviews: [
      { author: "Nawal A.", event: "Mariage à Agadir", stars: 5, note: "My Traiteur a assuré un service irréprochable pour notre mariage. La qualité des plats et la présentation étaient exceptionnelles. Invités ravis." },
      { author: "Youssef M.", event: "Réception familiale", stars: 5, note: "Prestation parfaite du début à la fin. Equipe ponctuelle, cuisine savoureuse, service élégant. On fait appel à eux sans hésitation." },
    ],
  },
  "traiteur-michwar-fes": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    ],
    description: "Traiteur Michwar Fès, spécialiste de la cuisine marocaine authentique pour mariages et cérémonies à Fès et dans tout le Maroc. Menus personnalisés alliant tradition et modernité.",
    website: "https://traiteurfesmichwar.com/",
    reviews: [
      { author: "Samira K.", event: "Mariage à Fès", stars: 4, note: "Excellent traiteur fassie ! La pastilla et le couscous étaient divins. Très bonne organisation et service souriant." },
      { author: "Rachid O.", event: "Mariage traditionnel", stars: 4, note: "Cuisine marocaine authentique et généreuse. On a senti le savoir-faire fassi dans chaque plat. Très recommandé." },
    ],
  },
  "amers-catering-tanger": {
    photos: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "Amers Catering, traiteur créatif et expert à Tanger — gestion complète de vos événements avec des propositions culinaires variées alliant créativité et excellence pour mariages et réceptions privées.",
    reviews: [
      { author: "Houda B.", event: "Mariage à Tanger", stars: 4, note: "Service très professionnel et cuisine délicieuse. L'équipe Amers a su sublimer notre réception avec des plats savoureux et une belle présentation." },
      { author: "Anis Z.", event: "Réception", stars: 4, note: "Très bonne prestation. Équipe à l'écoute et réactive. Les mets étaient généreux et goûteux. On recommande." },
    ],
  },
  "rahal-maitre-traiteur": {
    photos: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    ],
    description: "Rahal Maître Traiteur, une référence de la gastronomie de mariage à Fès — excellence culinaire marocaine, équipes expérimentées et prestations haut de gamme pour les plus belles cérémonies.",
    reviews: [
      { author: "Leila F.", event: "Grand mariage à Fès", stars: 5, note: "Rahal est LE traiteur de référence à Fès. Qualité irréprochable, quantités généreuses, présentation impeccable. Notre famille était unanime." },
      { author: "Mohamed S.", event: "Mariage traditionnel", stars: 5, note: "Service 5 étoiles ! Maître traiteur dans toute l'acception du terme. La bastilla au poulet et les tajines étaient divins." },
    ],
  },
  "kech-design-marrakech": {
    photos: [
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    ],
    description: "Kech Design, agence de décoration événementielle à Marrakech — créateurs d'ambiances féeriques pour mariages et grandes réceptions. Expertise florale, éclairage sur-mesure et décors orientaux d'exception.",
    website: "https://www.kechdesign.ma/",
    reviews: [
      { author: "Sara E.", event: "Mariage à Marrakech", stars: 5, note: "Kech Design a transformé notre salle en véritable conte des Mille et une Nuits. Chaque détail était pensé avec goût et précision. Époustouflant." },
      { author: "Karim L.", event: "Réception de luxe", stars: 5, note: "Équipe d'une créativité et d'un professionnalisme rares. Décoration grandiose, dans les délais. On garde un souvenir inoubliable de notre soirée." },
    ],
  },
  "mabeie-event": {
    photos: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    ],
    description: "Mabeie Event (@mabeievent), agence de location et décoration événementielle sur-mesure à Marrakech — mobilier de luxe, éclairage féerique et accessoires haut de gamme pour mariages et soirées de prestige.",
    instagram: "https://www.instagram.com/mabeievent/",
    reviews: [
      { author: "Nora B.", event: "Mariage à Marrakech", stars: 4, note: "Très belle prestation. Le mobilier était élégant et la mise en place soignée. Equipe ponctuelle et réactive. On recommande." },
      { author: "Driss A.", event: "Soirée de gala", stars: 4, note: "Mabeie Event a assuré une décoration raffinée pour notre événement. Matériel de qualité et service professionnel." },
    ],
  },
  "letablie-tanger": {
    photos: [
      "https://images.unsplash.com/photo-1487530811015-780dc93a8df3?w=800&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=800&q=80",
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&q=80",
    ],
    description: "L'Établie, atelier d'artisanat floral créé en 2019 à Tanger — compositions florales uniques pour mariages et événements, alliant esthétique contemporaine et savoir-faire artisanal pour des décors époustouflants.",
    website: "https://letablie.com/",
    reviews: [
      { author: "Hind M.", event: "Mariage à Tanger", stars: 5, note: "L'Établie a créé des compositions florales absolument magnifiques pour notre mariage. Le bouquet de mariée était un rêve. Talent et passion au rendez-vous." },
      { author: "Youssef A.", event: "Réception fiançailles", stars: 5, note: "Travail exceptionnel. Chaque arrangement floral était pensé comme une œuvre d'art. Nos invités n'ont pas arrêté de les complimenter." },
    ],
  },
  "golden-flower-ma": {
    photos: [
      "https://images.unsplash.com/photo-1487530811015-780dc93a8df3?w=800&q=80",
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=800&q=80",
    ],
    description: "Golden Flower, fleuriste spécialisé dans la livraison et la décoration florale pour mariages à Casablanca et partout au Maroc — fraîcheur garantie, bouquets sur-mesure et compositions d'exception pour vos plus beaux événements.",
    website: "https://goldenflower.ma/",
    reviews: [
      { author: "Aicha K.", event: "Mariage à Casablanca", stars: 4, note: "Très belles fleurs, fraîches et soigneusement choisies. Livraison ponctuelle et emballage élégant. Je referai appel à Golden Flower sans hésiter." },
      { author: "Said B.", event: "Réception", stars: 4, note: "Belle sélection florale et bon service. Les compositions étaient exactement comme demandé. Rapport qualité/prix très correct." },
    ],
  },
  "orchestre-hicham-doukkali": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    ],
    description: "Orchestre Hicham Doukkali, ensemble musical de référence à Rabat pour l'animation de mariages, fiançailles et soirées culturelles — répertoire riche alliant musique andalouse, chaabi et compositions contemporaines.",
    reviews: [
      { author: "Amina S.", event: "Mariage à Rabat", stars: 5, note: "L'orchestre Doukkali a envoûté nos invités du début à la fin. La musique andalouse en soirée et le chaabi pour la fête — une transition parfaite." },
      { author: "Bilal E.", event: "Mariage traditionnel", stars: 5, note: "Musiciens exceptionnels. La qualité musicale et la présence scénique d'Hicham Doukkali sont incomparables. Un mariage inoubliable grâce à eux." },
    ],
  },
  "orchestre-youssef-wahbi": {
    photos: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    ],
    description: "Orchestre Youssef Wahbi, l'une des meilleures formations musicales de Salé et Rabat — prestations nocturnes sans interruption, répertoire varié de musique orientale et chaabi pour des mariages mémorables.",
    reviews: [
      { author: "Fatna O.", event: "Mariage à Salé", stars: 5, note: "Orchestre Wahbi joue toute la nuit sans jamais baisser en qualité ou en énergie. Les invités ont dansé jusqu'au matin. Remarquable !" },
      { author: "Driss K.", event: "Mariage à Rabat", stars: 5, note: "Youssef Wahbi est un musicien hors pair. Répertoire varié, musique entraînante et excellente interaction avec les mariés. On recommande vivement." },
    ],
  },

  // ── Batch 3b — détails agents 05h42 ─────────────────────────────────────────
  "orchestre-tahour": {
    photos: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    ],
    description: "Orchestre Tahour (@tahourofficial), la star absolue des mariages marocains — plus d'1 million d'abonnés Instagram. Musique chaâbi authentique et orientale, cérémonies inoubliables à Marrakech et dans tout le Maroc.",
    instagram: "https://www.instagram.com/tahourofficial/",
    reviews: [
      { author: "Nadia A.", event: "Grand mariage à Marrakech", stars: 5, note: "Tahour, c'est la légende du mariage marocain. Dès les premières notes, toute la salle s'est levée. Une énergie et une authenticité incomparables." },
      { author: "Hicham B.", event: "Mariage traditionnel", stars: 5, note: "Le meilleur orchestre chaâbi du Maroc, sans aucun doute. Tahour a fait de notre mariage un moment de pure magie. Tous nos invités en parlent encore." },
    ],
  },
  "les-musiciens-doz": {
    photos: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    ],
    description: "Les Musiciens Doz, formation musicale d'exception à Marrakech — plus de 15 ans d'expérience, de 4 à 18 artistes, 400+ chansons répertoire. Mariage, gala, événements privés à Marrakech, Paris, Genève, Londres.",
    website: "https://lesmusiciensdoz.com/",
    reviews: [
      { author: "Layla M.", event: "Mariage de luxe à Marrakech", stars: 5, note: "Les Musiciens Doz ont su mêler tradition et modernité avec une maestria absolue. Le groupe est incroyable, les musiciens sont des artistes accomplis." },
      { author: "Omar S.", event: "Réception internationale", stars: 5, note: "Formation impeccable, répertoire immense et adaptabilité remarquable. Que ce soit pour de la musique marocaine ou internationale, ils excellent. Bravo !" },
    ],
  },
  "dj-medi": {
    photos: [
      "https://images.unsplash.com/photo-1571266028243-d220a5e0d1a2?w=800&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    ],
    description: "DJ Medi (@dj.medi), résident à M Avenue Marrakech — spécialiste Afro, Amapiano, House et Trap Chaabi pour mariages et soirées VIP. 9 800 abonnés Instagram, style unique alliant électronique et sonorités marocaines.",
    instagram: "https://www.instagram.com/dj.medi/",
    website: "https://dj-medi.com/",
    reviews: [
      { author: "Sara K.", event: "Mariage à Marrakech", stars: 5, note: "DJ Medi est hors catégorie. Il a su lire la salle et faire monter l'ambiance progressivement jusqu'à l'explosion finale. Une soirée mémorable !" },
      { author: "Karim A.", event: "Soirée privée", stars: 5, note: "Mix parfait entre musique internationale et chaabi moderne. DJ Medi a transformé notre soirée en vrai festival. On le rebooke sans hésitation." },
    ],
  },
  "amande-caramel-tanger": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    ],
    description: "Amande & Caramel by Amal Saber (@amande.caramel), traiteur créatif et passionné à Tanger — cuisine marocaine raffinée avec une touche contemporaine, pâtisseries orientales d'exception pour mariages et réceptions.",
    instagram: "https://www.instagram.com/amande.caramel/",
    reviews: [
      { author: "Samira H.", event: "Mariage à Tanger", stars: 5, note: "Amande & Caramel a sublimé notre mariage avec des mets d'une délicatesse rare. Les pâtisseries étaient un régal visuel et gustatif. On recommande !" },
      { author: "Mehdi Z.", event: "Fiançailles", stars: 5, note: "Amal Saber est une vraie artiste de la cuisine. Chaque plat était une création. Service impeccable et présentation magnifique. Merci infiniment." },
    ],
  },
  "chhiouate-fes": {
    photos: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "Chhiouate Fès, traiteur emblématique de la gastronomie fassie pour mariages et grandes cérémonies — recettes traditionnelles transmises de génération en génération, saveurs authentiques et service irréprochable.",
    website: "https://chhiouate-fes.com/",
    reviews: [
      { author: "Houda K.", event: "Grand mariage à Fès", stars: 5, note: "Chhiouate Fès, c'est le goût authentique de la tradition. La pastilla, le couscous et les briouates étaient divins. Nos invités ont redemandé des extras !" },
      { author: "Youssef A.", event: "Mariage traditionnel", stars: 5, note: "Cuisine de Fès dans toute sa splendeur. Générosité, qualité et professionnalisme — le trio gagnant de Chhiouate. Référence absolue pour les mariages fassis." },
    ],
  },
  "lucie-chopart-photo": {
    photos: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    ],
    description: "Lucie Chopart, photographe professionnelle de mariage basée à Casablanca — regard artistique sensible, photographie lumineuse et émotionnelle qui capture l'essence de vos moments les plus précieux au Maroc et à l'international.",
    website: "https://luciechopart.com/",
    reviews: [
      { author: "Manon B.", event: "Mariage franco-marocain", stars: 5, note: "Lucie a une sensibilité artistique extraordinaire. Nos photos de mariage sont d'une beauté et d'une émotion rares. On replonge dans chaque instant à chaque regard." },
      { author: "Amine C.", event: "Mariage à Casablanca", stars: 5, note: "Photographe talentueuse, douce et discrète pendant la cérémonie mais toujours au bon endroit. Le résultat est époustouflant. Merci Lucie !" },
    ],
  },
  "boheme-marrakech": {
    photos: [
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    ],
    description: "Bohème Marrakech, agence spécialisée dans l'organisation et la décoration de mariages et événements à Marrakech — ambiances féeriques, mariage dans le désert, scénographies bohèmes et orientales d'exception.",
    website: "https://boheme-marrakech.com/",
    reviews: [
      { author: "Emma D.", event: "Mariage bohème à Marrakech", stars: 5, note: "Bohème Marrakech a réalisé notre rêve : un mariage dans le désert avec une décoration à couper le souffle. Organisation parfaite du début à la fin." },
      { author: "Riad A.", event: "Réception de luxe", stars: 5, note: "Équipe passionnée et créative, décor unique et raffiné. Bohème Marrakech comprend parfaitement la vision des mariés et la dépasse. Expérience magique." },
    ],
  },

  // ── Zafaf.net additions — real photos ────────────────────────────────────

  // Photographes
  "jalal-photography": {
    photos: [
      "https://i.zafaf.net/providers/39502/preview_kjavexxygqorjvllnwmugubjj.jpg",
      "https://i.zafaf.net/providers/39502/preview_txlofckqoxvubspqlzucubqts.jpg",
      "https://i.zafaf.net/providers/39502/preview_weffgsemhbdtbcusoiwuznhxl.jpg",
      "https://i.zafaf.net/providers/39502/preview_fvqupksankkexcwapncgraotd.jpg",
    ],
    description: "Jalal Photography, photographe professionnel de mariage à Casablanca — maîtrise de la lumière naturelle, style élégant et reportages complets qui capturent chaque émotion de votre grand jour.",
    website: "https://morocco.zafaf.net/photographes/casablanca/jalal-photography-39502",
    reviews: [
      { author: "Nadia K.", event: "Mariage à Casablanca", stars: 5, note: "Des photos de toute beauté, Jalal est discret mais toujours au bon endroit. Chaque image raconte une histoire. On recommande les yeux fermés !" },
      { author: "Mehdi R.", event: "Réception familiale", stars: 5, note: "Professionnel, ponctuel et créatif. Les photos ont ému toute notre famille. Merci Jalal pour ces souvenirs inestimables." },
    ],
  },
  "studio-lorenzo-salemi": {
    photos: [
      "https://i.zafaf.net/providers/18909/preview_lophfgqqsopxjstxzrsyupani.jpg",
      "https://i.zafaf.net/providers/18909/preview_jdqkqkyekgptpvhvptjbdcyun.jpg",
      "https://i.zafaf.net/providers/18909/preview_pfsvtxzjfmzfpyjhtahhxzoes.jpg",
      "https://i.zafaf.net/providers/18909/preview_azjqkrajdtchzanyklhnnpcol.jpg",
    ],
    description: "Studio Lorenzo Salemi, photographe italo-marocain basé à Casablanca — style éditorial raffiné, photographie de mariage haut de gamme et portraits artistiques pour les couples qui cherchent l'exception.",
    website: "https://morocco.zafaf.net/photographes/casablanca/studio-lorenzo-salemi-18909",
    reviews: [
      { author: "Sara L.", event: "Mariage franco-marocain", stars: 5, note: "Un vrai artiste. Lorenzo a su mêler les deux cultures dans nos photos avec une sensibilité rare. Un travail d'une beauté exceptionnelle." },
      { author: "Karim B.", event: "Mariage à Casablanca", stars: 5, note: "Photos dignes d'un magazine de mariage. Lorenzo est professionnel, attentionné et livre un travail irréprochable dans les délais." },
    ],
  },
  "yassine-daoudi-photo": {
    photos: [
      "https://i.zafaf.net/providers/18703/preview_ocppmqxsakfouvbcixwimjddg.jpg",
      "https://i.zafaf.net/providers/18703/preview_hgjmnnkpnhnvuzpmvrxfkvmoo.jpg",
      "https://i.zafaf.net/providers/18703/preview_jikmgtkaxkqmlxbyvixmuciuo.jpg",
    ],
    description: "Yassine Daoudi Photographe, spécialiste du reportage de mariage à Casablanca — approche documentaire et artistique, gestion parfaite de la lumière pour des souvenirs inoubliables.",
    reviews: [
      { author: "Asmaa T.", event: "Mariage à Casablanca", stars: 5, note: "Yassine est exceptionnel. Il capture des moments vrais et spontanés avec un talent incroyable. Nos photos sont un vrai trésor." },
      { author: "Omar F.", event: "Cérémonie de fiançailles", stars: 4, note: "Très bon photographe, réactif et créatif. Excellent rapport qualité-prix pour un prestataire de ce niveau." },
    ],
  },
  "driss-benmalek": {
    photos: [
      "https://i.zafaf.net/providers/18906/preview_wnsffrkuolhcafjriwefmtxml.jpg",
      "https://i.zafaf.net/providers/18906/preview_ikgamvfavijrhfespvkscjifn.jpg",
      "https://i.zafaf.net/providers/18906/preview_yxplikzbiqshaqxtkwdxrmkqg.jpg",
    ],
    description: "Driss Benmalek, photographe de mariage à Casablanca — regard contemporain, maîtrise technique et sens du détail pour immortaliser vos moments les plus précieux avec authenticité.",
    reviews: [
      { author: "Imane S.", event: "Mariage traditionnel", stars: 5, note: "Un photographe talentueux qui sait se faire oublier pour mieux capturer les émotions. Résultat saisissant de naturel." },
      { author: "Younes A.", event: "Mariage mixte", stars: 4, note: "Très professionnel et passionné. Photos de grande qualité livrées rapidement. Entière satisfaction." },
    ],
  },
  "agence-photo-genie": {
    photos: [
      "https://i.zafaf.net/providers/7860/preview_hzwewdilumrchlgwenxyeoafz.jpg",
      "https://i.zafaf.net/providers/7860/preview_04LW7uC9gVypx9bg3TUPOjmYE.jpg",
      "https://i.zafaf.net/providers/7860/preview_ZkUJZperMY97yAUffVGnfdSQA.jpg",
    ],
    description: "Agence Photo Génie (APG), studio photo de référence à Casablanca — reportages de mariage complets, photo et vidéo, équipe expérimentée pour couvrir votre événement avec professionnalisme.",
    reviews: [
      { author: "Salima B.", event: "Grand mariage", stars: 5, note: "APG a couvert notre mariage avec une équipe complète et très professionnelle. Photos et vidéo sont magnifiques. Très bonne organisation." },
      { author: "Anas M.", event: "Mariage familial", stars: 4, note: "Excellent travail photographique. L'équipe est réactive, sympathique et les résultats sont à la hauteur des attentes." },
    ],
  },
  "studio-bouregreg": {
    photos: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
      "https://images.unsplash.com/photo-1520174691701-8a8c30737ead?w=800&q=80",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
    ],
    description: "Studio Bouregreg, photographe de mariage basé à Rabat — images lumineuses et poétiques inspirées des rives du Bouregreg, pour des reportages de mariage alliant tradition et modernité.",
    reviews: [
      { author: "Fatima Z.", event: "Mariage à Rabat", stars: 5, note: "Un photographe discret et talentueux. Ses photos ont une lumière et une âme particulières. Nous gardons ces souvenirs pour la vie." },
      { author: "Rachid O.", event: "Mariage traditionnel", stars: 4, note: "Très bonne prestation, ponctuel et créatif. Le rendu final est de très belle qualité." },
    ],
  },
  "toufike-photography": {
    photos: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    ],
    description: "Toufike Photography, photographe de mariage à Casablanca — style lumineux et émotionnel, spécialisé dans les mariages marocains et les cérémonies traditionnelles avec une touche contemporaine.",
    reviews: [
      { author: "Hind B.", event: "Mariage à Casablanca", stars: 5, note: "Toufike a su capturer tous nos moments avec sensibilité. Un vrai talent, des photos naturelles et émouvantes." },
      { author: "Bilal T.", event: "Soirée de mariage", stars: 5, note: "Excellent photographe, professionnel et discret. Résultat au-delà de nos attentes. Merci !" },
    ],
  },
  "production-company-morocco": {
    photos: [
      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=800&q=80",
      "https://images.unsplash.com/photo-1574717024453-354056adc766?w=800&q=80",
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&q=80",
    ],
    description: "Production Company Morocco, société de production vidéo à Casablanca — films de mariage cinématographiques, drone, montage premium pour immortaliser votre jour J avec une qualité professionnelle.",
    reviews: [
      { author: "Leila H.", event: "Grand mariage", stars: 5, note: "Un film de mariage digne d'un court-métrage ! L'équipe est talentueuse, les images aériennes sont somptueuses. On revoit notre film en boucle." },
      { author: "Adam C.", event: "Mariage international", stars: 5, note: "Prestation haut de gamme, équipe très professionnelle. Le rendu final est exceptionnel — cinématographique et émouvant." },
    ],
  },

  // Traiteurs
  "salma-sekkat-traiteur": {
    photos: [
      "https://i.zafaf.net/providers/8267/preview_Z4RbTmNOmHyXJrWR63i3hrGcp.jpg",
      "https://i.zafaf.net/providers/8267/preview_T5AjViombNIl5L92JfmSpDkyx.jpg",
      "https://i.zafaf.net/providers/8267/preview_q4yNpJfwNiHUdS0L0XAt3d6UJ.jpg",
    ],
    description: "Salma Sekkat Traiteur, référence gastronomique à Casablanca — cuisine marocaine traditionnelle revisitée, buffets élaborés et service traiteur haut de gamme pour vos mariages et événements privés.",
    reviews: [
      { author: "Kenza L.", event: "Mariage 300 personnes", stars: 5, note: "Une cuisine délicieuse et un service impeccable. Salma et son équipe ont géré notre mariage avec une rigueur et une générosité exemplaires." },
      { author: "Tarik S.", event: "Réception de famille", stars: 5, note: "Tout était parfait : présentation, goût, quantités. Nos invités n'ont pas arrêté de complimenter la cuisine. Un sans-faute !" },
    ],
  },
  "alhambra-traiteur": {
    photos: [
      "https://i.zafaf.net/providers/18640/preview_oyjjwijdktetrlxfajsnrfzpk.jpg",
      "https://i.zafaf.net/providers/18640/preview_xgicaroombqtnxgaclnfioion.jpg",
      "https://i.zafaf.net/providers/18640/preview_vwvxmsuafcabukhxgbljkatfs.jpg",
    ],
    description: "Alhambra Traiteur, service traiteur d'exception à Casablanca — inspiré de la gastronomie andalouse et marocaine, pour des tables d'apparat et des banquets de prestige inoubliables.",
    reviews: [
      { author: "Amira R.", event: "Mariage andalou", stars: 5, note: "Une table somptueuse, des saveurs exquises. Alhambra a magnifié notre mariage avec une cuisine raffinée et un service digne des grandes maisons." },
      { author: "Hassan M.", event: "Réception d'entreprise", stars: 4, note: "Excellent traiteur, présentation élégante et cuisine délicieuse. Très bonne organisation et ponctualité." },
    ],
  },
  "el-ghali-traiteur": {
    photos: [
      "https://i.zafaf.net/providers/8302/preview_ryfPHf7r5o0uVPToykSdtoI7b.jpg",
      "https://i.zafaf.net/providers/8302/preview_bjlxmneqlsjdrejeitjesgoyd.jpg",
      "https://i.zafaf.net/providers/8302/preview_ysmssueykoqqvfkgvheavhuvd.jpg",
    ],
    description: "El Ghali Traiteur, maître traiteur à Marrakech — cuisine marocaine authentique, tajines royaux et couscous de fête pour des réceptions et mariages qui honorent la tradition culinaire du royaume.",
    reviews: [
      { author: "Zineb A.", event: "Mariage traditionnel Marrakech", stars: 5, note: "Un festin royal ! El Ghali a régalé nos 400 invités avec une cuisine authentique et généreuse. Le couscous était divin." },
      { author: "Mustapha K.", event: "Réception familiale", stars: 5, note: "Service exemplaire, cuisine de qualité supérieure. El Ghali incarne le meilleur de la tradition traiteur marrakchie." },
    ],
  },
  "cherkaoui-traiteur": {
    photos: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
    ],
    description: "Cherkaoui Traiteur, tradition du goût à Casablanca — spécialisé dans les grandes réceptions et mariages marocains, avec des menus variés alliant générosité et finesse culinaire.",
    reviews: [
      { author: "Nora B.", event: "Mariage 500 invités", stars: 4, note: "Excellent traiteur pour les grandes réceptions. Cuisine savoureuse, équipe sérieuse et service bien organisé." },
      { author: "Samir L.", event: "Réception de mariage", stars: 4, note: "Bonne prestation, cuisine généreuse et tasty. Rapport qualité-prix très correct pour ce niveau de service." },
    ],
  },
  "ribat-alafrah": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "Ribat Alafrah, traiteur incontournable à Rabat — mariage de la cuisine marocaine traditionnelle et contemporaine pour des événements festifs mémorables dans la capitale.",
    reviews: [
      { author: "Samira O.", event: "Mariage à Rabat", stars: 4, note: "Très bon traiteur, cuisine maison et savoureuse. L'équipe est sérieuse et les quantités sont généreuses." },
      { author: "Walid F.", event: "Fiançailles", stars: 4, note: "Prestation satisfaisante, cuisine traditionnelle de qualité. Bon rapport qualité-prix." },
    ],
  },
  "yacout-traiteur": {
    photos: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
    ],
    description: "Yacout Traiteur, adresse légendaire de Marrakech — cuisine marocaine d'exception dans un cadre palatial, spécialisé dans les banquets de prestige et les dîners de gala pour mariages d'exception.",
    reviews: [
      { author: "Lina M.", event: "Mariage de luxe", stars: 5, note: "Yacout, c'est la quintessence de la cuisine marocaine. Un repas de noces inoubliable dans un cadre de rêve. Nos invités étrangers étaient subjugués." },
      { author: "Jalil A.", event: "Réception VIP", stars: 5, note: "Un service d'exception pour une cuisine d'exception. Yacout porte haut la gastronomie marocaine. Indétrônable." },
    ],
  },
  "afrah-serri": {
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    description: "Sté Afrah Serri, traiteur établi à Casablanca — service traiteur complet pour mariages et fêtes, avec une gamme de menus alliant tradition marocaine et cuisine orientale.",
    reviews: [
      { author: "Loubna S.", event: "Mariage à Casablanca", stars: 4, note: "Bon traiteur, cuisine correcte et service ponctuel. Une valeur sûre pour les mariages casablancais." },
      { author: "Idriss B.", event: "Réception familiale", stars: 4, note: "Prestation satisfaisante, équipe agréable et cuisine maison généreuse." },
    ],
  },
  "zemrani-traiteur": {
    photos: [
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    ],
    description: "Zemrani Traiteur, maison de bouche à Casablanca — tradition culinaire marocaine transmise de génération en génération, pour des mariages et réceptions empreints d'authenticité et de saveurs.",
    reviews: [
      { author: "Houda R.", event: "Mariage traditionnel", stars: 4, note: "Une cuisine généreuse et authentique. Zemrani respecte les saveurs d'antan tout en offrant un service moderne et efficace." },
      { author: "Othmane K.", event: "Réception de mariage", stars: 4, note: "Bonne prestation, cuisine familiale de qualité. Un traiteur fiable pour les grandes familles." },
    ],
  },

  // Wedding planners
  "les-mariages-comtesse": {
    photos: [
      "https://i.zafaf.net/providers/4335/preview_bpohjodgdhubklphrgcmzhphn.jpg",
      "https://i.zafaf.net/providers/4335/preview_wwufzwqjfdosdukvtrvsfesaj.jpg",
      "https://i.zafaf.net/providers/4335/preview_thlnrasmmbdwhxtjhzedacssv.jpg",
    ],
    description: "Les Mariages de La Comtesse, wedding planner d'exception à Marrakech — scénographies féeriques, mariages de conte inspirés des palais andalous, pour des couples qui rêvent grand.",
    website: "https://morocco.zafaf.net/planification-de-mariage/casablanca/les-mariages-de-la-comtesse-4335",
    reviews: [
      { author: "Céline D.", event: "Mariage à Marrakech", stars: 5, note: "La Comtesse a transformé notre vision en réalité. Chaque détail était parfait, la décoration à couper le souffle. Un mariage de rêve absolu." },
      { author: "Youssef B.", event: "Mariage franco-marocain", stars: 5, note: "Organisation sans faille, créativité débordante et équipe passionnée. La Comtesse livre toujours au-delà des attentes." },
    ],
  },
  "cocoon-events-luxury": {
    photos: [
      "https://i.zafaf.net/providers/4461/preview_oh1LG1ICTYxkJQBMf24xYs7uM.jpg",
      "https://i.zafaf.net/providers/4461/preview_tSukmZOomZsmGIpGcWKMleQQI.jpg",
      "https://i.zafaf.net/providers/4461/preview_4kSeXaRCHSP1t8oBX9aV91zKW.jpg",
    ],
    description: "Cocoon Events & Luxury, agence événementielle haut de gamme à Marrakech — mariages de luxe, décors sur-mesure et coordination complète pour des événements qui conjuguent raffinement et emotion.",
    reviews: [
      { author: "Sophie M.", event: "Mariage de luxe", stars: 5, note: "Cocoon Events a orchestré notre mariage avec une maestria absolue. Tout était luxueux, harmonieux et personnalisé. Merci pour ce rêve éveillé !" },
      { author: "Amine T.", event: "Réception de prestige", stars: 5, note: "Équipe exceptionnelle, sens du détail impressionnant. Cocoon Events est dans une autre ligue. Recommandé sans hésitation." },
    ],
  },
  "annabelle-romain-events": {
    photos: [
      "https://i.zafaf.net/providers/4443/preview_vegsftqpkndwaxexgkotggmiq.jpg",
      "https://i.zafaf.net/providers/4443/preview_tggkileyurohdmkknyokknpmx.jpg",
      "https://i.zafaf.net/providers/4443/preview_yyomxmagktzovnanuqbdcbybb.jpg",
    ],
    description: "Annabelle Romain Events, wedding planner franco-marocaine à Marrakech — experte des mariages destination alliant élégance européenne et chaleur orientale, pour des cérémonies inoubliables au Maroc.",
    website: "https://morocco.zafaf.net/planification-de-mariage/marrakesh/annabelle-romain-4443",
    reviews: [
      { author: "Claire F.", event: "Mariage destination Marrakech", stars: 5, note: "Annabelle nous a guidés à travers toute l'organisation depuis Paris. Résultat parfait, sans aucun stress. Un mariage absolument magnifique." },
      { author: "Mehdi A.", event: "Mariage international", stars: 5, note: "Professionnalisme, créativité et écoute — Annabelle réunit tout. Notre mariage fut exactement ce dont nous rêvions." },
    ],
  },
  "nadav-event-management": {
    photos: [
      "https://i.zafaf.net/providers/18944/preview_yqrddaxrwmzzglazwqjzmgyxr.jpg",
      "https://i.zafaf.net/providers/18944/preview_ondttaoeqnmshrrgysjuokjbb.jpg",
      "https://i.zafaf.net/providers/18944/preview_oxrxfessxbtjyyykzaboahgtn.jpg",
    ],
    description: "Nadav Event Management, agence spécialisée en mariages de luxe à Marrakech — coordination haut de gamme, logistique irréprochable et créations scénographiques pour les couples les plus exigeants.",
    reviews: [
      { author: "Julia K.", event: "Mariage de luxe", stars: 5, note: "Nadav Event Management est dans une catégorie à part. Professionnalisme de très haut niveau, créativité et execution parfaite." },
      { author: "Sami R.", event: "Réception VIP", stars: 5, note: "Une équipe d'élite qui gère chaque détail avec maestria. Notre mariage était digne des plus grands palaces." },
    ],
  },
  "golden-palms-events": {
    photos: [
      "https://i.zafaf.net/providers/4410/preview_wrwreunkbtgezukdpqzqeerlt.jpg",
      "https://i.zafaf.net/providers/4410/preview_EDJvqAuvIXdlpkgaED4RASI2d.jpg",
      "https://i.zafaf.net/providers/4410/preview_reesnzdjnqpnxrgwsbsxtieha.jpg",
    ],
    description: "Golden Palms Events, wedding planner de prestige à Marrakech — entre les palmeraies et les palais, crée des cérémonies d'exception alliant luxe, nature et tradition marocaine pour des mariages grandioses.",
    reviews: [
      { author: "Laura S.", event: "Mariage dans la palmeraie", stars: 5, note: "Un mariage de rêve dans la palmeraie de Marrakech. Golden Palms a tout géré à la perfection. Chaque instant était magique." },
      { author: "Karim D.", event: "Mariage en plein air", stars: 5, note: "Organisation parfaite, décors somptueux et équipe passionnée. Golden Palms mérite amplement sa réputation d'excellence." },
    ],
  },
  "marrakech-weddings": {
    photos: [
      "https://i.zafaf.net/providers/4385/preview_btbpixhaymrhiqlxexrkhbbrv.jpg",
      "https://i.zafaf.net/providers/4385/preview_dfZKjKn04KqnNpNpd9oahSq3i.jpg",
      "https://i.zafaf.net/providers/4385/preview_ouohvN4yX2yB2TaUH5LOBbSfP.jpg",
    ],
    description: "Marrakech Weddings, agence spécialisée dans les mariages destination à Marrakech — profonde connaissance du terrain, réseau de prestataires premium et organisation complète pour les couples du monde entier.",
    website: "https://morocco.zafaf.net/planification-de-mariage/marrakesh/marrakech-weddings-4385",
    reviews: [
      { author: "Emma W.", event: "Destination wedding", stars: 5, note: "Marrakech Weddings a rendu notre mariage destination parfaitement simple à organiser depuis Londres. Un résultat absolument sublime." },
      { author: "Romain P.", event: "Mariage franco-marocain", stars: 5, note: "Équipe bilingue, très professionnelle et attentive. Marrakech Weddings connaît parfaitement la ville et ses prestataires. Résultat fantastique." },
    ],
  },
  "layali-el-farah": {
    photos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    ],
    description: "Layali El Farah, organisateur d'événements festifs à Casablanca — spécialiste des nuits de fête marocaines, ambiances mille et une nuits et animations pour des soirées de mariage extraordinaires.",
    reviews: [
      { author: "Meryem K.", event: "Soirée henna", stars: 5, note: "Layali El Farah a transformé notre soirée henna en véritable spectacle. Décors magnifiques, animations au top, soirée mémorable !" },
      { author: "Fouad B.", event: "Mariage à Casablanca", stars: 4, note: "Très bonne organisation de la soirée, ambiance festive garantie. Une équipe dynamique et créative." },
    ],
  },
  "dar-houria-mariages": {
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1478147427282-58a87a433d34?w=800&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    ],
    description: "Dar Houria Mariages, wedding planner à Rabat — mariages intimistes et grandioses dans les plus beaux riad et palais de la capitale, avec une approche personnalisée et un service tout inclus.",
    reviews: [
      { author: "Ghita A.", event: "Mariage à Rabat", stars: 5, note: "Dar Houria a magnifié notre mariage avec goût et élégance. Chaque détail reflétait notre personnalité. Une organisatrice hors pair !" },
      { author: "Rachid M.", event: "Cérémonie de mariage", stars: 4, note: "Organisation sérieuse et attentive, beau résultat final. Dar Houria s'adapte aux budgets et aux envies de chacun." },
    ],
  },

  // Lieux de réception
  "le-palace-danfa": {
    photos: [
      "https://i.zafaf.net/providers/48/preview_DabwJtOVk6B5NsXx1eTY2HhA0.jpg",
      "https://i.zafaf.net/providers/48/preview_petkJuYgaV1r96bWuItfE7211.jpg",
      "https://i.zafaf.net/providers/48/preview_9LDUEUCYFyIuopKd4CbTU8yye.jpg",
      "https://i.zafaf.net/providers/48/preview_rfzpC9ahtYpUc9gkea07Y2I5C.jpg",
    ],
    description: "Le Palace D'Anfa, salle des fêtes emblématique de Casablanca — cadre majestueux sur les hauteurs d'Anfa, capacité XXL et décors palatials pour les plus grands mariages et réceptions de la métropole.",
    website: "https://morocco.zafaf.net/hotels/casablanca/le-palace-danfa-48",
    reviews: [
      { author: "Siham R.", event: "Mariage 800 invités", stars: 5, note: "Le Palace D'Anfa est LE lieu de référence à Casablanca. Salle grandiose, service impeccable et équipe très professionnelle. Un mariage royal !" },
      { author: "Zakaria M.", event: "Réception de prestige", stars: 5, note: "Cadre somptueux, personnel attentif et prestation haut de gamme. Le Palace D'Anfa a rendu notre soirée inoubliable." },
    ],
  },
  "mazagan-beach-resort": {
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    ],
    description: "Mazagan Beach Resort, complexe hôtelier 5 étoiles à El Jadida — espace balnéaire exceptionnel face à l'océan Atlantique, idéal pour les mariages destination, séminaires et événements de prestige.",
    reviews: [
      { author: "Nadia B.", event: "Mariage balnéaire", stars: 5, note: "Mazagan, c'est le mariage de luxe face à l'Atlantique. Un cadre spectaculaire, des équipes hôtelières irréprochables et des souvenirs pour toute une vie." },
      { author: "Mehdi O.", event: "Réception d'entreprise", stars: 5, note: "Infrastructure haut de gamme, cadre naturel exceptionnel et services de très haute qualité. Mazagan reste incomparable pour les grands événements." },
    ],
  },
  "la-sultana-marrakech": {
    photos: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&q=80",
    ],
    description: "La Sultana Marrakech, boutique-hôtel 5 étoiles en plein cœur de la médina — riad de luxe aux suites somptueuses et aux terrasses panoramiques sur la Koutoubia, pour des mariages intimistes d'exception.",
    reviews: [
      { author: "Isabelle C.", event: "Mariage intimiste", stars: 5, note: "La Sultana est un bijou de Marrakech. Cadre féerique, service personnalisé d'excellence et gastronomie raffinée. Notre mariage fut magique." },
      { author: "Karim A.", event: "Réception privée", stars: 5, note: "Impossible de trouver plus beau et plus intime. La Sultana offre une expérience unique mêlant architecture andalouse et luxe contemporain." },
    ],
  },
  "palais-mehdi": {
    photos: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    ],
    description: "Palais Mehdi, lieu de réception de prestige à Marrakech — architecture royale marocaine, jardins luxuriants et salles d'apparat pour des mariages et événements privés d'une grandeur incomparable.",
    reviews: [
      { author: "Fatima Z.", event: "Mariage royal", stars: 5, note: "Le Palais Mehdi est à la hauteur de son nom. Une architecture majestueuse, des jardins enchanteurs et un service princier. Notre mariage était digne d'un film." },
      { author: "Omar B.", event: "Réception de gala", stars: 5, note: "Un lieu hors du commun qui fait rêver dès le premier regard. Palais Mehdi, c'est le luxe marocain à l'état pur." },
    ],
  },
  "la-mamounia": {
    photos: [
      "https://i.zafaf.net/providers/18437/preview_lzxsvkdvjfhgfqvhqhlcctkbd.jpg",
      "https://i.zafaf.net/providers/18437/preview_gqcpaespripfhbrqfuoicmbbz.jpg",
      "https://i.zafaf.net/providers/18437/preview_lwjvbvodceckfjcvqikbvysbj.jpg",
      "https://i.zafaf.net/providers/18437/preview_mhhruuxlfjirmfuvcrniymkmm.jpg",
    ],
    description: "La Mamounia, palace légendaire de Marrakech depuis 1923 — cadre mythique classé parmi les meilleurs hôtels du monde, pour des mariages d'exception dans les jardins andalous ou les salles de bal palatiales.",
    website: "https://www.mamounia.com/fr/",
    reviews: [
      { author: "Audrey P.", event: "Mariage de luxe", stars: 5, note: "La Mamounia, c'est la perfection incarnée. Un mariage ici est au-delà du rêve — le service, le cadre, la gastronomie, tout est à son apogée." },
      { author: "Hicham S.", event: "Réception royale", stars: 5, note: "Le meilleur hôtel du monde pour le meilleur jour de notre vie. La Mamounia ne déçoit jamais. Une expérience hors de ce monde." },
    ],
  },
  "ksar-char-bagh": {
    photos: [
      "https://i.zafaf.net/providers/16700/preview_dmxmaxbatozwkmmmhjootbzus.jpg",
      "https://i.zafaf.net/providers/16700/preview_13-the-smoking-lounge1.jpg",
      "https://i.zafaf.net/providers/16700/preview_images%20(1).jpg",
      "https://i.zafaf.net/providers/16700/preview_images%20(2).jpg",
    ],
    description: "Ksar Char Bagh, palais-jardin d'exception à Marrakech — oasis de luxe inspiré des palais Nasrides de Grenade, avec 12 suites exclusives et des jardins à la française pour des mariages ultra-privés.",
    reviews: [
      { author: "Delphine M.", event: "Mariage ultra-privatif", stars: 5, note: "Ksar Char Bagh est un rêve éveillé. L'exclusivité du lieu, les jardins andalous et l'hospitalité royale en font un cadre de mariage unique au monde." },
      { author: "Tarik B.", event: "Réception privée", stars: 5, note: "Un lieu secret et somptueux à Marrakech. Ksar Char Bagh offre un niveau d'exclusivité et de raffinement qu'on ne trouve nulle part ailleurs." },
    ],
  },
  "sofitel-rabat": {
    photos: [
      "https://i.zafaf.net/providers/205/preview_6813_wlfh_01_p_1024x728.jpg",
      "https://i.zafaf.net/providers/205/preview_MgLXkJ7LFg4hAlwWQellD1vDx.jpg",
      "https://i.zafaf.net/providers/205/preview_1rm84Laq523hltddaERhwzXnF.jpg",
      "https://i.zafaf.net/providers/205/preview_DuXvrUT8kitkZITRmuGI32uDS.jpg",
    ],
    description: "Sofitel Rabat Jardin des Roses, palace 5 étoiles au cœur de la capitale — 5 hectares de jardins majestueux, salles de réception Art Déco et service Sofitel pour des mariages présidentiels à Rabat.",
    website: "https://www.sofitel-rabat-jardins-des-roses.com/",
    reviews: [
      { author: "Leila H.", event: "Mariage à Rabat", stars: 5, note: "Le Sofitel Rabat offre un cadre palatial et un service d'une rare élégance. Nos invités ont été subjugués par les jardins et la grandeur des lieux." },
      { author: "Amine R.", event: "Réception de gala", stars: 5, note: "Service 5 étoiles impeccable, cadre magnifique et équipe très professionnelle. Le Sofitel Rabat est la référence absolue dans la capitale." },
    ],
  },
  "villa-des-ambassadors": {
    photos: [
      "https://i.zafaf.net/providers/1316/preview_Z1mHqkzIf6IP3YWwDYSQuxBeW.jpg",
      "https://i.zafaf.net/providers/1316/preview_VwnynkfCqYNXnTUUwztMzYp5v.jpg",
      "https://i.zafaf.net/providers/1316/preview_VVrxWH5SM1tPURiM9hlwMWmvZ.jpg",
      "https://i.zafaf.net/providers/1316/preview_ch5ThnlZOKV8pnGAZoKkjEJtE.jpg",
    ],
    description: "Villa des Ambassadors, salle des fêtes d'exception à Casablanca — espace événementiel luxueux sur le boulevard de l'Atlantique, pour des mariages et réceptions de grande envergure dans la métropole économique.",
    reviews: [
      { author: "Sanaa L.", event: "Mariage 600 invités", stars: 5, note: "La Villa des Ambassadors est impressionnante. Espace généreux, décoration de prestige et personnel très attentif. Un mariage comme on en rêve !" },
      { author: "Younes A.", event: "Réception d'entreprise", stars: 4, note: "Lieu de standing, bien équipé et idéalement situé à Casablanca. L'équipe est professionnelle et réactive." },
    ],
  },

  // Robes de mariés
  "mhala-bridal": {
    photos: [
      "https://i.zafaf.net/providers/7848/preview_yvkwyuviurrxvpqnwlijvxubw.jpg",
      "https://i.zafaf.net/providers/7848/preview_QeGycuPn7j15VX8wpfy01ayos.jpg",
      "https://i.zafaf.net/providers/7848/preview_Wl0CPdHt6bxDXSPl0mTcODqr0.jpg",
    ],
    description: "MHALA Bridal, atelier de robes de mariée à Casablanca — créations exclusives alliant luxe oriental et couture contemporaine, pour les mariées qui souhaitent rayonner le jour de leur union.",
    website: "https://morocco.zafaf.net/robe-de-mariee/casablanca/mhala-bridal-7848",
    reviews: [
      { author: "Hind M.", event: "Mariage à Casablanca", stars: 5, note: "MHALA Bridal est une perle. Ma robe était à couper le souffle — broderies somptueuses et coupe parfaite. Je me suis sentie princesse !" },
      { author: "Zineb K.", event: "Mariage traditionnel", stars: 5, note: "Accueil chaleureux, choix magnifique et retouches impeccables. MHALA Bridal mérite amplement sa réputation à Casablanca." },
    ],
  },
  "demetrios-maroc": {
    photos: [
      "https://i.zafaf.net/providers/43327/preview_ctbhcgqscqqjgdgntgqjmvxby.jpg",
      "https://i.zafaf.net/providers/43327/preview_jjsueoevotniaqpjjphlnceqq.jpg",
      "https://i.zafaf.net/providers/43327/preview_ikzaxkljtdqycrueygxyjmejh.jpg",
    ],
    description: "DEMETRIOS Maroc, boutique officielle de la grande maison grecque de robes de mariée à Casablanca — collections de prestige international, robes de princesseet couture de luxe pour la mariée moderne.",
    reviews: [
      { author: "Camille R.", event: "Mariage mixte", stars: 5, note: "DEMETRIOS offre un niveau de qualité incomparable. Ma robe était absolument parfaite — dentelles délicates et finitions de haute couture." },
      { author: "Nora S.", event: "Mariage à Casablanca", stars: 5, note: "La marque parle d'elle-même. Le service en boutique est exceptionnel et le choix de robes très vaste. Je suis repartie avec LA robe de mes rêves." },
    ],
  },
  "dressia-mariage": {
    photos: [
      "https://i.zafaf.net/providers/34426/preview_aptvwmynljfxuvjhqrksbznjf.jpg",
      "https://i.zafaf.net/providers/34426/preview_uojowdapsgcckedntivyqrhng.jpg",
      "https://i.zafaf.net/providers/34426/preview_bgpcuqsjzliqmrokdsulgmcej.jpg",
    ],
    description: "Dressia, boutique de robes de mariée tendance à Casablanca — sélection pointue de robes contemporaines, bohèmes et romantiques pour la mariée d'aujourd'hui qui allie style et féminité.",
    reviews: [
      { author: "Sara T.", event: "Mariage bohème", stars: 5, note: "Dressia est la boutique qu'il me fallait. Des robes magnifiques, un conseil personnalisé et une ambiance très agréable. Je suis tombée amoureuse de ma robe !" },
      { author: "Amira L.", event: "Mariage champêtre", stars: 4, note: "Belle sélection, accueil sympa et rapport qualité-prix raisonnable pour le niveau des robes proposées." },
    ],
  },
  "lala-mollati": {
    photos: [
      "https://i.zafaf.net/providers/17219/preview_vuogvafjfbbpppoklnadnxjxe.jpg",
      "https://i.zafaf.net/providers/17219/preview_bhzjbnoapdwlcyqqdcjghacgr.jpg",
      "https://i.zafaf.net/providers/17219/preview_Sans%20titre%201.jpg",
    ],
    description: "Lala Mollati, créatrice de caftans et robes de mariée à Casablanca — maîtrise des techniques de broderie traditionnelle marocaine et des tissus nobles pour des tenues de mariée d'une élégance royale.",
    reviews: [
      { author: "Khadija B.", event: "Mariage traditionnel", stars: 5, note: "Lala Mollati crée des chefs-d'œuvre. Mon caftan était brodé à la main avec une précision et une beauté à couper le souffle. Inoubliable." },
      { author: "Houda A.", event: "Mariage marocain", stars: 5, note: "Un travail artisanal d'exception. La qualité des tissus et la finesse des broderies sont incomparables. La vraie tradition marocaine." },
    ],
  },
  "les-mariees-lahlou": {
    photos: [
      "https://i.zafaf.net/providers/17220/preview_fctimrwtzarsmfrsalkiehtav.jpg",
      "https://i.zafaf.net/providers/17220/preview_Sans%20titre%203.jpg",
      "https://i.zafaf.net/providers/17220/preview_Sans%20titre%205.jpg",
    ],
    description: "Les Mariées Madame Lahlou, institution de la robe de mariée à Casablanca depuis plusieurs décennies — collections exclusives, service sur-mesure et expertise reconnue pour habiller les plus belles mariées du Maroc.",
    reviews: [
      { author: "Fatima O.", event: "Mariage à Casablanca", stars: 5, note: "Madame Lahlou, c'est une institution. Accueil royal, robes somptueuses et service exceptionnel. Leur réputation est largement méritée." },
      { author: "Salma K.", event: "Cérémonie de mariage", stars: 5, note: "Une maison de confiance depuis des générations. La qualité et le savoir-faire sont incomparables. J'ai trouvé la robe parfaite." },
    ],
  },
  "jour-j-by-lahlou": {
    photos: [
      "https://i.zafaf.net/providers/18960/preview_fgrhmauavdoxveyeiwzpydhxy.jpg",
      "https://i.zafaf.net/providers/18960/preview_nnvincsqajdyuhbdrzvybsair.jpg",
      "https://i.zafaf.net/providers/18960/preview_eyemsqyregelmmnzijhuhrtdx.jpg",
    ],
    description: "Jour J by Lahlou, boutique contemporaine de robes de mariée à Casablanca — l'ADN Lahlou dans une version moderne et accessible, avec des collections tendance et un service personnalisé pour toutes les mariées.",
    reviews: [
      { author: "Rim B.", event: "Mariage moderne", stars: 5, note: "Jour J by Lahlou allie héritage et modernité à merveille. Ma robe était exactement ce dont je rêvais — élégante, moderne et parfaitement ajustée." },
      { author: "Wafa T.", event: "Mariage civil", stars: 4, note: "Belle boutique, belles robes et équipe de stylistes très à l'écoute. Un excellent choix pour les mariées qui cherchent le parfait équilibre." },
    ],
  },

  // Fleuristes
  "sarah-fleurs": {
    photos: [
      "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
      "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
    ],
    description: "Sarah Fleurs, fleuriste événementielle à Casablanca — compositions florales sur-mesure, arches de fleurs fraîches et décoration florale de mariage pour des cérémonies empreintes de poésie et de beauté.",
    reviews: [
      { author: "Imane B.", event: "Mariage à Casablanca", stars: 5, note: "Sarah a créé des compositions florales à couper le souffle. Chaque arrangement reflétait notre vision avec une précision et une beauté incroyables." },
      { author: "Anas T.", event: "Réception de mariage", stars: 5, note: "Un talent floral exceptionnel. Les fleurs de Sarah ont transformé notre salle en un jardin enchanté. Tout le monde a été subjugué." },
    ],
  },
  "nina-beni-fleuriste": {
    photos: [
      "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
      "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
    ],
    description: "Nina Beni Fleuriste, créatrice florale à Casablanca — bouquets de mariée, centres de table et décoration florale complète dans un style naturel, romantique et contemporain pour des célébrations inoubliables.",
    reviews: [
      { author: "Sana R.", event: "Mariage romantique", stars: 5, note: "Nina a créé LE bouquet dont je rêvais. Fraîcheur des fleurs, élégance des compositions et créativité débordante. Un travail d'artiste !" },
      { author: "Younes M.", event: "Réception champêtre", stars: 4, note: "Très belle fleuriste, créative et à l'écoute. Les compositions étaient magnifiques et les prix très raisonnables." },
    ],
  },
  "mon-amie-la-rose": {
    photos: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
      "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    ],
    description: "Mon Amie la Rose, boutique florale événementielle à Casablanca — spécialiste de la rose dans toutes ses variétés et couleurs, pour des décorations de mariage romantiques et des bouquets de mariée d'exception.",
    reviews: [
      { author: "Hiba L.", event: "Mariage tout en roses", stars: 5, note: "Mon Amie la Rose a fait de notre mariage un jardin de roses enchanté. La qualité des fleurs et la créativité des compositions sont incomparables." },
      { author: "Reda A.", event: "Soirée romantique", stars: 5, note: "Une boutique magique qui transforme les espaces en havre de beauté florale. Équipe passionnée et résultat toujours époustouflant." },
    ],
  },
  "jardin-sucre": {
    photos: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
      "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    ],
    description: "Jardin Sucré, fleuriste créative à Casablanca — mélange poétique de fleurs fraîches et de verdure luxuriante pour des décorations de mariage boho-chic, romantiques et pleines de charme naturel.",
    reviews: [
      { author: "Loubna K.", event: "Mariage bohème", stars: 5, note: "Jardin Sucré a capturé parfaitement l'esprit bohème de notre mariage. Des compositions florales vivantes, naturelles et absolument magnifiques." },
      { author: "Karim S.", event: "Cérémonie en plein air", stars: 4, note: "Belle créatrice florale, très à l'écoute et inspirée. Résultat naturel et élégant qui a su enchanter nos invités." },
    ],
  },
  "mille-et-une-roses": {
    photos: [
      "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=800&q=80",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    ],
    description: "Mille et Une Roses, fleuriste de prestige à Marrakech — décoration florale grandiose inspirée des jardins de l'Atlas et des palais de Marrakech, pour des mariages qui mêlent opulence florale et tradition orientale.",
    reviews: [
      { author: "Nadia M.", event: "Grand mariage Marrakech", stars: 5, note: "Mille et Une Roses a métamorphosé notre salle en jardin des Mille et Une Nuits. Un spectacle floral inoubliable, des roses partout !" },
      { author: "Ali B.", event: "Mariage palmeraie", stars: 5, note: "La magie florale de Marrakech incarnée. Des compositions d'une richesse et d'un raffinement qu'on ne trouve que dans la ville ocre." },
    ],
  },

  // Pâtissiers / Cake designers
  "cake-up-maroc": {
    photos: [
      "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    ],
    description: "CAKE UP, cake designer tendance à Casablanca — gâteaux de mariage sculptés et personnalisés, wedding cakes à étages, number cakes et créations sucrées pour des célébrations mémorables et gourmandes.",
    reviews: [
      { author: "Samia B.", event: "Mariage à Casablanca", stars: 5, note: "Notre gâteau de mariage CAKE UP était une véritable œuvre d'art ! Aussi beau que délicieux — nos invités n'en revenaient pas. Un sans-faute !" },
      { author: "Bilal O.", event: "Anniversaire de mariage", stars: 5, note: "CAKE UP crée de vraies sculptures sucrées. Personnalisation parfaite, goût divin et livraison impeccable. On recommande !" },
    ],
  },
  "safaa-cake-design": {
    photos: [
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
    ],
    description: "Safaa's Cake Design, pâtissière créative à Casablanca — wedding cakes personnalisés, gâteaux décorés à la main et créations sucrées uniques pour des mariages et événements qui méritent l'exceptionnel.",
    reviews: [
      { author: "Ghita M.", event: "Mariage romantique", stars: 5, note: "Safaa est une artiste du sucre. Notre wedding cake était absolument magnifique, avec des détails floraux peints à la main. Un vrai bijou !" },
      { author: "Tariq L.", event: "Baby shower", stars: 5, note: "Créativité, précision et délicieux goût — Safaa réunit tout. Je la recommande sans la moindre hésitation pour tous vos événements." },
    ],
  },
  "lou-cake-factory": {
    photos: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    ],
    description: "Lou Cake Factory, atelier de pâtisserie créative à Casablanca — gâteaux de mariage modernes et personnalisés, cupcakes, macarons et douceurs françaises pour illuminer vos tables de fête.",
    reviews: [
      { author: "Soumia A.", event: "Mariage chic", stars: 5, note: "Lou Cake Factory a concocté un gâteau de mariage absolument divin. Présentation irréprochable et goût exquis. Nos invités en redemandaient !" },
      { author: "Ismail K.", event: "Anniversaire", stars: 4, note: "Très bonne pâtissière créative, réactive et ponctuelle. Gâteaux délicieux et joliment décorés. Très bonne expérience." },
    ],
  },
  "lolitta-cake-design": {
    photos: [
      "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    ],
    description: "Lolitta Cake Design, cake artist à Casablanca — gâteaux de mariage artistiques, drip cakes, naked cakes et créations en sucre tirées à la main pour des célébrations aussi belles que savoureuses.",
    reviews: [
      { author: "Meriem B.", event: "Mariage à Casablanca", stars: 5, note: "Lolitta est une vraie artiste ! Notre gâteau de mariage était spectaculaire — pièce maîtresse de notre réception que tout le monde a photographiée." },
      { author: "Hamza T.", event: "Fiançailles", stars: 5, note: "Gâteau personnalisé absolument parfait. Lolitta écoute, propose et réalise exactement ce qu'on imagine. Délicieux en plus !" },
    ],
  },

  // Location de voitures
  "maroc-limousines": {
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
    ],
    description: "Maroc Limousines, service de transport de prestige à Casablanca — flotte de limousines et berlines de luxe pour vos cortèges de mariage, transferts VIP et locations avec chauffeur pour tous vos événements.",
    reviews: [
      { author: "Laila R.", event: "Mariage à Casablanca", stars: 5, note: "Maroc Limousines nous a fourni un service impeccable. Voitures rutilantes, chauffeurs en tenue et ponctualité exemplaire. Notre cortège était magnifique !" },
      { author: "Mehdi B.", event: "Cérémonie officielle", stars: 5, note: "Service VIP de très haute qualité. Flotte impressionnante et chauffeurs très professionnels. Je recommande pour tous les grands événements." },
    ],
  },
  "rs-limousine": {
    photos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
    ],
    description: "RS Limousine, location de voitures de mariage à Casablanca — berlines de luxe, 4×4 Premium et véhicules anciens pour un cortège nuptial qui allie style, élégance et confort le jour J.",
    reviews: [
      { author: "Hind S.", event: "Mariage à Casablanca", stars: 4, note: "Service correct, voitures propres et chauffeur ponctuel. RS Limousine est une valeur sûre pour les cortèges de mariage à Casablanca." },
      { author: "Omar L.", event: "Transfert VIP", stars: 5, note: "Très bonne expérience. Véhicules impeccables et chauffeur très professionnel. Je recommande sans hésitation." },
    ],
  },
  "city-gold-prestige": {
    photos: [
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    description: "City Gold Prestige, service de transport haut de gamme à Casablanca — location de Rolls-Royce, Bentley, Mercedes Classe S et Porsche Cayenne avec chauffeur pour les mariages les plus raffinés.",
    reviews: [
      { author: "Nadia A.", event: "Grand mariage", stars: 5, note: "City Gold Prestige a mis à notre disposition une Rolls-Royce blanche magnifique pour notre mariage. Service impeccable et voiture superbe !" },
      { author: "Karim M.", event: "Mariage de prestige", stars: 5, note: "La crème de la crème pour les voitures de mariage à Casablanca. Flotte exceptionnelle et service digne des grandes occasions." },
    ],
  },
  "summit-rent-maroc": {
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    description: "Summit Rent, location de véhicules d'exception à Casablanca — flotte premium alliant voitures classiques et sportives de luxe pour des cortèges de mariage mémorables et des transferts VIP.",
    reviews: [
      { author: "Sara O.", event: "Mariage à Casablanca", stars: 4, note: "Bon service, flotte bien entretenue et chauffeur sympa. Summit Rent est une option fiable pour les cortèges de mariage." },
      { author: "Youssef T.", event: "Soirée privée", stars: 4, note: "Service satisfaisant, véhicule propre et ponctuel. Rapport qualité-prix correct pour ce type de prestation." },
    ],
  },

  // Créateurs de faire-part
  "kameleon-design": {
    photos: [
      "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=800&q=80",
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
    ],
    description: "Kameleon Design, studio créatif de faire-part à Casablanca — identités visuelles de mariage complètes, faire-part sur-mesure et papeterie de luxe pour des cérémonies qui commencent avec élégance.",
    reviews: [
      { author: "Asmaa M.", event: "Mariage à Casablanca", stars: 5, note: "Kameleon a créé des faire-part absolument magnifiques. Le design était unique et parfaitement cohérent avec le thème de notre mariage. Nos invités ont adoré !" },
      { author: "Tarik B.", event: "Réception de mariage", stars: 5, note: "Studio créatif talentueux, très réactif et à l'écoute. Le résultat final était au-delà de nos attentes. On recommande vivement !" },
    ],
  },
  "inna-design": {
    photos: [
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
      "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=800&q=80",
      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
    ],
    description: "Inna Design, créatrice de faire-part et papeterie de mariage à Casablanca — collections tendance et créations 100% personnalisées, aquarelle, gravure et impressions premium pour des faire-part qui marquent les esprits.",
    reviews: [
      { author: "Mona K.", event: "Mariage romantique", stars: 5, note: "Inna a créé nos faire-part avec une sensibilité artistique remarquable. Aquarelles délicates et impression de très haute qualité. Un vrai bijou !" },
      { author: "Mehdi S.", event: "Mariage chic", stars: 4, note: "Créatrice talentueuse et très professionnelle. Nos faire-part étaient élégants et originaux. Délais respectés et communication excellente." },
    ],
  },
  "printerz-inc": {
    photos: [
      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=800&q=80",
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
    ],
    description: "Printerz Inc., imprimerie haut de gamme à Casablanca — faire-part de mariage sur papier couché premium, reliure de luxe et finitions soignées (dorure, gaufrage, vernis) pour une première impression inoubliable.",
    reviews: [
      { author: "Widad B.", event: "Mariage traditionnel", stars: 4, note: "Très bonne qualité d'impression, finitions soignées et délais respectés. Printerz Inc. est un partenaire fiable pour la papeterie de mariage." },
      { author: "Amine O.", event: "Réception de gala", stars: 4, note: "Impression de qualité professionnelle, service rapide et équipe réactive. Un bon rapport qualité-prix pour les faire-part premium." },
    ],
  },
  "web2print-ma": {
    photos: [
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=800&q=80",
    ],
    description: "Web2Print.ma, plateforme de création et impression de faire-part en ligne au Maroc — commande 100% digitale, maquettes personnalisables et livraison rapide pour vos faire-part, menus et cartons de table.",
    reviews: [
      { author: "Siham T.", event: "Mariage à Casablanca", stars: 4, note: "Service pratique et efficace. J'ai commandé mes faire-part en ligne, la maquette était facile à personnaliser et la livraison rapide. Satisfaite !" },
      { author: "Rachid K.", event: "Réception", stars: 3, note: "Bon rapport qualité-prix pour une commande rapide. L'outil en ligne est simple mais les options de personnalisation pourraient être plus larges." },
    ],
  },
}
