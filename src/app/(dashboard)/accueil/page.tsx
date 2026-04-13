"use client"

import { useEffect, useState } from "react"
import EventsDashboard from "@/components/EventsDashboard"
import AccueilStats from "@/components/AccueilStats"
import OnboardingModal from "@/components/OnboardingModal"

type Planner = { id: string; title: string | null; coupleNames: string | null; weddingDate?: string | null; coverColor?: string | null }

const EMPTY_DATA = {
  firstName: "",
  eventName: "Mon événement",
  eventDate: null,
  budget: null,
  guestCount: null,
  tasks: [],
  budgetItems: [],
  bookings: [],
  guests: [],
  unreadCount: 0,
}

export default function AccueilPage() {
  const [planners, setPlanners] = useState<Planner[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/planners")
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setPlanners(data as Planner[]) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const hasExistingEvents = planners.length > 0

  return (
    <div className="flex flex-col">
      <OnboardingModal show={loaded && !hasExistingEvents} />
      <EventsDashboard
        data={EMPTY_DATA}
        eventName={null}
        eventDate={null}
        budget={null}
        guestCount={null}
        daysUntil={null}
        neededCategories={[]}
        hasExistingEvents={hasExistingEvents}
        planners={planners}
      />
      <AccueilStats />
    </div>
  )
}
