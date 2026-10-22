/**
 * Product page (mock-ups 01–09) and the site header — every fixed text.
 *
 * French texts are the mock-ups' own words; English is their translation.
 *
 * What the mock-ups wrote between [brackets] is NOT here as text: it comes
 * from Shopify or is left empty to fill in, and anything empty is simply not
 * shown —
 *   [MARQUE]                 → the brand's logo / BRAND.name
 *   [NOM DU T-SHIRT]         → the product's title
 *   [TON VISUEL]             → the product's images
 *   [N] ventes               → product metafield custom.sales_count (integer)
 *   4,8/5 · [N] avis         → real reviews (app/lib/reviews.ts) or the review
 *                              app's metafields
 *   [Avis client], [Prénom], [ville] → the reviews themselves
 *   [MODÈLE 1…5]             → products of the t-shirt collection
 *   [Date d'expédition…]     → computed (see PdpDelivery)
 *   [Une phrase : …]         → `manifesto.points[].text` below, to fill in
 *
 * Several fixed texts are facts about the product or the service (190 g/m²,
 * printed in France, 30-day exchange, shipping prices, Colissimo…): they are
 * the mock-ups' — check each one is true before relying on it, and edit it
 * here if not.
 */
import type {Localized} from '~/lib/i18n/localized';

type Pair = {label: Localized; detail: Localized};

