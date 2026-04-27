import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Momento",
  description: "Politique de confidentialité et protection des données personnelles conforme à la loi marocaine 09-08.",
}

// TODO_DECISION: n° récépissé CNDP à insérer après déclaration.
// TODO_DECISION: DPO nommé (Yazid Moumène ou personne externe) ? À trancher.
// Document basé strictement sur la loi 09-08 (Dahir 1-09-15 du 18 février 2009)
// et les recommandations CNDP 2025. Zéro obligation RGPD européenne importée.

const UPDATED_AT = "23 avril 2026"

export default function ConfidentialitePage() {
  return (
    <article style={articleStyle}>
      <header style={{ marginBottom: 36 }}>
        <p style={kickerStyle}>Document juridique</p>
        <h1 style={h1Style}>Politique de Confidentialité</h1>
        <p style={subtitleStyle}>
          Protection des données personnelles conformément à la loi marocaine n° 09-08 du 18 février 2009.
        </p>
        <p style={metaStyle}>Dernière mise à jour : {UPDATED_AT}</p>
      </header>

      <div style={noticeStyle}>
        <strong style={{ display: "block", marginBottom: 6 }}>Document en cours de finalisation</strong>
        Cette politique est opposable dès aujourd&apos;hui mais sera complétée du numéro de récépissé CNDP après dépôt de la déclaration auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel.
      </div>

      <nav style={tocStyle}>
        <p style={tocTitleStyle}>Sommaire</p>
        <ol style={tocListStyle}>
          {[
            "Responsable du traitement",
            "Coordonnées et contact",
            "Finalités du traitement",
            "Base légale",
            "Données collectées",
            "Destinataires et sous-traitants",
            "Transferts hors du Maroc",
            "Durée de conservation",
            "Vos droits",
            "Modalités d'exercice des droits",
            "Cookies et traceurs",
            "Sécurité des données",
            "Déclaration CNDP",
            "Modifications de la politique",
            "Réclamations",
          ].map((label, i) => (
            <li key={label} style={{ marginBottom: 4 }}>
              <a href={`#s${i + 1}`} style={tocLinkStyle}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="s1" n={1} title="Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées via la Plateforme momentoevents.app est :
        </p>
        <p style={strongNoticeStyle}>
          Momento
          <br />
          Contact : <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>
        </p>
        <div role="alert" style={{
          margin: "var(--space-md, 16px) 0",
          padding: "var(--space-md, 16px)",
          border: "2px dashed #f59e0b",
          borderRadius: 12,
          background: "rgba(245, 158, 11, 0.08)",
          color: "var(--dash-text, #121317)",
          fontSize: "var(--text-sm, 14px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <strong style={{ color: "#f59e0b", fontSize: "var(--text-sm, 14px)" }}>
            ⚠️ À compléter avant lancement
          </strong>
          <span>Compléter la raison sociale, le numéro RC, l&apos;ICE et l&apos;adresse du siège social après création de la société.</span>
        </div>
      </Section>

      <Section id="s2" n={2} title="Coordonnées et contact">
        <p>
          Pour toute question relative à la présente Politique, à l&apos;exercice de vos droits ou à un incident de sécurité,
          vous pouvez contacter l&apos;équipe Momento à l&apos;adresse <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>.
        </p>
        <p>
          Conformément aux recommandations de la CNDP, un correspondant à la protection des données (DPO) est en cours de désignation et ses coordonnées seront publiées dans la présente section dès nomination.
        </p>
        <div role="alert" style={{
          margin: "var(--space-md, 16px) 0",
          padding: "var(--space-md, 16px)",
          border: "2px dashed #f59e0b",
          borderRadius: 12,
          background: "rgba(245, 158, 11, 0.08)",
          color: "var(--dash-text, #121317)",
          fontSize: "var(--text-sm, 14px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <strong style={{ color: "#f59e0b", fontSize: "var(--text-sm, 14px)" }}>
            ⚠️ À compléter avant lancement
          </strong>
          <span>Trancher la désignation d&apos;un DPO (recommandé par la CNDP campagne 2025, non obligatoire par la loi 09-08) — choisir entre Yazid Moumène ou un correspondant externe, puis publier ses coordonnées ici.</span>
        </div>
      </Section>

      <Section id="s3" n={3} title="Finalités du traitement">
        <p>Les données sont traitées pour les finalités suivantes, en stricte conformité avec l&apos;article 4 de la loi 09-08 (principe de finalité) :</p>
        <ul style={listStyle}>
          <li>création, gestion et sécurisation des comptes utilisateurs ;</li>
          <li>organisation d&apos;événements par le Client (budget, invités, tâches, checklist, calendrier) ;</li>
          <li>mise en relation Client–Prestataire via l&apos;annuaire et la messagerie ;</li>
          <li>gestion des abonnements payants (Pro, Pro + Planner) et facturation ;</li>
          <li>envoi de notifications service (authentification, messages reçus, rappels d&apos;événement) ;</li>
          <li>envoi de communications marketing (newsletters, offres promotionnelles), uniquement après consentement séparé ;</li>
          <li>amélioration de la Plateforme (statistiques agrégées, détection des bugs, mesures de performance) ;</li>
          <li>recommandations personnalisées de Prestataires à partir des préférences exprimées (profilage, cf. section 3 des CGU) ;</li>
          <li>respect des obligations légales et réponse aux réquisitions d&apos;autorités compétentes.</li>
        </ul>
      </Section>

      <Section id="s4" n={4} title="Base légale">
        <p>Conformément à l&apos;article 4 de la loi 09-08, chaque traitement repose sur l&apos;une des bases suivantes :</p>
        <ul style={listStyle}>
          <li><strong>Consentement explicite</strong> de la personne concernée (inscription, marketing, profilage) ;</li>
          <li><strong>Exécution d&apos;un contrat</strong> auquel la personne concernée est partie (abonnement payant, gestion du compte) ;</li>
          <li><strong>Respect d&apos;une obligation légale</strong> (conservation comptable, réquisitions judiciaires) ;</li>
          <li><strong>Intérêt légitime</strong> du responsable, strictement proportionné (sécurité de la Plateforme, prévention de la fraude).</li>
        </ul>
      </Section>

      <Section id="s5" n={5} title="Données collectées">
        <p>Seules les données strictement nécessaires aux finalités sont collectées (principe de minimisation, article 4 loi 09-08).</p>

        <h3 style={h3Style}>5.1 Données d&apos;identification et de compte</h3>
        <ul style={listStyle}>
          <li>email ;</li>
          <li>nom, prénom ;</li>
          <li>mot de passe (stocké sous forme de hash bcrypt, jamais en clair) ;</li>
          <li>photo de profil (optionnelle, ou récupérée depuis Google / Facebook si connexion via un fournisseur tiers) ;</li>
          <li>téléphone (optionnel) ;</li>
          <li>ville, région (optionnels).</li>
        </ul>

        <h3 style={h3Style}>5.2 Données Prestataire (si applicable)</h3>
        <ul style={listStyle}>
          <li>raison sociale, catégorie d&apos;activité ;</li>
          <li>description, photos, tarifs indicatifs ;</li>
          <li>coordonnées de contact professionnel (email, téléphone, site web, Instagram, Facebook) ;</li>
          <li>zone d&apos;intervention, adresse professionnelle.</li>
        </ul>

        <h3 style={h3Style}>5.3 Données liées à l&apos;événement (Planner)</h3>
        <ul style={listStyle}>
          <li>nom, date et lieu de l&apos;événement ;</li>
          <li>type et sous-type d&apos;événement (mariage, fête, naissance…) ;</li>
          <li>budget global et répartition par catégorie ;</li>
          <li>liste d&apos;invités (nom, email, téléphone, RSVP — renseignés par le Client) ;</li>
          <li>tâches, rendez-vous, notes personnelles.</li>
        </ul>

        <h3 style={h3Style}>5.4 Messages</h3>
        <ul style={listStyle}>
          <li>contenu des messages échangés entre Client et Prestataire via la messagerie interne ;</li>
          <li>horodatage, identifiants des parties.</li>
        </ul>

        <h3 style={h3Style}>5.5 Données de facturation</h3>
        <ul style={listStyle}>
          <li>plan souscrit, date de souscription, date d&apos;expiration, statut de paiement ;</li>
          <li>factures émises (conservées 10 ans au titre du Code de commerce).</li>
        </ul>

        <h3 style={h3Style}>5.6 Données techniques</h3>
        <ul style={listStyle}>
          <li>adresse IP de connexion ;</li>
          <li>type de navigateur et système d&apos;exploitation ;</li>
          <li>horodatage des actions sensibles (connexions, modifications de profil).</li>
        </ul>

        <p style={{ marginTop: 14 }}>
          Momento ne collecte <strong>aucune donnée sensible</strong> au sens de l&apos;article 1 de la loi 09-08 (origine raciale, opinion politique, conviction religieuse, état de santé, orientation sexuelle) de façon délibérée.
          Si de telles données apparaissent incidemment dans du contenu libre (ex. message), elles ne sont ni indexées, ni exploitées.
        </p>
      </Section>

      <Section id="s6" n={6} title="Destinataires et sous-traitants">
        <p>Les données sont accessibles :</p>
        <ul style={listStyle}>
          <li>à l&apos;équipe interne Momento strictement habilitée, dans le cadre de ses missions ;</li>
          <li>aux Prestataires auxquels vous choisissez d&apos;écrire (ils reçoivent les données strictement nécessaires : votre nom, email, message, et le cas échéant type / date d&apos;événement) ;</li>
          <li>à des sous-traitants techniques soumis à un contrat encadrant la protection des données :</li>
        </ul>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sous-traitant</th>
              <th style={thStyle}>Service</th>
              <th style={thStyle}>Localisation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Vercel Inc.</td>
              <td style={tdStyle}>Hébergement web</td>
              <td style={tdStyle}>États-Unis</td>
            </tr>
            <tr>
              <td style={tdStyle}>Neon Inc.</td>
              <td style={tdStyle}>Base de données PostgreSQL</td>
              <td style={tdStyle}>États-Unis / Europe</td>
            </tr>
            <tr>
              <td style={tdStyle}>Resend Inc.</td>
              <td style={tdStyle}>Envoi d&apos;emails transactionnels</td>
              <td style={tdStyle}>États-Unis</td>
            </tr>
            <tr>
              <td style={tdStyle}>Upstash Inc.</td>
              <td style={tdStyle}>Cache / limitation de débit (Redis)</td>
              <td style={tdStyle}>États-Unis / Europe</td>
            </tr>
            <tr>
              <td style={tdStyle}>Google LLC</td>
              <td style={tdStyle}>Authentification OAuth (Google Sign-In)</td>
              <td style={tdStyle}>États-Unis</td>
            </tr>
            <tr>
              <td style={tdStyle}>Meta Platforms Inc.</td>
              <td style={tdStyle}>Authentification OAuth (Facebook Login)</td>
              <td style={tdStyle}>États-Unis</td>
            </tr>
          </tbody>
        </table>
        <p>
          Les autorités administratives ou judiciaires peuvent également être destinataires des données en cas de réquisition légale régulièrement notifiée.
        </p>
      </Section>

      <Section id="s7" n={7} title="Transferts hors du Maroc">
        <p>
          Plusieurs sous-traitants listés ci-dessus sont établis en dehors du Maroc. Conformément à l&apos;article 43 de la loi 09-08, tout transfert de données vers un pays n&apos;assurant pas un niveau de protection équivalent est soumis à autorisation préalable de la CNDP.
        </p>
        <p>
          Momento a engagé ou engagera les démarches suivantes auprès de la CNDP :
        </p>
        <ul style={listStyle}>
          <li>déclaration normale des traitements ordinaires (gestion de comptes, newsletter, facturation) ;</li>
          <li>demande d&apos;autorisation pour le profilage (recommandations personnalisées) et les transferts de données vers les sous-traitants hors Maroc cités ci-dessus.</li>
        </ul>
        <p>
          Les sous-traitants sont engagés contractuellement à n&apos;utiliser les données que pour les finalités confiées par Momento et à respecter un niveau de sécurité conforme aux exigences de la loi 09-08.
        </p>
      </Section>

      <Section id="s8" n={8} title="Durée de conservation">
        <p>Les données sont conservées pendant les durées strictement nécessaires aux finalités, conformément à l&apos;article 4 de la loi 09-08 :</p>
        <ul style={listStyle}>
          <li><strong>Compte actif</strong> : pendant toute la durée d&apos;utilisation, et pendant 3 ans après la dernière activité ;</li>
          <li><strong>Compte supprimé</strong> : suppression effective dans un délai maximum de 30 jours, sauf pour les données couvertes par une obligation légale de conservation ;</li>
          <li><strong>Données de facturation</strong> : 10 ans (article 22 du Code de commerce marocain) ;</li>
          <li><strong>Messages</strong> : durée du compte, puis 3 ans par prescription commerciale ;</li>
          <li><strong>Logs de sécurité et données techniques</strong> : 12 mois ;</li>
          <li><strong>Données marketing</strong> : jusqu&apos;au retrait du consentement ou 3 ans d&apos;inactivité.</li>
        </ul>
      </Section>

      <Section id="s9" n={9} title="Vos droits">
        <p>Conformément aux articles 7 à 9 de la loi 09-08, vous disposez des droits suivants :</p>
        <ul style={listStyle}>
          <li><strong>Droit d&apos;information</strong> (art. 5) — connaître qui traite vos données et pourquoi ;</li>
          <li><strong>Droit d&apos;accès</strong> (art. 7) — obtenir une copie des données vous concernant ;</li>
          <li><strong>Droit de rectification</strong> (art. 8) — corriger une donnée inexacte ou incomplète ;</li>
          <li><strong>Droit de suppression</strong> (art. 8) — demander l&apos;effacement d&apos;une donnée ne relevant plus d&apos;une obligation légale ;</li>
          <li><strong>Droit d&apos;opposition</strong> (art. 9) — s&apos;opposer au traitement de vos données à des fins de prospection commerciale ou de profilage.</li>
        </ul>
        <p>
          Ces droits peuvent être exercés à tout moment, sans frais, à l&apos;exception des demandes manifestement infondées ou excessives (art. 7 al. 3 loi 09-08).
        </p>
      </Section>

      <Section id="s10" n={10} title="Modalités d'exercice des droits">
        <p>
          Pour exercer vos droits, vous pouvez :
        </p>
        <ul style={listStyle}>
          <li>utiliser les outils en libre-service disponibles depuis votre espace <em>Compte → Confidentialité</em> (export, rectification, suppression) ;</li>
          <li>ou adresser votre demande à <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a> en justifiant de votre identité.</li>
        </ul>
        <p>
          Momento s&apos;engage à répondre dans un délai maximum de <strong>30 jours</strong> à compter de la réception d&apos;une demande complète.
          En cas de demande complexe ou répétée, ce délai peut être prolongé ; vous en serez informé avec motivation.
        </p>
      </Section>

      <Section id="s11" n={11} title="Cookies et traceurs">
        <p>
          La Plateforme utilise des cookies strictement nécessaires au fonctionnement (session d&apos;authentification, préférences d&apos;affichage).
          Ces cookies ne requièrent pas de consentement au sens de la pratique CNDP en vigueur.
        </p>
        <p>
          Aucun cookie de suivi publicitaire tiers n&apos;est déployé à ce jour. Toute évolution fera l&apos;objet d&apos;une information préalable et d&apos;un mécanisme de consentement conforme.
        </p>
        <div role="alert" style={{
          margin: "var(--space-md, 16px) 0",
          padding: "var(--space-md, 16px)",
          border: "2px dashed #f59e0b",
          borderRadius: 12,
          background: "rgba(245, 158, 11, 0.08)",
          color: "var(--dash-text, #121317)",
          fontSize: "var(--text-sm, 14px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <strong style={{ color: "#f59e0b", fontSize: "var(--text-sm, 14px)" }}>
            ⚠️ À compléter avant lancement
          </strong>
          <span>Si des outils analytics ou de monitoring tiers sont ajoutés à l&apos;avenir (Google Analytics, Plausible, Sentry, etc.), prévoir un bandeau cookies avec opt-out conforme aux pratiques CNDP avant déploiement.</span>
        </div>
      </Section>

      <Section id="s12" n={12} title="Sécurité des données">
        <p>Conformément à l&apos;article 23 de la loi 09-08, Momento met en œuvre les mesures techniques et organisationnelles suivantes :</p>
        <ul style={listStyle}>
          <li>chiffrement des communications (HTTPS/TLS) ;</li>
          <li>stockage des mots de passe par hachage cryptographique (bcrypt) ;</li>
          <li>cloisonnement des accès internes, principe du moindre privilège ;</li>
          <li>sauvegardes régulières de la base de données ;</li>
          <li>journalisation des actions sensibles ;</li>
          <li>procédure de gestion des incidents de sécurité avec notification aux utilisateurs concernés.</li>
        </ul>
      </Section>

      <Section id="s13" n={13} title="Déclaration CNDP">
        <p>
          Le traitement de données personnelles opéré par Momento est en cours de déclaration auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP), conformément à l&apos;article 12 de la loi 09-08.
        </p>
        <p>
          Le numéro de récépissé sera publié dans la présente section dès délivrance par la CNDP.
        </p>
        <div role="alert" style={{
          margin: "var(--space-md, 16px) 0",
          padding: "var(--space-md, 16px)",
          border: "2px dashed #f59e0b",
          borderRadius: 12,
          background: "rgba(245, 158, 11, 0.08)",
          color: "var(--dash-text, #121317)",
          fontSize: "var(--text-sm, 14px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <strong style={{ color: "#f59e0b", fontSize: "var(--text-sm, 14px)" }}>
            ⚠️ À compléter avant lancement
          </strong>
          <span>Insérer le numéro de récépissé CNDP et la date de délivrance après dépôt de la déclaration auprès de la Commission.</span>
        </div>
      </Section>

      <Section id="s14" n={14} title="Modifications de la politique">
        <p>
          La présente politique peut être modifiée pour refléter les évolutions légales, techniques ou fonctionnelles de la Plateforme.
          Toute modification substantielle fait l&apos;objet d&apos;une notification par email ou par message in-app avec préavis minimum de 30 jours avant entrée en vigueur.
        </p>
      </Section>

      <Section id="s15" n={15} title="Réclamations">
        <p>
          En cas de difficulté dans l&apos;exercice de vos droits, vous pouvez adresser une réclamation :
        </p>
        <ul style={listStyle}>
          <li>à Momento, à <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a> ;</li>
          <li>à la <strong>CNDP</strong>, autorité de contrôle compétente au Maroc : <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.cndp.ma</a>.</li>
        </ul>
      </Section>

      <div style={contactBlockStyle}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>Questions sur vos données :</p>
        <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
          <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>
        </p>
      </div>
    </article>
  )
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={sectionStyle}>
      <h2 style={h2Style}><span style={sectionNumberStyle}>{n}.</span> {title}</h2>
      <div style={sectionBodyStyle}>{children}</div>
    </section>
  )
}

const articleStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 20, padding: "56px 48px",
  border: "1px solid rgba(183,191,217,0.22)",
  boxShadow: "0 4px 32px rgba(12,14,30,0.04)",
  lineHeight: 1.65, fontSize: "var(--text-base)", color: "#2a2b30",
}
const kickerStyle: React.CSSProperties = { fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E11D48", margin: "0 0 10px" }
const h1Style: React.CSSProperties = { fontSize: "var(--text-2xl)", fontWeight: 700, color: "#121317", letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 10px" }
const subtitleStyle: React.CSSProperties = { fontSize: "var(--text-base)", color: "#6a6a71", margin: "0 0 14px", lineHeight: 1.55 }
const metaStyle: React.CSSProperties = { fontSize: "var(--text-xs)", color: "#9a9aaa", margin: 0 }
const noticeStyle: React.CSSProperties = { padding: "16px 18px", background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.22)", borderRadius: 12, fontSize: "var(--text-sm)", color: "#715311", lineHeight: 1.55, marginBottom: 32 }
const tocStyle: React.CSSProperties = { padding: "20px 24px", background: "#fafafa", border: "1px solid rgba(183,191,217,0.22)", borderRadius: 14, marginBottom: 40 }
const tocTitleStyle: React.CSSProperties = { fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9aaa", margin: "0 0 10px" }
const tocListStyle: React.CSSProperties = { margin: 0, paddingLeft: 22, fontSize: "var(--text-sm)", columns: 2 as unknown as number, columnGap: 28 }
const tocLinkStyle: React.CSSProperties = { color: "#2a2b30", textDecoration: "none" }
const sectionStyle: React.CSSProperties = { marginBottom: 28, scrollMarginTop: 80 }
const h2Style: React.CSSProperties = { fontSize: "var(--text-md)", fontWeight: 700, color: "#121317", letterSpacing: "-0.015em", margin: "0 0 10px" }
const h3Style: React.CSSProperties = { fontSize: "var(--text-base)", fontWeight: 700, color: "#121317", margin: "16px 0 6px" }
const sectionNumberStyle: React.CSSProperties = { color: "#E11D48", marginRight: 6, fontWeight: 700 }
const sectionBodyStyle: React.CSSProperties = { fontSize: "var(--text-base)", color: "#2a2b30", lineHeight: 1.7 }
const strongNoticeStyle: React.CSSProperties = { padding: "12px 14px", background: "rgba(225,29,72,0.04)", borderLeft: "3px solid #E11D48", borderRadius: 6, fontWeight: 500, color: "#121317", margin: "0 0 14px" }
const listStyle: React.CSSProperties = { margin: "0 0 12px", paddingLeft: 22 }
const linkStyle: React.CSSProperties = { color: "#E11D48", textDecoration: "underline", textUnderlineOffset: 2 }
const contactBlockStyle: React.CSSProperties = { marginTop: 40, padding: "18px 22px", background: "#fafafa", borderRadius: 12, border: "1px solid rgba(183,191,217,0.22)" }
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", margin: "14px 0", fontSize: "var(--text-sm)" }
const thStyle: React.CSSProperties = { textAlign: "left", padding: "8px 10px", background: "#fafafa", border: "1px solid rgba(183,191,217,0.22)", fontWeight: 600, fontSize: "var(--text-sm)" }
const tdStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid rgba(183,191,217,0.22)", fontSize: "var(--text-sm)" }
