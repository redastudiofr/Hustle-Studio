/**
 * Everything the legal pages (/legal/…) state about the business itself.
 *
 * Fill these in with YOUR company's details — they are a legal filing
 * (mentions légales, Loi pour la confiance dans l'économie numérique, art. 6).
 * Any field left as '[à compléter]' is left off the page entirely (the line
 * is hidden), so a missing value is never shown to visitors.
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
};

export const LEGAL_PLACEHOLDER = TODO;
