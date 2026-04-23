import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales — Momento",
  description: "Mentions légales obligatoires du site momentoevents.app, conformément à la loi 53-05.",
}

// TODO_DECISION: compléter après création SARL :
// - Raison sociale, forme juridique (SARL ?), capital social
// - Numéros RC, ICE, IF, TVA
// - Adresse exacte du siège social
// - N° récépissé CNDP + date
// Ces champs restent en "à compléter" — pas de valeur inventée.

const UPDATED_AT = "23 avril 2026"

export default function MentionsLegalesPage() {
  return (
    <article style={articleStyle}>
      <header style={{ marginBottom: 36 }}>
        <p style={kickerStyle}>Document juridique</p>
        <h1 style={h1Style}>Mentions légales</h1>
        <p style={subtitleStyle}>
          Informations obligatoires relatives à l&apos;éditeur et à l&apos;hébergeur du site momentoevents.app,
          conformément à la loi 53-05 relative à l&apos;échange électronique de données juridiques et à l&apos;article 29 de la loi 31-08.
        </p>
        <p style={metaStyle}>Dernière mise à jour : {UPDATED_AT}</p>
      </header>

      <div style={noticeStyle}>
        <strong style={{ display: "block", marginBottom: 6 }}>Informations en cours de complétion</strong>
        Les champs relatifs à la raison sociale, au RC, à l&apos;ICE, à l&apos;identifiant fiscal, au capital social et au numéro de récépissé CNDP
        seront renseignés dès finalisation de la création de la structure juridique et de la déclaration auprès de la CNDP.
      </div>

      <Section title="Éditeur du site">
        <Field label="Nom commercial">Momento</Field>
        <Field label="Raison sociale">À compléter après création de la société</Field>
        <Field label="Forme juridique">À compléter (SARL envisagée)</Field>
        <Field label="Capital social">À compléter</Field>
        <Field label="Siège social">À compléter — Maroc</Field>
        <Field label="Registre du commerce (RC)">À compléter</Field>
        <Field label="ICE (Identifiant Commun de l'Entreprise)">À compléter</Field>
        <Field label="IF (Identifiant Fiscal)">À compléter</Field>
        <Field label="N° de TVA">À compléter</Field>
      </Section>

      <Section title="Contact">
        <Field label="Email">
          <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>
        </Field>
        <Field label="Formulaire d'aide">
          <a href="/help" style={linkStyle}>Centre d&apos;aide</a>
        </Field>
      </Section>

      <Section title="Directeur de publication">
        <Field label="Nom">Yazid Moumène</Field>
        <Field label="Qualité">Fondateur</Field>
      </Section>

      <Section title="Hébergeur">
        <Field label="Raison sociale">Vercel Inc.</Field>
        <Field label="Adresse">440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</Field>
        <Field label="Téléphone">+1 951-383-6898</Field>
        <Field label="Site web">
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>vercel.com</a>
        </Field>
      </Section>

      <Section title="Protection des données personnelles (CNDP)">
        <Field label="N° de récépissé CNDP">À compléter après dépôt de la déclaration</Field>
        <Field label="Délégué à la protection des données (DPO)">En cours de désignation</Field>
        <Field label="Autorité de contrôle">
          Commission Nationale de contrôle de la protection des Données à caractère Personnel —
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" style={linkStyle}> www.cndp.ma</a>
        </Field>
        <p style={{ fontSize: 14, color: "#6a6a71", marginTop: 12 }}>
          Pour plus de détails sur les finalités, les données collectées, les destinataires et vos droits,
          veuillez consulter la <a href="/confidentialite" style={linkStyle}>Politique de confidentialité</a>.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          La marque Momento, son logo, sa charte graphique, ses textes éditoriaux, ses bases de données et les codes informatiques
          de la Plateforme sont la propriété exclusive de Momento ou utilisés sous licence. Toute reproduction,
          représentation, adaptation, extraction, réutilisation partielle ou totale est interdite sans autorisation écrite préalable,
          sous peine d&apos;engager la responsabilité civile et pénale de l&apos;auteur.
        </p>
        <p>
          Les photos, logos et contenus des Prestataires restent la propriété de leurs auteurs ou titulaires de droits respectifs et sont publiés
          sous licence limitée conformément à l&apos;article 13 des <a href="/cgu" style={linkStyle}>Conditions Générales d&apos;Utilisation</a>.
        </p>
      </Section>

      <Section title="Crédits">
        <p>Design et développement : équipe Momento.</p>
        <p>
          Icônes : Lucide, Google Material Symbols.<br />
          Polices : Plus Jakarta Sans (SIL OFL), Cormorant Garamond (SIL OFL), Geist.
        </p>
      </Section>

      <Section title="Conditions Générales d'Utilisation">
        <p>
          Les conditions contractuelles applicables à l&apos;utilisation de la Plateforme sont détaillées dans les
          <a href="/cgu" style={linkStyle}> Conditions Générales d&apos;Utilisation</a>.
        </p>
      </Section>

      <div style={contactBlockStyle}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Questions sur ces mentions :</p>
        <p style={{ margin: 0, fontSize: 14 }}>
          <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>
        </p>
      </div>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={sectionStyle}>
      <h2 style={h2Style}>{title}</h2>
      <div style={sectionBodyStyle}>{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <span style={fieldValueStyle}>{children}</span>
    </div>
  )
}

const articleStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 20, padding: "56px 48px",
  border: "1px solid rgba(183,191,217,0.22)",
  boxShadow: "0 4px 32px rgba(12,14,30,0.04)",
  lineHeight: 1.65, fontSize: 15, color: "#2a2b30",
}
const kickerStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E11D48", margin: "0 0 10px" }
const h1Style: React.CSSProperties = { fontSize: 34, fontWeight: 700, color: "#121317", letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 10px" }
const subtitleStyle: React.CSSProperties = { fontSize: 15, color: "#6a6a71", margin: "0 0 14px", lineHeight: 1.55 }
const metaStyle: React.CSSProperties = { fontSize: 12, color: "#9a9aaa", margin: 0 }
const noticeStyle: React.CSSProperties = { padding: "16px 18px", background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.22)", borderRadius: 12, fontSize: 13, color: "#715311", lineHeight: 1.55, marginBottom: 32 }
const sectionStyle: React.CSSProperties = { marginBottom: 32 }
const h2Style: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#121317", letterSpacing: "-0.015em", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid rgba(183,191,217,0.22)" }
const sectionBodyStyle: React.CSSProperties = { fontSize: 15, color: "#2a2b30", lineHeight: 1.7 }
const fieldStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, padding: "6px 0", borderBottom: "1px dashed rgba(183,191,217,0.2)" }
const fieldLabelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#6a6a71" }
const fieldValueStyle: React.CSSProperties = { fontSize: 14, color: "#121317" }
const linkStyle: React.CSSProperties = { color: "#E11D48", textDecoration: "underline", textUnderlineOffset: 2 }
const contactBlockStyle: React.CSSProperties = { marginTop: 40, padding: "18px 22px", background: "#fafafa", borderRadius: 12, border: "1px solid rgba(183,191,217,0.22)" }
