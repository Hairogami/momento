"use client"

import { useState } from "react"

type Props = {
  slug: string
  hasDayAfter?: boolean
  allowPlusOne?: boolean
  deadline?: string | null
  accentColor?: string
  /** "inverted" : formulaire posé sur un fond couleur principale (texte blanc/secondaire). */
  tone?: "default" | "inverted"
}

/**
 * Formulaire RSVP public pour les invités.
 * - Honey-pot anti-bot (champ `website` invisible)
 * - Validation côté client minimale (nom + réponse)
 * - Feedback succès / erreur
 * - POST vers /api/public/evt/[slug]/rsvp (rate-limited côté serveur)
 */
export default function RsvpForm({ slug, hasDayAfter = false, allowPlusOne = true, deadline, accentColor, tone = "default" }: Props) {
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

  const accent = accentColor ?? "var(--evt-main, #C1713A)"
  const t = tone === "inverted" ? invertedTheme(accentColor) : defaultTheme(accent)

  if (state === "success") {
    return (
      <div style={{ textAlign: "center", padding: "28px 20px" }}>
        <div style={{ fontSize: "var(--text-2xl)", marginBottom: 10, color: t.highlight }}>✓</div>
        <div style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 6, fontFamily: "var(--evt-font-heading)", color: t.ink }}>Merci {name} !</div>
        <div style={{ fontSize: "var(--text-sm)", color: t.muted }}>Votre réponse a bien été enregistrée.</div>
      </div>
    )
  }

  return (
    <>
    {deadline && (
      <p style={{
        fontFamily: "var(--evt-font-body, inherit)",
        fontSize: "var(--text-base)", color: t.muted, margin: "0 auto 22px", maxWidth: 460, textAlign: "center",
      }}>
        Merci de répondre avant le <strong style={{ color: t.highlight }}>{deadline}</strong>
      </p>
    )}
    <form onSubmit={submit} className={tone === "inverted" ? "rsvp-inverted" : undefined} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
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

      <label style={t.label}>
        <span>Nom complet</span>
        <input type="text" autoComplete="name" name="guestName" required value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" style={t.input} />
      </label>

      <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
        <span style={t.labelText}>Présent à l&apos;événement ?</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setAttendingMain(true)} style={radioBtn(attendingMain === true, t)}>Oui</button>
          <button type="button" onClick={() => setAttendingMain(false)} style={radioBtn(attendingMain === false, t)}>Non</button>
        </div>
      </div>

      {hasDayAfter && attendingMain !== false && (
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <span style={t.labelText}>Présent au day-after ?</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setAttendingDayAfter(true)} style={radioBtn(attendingDayAfter === true, t)}>Oui</button>
            <button type="button" onClick={() => setAttendingDayAfter(false)} style={radioBtn(attendingDayAfter === false, t)}>Non</button>
          </div>
        </div>
      )}

      {allowPlusOne && (
        <label style={t.label}>
          <span>Nom de votre +1 <span style={{ opacity: 0.5, fontStyle: "italic" }}>(facultatif)</span></span>
          <input
            type="text"
            autoComplete="off"
            name="plusOneName"
            value={plusOneName}
            onChange={e => setPlusOneName(e.target.value)}
            placeholder="Prénom Nom de votre accompagnant·e"
            style={t.input}
            disabled={attendingMain === false}
          />
        </label>
      )}

      {attendingMain === true && (
        <>
          <label style={t.label}>
            <span>Allergies / régime alimentaire</span>
            <input type="text" autoComplete="off" name="dietaryNeeds" value={dietaryNeeds} onChange={e => setDietaryNeeds(e.target.value)} placeholder="Végétarien, sans gluten..." style={t.input} />
          </label>

          <label style={t.label}>
            <span>Un mot pour les mariés (facultatif)</span>
            <textarea autoComplete="off" name="message" value={message} onChange={e => setMessage(e.target.value)} rows={2} style={{ ...t.input, resize: "vertical" }} />
          </label>
        </>
      )}

      {state === "error" && errorMsg && (
        <p role="alert" style={{ fontSize: "var(--text-sm)", color: t.error, margin: 0, textAlign: "center" }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        style={{
          marginTop: 6,
          padding: "14px 28px",
          borderRadius: 999,
          border: "none",
          background: t.submitBg,
          color: t.submitInk,
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          cursor: state === "sending" ? "wait" : "pointer",
          fontFamily: "var(--evt-font-body, inherit)",
          opacity: state === "sending" ? 0.6 : 1,
        }}
      >
        {state === "sending" ? "Envoi…" : "Confirmer ma réponse"}
      </button>
    </form>
    {tone === "inverted" && (
      <style>{`.rsvp-inverted input::placeholder, .rsvp-inverted textarea::placeholder { color: ${t.placeholder}; opacity: 1; }`}</style>
    )}
    </>
  )
}

type RsvpTheme = {
  ink: string
  muted: string
  highlight: string
  error: string
  placeholder: string
  submitBg: string
  submitInk: string
  radioActiveBg: string
  radioActiveInk: string
  radioBorder: string
  label: React.CSSProperties
  labelText: React.CSSProperties
  input: React.CSSProperties
}

const FONT = "var(--evt-font-body, inherit)"

function defaultTheme(accent: string): RsvpTheme {
  const labelText: React.CSSProperties = { fontSize: "var(--text-xs)", color: "var(--evt-text-muted)", fontFamily: FONT }
  return {
    ink: "var(--evt-text)",
    muted: "var(--evt-text-muted)",
    highlight: "var(--evt-main)",
    error: "#dc2626",
    placeholder: "",
    submitBg: accent,
    submitInk: "#fff",
    radioActiveBg: accent,
    radioActiveInk: "#fff",
    radioBorder: "color-mix(in srgb, var(--evt-main) 25%, transparent)",
    label: { display: "flex", flexDirection: "column", gap: 5, textAlign: "left", ...labelText },
    labelText,
    input: {
      padding: "12px 14px", borderRadius: 10,
      border: "1px solid color-mix(in srgb, var(--evt-main) 25%, transparent)",
      background: "var(--evt-bg, #fff)", color: "var(--evt-text)",
      fontSize: "var(--text-sm)", fontFamily: FONT, outline: "none",
    },
  }
}

/**
 * Fond = couleur principale. Encre = blanc, accents (labels, boutons, date) = couleur secondaire.
 * Si la couleur principale est claire (ex. palette pastel), bascule en encre quasi-noire (contraste WCAG).
 */
function invertedTheme(mainHex: string | undefined): RsvpTheme {
  const dark = mainHex ? prefersDarkInk(mainHex) : false
  const ink = dark ? "#1a1a1a" : "#fff"
  const secondary = dark
    ? "color-mix(in srgb, var(--evt-secondary) 35%, #1a1a1a)"
    : "var(--evt-secondary)"
  const labelText: React.CSSProperties = {
    fontSize: "var(--text-xs)", color: secondary, fontFamily: FONT,
    fontWeight: 600, letterSpacing: "0.04em",
  }
  return {
    ink,
    muted: `color-mix(in srgb, ${ink} 82%, transparent)`,
    highlight: secondary,
    error: dark ? "#991b1b" : "#fecaca",
    placeholder: `color-mix(in srgb, ${ink} 50%, transparent)`,
    submitBg: secondary,
    submitInk: "var(--evt-main)",
    radioActiveBg: secondary,
    radioActiveInk: "var(--evt-main)",
    radioBorder: `color-mix(in srgb, ${secondary} 45%, transparent)`,
    label: { display: "flex", flexDirection: "column", gap: 6, textAlign: "left", ...labelText },
    labelText,
    input: {
      padding: "12px 14px", borderRadius: 10,
      border: `1px solid color-mix(in srgb, ${secondary} 40%, transparent)`,
      background: `color-mix(in srgb, ${ink} 8%, transparent)`, color: ink,
      fontSize: "var(--text-sm)", fontFamily: FONT, outline: "none",
    },
  }
}

/** true si du texte quasi-noir (#1a1a1a) contraste mieux que du blanc sur `hex`. */
export function prefersDarkInk(hex: string): boolean {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i)
  if (!m) return false
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  const contrastWhite = 1.05 / (L + 0.05)
  const contrastDark = (L + 0.05) / 0.0603
  return contrastDark > contrastWhite
}

/** Couleur du titre RSVP sur fond couleur principale : secondaire (ou quasi-noir si fond clair). */
export function rsvpHeadingColor(mainHex: string): string {
  return prefersDarkInk(mainHex) ? "#1a1a1a" : "var(--evt-secondary)"
}

function radioBtn(active: boolean, t: RsvpTheme): React.CSSProperties {
  return {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: active ? `1.5px solid ${t.radioActiveBg}` : `1px solid ${t.radioBorder}`,
    background: active ? t.radioActiveBg : "transparent",
    color: active ? t.radioActiveInk : t.ink,
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
    transition: "all 0.15s",
  }
}
