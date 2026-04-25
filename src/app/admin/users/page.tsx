"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

type AdminUser = {
  id:             string
  email:          string
  name:           string | null
  firstName:      string | null
  lastName:       string | null
  companyName:    string | null
  role:           string
  plan:           string
  planExpiresAt:  string | null
  emailVerified:  string | null
  agreedTosAt:    string | null
  marketingOptIn: boolean
  createdAt:      string
  updatedAt:      string
  vendorSlug:     string | null
  _count:         { planners: number; sentMessages: number }
}

const C = {
  bg:         "#0b0b10",
  panel:      "#15161d",
  panelHover: "#1c1d27",
  border:     "#252633",
  borderSoft: "rgba(255,255,255,0.06)",
  text:       "#f0f0f5",
  textMuted:  "#9a9aaa",
  textDim:    "#6a6a78",
  accent:     "#9333EA",
  accent2:    "#E11D48",
  ok:         "#22c55e",
  warn:       "#f59e0b",
  err:        "#ef4444",
  proBadge:   "#facc15",
}

const fmtDate = (s: string | null): string => {
  if (!s) return "—"
  const d = new Date(s)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
const fmtRelative = (s: string | null): string => {
  if (!s) return "—"
  const ms = Date.now() - new Date(s).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days === 0) return "auj."
  if (days === 1) return "hier"
  if (days < 30) return `il y a ${days}j`
  if (days < 365) return `il y a ${Math.floor(days / 30)}mo`
  return `il y a ${Math.floor(days / 365)}a`
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [limit]           = useState(50)
  const [q, setQ]         = useState("")
  const [loading, setLoading] = useState(true)
  const [err, setErr]     = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    try {
      const url = new URL("/api/admin/users", window.location.origin)
      url.searchParams.set("page",  String(page))
      url.searchParams.set("limit", String(limit))
      if (q.trim()) url.searchParams.set("q", q.trim())
      const r = await fetch(url.toString(), { cache: "no-store" })
      if (!r.ok) throw new Error((await r.json()).error ?? "Erreur chargement.")
      const data = await r.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue.")
    } finally {
      setLoading(false)
    }
  }, [page, limit, q])

  useEffect(() => { load() }, [load])

  // Debounce search
  const [qInput, setQInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQ(qInput) }, 350)
    return () => clearTimeout(t)
  }, [qInput])

  async function patchUser(id: string, body: object): Promise<boolean> {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      setActionMsg(`❌ ${d.error ?? "Erreur"}`)
      return false
    }
    return true
  }

  async function changeRole(u: AdminUser, role: string) {
    if (role === u.role) return
    if (!confirm(`Changer le rôle de ${u.email} : ${u.role} → ${role} ?`)) return
    if (await patchUser(u.id, { role })) {
      setActionMsg(`✅ Rôle de ${u.email} → ${role}`)
      load()
    }
  }
  async function changePlan(u: AdminUser, plan: string) {
    if (plan === u.plan) return
    let planExpiresAt: string | null = null
    if (plan === "pro") {
      const days = prompt(`Durée Pro pour ${u.email} ? (jours, défaut 30)`, "30")
      if (days === null) return
      const n = parseInt(days, 10)
      if (!Number.isFinite(n) || n <= 0) { setActionMsg("❌ Durée invalide"); return }
      planExpiresAt = new Date(Date.now() + n * 86_400_000).toISOString()
    }
    if (await patchUser(u.id, { plan, planExpiresAt })) {
      setActionMsg(`✅ Plan de ${u.email} → ${plan}${planExpiresAt ? ` (expire ${fmtDate(planExpiresAt)})` : ""}`)
      load()
    }
  }
  async function suspend(u: AdminUser) {
    if (!confirm(`Suspendre l'abonnement Pro de ${u.email} ?\n→ downgrade à free + planExpiresAt: null`)) return
    if (await patchUser(u.id, { action: "suspend" })) {
      setActionMsg(`✅ Abonnement de ${u.email} suspendu`)
      load()
    }
  }
  async function resetPassword(u: AdminUser) {
    if (!confirm(`Envoyer un e-mail de reset mdp à ${u.email} ?`)) return
    const r = await fetch(`/api/admin/users/${u.id}/reset-password`, { method: "POST" })
    if (r.ok) setActionMsg(`✅ E-mail de reset envoyé à ${u.email}`)
    else      setActionMsg(`❌ ${(await r.json()).error ?? "Erreur"}`)
  }
  async function eject(u: AdminUser) {
    if (!confirm(`Éjecter ${u.email} ?\n→ supprime sessions DB + accounts OAuth.\nNote: JWT credentials reste valide jusqu'à expiration.`)) return
    const r = await fetch(`/api/admin/users/${u.id}/eject`, { method: "POST" })
    if (r.ok) {
      const d = await r.json()
      setActionMsg(`✅ ${u.email} éjecté (sessions: ${d.sessionsDeleted}, OAuth: ${d.accountsDeleted})`)
    } else setActionMsg(`❌ ${(await r.json()).error ?? "Erreur"}`)
  }
  async function deleteUser(u: AdminUser) {
    if (!confirm(`⚠️ SUPPRIMER DÉFINITIVEMENT ${u.email} ?\nCascade : planners, messages, reviews, etc. Action IRRÉVERSIBLE.`)) return
    if (!confirm(`Confirme une dernière fois : SUPPRIMER ${u.email} ?`)) return
    const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
    if (r.ok) { setActionMsg(`✅ ${u.email} supprimé`); load() }
    else      setActionMsg(`❌ ${(await r.json()).error ?? "Erreur"}`)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Users
            </h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
              {total} comptes · page {page}/{totalPages}
            </p>
          </div>
          <Link href="/admin/vendors" style={{ fontSize: 13, color: C.textMuted, textDecoration: "none" }}>
            ← Vendors
          </Link>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={qInput}
            onChange={e => setQInput(e.target.value)}
            placeholder="Rechercher par e-mail, nom, prénom, entreprise…"
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              background: C.panel, color: C.text, fontSize: 14,
              border: `1px solid ${C.border}`, outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Action toast */}
        {actionMsg && (
          <div style={{
            background: C.panel, border: `1px solid ${C.border}`,
            padding: "10px 14px", borderRadius: 10, fontSize: 13,
            marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Table */}
        <div style={{
          background: C.panel, borderRadius: 14,
          border: `1px solid ${C.border}`, overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>Chargement…</div>
          ) : err ? (
            <div style={{ padding: 60, textAlign: "center", color: C.err, fontSize: 14 }}>{err}</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>Aucun user.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.panelHover, borderBottom: `1px solid ${C.border}` }}>
                    {["User", "Rôle", "Plan", "Expire", "Vérif", "Inscrit", "Actif", "Activité", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: C.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => <UserRow key={u.id} u={u} onRole={changeRole} onPlan={changePlan} onSuspend={suspend} onReset={resetPassword} onEject={eject} onDelete={deleteUser} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pagBtn(page === 1)}>← Préc</button>
            <span style={{ padding: "8px 14px", fontSize: 13, color: C.textMuted }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pagBtn(page === totalPages)}>Suiv →</button>
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({ u, onRole, onPlan, onSuspend, onReset, onEject, onDelete }: {
  u: AdminUser
  onRole:    (u: AdminUser, role: string) => void
  onPlan:    (u: AdminUser, plan: string) => void
  onSuspend: (u: AdminUser) => void
  onReset:   (u: AdminUser) => void
  onEject:   (u: AdminUser) => void
  onDelete:  (u: AdminUser) => void
}) {
  const displayName = useMemo(() => {
    if (u.companyName) return u.companyName
    const fn = [u.firstName, u.lastName].filter(Boolean).join(" ")
    return fn || u.name || "—"
  }, [u])

  // last payment date approx : si plan=pro, planExpiresAt - 30j
  const lastPayment = u.plan === "pro" && u.planExpiresAt
    ? fmtDate(new Date(new Date(u.planExpiresAt).getTime() - 30 * 86_400_000).toISOString())
    : "—"

  return (
    <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
      <td style={td}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600 }}>{displayName}</span>
          <span style={{ color: C.textDim, fontSize: 12 }}>{u.email}</span>
          {u.vendorSlug && <span style={{ color: C.accent, fontSize: 10 }}>vendor: {u.vendorSlug}</span>}
        </div>
      </td>
      <td style={td}>
        <select value={u.role} onChange={e => onRole(u, e.target.value)} style={selectStyle}>
          <option value="client">client</option>
          <option value="vendor">vendor</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td style={td}>
        <select value={u.plan} onChange={e => onPlan(u, e.target.value)} style={{ ...selectStyle, color: u.plan === "pro" ? C.proBadge : C.text }}>
          <option value="free">free</option>
          <option value="pro">pro</option>
        </select>
      </td>
      <td style={{ ...td, color: C.textMuted, whiteSpace: "nowrap" }}>{fmtDate(u.planExpiresAt)}</td>
      <td style={td}>
        {u.emailVerified
          ? <span style={{ color: C.ok }}>✓</span>
          : <span style={{ color: C.warn }}>⚠</span>}
      </td>
      <td style={{ ...td, color: C.textMuted, whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</td>
      <td style={{ ...td, color: C.textMuted, whiteSpace: "nowrap" }} title={`Dernier paiement approx.: ${lastPayment} · MAJ profil: ${fmtDate(u.updatedAt)}`}>
        {fmtRelative(u.updatedAt)}
      </td>
      <td style={{ ...td, color: C.textDim, fontSize: 11 }}>
        {u._count.planners}p · {u._count.sentMessages}m
      </td>
      <td style={td}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => onReset(u)}   style={actionBtn("ok")}   title="Envoyer un e-mail de reset mdp">🔑</button>
          <button onClick={() => onSuspend(u)} style={actionBtn("warn")} title="Suspendre l'abonnement (downgrade free)" disabled={u.plan !== "pro"}>⏸</button>
          <button onClick={() => onEject(u)}   style={actionBtn("warn")} title="Éjecter (supprimer sessions + OAuth)">↗</button>
          <button onClick={() => onDelete(u)}  style={actionBtn("err")}  title="Supprimer définitivement le compte">🗑</button>
        </div>
      </td>
    </tr>
  )
}

const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" }
const selectStyle: React.CSSProperties = {
  background: C.bg, color: C.text, border: `1px solid ${C.border}`,
  padding: "5px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer",
  fontFamily: "inherit",
}
const pagBtn = (disabled: boolean): React.CSSProperties => ({
  background: C.panel, color: disabled ? C.textDim : C.text,
  border: `1px solid ${C.border}`, padding: "8px 14px", borderRadius: 8,
  fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
  fontFamily: "inherit",
})
const actionBtn = (variant: "ok" | "warn" | "err"): React.CSSProperties => {
  const colors = { ok: C.ok, warn: C.warn, err: C.err }
  return {
    background: "transparent", color: colors[variant],
    border: `1px solid ${colors[variant]}40`, padding: "5px 8px",
    borderRadius: 6, fontSize: 13, cursor: "pointer",
    fontFamily: "inherit", lineHeight: 1, transition: "background 0.15s",
  }
}
