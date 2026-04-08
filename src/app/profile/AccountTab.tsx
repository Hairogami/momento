"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaletteSelector } from "@/components/PaletteSelector"
import { C } from "@/lib/colors"

function PasswordField({
  label, value, onChange, id,
}: {
  label: string; value: string; onChange: (v: string) => void; id: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
        onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
        onBlur={e => (e.currentTarget.style.borderColor = C.anthracite)}
      />
    </div>
  )
}

export default function AccountTab() {
  const router = useRouter()

  const [currentPw, setCurrentPw] = useState("")
  const [newPw,     setNewPw]     = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError,   setPwError]   = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading,    setDeleteLoading]    = useState(false)
  const [deleteError,      setDeleteError]      = useState("")

  async function handleChangePassword() {
    setPwError("")
    setPwSuccess(false)
    if (!currentPw || !newPw || !confirmPw) { setPwError("Veuillez remplir tous les champs."); return }
    if (newPw !== confirmPw) { setPwError("Les nouveaux mots de passe ne correspondent pas."); return }
    if (newPw.length < 8) { setPwError("Minimum 8 caractères."); return }

    setPwLoading(true)
    const res = await fetch("/api/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    setPwLoading(false)

    if (!res.ok) { setPwError(data.error ?? "Une erreur est survenue."); return }

    setCurrentPw(""); setNewPw(""); setConfirmPw("")
    setPwSuccess(true)
    setTimeout(() => setPwSuccess(false), 3000)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setDeleteError("")
    const res = await fetch("/api/auth/account", { method: "DELETE" })
    setDeleteLoading(false)
    if (!res.ok) { const d = await res.json(); setDeleteError(d.error ?? "Erreur."); return }
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Appearance */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <h2 className="text-base font-bold" style={{ color: C.white }}>Apparence</h2>
        <PaletteSelector />
      </div>

      {/* Change password */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <h2 className="text-base font-bold" style={{ color: C.white }}>Changer le mot de passe</h2>

        <PasswordField label="Mot de passe actuel" id="cur-pw" value={currentPw} onChange={setCurrentPw} />
        <PasswordField label="Nouveau mot de passe" id="new-pw" value={newPw} onChange={setNewPw} />
        <PasswordField label="Confirmer le nouveau mot de passe" id="conf-pw" value={confirmPw} onChange={setConfirmPw} />

        {pwError && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(196,83,42,0.1)", color: C.terra }}>{pwError}</p>
        )}
        {pwSuccess && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(44,180,100,0.12)", color: "#2c8c52" }}>✓ Mot de passe modifié.</p>
        )}

        <button
          onClick={handleChangePassword}
          disabled={pwLoading}
          className="self-start font-bold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          {pwLoading ? "Modification…" : "Changer le mot de passe"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4" style={{ backgroundColor: C.dark, border: `1.5px solid rgba(196,83,42,0.3)` }}>
        <h2 className="text-base font-bold" style={{ color: C.terra }}>Zone de danger</h2>
        <p className="text-sm" style={{ color: C.mist }}>
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>

        {!showDeleteDialog ? (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="self-start text-sm font-semibold px-5 py-2.5 rounded-xl border transition-all hover:opacity-80"
            style={{ borderColor: C.terra, color: C.terra, backgroundColor: "transparent" }}
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="rounded-xl p-5" style={{ backgroundColor: "rgba(196,83,42,0.08)", border: `1px solid rgba(196,83,42,0.2)` }}>
            <p className="text-sm font-semibold mb-4" style={{ color: C.white }}>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </p>
            {deleteError && (
              <p className="text-sm mb-3" style={{ color: C.terra }}>{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: C.terra, color: "#fff" }}
              >
                {deleteLoading ? "Suppression…" : "Confirmer la suppression"}
              </button>
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteError("") }}
                className="font-semibold text-sm px-5 py-2.5 rounded-xl transition-all hover:opacity-70"
                style={{ color: C.mist }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
