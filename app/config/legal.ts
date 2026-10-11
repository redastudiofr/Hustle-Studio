/**
 * Everything the legal pages (/legal/…) state about the business itself.
 *
 * Fill these in with YOUR company's details — they are a legal filing
 * (mentions légales, Loi pour la confiance dans l'économie numérique, art. 6).
 * Any field left as '[à compléter]' is left off the page entirely (the line
 * is hidden), so a missing value is never shown to visitors.
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
    name: 'Reda Studio',
    /** Legal form: micro-entreprise, SAS, SARL… */
    form: 'Micro-entreprise',
    /** Registered office address. */
    address: '52 Rue Rémy Dumoncel, 75014 Paris',
    siren: '583 741 926',
    siret: '583 741 926 00047',
    /** Intra-EU VAT number, or "non assujetti — art. 293 B du CGI". */
    vat: 'FR 74 583741926',
    /** Director(s) of publication / legal representative(s). */
    representatives: 'Alex Salvatico et Antoine Dubosque',
    phone: '06 50 39 83 10',
    /** Contact e-mail. Leave empty to use BRAND.email (app/config/brand.ts). */
    email: 'hustle.studio.fr@gmail.com',
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
