"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type LastMsg = { id: string; content: string; createdAt: string; senderId: string; read: boolean }
type Conversation = {
  id: string
  vendorSlug: string
  clientId: string
  updatedAt: string
  client?: { id: string; name: string; email: string; image: string | null }
  vendor?: { name: string; category: string; slug: string } | null
  messages: LastMsg[]
}
type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
  sender: { id: string; name: string; image: string | null }
}

function initials(label: string) {
  return label.split(" ").map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase()
}
function fmtTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 86_400_000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  if (diff < 604_800_000) return d.toLocaleDateString("fr-FR", { weekday: "short" })
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export default function CloneMessagesPage() {
  const { events, activeEventId } = usePlanners()
  const [myId, setMyId]     = useState<string | null>(null)
  const [convs, setConvs]   = useState<Conversation[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [msgs, setMsgs]     = useState<Message[]>([])
  const [input, setInput]   = useState("")
  const [loadC, setLoadC]   = useState(true)
  const [loadM, setLoadM]   = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  // Get current user ID
  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.id) setMyId(d.id) }).catch(() => {})
  }, [])

  // Fetch conversations
  const fetchConvs = useCallback(async () => {
    try {
      const r = await fetch("/api/messages")
      if (r.ok) setConvs(await r.json().then(d => Array.isArray(d) ? d : []))
    } catch {}
  }, [])

  useEffect(() => { fetchConvs().finally(() => setLoadC(false)) }, [fetchConvs])

  // Fetch messages for active conversation + polling
  const fetchMsgs = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/messages/${id}`)
      if (r.ok) setMsgs(await r.json().then(d => Array.isArray(d) ? d : []))
    } catch {}
  }, [])

  useEffect(() => {
    if (!active) { setMsgs([]); return }
    setLoadM(true)
    fetchMsgs(active).finally(() => setLoadM(false))
    pollRef.current = setInterval(() => fetchMsgs(active), 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [active, fetchMsgs])

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || !active || sending) return
    setSending(true)
    setInput("")
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active, content: text }),
      })
      if (r.ok) {
        const { message } = await r.json()
        setMsgs(prev => [...prev, message])
        setConvs(prev => prev.map(c =>
          c.id === active ? { ...c, messages: [message], updatedAt: message.createdAt } : c
        ))
      }
    } catch {}
    setSending(false)
  }

  const conv = convs.find(c => c.id === active)

  function getLabel(c: Conversation) {
    if (c.vendor?.name) return c.vendor.name
    if (c.client?.name) return c.client.name
    return c.vendorSlug
  }
  function getUnread(c: Conversation) {
    const last = c.messages[0]
    if (!last || !myId) return 0
    return (!last.read && last.senderId !== myId) ? 1 : 0
  }

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Liste conversations */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
          background: "var(--dash-surface,#fff)", display: "flex", flexDirection: "column",
        }} className="clone-surface hidden sm:flex">
          <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.1))" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
            {loadC ? (
              [1,2,3].map(i => (
                <div key={i} style={{ padding: "14px 20px", display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.08))" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.15))", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, width: "60%", borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", marginBottom: 6 }} />
                    <div style={{ height: 8, width: "80%", borderRadius: 4, background: "var(--dash-faint,rgba(183,191,217,0.1))" }} />
                  </div>
                </div>
              ))
            ) : convs.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 32, margin: "0 0 12px" }}>💬</p>
                <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Aucune conversation</p>
              </div>
            ) : convs.map(c => {
              const unread = getUnread(c)
              const label  = getLabel(c)
              return (
                <button key={c.id} onClick={() => setActive(c.id)} style={{
                  width: "100%", padding: "14px 20px",
                  display: "flex", alignItems: "center", gap: 12,
                  background: active === c.id ? "var(--dash-faint,rgba(183,191,217,0.09))" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.08))",
                  borderLeft: active === c.id ? "3px solid var(--g1,#E11D48)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: unread > 0 ? G : "var(--dash-faint-2,rgba(183,191,217,0.15))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: unread > 0 ? "#fff" : "var(--dash-text-2,#6a6a71)",
                  }}>{initials(label)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 500, color: "var(--dash-text,#121317)" }}>{label}</span>
                      <span style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>{fmtTime(c.updatedAt)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                      {c.messages[0]?.content ?? "Nouvelle conversation"}
                    </div>
                  </div>
                  {unread > 0 && (
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: G, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: "#fff",
                    }}>{unread}</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Zone de chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {conv ? (
            <>
              {/* Header */}
              <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
                background: "var(--dash-surface,#fff)", display: "flex", alignItems: "center", gap: 12,
              }} className="clone-surface">
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: G, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{initials(getLabel(conv))}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)" }}>{getLabel(conv)}</div>
                  {conv.vendor?.category && <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>{conv.vendor.category}</div>}
                </div>
                {conv.vendor?.slug && (
                  <Link href={`/vendor/${conv.vendor.slug}`} style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 600,
                    padding: "6px 14px", borderRadius: 999,
                    border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                    color: "var(--dash-text-2,#6a6a71)", textDecoration: "none",
                  }}>
                    Voir le profil
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {loadM ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--dash-text-3,#9a9aaa)", fontSize: 13 }}>Chargement…</div>
                ) : msgs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)" }}>Aucun message. Envoyez le premier !</p>
                  </div>
                ) : msgs.map(msg => {
                  const isMe = msg.senderId === myId
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-start" : "flex-end" }}>
                      <div style={{
                        maxWidth: "70%", padding: "10px 14px", borderRadius: 14,
                        background: isMe ? G : "var(--dash-faint-2,rgba(183,191,217,0.15))",
                        color: isMe ? "#fff" : "var(--dash-text,#121317)",
                        fontSize: 13, lineHeight: 1.5,
                      }}>
                        {msg.content}
                        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
                background: "var(--dash-surface,#fff)", display: "flex", gap: 10, alignItems: "center",
              }} className="clone-surface">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Écrire un message…"
                  disabled={sending}
                  style={{
                    flex: 1, height: 40, padding: "0 16px",
                    border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                    borderRadius: 999, background: "var(--dash-bg,#f7f7fb)",
                    fontSize: 13, color: "var(--dash-text,#121317)", fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: G, border: "none", color: "#fff",
                    cursor: sending || !input.trim() ? "default" : "pointer",
                    opacity: sending || !input.trim() ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
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
                <p style={{ fontSize: 14, color: "var(--dash-text-3,#9a9aaa)" }}>Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
