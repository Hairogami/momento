import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Momento",
  description: "Conditions Générales d'Utilisation de la plateforme Momento, marketplace événementielle au Maroc.",
}

// TODO_DECISION: raison sociale exacte (SARL Momento ?), siège social, RC, ICE,
// capital, tribunaux compétents, plafond de responsabilité. À compléter avant
// mise en ligne publique définitive. En attendant → mentions génériques.

const UPDATED_AT = "23 avril 2026"

export default function CguPage() {
  return (
    <article style={articleStyle}>
      <header style={{ marginBottom: 36 }}>
        <p style={kickerStyle}>Document juridique</p>
        <h1 style={h1Style}>Conditions Générales d&apos;Utilisation</h1>
        <p style={subtitleStyle}>
          Applicables à tout utilisateur du service Momento (clients organisateurs d&apos;événements et prestataires).
        </p>
        <p style={metaStyle}>Dernière mise à jour : {UPDATED_AT}</p>
      </header>

      {/* Disclaimer contextuel */}
      <div style={noticeStyle}>
        <strong style={{ display: "block", marginBottom: 6 }}>Document en cours de finalisation juridique</strong>
        Ces CGU sont en cours de relecture par un avocat d&apos;affaires marocain avant le lancement public de la plateforme.
        Certaines mentions (raison sociale, RC, ICE, n° récépissé CNDP, tribunaux compétents) seront renseignées après création de la société et déclaration CNDP.
      </div>

      {/* Table des matières */}
      <nav style={tocStyle}>
        <p style={tocTitleStyle}>Sommaire</p>
        <ol style={tocListStyle}>
          {[
            "Objet et champ d'application",
            "Définitions",
            "Acceptation des CGU",
            "Statut de Momento — intermédiaire technique",
            "Inscription et compte utilisateur",
            "Services gratuits (plan Free)",
            "Services payants — abonnement Pro",
            "Services payants — Pro + Planner",
            "Droit de rétractation et remboursement",
            "Obligations des utilisateurs clients",
            "Obligations des prestataires",
            "Vérification des prestataires",
            "Contenu utilisateur et licence",
            "Paiement des prestations",
            "Propriété intellectuelle",
            "Responsabilité",
            "Services additionnels (faire-part, sites événement, partenariats)",
            "Résiliation et suspension",
            "Modification des CGU",
            "Droit applicable et litiges",
          ].map((label, i) => (
            <li key={label} style={{ marginBottom: 4 }}>
              <a href={`#s${i + 1}`} style={tocLinkStyle}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <Section id="s1" n={1} title="Objet et champ d'application">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après « <strong>CGU</strong> ») régissent l&apos;utilisation du service Momento,
          accessible à l&apos;adresse <a href="https://momentoevents.app" style={linkStyle}>momentoevents.app</a> (ci-après la « <strong>Plateforme</strong> »).
        </p>
        <p>
          Momento est une plateforme numérique qui met en relation des organisateurs d&apos;événements (ci-après « <strong>Clients</strong> ») et des prestataires de services événementiels (ci-après « <strong>Prestataires</strong> ») au Maroc,
          en vue de la conclusion éventuelle de contrats directs entre eux.
        </p>
        <p>
          Les CGU s&apos;appliquent à tout visiteur, utilisateur enregistré, Client ou Prestataire, dès lors qu&apos;il accède à la Plateforme ou à ses services.
        </p>
      </Section>

      <Section id="s2" n={2} title="Définitions">
        <dl style={dlStyle}>
          <dt>Plateforme</dt>
          <dd>L&apos;ensemble du site web, des applications et services accessibles via momentoevents.app.</dd>
          <dt>Utilisateur</dt>
          <dd>Toute personne physique ou morale qui accède à la Plateforme, qu&apos;elle soit inscrite ou non.</dd>
          <dt>Client</dt>
          <dd>Utilisateur inscrit qui organise un événement et recherche des Prestataires.</dd>
          <dt>Prestataire</dt>
          <dd>Professionnel (personne physique ou morale) inscrit en tant que tel pour proposer ses services événementiels.</dd>
          <dt>Planner</dt>
          <dd>Espace d&apos;organisation d&apos;un événement rattaché au compte d&apos;un Client (gestion des tâches, budget, invités, prestataires sélectionnés).</dd>
          <dt>Contenu</dt>
          <dd>Tout texte, photo, vidéo, avis, message, logo ou média publié ou transmis via la Plateforme.</dd>
          <dt>Compte</dt>
          <dd>Espace personnel accessible après inscription via identifiants (email/mot de passe ou authentification tierce Google/Facebook/lien magique).</dd>
        </dl>
      </Section>

      <Section id="s3" n={3} title="Acceptation des CGU">
        <p>
          L&apos;inscription sur la Plateforme emporte acceptation expresse et sans réserve des présentes CGU.
          L&apos;acceptation se matérialise par une case à cocher obligatoire lors de la création du compte ou de la connexion via un fournisseur d&apos;identité tiers.
        </p>
        <p>
          Conformément à la loi marocaine n° 53-05 du 30 novembre 2007 relative à l&apos;échange électronique de données juridiques,
          cette acceptation numérique a la même valeur contractuelle qu&apos;une signature manuscrite.
        </p>
        <p>
          Si l&apos;Utilisateur n&apos;accepte pas tout ou partie des CGU, il doit renoncer à l&apos;inscription et à l&apos;utilisation de la Plateforme.
        </p>
      </Section>

      <Section id="s4" n={4} title="Statut de Momento — intermédiaire technique">
        <p style={strongNoticeStyle}>
          Momento agit en qualité d&apos;intermédiaire technique au sens de l&apos;article 405 du Dahir des Obligations et Contrats.
          Momento n&apos;est partie à aucun contrat conclu entre un Client et un Prestataire.
        </p>
        <p>
          Le rôle de Momento se limite à :
        </p>
        <ul style={listStyle}>
          <li>mettre à disposition des outils techniques permettant aux Utilisateurs de se rencontrer, échanger, s&apos;organiser ;</li>
          <li>présenter les Prestataires inscrits selon des critères de recherche définis par les Clients ;</li>
          <li>fournir aux Clients des outils d&apos;organisation personnelle (budget, tâches, invités, calendrier, messagerie).</li>
        </ul>
        <p>
          <strong>Momento ne fournit pas les prestations elles-mêmes</strong> et n&apos;est en aucun cas considéré comme co-contractant, mandataire, garant ou assureur des Prestataires.
          Tout contrat, devis, commande, ou prestation conclu à la suite d&apos;une mise en relation opérée via la Plateforme est un contrat direct entre le Client et le Prestataire.
        </p>
        <p>
          Conformément à l&apos;article 406 du DOC, Momento s&apos;engage à agir avec bonne foi dans la mise en relation, mais ne garantit pas la conclusion effective d&apos;un contrat, ni son issue.
        </p>
      </Section>

      <Section id="s5" n={5} title="Inscription et compte utilisateur">
        <p>
          L&apos;inscription est gratuite et ouverte à toute personne ayant la capacité juridique de contracter selon le droit marocain.
          Les mineurs doivent obtenir le consentement préalable de leur représentant légal.
        </p>
        <p>
          L&apos;Utilisateur peut s&apos;inscrire :
        </p>
        <ul style={listStyle}>
          <li>via email et mot de passe ;</li>
          <li>via un fournisseur d&apos;identité tiers (Google, Facebook) ;</li>
          <li>via un lien magique envoyé par email.</li>
        </ul>
        <p>
          L&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour, et à les maintenir à jour.
          Tout compte créé sur la base d&apos;informations fausses peut être suspendu ou supprimé sans préavis.
        </p>
        <p>
          Le Compte est strictement personnel. L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son Compte.
        </p>
      </Section>

      <Section id="s6" n={6} title="Services gratuits (plan Free)">
        <p>
          Le plan <strong>Free</strong> est gratuit et sans engagement. Il donne accès à :
        </p>
        <ul style={listStyle}>
          <li>la création d&apos;un (1) événement ;</li>
          <li>l&apos;exploration illimitée de l&apos;annuaire des Prestataires ;</li>
          <li>les outils de base : budget total, notes personnelles, compte à rebours.</li>
        </ul>
        <p>
          Momento se réserve le droit de modifier les fonctionnalités incluses dans le plan Free à tout moment, moyennant préavis raisonnable publié sur la Plateforme.
        </p>
      </Section>

      <Section id="s7" n={7} title="Services payants — abonnement Pro">
        <p>
          L&apos;abonnement <strong>Pro</strong> est un service payant proposé aux Clients au tarif de <strong>200 MAD toutes taxes comprises par mois</strong>, renouvelable mensuellement par tacite reconduction.
        </p>
        <p>
          Il donne accès à :
        </p>
        <ul style={listStyle}>
          <li>un nombre illimité d&apos;événements ;</li>
          <li>la messagerie directe avec les Prestataires ;</li>
          <li>la checklist temporelle calculée selon la date de l&apos;événement ;</li>
          <li>la gestion des invités ;</li>
          <li>le budget détaillé avec analyse automatisée par catégorie ;</li>
          <li>les favoris et le thème personnalisé.</li>
        </ul>
        <p>
          Conformément à l&apos;article 29 de la loi 31-08 relative à la protection du consommateur, les informations suivantes sont fournies avant la souscription : prix TTC, modalités de paiement,
          durée du contrat (mensuelle), conditions de résiliation (voir article 18 des présentes CGU) et existence du droit de rétractation (voir article 9 ci-après).
        </p>
        <p>
          La résiliation peut être effectuée à tout moment depuis l&apos;espace Compte. Elle prend effet à la fin de la période mensuelle en cours.
        </p>
      </Section>

      <Section id="s8" n={8} title="Services payants — Pro + Planner">
        <p>
          L&apos;abonnement <strong>Pro + Planner</strong> est un service payant au tarif de <strong>500 MAD toutes taxes comprises par mois</strong>.
          Il inclut toutes les fonctionnalités du plan Pro, ainsi que l&apos;accès à un wedding planner humain et à un agent IA d&apos;assistance à l&apos;organisation.
        </p>
        <p>
          Momento agit, pour ce service, en qualité d&apos;intermédiaire entre le Client et le wedding planner. Une <strong>commission de 20 %</strong> est prélevée par Momento sur les honoraires facturés par le wedding planner au Client,
          au titre de la mise en relation (article 405 DOC). Cette commission est transparente et rappelée lors de toute souscription.
        </p>
        <p>
          Le contrat de prestation avec le wedding planner est conclu directement entre le Client et le wedding planner. Momento ne garantit ni la qualité, ni le résultat, ni la disponibilité du wedding planner.
        </p>
      </Section>

      <Section id="s9" n={9} title="Droit de rétractation et remboursement">
        <p>
          Conformément à l&apos;article 36 de la loi 31-08, le Client consommateur dispose d&apos;un délai de <strong>sept (7) jours francs</strong> à compter de la souscription d&apos;un abonnement payant pour exercer son droit de rétractation, sans avoir à justifier de motif.
        </p>
        <p>
          L&apos;exercice du droit de rétractation s&apos;effectue par simple demande écrite à <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>.
          Le remboursement intégral est effectué dans un délai maximum de <strong>quinze (15) jours</strong> suivant la réception de la demande, conformément à l&apos;article 37 de la loi 31-08.
        </p>
        <p>
          Conformément à l&apos;article 38 de la loi 31-08, le droit de rétractation ne peut s&apos;exercer lorsque le Client a expressément demandé l&apos;exécution immédiate du service et que ce service a été pleinement exécuté avant l&apos;expiration du délai de rétractation.
        </p>
      </Section>

      <Section id="s10" n={10} title="Obligations des utilisateurs clients">
        <p>Le Client s&apos;engage à :</p>
        <ul style={listStyle}>
          <li>fournir des informations exactes lors de son inscription et tout au long de l&apos;utilisation de la Plateforme ;</li>
          <li>respecter les lois et règlements en vigueur au Maroc ;</li>
          <li>ne pas publier de contenu illicite, diffamatoire, injurieux, discriminatoire, ou portant atteinte aux droits de tiers ;</li>
          <li>ne pas utiliser la Plateforme à des fins contraires à son objet (démarchage massif, spam, revente de services tiers, usurpation d&apos;identité) ;</li>
          <li>s&apos;abstenir de contourner les mesures techniques de sécurité ou de protection des données.</li>
        </ul>
      </Section>

      <Section id="s11" n={11} title="Obligations des prestataires">
        <p>Le Prestataire s&apos;engage à :</p>
        <ul style={listStyle}>
          <li>fournir des informations exactes sur son activité (raison sociale, services, tarifs indicatifs, zone d&apos;intervention) ;</li>
          <li>disposer des autorisations, licences ou qualifications professionnelles éventuellement requises par la réglementation applicable à son activité ;</li>
          <li>répondre aux demandes de Clients dans un délai raisonnable ;</li>
          <li>exécuter les prestations conclues avec le Client conformément au contrat direct passé entre eux ;</li>
          <li>respecter les dispositions de la loi 31-08 sur la protection du consommateur lorsqu&apos;il contracte avec un Client consommateur ;</li>
          <li>ne pas contourner la Plateforme pour conclure des prestations hors des canaux de Momento, dès lors que la mise en relation est intervenue via la Plateforme, tant que l&apos;abonnement Prestataire est actif.</li>
        </ul>
        <p>
          Conformément au précédent posé par le Conseil de la concurrence en juillet 2025, aucune clause d&apos;exclusivité n&apos;est imposée au Prestataire :
          le Prestataire reste libre d&apos;exercer son activité sur d&apos;autres canaux, plateformes ou points de contact.
        </p>
      </Section>

      <Section id="s12" n={12} title="Vérification des prestataires">
        <p>
          Momento peut procéder à des contrôles raisonnables sur l&apos;identité, les licences professionnelles et les comptes publics (réseaux sociaux, site web) des Prestataires.
          Ces contrôles constituent une <strong>obligation de moyens</strong> et non une obligation de résultat.
        </p>
        <p>
          Les mentions « vérifié », « recommandé » ou similaires affichées sur un profil Prestataire n&apos;emportent aucune garantie de qualité, de ponctualité, de disponibilité, ni de solvabilité du Prestataire.
          Le Client reste seul juge de l&apos;opportunité de conclure un contrat avec un Prestataire donné.
        </p>
      </Section>

      <Section id="s13" n={13} title="Contenu utilisateur et licence">
        <p>
          L&apos;Utilisateur reste titulaire des droits de propriété intellectuelle sur les contenus qu&apos;il publie (photos, descriptifs, avis, messages).
        </p>
        <p>
          En publiant un Contenu sur la Plateforme, l&apos;Utilisateur concède à Momento une licence non-exclusive, mondiale, gratuite,
          pour la durée légale des droits d&apos;auteur, aux fins de : héberger, reproduire, adapter techniquement, afficher,
          distribuer via la Plateforme, et promouvoir les services Momento.
        </p>
        <p>
          Momento peut modérer, refuser ou retirer tout Contenu qui lui paraît illicite, inapproprié ou contraire aux présentes CGU,
          sans préavis ni justification. Un signalement peut être adressé à <a href="mailto:contact@momentoevents.app" style={linkStyle}>contact@momentoevents.app</a>.
        </p>
      </Section>

      <Section id="s14" n={14} title="Paiement des prestations">
        <p>
          Les prestations conclues entre un Client et un Prestataire font l&apos;objet d&apos;un paiement <strong>direct</strong> entre les parties.
          Momento n&apos;intervient pas dans les flux financiers liés aux prestations elles-mêmes et n&apos;encaisse aucune somme pour le compte du Prestataire.
        </p>
        <p>
          Seuls les abonnements Pro et Pro + Planner sont encaissés par Momento, via un prestataire de paiement agréé au Maroc.
          Les factures sont émises au nom de l&apos;Utilisateur et disponibles depuis son espace Compte.
        </p>
        <p>
          Si Momento devait, à l&apos;avenir, proposer un service de paiement intégré à la Plateforme, ce service ferait l&apos;objet de conditions spécifiques et d&apos;une mise en conformité préalable avec la loi 103-12 relative aux établissements de crédit et organismes assimilés.
        </p>
      </Section>

      <Section id="s15" n={15} title="Propriété intellectuelle">
        <p>
          La marque Momento, le logo, la charte graphique, les textes éditoriaux, les bases de données et les codes informatiques de la Plateforme sont la propriété exclusive de Momento, ou utilisés sous licence.
          Toute reproduction, représentation, adaptation, extraction ou réutilisation sans autorisation écrite préalable est interdite.
        </p>
        <p>
          Cette interdiction s&apos;applique notamment à toute extraction automatisée (scraping) de l&apos;annuaire des Prestataires ou de tout autre contenu de la Plateforme.
        </p>
      </Section>

      <Section id="s16" n={16} title="Responsabilité">
        <p>Momento s&apos;engage à mettre en œuvre tous les moyens raisonnables pour assurer la disponibilité et la sécurité de la Plateforme, sans toutefois garantir une disponibilité ininterrompue.</p>
        <p>Momento décline expressément toute responsabilité concernant :</p>
        <ul style={listStyle}>
          <li>la qualité, la conformité, la réalité, la ponctualité ou la sécurité des prestations fournies par les Prestataires ;</li>
          <li>les litiges, différends, manquements ou préjudices survenant dans la relation directe Client ↔ Prestataire ;</li>
          <li>l&apos;exactitude des informations, avis ou contenus publiés par les Utilisateurs ;</li>
          <li>les pannes, ralentissements ou interruptions imputables à des prestataires techniques tiers (hébergement, messagerie, fournisseurs d&apos;identité) ;</li>
          <li>les conséquences de la divulgation par l&apos;Utilisateur de ses propres identifiants.</li>
        </ul>
        <p>
          La responsabilité de Momento ne pourra en aucun cas être engagée pour un dommage indirect (perte de chance, perte commerciale, atteinte à l&apos;image).
          {/* TODO_DECISION: plafond contractuel — décision business. À insérer (ex. "limitée à 12 mois d'abonnement effectivement versés") après validation par avocat. */}
        </p>
        <p>
          Le Client et le Prestataire s&apos;engagent à tenter une résolution amiable de leurs différends.
          Momento peut, à titre de facilitateur non-obligatoire, proposer une assistance de médiation, sans que cela fasse naître une quelconque obligation ou responsabilité à sa charge.
        </p>
      </Section>

      <Section id="s17" n={17} title="Services additionnels (faire-part, sites événement, partenariats)">
        <h3 style={h3Style}>17.1 Faire-part numériques et contenus générés par IA</h3>
        <p>
          Momento peut proposer la création de faire-part numériques, assistée par intelligence artificielle.
          Les designs générés par les outils IA sont fournis « en l&apos;état », sans garantie d&apos;originalité absolue ni de titularité exclusive.
        </p>
        <p>
          L&apos;Utilisateur reste libre d&apos;utiliser les faire-part générés dans le cadre strictement privé de son événement.
          Momento conserve une licence non-exclusive sur les prompts et les rendus, aux fins d&apos;amélioration du service et de constitution de galeries d&apos;inspiration anonymisées.
        </p>

        <h3 style={h3Style}>17.2 Sites événement personnalisés</h3>
        <p>
          Momento peut héberger, pour le compte de l&apos;Utilisateur, des mini-sites personnalisés dédiés à son événement (informations pratiques, RSVP, galerie).
          À ce titre, Momento agit comme hébergeur technique au sens de la loi 53-05. Momento n&apos;a pas d&apos;obligation générale de surveillance des contenus hébergés mais procède à leur retrait dans un délai raisonnable après signalement motivé.
        </p>

        <h3 style={h3Style}>17.3 Marketplace de partenariats</h3>
        <p>
          Momento peut introduire, après publication d&apos;un avenant aux présentes CGU, des services payants avec partenaires tiers (marketplace festivals, stands restauration lors de mariages, liste de cadeaux).
          Lorsqu&apos;applicable, Momento prélève une commission transparente (10 % à 20 % selon le type de service), communiquée avant toute transaction.
        </p>

        <h3 style={h3Style}>17.4 Recommandations personnalisées et profilage</h3>
        <p>
          La Plateforme propose des recommandations de Prestataires basées sur les préférences exprimées par le Client (catégories, budget, localisation, événements préalablement consultés).
          Ce traitement constitue un <strong>profilage</strong> au sens de la loi 09-08. Le Client peut s&apos;y opposer à tout moment depuis son espace Compte, conformément à l&apos;article 9 de ladite loi.
        </p>
      </Section>

      <Section id="s18" n={18} title="Résiliation et suspension">
        <p>
          L&apos;Utilisateur peut supprimer son Compte à tout moment depuis son espace Compte. La suppression entraîne la clôture du Compte dans les conditions prévues à l&apos;article 9 de la Politique de confidentialité.
        </p>
        <p>
          Momento peut suspendre ou résilier l&apos;accès d&apos;un Utilisateur, sans préavis et sans indemnité, en cas de :
        </p>
        <ul style={listStyle}>
          <li>manquement grave aux présentes CGU ;</li>
          <li>fraude, usurpation d&apos;identité, impayé ;</li>
          <li>atteinte à la sécurité, à l&apos;intégrité ou à la réputation de la Plateforme ;</li>
          <li>réquisition ou décision d&apos;une autorité compétente.</li>
        </ul>
      </Section>

      <Section id="s19" n={19} title="Modification des CGU">
        <p>
          Momento se réserve le droit de modifier les présentes CGU. Toute modification substantielle fera l&apos;objet d&apos;une notification par email ou par message in-app au moins <strong>trente (30) jours</strong> avant son entrée en vigueur.
        </p>
        <p>
          La poursuite de l&apos;utilisation de la Plateforme après l&apos;entrée en vigueur des nouvelles CGU emporte acceptation. L&apos;Utilisateur qui refuse les nouvelles CGU peut résilier son Compte sans pénalité avant leur entrée en vigueur.
        </p>
      </Section>

      <Section id="s20" n={20} title="Droit applicable et litiges">
        <p>
          Les présentes CGU sont régies par le droit marocain.
        </p>
        <p>
          Tout litige relatif à la formation, l&apos;interprétation ou l&apos;exécution des présentes CGU sera soumis, à défaut de résolution amiable,
          aux tribunaux compétents de la ville du siège social de Momento.
          {/* TODO_DECISION: préciser la ville (par défaut Casablanca, à confirmer selon siège social effectif de la SARL). */}
        </p>
        <p>
          Les Clients consommateurs conservent leurs droits d&apos;action devant les juridictions de leur domicile conformément à la loi 31-08.
        </p>
      </Section>

      {/* Contact */}
      <div style={contactBlockStyle}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Pour toute question sur ces CGU :</p>
        <p style={{ margin: 0, fontSize: 14 }}>
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
  background: "#fff",
  borderRadius: 20,
  padding: "56px 48px",
  border: "1px solid rgba(183,191,217,0.22)",
  boxShadow: "0 4px 32px rgba(12,14,30,0.04)",
  lineHeight: 1.65,
  fontSize: 15,
  color: "#2a2b30",
}

const kickerStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "#E11D48", margin: "0 0 10px",
}

const h1Style: React.CSSProperties = {
  fontSize: 34, fontWeight: 700, color: "#121317",
  letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 10px",
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 15, color: "#6a6a71", margin: "0 0 14px", lineHeight: 1.55,
}

const metaStyle: React.CSSProperties = {
  fontSize: 12, color: "#9a9aaa", margin: 0,
}

const noticeStyle: React.CSSProperties = {
  padding: "16px 18px",
  background: "rgba(234,179,8,0.07)",
  border: "1px solid rgba(234,179,8,0.22)",
  borderRadius: 12,
  fontSize: 13, color: "#715311", lineHeight: 1.55,
  marginBottom: 32,
}

const tocStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#fafafa",
  border: "1px solid rgba(183,191,217,0.22)",
  borderRadius: 14,
  marginBottom: 40,
}

const tocTitleStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#9a9aaa",
  margin: "0 0 10px",
}

