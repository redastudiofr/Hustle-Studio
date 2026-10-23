import type {LegalDocument} from './legal';
import {BRAND} from '~/config/brand';
import {LEGAL, LEGAL_PLACEHOLDER} from '~/config/legal';

/** Brand name, contact and company details — all from app/config. */
const B = BRAND.name;
const C = LEGAL.company;
const EMAIL = C.email || BRAND.email || LEGAL_PLACEHOLDER;
const MAILTO = EMAIL.startsWith('[') ? undefined : `mailto:${EMAIL}`;

/**
 * The French versions of the store's legal and service documents.
 *
 * Same five documents as the English set in ./legal.ts, same handles, same
 * order — the site simply serves the set matching the chosen language. They
 * live in their own file because legal prose is written, not interpolated:
 * translating fragment by fragment through the dictionary would have made
 * every sentence unreadable in both languages at once.
 *
 * For a shop selling from France to French consumers, this is the version
 * that governs: the mentions légales are a French legal filing, and the terms
 * of sale a French customer agrees to should be the ones they can actually
 * read.
 */
export const LEGAL_DOCUMENTS_FR: LegalDocument[] = [
  {
    handle: 'privacy',
    title: 'politique de confidentialité',
    navLabel: 'confidentialité',
    intro:
      'Ce que nous collectons, pourquoi, et ce que vous pouvez nous demander à ce sujet.',
    updated: LEGAL.updated.fr,
    sections: [
      {
        heading: 'qui est responsable',
        body: [
          `La société qui exploite ce site est responsable du traitement des données personnelles collectées via ce site — son identité complète figure dans nos mentions légales. Pour toute question sur vos données, écrivez-nous depuis la page contact : nous vous répondrons.`,
        ],
      },
      {
        heading: 'ce que nous collectons',
        body: [
          `Nous ne collectons que ce que vous choisissez de nous envoyer via les formulaires du site :`,
        ],
        list: [
          'formulaire de contact — votre nom, votre adresse e-mail et votre message',
          'newsletter — votre adresse e-mail, et votre prénom si vous l’indiquez',
          'offre de bienvenue — votre numéro de téléphone, si vous demandez le code',
          'données techniques — adresse IP et navigateur, dans les journaux du serveur de l’hébergeur, nécessaires au fonctionnement et à la sécurité du site',
        ],
      },
      {
        heading: 'pourquoi, et sur quelle base légale',
        body: [
          `Pour répondre à vos messages : parce que vous nous l’avez demandé.`,
          `Pour vous envoyer nos nouveautés et offres : parce que vous y avez consenti, et jusqu’à ce que vous le retiriez.`,
          `Pour sécuriser le site : parce que nous avons un intérêt légitime à ce qu’il fonctionne et ne soit pas détourné.`,
        ],
      },
      {
        heading: 'qui y a accès',
        body: [
          `Nos sous-traitants, et personne d’autre : ${LEGAL.host.name} héberge le site ; Resend (resend.com) achemine jusqu’à notre boîte e-mail les messages envoyés via les formulaires du site.`,
          `Nous ne vendons pas vos données. Nous ne les louons pas. Nous ne les échangeons pas contre de la visibilité.`,
          `Certains de ces prestataires opèrent hors de l’Union européenne. Dans ce cas, les transferts sont encadrés par les clauses contractuelles types de la Commission européenne.`,
        ],
      },
      {
        heading: 'durées de conservation',
        body: [
          `Messages envoyés via le formulaire de contact : le temps nécessaire pour y répondre.`,
          `Données de newsletter et d’offre de bienvenue : jusqu’à votre désinscription, puis suppression.`,
        ],
      },
      {
        heading: 'vos droits',
        body: [
          `Le RGPD vous permet de demander une copie de vos données, leur rectification, leur effacement, la limitation de leur traitement ou leur portabilité vers un autre prestataire. Vous pouvez vous opposer à un traitement fondé sur l’intérêt légitime et retirer à tout moment votre consentement aux communications commerciales — chaque e-mail comporte un lien de désinscription.`,
          `Écrivez-nous depuis la page contact. Nous répondons sous un mois. Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL (cnil.fr).`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `Nous n’utilisons que ce dont le site a besoin pour fonctionner : un cookie qui retient votre langue, et un autre qui retient que vous avez déjà demandé l’offre de bienvenue. Aucune mesure d’audience, aucun pixel publicitaire (Meta, TikTok, Google Ads ou équivalent). Vous pouvez bloquer les cookies depuis les réglages de votre navigateur à tout moment.`,
          `Le pop-up de bienvenue enregistre le fait d’avoir été affiché, dans votre navigateur uniquement. Cet enregistrement ne quitte jamais votre appareil et ne nous apprend rien sur vous.`,
        ],
      },
    ],
  },

  {
    handle: 'legal-notice',
    title: 'mentions légales',
    navLabel: 'mentions légales',
    intro:
      "L'éditeur du site, l'hébergement, la propriété intellectuelle et les données personnelles.",
    updated: LEGAL.updated.fr,
    sections: [
      {
        heading: 'éditeur du site',
        body: [`Le présent site est édité par :`],
        fields: [
          {label: 'Nom / raison sociale', value: C.name},
          {label: 'Nom commercial', value: B},
          {label: 'Forme juridique', value: C.form},
          {label: 'Siège social', value: C.address},
          {label: 'SIREN', value: C.siren},
          {label: 'SIRET', value: C.siret},
          {label: 'Numéro de TVA intracommunautaire', value: C.vat},
          {label: 'Représentants légaux', value: C.representatives},
          {label: 'Contact', value: EMAIL, href: MAILTO},
          {label: 'Téléphone', value: C.phone},
        ],
      },
      {
        heading: 'hébergement',
        body: [
          `Ce site est hébergé par ${LEGAL.host.name}, ${LEGAL.host.address} (${LEGAL.host.website}).`,
          `Aucun achat ne peut être effectué sur ce site.`,
        ],
      },
      {
        heading: 'propriété intellectuelle',
        body: [
          `L'ensemble des éléments présents sur le site ${B}, notamment les textes, photographies, images, logos, graphismes, icônes, éléments visuels, produits et mise en page, est protégé par les dispositions applicables en matière de propriété intellectuelle.`,
          `Toute reproduction, représentation, modification, adaptation ou exploitation, totale ou partielle, de ces éléments sans autorisation préalable est interdite, sauf dans les cas prévus par la loi.`,
        ],
      },
      {
        heading: 'données personnelles',
        body: [
          `Dans le cadre du fonctionnement du site, ${B} est susceptible de collecter et de traiter certaines données personnelles, notamment dans les situations suivantes :`,
        ],
        list: [
          'Contact : informations transmises via la page de contact, afin de répondre aux demandes.',
          'Newsletter et offres commerciales : adresse e-mail ou numéro de téléphone communiqué volontairement, sous réserve du consentement requis.',
          'Sécurité : données techniques nécessaires au fonctionnement du site, à sa sécurisation et à la prévention des abus.',
        ],
      },
      {
        heading: 'données personnelles — vos droits',
        body: [
          `Les données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont collectées, conformément à la réglementation applicable, notamment au Règlement général sur la protection des données (RGPD).`,
          `Conformément à la réglementation, vous disposez, selon les conditions applicables, de droits d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition et de portabilité de vos données. Vous pouvez également retirer votre consentement aux communications marketing à tout moment.`,
          `Pour exercer vos droits, vous pouvez nous contacter à l'adresse suivante : ${EMAIL}, ou utiliser la page de contact du site.`,
          `Pour connaître précisément les données collectées, leurs finalités, leurs durées de conservation et leurs destinataires, veuillez consulter notre Politique de confidentialité.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `Ce site n'utilise que les cookies nécessaires à son fonctionnement (préférence de langue, offre de bienvenue déjà demandée). Il n'utilise aucun outil de mesure d'audience ni traceur publicitaire.`,
          `Vous pouvez gérer les cookies depuis les paramètres de votre navigateur.`,
        ],
      },
      {
        heading: 'responsabilité',
        body: [
          `${B} s'efforce de maintenir les informations présentes sur ce site aussi exactes et à jour que possible.`,
          `${B} ne saurait être tenu responsable des interruptions temporaires du site liées à la maintenance, à des problèmes techniques ou à des événements indépendants de sa volonté, dans les limites prévues par la loi.`,
        ],
      },
      {
        heading: 'médiation et résolution des litiges',
        body: [
          `Conformément au Code de la consommation, tout consommateur peut, sous réserve des conditions légales applicables, recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige avec un professionnel.`,
          `Les coordonnées du médiateur compétent doivent être communiquées après désignation effective de celui-ci et conformément aux obligations légales applicables.`,
          `Pour les litiges transfrontaliers, les consommateurs peuvent également consulter les informations et services officiels de l'Union européenne relatifs à la résolution des litiges de consommation.`,
        ],
      },
      {
        heading: 'nous contacter',
        body: [
          `Pour toute question concernant ces mentions légales ou vos données personnelles, vous pouvez nous contacter :`,
        ],
        fields: [
          {label: 'E-mail', value: EMAIL, href: MAILTO},
          {label: 'Téléphone', value: C.phone},
          {label: 'Adresse', value: C.address},
        ],
        cta: {label: 'écrire depuis la page contact', to: '/contact'},
      },
    ],
  },
];
