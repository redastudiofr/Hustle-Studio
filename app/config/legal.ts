/**
 * Everything the legal pages (/legal/…) state about the business itself.
 *
 * Fill these in with YOUR company's details — they are a legal filing
 * (mentions légales, Loi pour la confiance dans l'économie numérique, art. 6).
 * Any field left as '[à compléter]' is shown on the page in a distinct style,
 * so a missing value can never be mistaken for a real one.
 *
 * The commercial commitments below (shipping times, return window, free
 * shipping) are the ones the previous store used: CHECK THEY ARE YOURS, and
 * keep them identical to your Shopify settings (Settings → Shipping and
 * delivery) — the site states them, Shopify applies them.
 */
const TODO = '[à compléter]';

export const LEGAL = {
  /** Month shown as "last updated" on every legal page. */
  updated: {en: 'October 2026', fr: 'octobre 2026'},

  company: {
    /** Registered name (raison sociale), e.g. your name for a micro-entreprise. */
    name: TODO,
    /** Legal form: micro-entreprise, SAS, SARL… */
    form: TODO,
    /** Registered office address. */
    address: TODO,
    siren: TODO,
    siret: TODO,
    /** Intra-EU VAT number, or "non assujetti — art. 293 B du CGI". */
    vat: TODO,
    /** Director(s) of publication / legal representative(s). */
    representatives: TODO,
    phone: TODO,
    /** Contact e-mail. Leave empty to use BRAND.email (app/config/brand.ts). */
    email: '',
  },

  /** Hosting provider of this site (legally required). Vercel, since the move. */
  host: {
    name: 'Vercel Inc.',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, United States',
    website: 'https://vercel.com',
  },

  shipping: {
    /** How long orders take to be prepared before they ship. */
    preparation: {en: 'one to three business days', fr: 'un à trois jours ouvrés'},
    /** Delivery times once shipped, one line per zone. */
    zones: {
      en: [
        'France — 48 hours, tracked',
        'Belgium, Luxembourg, Germany, Spain, Italy, Netherlands — 3 to 5 business days',
        'Rest of the European Union — 4 to 7 business days',
        'Rest of the world — 7 to 14 business days',
      ],
      fr: [
        'France — 48 heures, avec suivi',
        'Belgique, Luxembourg, Allemagne, Espagne, Italie, Pays-Bas — 3 à 5 jours ouvrés',
        'Reste de l’Union européenne — 4 à 7 jours ouvrés',
        'Reste du monde — 7 à 14 jours ouvrés',
      ],
    },
  },

  /**
   * Days a customer has to return an order. The law requires at least 14
   * (EU right of withdrawal); anything above is a commercial commitment.
   */
  returnDays: 30,
};

export const LEGAL_PLACEHOLDER = TODO;
