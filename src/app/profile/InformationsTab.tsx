"use client"

import { useState, useRef, useEffect } from "react"
import { Camera } from "lucide-react"
import type { UserData } from "./ProfileClient"
import { C } from "@/lib/colors"

function Field({
  label, value, onChange, placeholder, type = "text", readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void
  placeholder?: string; type?: string; readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{
          backgroundColor: readOnly ? C.anthracite : C.ink,
          border: `1.5px solid ${C.anthracite}`,
          color: readOnly ? C.steel : C.white,
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = C.accent }}
        onBlur={e => { if (!readOnly) e.currentTarget.style.borderColor = C.anthracite }}
      />
      {readOnly && (
        <p className="text-xs" style={{ color: C.steel }}>
          L'adresse e-mail ne peut pas être modifiée.
        </p>
      )}
    </div>
  )
}

export default function InformationsTab({ user, onUpdate }: { user: UserData; onUpdate: (u: UserData) => void }) {
  const isVendor = user.role === "vendor"
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatar, setAvatar] = useState<string | null>(null)
  const [username,    setUsername]    = useState(user.username    ?? "")
  const [firstName,   setFirstName]   = useState(user.firstName   ?? "")
  const [lastName,    setLastName]    = useState(user.lastName    ?? "")
  const [companyName, setCompanyName] = useState(user.companyName ?? "")
  const [phone,       setPhone]       = useState(user.phone       ?? "")
  const [location,    setLocation]    = useState(user.location    ?? "")
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState("")

  // Load avatar: localStorage takes priority, else seed from OAuth image
  useEffect(() => {
    const stored = localStorage.getItem("momento_avatar")
    if (stored) {
      setAvatar(stored)
    } else if (user.image) {
      // Seed from OAuth provider image (Discord/GitHub/Google)
      setAvatar(user.image)
      localStorage.setItem("momento_avatar", user.image)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      // Compress to max 200px
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const size = Math.min(img.width, img.height, 200)
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")!
        // Center-crop
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
        const compressed = canvas.toDataURL("image/jpeg", 0.82)
        setAvatar(compressed)
        localStorage.setItem("momento_avatar", compressed)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const displayName = user.username ?? user.firstName ?? user.email.split("@")[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleSave() {
    setError("")
    setSuccess(false)
    setLoading(true)

    const body: Record<string, string> = { phone, location, username }
    if (isVendor) { body.companyName = companyName }
    else { body.firstName = firstName; body.lastName = lastName }
    if (avatar) body.image = avatar

    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return }

    const updated = data.user ?? data
    onUpdate({ ...user, ...updated, image: updated.image ?? avatar ?? user.image ?? null })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
      style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
    >
      <h2 className="text-base font-bold" style={{ color: C.white }}>
        Informations personnelles
      </h2>

      {/* Avatar upload */}
      <div className="flex items-center gap-5">
        <div className="relative group shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="Photo de profil"
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              {initials}
            </div>
          )}
          {/* Overlay on hover */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ backgroundColor: "rgba(26,18,8,0.55)" }}
            title="Changer la photo"
          >
            <Camera size={20} color="#fff" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: C.white }}>{displayName}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs mt-1 transition-opacity hover:opacity-70"
            style={{ color: C.terra }}
          >
            Changer la photo
          </button>
          {avatar && (
            <button
              onClick={() => { setAvatar(null); localStorage.removeItem("momento_avatar") }}
              className="block text-xs mt-0.5 transition-opacity hover:opacity-70"
              style={{ color: C.steel }}
            >
              Supprimer
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <Field
        label="Nom d'affichage"
        value={username}
        onChange={setUsername}
        placeholder="votre_pseudo"
      />

      {isVendor ? (
        <Field label="Nom de l'entreprise" value={companyName} onChange={setCompanyName} placeholder="Studio Lumière" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" value={firstName} onChange={setFirstName} placeholder="Yasmine" />
          <Field label="Nom" value={lastName} onChange={setLastName} placeholder="Benali" />
        </div>
      )}

      <Field label="Adresse e-mail" value={user.email} readOnly type="email" />

      {isVendor && user.vendorCategory && (
        <Field label="Catégorie" value={user.vendorCategory} readOnly />
      )}

      <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+212 6 00 00 00 00" type="tel" />
      <Field label="Ville / Localisation" value={location} onChange={setLocation} placeholder="Casablanca, Maroc" />

      {error && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.1)", color: C.terra }}>
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(44,180,100,0.12)", color: "#2c8c52" }}>
          ✓ Informations sauvegardées.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="self-start font-bold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: C.terra, color: "#fff" }}
      >
        {loading ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </div>
  )
}
