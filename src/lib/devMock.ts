/**
 * DEV ONLY — mock data for local preview without authentication.
 * This file is safe to commit: it only activates in development.
 */

import type { DashboardData } from "@/components/DashboardWidgets"

export const IS_DEV = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1"

export const MOCK_SESSION = {
  user: { id: "mock-user-id", name: "Yasmine El Fassi", email: "yasmine@test.com" },
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
  firstName: "Yasmine",
  eventName: "Mariage Yasmine & Karim",
  eventDate: "2026-09-15T00:00:00.000Z",
  budget: 80000,
  guestCount: 200,
  tasks: [
    { id: "1",  title: "Choisir le traiteur",          category: "Traiteur",   dueDate: "2026-04-12T00:00:00.000Z", completed: false },
    { id: "2",  title: "Réserver le photographe",      category: "Photo",      dueDate: "2026-04-20T00:00:00.000Z", completed: true  },
    { id: "3",  title: "Envoyer les invitations",      category: "Invités",    dueDate: "2026-06-01T00:00:00.000Z", completed: false },
    { id: "4",  title: "Essayage robe de mariée",      category: "Robe",       dueDate: "2026-04-18T00:00:00.000Z", completed: false },
    { id: "5",  title: "Rencontrer le DJ",             category: "Musique",    dueDate: "2026-05-10T00:00:00.000Z", completed: false },
    { id: "6",  title: "Dégustation traiteur",         category: "Traiteur",   dueDate: "2026-04-30T00:00:00.000Z", completed: false },
    { id: "7",  title: "Réserver le lieu",             category: "Lieu",       dueDate: "2026-03-01T00:00:00.000Z", completed: true  },
    { id: "8",  title: "Commander les faire-part",     category: "Invités",    dueDate: "2026-05-20T00:00:00.000Z", completed: false },
    { id: "9",  title: "Choisir les fleurs",           category: "Déco",       dueDate: "2026-07-01T00:00:00.000Z", completed: false },
    { id: "10", title: "Plan de table final",          category: "Invités",    dueDate: "2026-08-15T00:00:00.000Z", completed: false },
  ],
  budgetItems: [
    { id: "1", category: "Lieu",        label: "Salle de réception Al Boustane",  estimated: 30000, actual: 28000 },
    { id: "2", category: "Traiteur",    label: "Repas & boissons (200 pers.)",    estimated: 25000, actual: null  },
    { id: "3", category: "Photo",       label: "Photographe Prestige",           estimated: 8000,  actual: 7500  },
    { id: "4", category: "Musique",     label: "DJ Azz + sono",                  estimated: 5000,  actual: null  },
    { id: "5", category: "Fleurs",      label: "Décoration florale",             estimated: 4000,  actual: 3800  },
    { id: "6", category: "Robe",        label: "Robe & costume",                 estimated: 6000,  actual: 5500  },
    { id: "7", category: "Faire-part",  label: "Invitations & enveloppes",       estimated: 2000,  actual: null  },
  ],
  bookings: [
    { id: "1", status: "confirmed", totalPrice: 7500,  eventDate: "2026-09-15T10:00:00.000Z", vendor: { name: "Prestige Photo",      category: "Photographe",    rating: 5   } },
    { id: "2", status: "pending",   totalPrice: 5000,  eventDate: "2026-09-15T18:00:00.000Z", vendor: { name: "DJ Azz",              category: "DJ",             rating: null } },
    { id: "3", status: "confirmed", totalPrice: 28000, eventDate: "2026-09-15T00:00:00.000Z", vendor: { name: "Al Boustane",         category: "Lieu de réception", rating: 4 } },
    { id: "4", status: "pending",   totalPrice: 3800,  eventDate: "2026-05-30T14:00:00.000Z", vendor: { name: "Fleurs du Paradis",   category: "Fleuriste événementiel", rating: null } },
    { id: "5", status: "pending",   totalPrice: 4200,  eventDate: null,                       vendor: { name: "Cinéma Azur Films",   category: "Vidéaste",        rating: null } },
  ],
  guests: [
    { id: "1",  name: "Nadia Benali",     rsvp: "CONFIRMED",  tableNumber: 1, city: "Casablanca",  inviteSent: true  },
    { id: "2",  name: "Omar Khatib",      rsvp: "CONFIRMED",  tableNumber: 1, city: "Casablanca",  inviteSent: true  },
    { id: "3",  name: "Fatima Zahra",     rsvp: "CONFIRMED",  tableNumber: 2, city: "Rabat",       inviteSent: true  },
    { id: "4",  name: "Hassan Moukrim",   rsvp: "DECLINED",   tableNumber: null, city: "Marrakech", inviteSent: true  },
    { id: "5",  name: "Sara Tazi",        rsvp: "CONFIRMED",  tableNumber: 2, city: "Casablanca",  inviteSent: true  },
    { id: "6",  name: "Youssef Alami",    rsvp: "PENDING",    tableNumber: null, city: "Fès",      inviteSent: false },
    { id: "7",  name: "Kenza Rachidi",    rsvp: "CONFIRMED",  tableNumber: 3, city: "Paris",       inviteSent: true  },
    { id: "8",  name: "Amine Berbich",    rsvp: "PENDING",    tableNumber: null, city: "Rabat",    inviteSent: false },
    { id: "9",  name: "Leila Mansouri",   rsvp: "CONFIRMED",  tableNumber: 3, city: "Tanger",      inviteSent: true  },
    { id: "10", name: "Mehdi Fennane",    rsvp: "CONFIRMED",  tableNumber: 4, city: "Casablanca",  inviteSent: true  },
    { id: "11", name: "Houda Berrada",    rsvp: "DECLINED",   tableNumber: null, city: "Marrakech", inviteSent: true  },
    { id: "12", name: "Adil Chraibi",     rsvp: "PENDING",    tableNumber: null, city: "Paris",    inviteSent: false },
  ],
  unreadCount: 2,
}

export const MOCK_NEEDED_CATEGORIES = [
  "Photographe", "Vidéaste", "DJ", "Traiteur",
  "Fleuriste événementiel", "Lieu de réception", "Makeup Artist", "Wedding planner",
]

export const MOCK_WORKSPACE = {
  eventName: MOCK_DASHBOARD_DATA.eventName,
  eventDate: MOCK_DASHBOARD_DATA.eventDate,
  budget: MOCK_DASHBOARD_DATA.budget,
  guestCount: MOCK_DASHBOARD_DATA.guestCount,
  neededCategories: JSON.stringify(MOCK_NEEDED_CATEGORIES),
}
