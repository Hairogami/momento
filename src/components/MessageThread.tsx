"use client"

import { useEffect, useRef, useState } from "react"
import { C } from "@/lib/colors"

interface MessageSender {
  id: string
  name: string | null
  image: string | null
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
  sender: MessageSender
}

interface MessageThreadProps {
  conversationId: string
  currentUserId: string
}

export default function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {
      // silent polling failure
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: input.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erreur lors de l'envoi.")
      } else {
        setInput("")
        await fetchMessages()
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="rounded-2xl flex flex-col"
      style={{
        backgroundColor: C.dark,
        border: `1px solid ${C.anthracite}`,
        minHeight: "420px",
        maxHeight: "600px",
      }}
    >
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: C.mist }}>
            Aucun message. Commencez la conversation !
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
            >
              {!isMine && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${C.terra}20`, color: C.terra }}
                >
                  {(msg.sender.name ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                style={
                  isMine
                    ? { backgroundColor: C.terra, color: "#fff", borderBottomRightRadius: "4px" }
                    : { backgroundColor: C.ink, color: C.white, borderBottomLeftRadius: "4px" }
                }
              >
                <p>{msg.content}</p>
                <p
                  className="text-xs mt-1 opacity-70"
                  style={{ color: isMine ? "#ffd" : C.mist }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 p-4 border-t"
        style={{ borderColor: C.anthracite }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrire un message…"
          disabled={sending}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            backgroundColor: C.ink,
            border: `1.5px solid ${C.anthracite}`,
            color: C.white,
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          {sending ? "…" : "Envoyer"}
        </button>
      </form>
      {error && (
        <p
          className="text-xs px-4 pb-3"
          style={{ color: C.terra }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
