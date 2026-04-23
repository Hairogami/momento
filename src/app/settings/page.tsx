"use client"
import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import PageSkeleton from "@/components/clone/PageSkeleton"


const PALETTES = [
  { id: "default", g1: "#E11D48", g2: "#9333EA", label: "Rose · Violet" },
  { id: "ocean",   g1: "#0EA5E9", g2: "#6366F1", label: "Océan" },
  { id: "sunset",  g1: "#F97316", g2: "#EF4444", label: "Sunset" },
  { id: "forest",  g1: "#10B981", g2: "#059669", label: "Forêt" },
  { id: "noir",    g1: "#1F2937", g2: "#4B5563", label: "Noir" },
  { id: "gold",    g1: "#D97706", g2: "#92400E", label: "Or" },
]

const CITIES = [
  "Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda","Kénitra","Tétouan",
  "Salé","Mohammédia","Safi","El Jadida","Béni Mellal","Nador","Khouribga","Settat","Larache","Khémisset",
  "Errachidia","Essaouira","Ouarzazate","Taza","Berkane","Khénifra","Taroudant","Guelmim","Berrechid","Sidi Slimane",
  "Chefchaouen","Ifrane","Taourirt","Sefrou","Tan-Tan","Dakhla","Laâyoune","Al Hoceïma","Azrou","Midelt","Asilah",
]

const NOTIF_TYPES: Array<{ key: "messages" | "contact" | "reminders" | "promo"; label: string }> = [
  { key: "messages",  label: "Nouveaux messages" },
  { key: "contact",   label: "Demandes de contact" },
  { key: "reminders", label: "Rappels événement" },
  { key: "promo",     label: "Promotions Momento" },
]

type NotifPrefs = Record<"messages" | "contact" | "reminders" | "promo", boolean>
type Settings = {
  theme: "light" | "dark" | "auto"
  palette: string
  language: "fr" | "en" | "ar"
  notifEmail: NotifPrefs
  notifPush:  NotifPrefs
  twoFactorEnabled: boolean
  isOnVacation: boolean
  vacationMessage: string | null
  serviceCities: string[]
  unavailableDates: string[]
}
type Me = { id: string; email: string; name?: string; role?: string; image?: string }

function GsIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontStyle: "normal", fontSize: size, color: color ?? "inherit", lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle" }}>
      {icon}
    </span>
  )
}

