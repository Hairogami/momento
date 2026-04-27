export type Rsvp = {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  attendingMain: boolean
  attendingDayAfter: boolean | null
  plusOneName: string | null
  dietaryNeeds: string | null
  message: string | null
  createdAt: string
}

export type Guest = {
  id: string
  name: string
  rsvp: string
  notes: string | null
  linkedRsvpId: string | null
}
