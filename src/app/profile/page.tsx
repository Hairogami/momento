"use client"
import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react"
import { useSession } from "next-auth/react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"


type Me = {
  id: string
  email: string
  name?: string
  image?: string
  role?: string
  phone?: string
  location?: string
  companyName?: string
}

function GsIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal", fontStyle: "normal", fontSize: size, color: color ?? "inherit", lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle" }}>
      {icon}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  height: 46, padding: "0 14px", borderRadius: 12,
  border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
  background: "var(--dash-input-bg,#fafafa)",
  fontSize: 14, color: "var(--dash-text,#121317)",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%",
}
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "var(--dash-text-2,#6a6a71)",
  textTransform: "uppercase", letterSpacing: "0.05em",
}
const cardStyle: React.CSSProperties = {
  background: "var(--dash-surface,#fff)",
  border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
  borderRadius: 20, padding: "28px 24px", marginBottom: 20,
}

export default function ProfilePage() {
  const { update: updateSession } = useSession()
  const { events, activeEventId } = usePlanners()
  const [me, setMe]               = useState<Me | null>(null)
  const [loading, setLoading]     = useState(true)

  // Profile fields
  const [name, setName]               = useState("")
  const [phone, setPhone]             = useState("")
  const [location, setLocation]       = useState("")
  const [companyName, setCompanyName] = useState("")
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [profileErr, setProfileErr]   = useState("")

  // Avatar
  const fileRef                         = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null)
  const [uploading, setUploading]       = useState(false)
  const [uploadErr, setUploadErr]       = useState("")

  // Change password
  const [pwSection, setPwSection]         = useState(false)
  const [currentPw, setCurrentPw]         = useState("")
  const [newPw, setNewPw]                 = useState("")
  const [confirmPw, setConfirmPw]         = useState("")
  const [pwSaving, setPwSaving]           = useState(false)
  const [pwSaved, setPwSaved]             = useState(false)
  const [pwErr, setPwErr]                 = useState("")

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then((d: Me) => {
      setMe(d)
      setName(d.name ?? "")
      setPhone(d.phone ?? "")
      setLocation(d.location ?? "")
      setCompanyName(d.companyName ?? "")
      setAvatarUrl(d.image ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr(""); setUploading(true)

    // Preview immediat
    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { setUploadErr(data.error ?? "Erreur upload."); setAvatarUrl(me?.image ?? null); return }

      setAvatarUrl(data.url)
      // Sauvegarder l'URL dans le profil
      await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url }),
      })
      // Sync JWT
      await updateSession({ picture: data.url })
    } catch {
      setUploadErr("Erreur lors de l'upload."); setAvatarUrl(me?.image ?? null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setProfileErr(""); setSaving(true)
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, location, companyName }),
    })
    setSaving(false)
    if (!res.ok) { setProfileErr("Erreur lors de la mise à jour."); return }
    setSaved(true)
    // Sync JWT pour que AntNav affiche le bon nom
    await updateSession({ name })
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault()
    setPwErr("")
    if (newPw !== confirmPw) { setPwErr("Les mots de passe ne correspondent pas."); return }
    if (newPw.length < 8)    { setPwErr("Minimum 8 caractères."); return }
    setPwSaving(true)
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    setPwSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setPwErr(d.error ?? "Mot de passe actuel incorrect."); return
    }
    setPwSaved(true)
    setCurrentPw(""); setNewPw(""); setConfirmPw("")
    setTimeout(() => { setPwSaved(false); setPwSection(false) }, 3000)
  }

  const initials = (me?.name ?? me?.email ?? "U")[0].toUpperCase()
  const isVendor = me?.role === "vendor"

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "32px 24px", maxWidth: 620, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Mon profil
        </h1>
        <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 28px" }}>
          Gérer tes informations personnelles et ta sécurité.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--dash-text-3,#9a9aaa)", fontSize: 14 }}>Chargement…</div>
        ) : (
          <>
            {/* ── Avatar ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 20px" }}>
                Photo de profil
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--dash-border,rgba(183,191,217,0.3))" }}
                    />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 700 }}>
                      {initials}
                    </div>
                  )}
                  {uploading && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 20, height: 20, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 999, border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", background: "var(--dash-surface,#fff)", color: "var(--dash-text,#121317)", fontSize: 13, fontWeight: 600, cursor: uploading ? "wait" : "pointer", fontFamily: "inherit" }}
                  >
                    <GsIcon icon="upload" size={15} /> {uploading ? "Upload…" : "Changer la photo"}
                  </button>
                  <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: "6px 0 0" }}>
                    JPG, PNG, WebP — max 5 Mo
                  </p>
                  {uploadErr && <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{uploadErr}</p>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>
            </div>

            {/* ── Infos perso ── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 20px" }}>
                Informations personnelles
              </h2>
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>Prénom / Nom</label>
                    <input
                      value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>Adresse e-mail</label>
                  <input value={me?.email ?? ""} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>Téléphone</label>
                    <input
                      value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6…" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>Ville</label>
                    <input
                      value={location} onChange={e => setLocation(e.target.value)} placeholder="Casablanca" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                    />
                  </div>
                </div>

                {isVendor && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>Nom de l&apos;entreprise / activité</label>
                    <input
                      value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Mon Studio Photo…" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")}
                    />
                  </div>
                )}

                {profileErr && (
                  <p style={{ fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "rgba(225,29,72,0.07)", color: "#E11D48", margin: 0 }}>{profileErr}</p>
                )}
                {saved && (
                  <p style={{ fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.07)", color: "#16a34a", margin: 0 }}>✓ Profil mis à jour</p>
                )}

                <button type="submit" disabled={saving} style={{ height: 46, borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, marginTop: 4 }}>
                  {saving ? "Sauvegarde…" : "Enregistrer"}
                </button>
              </form>
            </div>

            {/* ── Changer mot de passe ── */}
            <div style={cardStyle}>
              <button
                onClick={() => setPwSection(v => !v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                  Changer le mot de passe
                </h2>
                <GsIcon icon={pwSection ? "expand_less" : "expand_more"} size={20} color="var(--dash-text-3,#9a9aaa)" />
              </button>

              {pwSection && (
                <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>Mot de passe actuel</label>
                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>Nouveau mot de passe</label>
                      <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>Confirmer</label>
                      <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "var(--g1,#E11D48)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    </div>
                  </div>

                  {pwErr && <p style={{ fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "rgba(225,29,72,0.07)", color: "#E11D48", margin: 0 }}>{pwErr}</p>}
                  {pwSaved && <p style={{ fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.07)", color: "#16a34a", margin: 0 }}>✓ Mot de passe modifié</p>}

                  <button type="submit" disabled={pwSaving} style={{ height: 46, borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff", fontSize: 14, fontWeight: 600, cursor: pwSaving ? "wait" : "pointer", fontFamily: "inherit", opacity: pwSaving ? 0.7 : 1 }}>
                    {pwSaving ? "Modification…" : "Modifier le mot de passe"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
