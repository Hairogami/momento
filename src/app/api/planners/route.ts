import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { IS_DEV, MOCK_DASHBOARD_DATA } from "@/lib/devMock"

export async function GET() {
  if (IS_DEV) {
    return Response.json([
      { id: "mock-1", coupleNames: "Mariage Yasmine & Karim",  title: null, weddingDate: "2026-09-15", location: "Casablanca", coverColor: "#e07b5a", guestCount: 220 },
      { id: "mock-2", coupleNames: "Mariage Sara & Adam",      title: null, weddingDate: "2026-06-21", location: "Marrakech",  coverColor: "#7b5ea7", guestCount: 150 },
      { id: "mock-3", coupleNames: null, title: "Anniversaire 30 ans Leila", weddingDate: "2026-05-10", location: "Rabat",       coverColor: "#e05a7b", guestCount: 60  },
      { id: "mock-4", coupleNames: "Mariage Nadia & Youssef",  title: null, weddingDate: "2026-11-08", location: "Tanger",      coverColor: "#5a8ae0", guestCount: 300 },
      { id: "mock-5", coupleNames: null, title: "Soirée entreprise TechCo", weddingDate: "2026-04-25", location: "Casablanca", coverColor: "#3a7d5c", guestCount: 80  },
      { id: "mock-6", coupleNames: "Mariage Ines & Mehdi",     title: null, weddingDate: "2026-07-14", location: "Fès",         coverColor: "#c4922a", guestCount: 180 },
      { id: "mock-7", coupleNames: null, title: "Baby shower Amina",        weddingDate: "2026-05-02", location: "Casablanca", coverColor: "#e07bb5", guestCount: 30  },
      { id: "mock-8", coupleNames: "Mariage Douaa & Bilal",    title: null, weddingDate: "2026-10-03", location: "Agadir",      coverColor: "#5aaae0", guestCount: 250 },
    ])
  }

  const session = await auth()
  if (!session?.user?.id) {
    return Response.json([], { status: 401 })
  }

  const planners = await prisma.planner.findMany({
    where: { userId: session!.user!.id },
    include: { steps: true, events: true },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(planners)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const planner = await prisma.planner.create({
    data: {
      title: body.title,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
      budget: body.budget ? parseFloat(body.budget) : null,
      location: body.location,
      coverColor: body.coverColor || "#f9a8d4",
      userId: session?.user?.id ?? null,
    },
  })
  return Response.json(planner, { status: 201 })
}
