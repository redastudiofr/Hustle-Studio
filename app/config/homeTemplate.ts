/**
 * Homepage (mock-ups 01–07) — every fixed text, and the fields to fill in.
 *
 * French texts are the mock-ups' own words; English is their translation.
 * What the mock-ups wrote between [brackets] is a field: it is empty here
 * until you fill it in (or it comes from Shopify), and a section — or a line
 * — with nothing real to show is not shown. Nothing is invented to fill it.
 *
 * Several fixed texts are claims (2+1 free, free shipping from 2 items,
 * printed in France, 30-day exchange, "monthly ranking"): check them, as for
 * the product page (app/config/productTemplate.ts).
 */
import type {Localized} from '~/lib/i18n/localized';

export type HeroPanel = {
  title: Localized;
  subtitle: Localized;
  cta: Localized;
  /** Shopify collection handle the button opens. Panel hidden if missing. */
  collection: string;
  /** Photo, full frame (a file in public/brand/, or any URL). */
  image: string;
  alt: Localized;
};

export type Polaroid = {
  /** The customer's photo, shown only with their agreement. */
  src: string;
  /** Handwritten caption — [En soirée], [En famille]… */
  caption: Localized;
};

export type MediaCard = {src: string; caption: Localized};
export type MediaLogo = {src: string; name: string};

export const HOME = {
  /** Header button. Shown only while a t-shirt pack is live. */
  headerCta: {
    label: {en: 'BUILD YOUR PACK', fr: 'COMPOSE TON PACK'},
    to: '/collections/tshirt',
  },

  /** 1 — two full-frame photo panels (a slider on phones). */
  hero: [
    {
      title: {en: 'THEY THINK IT.', fr: 'ILS LE PENSENT.'},
      subtitle: {en: 'YOU WEAR IT.', fr: 'TOI, TU LE PORTES.'},
      cta: {en: 'DISCOVER THE T-SHIRTS', fr: 'DÉCOUVRIR LES T-SHIRTS'},
      collection: 'tshirt',
      // [Photo lifestyle — t-shirt porté, plein cadre]: replace with yours.
      image: '/brand/hero-mobile-passage.webp',
      alt: {
        en: 'White embroidered henley, worn in the Passage Pommeraye, Nantes',
        fr: 'Henley blanc brodé, porté dans le passage Pommeraye, à Nantes',
      },
    },
    {
      title: {en: 'EVEN WHEN IT FREEZES.', fr: 'MÊME QUAND IL GÈLE.'},
      // "LE PULL [NOM], LE VRAI." — fill in the sweater's name below.
      subtitle: {
        en: 'THE {name} SWEATER, THE REAL ONE.',
        fr: 'LE PULL {name}, LE VRAI.',
      },
      cta: {en: 'DISCOVER THE SWEATERS', fr: 'DÉCOUVRIR LES PULLS'},
      collection: 'pulls',
      // [Photo lifestyle — pull porté de dos]: replace with yours.
      image: '/brand/about-street.webp',
      alt: {
        en: 'Sweater worn from the back',
        fr: 'Pull porté de dos',
      },
    },
  ] as HeroPanel[],
  /** [NOM] of the second panel's subtitle. Empty: the subtitle is hidden. */
  sweaterName: '',

  /** Blue scrolling band. Pack lines show only while the 2+1 pack is live. */
  band: [
    {text: {en: '2+1 FREE', fr: '2+1 OFFERT'}, needsPack: true},
    {
      text: {
        en: 'FREE SHIPPING FROM 2 ITEMS',
        fr: 'LIVRAISON OFFERTE DÈS 2 ARTICLES',
      },
      needsPack: true,
    },
    {
      text: {en: 'PRINTED IN FRANCE', fr: 'IMPRIMÉ EN FRANCE'},
      needsPack: false,
    },
    {text: {en: '30-DAY EXCHANGE', fr: 'ÉCHANGE 30 JOURS'}, needsPack: false},
  ] as {text: Localized; needsPack: boolean}[],

  /** 2 — the two best-selling products, face to face. */
  bestSeller: {
    eyebrow: {en: 'THE BEST SELLING', fr: 'LE PLUS VENDU'},
    title: {en: 'THE BEST-SELLER', fr: 'LE BEST-SELLER'},
    cta: {en: 'I WANT IT', fr: 'JE LE VEUX'},
    /** Product handles, in order. Empty: Shopify's two best sellers. */
    handles: [] as string[],
  },

  /** 3 — duo offer. Shown only once its Shopify code is set (promotions.ts). */
  duo: {
    badge: {en: 'DUO OFFER', fr: 'OFFRE DUO'},
    title: {
      black: {en: 'TAKE TWO.', fr: 'PRENDS-EN DEUX.'},
      blue: {en: 'THE 2ND AT -50%.', fr: 'LE 2E À -50 %.'},
    },
    watermark: '-50%',
    text: {
      en: 'A t-shirt + a sweater, or two sweaters. The discount applies in the cart.',
      fr: 'Un t-shirt + un pull, ou deux pulls. La remise s’applique au panier.',
    },
    total: {en: 'Duo total', fr: 'Total duo'},
    cta: {en: 'GET THE DUO', fr: 'PROFITER DU DUO'},
    size: {en: 'Size', fr: 'Taille'},
  },

  /** 4 — customer photos. Hidden until `photos` holds at least one. */
  community: {
    eyebrow: {en: 'THE COMMUNITY', fr: 'LA COMMUNAUTÉ'},
    title: {
      black: {en: 'WORN', fr: 'PORTÉS'},
      blue: {en: 'BY YOU.', fr: 'PAR VOUS.'},
    },
    /** {account} = BRAND.social.instagram. Hidden while that is empty. */
    text: {
      en: 'Tag us with {account} to appear here.',
      fr: 'Tague-nous avec {account} pour apparaître ici.',
    },
    send: {en: 'Send your photo', fr: 'Envoyer ta photo'},
    sendTo: '/contact',
    instagram: {en: 'See on Instagram', fr: 'Voir sur Instagram'},
    /** Real customer photos, with their agreement — up to five. */
    photos: [] as Polaroid[],
  },

  /** 5 — top 3 sales, from Shopify's best sellers. */
  podium: {
    eyebrow: {en: 'THIS MONTH’S RANKING', fr: 'CLASSEMENT DU MOIS'},
    title: {
      black: {en: 'WHO MAKES', fr: 'QUI MONTE'},
      blue: {en: 'THE PODIUM?', fr: 'SUR LE PODIUM ?'},
    },
    cta: {en: 'SEE THE FULL RANKING', fr: 'VOIR TOUT LE CLASSEMENT'},
    to: '/collections/all?sort=best-selling',
  },

  /** 6 — press and appearances. Hidden until `cards` holds at least one. */
  media: {
    eyebrow: {en: 'THEY WORE IT', fr: 'ILS L’ONT PORTÉ'},
    title: {
      black: {en: 'FROM THE TV SET', fr: 'DU PLATEAU TÉLÉ'},
      blue: {en: 'TO THE TERRACE.', fr: 'À LA TERRASSE.'},
    },
    /** [Plateau TV], [Au château], [En terrasse]… real appearances only. */
    cards: [] as MediaCard[],
    logosTitle: {
      black: {en: 'ON EVERY', fr: 'SUR TOUS'},
      blue: {en: 'SCREEN.', fr: 'LES ÉCRANS.'},
    },
    /** [Logo média] — real coverage only. */
    logos: [] as MediaLogo[],
    previous: {en: 'Previous', fr: 'Précédent'},
    next: {en: 'Next', fr: 'Suivant'},
  },
};
