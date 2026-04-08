/**
 * DEV ONLY — mock data for local preview without authentication.
 * This file is safe to commit: it only activates in development.
 */

import type { DashboardData } from "@/components/DashboardWidgets"

export const IS_DEV = process.env.NODE_ENV === "development"

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
    { id: "1", title: "Choisir le traiteur", category: "Traiteur", dueDate: "2026-05-01T00:00:00.000Z", completed: false },
    { id: "2", title: "Réserver le photographe", category: "Photo", dueDate: "2026-04-20T00:00:00.000Z", completed: true },
    { id: "3", title: "Envoyer les invitations", category: "Invités", dueDate: "2026-06-01T00:00:00.000Z", completed: false },
  ],
  budgetItems: [
    { id: "1", category: "Lieu", label: "Salle de réception", estimated: 30000, actual: 28000 },
    { id: "2", category: "Traiteur", label: "Repas & boissons", estimated: 25000, actual: null },
  ],
  bookings: [
    { id: "1", status: "confirmed", vendor: { name: "Prestige Photo", category: "Photographe" } },
    { id: "2", status: "pending", vendor: { name: "DJ Azz", category: "DJ" } },
  ],
  guests: [
    { id: "1", rsvp: "CONFIRMED" },
    { id: "2", rsvp: "CONFIRMED" },
    { id: "3", rsvp: "PENDING" },
    { id: "4", rsvp: "DECLINED" },
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
