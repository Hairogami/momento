import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MessageThread from "@/components/MessageThread"
import { C } from "@/lib/colors"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { conv } = await searchParams

  // Marquer les messages non-lus comme lus
  await prisma.message.updateMany({
    where: {
      read: false,
      senderId: { not: session.user.id },
      conversation: { clientId: session.user.id },
    },
    data: { read: true },
  })

  const conversations = await prisma.conversation.findMany({
    where: { clientId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })

  const activeConv = conv
    ? conversations.find((c) => c.id === conv) ?? conversations[0]
    : conversations[0]

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: C.white }}>
        Mes messages
      </h1>
      <p className="text-sm mb-8" style={{ color: C.mist }}>
        Vos échanges avec les prestataires
      </p>

      {conversations.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
        >
          <p className="text-base font-medium mb-2" style={{ color: C.white }}>
            Aucune conversation
          </p>
          <p className="text-sm mb-6" style={{ color: C.mist }}>
            Contactez un prestataire depuis l&apos;annuaire pour démarrer une conversation.
          </p>
          <Link
            href="/prestataires"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Parcourir les prestataires
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar — conversation list */}
          <div className="space-y-2">
            {conversations.map((c) => {
              const last = c.messages[0]
              return (
                <Link
                  key={c.id}
                  href={`/messages?conv=${c.id}`}
                  className="block rounded-2xl p-4 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: activeConv?.id === c.id ? C.anthracite : C.dark,
                    border: `1px solid ${activeConv?.id === c.id ? C.terra : C.anthracite}`,
                  }}
                >
                  <p className="font-semibold text-sm mb-1 truncate" style={{ color: C.white }}>
                    {c.vendorSlug}
                  </p>
                  {last ? (
                    <p className="text-xs truncate" style={{ color: C.mist }}>
                      {last.content}
                    </p>
                  ) : (
                    <p className="text-xs italic" style={{ color: C.mist }}>
                      Aucun message
                    </p>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Thread panel */}
          <div className="lg:col-span-2">
            {activeConv && (
              <MessageThread
                conversationId={activeConv.id}
                currentUserId={session.user.id}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