const cardStyle: React.CSSProperties = {
  background: "var(--dash-surface,#fff)",
  border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
  borderRadius: 20, padding: "24px 22px", marginBottom: 16,
}
const inputStyle: React.CSSProperties = {
  height: 42, padding: "0 12px", borderRadius: 10,
  border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
  background: "var(--dash-input-bg,#fafafa)",
  fontSize: 13, color: "var(--dash-text,#121317)",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%",
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "var(--dash-text-2,#6a6a71)",
  textTransform: "uppercase", letterSpacing: "0.05em",
}
const btnPrimary: React.CSSProperties = {
  height: 42, padding: "0 22px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
}
const btnSecondary: React.CSSProperties = {
  height: 42, padding: "0 18px", borderRadius: 10,
  background: "var(--dash-surface,#fff)",
  border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
  color: "var(--dash-text,#121317)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0,
        background: on ? "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))" : "var(--dash-border,rgba(183,191,217,0.5))",
        position: "relative", transition: "background 0.2s" }}
      aria-label="Toggle"
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { events, activeEventId } = usePlanners()
  const [me, setMe] = useState<Me | null>(null)
  const [s, setS]   = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const flashTimer = useRef<NodeJS.Timeout | null>(null)

  // Sécurité
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwErr, setPwErr] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  // RGPD
  const [delOpen, setDelOpen] = useState(false)
  const [delConfirm, setDelConfirm] = useState("")
  const [delPassword, setDelPassword] = useState("")
  const [delErr, setDelErr] = useState("")
  const [delSaving, setDelSaving] = useState(false)

  // City picker
  const [cityQuery, setCityQuery] = useState("")
  const [dateInput, setDateInput] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([meData, settingsData]) => {
      setMe(meData)
      setS({
        theme: settingsData.theme ?? "auto",
        palette: settingsData.palette ?? "default",
        language: settingsData.language ?? "fr",
        notifEmail: settingsData.notifEmail ?? { messages: true, contact: true, reminders: true, promo: false },
        notifPush:  settingsData.notifPush  ?? { messages: true, contact: true, reminders: false, promo: false },
        twoFactorEnabled: settingsData.twoFactorEnabled ?? false,
        isOnVacation: settingsData.isOnVacation ?? false,
        vacationMessage: settingsData.vacationMessage ?? "",
        serviceCities: settingsData.serviceCities ?? [],
        unavailableDates: (settingsData.unavailableDates ?? []).map((d: string) => d.slice(0, 10)),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Apply theme immediately + sync localStorage so AntNav et toutes les pages le lisent
  useEffect(() => {
    if (!s) return
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
    const isDark = s.theme === "dark" || (s.theme === "auto" && prefersDark)
    document.documentElement.classList.toggle("clone-dark", isDark)
    document.documentElement.classList.toggle("dark", isDark)
    try {
      localStorage.setItem("momento_clone_dark_mode", JSON.stringify(isDark))
      localStorage.setItem("momento_clone_theme_pref", s.theme) // pour retrouver "auto" au rechargement
    } catch {}
  }, [s])

  // Apply palette immediately
  useEffect(() => {
    if (!s) return
    const p = PALETTES.find(p => p.id === s.palette) ?? PALETTES[0]
    document.documentElement.style.setProperty("--g1", p.g1)
    document.documentElement.style.setProperty("--g2", p.g2)
    try { localStorage.setItem("momento_clone_palette", JSON.stringify({ g1: p.g1, g2: p.g2 })) } catch {}
  }, [s])

  function flash(msg: string) {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setSavedFlash(msg)
    flashTimer.current = setTimeout(() => setSavedFlash(null), 2500)
  }

  async function patchSettings(partial: Partial<Settings>) {
    if (!s) return
    const next = { ...s, ...partial }
    setS(next)
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    })
    if (res.ok) flash("✓ Paramètre sauvegardé")
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr("")
    if (newPw !== confirmPw) { setPwErr("Les mots de passe ne correspondent pas."); return }
    if (newPw.length < 8) { setPwErr("Minimum 8 caractères."); return }
    setPwSaving(true)
    const res = await fetch("/api/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    setPwSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setPwErr(d.error ?? "Mot de passe actuel incorrect."); return
    }
    setCurrentPw(""); setNewPw(""); setConfirmPw("")
    flash("✓ Mot de passe modifié")
    setPwOpen(false)
  }

  async function exportData() {
    const res = await fetch("/api/settings/export-data")
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `momento-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    flash("✓ Export téléchargé")
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setDelErr(""); setDelSaving(true)
    const res = await fetch("/api/settings/delete-account", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: delConfirm, password: delPassword }),
    })
    setDelSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setDelErr(d.error ?? "Erreur."); return
    }
    await signOut({ redirect: false })
    router.push("/")
  }

  function addCity(city: string) {
    if (!s || s.serviceCities.includes(city)) return
    patchSettings({ serviceCities: [...s.serviceCities, city] })
    setCityQuery("")
  }
  function removeCity(city: string) {
    if (!s) return
    patchSettings({ serviceCities: s.serviceCities.filter(c => c !== city) })
  }
  function addDate() {
    if (!s || !dateInput) return
    if (s.unavailableDates.includes(dateInput)) return
    patchSettings({ unavailableDates: [...s.unavailableDates, dateInput].sort() })
    setDateInput("")
  }
  function removeDate(d: string) {
    if (!s) return
    patchSettings({ unavailableDates: s.unavailableDates.filter(x => x !== d) })
  }

  const isVendor = me?.role === "vendor"
  const cityMatches = cityQuery.length >= 1
    ? CITIES.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase()) && !s?.serviceCities.includes(c)).slice(0, 6)
    : []

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "32px 24px 80px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Paramètres
        </h1>
        <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 24px" }}>
          Gère tes préférences, ta sécurité et tes données.
        </p>

        {savedFlash && (
          <div style={{ position: "fixed", top: 80, right: 24, zIndex: 100, padding: "10px 16px", borderRadius: 12, background: "rgba(34,197,94,0.95)", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            {savedFlash}
          </div>
        )}

        {loading || !s ? (
          <PageSkeleton variant="list" />
        ) : (
          <>
            {/* ── 1. Apparence ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "var(--dash-text,#121317)", display: "flex", alignItems: "center", gap: 8 }}>
                <GsIcon icon="palette" size={18} color="var(--g1)" /> Apparence
              </h2>

              <div style={{ marginBottom: 18 }}>
                <p style={labelStyle}>Thème</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {(["light","dark","auto"] as const).map(t => (
                    <button key={t} onClick={() => patchSettings({ theme: t })}
                      style={{
                        flex: 1, height: 42, borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: s.theme === t ? "2px solid var(--g1,#E11D48)" : "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                        background: s.theme === t ? "rgba(225,29,72,0.06)" : "var(--dash-surface,#fff)",
                        color: "var(--dash-text,#121317)",
                      }}>
                      {t === "light" ? "☀ Clair" : t === "dark" ? "🌙 Sombre" : "⚙ Auto"}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={labelStyle}>Palette de couleurs</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 8 }}>
                  {PALETTES.map(p => (
                    <button key={p.id} onClick={() => patchSettings({ palette: p.id })}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                        border: s.palette === p.id ? "2px solid var(--dash-text,#121317)" : "1px solid var(--dash-border,rgba(183,191,217,0.4))",
                        background: "var(--dash-surface,#fff)", fontFamily: "inherit", fontSize: 12, fontWeight: 500, color: "var(--dash-text,#121317)",
                      }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`, flexShrink: 0 }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={labelStyle}>Langue</p>
                <select value={s.language} onChange={e => patchSettings({ language: e.target.value as "fr" | "en" | "ar" })}
                  style={{ ...inputStyle, marginTop: 8, cursor: "pointer" }}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            {/* ── 2. Notifications ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "var(--dash-text,#121317)", display: "flex", alignItems: "center", gap: 8 }}>
                <GsIcon icon="notifications" size={18} color="var(--g1)" /> Notifications
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px 16px", alignItems: "center" }}>
                <span />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Push</span>
                {NOTIF_TYPES.map(n => (
                  <React.Fragment key={n.key}>
                    <span style={{ fontSize: 13, color: "var(--dash-text,#121317)" }}>{n.label}</span>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Toggle on={s.notifEmail[n.key]} onChange={v => patchSettings({ notifEmail: { ...s.notifEmail, [n.key]: v } })} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Toggle on={s.notifPush[n.key]} onChange={v => patchSettings({ notifPush: { ...s.notifPush, [n.key]: v } })} />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── 3. Sécurité ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "var(--dash-text,#121317)", display: "flex", alignItems: "center", gap: 8 }}>
                <GsIcon icon="shield" size={18} color="var(--g1)" /> Sécurité
              </h2>

              {/* Change password collapsible */}
              <button onClick={() => setPwOpen(v => !v)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--dash-faint-2,#f4f4f8)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--dash-text,#121317)", marginBottom: 10 }}>
                <span style={{ fontWeight: 500 }}>Changer le mot de passe</span>
                <GsIcon icon={pwOpen ? "expand_less" : "expand_more"} size={18} />
              </button>
              {pwOpen && (
                <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 4px 18px" }}>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Mot de passe actuel" required style={inputStyle} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nouveau (min 8)" required minLength={8} style={inputStyle} />
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirmer" required style={inputStyle} />
                  </div>
                  {pwErr && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{pwErr}</p>}
                  <button type="submit" disabled={pwSaving} style={{ ...btnPrimary, opacity: pwSaving ? 0.7 : 1 }}>
                    {pwSaving ? "Modification…" : "Modifier"}
                  </button>
                </form>
              )}

              {/* 2FA toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, background: "var(--dash-faint-2,#f4f4f8)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "var(--dash-text,#121317)" }}>Authentification à 2 facteurs</p>
                  <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: "2px 0 0" }}>Bientôt disponible</p>
                </div>
                <Toggle on={s.twoFactorEnabled} onChange={v => patchSettings({ twoFactorEnabled: v })} />
              </div>

              <Link href="/forgot-password" style={{ display: "block", padding: "10px 14px", borderRadius: 10, background: "var(--dash-faint-2,#f4f4f8)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", textDecoration: "none", color: "var(--dash-text,#121317)", fontSize: 13 }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* ── 4. Vendor only ── */}
            {isVendor && (
              <div style={cardStyle}>
                <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "var(--dash-text,#121317)", display: "flex", alignItems: "center", gap: 8 }}>
                  <GsIcon icon="storefront" size={18} color="var(--g1)" /> Espace prestataire
                </h2>

                {/* Mode vacances */}
                <div style={{ padding: "14px", borderRadius: 12, background: s.isOnVacation ? "rgba(245,158,11,0.08)" : "var(--dash-faint-2,#f4f4f8)", border: `1px solid ${s.isOnVacation ? "rgba(245,158,11,0.35)" : "var(--dash-border,rgba(183,191,217,0.2))"}`, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: s.isOnVacation ? 12 : 0 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--dash-text,#121317)" }}>🌴 Mode vacances</p>
                      <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: "2px 0 0" }}>Masque ton profil et bloque les nouvelles demandes</p>
                    </div>
                    <Toggle on={s.isOnVacation} onChange={v => patchSettings({ isOnVacation: v })} />
                  </div>
                  {s.isOnVacation && (
                    <textarea value={s.vacationMessage ?? ""} onChange={e => setS({ ...s, vacationMessage: e.target.value })}
                      onBlur={() => patchSettings({ vacationMessage: s.vacationMessage })}
                      placeholder="Message affiché aux clients (ex: De retour le 15 août)"
                      maxLength={500}
                      style={{ ...inputStyle, height: 60, padding: "10px 12px", resize: "vertical" }} />
                  )}
                </div>

                {/* Disponibilités */}
                <div style={{ marginBottom: 14 }}>
                  <p style={labelStyle}>Dates indisponibles</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 10 }}>
                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={addDate} disabled={!dateInput} style={{ ...btnSecondary, opacity: dateInput ? 1 : 0.5 }}>Bloquer</button>
                  </div>
                  {s.unavailableDates.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {s.unavailableDates.map(d => (
                        <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 99, background: "rgba(225,29,72,0.08)", color: "var(--g1,#E11D48)", fontSize: 12 }}>
                          {new Date(d).toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" })}
                          <button onClick={() => removeDate(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Zones de service */}
                <div>
                  <p style={labelStyle}>Zones de service</p>
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <input value={cityQuery} onChange={e => setCityQuery(e.target.value)} placeholder="Rechercher une ville…" style={inputStyle} />
                    {cityMatches.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 10, overflow: "hidden", zIndex: 10, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
                        {cityMatches.map(c => (
                          <button key={c} onClick={() => addCity(c)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--dash-text,#121317)" }}>
                            + {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {s.serviceCities.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {s.serviceCities.map(c => (
                        <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 99, background: "linear-gradient(135deg, rgba(225,29,72,0.08), rgba(147,51,234,0.08))", color: "var(--dash-text,#121317)", fontSize: 12, fontWeight: 500 }}>
                          📍 {c}
                          <button onClick={() => removeCity(c)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-3,#9a9aaa)", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 5. Données & RGPD ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px", color: "var(--dash-text,#121317)", display: "flex", alignItems: "center", gap: 8 }}>
                <GsIcon icon="lock" size={18} color="var(--g1)" /> Mes données
              </h2>

              <button onClick={exportData} style={{ ...btnSecondary, width: "100%", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <GsIcon icon="download" size={16} /> Exporter mes données (JSON)
              </button>

              <button onClick={() => setDelOpen(true)} style={{ ...btnSecondary, width: "100%", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
                Supprimer mon compte
              </button>

              {delOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setDelOpen(false)}>
                  <div onClick={e => e.stopPropagation()} style={{ background: "var(--dash-surface,#fff)", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--dash-text,#121317)" }}>Supprimer ton compte ?</h3>
                    <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 18px" }}>
                      Cette action est <strong>irréversible</strong>. Tous tes événements, conversations et favoris seront supprimés.
                    </p>
                    <form onSubmit={deleteAccount} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Tape SUPPRIMER pour confirmer</label>
                        <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)} required style={{ ...inputStyle, marginTop: 6 }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Mot de passe (si applicable)</label>
                        <input type="password" value={delPassword} onChange={e => setDelPassword(e.target.value)} style={{ ...inputStyle, marginTop: 6 }} />
                      </div>
                      {delErr && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{delErr}</p>}
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button type="button" onClick={() => setDelOpen(false)} style={{ ...btnSecondary, flex: 1 }}>Annuler</button>
                        <button type="submit" disabled={delSaving || delConfirm !== "SUPPRIMER"} style={{ ...btnPrimary, flex: 1, background: "#ef4444", opacity: (delSaving || delConfirm !== "SUPPRIMER") ? 0.5 : 1 }}>
                          {delSaving ? "Suppression…" : "Supprimer définitivement"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* ── Légal ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--dash-text,#121317)" }}>Légal</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Conditions d'utilisation", href: "/cgu" },
                  { label: "Mentions légales",         href: "/mentions-legales" },
                  { label: "Politique de confidentialité", href: "/confidentialite" },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--dash-faint-2,#f4f4f8)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))", textDecoration: "none", color: "var(--dash-text,#121317)", fontSize: 13 }}>
                    <span>{l.label}</span>
                    <span style={{ color: "var(--dash-text-3,#9a9aaa)" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