export const PDP = {
  /** Top bar. Shown only while the 2+1 pack is live (app/config/promotions.ts). */
  announcement: {
    desktop: {
      en: '2+1 FREE · FREE SHIPPING FROM 2 ITEMS',
      fr: '2+1 OFFERT · LIVRAISON OFFERTE DÈS 2 ARTICLES',
    },
    mobile: {
      en: '2+1 FREE · FREE SHIPPING',
      fr: '2+1 OFFERT · LIVRAISON OFFERTE',
    },
  },

  /**
   * Header links (centre), from the homepage mock-up 01. `collection`: shown
   * only if that Shopify collection exists; `packs`: only while a t-shirt
   * pack is live — never a link to a page that isn't there.
   */
  nav: [
    {
      label: {en: 'T-shirts', fr: 'T-shirts'},
      to: '/collections/tshirt',
      collection: 'tshirt',
    },
    {
      label: {en: 'Sweaters', fr: 'Pulls'},
      to: '/collections/pulls',
      collection: 'pulls',
    },
    {label: {en: 'Packs', fr: 'Packs'}, to: '/collections/tshirt', packs: true},
    {label: {en: 'Our story', fr: 'Notre histoire'}, to: '/about'},
  ] as {label: Localized; to: string; packs?: boolean; collection?: string}[],

  badges: {
    sales: {en: 'sales', fr: 'ventes'},
    /** Shown on the main image for products tagged `best-seller` in Shopify. */
    bestSeller: {en: 'Best-seller', fr: 'Best-seller'},
    bestSellerTag: 'best-seller',
  },
  ratingVerified: {en: 'verified reviews', fr: 'avis vérifiés'},
  ratingShort: {en: 'reviews', fr: 'avis'},

  /** The three arguments under the title. */
  arguments: [
    {
      label: {en: '190 g/m² cotton', fr: 'Coton 190 g/m²'},
      detail: {en: 'Heavy knit', fr: 'Maille épaisse'},
    },
    {
      label: {en: 'Printed in France', fr: 'Imprimé en France'},
      detail: {en: 'Screen printing', fr: 'Sérigraphie'},
    },
    {
      label: {en: '30-day exchange', fr: 'Échange 30 jours'},
      detail: {en: 'Free', fr: 'Gratuit'},
    },
  ] as Pair[],

  pack: {
    title: {en: 'BUILD YOUR PACK', fr: 'COMPOSE TON PACK'},
    subtitle: {
      en: 'The more you take, the less you pay.',
      fr: 'Plus tu en prends, moins tu paies.',
    },
    single: {en: '1 t-shirt', fr: '1 t-shirt'},
    /** {buy} and {free} are filled in. */
    offerOne: {
      en: '{buy} bought + {free} free',
      fr: '{buy} achetés + {free} offert',
    },
    offerMany: {
      en: '{buy} bought + {free} free',
      fr: '{buy} achetés + {free} offerts',
    },
    mostChosen: {en: 'Most chosen', fr: 'Le plus choisi'},
    save: {en: 'Save {amount}', fr: 'Économise {amount}'},
    /** Shipping notes: must match the rates set in Shopify. */
    shippingSingle: {en: 'Shipping €4.90', fr: 'Livraison 4,90 €'},
    shippingFree: {en: 'Free shipping', fr: 'Livraison offerte'},
    size: {en: 'Size', fr: 'Taille'},
    sizeOption: {en: 'Size {size}', fr: 'Taille {size}'},
    shirt: {en: 'T-shirt {n}', fr: 'T-shirt {n}'},
    free: {en: 'Free', fr: 'Offert'},
    chooseModel: {en: 'Choose a design', fr: 'Choisir un modèle'},
    cta: {en: 'ADD TO CART', fr: 'AJOUTER AU PANIER'},
    ctaShort: {en: 'Add', fr: 'Ajouter'},
    soldOut: {en: 'SOLD OUT', fr: 'ÉPUISÉ'},
    packName: {en: 'Pack {buy}+{free}', fr: 'Pack {buy}+{free}'},
  },

  payment: {
    desktop: {
      en: 'Card · PayPal · Apple Pay · Google Pay — secure payment',
      fr: 'CB · PayPal · Apple Pay · Google Pay — paiement sécurisé',
    },
    mobile: {
      en: 'Card · PayPal · Apple Pay · Google Pay',
      fr: 'CB · PayPal · Apple Pay · Google Pay',
    },
  },

  reassurance: [
    {en: 'Fitted cut, true to size', fr: 'Coupe ajustée, tailles normales'},
    {
      en: 'Reinforced ribbed collar, keeps its shape',
      fr: 'Col côtelé renforcé, ne se déforme pas',
    },
    {
      en: 'Print that survives the wash',
      fr: 'Impression qui résiste aux lavages',
    },
  ] as Localized[],

  accordions: {
    description: {en: 'Description', fr: 'Description'},
    sizeGuide: {en: 'Size guide', fr: 'Guide des tailles'},
    shipping: {en: 'Shipping & returns', fr: 'Livraison & retours'},
  },

  reviews: {
    title: {
      black: {en: 'REVIEWS.', fr: 'AVIS.'},
      blue: {en: 'STRAIGHT TALK.', fr: 'OPINIONS ASSUMÉES.'},
    },
    outOf: {en: 'out of 5', fr: 'sur 5'},
    verified: {en: 'Verified customer', fr: 'Client vérifié'},
    seeAll: {en: 'See all reviews', fr: 'Voir tous les avis'},
  },

  material: {
    eyebrow: {en: 'WHAT MAKES THE DIFFERENCE', fr: 'CE QUI FAIT LA DIFFÉRENCE'},
    title: {
      black: {en: '190 G/M² OF COTTON.', fr: '190 G/M² DE COTON.'},
      blue: {en: 'ZERO COMPROMISE.', fr: 'ZÉRO COMPROMIS.'},
    },
    /**
     * One tab = one blue card + three tiles. A tab whose `feature.title` is
     * empty is not shown — the mock-ups only wrote the first one's content.
     */
    tabs: [
      {
        label: {en: 'The t-shirt', fr: 'Le t-shirt'},
        feature: {
          eyebrow: {en: 'THE COLLAR', fr: 'LE COL'},
          title: {
            en: 'Reinforced ribbed-knit collar',
            fr: 'Col en tricot côtelé renforcé',
          },
          text: {
            en: 'It keeps its shape wash after wash.',
            fr: 'Il garde sa forme lavage après lavage.',
          },
        },
        tiles: [
          {
            eyebrow: {en: 'PRINT', fr: 'IMPRESSION'},
            title: {
              en: 'High-density screen print',
              fr: 'Sérigraphie haute densité',
            },
            text: {
              en: 'Doesn’t crack in the wash.',
              fr: 'Ne craquelle pas au lavage.',
            },
          },
          {
            eyebrow: {en: 'FIT', fr: 'COUPE'},
            title: {en: 'Fitted, not tight', fr: 'Ajustée sans serrer'},
            text: {
              en: 'Take your usual size.',
              fr: 'Prends ta taille habituelle.',
            },
          },
          {
            eyebrow: {en: 'SIZES', fr: 'TAILLES'},
            title: {en: 'XS to 3XL', fr: 'Du XS au 3XL'},
            text: {
              en: 'Size guide in 1 click.',
              fr: 'Guide des tailles en 1 clic.',
            },
          },
        ],
      },
      {
        label: {en: 'Fabric & care', fr: 'Matière & entretien'},
        feature: {eyebrow: '', title: '', text: ''},
        tiles: [],
      },
      {
        label: {en: 'Certifications', fr: 'Certifications'},
        feature: {eyebrow: '', title: '', text: ''},
        tiles: [],
      },
    ] as MaterialTab[],
  },

  details: {
    eyebrow: {en: 'THE DETAIL', fr: 'LE DÉTAIL'},
    title: {
      black: {en: 'WHAT YOU DON’T SEE', fr: 'CE QUE TU NE VOIS PAS'},
      blue: {en: 'IN THE PHOTO.', fr: 'SUR LA PHOTO.'},
    },
    /**
     * Photos: product metafield custom.detail_images (list of files, in this
     * order: collar close-up, print macro, fabric flat lay); without it, the
     * product's own photos 2 to 4.
     */
    cards: [
      {
        title: {en: 'THE COLLAR DOESN’T MOVE', fr: 'LE COL NE BOUGE PAS'},
        text: {
          en: 'Reinforced rib: it stays sharp, even after dozens of washes.',
          fr: 'Bord-côte renforcé : il reste net, même après des dizaines de lavages.',
        },
      },
      {
        title: {
          en: 'SCREEN PRINT, NOT TRANSFER',
          fr: 'SÉRIGRAPHIE, PAS TRANSFERT',
        },
        text: {
          en: 'The ink goes into the fibre. No plastic to peel.',
          fr: 'L’encre pénètre la fibre. Pas de plastique qui pèle.',
        },
      },
      {
        title: {en: '190 G/M², DENSE KNIT', fr: '190 G/M², MAILLE DENSE'},
        text: {
          en: 'A heavy cotton that drapes well and never turns see-through.',
          fr: 'Un coton épais qui tombe bien et ne devient pas transparent.',
        },
      },
    ] as {title: Localized; text: Localized}[],
  },

  manifesto: {
    eyebrow: {en: 'WHY WE WEAR IT', fr: 'POURQUOI ON LE PORTE'},
    title: {en: 'WEAR YOUR IDEAS.', fr: 'PORTE TES IDÉES.'},
    text: {
      en: 'It isn’t a garment. It’s a statement.',
      fr: 'Ce n’est pas un vêtement. C’est une phrase.',
    },
    /**
     * `text` was a placeholder in the mock-ups ([Une phrase : …]): write one
     * sentence each. Empty, the point shows its title alone.
     */
    points: [
      {
        title: {en: 'YOU’RE NOT ALONE', fr: 'TU N’ES PAS SEUL'},
        text: '' as Localized, // the community that thinks like you
      },
      {
        title: {en: 'A SIGN, NOT A SPEECH', fr: 'UN SIGNE, PAS UN DISCOURS'},
        text: '' as Localized, // the t-shirt speaks for you
      },
      {
        title: {en: 'MADE TO LAST', fr: 'FAIT POUR DURER'},
        text: '' as Localized, // quality, making, durability
      },
    ],
  },

  collection: {
    eyebrow: {en: 'THE COLLECTION', fr: 'LA COLLECTION'},
    title: {
      black: {en: 'PICK', fr: 'CHOISIS'},
      blue: {en: 'YOURS.', fr: 'LE TIEN.'},
    },
    /** Shown only while the 2+1 pack is live. */
    text: {
      en: 'Same cotton, same cut. Mix them: 2 bought = 1 free.',
      fr: 'Même coton, même coupe. Mélange-les : 2 achetés = 1 offert.',
    },
  },

  comparison: {
    eyebrow: {
      en: 'THE QUESTION EVERYONE ASKS',
      fr: 'LA QUESTION QUE TOUT LE MONDE SE POSE',
    },
    title: {
      black: {en: 'WHY NOT', fr: 'POURQUOI PAS'},
      blue: {en: 'A €12 T-SHIRT?', fr: 'UN T-SHIRT À 12 € ?'},
    },
    criterion: {en: 'CRITERION', fr: 'CRITÈRE'},
    other: {en: '€12 T-SHIRT', fr: 'T-SHIRT À 12 €'},
    rows: [
      {
        label: {en: 'Cotton weight', fr: 'Grammage du coton'},
        ours: {en: '190 g/m²', fr: '190 g/m²'},
        theirs: {en: '~130 g/m²', fr: '~130 g/m²'},
      },
      {
        label: {en: 'Print', fr: 'Impression'},
        ours: {en: 'Screen print', fr: 'Sérigraphie'},
        theirs: {en: 'Plastic transfer', fr: 'Transfert plastique'},
      },
      {
        label: {en: 'Wash resistance', fr: 'Tenue au lavage'},
        ours: {en: 'Keeps its shape', fr: 'Garde sa forme'},
        theirs: {en: 'Loses shape fast', fr: 'Se déforme vite'},
      },
      {
        label: {en: 'Making', fr: 'Fabrication'},
        ours: {en: 'Printed in France', fr: 'Imprimé en France'},
        theirs: {en: 'Unknown', fr: 'Inconnue'},
      },
      {
        label: {en: 'Exchange', fr: 'Échange'},
        ours: {en: '30 days free', fr: '30 jours gratuit'},
        theirs: {en: 'Rarely', fr: 'Rarement'},
      },
    ] as {label: Localized; ours: Localized; theirs: Localized}[],
  },

  delivery: {
    eyebrow: {en: 'WE TAKE CARE OF IT ALL', fr: 'ON S’OCCUPE DE TOUT'},
    title: {
      black: {en: 'YOUR ORDER,', fr: 'TA COMMANDE,'},
      blue: {en: 'UP CLOSE.', fr: 'AU PLUS PRÈS.'},
    },
    orderedToday: {
      en: 'ORDER TODAY, SHIPPED ON',
      fr: 'COMMANDE AUJOURD’HUI, EXPÉDIÉE LE',
    },
    deliveredBetween: {en: 'DELIVERED BETWEEN', fr: 'LIVRÉE ENTRE'},
    and: {en: 'and', fr: 'et'},
    /**
     * Dates: shipped the next business day (J+1), delivered between business
     * days J+2 and J+4. Weekends are skipped; public holidays are not.
     */
    shipBusinessDays: 1,
    deliveryBusinessDays: [2, 4] as [number, number],
    steps: [
      {
        label: {en: 'ORDERED', fr: 'COMMANDÉ'},
        detail: {en: 'Today', fr: 'Aujourd’hui'},
      },
      {
        label: {en: 'PRINTED', fr: 'IMPRIMÉ'},
        detail: {en: 'Within 24 h', fr: 'Sous 24 h'},
      },
      {
        label: {en: 'SHIPPED', fr: 'EXPÉDIÉ'},
        detail: {en: 'Tracked Colissimo', fr: 'Colissimo suivi'},
      },
      {
        label: {en: 'AT YOURS', fr: 'CHEZ TOI'},
        detail: {en: '2 to 4 business days', fr: '2 à 4 jours ouvrés'},
      },
    ] as Pair[],
    tiles: [
      {
        label: {en: '30-day exchange', fr: 'Échange 30 jours'},
        detail: {en: 'Free, no questions asked', fr: 'Gratuit, sans question'},
      },
      {
        label: {en: 'Secure payment', fr: 'Paiement sécurisé'},
        detail: {en: 'Card, PayPal, Apple Pay', fr: 'CB, PayPal, Apple Pay'},
      },
      {
        label: {en: 'Fast reply', fr: 'Réponse rapide'},
        detail: {en: 'Support 7 days a week', fr: 'Support 7j/7'},
      },
    ] as Pair[],
  },
};

export type MaterialTab = {
  label: Localized;
  feature: {eyebrow: Localized; title: Localized; text: Localized};
  tiles: {eyebrow: Localized; title: Localized; text: Localized}[];
};
