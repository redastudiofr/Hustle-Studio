/**
 * Homepage (mock-ups 01–07) — every fixed text, and the fields to fill in.
 *
 * French texts are the mock-ups' own words; English is their translation.
 * What the mock-ups wrote between [brackets] is a field: it is empty here
 * until you fill it in, and a section — or a line
 * — with nothing real to show is not shown. Nothing is invented to fill it.
 *
 * The band's texts are claims (printed in France, 30-day exchange): check
 * them.
 */
import type {Localized} from '~/lib/i18n/localized';

export type HeroPanel = {
  title: Localized;
  subtitle: Localized;
  cta: Localized;
  /** Page the white button opens. Empty: no button. */
  to: string;
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
  /** 1 — two full-frame photo panels (a slider on phones). */
  hero: [
    {
      title: {en: 'THEY THINK IT.', fr: 'ILS LE PENSENT.'},
      subtitle: {en: 'YOU WEAR IT.', fr: 'TOI, TU LE PORTES.'},
      cta: {en: 'DISCOVER THE T-SHIRTS', fr: 'DÉCOUVRIR LES T-SHIRTS'},
      // No online shop: no page to open, so no button.
      to: '',
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
      to: '',
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

  /** Blue scrolling band. */
  band: [
    {en: 'PRINTED IN FRANCE', fr: 'IMPRIMÉ EN FRANCE'},
    {en: '30-DAY EXCHANGE', fr: 'ÉCHANGE 30 JOURS'},
  ] as Localized[],

  /** 2 — customer photos. Hidden until `photos` holds at least one. */
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

  /** 3 — press and appearances. Hidden until `cards` holds at least one. */
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
