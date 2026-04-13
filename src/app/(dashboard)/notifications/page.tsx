import { requireSession } from "@/lib/devAuth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, CheckCircle2, MessageSquare } from "lucide-react"
import { C } from "@/lib/colors"
import { prisma } from "@/lib/prisma"

export default async function NotificationsPage() {
  const session = await requireSession()

  // Notifications = messages non lus reçus de prestataires
  const unreadMessages = await prisma.message.findMany({
    where: {
      read: false,
      senderId: { not: session.user.id },
      conversation: { clientId: session.user.id },
    },
    include: { conversation: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: C.white }}>
          Notifications
        </h1>
        <p className="text-sm" style={{ color: C.mist }}>
          Vos dernières mises à jour
        </p>
      </div>

      {unreadMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.dark }}
          >
            <CheckCircle2 size={40} style={{ color: C.terra }} />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-xl font-semibold mb-2" style={{ color: C.white }}>
              Vous êtes à jour !
            </p>
            <p className="text-sm mb-6" style={{ color: C.mist }}>
              Aucune nouvelle notification pour le moment.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              Retour à mon espace
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {unreadMessages.map(msg => (
            <Link
              key={msg.id}
              href={`/messages?conv=${msg.conversation.id}`}
              className="flex items-start gap-4 rounded-2xl p-4 transition-all hover:opacity-90"
              style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${C.terra}20` }}
              >
                <MessageSquare size={16} style={{ color: C.terra }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5" style={{ color: C.white }}>
                  {msg.conversation.vendorSlug}
                </p>
                <p className="text-xs truncate" style={{ color: C.mist }}>
                  {msg.content}
                </p>
                <p className="text-[10px] mt-1" style={{ color: `${C.mist}60` }}>
                  {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                style={{ backgroundColor: C.terra }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
