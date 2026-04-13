/**
 * seed-dev.ts — Remplit la DB avec des données de démo cohérentes
 * Run: npx tsx prisma/seed-dev.ts
 */
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.development.local" })
dotenv.config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Récupère le premier user en DB ──────────────────────────────────────
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } })
  if (!user) { console.error("Aucun user en DB"); process.exit(1) }
  console.log(`User: ${user.email} (${user.id})`)

  // ── Workspace ────────────────────────────────────────────────────────────
  let ws = await prisma.workspace.findFirst({ where: { userId: user.id } })
  if (!ws) {
    ws = await prisma.workspace.create({
      data: { userId: user.id, eventName: "Mon Événement", budget: 150000, guestCount: 180 },
    })
    console.log("✓ Workspace créé")
  }

  // ── Planners (2 événements) ───────────────────────────────────────────────
  const planners = await prisma.planner.findMany({ where: { userId: user.id } })
  let p1 = planners.find(p => p.coupleNames?.includes("Yasmine"))
  if (p1) {
    p1 = await prisma.planner.update({ where: { id: p1.id }, data: { coverColor: "#e07b5a" } })
  } else {
    p1 = await prisma.planner.create({
      data: {
        userId: user.id, title: "Mariage Yasmine & Karim", coupleNames: "Mariage Yasmine & Karim",
        weddingDate: new Date("2026-09-15"), location: "Casablanca",
        coverColor: "#e07b5a", budget: 120000, guestCount: 220,
      },
    })
  }
  let p2 = planners.find(p => p.title?.includes("Anniversaire"))
  if (p2) {
    p2 = await prisma.planner.update({ where: { id: p2.id }, data: { coverColor: "#e05a7b" } })
  } else {
    p2 = await prisma.planner.create({
      data: {
        userId: user.id, title: "Anniversaire 30 ans Leila", coupleNames: "Anniversaire 30 ans Leila",
        weddingDate: new Date("2026-05-10"), location: "Rabat",
        coverColor: "#e05a7b", budget: 30000, guestCount: 60,
      },
    })
  }
  console.log(`✓ Planners: ${p1.id} / ${p2.id}`)

  // ── Budget items ──────────────────────────────────────────────────────────
  await prisma.budgetItem.deleteMany({ where: { workspaceId: ws.id } })
  const budgetData = [
    // P1 — Mariage
    { workspaceId: ws.id, plannerId: p1.id, category: "venue",    label: "Salle Palais Sebban",       estimated: 35000, actual: 35000, paid: true },
    { workspaceId: ws.id, plannerId: p1.id, category: "catering", label: "Traiteur Dar Zitoun",        estimated: 28000, actual: 30000, paid: false },
    { workspaceId: ws.id, plannerId: p1.id, category: "music",    label: "DJ Amine + Orchestre",       estimated: 12000, actual: 12000, paid: true },
    { workspaceId: ws.id, plannerId: p1.id, category: "photo",    label: "Studio Lumière Photographie", estimated: 8000,  actual: null,  paid: false },
    { workspaceId: ws.id, plannerId: p1.id, category: "deco",     label: "Décoration florale",         estimated: 9000,  actual: 9500,  paid: false },
    { workspaceId: ws.id, plannerId: p1.id, category: "makeup",   label: "Coiffure & Maquillage",      estimated: 3500,  actual: null,  paid: false },
    // P2 — Anniversaire
    { workspaceId: ws.id, plannerId: p2.id, category: "venue",    label: "Villa événementielle Rabat", estimated: 8000,  actual: 8000,  paid: true },
    { workspaceId: ws.id, plannerId: p2.id, category: "catering", label: "Buffet marocain",            estimated: 9000,  actual: null,  paid: false },
    { workspaceId: ws.id, plannerId: p2.id, category: "music",    label: "Playlist DJ",                estimated: 2500,  actual: 2500,  paid: true },
    { workspaceId: ws.id, plannerId: p2.id, category: "deco",     label: "Décoration thème rose gold", estimated: 3500,  actual: null,  paid: false },
  ]
  await prisma.budgetItem.createMany({ data: budgetData })
  console.log(`✓ ${budgetData.length} budget items créés`)

  // ── Guests ────────────────────────────────────────────────────────────────
  await prisma.guest.deleteMany({ where: { workspaceId: ws.id } })
  const guestsData = [
    // P1
    { workspaceId: ws.id, plannerId: p1.id, name: "Karim El Fassi",    email: "karim@example.com", rsvp: "yes",     plusOne: true,  tableNumber: 1 },
    { workspaceId: ws.id, plannerId: p1.id, name: "Nadia Benali",      email: "nadia@example.com", rsvp: "yes",     plusOne: false, tableNumber: 1 },
    { workspaceId: ws.id, plannerId: p1.id, name: "Omar Tazi",         phone: "0661234567",        rsvp: "pending", plusOne: true,  tableNumber: null },
    { workspaceId: ws.id, plannerId: p1.id, name: "Samira Alaoui",     email: "sam@example.com",   rsvp: "yes",     plusOne: false, tableNumber: 2 },
    { workspaceId: ws.id, plannerId: p1.id, name: "Younes Berrada",    email: "you@example.com",   rsvp: "no",      plusOne: false, tableNumber: null },
    { workspaceId: ws.id, plannerId: p1.id, name: "Laila Cherkaoui",   phone: "0662345678",        rsvp: "pending", plusOne: false, tableNumber: null },
    // P2
    { workspaceId: ws.id, plannerId: p2.id, name: "Leila Chraibi",     email: "leila@example.com", rsvp: "yes",     plusOne: true,  tableNumber: 1 },
    { workspaceId: ws.id, plannerId: p2.id, name: "Sofia Maarouf",     email: "sofia@example.com", rsvp: "yes",     plusOne: false, tableNumber: 1 },
    { workspaceId: ws.id, plannerId: p2.id, name: "Amine Rhilane",     phone: "0663456789",        rsvp: "pending", plusOne: false, tableNumber: null },
    { workspaceId: ws.id, plannerId: p2.id, name: "Hind Bouhaddou",    email: "hind@example.com",  rsvp: "no",      plusOne: false, tableNumber: null },
  ]
  await prisma.guest.createMany({ data: guestsData })
  console.log(`✓ ${guestsData.length} invités créés`)

  // ── Tasks (100 tâches + RDV) ──────────────────────────────────────────────
  await prisma.task.deleteMany({ where: { workspaceId: ws.id } })

  function d(y: number, m: number, day: number) { return new Date(y, m - 1, day) }

  const tasksData = [
    // ─── MARIAGE P1 (60 tâches) ───────────────────────────────────────────
    // Administratif
    { workspaceId: ws.id, plannerId: p1.id, title: "Signer le contrat de la salle",           category: "Administratif", dueDate: d(2026,4,20), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Déposer dossier mairie",                  category: "Administratif", dueDate: d(2026,4,25), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Réserver le notaire",                     category: "Administratif", dueDate: d(2026,5,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Obtenir certificats de coutume",           category: "Administratif", dueDate: d(2026,5,20), completed: false },
    // RDV Traiteur
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel traiteur Dar Zitoun — confirmer menu", category: "Traiteur", dueDate: d(2026,4,22), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV dégustation Dar Zitoun",           category: "Traiteur", dueDate: d(2026,5,5),  completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel traiteur — confirmer nb couverts", category: "Traiteur", dueDate: d(2026,6,1),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Finaliser le menu complet",               category: "Traiteur", dueDate: d(2026,6,15), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Confirmer allergie invités au traiteur",  category: "Traiteur", dueDate: d(2026,7,1),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Dernier appel traiteur J-15",          category: "Traiteur", dueDate: d(2026,8,31), completed: false },
    // RDV Photo
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV photographe Studio Lumière",      category: "Photo",    dueDate: d(2026,4,28), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel photographe — valider planning", category: "Photo",    dueDate: d(2026,5,15), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Séance engagement (pré-mariage)",         category: "Photo",    dueDate: d(2026,6,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Confirmer heure arrivée photographe",  category: "Photo",    dueDate: d(2026,9,1),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Préparer liste photos must-have",         category: "Photo",    dueDate: d(2026,7,15), completed: false },
    // RDV Musique
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV DJ Amine — écoute playlist",      category: "Musique",  dueDate: d(2026,5,3),  completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel DJ — confirmer matériel son",   category: "Musique",  dueDate: d(2026,6,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Envoyer playlist personnalisée au DJ",   category: "Musique",  dueDate: d(2026,7,5),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel orchestre — valider programme", category: "Musique",  dueDate: d(2026,7,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Confirmer horaires DJ + orchestre",      category: "Musique",  dueDate: d(2026,8,15), completed: false },
    // Décoration
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV fleuriste — choix compositions",  category: "Décoration", dueDate: d(2026,5,8),  completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel fleuriste — confirmer couleurs", category: "Décoration", dueDate: d(2026,6,5),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Valider plan de table floral",            category: "Décoration", dueDate: d(2026,7,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Choisir bougies et photophores",          category: "Décoration", dueDate: d(2026,6,25), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Confirmer livraison fleurs J-1",       category: "Décoration", dueDate: d(2026,9,14), completed: false },
    // Robe & Beauté
    { workspaceId: ws.id, plannerId: p1.id, title: "1er essayage robe de mariée",             category: "Beauté",   dueDate: d(2026,5,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "2ème essayage robe de mariée",            category: "Beauté",   dueDate: d(2026,6,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Essayage final robe",                     category: "Beauté",   dueDate: d(2026,7,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV coiffeur — test coiffure",         category: "Beauté",   dueDate: d(2026,6,15), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV maquilleuse — test maquillage",    category: "Beauté",   dueDate: d(2026,7,1),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Confirmer heure arrivée coiffeur J-1", category: "Beauté",   dueDate: d(2026,9,14), completed: false },
    // Invités
    { workspaceId: ws.id, plannerId: p1.id, title: "Commander les faire-part",                category: "Invités",  dueDate: d(2026,4,30), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Envoyer faire-part batch 1",              category: "Invités",  dueDate: d(2026,5,15), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Envoyer faire-part batch 2",              category: "Invités",  dueDate: d(2026,5,25), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Relancer invités sans réponse",        category: "Invités",  dueDate: d(2026,6,30), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Finaliser plan de table",                 category: "Invités",  dueDate: d(2026,8,1),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Imprimer marque-places",                  category: "Invités",  dueDate: d(2026,9,1),  completed: false },
    // Salle
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel salle — confirmer horaires montage", category: "Salle", dueDate: d(2026,8,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV salle — visite technique finale",  category: "Salle",    dueDate: d(2026,8,30), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Confirmer parking invités",               category: "Salle",    dueDate: d(2026,9,5),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel salle J-3 — dernier check",      category: "Salle",    dueDate: d(2026,9,12), completed: false },
    // Transport
    { workspaceId: ws.id, plannerId: p1.id, title: "Réserver voiture de luxe mariés",        category: "Transport", dueDate: d(2026,5,30), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Confirmer chauffeur — itinéraire",     category: "Transport", dueDate: d(2026,9,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Organiser navettes invités",              category: "Transport", dueDate: d(2026,7,15), completed: false },
    // Divers
    { workspaceId: ws.id, plannerId: p1.id, title: "Choisir alliances",                       category: "Bijoux",   dueDate: d(2026,5,25), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Commander gâteau de mariage",             category: "Traiteur", dueDate: d(2026,6,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV pâtissier — dégustation gâteau",  category: "Traiteur", dueDate: d(2026,5,28), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Préparer discours de remerciement",       category: "Divers",   dueDate: d(2026,8,15), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Lune de miel — réserver vols",            category: "Voyage",   dueDate: d(2026,5,1),  completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Lune de miel — réserver hôtel",          category: "Voyage",   dueDate: d(2026,5,5),  completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel agence voyage — confirmer",      category: "Voyage",   dueDate: d(2026,8,25), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Préparer valises lune de miel",          category: "Voyage",   dueDate: d(2026,9,13), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Préparer cadeaux invités (dragées)",     category: "Divers",   dueDate: d(2026,8,10), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Créer site web mariage",                  category: "Divers",   dueDate: d(2026,4,30), completed: true  },
    { workspaceId: ws.id, plannerId: p1.id, title: "Imprimer menus de table",                category: "Divers",   dueDate: d(2026,9,5),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "📞 Appel DJ — setlist cérémonie civile", category: "Musique",  dueDate: d(2026,8,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Répétition cérémonie avec officiant",    category: "Cérémonie",dueDate: d(2026,9,8),  completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "🤝 RDV officiant — personnaliser discours", category: "Cérémonie", dueDate: d(2026,6,20), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Choisir lectures et témoins",            category: "Cérémonie",dueDate: d(2026,5,15), completed: false },
    { workspaceId: ws.id, plannerId: p1.id, title: "Finaliser ordre du jour J-Jour",         category: "Divers",   dueDate: d(2026,9,10), completed: false },

    // ─── ANNIVERSAIRE P2 (40 tâches) ────────────────────────────────────────
    { workspaceId: ws.id, plannerId: p2.id, title: "Réserver la villa événementielle",        category: "Salle",    dueDate: d(2026,4,12), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel villa — confirmer capacité",     category: "Salle",    dueDate: d(2026,4,18), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "🤝 RDV villa — visite des lieux",         category: "Salle",    dueDate: d(2026,4,22), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "Finaliser liste des invités",             category: "Invités",  dueDate: d(2026,4,15), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "Envoyer invitations digitales",           category: "Invités",  dueDate: d(2026,4,20), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Relancer invités sans réponse",        category: "Invités",  dueDate: d(2026,4,28), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Commander le gâteau d'anniversaire",     category: "Traiteur", dueDate: d(2026,4,25), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "🤝 RDV pâtissier — dégustation",         category: "Traiteur", dueDate: d(2026,4,27), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Confirmer buffet marocain",               category: "Traiteur", dueDate: d(2026,4,30), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel traiteur — allergies invités",  category: "Traiteur", dueDate: d(2026,5,2),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Créer playlist Spotify thème soirée",    category: "Musique",  dueDate: d(2026,4,28), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel DJ — confirmer équipement",     category: "Musique",  dueDate: d(2026,5,1),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Tester sono de la villa",                category: "Musique",  dueDate: d(2026,5,5),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Commander déco thème rose gold",         category: "Décoration", dueDate: d(2026,4,22), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "🤝 RDV décorateur — moodboard",          category: "Décoration", dueDate: d(2026,4,25), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Acheter ballons et accessoires",          category: "Décoration", dueDate: d(2026,5,3),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Préparer photobooth",                    category: "Décoration", dueDate: d(2026,5,6),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📸 Réserver photographe soirée",         category: "Photo",    dueDate: d(2026,4,20), completed: true  },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel photographe — confirmer horaires", category: "Photo", dueDate: d(2026,5,7),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Préparer liste photos souvenir",         category: "Photo",    dueDate: d(2026,5,4),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Acheter cadeau surprise pour Leila",     category: "Cadeaux",  dueDate: d(2026,4,30), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Préparer discours surprise amies",       category: "Divers",   dueDate: d(2026,5,5),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Imprimer photos souvenirs ambiance",     category: "Divers",   dueDate: d(2026,5,2),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Préparer goody bags invités",            category: "Cadeaux",  dueDate: d(2026,5,4),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel villa J-2 — confirmation logistique", category: "Salle", dueDate: d(2026,5,8), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Organiser covoiturage invités",          category: "Transport", dueDate: d(2026,5,3),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Confirmer timing arrivée surprise",      category: "Divers",   dueDate: d(2026,5,6),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "🤝 RDV animateur soirée",               category: "Divers",   dueDate: d(2026,5,1),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel animateur — programme soirée", category: "Divers",   dueDate: d(2026,5,7),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Préparer jeux & activités soirée",      category: "Divers",   dueDate: d(2026,5,4),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Commander bouteilles & softs",           category: "Traiteur", dueDate: d(2026,5,5),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Acheter tenue pour Leila (surprise)",   category: "Beauté",   dueDate: d(2026,4,28), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Confirmation finale villa J-1",       category: "Salle",    dueDate: d(2026,5,9),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Imprimer plan de table",                category: "Divers",   dueDate: d(2026,5,7),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Tester éclairage ambiance villa",        category: "Décoration", dueDate: d(2026,5,3),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Acheter bougies parfumées déco",         category: "Décoration", dueDate: d(2026,4,30), completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "🤝 Répétition chorégraphie surprise",    category: "Divers",   dueDate: d(2026,5,6),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "📞 Appel DJ — setlist surprise entrance", category: "Musique",  dueDate: d(2026,5,8),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Faire les courses décoration DIY",       category: "Décoration", dueDate: d(2026,5,4),  completed: false },
    { workspaceId: ws.id, plannerId: p2.id, title: "Monter décoration la veille",            category: "Décoration", dueDate: d(2026,5,9),  completed: false },
  ]

  await prisma.task.createMany({ data: tasksData })
  console.log(`✓ ${tasksData.length} tâches créées`)

  // ── Résumé chiffres ───────────────────────────────────────────────────────
  const totalBudget = budgetData.reduce((s, i) => s + i.estimated, 0)
  const totalPaid   = budgetData.filter(i => i.paid).reduce((s, i) => s + i.estimated, 0)
  const p1Guests    = guestsData.filter(g => g.plannerId === p1.id)
  const p2Guests    = guestsData.filter(g => g.plannerId === p2.id)
  console.log(`\n── Résumé ──`)
  console.log(`Budget total prévu : ${totalBudget.toLocaleString("fr-FR")} MAD`)
  console.log(`Payé               : ${totalPaid.toLocaleString("fr-FR")} MAD`)
  console.log(`Invités P1 (mariage)     : ${p1Guests.length} (${p1Guests.filter(g=>g.rsvp==="yes").length} confirmés)`)
  console.log(`Invités P2 (anniversaire): ${p2Guests.length} (${p2Guests.filter(g=>g.rsvp==="yes").length} confirmés)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
