"use client"

import { useEffect, useState } from "react"
import EventsDashboard from "@/components/EventsDashboard"
import AccueilStats from "@/components/AccueilStats"
import OnboardingModal from "@/components/OnboardingModal"

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
  const [hasExistingEvents, setHasExistingEvents] = useState(false)

  useEffect(() => {
    fetch("/api/planners")
      .then(r => r.json())
      .then((planners: unknown[]) => setHasExistingEvents(planners.length > 0))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col">
      <OnboardingModal show={!hasExistingEvents} />
      <EventsDashboard
        data={EMPTY_DATA}
        eventName={null}
        eventDate={null}
        budget={null}
        guestCount={null}
        daysUntil={null}
        neededCategories={[]}
        hasExistingEvents={hasExistingEvents}
      />
      <AccueilStats />
    </div>
  )
}