const tocListStyle: React.CSSProperties = {
  margin: 0, paddingLeft: 22, fontSize: 13, columns: 2 as unknown as number, columnGap: 28,
}

const tocLinkStyle: React.CSSProperties = {
  color: "#2a2b30", textDecoration: "none",
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 28, scrollMarginTop: 80,
}

const h2Style: React.CSSProperties = {
  fontSize: 20, fontWeight: 700, color: "#121317",
  letterSpacing: "-0.015em", margin: "0 0 10px",
}

const h3Style: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, color: "#121317",
  margin: "16px 0 6px",
}

const sectionNumberStyle: React.CSSProperties = {
  color: "#E11D48", marginRight: 6, fontWeight: 700,
}

const sectionBodyStyle: React.CSSProperties = {
  fontSize: 15, color: "#2a2b30", lineHeight: 1.7,
}

const strongNoticeStyle: React.CSSProperties = {
  padding: "12px 14px",
  background: "rgba(225,29,72,0.04)",
  borderLeft: "3px solid #E11D48",
  borderRadius: 6,
  fontWeight: 600, color: "#121317",
  margin: "0 0 14px",
}

const listStyle: React.CSSProperties = {
  margin: "0 0 12px", paddingLeft: 22,
}

const linkStyle: React.CSSProperties = {
  color: "#E11D48", textDecoration: "underline", textUnderlineOffset: 2,
}

const dlStyle: React.CSSProperties = {
  margin: 0,
}

const contactBlockStyle: React.CSSProperties = {
  marginTop: 40,
  padding: "18px 22px",
  background: "#fafafa",
  borderRadius: 12,
  border: "1px solid rgba(183,191,217,0.22)",
}
