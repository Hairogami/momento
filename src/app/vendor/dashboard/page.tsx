"use client"
import { useEffect, useState } from "react"
import AntNav from "@/components/clone/AntNav"
import Link from "next/link"
import { useSession } from "next-auth/react"

// Dev-mode : cet email a accès au switcher Client ↔ Prestataire
const DEV_SWITCH_EMAIL = "moumene486@gmail.com"

type ContactRequest = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  eventType?: string
  eventDate?: string
  message: string
  status: "pending" | "confirmed" | "declined"
  createdAt: string
}

type DashData = {
  slug: string
  plan: string
  contacts: ContactRequest[]
  stats: {
    totalContacts: number
    pendingContacts: number
    confirmedContacts: number
    totalConversations: number
    responseRate: number
  }
}

const STATUS_CFG = {
  pending:   { label: "En attente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  confirmed: { label: "Confirmé",    color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  declined:  { label: "Refusé",      color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
}

function GsIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontStyle: "normal", fontSize: size, color: color ?? "inherit", lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle" }}>
      {icon}
    </span>
  )
}

export default function VendorDashboardPage() {
  const { data: session } = useSession()
  const canSwitch = session?.user?.email === DEV_SWITCH_EMAIL
  const [data,    setData]    = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/vendor/dashboard")
      .then(r => {
        if (r.status === 401) throw new Error("non-auth")
        if (r.status === 403) throw new Error("non-vendor")
        if (!r.ok) throw new Error("Erreur serveur")
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(contactId: string, status: "confirmed" | "declined") {
    setUpdating(contactId)
    try {
      const res = await fetch("/api/vendor/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, status }),
      })
      if (!res.ok) throw new Error()
      setData(prev => prev ? {
        ...prev,
        contacts: prev.contacts.map(c => c.id === contactId ? { ...c, status } : c),
        stats: {
          ...prev.stats,
          pendingContacts: prev.contacts.filter(c => c.id !== contactId && c.status === "pending").length,
          confirmedContacts: prev.contacts.filter(c => c.id !== contactId && c.status === "confirmed").length + (status === "confirmed" ? 1 : 0),
        },
      } : prev)
    } catch {}
    finally { setUpdating(null) }
  }

  const surf = "var(--dash-surface,#fff)"
  const border = "1px solid var(--dash-border,rgba(183,191,217,0.18))"
  const textMain = "var(--dash-text,#121317)"
  const textMuted = "var(--dash-text-3,#9a9aaa)"

  return (
    <div className="ant-root" style={{ minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <AntNav />

      {/* Dev switcher — retour vers la vue client (moumene486@gmail.com uniquement) */}
      {canSwitch && (
        <Link
          href="/accueil"
          style={{
            position: "fixed", top: 72, left: 24, zIndex: 40,
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            border: "1px dashed var(--g1,#E11D48)",
            color: "var(--dash-text,#121317)",
            fontSize: 12, fontWeight: 600, textDecoration: "none",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
          title="Mode dev — basculer vers le dashboard client"
        >
          <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 15, color: "var(--g1,#E11D48)" }}>swap_horiz</span>
          Vue client
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--g1,#E11D48)", background: "rgba(225,29,72,0.1)", padding: "2px 5px", borderRadius: 4 }}>
            DEV
          </span>
        </Link>
      )}

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GsIcon icon="storefront" size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: textMain, margin: 0 }}>Mon espace pro</h1>
              {data && <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>@{data.slug} · Plan {data.plan}</p>}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: surf, borderRadius: 16, padding: 20, border, height: 80, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* Auth errors */}
        {error === "non-auth" && (
          <div style={{ background: surf, borderRadius: 20, padding: 40, border, textAlign: "center" }}>
            <GsIcon icon="lock" size={40} color="var(--g1,#E11D48)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: "12px 0 8px" }}>Connexion requise</h2>
            <p style={{ color: textMuted, marginBottom: 20 }}>Connecte-toi pour accéder à ton espace prestataire.</p>
            <Link href="/login" style={{ padding: "11px 24px", borderRadius: 999, background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
              Se connecter
            </Link>
          </div>
        )}
        {error === "non-vendor" && (
          <div style={{ background: surf, borderRadius: 20, padding: 40, border, textAlign: "center" }}>
            <GsIcon icon="badge" size={40} color="var(--g1,#E11D48)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: "12px 0 8px" }}>Accès prestataire uniquement</h2>
            <p style={{ color: textMuted, marginBottom: 20 }}>Cet espace est réservé aux prestataires vérifiés. Tu es bien connecté(e) mais ton compte n'est pas encore prestataire.</p>
            <Link href="/explore" style={{ padding: "11px 24px", borderRadius: 999, background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
              Explorer les prestataires
            </Link>
          </div>
        )}
        {error && error !== "non-auth" && error !== "non-vendor" && (
          <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 13, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { icon: "mail",        label: "Demandes totales",   value: data.stats.totalContacts,     color: "var(--g1,#E11D48)" },
                { icon: "pending",     label: "En attente",         value: data.stats.pendingContacts,   color: "#F59E0B" },
                { icon: "check_circle",label: "Confirmées",         value: data.stats.confirmedContacts, color: "#22c55e" },
                { icon: "reply",       label: "Taux de réponse",    value: `${data.stats.responseRate}%`, color: "var(--g2,#9333EA)" },
              ].map(stat => (
                <div key={stat.label} style={{ background: surf, borderRadius: 16, padding: "18px 20px", border }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <GsIcon icon={stat.icon} size={17} color={stat.color} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, margin: 0, backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { icon: "person",   label: "Voir mon profil", href: `/vendor/${data.slug}` },
                { icon: "chat_bubble", label: "Messages",    href: "/messages" },
                { icon: "notifications", label: "Notifications", href: "/notifications" },
                { icon: "settings", label: "Paramètres",     href: "/settings" },
              ].map(l => (
                <Link key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, background: surf, border, textDecoration: "none", color: textMain, fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--g1,#E11D48)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border,rgba(183,191,217,0.18))"}>
                  <GsIcon icon={l.icon} size={15} color="var(--g1,#E11D48)" />{l.label}
                </Link>
              ))}
            </div>

            {/* Contact requests */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textMain, marginBottom: 16 }}>
                Demandes de contact
                {data.stats.pendingContacts > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, background: "rgba(245,158,11,0.12)", color: "#F59E0B", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                    {data.stats.pendingContacts} en attente
                  </span>
                )}
              </h2>

              {data.contacts.length === 0 ? (
                <div style={{ background: surf, borderRadius: 16, padding: "40px 20px", border, textAlign: "center" }}>
                  <GsIcon icon="inbox" size={40} color={textMuted} />
                  <p style={{ fontSize: 14, color: textMuted, margin: "12px 0 0" }}>Aucune demande pour l&apos;instant.</p>
                  <p style={{ fontSize: 12, color: textMuted, margin: "4px 0 0" }}>Elles apparaîtront ici quand des clients vous contacteront depuis votre profil.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.contacts.map(c => {
                    const cfg = STATUS_CFG[c.status]
                    return (
                      <div key={c.id} style={{ background: surf, borderRadius: 16, padding: 20, border }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          {/* Left — client info */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                                {c.clientName.charAt(0)}
                              </div>
                              <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: textMain, margin: 0 }}>{c.clientName}</p>
                                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>{c.clientEmail}{c.clientPhone ? ` · ${c.clientPhone}` : ""}</p>
                              </div>
                            </div>

                            {/* Chips */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                              {c.eventType && (
                                <span style={{ fontSize: 11, background: "rgba(183,191,217,0.12)", color: textMuted, padding: "3px 10px", borderRadius: 99 }}>{c.eventType}</span>
                              )}
                              {c.eventDate && (
                                <span style={{ fontSize: 11, background: "rgba(183,191,217,0.12)", color: textMuted, padding: "3px 10px", borderRadius: 99 }}>
                                  📅 {new Date(c.eventDate).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                              )}
                              <span style={{ fontSize: 11, color: textMuted, padding: "3px 0" }}>
                                {new Date(c.createdAt).toLocaleDateString("fr-MA", { day: "numeric", month: "short" })}
                              </span>
                            </div>

                            <p style={{ fontSize: 13, color: "var(--dash-text-2,#45474D)", margin: 0, lineHeight: 1.6, maxWidth: 500 }}>{c.message}</p>
                          </div>

                          {/* Right — status + actions */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "4px 10px", borderRadius: 99 }}>
                              {cfg.label}
                            </span>

                            {c.status === "pending" && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  disabled={updating === c.id}
                                  onClick={() => updateStatus(c.id, "confirmed")}
                                  style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Confirmer
                                </button>
                                <button
                                  disabled={updating === c.id}
                                  onClick={() => updateStatus(c.id, "declined")}
                                  style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Refuser
                                </button>
                              </div>
                            )}

                            <a href={`mailto:${c.clientEmail}`}
                              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--g1,#E11D48)", textDecoration: "none", fontWeight: 500 }}>
                              <GsIcon icon="mail" size={14} color="var(--g1,#E11D48)" /> Répondre par email
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
