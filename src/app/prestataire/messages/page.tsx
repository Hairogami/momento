import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MessageThread from "@/components/MessageThread"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default async function VendorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { conv } = await searchParams

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "vendor") redirect("/dashboard")

  const conversations = await prisma.conversation.findMany({
    where: { vendorSlug: user.vendorSlug ?? "" },
    include: {
      client: { select: { id: true, name: true, email: true, image: true } },
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
          <Link href="/prestataire/dashboard" className="text-sm" style={{ color: C.mist }}>
            ← Tableau de bord
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold mb-1" style={{ color: C.white }}>
          Messagerie
        </h1>
        <p className="text-sm mb-8" style={{ color: C.mist }}>
          Répondez aux demandes de vos clients
        </p>

        {conversations.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
          >
            <p className="text-base font-medium mb-2" style={{ color: C.white }}>
              Aucun message pour l&apos;instant
            </p>
            <p className="text-sm" style={{ color: C.mist }}>
              Les clients qui vous contactent apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              {conversations.map((conv) => {
                const last = conv.messages[0]
                const clientName = conv.client?.name ?? conv.client?.email ?? "Client"
                return (
                  <Link
                    key={conv.id}
                    href={`/prestataire/messages?conv=${conv.id}`}
                    className="block rounded-2xl p-4 transition-all hover:opacity-90"
                    style={{
                      backgroundColor: activeConv?.id === conv.id ? C.anthracite : C.dark,
                      border: `1px solid ${activeConv?.id === conv.id ? C.terra : C.anthracite}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      {conv.client?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conv.client.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
                        >
                          {clientName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-semibold text-sm truncate" style={{ color: C.white }}>
                        {clientName}
                      </p>
                    </div>
                    {last ? (
                      <p className="text-xs truncate pl-11" style={{ color: C.mist }}>
                        {last.content}
                      </p>
                    ) : (
                      <p className="text-xs italic pl-11" style={{ color: C.mist }}>
                        Aucun message
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Thread */}
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
