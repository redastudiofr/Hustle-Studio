import type {LegalDocument} from './legal';
import {BRAND} from '~/config/brand';
import {LEGAL, LEGAL_PLACEHOLDER} from '~/config/legal';

/** Brand name, contact and company details — all from app/config. */
const B = BRAND.name;
const C = LEGAL.company;
const EMAIL = C.email || BRAND.email || LEGAL_PLACEHOLDER;
const MAILTO = EMAIL.startsWith('[') ? undefined : `mailto:${EMAIL}`;
const RETURN_DAYS = LEGAL.returnDays;


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
    handle: 'terms',
    title: 'conditions générales de vente',
    navLabel: 'conditions générales',
    intro:
      `Les conditions dans lesquelles ${B} vous vend ses pièces, et les règles d’utilisation de ce site.`,
    updated: LEGAL.updated.fr,
    sections: [
      {
        heading: '1. qui nous sommes',
        body: [
          `Dans les présentes conditions, « nous » et « ${B} » désignent la société qui exploite cette boutique, et « vous » désigne la personne qui passe commande ou consulte le site.`,
          `Ces conditions s’appliquent à toute commande passée sur cette boutique. Passer commande vaut acceptation : merci de les lire avant d’acheter. Nous pouvons les modifier à tout moment ; la version applicable à votre commande est celle publiée au moment où vous la passez.`,
        ],
      },
      {
        heading: '2. les produits',
        body: [
          `Nous décrivons et photographions chaque pièce avec le plus de fidélité possible. Les écrans restituent les couleurs différemment : une légère variation entre la photo et le vêtement est normale et ne constitue pas un défaut.`,
          `Nos pièces sont produites en séries limitées. La disponibilité affichée sur le site est indicative : si un article est épuisé entre votre commande et sa préparation, nous vous prévenons et vous remboursons intégralement cet article.`,
        ],
      },
      {
        heading: '3. les prix',
        body: [
          `Les prix sont affichés en euros, toutes taxes comprises (TVA française). Les frais de livraison sont calculés au moment du paiement et affichés avant validation : le total que vous confirmez est le total qui vous est débité.`,
          `Nous pouvons modifier nos prix à tout moment. Le prix applicable à votre commande est celui affiché au moment où vous la confirmez.`,
          `Si un article est affiché à un prix manifestement erroné — une virgule mal placée, une surchemise à 10 € — nous pouvons annuler la commande et vous rembourser intégralement plutôt que de l’honorer. Nous vous contactons au préalable.`,
        ],
      },
      {
        heading: '4. passer commande',
        body: [
          `Vous passez commande en ajoutant des articles au panier puis en validant le paiement. Votre commande constitue une offre d’achat ; le contrat est formé lorsque nous vous envoyons l’e-mail de confirmation.`,
          `Nous pouvons refuser une commande si l’article n’est pas disponible, si l’autorisation de paiement ne peut être obtenue, en cas de soupçon de fraude, ou lorsque le comportement d’achat indique une revente plutôt qu’un usage personnel.`,
        ],
      },
      {
        heading: '5. paiement',
        body: [
          `Le paiement est encaissé au moment de la commande, via Shopify Payments et les moyens affichés lors du règlement. Les données de carte bancaire sont traitées par le prestataire de paiement et n’atteignent jamais nos serveurs.`,
          `Votre commande est préparée dès confirmation du paiement.`,
        ],
      },
      {
        heading: '6. livraison',
        body: [
          `Les délais, les frais et les zones de livraison figurent dans notre politique de livraison, qui fait partie intégrante des présentes conditions.`,
          `Le transfert des risques sur les marchandises s’opère à la livraison.`,
        ],
      },
      {
        heading: '7. droit de rétractation et retours',
        body: [
          `Si vous êtes consommateur dans l’Union européenne, vous disposez d’un droit légal de rétractation de quatorze jours à compter de la réception, sans avoir à motiver votre décision. Nous le portons commercialement à ${RETURN_DAYS} jours.`,
          `Les modalités d’exercice et le déroulement du remboursement figurent dans notre politique de retours et remboursements, qui fait partie intégrante des présentes conditions. Rien dans cette politique ne réduit vos droits légaux.`,
        ],
      },
      {
        heading: '8. garanties légales',
        body: [
          `Indépendamment de nos engagements commerciaux, vous bénéficiez de la garantie légale de conformité (articles L.217-3 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).`,
          `Au titre de la garantie de conformité, vous disposez de deux ans à compter de la délivrance pour agir et vous pouvez choisir entre la réparation et le remplacement. Vous n’avez pas à prouver l’existence du défaut au moment de la délivrance pendant ces deux années.`,
        ],
      },
      {
        heading: '9. propriété intellectuelle',
        body: [
          `L’ensemble des éléments de ce site — le nom, le logo, les photographies, les créations, les textes et le code — appartient à ${B} ou est utilisé avec autorisation. Vous ne pouvez ni les copier, ni les reproduire, ni les exploiter commercialement sans notre accord écrit.`,
          `Acheter un vêtement vous donne le vêtement. Cela ne vous accorde aucune licence pour en reproduire la création.`,
        ],
      },
      {
        heading: '10. utilisation du site',
        body: [
          `Vous vous engagez à ne pas perturber le fonctionnement du site, à ne pas accéder à des données auxquelles vous n’avez pas droit, à ne pas l’aspirer à un rythme qui le dégraderait pour les autres, et à ne pas l’utiliser à des fins illicites.`,
        ],
      },
      {
        heading: '11. responsabilité',
        body: [
          `Nous répondons des dommages prévisibles résultant d’un manquement à ces conditions. Nous ne répondons pas des dommages imprévisibles, ni des pertes d’exploitation : nos produits sont vendus pour un usage personnel.`,
          `Rien ici ne limite notre responsabilité en cas de dommage corporel causé par notre négligence, de fraude, ou dans tous les cas où la loi interdit une telle limitation.`,
        ],
      },
      {
        heading: '12. réclamations et litiges',
        body: [
          `Écrivez-nous d’abord depuis la page contact de ce site. La plupart des situations se règlent ainsi.`,
          `À défaut d’accord, vous pouvez recourir à la plateforme européenne de résolution des litiges en ligne (ec.europa.eu/consumers/odr) ou saisir gratuitement un médiateur de la consommation.`,
          `Les présentes conditions sont soumises au droit français. Si vous êtes consommateur, vous conservez le bénéfice des dispositions impératives du pays où vous résidez.`,
        ],
      },
    ],
  },

  {
    handle: 'shipping',
    title: 'politique de livraison',
    navLabel: 'livraison',
    intro: 'Comment et quand votre commande vous parvient.',
    updated: LEGAL.updated.fr,
    sections: [
      {
        heading: 'préparation',
        body: [
          `Nous préparons et expédions toutes les commandes sous ${LEGAL.shipping.preparation.fr}. Les commandes passées le week-end ou un jour férié sont préparées le jour ouvré suivant.`,
          `Pendant les drops et les périodes de soldes, la préparation peut prendre un peu plus de temps. Le cas échéant, nous l’indiquons sur le site plutôt que de vous laisser le découvrir devant un suivi qui n’avance pas.`,
        ],
      },
      {
        heading: 'délais de livraison',
        body: [`Une fois le colis parti, comptez :`],
        list: LEGAL.shipping.zones.fr,
      },
      {
        heading: 'frais de livraison',
        body: [
          `Les frais sont calculés au moment du paiement, selon la destination et le poids du colis, et affichés intégralement avant le règlement.`,
          ...(BRAND.freeShippingThreshold
            ? [
                `La livraison est offerte à partir de ${BRAND.freeShippingThreshold} € d’achat pour les commandes livrées en France.`,
              ]
            : []),
        ],
      },
      {
        heading: 'suivi',
        body: [
          `Chaque colis est suivi. Vous recevez un numéro de suivi par e-mail dès la création de l’étiquette, et vous pouvez suivre le colis à tout moment depuis notre page de suivi de commande.`,
          `Un numéro de suivi peut mettre quelques heures à s’activer chez le transporteur. S’il n’affiche rien au début, c’est normal.`,
        ],
      },
      {
        heading: 'douane et droits d’importation',
        body: [
          `Les commandes expédiées hors de l’Union européenne peuvent donner lieu à des droits et taxes à l’arrivée. Ils sont fixés par le pays de destination, restent à votre charge et ne sont pas inclus dans ce que vous nous avez payé.`,
          `Nous ne pouvons pas déclarer une commande comme cadeau ni en sous-évaluer le montant. Nous ne le faisons pas, et le demander ne change pas la réponse.`,
        ],
      },
      {
        heading: 'adresse erronée, livraison non aboutie',
        body: [
          `Merci de vérifier votre adresse avant de valider. Nous ne pouvons la corriger que tant que la commande est en préparation — écrivez-nous immédiatement depuis la page contact.`,
          `Si un colis nous revient parce que l’adresse était erronée ou qu’il n’a pas été retiré, nous remboursons les articles mais pas les frais d’envoi initiaux, et la réexpédition est à votre charge.`,
        ],
      },
      {
        heading: 'colis perdu ou endommagé',
        body: [
          `Si le suivi n’a pas bougé depuis sept jours ouvrés, ou si le colis arrive endommagé, contactez-nous. Nous ouvrons une réclamation auprès du transporteur et procédons soit à une réexpédition, soit à un remboursement — nous ne vous laissons pas discuter seul avec le transporteur.`,
        ],
      },
    ],
  },

  {
    handle: 'returns',
    title: 'retours et remboursements',
    navLabel: 'retours et remboursements',
    intro: 'Trente jours pour changer d’avis, et ce qui se passe ensuite.',
    updated: LEGAL.updated.fr,
    sections: [
      {
        heading: 'le délai',
        body: [
          `Vous disposez de ${RETURN_DAYS} jours à compter de la réception de votre commande pour la retourner. C’est plus que les quatorze jours prévus par le droit européen, et cela ne remplace pas vos droits légaux : cela s’y ajoute.`,
        ],
      },
      {
        heading: 'état des articles',
        body: [
          `Les pièces doivent nous revenir non portées, non lavées, étiquettes attachées et dans leur emballage d’origine. Essayer une pièce ne pose aucun problème ; la porter à l’extérieur, si.`,
          `Nous nous réservons le droit de refuser un retour qui nous parvient visiblement porté, taché, ou imprégné d’odeur de tabac ou de parfum, et de vous le renvoyer.`,
        ],
      },
      {
        heading: 'ce qui ne peut pas être retourné',
        body: [
          `Pour des raisons d’hygiène, les sous-vêtements et les chaussettes ne peuvent pas être retournés une fois l’emballage ouvert. Les cartes cadeaux ne sont pas remboursables. Toute pièce fabriquée ou retouchée à votre demande n’est pas reprise.`,
        ],
      },
      {
        heading: 'comment retourner',
        body: [
          `Écrivez-nous depuis la page contact en indiquant votre numéro de commande et ce que vous renvoyez. Nous répondons sous un jour ouvré avec l’adresse de retour et la marche à suivre.`,
          `Les frais de retour sont à votre charge, sauf si l’article est défectueux ou si nous nous sommes trompés, auquel cas nous les prenons en charge. Utilisez un envoi suivi : jusqu’à réception, le colis reste sous votre responsabilité.`,
        ],
      },
      {
        heading: 'remboursements',
        body: [
          `Nous contrôlons le retour et vous remboursons dans les quatorze jours suivant sa réception, sur le moyen de paiement utilisé. Votre banque peut mettre quelques jours de plus à l’afficher.`,
          `Nous remboursons le prix des articles ainsi que les frais d’envoi standard. Si vous aviez choisi une option express, nous remboursons le tarif standard, pas la différence.`,
          `Lorsqu’une commande a bénéficié d’une remise liée à un ensemble — l’offre casquette, par exemple — retourner une partie de l’ensemble supprime la remise sur ce que vous gardez, et le remboursement est ajusté en conséquence.`,
        ],
      },
      {
        heading: 'échanges',
        body: [
          `Le plus rapide est de retourner l’article pour remboursement et de passer une nouvelle commande dans la taille ou la couleur souhaitée. Cela évite que votre taille parte pendant qu’un colis voyage.`,
          `Si vous préférez que nous gérions l’échange directement, demandez-le : nous le ferons, dans la limite des stocks.`,
        ],
      },
      {
        heading: 'articles défectueux',
        body: [
          `Si une pièce arrive défectueuse ou ne correspond pas à votre commande, signalez-le dans un délai raisonnable en joignant une photo. Nous prenons en charge les frais de retour et procédons, à votre choix, au remplacement ou au remboursement intégral.`,
          `Cela s’ajoute à la garantie légale de conformité et à la garantie contre les vices cachés décrites dans nos conditions générales.`,
        ],
      },
    ],
  },

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
          `La société qui exploite cette boutique est responsable du traitement des données personnelles collectées via ce site — son identité complète figure dans nos mentions légales. Pour toute question sur vos données, écrivez-nous depuis la page contact : nous vous répondrons.`,
        ],
      },
      {
        heading: 'ce que nous collectons',
        body: [
          `Nous ne collectons que ce qu’une commande ou une demande nécessite réellement :`,
        ],
        list: [
          'identité et coordonnées — nom, e-mail, adresse postale, numéro de téléphone',
          'détails de commande — ce que vous avez acheté, quand, à quel prix et où cela a été expédié',
          'confirmation de paiement — jamais le numéro de carte, qui reste chez notre prestataire de paiement',
          'inscription à la newsletter, si vous l’avez demandée',
          'données techniques — adresse IP, navigateur, pages consultées, via notre outil de mesure d’audience',
        ],
      },
      {
        heading: 'pourquoi, et sur quelle base légale',
        body: [
          `Pour exécuter votre commande et assurer le service client : parce qu’un contrat nous lie.`,
          `Pour vous envoyer des e-mails commerciaux : parce que vous y avez consenti, et jusqu’à ce que vous le retiriez.`,
          `Pour tenir notre comptabilité et nos factures : parce que la loi l’exige.`,
          `Pour sécuriser le site et comprendre son utilisation : parce que nous avons un intérêt légitime à ce qu’il fonctionne et ne soit pas détourné.`,
        ],
      },
      {
        heading: 'qui y a accès',
        body: [
          `Nos sous-traitants, et personne d’autre. Shopify héberge la boutique et traite les commandes ; notre prestataire de paiement gère les règlements ; nos transporteurs livrent les colis ; notre prestataire d’e-mailing envoie la newsletter.`,
          `Nous ne vendons pas vos données. Nous ne les louons pas. Nous ne les échangeons pas contre de la visibilité.`,
          `Certains de ces prestataires opèrent hors de l’Union européenne. Dans ce cas, les transferts sont encadrés par les clauses contractuelles types de la Commission européenne.`,
        ],
      },
      {
        heading: 'durées de conservation',
        body: [
          `Commandes et factures : dix ans, comme l’exige le droit commercial français.`,
          `Données de compte client : tant que le compte est ouvert, puis trois ans après votre dernier contact avec nous.`,
          `Données de newsletter : jusqu’à votre désinscription, puis suppression.`,
          `Données de mesure d’audience : treize mois.`,
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
          `Nous utilisons des cookies strictement nécessaires au fonctionnement du site — votre panier, votre session et votre préférence de langue. Nous utilisons également l’outil de mesure d’audience intégré de Shopify pour comprendre les visites et les commandes de cette boutique ; aucun pixel publicitaire tiers (Meta, TikTok, Google Ads ou équivalent) n’est utilisé. Vous pouvez bloquer les cookies depuis les réglages de votre navigateur à tout moment, au risque d’affecter le panier.`,
          `Le pop-up newsletter enregistre le fait d’avoir été affiché, dans votre navigateur uniquement. Cet enregistrement ne quitte jamais votre appareil et ne nous apprend rien sur vous.`,
        ],
      },
    ],
  },

  {
    handle: 'legal-notice',
    title: 'mentions légales',
    navLabel: 'mentions légales',
    intro:
      "L'éditeur du site, l'hébergement, le paiement, la propriété intellectuelle et les données personnelles.",
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
          `La plateforme de commerce en ligne — prise de commande, paiement et gestion des expéditions — est fournie par Shopify Inc. et ses filiales.`,
        ],
      },
      {
        heading: 'paiement',
        body: [
          `Les paiements effectués sur ce site sont traités de manière sécurisée par Shopify Payments. ${B} ne stocke ni ne traite directement les données de carte bancaire : celles-ci sont transmises au prestataire de paiement concerné.`,
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
          'Commandes et livraison : nom, adresse, adresse e-mail et numéro de téléphone nécessaires au traitement et à l’expédition des commandes.',
          'Paiement : paiements traités par Shopify Payments ou le prestataire concerné, selon les modalités applicables.',
          'Service client et avis clients : informations transmises via la page de contact ou les formulaires d’avis afin de répondre aux demandes ou de gérer les retours d’expérience.',
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
          `Ce site utilise des cookies et autres traceurs nécessaires à son fonctionnement, notamment pour le panier, la session de navigation et les préférences de l'utilisateur.`,
          `Des outils de mesure d'audience peuvent également être utilisés afin d'analyser les visites et les commandes, selon leur configuration. Lorsque la réglementation l'exige, le consentement préalable de l'utilisateur est recueilli avant le dépôt de cookies ou traceurs non essentiels.`,
          `Vous pouvez gérer vos préférences depuis le dispositif de gestion des cookies du site, lorsqu'il est disponible, ainsi que depuis les paramètres de votre navigateur. Le refus de certains cookies peut affecter le fonctionnement de certaines fonctionnalités.`,
        ],
      },
      {
        heading: 'responsabilité',
        body: [
          `${B} s'efforce de maintenir les informations présentes sur ce site aussi exactes et à jour que possible. Les informations relatives aux produits, aux prix et aux délais sont susceptibles d'évoluer.`,
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
          `Pour toute question concernant ces mentions légales, une commande ou vos données personnelles, vous pouvez nous contacter :`,
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
