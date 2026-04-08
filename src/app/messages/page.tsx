import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MessageThread from "@/components/MessageThread"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { conv } = await searchParams

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
    <div className="min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Nav */}
      <nav
        className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: C.anthracite, backgroundColor: C.ink }}
      >
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link href="/dashboard" className="text-sm" style={{ color: C.mist }}>
            ← Mon espace
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
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
              {conversations.map((conv) => {
                const last = conv.messages[0]
                return (
                  <Link
                    key={conv.id}
                    href={`/messages?conv=${conv.id}`}
                    className="block rounded-2xl p-4 transition-all hover:opacity-90"
                    style={{
                      backgroundColor: activeConv?.id === conv.id ? C.anthracite : C.dark,
                      border: `1px solid ${activeConv?.id === conv.id ? C.terra : C.anthracite}`,
                    }}
                  >
                    <p className="font-semibold text-sm mb-1 truncate" style={{ color: C.white }}>
                      {conv.vendorSlug}
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
    </div>
  )
}
