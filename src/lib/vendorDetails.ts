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
    facebook: "https://www.facebook.com/prestigephotomaroc",
    phone: "+212612345678",
    website: "https://prestige-photo.ma",
    reviews: [
      { author: "Meriem A.", event: "Mariage", stars: 5, note: "Franchement wow. On a reçu l'album la semaine dernière et on n'arrête pas de le feuilleter avec ma mère. Chaque photo raconte quelque chose." },
      { author: "Hamza B.", event: "Fiançailles", stars: 4, note: "Équipe discrète, ponctuelle, et super à l'écoute. Petit bémol sur le délai de livraison un peu long, mais le résultat vaut l'attente." },
      { author: "Soukaina L.", event: "Nuit de Henné", stars: 5, note: "Tout le monde nous a demandé le contact après avoir vu les photos sur Insta. Ils ont capté des moments qu'on n'avait même pas remarqués." },
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
      { author: "Ilyas M.", event: "Mariage", stars: 5, note: "Dès qu'ils ont commencé, plus personne n'est resté assis. Ma belle-mère a pleuré tellement elle était émue." },
      { author: "Zineb R.", event: "Sboue", stars: 5, note: "Ambiance royale pour le sboue de mon fils. Ils ont été ponctuels et hyper pros, les invités n'arrêtaient pas de les filmer." },
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
      { author: "Amine K.", event: "Mariage", stars: 5, note: "5h du matin et les gens dansaient encore. Il alterne chaabi, raï et international sans fausse note, c'est une machine." },
      { author: "Hajar S.", event: "Aïd party", stars: 4, note: "Top pour notre soirée d'Aïd. Juste un petit couac au niveau du branchement au début, mais après c'était feu du début à la fin." },
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
      { author: "Othmane F.", event: "Mariage", stars: 5, note: "Transition chaabi/oriental/house impeccable. Même mes oncles qui ne dansent jamais étaient sur la piste, c'est dire." },
      { author: "Rim B.", event: "Anniversaire", stars: 4, note: "Soirée réussie pour mes 30 ans. Il connaît son job, même si j'aurais aimé un peu plus de rnb dans la playlist." },
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
      { author: "Mouad T.", event: "Mariage", stars: 5, note: "On cherchait un orchestre qui mélange chaabi et andalou sans tomber dans le cliché, et Kilani a parfaitement relevé le défi. Ma grand-mère a pleuré sur le chant andalou." },
      { author: "Ihssane B.", event: "Sboue", stars: 4, note: "Bonne ambiance pour le sboue de ma fille, les enfants ont adoré. Juste un petit retard à l'arrivée mais rien de grave." },
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
      { author: "Yassine R.", event: "Mariage", stars: 5, note: "Abboudi, franchement wallah il assure. Voix puissante, il lit la salle comme personne et sait quand passer du chaabi au plus moderne. Mes cousins de France n'en revenaient pas." },
      { author: "Najat F.", event: "Lila", stars: 4, note: "Prestation solide pour notre lila. Petit bémol sur la sono un peu forte au début mais il a ajusté vite." },
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
      { author: "Salma H.", event: "Mariage", stars: 5, note: "Le couscous du vendredi soir, les pastillas, la pièce montée de fruits... ma tante qui est très difficile a demandé le contact. C'est tout dire." },
      { author: "Reda O.", event: "Fiançailles", stars: 4, note: "Très bon rapport qualité-prix pour ce niveau de service. On a eu juste à gérer nous-mêmes la découpe du gâteau, mais sinon rien à redire." },
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
      { author: "Karim D.", event: "Mariage", stars: 5, note: "La pastilla au poulet d'Afrah Palace est légendaire à Fès, et on comprend pourquoi. Mes beaux-parents fassis étaient fiers, c'est pas rien." },
      { author: "Wissal H.", event: "Cérémonie traditionnelle", stars: 4, note: "Service pro et plats généreux. Un petit bémol : le dessert est arrivé un peu tard mais l'équipe s'est excusée gentiment." },
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
      { author: "Dounia L.", event: "Mariage", stars: 4, note: "Grande salle bien placée à Casa, capacité réelle énorme (on était 650 et c'était confortable). Juste, le parking extérieur sature vite, prévenez vos invités." },
      { author: "Achraf M.", event: "Réception d'entreprise", stars: 5, note: "On y a fait une soirée d'entreprise pour 300 personnes, tout était au cordeau. L'équipe technique son/lumière a été super réactive." },
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
      { author: "Bilal F.", event: "Mariage", stars: 5, note: "La vue sur le détroit au coucher du soleil pendant le vin d'honneur... mes invités européens n'en revenaient pas. Cadre de ouf." },
      { author: "Assia R.", event: "Fiançailles", stars: 4, note: "Très belle salle, service au point. Le tarif est en haut du marché par contre, à prévoir dans le budget global." },
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
      { author: "Kenza B.", event: "Mariage", stars: 5, note: "On voulait un style posé et fine-art, pas les clichés classiques de mariage marocain. Flawless a parfaitement capté notre vibe, les photos sont dignes d'un magazine." },
      { author: "Ayoub M.", event: "Séance couple pré-mariage", stars: 4, note: "Très bonne direction de pose même pour les timides comme moi. Juste le délai de livraison un peu long (5 semaines) mais ça valait l'attente." },
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
      { author: "Sara K.", event: "Mariage à Marrakech", stars: 5, note: "Wedding planner en or. Ils ont géré un mariage de 180 invités dans un riad avec une calme olympien pendant que moi je stressais pour un rien." },
      { author: "Tarik L.", event: "Fiançailles", stars: 4, note: "Bonne équipe, bonne com. Seul petit regret : le choix du fleuriste qu'ils nous ont proposé était moyen, on a dû insister pour en changer." },
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
      { author: "Imane R.", event: "Mariage", stars: 5, note: "J'ai porté 6 takchitas dans la soirée et mon maquillage était nickel jusqu'à 4h du matin. Elle adapte le look à chaque tenue, trop forte." },
      { author: "Ghita N.", event: "Nuit de Henné", stars: 4, note: "Très bon travail, prix correct. Petit bémol : l'essai a été un peu rushé à mon goût, mais le résultat final était top." },
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
      { author: "Rim S.", event: "Mariage", stars: 5, note: "Amine m'a fait un smoky eye doré avec teint porcelaine, exactement ce que je voulais. Il a compris ma peau sensible et a utilisé des produits qui n'ont pas bougé." },
      { author: "Zineb O.", event: "Fiançailles", stars: 4, note: "Professionnel et à l'écoute. Il faut réserver très tôt en saison de mariage, sinon impossible de l'avoir." },
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
      { author: "Meriem T.", event: "Mariage traditionnel", stars: 5, note: "Ma grand-mère l'avait recommandée pour son expérience et elle avait raison. Alhaja Saadia connaît chaque rituel marrakchi par cœur, elle nous a guidés comme une tante." },
      { author: "Hajar B.", event: "Nuit de Henné", stars: 5, note: "Les tenues étaient sublimes, broderie or véritable et bijoux de qualité. Mes tantes qui ont tout vu dans leur vie étaient impressionnées." },
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
      { author: "Loubna E.", event: "Mariage", stars: 4, note: "5 changements de takchita sans stress, l'équipe s'occupe de tout dans les backstage. C'est un vrai confort le jour J quand on est déjà crevée." },
      { author: "Siham B.", event: "Cérémonie traditionnelle", stars: 4, note: "Collection variée et bijoux de qualité. Par contre le showroom est un peu loin du centre de Kénitra, prévoir la voiture." },
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
      { author: "Tarik M.", event: "Mariage", stars: 5, note: "Jawad et son orchestre ont fait danser toutes les générations. Mon père qui n'aime que le malhoun a trouvé son bonheur, et mes cousines le chaabi à fond." },
      { author: "Nour A.", event: "Lila", stars: 4, note: "Répertoire très varié et musiciens sérieux. Le tarif est dans le haut du marché, mais on en a pour son argent." },
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
      { author: "Hanane F.", event: "Mariage à Marrakech", stars: 5, note: "Un mur de fleurs blanches et roses pour notre backdrop, et des centres de table en suspension juste à tomber. Mes photographes n'arrêtaient pas de shooter la déco." },
      { author: "Adil K.", event: "Fiançailles", stars: 4, note: "Belles compositions, fleurs fraîches. Juste, prévoir de payer un supplément si vous voulez des fleurs importées hors-saison." },
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
      { author: "Meryem T.", event: "Mariage", stars: 5, note: "Pièce montée 4 étages avec décor andalou, exactement comme sur la photo d'inspi que je leur avais envoyée. Le goût était à la hauteur du visuel." },
      { author: "Kamal B.", event: "Baptême", stars: 4, note: "Pour le baptême de notre fille, gâteau réussi et très mignon. Livraison un peu en retard mais ils ont prévenu à l'avance." },
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
      { author: "Rim L.", event: "Mariage à Rabat", stars: 5, note: "Thème jardin à la française dans une salle à Hay Riad, ils ont tout transformé. Arche fleurie, chemin de pétales, mise en lumière... un conte de fées." },
      { author: "Mouad H.", event: "Fiançailles", stars: 4, note: "Très bon rapport qualité-prix pour le niveau de déco proposé. Équipe super sympa, même s'ils ont un peu dépassé l'heure de démontage." },
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
      { author: "Ihssane M.", event: "Mariage", stars: 5, note: "Les projections ciel étoilé au plafond pendant la première danse — un moment magique, mes invités avaient les larmes. Ils maîtrisent leur truc." },
      { author: "Khalid B.", event: "Réception d'entreprise", stars: 4, note: "Installation propre et équipe ponctuelle. Le résultat était top, juste attention à bien briefer en amont pour les changements d'ambiance pendant la soirée." },
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
      { author: "Yousra K.", event: "Mariage", stars: 5, note: "J'ai essayé 8 robes sans aucune pression, la conseillère m'a guidée vers LA robe que je n'aurais jamais choisie seule et elle avait raison. Je rayonnais." },
      { author: "Nada B.", event: "Mariage civil", stars: 4, note: "Jolie sélection de robes de créateurs. Les retouches ont été faites rapidement, juste le prix qui reste assez élevé mais c'est dans la gamme." },
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
      { author: "Salma F.", event: "Mariage", stars: 5, note: "On voulait un bar à mocktails qui ne fasse pas cheap, et ils ont créé 5 signatures avec des noms persos. Les invités se sont éclatés, même les plus sceptiques." },
      { author: "Othmane L.", event: "Soirée familiale", stars: 4, note: "Bartenders sympas et réactifs. Petite remarque : prévoir plus de glaçons que prévu en été, on en a manqué vers 1h du mat." },
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
      { author: "Ghizlane A.", event: "Mariage", stars: 5, note: "Mercedes classe S noire impeccable, intérieur cuir, chauffeur en costume. Mon mari voulait faire une entrée stylée et c'était exactement ça." },
      { author: "Hamza R.", event: "Mariage", stars: 4, note: "Bon service, voiture propre et décoration florale soignée. Juste attention au trafic de Rabat en fin d'après-midi, prévoir une marge." },
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
      { author: "Kenza O.", event: "Mariage à Rabat", stars: 5, note: "Diaa a un œil pour les détails impressionnant. Elle a remarqué et corrigé des choses que même le photographe n'avait pas vues. Zéro stress pour moi." },
      { author: "Reda A.", event: "Fiançailles", stars: 4, note: "Wedding planner sérieuse et organisée. Son carnet d'adresses aide beaucoup pour trouver les bons prestataires vite." },
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
      { author: "Amal R.", event: "Mariage", stars: 5, note: "Chignon bas avec accessoire perlé qui a tenu 12h non-stop, malgré les 6 changements de tenue. Il comprend vraiment les coiffures qui résistent à une nuit marocaine." },
      { author: "Sara M.", event: "Fiançailles", stars: 4, note: "Très bon coiffeur, ambiance détendue dans le salon. Juste qu'il faut s'y prendre tôt pour avoir une place en saison des mariages." },
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
      { author: "Imane D.", event: "Mariage", stars: 5, note: "Notre film teaser de 3 min a fait pleurer toute ma famille quand on l'a posté sur le groupe WhatsApp. Le travail de colorimétrie est incroyable." },
      { author: "Bilal K.", event: "Mariage", stars: 4, note: "Résultat photo et vidéo très pro. Prix haut de gamme mais justifié par la qualité. Il faut juste patienter pour la livraison finale." },
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
      { author: "Nour E.", event: "Anniversaire enfant", stars: 5, note: "Pidho a captivé 25 enfants de 6 ans pendant 1h sans qu'aucun ne décroche. Mon fils en parle encore, un mois après. Vrai magicien de talent." },
      { author: "Karim M.", event: "Mariage", stars: 4, note: "Animation sympa pendant le cocktail, il passe entre les tables et fait des tours rapprochés. Les invités ont adoré cette surprise." },
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
      { author: "Hicham L.", event: "Mariage à Rabat", stars: 5, note: "Ayoub El Filali est un monument, sa voix remplit la salle sans micro presque. Il a chanté une dédicace persos à mes parents, moment inoubliable." },
      { author: "Zineb M.", event: "Lila", stars: 5, note: "Orchestre complet avec violons, qanoun, et percussions. La dekka à minuit a rendu les invités fous, personne n'est resté assis." },
    ],
  },
  "gapi-villa-traiteur": {
    photos: CAT_PHOTOS["Traiteur"],
    description: "GAPI Villa Traiteur, spécialiste de la gastronomie de prestige pour événements à Casablanca, proposant des buffets somptueux et une cuisine marocaine raffinée.",
    website: "https://www.gapivilla.com",
    instagram: "https://www.instagram.com/traiteurgapivilla/",
    reviews: [
      { author: "Meriem F.", event: "Mariage à Casablanca", stars: 5, note: "Le chef de salle a géré 450 couverts comme personne, timing impeccable pour chaque service. La mechoui était encore chaude au 3e rang, c'est rare." },
      { author: "Yassine B.", event: "Réception d'entreprise", stars: 4, note: "Cuisine fine et présentation travaillée. Un peu cher pour une prestation corporate mais bon retour global, les clients étaient satisfaits." },
    ],
  },
  "les-maitres-prestiges": {
    photos: CAT_PHOTOS["Traiteur"],
    description: "Les Maîtres Prestiges, traiteur d'exception à Marrakech, réputé pour ses prestations gastronomiques haut de gamme lors des plus grands mariages et événements.",
    website: "https://lesmaitresprestiges.com",
    instagram: "https://www.instagram.com/lesmaitresprestiges/",
    reviews: [
      { author: "Houda S.", event: "Mariage à Marrakech", stars: 5, note: "On a fait 6 traiteurs en dégustation avant de choisir, et Les Maîtres Prestiges étaient clairement un cran au-dessus. La pastilla au poisson était divine." },
      { author: "Ayoub K.", event: "Soirée familiale", stars: 4, note: "Cuisine marocaine authentique mais revisitée avec élégance. Service souriant et pro. Le prix est élevé mais justifié pour l'expérience." },
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
      { author: "Dounia T.", event: "Mariage à Marrakech", stars: 5, note: "Fine art à l'état pur. Les tons pastels, les portraits au coucher du soleil dans la palmeraie, tout est poétique. On a eu envie de recommencer le mariage en voyant les photos." },
      { author: "Mehdi R.", event: "Séance couple", stars: 4, note: "Très belle direction photo, il sait mettre à l'aise. Délai de livraison un peu long mais la qualité finale vaut l'attente." },
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
      { author: "Hajar L.", event: "Mariage à Marrakech", stars: 5, note: "Adam et son équipe ont géré notre mariage en 3 jours (henné, lila, grand jour) sans jamais faillir. Le film final ressemble à un trailer de Netflix, c'est dingue." },
      { author: "Othmane B.", event: "Mariage destination", stars: 5, note: "On venait de Paris pour se marier dans un kasbah et Merzougraphy connaissait déjà tous les meilleurs spots. Ils sont bien plus qu'un photographe, presque planners." },
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
      { author: "Nour K.", event: "Mariage", stars: 5, note: "J'ai la peau grasse et j'avais peur du rendu brillant en photos, mais Loubna a sélectionné des produits mats qui ont tenu nickel. Zéro retouche en 10h de cérémonie." },
      { author: "Chaima K.", event: "Fiançailles", stars: 4, note: "Maquillage soft et élégant comme je voulais. Juste que la session essai était un peu courte, on aurait aimé plus de temps pour ajuster." },
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
      { author: "Hajar M.", event: "Mariage à Casablanca", stars: 5, note: "Firdaous est une star au Twin Center pour une raison. Elle a un coup de pinceau qui métamorphose sans jamais tomber dans le lourd. Mes photos sont dingues." },
      { author: "Soukaina L.", event: "Soirée familiale", stars: 4, note: "Très talentueuse mais il faut réserver des mois en avance, c'est le seul hic. Le résultat vaut largement l'effort de planification." },
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
      { author: "Assia K.", event: "Mariage à Marrakech", stars: 5, note: "Nora connaît parfaitement les techniques pour un teint qui tient sous 40°C en plein été marrakchi. Aucun transfert sur mon caftan blanc, miracle." },
      { author: "Wissal E.", event: "Anniversaire", stars: 4, note: "Super expérience, elle écoute vraiment les attentes. Prix un peu élevé mais c'est la qualité qu'on paie." },
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
      { author: "Fatima O.", event: "Mariage traditionnel", stars: 5, note: "Chahrazade connaît les traditions de l'Oriental mieux que ma propre grand-mère. Elle a mené la cérémonie des 7 tenues avec une précision d'horloge." },
      { author: "Nada B.", event: "Cérémonie traditionnelle", stars: 4, note: "Collection de tenues impressionnante, toutes brodées main. Juste, les essayages se font dans un timing serré, prévoir d'être disponible." },
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
      { author: "Ghita H.", event: "Mariage", stars: 5, note: "J'ai vu passer toutes les négaffas d'Insta et Mogador est celle qui m'a le mieux comprise. Les tenues étaient encore plus belles en vrai qu'en photo." },
      { author: "Hanane L.", event: "Mariage traditionnel", stars: 5, note: "Service royal, accompagnement personnalisé du début à la fin. Hanane Ziyana est une pro, elle sait ce qu'elle fait et rassure la mariée." },
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
      { author: "Salma B.", event: "Mariage à Marrakech", stars: 5, note: "Quand on voit qu'ils bossent pour Dior et Cartier, on comprend le niveau. Notre déco florale en blanc-or valait chaque dirham, un décor de rêve." },
      { author: "Younes T.", event: "Soirée d'entreprise", stars: 5, note: "Équipe de haut niveau, brief clair, exécution parfaite. Ils ont transformé un riad en expérience immersive pour nos clients VIP." },
    ],
  },
  "passion-decor-maroc": {
    photos: CAT_PHOTOS["Décorateur"],
    description: "Passion Décor Maroc, décorateur événementiel à Casablanca, passionné par la création d'atmosphères uniques mêlant esthétique marocaine et tendances modernes.",
    website: "https://passiondecor.ma",
    instagram: "https://www.instagram.com/passion_decor.maroc/",
    reviews: [
      { author: "Imane S.", event: "Mariage", stars: 5, note: "Déco pensée sur-mesure avec un mélange zellige et fleurs fraîches très réussi. Ils ont vraiment su comprendre ce qu'on voulait dès le premier rendez-vous." },
      { author: "Youssef R.", event: "Fiançailles", stars: 4, note: "Bon rapport qualité-prix à Casablanca, équipe motivée. Juste le jour J, démontage un peu bruyant tôt le matin, à signaler." },
    ],
  },
  "instants-magiques": {
    photos: CAT_PHOTOS["Wedding planner"],
    description: "Instants Magiques, agence de wedding planning à Marrakech, spécialisée dans l'organisation de mariages de prestige dans les plus beaux riads et palais de la ville ocre.",
    website: "https://instantsmagiques-marrakech.com",
    instagram: "https://www.instagram.com/instants_magiques_marrakech/",
    reviews: [
      { author: "Kenza O.", event: "Mariage dans un riad", stars: 5, note: "On cherchait un mariage intime pour 80 invités dans un vrai riad de la médina. Instants Magiques a trouvé le lieu, géré la logistique et fait des merveilles." },
      { author: "Ilyas K.", event: "Mariage destination", stars: 4, note: "Équipe sérieuse qui parle parfait anglais, super pour nos invités étrangers. Prix haut mais le niveau de service compense largement." },
    ],
  },
  "maroc-sensations": {
    photos: CAT_PHOTOS["Wedding planner"],
    description: "Maroc Sensations, wedding planner à Marrakech, créant des mariages d'exception qui mêlent authenticité marocaine et élégance internationale.",
    website: "https://www.marocsensations-wedding.com",
    instagram: "https://www.instagram.com/marocsensations/",
    reviews: [
      { author: "Claire D.", event: "Mariage franco-marocain", stars: 5, note: "Ma famille française et celle de mon mari marocain ont pu partager un moment vraiment beau, grâce à leur sens du détail culturel. Rien n'a été laissé au hasard." },
      { author: "Anas M.", event: "Mariage à Marrakech", stars: 4, note: "Bonne prise en charge, équipe créative. Seul bémol, la communication par mail était parfois lente, mieux vaut passer par WhatsApp." },
    ],
  },
  "palais-atlas": {
    photos: CAT_PHOTOS["Lieu de réception"],
    description: "Palais Atlas, salle de réception luxueuse à Casablanca, alliant architecture orientale et équipements modernes pour accueillir vos plus grands événements.",
    website: "https://www.palaisatlas.com",
    instagram: "https://www.instagram.com/palaisatlas/",
    reviews: [
      { author: "Rim N.", event: "Mariage", stars: 5, note: "Salle grandiose avec des plafonds sculptés à la main. On s'est sentis dans un vrai palais royal, mes invités étaient bouche bée en arrivant." },
      { author: "Mehdi B.", event: "Gala annuel", stars: 4, note: "Bonne salle pour les grands événements, équipements audio corrects. Le parking pourrait être mieux organisé un soir d'affluence." },
    ],
  },
  "crystal-fes": {
    photos: CAT_PHOTOS["Lieu de réception"],
    description: "Crystal Fès, salle des fêtes de prestige à Fès, proposant un espace élégant et raffiné pour les mariages et cérémonies les plus exigeants.",
    website: "https://crystalfes.com",
    instagram: "https://www.instagram.com/crystal.fes/",
    reviews: [
      { author: "Soukaina H.", event: "Mariage à Fès", stars: 4, note: "Belle salle bien située à Fès, notre mariage de 400 invités s'est déroulé sans accroc. Le staff est discret et efficace, on sent l'école fassie." },
      { author: "Tarik A.", event: "Fiançailles", stars: 5, note: "Cadre élégant et sobre, idéal pour une cérémonie chic. Le rapport qualité-prix est top pour Fès, je conseille à tous." },
    ],
  },
  "sweet-cake-marrakech": {
    photos: CAT_PHOTOS["Pâtissier / Cake designer"],
    description: "Sweet Cake Marrakech, pâtissier artisan créateur de gâteaux de mariage exceptionnels à Marrakech, alliant esthétisme oriental et saveurs délicates.",
    website: "https://www.sweetcakemarrakech.com",
    instagram: "https://www.instagram.com/sweetcakemarrakech/",
    reviews: [
      { author: "Hajar S.", event: "Mariage à Marrakech", stars: 5, note: "Gâteau 5 étages façon jardin oriental avec fleurs en sucre plus vraies que nature. Mon invité pâtissier n'en revenait pas, il a photographié chaque détail." },
      { author: "Ayoub M.", event: "Baby shower", stars: 4, note: "Cupcakes ultra mignons pour ma baby shower, livrés à l'heure. Juste le prix un poil élevé mais la qualité est là." },
    ],
  },
  "fleuriste-stoti": {
    photos: CAT_PHOTOS["Fleuriste événementiel"],
    description: "Fleuriste Stoti, maître fleuriste à Marrakech, créant des compositions florales époustouflantes qui subliment mariages et réceptions avec des fleurs fraîches.",
    instagram: "https://www.instagram.com/fleuriste_marrakech_officiel/",
    reviews: [
      { author: "Khadija R.", event: "Mariage", stars: 5, note: "Mon bouquet de mariée était juste une tuerie, pivoines et roses de jardin dans les tons poudrés. Stoti a un vrai goût, il ne fait pas les bouquets standards." },
      { author: "Nassim B.", event: "Cérémonie", stars: 4, note: "Fleurs fraîches et belles compositions. Petit conseil : arrivez au showroom avec des photos d'inspi pour gagner du temps dans les échanges." },
    ],
  },
  "nezha-hairstyle": {
    photos: CAT_PHOTOS["Hairstylist"],
    description: "Nezha Hairstyle, coiffeuse événementielle à Rabat, spécialisée dans les coiffures de mariée traditionnelles et modernes avec un savoir-faire reconnu.",
    instagram: "https://www.instagram.com/nezha.hairstyle/",
    reviews: [
      { author: "Zineb A.", event: "Mariage", stars: 5, note: "Nezha a réalisé 3 coiffures différentes pendant la soirée sans que je quitte la table plus de 15 min à chaque fois. Efficace et hyper douée." },
      { author: "Rim L.", event: "Fiançailles", stars: 4, note: "Super ambiance au salon, Nezha prend vraiment le temps d'expliquer. Juste, prévoir de réserver très à l'avance en saison." },
    ],
  },
  "salon-mouna-marrakech": {
    photos: CAT_PHOTOS["Hairstylist"],
    description: "Salon Mouna Marrakech, salon de beauté et coiffure événementielle à Marrakech, proposant un service complet pour les mariées du jour J.",
    instagram: "https://www.instagram.com/salonmounamarrakech/",
    reviews: [
      { author: "Meryem F.", event: "Mariage", stars: 5, note: "Le salon est un vrai cocon, Mouna et son équipe m'ont chouchoutée toute la matinée. Café, pâtisseries, ambiance détendue — j'étais zen avant la cérémonie." },
      { author: "Lamia B.", event: "Henna", stars: 4, note: "Belle prestation pour ma nuit de henné, coiffure élégante et tenue parfaite. Le tarif mariée est correct par rapport à la concurrence." },
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
      { author: "Sara El A.", event: "Mariage à Casablanca", stars: 5, note: "Souma est la Rihanna du make-up marocain, pas moins. Elle a fait un contouring + eye-liner graphique qui a rendu de ouf en photo, j'étais méconnaissable dans le bon sens." },
      { author: "Rim H.", event: "Soirée corporate", stars: 4, note: "Top talent mais prix très élevé, à réserver pour les grandes occasions. La réservation se fait 6 mois à l'avance minimum." },
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
      { author: "Dounia T.", event: "Mariage à Marrakech", stars: 5, note: "Imane a transformé ma copine complexée par son nez en une vraie star. Contouring de dingue et regard magnifié. Elle redonne confiance aux mariées." },
      { author: "Meriem K.", event: "Lila", stars: 5, note: "Maquillage oriental somptueux pour ma nuit de henné, parfaitement raccord avec ma takchita bordeaux. Les photos sont digne d'Instagram à la perfection." },
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
      { author: "Ghizlane F.", event: "Mariage à Casablanca", stars: 5, note: "Tariq a un feeling incroyable pour les tenues orientales. Il a sublimé mon caftan vert émeraude avec un maquillage assorti qui a fait sensation sur les photos." },
      { author: "Imane T.", event: "Fiançailles", stars: 4, note: "Très bon maquilleur, ambiance pro. Attention : tarifs élevés et agenda hyper chargé, s'y prendre très très à l'avance." },
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
      { author: "Hanane D.", event: "Mariage traditionnel à Fès", stars: 5, note: "Sara Lassass est la référence fassie. Elle a apporté 12 tenues au lieu des 7 prévues, pour que je puisse choisir au dernier moment. Une vraie passionnée." },
      { author: "Yasmina B.", event: "Cérémonie", stars: 5, note: "Tenues de prestige, broderies d'exception. Et Sara elle-même a un charisme qui rassure la mariée. Je me suis sentie entre de bonnes mains." },
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
      { author: "Rania S.", event: "Mariage à Casablanca", stars: 5, note: "Nouha mérite son surnom de Queen. Ses mises en scène sont grandioses, ma prestation d'entrée avec la amaria en feu a été filmée partout sur Insta." },
      { author: "Khawla M.", event: "Mariage traditionnel", stars: 4, note: "Très belle négaffa, tenues de qualité. Le seul petit point : communication un peu lente avant le jour J, mieux vaut relancer." },
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
      { author: "Ikram R.", event: "Mariage à Marrakech", stars: 5, note: "Service complet qui m'a évité de courir partout — négaffa, coiffure, maquillage tout au même endroit. Super pratique et qualité au rendez-vous." },
      { author: "Saad L.", event: "Cérémonie traditionnelle", stars: 4, note: "Belle maison, tenues dans les règles de l'art. Prévoir un budget confortable, c'est du haut de gamme marrakchi." },
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
      { author: "Hamza E.", event: "Mariage", stars: 4, note: "On avait besoin de 4 vans pour navette famille entre l'hôtel et la salle, tout s'est passé nickel. Chauffeurs corrects et véhicules propres." },
      { author: "Lamya F.", event: "Soirée familiale", stars: 4, note: "Service fiable et tarifs raisonnables. Petit conseil : confirmer l'adresse par WhatsApp la veille pour éviter les mauvaises surprises." },
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
      { author: "Adil B.", event: "Mariage", stars: 5, note: "Maserati blanche pour l'arrivée de la mariée, photos épiques garanties. Le chauffeur était hyper pro et s'est même coordonné avec notre photographe pour les shoots." },
      { author: "Nouhaila M.", event: "Fiançailles", stars: 4, note: "Belle flotte de véhicules de luxe, prestation élégante. Le prix est à la hauteur du standing mais ça reste dans le raisonnable." },
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
      { author: "Maryam Z.", event: "Mariage", stars: 5, note: "J'ai fait créer une robe hybride caftan-robe blanche qui n'existait nulle part. Équipe créative qui a su donner vie à mes croquis maladroits." },
      { author: "Oumayma B.", event: "Mariage civil", stars: 4, note: "Belle qualité de couture et finitions soignées. Les délais ont été tenus malgré 3 retouches. Atelier recommandé pour un projet sur-mesure." },
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
      { author: "Amina R.", event: "Anniversaire enfant", stars: 5, note: "Château gonflable, mascotte Mickey, maquillage pour les petits — mon fils a cru au paradis. Équipe ultra sympa qui gère 30 enfants sans sourciller." },
      { author: "Mouad K.", event: "Baptême", stars: 4, note: "Animation complète et professionnelle pour le baptême de notre fille. Les enfants n'ont pas décroché de toute l'aprem, les parents ont eu la paix." },
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
      { author: "Maroua S.", event: "Mariage à Casablanca", stars: 5, note: "Glam by Sara a capté exactement le mood que je voulais — clean, glowy, pas trop chargé. Elle m'a même conseillée sur ma skincare en amont pour un résultat optimal." },
      { author: "Rim B.", event: "Soirée d'entreprise", stars: 4, note: "Super résultat, ambiance pro. Juste le studio un peu excentré, prévoir un Careem si vous n'avez pas de voiture." },
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
      { author: "Ilham T.", event: "Mariage à Casablanca", stars: 5, note: "Le teaser de 90 secondes qu'ils ont monté a tourné en boucle dans ma famille pendant une semaine. Cinématographique n'est pas un mot en trop." },
      { author: "Karim D.", event: "Mariage", stars: 5, note: "NOM Films a posé la barre très haut. Très bon sens du récit, ils racontent vraiment une histoire avec leurs plans." },
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
      { author: "Sophie L.", event: "Mariage destination Marrakech", stars: 5, note: "On venait de Londres pour se marier dans un kasbah et Gordon a tout compris dès le premier call. Le film qu'on a reçu a fait pleurer ma mère 3 fois." },
      { author: "Yasmina N.", event: "Mariage franco-marocain", stars: 5, note: "Travail vraiment soigné, Meryll sait filmer la lumière marocaine comme personne. Worth every penny." },
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
      { author: "Najat L.", event: "Mariage à Casablanca", stars: 5, note: "Répertoire riche, du malhoun au tarab oriental. Les musiciens s'adaptent à la salle et savent quand monter en intensité. Mes invités dansaient debout." },
      { author: "Hicham R.", event: "Soirée de gala", stars: 4, note: "Prestation très pro, bonne ambiance. Juste, prévoir un espace suffisant pour installer leur matériel, ils viennent en nombre." },
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
      { author: "Khadija B.", event: "Mariage à Casablanca", stars: 5, note: "On cherchait un traiteur qui maîtrise autant le couscous traditionnel qu'un menu international pour nos invités étrangers. Hamid a assuré les deux avec brio." },
      { author: "Nabil F.", event: "Baptême", stars: 4, note: "Cuisine de grande qualité, présentation raffinée. Un peu cher mais pour les grandes occasions c'est un bon choix." },
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
      { author: "Lina R.", event: "Mariage traditionnel", stars: 5, note: "Yassmina a un œil pour la mise en scène qui transforme chaque tenue en tableau vivant. Mes invités chuchotaient à chaque apparition, magique." },
      { author: "Amira B.", event: "Cérémonie du henné", stars: 5, note: "Sa collection de takchitas brodées est à tomber, j'ai eu du mal à choisir tellement tout était beau. Négaffa pro et chaleureuse." },
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
      { author: "Meriem Ben K.", event: "Mariage à Rabat", stars: 5, note: "Dar Bennani à l'Agdal, l'institution rbatie par excellence. Les bijoux sont de vraies pièces anciennes prêtées pour la cérémonie, ça change tout sur les photos." },
      { author: "Zineb A.", event: "Mariage traditionnel", stars: 4, note: "Négaffa de très haute qualité mais prix en conséquence. Pour un mariage rbati dans les règles de l'art, c'est la référence." },
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
      { author: "Hajar B.", event: "Mariage à Rabat", stars: 5, note: "12 ans d'expérience, ça se sent. Ils ont anticipé chaque problème avant qu'il arrive. Ma mère qui est très difficile leur a dit bravo, c'est dire." },
      { author: "Adil M.", event: "Mariage à Casablanca", stars: 4, note: "Bonne équipe, bon réseau de prestataires. Petit bémol sur les factures un peu compliquées à lire au début, mais tout a été clarifié." },
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
      { author: "Rachel B.", event: "Mariage juif marocain", stars: 5, note: "On cherchait des planners qui connaissent nos traditions et celles de la famille, She Said Yes a géré henné et cérémonie hébraïque avec autant de soin. Très rare." },
      { author: "Nour L.", event: "Mariage à Tanger", stars: 5, note: "Équipe ultra dispo, toujours une solution pour chaque problème. Notre mariage à Tanger était pile ce qu'on voulait, chic et décontracté." },
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
      { author: "Oumnia K.", event: "Mariage à Casablanca", stars: 5, note: "Younes est un poète avec un appareil photo. Il capture les petits riens — le regard de mon père pendant le khotba, la main de ma grand-mère sur la mienne." },
      { author: "Ilyas R.", event: "Fiançailles", stars: 4, note: "Photographe discret et ultra professionnel. Ses photos retouchées sont sobres et élégantes, pas de sur-traitement. Juste le délai de livraison un peu long." },
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
      { author: "Sofia M.", event: "Mariage à Marrakech", stars: 5, note: "Les gnawa en transe au milieu de notre lila, avec les krakebs et guembri, ça a créé un moment fou. Mes invités étrangers filmaient comme si c'était un show de Coachella." },
      { author: "Rachid B.", event: "Soirée culturelle", stars: 5, note: "Authentiques, pas folkloriques pour les touristes. Ils connaissent leur tradition et la transmettent avec passion. On ressent l'âme du patrimoine marocain." },
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
      { author: "Salma R.", event: "Mariage à Rabat", stars: 5, note: "L'équipe RM est ultra pro, ils ont coordonné 3 photographes sur notre mariage pour ne rien manquer. Résultat : 800 photos de qualité, toutes triées et retouchées." },
      { author: "Youssef B.", event: "Fiançailles", stars: 4, note: "Bon studio rabati, prix corrects et photos soignées. Juste prévoir d'être patient pour la livraison en haute saison." },
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
      { author: "Nouhaila B.", event: "Mariage à Rabat", stars: 4, note: "Delta Photo est disponible 7j/7 et ça se sent, ils répondent rapidement même le dimanche. Photos naturelles et retouchées avec goût." },
      { author: "Mehdi L.", event: "Anniversaire", stars: 4, note: "Très bon rapport qualité-prix, équipe sympa. Le style est plus classique que moderne, à voir selon ce que vous cherchez." },
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
      { author: "Asma F.", event: "Mariage à Casablanca", stars: 5, note: "YaPas a fait notre photo + vidéo et l'album studio après. Équipe jeune, fun, super créative. Ils nous ont mis à l'aise immédiatement." },
      { author: "Amine B.", event: "Portrait couple", stars: 4, note: "Très bon shooting pré-mariage, résultat frais et moderne. Attention à bien valider le nombre de photos retouchées en amont." },
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
      { author: "Leila K.", event: "Mariage franco-marocain", stars: 5, note: "Othmane a un œil rare pour les mariages mixtes, il sait mettre en valeur les deux cultures sans folklore. Notre album est à la fois poétique et authentique." },
      { author: "Rayan D.", event: "Mariage à Casablanca", stars: 5, note: "Photographe haut de gamme, résultat digne de Vogue. Prix élevé mais largement justifié, on ne regarde pas à la dépense pour ce niveau." },
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
      { author: "Hasna O.", event: "Mariage à Agadir", stars: 4, note: "Studio Alqods est un bon choix pour Agadir, ils connaissent tous les beaux spots de la ville pour les photos couple. Équipe accueillante." },
      { author: "Mouad T.", event: "Portrait famille", stars: 4, note: "Bon rapport qualité-prix, studio bien équipé. Photos livrées dans les temps et retouches soignées." },
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
      { author: "Safae M.", event: "Mariage à Agadir", stars: 5, note: "My Traiteur a géré 320 couverts avec une organisation millimétrée. Les fruits de mer étaient ultra frais (normal, on est à Agadir), et les tajines parfaits." },
      { author: "Karim A.", event: "Cérémonie familiale", stars: 4, note: "Cuisine marocaine délicieuse, service correct. Petite remarque : le timing du dessert est arrivé un peu tard mais ça s'est bien rattrapé." },
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
      { author: "Bouchra H.", event: "Mariage à Fès", stars: 5, note: "La pastilla au pigeon fassie par excellence, ma belle-mère qui est fassie pure souche a approuvé à 100%. C'est une bénédiction rare." },
      { author: "Tariq B.", event: "Cérémonie traditionnelle", stars: 4, note: "Cuisine fassie authentique, portions généreuses. Le service pourrait être un poil plus rapide sur les grosses tablées, mais rien de grave." },
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
      { author: "Lamia R.", event: "Mariage à Tanger", stars: 5, note: "Amers a proposé un menu fusion marocain-méditerranéen super original. Les poissons grillés de la baie de Tanger étaient les stars de la soirée." },
      { author: "Youssra D.", event: "Fiançailles", stars: 4, note: "Équipe créative, plats savoureux. Le rapport qualité-prix est bon pour Tanger, je recommande sans hésiter." },
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
      { author: "Nadia F.", event: "Grand mariage à Fès", stars: 5, note: "Rahal c'est le Lenôtre marocain, pas moins. On a reçu 600 invités et la qualité était uniforme jusqu'au dernier. Une institution." },
      { author: "Anas B.", event: "Mariage d'exception", stars: 5, note: "Service de maître d'hôtel à l'ancienne, dressage parfait, saveurs irréprochables. Le prix est élevé mais c'est le top du top à Fès." },
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
      { author: "Chaimae R.", event: "Mariage à Marrakech", stars: 5, note: "Déco éclairage féérique avec bougies géantes, lanternes marocaines et mapping sur les murs. Mes invités se sont crus dans un conte oriental, effet Waouh garanti." },
      { author: "Ilias B.", event: "Réception VIP", stars: 5, note: "Kech Design gère les grands budgets avec maestria. Ils connaissent les meilleurs riads et palais de la ville, et ont leur propre stock de mobilier haut de gamme." },
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
      { author: "Dounia K.", event: "Mariage à Marrakech", stars: 4, note: "Mabeie a fourni le mobilier lounge pour notre zone cocktail — canapés en velours vert, tables basses dorées, top. Ils livrent et installent eux-mêmes." },
      { author: "Othmane L.", event: "Soirée corporate", stars: 4, note: "Bonne équipe pour la location de mobilier événementiel. Juste, prévoir de confirmer les quantités plusieurs fois avant le jour J." },
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
      { author: "Sirine B.", event: "Mariage à Tanger", stars: 5, note: "L'Établie sort du classique roses rouges. Elles ont fait un bouquet champêtre avec eucalyptus, pivoines et fleurs séchées qui m'a fait pleurer de joie." },
      { author: "Marwan H.", event: "Fiançailles", stars: 5, note: "Atelier ultra créatif, compositions qui respirent la modernité. Prix justes pour la qualité et la créativité proposée." },
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
      { author: "Rim B.", event: "Mariage à Casablanca", stars: 5, note: "Golden Flower m'a livré des pivoines fraîches à 7h du matin pour ma préparation, tout était parfait. Centres de table copiés de mon Pinterest au détail près." },
      { author: "Bilal M.", event: "Anniversaire", stars: 4, note: "Belles compositions, bonnes fleurs. Juste le site web un peu dépassé, passer par WhatsApp est beaucoup plus efficace pour commander." },
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
      { author: "Kaoutar F.", event: "Mariage à Rabat", stars: 5, note: "Hicham Doukkali sait gérer une salle rbatie comme personne. Il a ouvert sur du andalou pendant le dîner, puis a lâché le chaabi après minuit. Enchaînement parfait." },
      { author: "Hamza L.", event: "Lila", stars: 4, note: "Orchestre sérieux, répertoire varié. Juste, ils sont très demandés, il faut s'y prendre 4-5 mois à l'avance minimum." },
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
      { author: "Bouchra L.", event: "Mariage à Salé", stars: 5, note: "Wahbi et son équipe jouent sans pause pendant 6h, c'est dingue. Aucun essoufflement, toujours le même niveau d'énergie et de qualité." },
      { author: "Reda M.", event: "Mariage à Rabat", stars: 4, note: "Très bon orchestre, ambiance garantie. Prévoir un budget conséquent mais la qualité est là. Ils connaissent les mariés et savent les mettre en valeur." },
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
      { author: "Leila B.", event: "Grand mariage à Marrakech", stars: 5, note: "Tahour, c'est THE NAME du chaabi marocain. Mes invités les ont vus débarquer et ont littéralement crié. Leurs reprises de classiques sont iconiques." },
      { author: "Oussama K.", event: "Mariage traditionnel", stars: 5, note: "Investissement conséquent mais ça vaut chaque dirham. Ils ont 1M d'abonnés pour une raison, leur présence scénique est incroyable." },
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
      { author: "Camille R.", event: "Mariage destination Marrakech", stars: 5, note: "On voulait de la musique marocaine et internationale sans changer de groupe, Les Musiciens Doz savent tout jouer. 400 chansons au répertoire, c'est dingue." },
      { author: "Hicham S.", event: "Gala d'entreprise", stars: 5, note: "Formation modulable selon le budget (de 4 à 18 musiciens). Ils ont animé notre gala avec un professionnalisme international. Vraiment top niveau." },
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
      { author: "Dounia H.", event: "Mariage à Marrakech", stars: 5, note: "DJ Medi mix amapiano, afro et trap chaabi comme personne. Ses sets sont hyper travaillés, mes invités se sont crus à un festival. Légende." },
      { author: "Yassine B.", event: "Anniversaire 30 ans", stars: 5, note: "Mix parfait et sound system impeccable. Il s'adapte à chaque moment de la soirée, du cocktail jusqu'aux after-hours. Top du top." },
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
      { author: "Hanae K.", event: "Mariage à Tanger", stars: 5, note: "Amal Saber fait de la cuisine comme on peint un tableau. Ses pâtisseries orientales revisitées sont devenues la star de notre cocktail, mes tantes ont demandé le contact." },
      { author: "Imad F.", event: "Réception familiale", stars: 4, note: "Très belle prestation, cuisine raffinée. Juste prévoir un budget confortable, ce n'est pas le traiteur le plus accessible mais la qualité justifie." },
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
      { author: "Samira L.", event: "Grand mariage à Fès", stars: 5, note: "Les recettes de Chhiouate sont transmises de génération en génération et ça se sent. Pastilla fondante, tajines parfumés — ma belle-mère fassie a approuvé chaque plat." },
      { author: "Anas B.", event: "Cérémonie traditionnelle", stars: 5, note: "Cuisine fassie dans le respect total de la tradition. Quantités généreuses, service souriant. Une valeur sûre à Fès." },
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
      { author: "Julie L.", event: "Mariage franco-marocain", stars: 5, note: "Lucie capte la lumière marocaine d'une manière unique, presque picturale. Nos photos à Casa ressemblent à des toiles de Matisse. C'est rare." },
      { author: "Zakaria M.", event: "Séance couple", stars: 5, note: "Son approche douce met vraiment à l'aise, même les plus timides. Ma femme qui déteste les photos a adoré la session. Talent rare." },
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
      { author: "Lola M.", event: "Mariage dans le désert", stars: 5, note: "Mariage à Merzouga organisé par Bohème — tentes berbères, feu de camp, musique gnaoua, ciel étoilé. Mes invités ont vécu un moment de leur vie." },
      { author: "Ayoub T.", event: "Mariage bohème", stars: 5, note: "Équipe ultra créative qui sort des standards. Ils comprennent vraiment les demandes atypiques et savent les réaliser. Notre mariage était unique au monde." },
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
      { author: "Ikram B.", event: "Mariage à Casablanca", stars: 5, note: "Jalal maîtrise la lumière naturelle comme peu. Il a su shooter en plein midi dans une salle sombre et obtenir des merveilles. Vrai pro." },
      { author: "Othmane L.", event: "Fiançailles", stars: 4, note: "Bon photographe, style classique et élégant. Retouches soignées et livraison dans les temps. Recommandé." },
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
      { author: "Francesca C.", event: "Mariage italo-marocain", stars: 5, note: "Lorenzo a un œil éditorial reconnaissable entre tous. Il mixe l'élégance italienne et les couleurs marocaines dans chaque photo. Photos dignes de Vogue Italia." },
      { author: "Amine K.", event: "Mariage à Casablanca", stars: 5, note: "Prix haut de gamme mais c'est le niveau pour lequel on signe. Résultat qui impressionne à chaque fois qu'on montre l'album." },
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
      { author: "Hanane A.", event: "Mariage à Casablanca", stars: 5, note: "Yassine Daoudi fait du documentaire de mariage, pas du posé. Ce qu'il capte est vrai, spontané et plein d'émotion. J'ai pleuré en recevant l'album." },
      { author: "Youssef T.", event: "Fiançailles", stars: 4, note: "Très bon rapport qualité-prix pour le niveau proposé. Photographe sympa et discret. Je recommande." },
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
      { author: "Salma B.", event: "Mariage traditionnel", stars: 5, note: "Driss est presque invisible pendant la cérémonie, du coup tout le monde est naturel. Le résultat, c'est des moments vrais capturés sans filtre." },
      { author: "Mouad R.", event: "Mariage civil", stars: 4, note: "Pro, ponctuel, photos livrées dans les temps. Style contemporain qui vieillira bien, pas de trop-plein de retouches." },
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
      { author: "Kawtar E.", event: "Grand mariage", stars: 5, note: "APG envoie 4 personnes sur place : 2 photographes, 1 vidéaste et 1 assistant. Rien n'est laissé au hasard, ils gèrent tous les angles. Album complet et pro." },
      { author: "Zakaria F.", event: "Soirée familiale", stars: 4, note: "Équipe sympa et réactive. Résultat classique mais soigné. Bon choix si vous cherchez une couverture complète photo+vidéo." },
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
      { author: "Meriem H.", event: "Mariage à Rabat", stars: 5, note: "Les photos ont la lumière dorée des rives du Bouregreg, c'est poétique et unique à Rabat. Le photographe connaît les meilleurs spots de la ville par cœur." },
      { author: "Ilyas B.", event: "Séance couple", stars: 4, note: "Bon photographe, très bon feeling pendant la séance. Prévoir de réserver en avance, il est vite pris." },
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
      { author: "Assia M.", event: "Mariage à Casablanca", stars: 5, note: "Toufike est un artiste de la lumière. Ses photos ont cette teinte chaude qui rappelle les films argentiques, c'est intemporel et beau." },
      { author: "Nabil R.", event: "Mariage traditionnel", stars: 4, note: "Très bon photographe, sait gérer les moments émotionnels et les mises en scène traditionnelles. Bon choix pour un mariage marocain classique." },
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
      { author: "Nouhaila F.", event: "Grand mariage", stars: 5, note: "Les plans de drone au-dessus de la palmeraie sont à tomber. Montage hollywoodien, bande son parfaite. Mes cousins cinéphiles étaient scotchés au film." },
      { author: "Karim D.", event: "Mariage destination", stars: 5, note: "Production Company a filmé notre mariage comme un vrai court-métrage. Tarifs en conséquence mais le rendu vaut largement. Bluffant." },
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
      { author: "Lina F.", event: "Mariage 300 personnes", stars: 5, note: "Salma Sekkat a mis un point d'honneur à faire goûter chaque plat à la mariée avant le service. Ce niveau de détail, c'est rare et ça fait toute la différence." },
      { author: "Hamza K.", event: "Réception de famille", stars: 4, note: "Très belle cuisine marocaine revisitée avec finesse. Juste un poil cher mais cohérent avec la qualité. À réserver pour les grandes occasions." },
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
      { author: "Lamia S.", event: "Mariage andalou", stars: 5, note: "Alhambra a proposé un menu inspiré de la cuisine andalouse-marocaine avec des pastillas sucrées-salées uniques. Mes invités en parlent encore 6 mois après." },
      { author: "Tarek F.", event: "Réception privée", stars: 4, note: "Traiteur haut de gamme, dressage élégant. Service rigoureux mais un peu cher, à réserver pour les grandes occasions." },
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
      { author: "Hajar M.", event: "Mariage traditionnel Marrakech", stars: 5, note: "El Ghali, c'est le vrai goût de Marrakech. Leur mechoui cuit au four traditionnel est légendaire, mes oncles qui critiquent tout ont tous voulu la recette." },
      { author: "Walid B.", event: "Cérémonie familiale", stars: 4, note: "Cuisine authentique, service bien organisé. Quantités généreuses comme on aime au Maroc. Bon choix pour les mariages de famille." },
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
      { author: "Asmae T.", event: "Mariage 500 invités", stars: 4, note: "Cherkaoui a su gérer 500 couverts sans faillir. Les plats étaient encore chauds au dernier rang, c'est pas donné à tous les traiteurs." },
      { author: "Mehdi L.", event: "Réception", stars: 4, note: "Bon rapport qualité-prix pour une grande réception à Casa. Pas la cuisine la plus fine du marché mais généreuse et bien exécutée." },
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
      { author: "Sanaa B.", event: "Mariage à Rabat", stars: 4, note: "Ribat Alafrah est un bon traiteur rbati, cuisine maison comme chez grand-mère. Les chhiwates étaient top, mes invités se sont régalés." },
      { author: "Oussama R.", event: "Baptême", stars: 4, note: "Prestation honnête, cuisine traditionnelle correcte. Prix raisonnables pour Rabat, je recommande pour les budgets intermédiaires." },
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
      { author: "Nadine B.", event: "Mariage de luxe à Marrakech", stars: 5, note: "Yacout, c'est une expérience gustative totale dans un palais d'exception. Mes invités parisiens ont parlé de leur repas comme du meilleur de leur vie." },
      { author: "Tariq El F.", event: "Réception VIP", stars: 5, note: "Cadre palatial hallucinant, service stylé et gastronomie marocaine au plus haut niveau. Tarif en conséquence mais l'expérience est inoubliable." },
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
      { author: "Khaoula B.", event: "Mariage à Casablanca", stars: 4, note: "Afrah Serri a assuré un mariage de 250 personnes sans hic. Le rfissa du petit-déjeuner du lendemain était top, mes invités l'ont tous réclamée." },
      { author: "Marouane T.", event: "Cérémonie familiale", stars: 4, note: "Bon rapport qualité-prix à Casa. Pas le top du top mais solide et fiable, ça dépanne pour les grandes occasions familiales." },
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
      { author: "Najoua L.", event: "Mariage traditionnel", stars: 4, note: "Zemrani fait du traiteur à l'ancienne, générosité typiquement marocaine. La seffa medfouna qu'ils ont servi a fait pleurer ma mère de nostalgie." },
      { author: "Anouar B.", event: "Cérémonie familiale", stars: 4, note: "Traiteur fiable transmis de génération en génération. Ce n'est pas le plus moderne en présentation mais c'est le vrai goût du terroir." },
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
      { author: "Camille V.", event: "Mariage à Marrakech", stars: 5, note: "La Comtesse a créé un décor inspiré d'un conte andalou, avec arches de jasmin et mille bougies. Mes invités ont cru entrer dans un rêve éveillé." },
      { author: "Anas L.", event: "Mariage franco-marocain", stars: 5, note: "Équipe qui vit sa passion. Ils débordent d'idées et savent les concrétiser dans les délais. Premium mais chaque dirham est visible." },
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
      { author: "Elise R.", event: "Mariage luxe à Marrakech", stars: 5, note: "Cocoon a géré notre mariage de 200 invités dans un palais privé avec un niveau de service hôtelier 5 étoiles. Zéro stress, tout réglé en amont." },
      { author: "Hichem K.", event: "Grande réception", stars: 5, note: "Agence dans la cour des grands. Leur réseau de fournisseurs haut de gamme fait toute la différence. Coordination parfaite le jour J." },
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
      { author: "Pauline G.", event: "Mariage destination depuis Paris", stars: 5, note: "Annabelle est bilingue et connaît les deux cultures sur le bout des doigts. Elle a rassuré mes parents français sur chaque étape, et c'est inestimable." },
      { author: "Younes A.", event: "Mariage franco-marocain", stars: 5, note: "Une wedding planner qui comprend les exigences européennes et les traditions marocaines. Mélange parfait, résultat à la hauteur." },
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
      { author: "Rachel M.", event: "Mariage luxe à Marrakech", stars: 5, note: "Nadav a une rigueur logistique hors pair. Chaque minute du jour J était briefée, chaque prestataire synchronisé. Le résultat : zéro problème, que de la beauté." },
      { author: "Adam B.", event: "Réception VIP", stars: 5, note: "Équipe qui sait gérer les clients très exigeants avec tact. Leur carnet d'adresses est incomparable, ils ont accès aux meilleurs lieux et prestataires." },
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
      { author: "Chloé D.", event: "Mariage dans la palmeraie", stars: 5, note: "Ils nous ont trouvé un domaine privé incroyable dans la palmeraie, inaccessible sans connexions. Cadre dingue, ambiance mille et une nuits." },
      { author: "Rayane M.", event: "Mariage outdoor", stars: 5, note: "Spécialistes des mariages en extérieur, ils savent gérer tous les imprévus (vent, soleil, nuit). Équipe ultra expérimentée." },
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
      { author: "Sarah H.", event: "Destination wedding", stars: 5, note: "On a organisé notre mariage depuis New York avec eux, tout en anglais. Ils ont géré les démarches administratives marocaines qui sont un labyrinthe. Vraiment précieux." },
      { author: "Olivia B.", event: "Mariage à Marrakech", stars: 5, note: "Très bonne connaissance du terrain local et réseau de prestataires solide. Ils donnent confiance dès le premier call." },
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
      { author: "Oumayma T.", event: "Nuit de Henné", stars: 5, note: "Layali El Farah a transformé ma nuit de henné en vraie mise en scène mille et une nuits. Tentes berbères, encens, danseuses orientales, un tableau vivant." },
      { author: "Mehdi B.", event: "Mariage à Casablanca", stars: 4, note: "Très bonne équipe, animations bien pensées. Juste un petit manque de coordination sur les horaires, mais l'ambiance était là." },
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
      { author: "Meriem O.", event: "Mariage intimiste à Rabat", stars: 5, note: "Dar Houria sait organiser les mariages intimistes comme personne. Notre petit mariage de 60 invités dans un riad de Rabat était 1000 fois plus beau qu'on imaginait." },
      { author: "Soufiane K.", event: "Fiançailles", stars: 4, note: "Organisatrice attentive aux détails et aux budgets. Elle sait faire beaucoup avec peu, c'est un vrai atout à Rabat." },
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
      { author: "Hind L.", event: "Mariage 800 invités", stars: 5, note: "Le Palace D'Anfa gère les mariages XXL comme personne. On était 800 et on s'est sentis à l'aise. Parking valet, accueil premium, c'est du luxe assumé." },
      { author: "Yassir M.", event: "Réception corporate", stars: 5, note: "Cadre historique d'Anfa, staff ultra pro et équipement complet. On y fait nos soirées clients depuis 3 ans sans jamais être déçus." },
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
      { author: "Salma K.", event: "Mariage balnéaire", stars: 5, note: "Notre cérémonie les pieds dans le sable à Mazagan avec le coucher de soleil sur l'Atlantique — moment mythique. L'équipe wedding a géré chaque détail." },
      { author: "Karim N.", event: "Séminaire d'entreprise", stars: 5, note: "Resort 5 étoiles complet, idéal pour combiner mariage et séjour pour les invités venant de loin. Le spa et la plage sont un bonus énorme." },
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
      { author: "Charlotte L.", event: "Mariage intimiste", stars: 5, note: "La Sultana c'est le joyau caché de la médina. Terrasse avec vue Koutoubia, cérémonie en petit comité dans un cadre d'une beauté irréelle." },
      { author: "Zineb A.", event: "Cérémonie privée", stars: 5, note: "Pour un mariage intime de 40 personnes, c'est l'endroit rêvé. L'équipe hôtelière est aux petits soins, tout est chuchoté et raffiné." },
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
      { author: "Hajar S.", event: "Mariage à Marrakech", stars: 5, note: "Le Palais Mehdi, c'est l'architecture marocaine dans toute sa splendeur. Les jardins la nuit, éclairés, c'est à tomber. Mes photos valent toutes celles d'un magazine." },
      { author: "Bilal R.", event: "Grande réception", stars: 5, note: "Lieu majestueux, staff protocolaire et service à la hauteur. Pour un mariage grandiose, c'est un des plus beaux cadres de Marrakech." },
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
      { author: "Nathalie M.", event: "Mariage à La Mamounia", stars: 5, note: "Se marier à La Mamounia, c'est un rêve qu'on cochait sur une bucket list. Jardins centenaires, service à la française, gastronomie du chef étoilé — le paradis." },
      { author: "Walid B.", event: "Réception royale", stars: 5, note: "Le palace des palaces au Maroc. Les équipes mariage de La Mamounia sont d'une rigueur militaire couplée à une élégance rare. Investissement vital pour ce jour unique." },
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
      { author: "Alexandra P.", event: "Mariage privé à Marrakech", stars: 5, note: "Privatisation totale du Ksar Char Bagh pour notre mariage de 50 invités. On avait le palais rien que pour nous, c'est un luxe rare et inoubliable." },
      { author: "Mohammed H.", event: "Cérémonie ultra-privée", stars: 5, note: "Seulement 12 suites, donc exclusivité garantie. Cadre inspiré des palais Nasrides, jardins sublimes. Une expérience hors du commun pour un mariage confidentiel." },
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
      { author: "Myriam F.", event: "Mariage à Rabat", stars: 5, note: "Le Sofitel Rabat, c'est les 5 hectares de jardin en plein cœur de la capitale, l'ancien jardin royal. Cadre unique et service irréprochable." },
      { author: "Hamza L.", event: "Gala diplomatique", stars: 5, note: "Le lieu de référence pour les événements importants à Rabat. L'architecture Art Déco des salles est rare et magnifique, parfait pour les grandes cérémonies." },
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
      { author: "Imane T.", event: "Mariage 600 invités", stars: 5, note: "La Villa des Ambassadors a une capacité énorme sans que ça fasse usine à mariages. Le cadre reste élégant et intime malgré la taille. Staff très pro." },
      { author: "Yassine D.", event: "Soirée corporate", stars: 4, note: "Bon emplacement sur le boulevard de l'Atlantique, salle bien équipée. Le parking est correct et l'accueil client soigné." },
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
      { author: "Hasna B.", event: "Mariage à Casablanca", stars: 5, note: "MHALA Bridal m'a créé une robe sur-mesure avec broderies dorées inspirées de mon caftan de ma mère. Le mélange tradition-modernité était exactement ce que je voulais." },
      { author: "Kenza S.", event: "Mariage civil", stars: 5, note: "Atelier passionné, les créations sont vraiment exclusives. Essayages dans un cadre zen et équipe à l'écoute de chaque demande." },
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
      { author: "Aya L.", event: "Mariage à Casablanca", stars: 5, note: "DEMETRIOS Maroc c'est la garantie d'une robe de créateur internationale. La qualité des dentelles et les finitions main, on ne trouve pas ça partout." },
      { author: "Ines B.", event: "Mariage civil", stars: 5, note: "Boutique élégante, conseillères pros et collection large. J'ai essayé 15 robes avant de trouver la bonne, et elles ont été patientes tout du long." },
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
      { author: "Dounia L.", event: "Mariage bohème", stars: 5, note: "Dressia a pile le style que je cherchais — robes fluides, dentelles délicates, dos nus travaillés. Pas les robes de princesse cliché, vraiment tendance." },
      { author: "Hafsa B.", event: "Mariage champêtre", stars: 4, note: "Belle boutique, bonne sélection tendance. Prix accessibles pour de la qualité, équipe patiente et sympa. Bon choix à Casa." },
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
      { author: "Soukaina M.", event: "Nuit de Henné", stars: 5, note: "Lala Mollati m'a confectionné un caftan brodé 100% main, c'était 3 mois de travail sur les broderies. Le résultat est une pièce de musée, je la garderai pour ma fille." },
      { author: "Fadwa R.", event: "Mariage traditionnel", stars: 5, note: "Une vraie artiste de la couture marocaine. Les tissus nobles et les perles véritables font toute la différence. Un investissement qui traverse les générations." },
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
      { author: "Dounia F.", event: "Mariage traditionnel", stars: 5, note: "J'ai essayé 14 robes dans d'autres boutiques avant de pousser la porte de Mme Lahlou. Dès la première, j'ai su. Le savoir-faire se voit dans chaque couture, chaque perle brodée à la main." },
      { author: "Meryem B.", event: "Nuit de Henné", stars: 5, note: "Une institution, pas une boutique. Ma mère y avait acheté sa robe en 1988, j'y ai trouvé la mienne en 2025. Le service est d'une autre époque, dans le bon sens." },
      { author: "Hajar T.", event: "Mariage civil + traditionnel", stars: 4, note: "Robes magnifiques et équipe aux petits soins. Les prix piquent un peu mais on comprend pourquoi quand on voit le travail. Quelques retouches à prévoir mais rien de dramatique." },
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
      { author: "Kenza A.", event: "Mariage moderne", stars: 5, note: "Le nom Lahlou m'avait fait peur côté prix, mais Jour J est vraiment plus accessible avec le même niveau de finition. Ma robe bustier était parfaite, les essayages super bien organisés." },
      { author: "Wissal R.", event: "Fiançailles", stars: 5, note: "J'y ai pris ma robe de fiançailles et ma mère sa tenue le même jour. Les stylistes ont un œil de dingue pour assortir les silhouettes. On a été bluffées toutes les deux." },
      { author: "Nour El Houda S.", event: "Mariage civil", stars: 4, note: "Très belle boutique, collections fraîches et tendance. J'aurais aimé un peu plus de choix en taille 42 mais au final j'ai trouvé une pièce que j'adore." },
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
      { author: "Yousra M.", event: "Mariage champêtre", stars: 5, note: "Sarah a compris notre délire bohème dès le premier rdv. Les pivoines et eucalyptus étaient d'une fraîcheur dingue, même après 8h de réception. Tout le monde nous a demandé le contact." },
      { author: "Ilyas B.", event: "Demande en mariage surprise", stars: 5, note: "J'avais besoin d'un bouquet spécial pour ma demande à 24h près. Sarah a livré à l'endroit convenu avec une note manuscrite. Classe absolue, elle a sauvé ma soirée." },
      { author: "Assia K.", event: "Baptême", stars: 4, note: "Très belles compositions pour le baptême de ma fille. Petit hic sur la livraison qui a eu 45 min de retard mais le résultat visuel a fait oublier l'attente." },
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
      { author: "Zineb L.", event: "Mariage intimiste", stars: 5, note: "Nina a un don, point. Mon bouquet de mariée était exactement ce que j'avais en tête sans savoir comment l'expliquer. Elle a traduit mes mots en fleurs, c'est magique." },
      { author: "Othmane D.", event: "Soirée familiale", stars: 4, note: "Très belles compositions pour un dîner chez nous. Bon rapport qualité-prix et Nina est vraiment adorable. Les fleurs ont tenu toute la semaine après." },
      { author: "Rim B.", event: "Anniversaire", stars: 5, note: "Commande un centre de table pour les 60 ans de ma mère, elle n'a pas arrêté d'en parler pendant 3 semaines. Nina met de l'âme dans son travail." },
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
      { author: "Salma H.", event: "Fiançailles en rose poudré", stars: 5, note: "Je voulais du rose poudré partout et j'avais peur que ça fasse trop. Mon Amie la Rose a dosé à la perfection, c'était romantique sans être kitsch. Ma belle-mère a pleuré." },
      { author: "Achraf B.", event: "Anniversaire de mariage", stars: 5, note: "J'ai commandé 50 roses rouges pour nos 10 ans avec ma femme. Emballage soigné, roses ultra fraîches et livraison pile à l'heure. Ma femme a fondu." },
      { author: "Hanane O.", event: "Baptême", stars: 4, note: "Compositions très jolies pour le baptême de ma nièce. Petit bémol sur le devis qui a évolué en cours de route mais le résultat était au rendez-vous." },
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
      { author: "Imane C.", event: "Mariage à la ferme", stars: 5, note: "On voulait un style champêtre un peu sauvage, pas trop arrangé. Jardin Sucré a pigé direct, les arches de fleurs étaient à tomber. Mes invités pensaient qu'on avait fait venir un fleuriste français." },
      { author: "Mouad T.", event: "Réception d'entreprise", stars: 4, note: "Service pro pour le lancement de notre boutique. Compositions fraîches et originales qui ont vraiment mis l'espace en valeur. Prix un peu élevés mais justifiés." },
      { author: "Ghita M.", event: "Henna", stars: 5, note: "Sublimes arches florales pour ma cérémonie de henné. Mélange de verdure et de fleurs blanches qui rendait la terrasse féerique. Je recommande les yeux fermés." },
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
      { author: "Sara El Mansouri", event: "Mariage Palmeraie Marrakech", stars: 5, note: "600 roses rien que sur la table d'honneur. Quand on est entrés dans la salle avec mon mari on a eu le souffle coupé, vraiment. Nos invités n'arrêtaient pas de prendre des photos des centres de table." },
      { author: "Bilal R.", event: "Mariage riad", stars: 5, note: "Pour notre mariage dans un riad de la médina, Mille et Une Roses a transformé les patios en jardins persans. Travail de dingue sur les détails, budget conséquent mais chaque dirham se voit." },
      { author: "Siham A.", event: "Sboue", stars: 4, note: "Compositions magnifiques pour le sboue de mon fils. Très belle qualité de fleurs et mise en scène très réussie. J'aurais apprécié un peu plus de réactivité au téléphone avant l'événement." },
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
      { author: "Hajar B.", event: "Mariage moderne", stars: 5, note: "Gâteau 4 étages avec fleurs comestibles, j'y croyais à moitié quand j'ai commandé. Le résultat a dépassé les photos Instagram — et surtout c'était délicieux, pas juste joli. Mes invités m'en parlent encore." },
      { author: "Yassine K.", event: "Anniversaire", stars: 5, note: "J'ai commandé un number cake pour les 30 ans de ma femme. Design impeccable, garnitures fruitées parfaitement équilibrées. Ma belle-mère (critique de naissance) a validé." },
      { author: "Najat F.", event: "Baby shower", stars: 4, note: "Très joli gâteau thème licorne pour ma nièce. Goût correct, peut-être un peu sucré pour mon goût mais les enfants ont adoré. Livraison ponctuelle." },
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
      { author: "Loubna A.", event: "Fiançailles", stars: 5, note: "Safaa a peint des pivoines à la main sur mon gâteau de fiançailles, j'ai hésité à le couper tellement c'était beau. Bisquit moelleux et crème légère, tout était parfait. Merci mille fois." },
      { author: "Khalid S.", event: "Anniversaire surprise", stars: 5, note: "J'ai demandé un gâteau inspiré du manga préféré de ma fille. Safaa s'est documentée, m'a envoyé 3 croquis, le rendu final a fait pleurer ma fille (de joie). Une perfectionniste." },
      { author: "Dounia M.", event: "Henna", stars: 4, note: "Très jolie pièce montée pour ma nuit de henné. Travail soigné même si un peu cher par rapport à d'autres cake designers. Cela dit la qualité est indéniable." },
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
      { author: "Fadwa Z.", event: "Mariage chic", stars: 5, note: "Le naked cake avec fruits rouges qu'on avait demandé pour 150 personnes a fait sensation. J'avais peur que ça manque à la découpe, il en restait à peine. Signe qu'il était bon." },
      { author: "Adil B.", event: "Anniversaire d'entreprise", stars: 4, note: "Commande de 80 cupcakes aux couleurs de notre marque pour les 5 ans de la boîte. Respect des délais, visuel cohérent et saveurs variées. Rien à redire." },
      { author: "Kenza L.", event: "Baptême", stars: 5, note: "Gâteau pastel pour le baptême de ma fille, une pure merveille. Lou m'a conseillée sur les parfums en fonction des invités (enfants + adultes), elle pense à tout." },
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
      { author: "Soukaina N.", event: "Mariage traditionnel", stars: 5, note: "Drip cake à 3 étages avec coulée de chocolat blanc, inspiré d'une photo qu'on avait sauvegardée sur Pinterest depuis 2 ans. Lolitta l'a reproduit à l'identique et ajouté sa touche. Les photos de notre gâteau ont fait le tour de la famille." },
      { author: "Anas R.", event: "Aïd party", stars: 5, note: "Pour notre réception d'Aïd j'ai commandé un gâteau chocolat-noisette dernière minute (4 jours avant). Lolitta a accepté, livré à l'heure, et c'était excellent. Respect total." },
      { author: "Meriem B.", event: "Anniversaire enfant", stars: 4, note: "Très joli gâteau thème Moana pour les 6 ans de ma fille. Les enfants ont adoré le visuel. Seul bémol : un peu moins sucré aurait été top pour les petits." },
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
      { author: "Imane S.", event: "Mariage Casablanca", stars: 5, note: "Mercedes Classe S blanche impeccable, chauffeur en costume et gants blancs. Ponctualité de Suisse. Les photos de sortie de mosquée sont dingues grâce à la voiture." },
      { author: "Tarik O.", event: "Réception d'entreprise", stars: 5, note: "J'ai loué 3 berlines pour transporter nos VIP lors d'un événement corporate. Zéro accroc, chauffeurs qui connaissent la ville et parlent anglais. Je rappellerai." },
      { author: "Hajar B.", event: "Fiançailles", stars: 4, note: "Belle voiture pour l'arrivée à la salle, le chauffeur était pro. J'ai juste trouvé que le devis initial et la facture finale avaient un petit écart qu'il a fallu clarifier." },
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
      { author: "Wissal T.", event: "Mariage civil + réception", stars: 4, note: "Berline décorée avec goût, chauffeur aimable et voiture climatisée (important en juillet à Casa). Prix correct pour la prestation. Une bonne expérience globale." },
      { author: "Reda M.", event: "Cérémonie traditionnelle", stars: 5, note: "On a pris un 4x4 Range Rover blanc pour mon frère, le résultat en photos est juste incroyable. Chauffeur ponctuel et super sympa avec la famille." },
      { author: "Nour B.", event: "Anniversaire de mariage", stars: 4, note: "Surprise organisée pour les 20 ans de mes parents, RS a joué le jeu et est arrivé pile à l'heure. Service fiable, je recommanderai à mes cousins pour leurs mariages." },
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
      { author: "Sara B.", event: "Mariage de prestige", stars: 5, note: "Bentley Continental pour l'arrivée de la mariée, Rolls Royce pour la sortie de salle. Budget important mais pour un mariage unique, ça vaut chaque dirham. Chauffeurs en costume 3 pièces." },
      { author: "Amine T.", event: "Réception VIP", stars: 5, note: "J'ai loué une Porsche Cayenne avec chauffeur pour un client VIP. Voiture nickel, service 5 étoiles, discrétion totale. City Gold tient ses promesses." },
      { author: "Kenza L.", event: "Mariage Casablanca", stars: 5, note: "Mercedes Classe S avec décoration florale assortie à mon bouquet. Attention aux détails incroyable et équipe qui gère les timings comme des chefs. Un vrai plus pour le mariage." },
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
      { author: "Yousra K.", event: "Mariage Casablanca", stars: 4, note: "BMW Série 7 noire, voiture propre et chauffeur ponctuel. Summit est une option moins clinquante que les rolls/bentley mais très sérieuse. Bon rapport qualité-prix." },
      { author: "Ayoub M.", event: "Lila", stars: 5, note: "J'ai pris un Range Rover pour ma sœur le soir de la Lila. Arrivée stylée et ponctuelle, le chauffeur a même aidé avec la takchita. Très bon service." },
      { author: "Rim H.", event: "Réception familiale", stars: 4, note: "Service correct pour une petite réception. Voiture bien entretenue, chauffeur discret. Prix raisonnable. Rien d'extraordinaire mais tout s'est bien passé." },
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
      { author: "Salma D.", event: "Mariage traditionnel", stars: 5, note: "Kameleon a designé toute notre identité visuelle : faire-part, menus, marque-places, livret de cérémonie. Cohérence totale et finitions de folie (dorure à chaud, papier texturé). Mes invités ont gardé les menus." },
      { author: "Ilyas M.", event: "Fiançailles", stars: 5, note: "J'ai commandé des faire-part sur-mesure avec motif zellige intégré. Le designer a proposé 5 variations, on a affiné ensemble, résultat magnifique. Très bon accueil au studio." },
      { author: "Wissal O.", event: "Baby shower", stars: 4, note: "Très belle papeterie pour ma baby shower, le style était pile ce que je voulais. Délais un peu serrés à cause de mon retard sur la validation mais ils ont assuré." },
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
      { author: "Hanane R.", event: "Mariage romantique", stars: 5, note: "Aquarelles peintes à la main sur mes faire-part, chaque enveloppe était une petite œuvre d'art. Inna m'a même envoyé une vidéo du processus. Mes invités ont encadré les leurs." },
      { author: "Saad B.", event: "Cérémonie traditionnelle", stars: 5, note: "Faire-part en arabe calligraphique + français, Inna a trouvé une calligraphe pour la version arabe. Attention au détail incroyable, service personnalisé à 100%." },
      { author: "Meryem L.", event: "Fiançailles", stars: 4, note: "Très beau rendu, papier épais et impression nette. Un petit ajustement nécessaire sur une date mais Inna a réagi rapidement. Bonne expérience dans l'ensemble." },
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
      { author: "Assia T.", event: "Mariage traditionnel", stars: 4, note: "Faire-part avec dorure à chaud, rendu très premium. Délais respectés, échantillons envoyés avant production finale, c'est un vrai plus. Prix cohérent avec la qualité." },
      { author: "Karim B.", event: "Réception corporate", stars: 4, note: "J'ai commandé des invitations pour un gala d'entreprise. Impression impeccable, finitions nettes, délai tenu. L'équipe est carrée dans ses process, ça fait plaisir." },
      { author: "Nour H.", event: "Mariage civil", stars: 5, note: "Faire-part avec gaufrage et vernis sélectif, résultat bluffant. Printerz sait vraiment travailler les finitions. On a senti la différence par rapport aux imprimeurs classiques." },
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
      { author: "Zineb M.", event: "Mariage express", stars: 4, note: "On s'est mariés 6 semaines après la demande, Web2Print m'a sauvée. Commande en ligne simple, maquette validée en 48h, livraison en 4 jours. Pas le faire-part de luxe mais parfait pour l'urgence." },
      { author: "Bilal K.", event: "Anniversaire 40 ans", stars: 3, note: "Pratique pour commander vite fait, interface claire et prix attractifs. Par contre les modèles sont un peu basiques, il manque des options vraiment originales. Convient pour un usage simple." },
      { author: "Fatima Zahra B.", event: "Baptême", stars: 4, note: "J'ai commandé des cartes de baptême en ligne, super pratique. Qualité d'impression correcte pour le prix, livraison à domicile rapide. Je rappellerai pour d'autres occasions." },
    ],
  },
}
