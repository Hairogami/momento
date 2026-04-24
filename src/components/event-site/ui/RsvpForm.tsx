"use client"

import { useState } from "react"

type Props = {
  slug: string
  hasDayAfter?: boolean
  allowPlusOne?: boolean
  deadline?: string | null
  accentColor?: string
}

/**
 * Formulaire RSVP public pour les invités.
 * - Honey-pot anti-bot (champ `website` invisible)
 * - Validation côté client minimale (nom + réponse)
 * - Feedback succès / erreur
 * - POST vers /api/public/evt/[slug]/rsvp (rate-limited côté serveur)
 */
export default function RsvpForm({ slug, hasDayAfter = false, allowPlusOne = true, deadline, accentColor }: Props) {
  const [name, setName] = useState("")
  const [attendingMain, setAttendingMain] = useState<boolean | null>(null)
  const [attendingDayAfter, setAttendingDayAfter] = useState<boolean | null>(null)
  const [plusOneName, setPlusOneName] = useState("")
  const [dietaryNeeds, setDietaryNeeds] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("") // honey-pot — invisible

  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || attendingMain === null) {
      setErrorMsg("Merci de renseigner votre nom et votre réponse.")
      setState("error")
      return
    }
    setState("sending")
    setErrorMsg("")
    try {
      const r = await fetch(`/api/public/evt/${encodeURIComponent(slug)}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          attendingMain,
          attendingDayAfter: hasDayAfter ? attendingDayAfter : undefined,
          plusOneName: plusOneName || undefined,
          dietaryNeeds: dietaryNeeds || undefined,
          message: message || undefined,
          website, // honey-pot — doit rester vide
        }),
      })
      const data = await r.json().catch(() => ({ error: "Erreur réseau" }))
      if (r.ok) {
        setState("success")
      } else {
        setErrorMsg(data.error ?? "Erreur lors de l'envoi")
        setState("error")
      }
    } catch {
      setErrorMsg("Erreur réseau. Réessayez dans quelques instants.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div style={{ textAlign: "center", padding: "28px 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, fontFamily: "var(--evt-font-heading)" }}>Merci {name} !</div>
        <div style={{ fontSize: 14, color: "var(--evt-text-muted)" }}>Votre réponse a bien été enregistrée.</div>
      </div>
    )
  }

  const accent = accentColor ?? "var(--evt-main, #C1713A)"

  return (
    <>
    {deadline && (
      <p style={{
        fontFamily: "var(--evt-font-body, inherit)",
        fontSize: 13, color: "var(--evt-text-muted)", margin: "0 auto 22px", maxWidth: 460, textAlign: "center",
      }}>
        Merci de répondre avant le <strong>{deadline}</strong>
      </p>
    )}
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460, margin: "0 auto" }}>
      {/* Honey-pot (caché aux humains, visible aux bots) */}
      <div aria-hidden style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={e => setWebsite(e.target.value)}
        />
      </div>

      <label style={labelStyle}>
        <span>Nom complet</span>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" style={inputStyle} />
      </label>

      <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
        <span style={labelTextStyle}>Présent à l&apos;événement ?</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setAttendingMain(true)} style={radioBtn(attendingMain === true, accent)}>Oui</button>
          <button type="button" onClick={() => setAttendingMain(false)} style={radioBtn(attendingMain === false, accent)}>Non</button>
        </div>
      </div>

      {hasDayAfter && attendingMain !== false && (
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <span style={labelTextStyle}>Présent au day-after ?</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setAttendingDayAfter(true)} style={radioBtn(attendingDayAfter === true, accent)}>Oui</button>
            <button type="button" onClick={() => setAttendingDayAfter(false)} style={radioBtn(attendingDayAfter === false, accent)}>Non</button>
          </div>
        </div>
      )}

      {allowPlusOne && (
        <label style={labelStyle}>
          <span>Nom de votre +1 <span style={{ opacity: 0.5, fontStyle: "italic" }}>(facultatif)</span></span>
          <input
            type="text"
            value={plusOneName}
            onChange={e => setPlusOneName(e.target.value)}
            placeholder="Prénom Nom de votre accompagnant·e"
            style={inputStyle}
            disabled={attendingMain === false}
          />
        </label>
      )}

      {attendingMain === true && (
        <>
          <label style={labelStyle}>
            <span>Allergies / régime alimentaire</span>
            <input type="text" value={dietaryNeeds} onChange={e => setDietaryNeeds(e.target.value)} placeholder="Végétarien, sans gluten..." style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span>Un mot pour les mariés (facultatif)</span>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
        </>
      )}

      {state === "error" && errorMsg && (
        <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        style={{
          marginTop: 6,
          padding: "14px 28px",
          borderRadius: 999,
          border: "none",
          background: accent,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: state === "sending" ? "wait" : "pointer",
          fontFamily: "var(--evt-font-body, inherit)",
          opacity: state === "sending" ? 0.6 : 1,
        }}
      >
        {state === "sending" ? "Envoi…" : "Confirmer ma réponse"}
      </button>
    </form>
    </>
  )
}

function radioBtn(active: boolean, accent: string): React.CSSProperties {
  return {
    flex: 1,
    padding: "11px 16px",
    borderRadius: 12,
    border: active ? `1.5px solid ${accent}` : "1px solid color-mix(in srgb, var(--evt-main) 25%, transparent)",
    background: active ? accent : "transparent",
    color: active ? "#fff" : "var(--evt-text)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--evt-font-body, inherit)",
    transition: "all 0.15s",
  }
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  fontSize: 12,
  color: "var(--evt-text-muted)",
  fontFamily: "var(--evt-font-body, inherit)",
}

const labelTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--evt-text-muted)",
  fontFamily: "var(--evt-font-body, inherit)",
}

const inputStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid color-mix(in srgb, var(--evt-main) 25%, transparent)",
  background: "var(--evt-bg, #fff)",
  color: "var(--evt-text)",
  fontSize: 14,
  fontFamily: "var(--evt-font-body, inherit)",
  outline: "none",
}
