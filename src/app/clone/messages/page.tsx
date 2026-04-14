"use client"
import { useState } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
const EVENTS = [
  { id: "1", name: "Mariage Yasmine & Karim",  date: "2026-09-15", color: "#E11D48" },
  { id: "2", name: "Mariage Sara & Adam",       date: "2026-06-21", color: "#7b5ea7" },
]

type Conversation = { id: string; vendor: string; avatar: string; lastMsg: string; time: string; unread: number; category: string }

const CONVERSATIONS: Conversation[] = [
  { id: "c1", vendor: "Studio Lumière",  avatar: "SL", lastMsg: "Parfait ! On confirme le 15 septembre.",           time: "10:32", unread: 2, category: "Photographe"  },
  { id: "c2", vendor: "DJ Karim Beat",   avatar: "DK", lastMsg: "Avez-vous une playlist de référence à partager ?", time: "Hier",  unread: 1, category: "DJ"            },
  { id: "c3", vendor: "Traiteur El Bab", avatar: "TE", lastMsg: "La dégustation est prévue pour le 2 mai.",         time: "Lun",   unread: 0, category: "Traiteur"      },
  { id: "c4", vendor: "Villa Majorelle", avatar: "VM", lastMsg: "Votre demande de visite a été reçue.",             time: "Dim",   unread: 0, category: "Lieu"          },
]

export default function CloneMessagesPage() {
  const [active, setActive] = useState<string | null>("c1")
  const [input, setInput] = useState("")
  const conv = CONVERSATIONS.find(c => c.id === active)

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "#f7f7fb" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={EVENTS} activeEventId="1" onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Conversation list */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: "1px solid rgba(183,191,217,0.15)",
          background: "#fff", display: "flex", flexDirection: "column",
        }} className="clone-surface hidden sm:flex">
          <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid rgba(183,191,217,0.1)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#121317", margin: 0 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
            {CONVERSATIONS.map(c => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                style={{
                  width: "100%", padding: "14px 20px",
                  display: "flex", alignItems: "center", gap: 12,
                  background: active === c.id ? "rgba(183,191,217,0.09)" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  borderBottom: "1px solid rgba(183,191,217,0.08)",
                  borderLeft: active === c.id ? `3px solid var(--g1,#E11D48)` : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: c.unread > 0 ? G : "rgba(183,191,217,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: c.unread > 0 ? "#fff" : "#45474D",
                }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: c.unread > 0 ? 700 : 500, color: "#121317" }}>{c.vendor}</span>
                    <span style={{ fontSize: 10, color: "#9a9aaa" }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#9a9aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                    {c.lastMsg}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: G, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#fff",
                  }}>{c.unread}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {conv ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid rgba(183,191,217,0.12)",
                background: "#fff", display: "flex", alignItems: "center", gap: 12,
              }} className="clone-surface">
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: G, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{conv.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#121317" }}>{conv.vendor}</div>
                  <div style={{ fontSize: 11, color: "#9a9aaa" }}>{conv.category}</div>
                </div>
                <Link href={`/clone/vendor/${conv.id}`} style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 600,
                  padding: "6px 14px", borderRadius: 999,
                  border: "1px solid rgba(183,191,217,0.25)",
                  color: "#45474D", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  Voir le profil
                </Link>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Mock messages */}
                {[
                  { from: "vendor", text: "Bonjour ! J'ai bien reçu votre demande pour le 15 septembre 2026.", time: "10:15" },
                  { from: "user",   text: "Bonjour, oui nous cherchons un photographe pour notre mariage. Êtes-vous disponible ?", time: "10:18" },
                  { from: "vendor", text: conv.lastMsg, time: conv.time },
                ].map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 14px", borderRadius: 14,
                      background: msg.from === "user" ? G : "rgba(183,191,217,0.12)",
                      color: msg.from === "user" ? "#fff" : "#121317",
                      fontSize: 13, lineHeight: 1.5,
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(183,191,217,0.12)",
                background: "#fff", display: "flex", gap: 10, alignItems: "center",
              }} className="clone-surface">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setInput("")}
                  placeholder="Écrire un message..."
                  style={{
                    flex: 1, height: 40, padding: "0 16px",
                    border: "1px solid rgba(183,191,217,0.25)",
                    borderRadius: 999, background: "#fafafa",
                    fontSize: 13, color: "#121317", fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => setInput("")}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: G, border: "none", color: "#fff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Google Symbols','Material Symbols Outlined'",
                    fontSize: 18, fontWeight: "normal",
                  }}
                >send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: 14, color: "#9a9aaa" }}>Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
