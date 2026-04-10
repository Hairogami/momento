import { Resend } from "resend"

function getResend() {
  const key = process.env.RESEND_API_KEY ?? "re_placeholder"
  return new Resend(key)
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
// W06: fail hard in production if APP_URL is unset — broken localhost links in emails are worse than a 500
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("[email] NEXT_PUBLIC_APP_URL is not set — refusing to send emails with localhost links")
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/** CR-01: Escape HTML special chars to prevent XSS in email templates */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const BASE_STYLE = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #F5EDD6;
  color: #1A1208;
`

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;${BASE_STYLE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDD6;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#EDE4CC;border-radius:20px;overflow:hidden;border:1px solid #DDD4BC">
        <tr><td style="background:#1A1208;padding:28px 40px;text-align:center">
          <span style="font-size:22px;font-weight:700;letter-spacing:0.2em;color:#F5EDD6;text-transform:uppercase">MOMENTO</span>
        </td></tr>
        <tr><td style="padding:40px">
          ${content}
        </td></tr>
        <tr><td style="background:#DDD4BC;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#6A5F4A">© 2026 Momento. Tous droits réservés.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendVerificationEmail({
  to,
  firstName,
  token,
}: {
  to: string
  firstName: string | null
  token: string
}) {
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`
  const name = escapeHtml(firstName ?? "là")

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Vérifiez votre adresse e-mail — Momento",
    html: emailWrapper(`
      <h2 style="margin:0 0 12px;font-size:28px;font-weight:300;font-style:italic;color:#2C1A0E">
        Bonjour ${name} !
      </h2>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6A5F4A">
        Merci de rejoindre <strong style="color:#1A1208">Momento</strong>. Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail et activer votre compte.
      </p>
      <p style="text-align:center;margin:0 0 24px">
        <a href="${link}" style="display:inline-block;background:#C4532A;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none">
          Vérifier mon e-mail
        </a>
      </p>
      <p style="margin:0;font-size:12px;color:#9A907A;text-align:center">
        Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet e-mail.
      </p>
    `),
  })
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  token,
}: {
  to: string
  firstName: string | null
  token: string
}) {
  const link = `${APP_URL}/reset-password?token=${token}`
  const name = escapeHtml(firstName ?? "là")

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Réinitialisation de votre mot de passe — Momento",
    html: emailWrapper(`
      <h2 style="margin:0 0 12px;font-size:28px;font-weight:300;font-style:italic;color:#2C1A0E">
        Bonjour ${name},
      </h2>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6A5F4A">
        Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
      </p>
      <p style="text-align:center;margin:0 0 24px">
        <a href="${link}" style="display:inline-block;background:#C4532A;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p style="margin:0;font-size:12px;color:#9A907A;text-align:center">
        Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet e-mail.
      </p>
    `),
  })
}
