// ── Shared types + helpers for dashboard widgets ─────────────────────────────
// Aligned avec le payload de /api/planners/[id]/dashboard-data/route.ts.
// Chaque type ici DOIT correspondre exactement au shape renvoyé par l'API
// (cf. .claude/rules/widget-contract.md — question 1 + 2 : data + source).

export type TaskPriority = "haute" | "moyenne" | "basse"
export type Task = {
  id: string
  label: string
  done: boolean
  priority: TaskPriority
  dueDate: string
  category: string
}

export type BookingStatus = "CONFIRMED" | "PENDING" | "INQUIRY"
export type Booking = {
  id: string
  vendor: string
  category: string
  status: BookingStatus
  amount?: number
}

export type Message = {
  id: string
  vendor: string
  lastMsg: string
  time: string
  unread: number
  avatar: string
}

export type Guest = {
  id: string
  name: string
  rsvp: "yes" | "pending" | "no"
  tableNumber?: number
  diet?: string
  city?: string
}

// Brand gradient utilisé par tous les widgets — JAMAIS de hex literal local.
export const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

// Material Symbols icon — utilisé partout dans le dashboard.
export function GIcon({
  name,
  size = 16,
  color = "var(--dash-text-3,#9a9aaa)",
}: {
  name: string
  size?: number
  color?: string
}) {
  return (
    <span
      style={{
        fontFamily: "'Google Symbols','Material Symbols Outlined'",
        fontSize: size,
        color,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 1,
        display: "inline-block",
        userSelect: "none",
        verticalAlign: "middle",
      }}
    >
      {name}
    </span>
  )
}

// Format date court FR-MA — utilisé par renderTasks / renderBookings.
export function shortDate(d: string) {
  return new Date(d).toLocaleDateString("fr-MA", { day: "numeric", month: "short" })
}

// Temps relatif (il y a X) pour activity feed — utilisé par RSVPLive.
export function relativeTime(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso).getTime()
  if (isNaN(d)) return ""
  const diff = Date.now() - d
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}j`
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}
