/**
 * The storefront's legal and service documents.
 *
 * The site's legal documents (privacy policy, legal notice), versioned with
 * the code. The site sells nothing online: there are no terms of sale,
 * shipping or returns pages.
 *
 * Each document exists in both languages: this file holds the English set,
 * ./legal.fr.ts the French one, under the same handles. The French version of
 * the Legal Notice is the one that governs — "mentions légales" is a French
 * legal filing, and the fields it names (SIREN, SIRET, TVA intracommunautaire)
 * are French concepts; the English rendering exists so an English-speaking
 * customer can read the same facts, and says so on the page itself.
 *
 * Every fact it states — the hosting, the payment provider, which cookies are
 * set, what data the site actually collects — was verified against this
 * codebase, not assumed. What could **not** be verified this way — the
 * registered company name, its legal form, its address, its SIREN/SIRET, its
 * VAT number, its phone number, who its legal representative is — is left as
 * a bracketed placeholder (`[à compléter]`) rather than guessed. The page
 * never shows a placeholder: the line holding it is left off. See docs/legal-pages.md for the
 * complete list and what replaces each one.
 */

import {BRAND} from '~/config/brand';
import {LEGAL, LEGAL_PLACEHOLDER} from '~/config/legal';
import type {Locale} from '~/lib/i18n';
import {LEGAL_DOCUMENTS_FR} from './legal.fr';

/** Brand name, contact and company details — all from app/config. */
const B = BRAND.name;
const C = LEGAL.company;
const EMAIL = C.email || BRAND.email || LEGAL_PLACEHOLDER;
const MAILTO = EMAIL.startsWith('[') ? undefined : `mailto:${EMAIL}`;

export type LegalField = {
  label: string;
  /**
   * The real value, or the "[à compléter]" placeholder — a field holding the
   * placeholder is not shown at all. See the module doc above.
   */
  value: string;
  /** Renders `value` as a link (a mailto:, typically) when set. */
  href?: string;
};

export type LegalSection = {
  heading: string;
  /** Paragraphs. Plain strings — no markup, no HTML injection. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  list?: string[];
  /** Label/value pairs — for a block that reads as a form, not prose. */
  fields?: LegalField[];
  /** An optional link/button at the end of the section. */
  cta?: {label: string; to: string};
};

export type LegalDocument = {
  handle: string;
  /** Shown in the page title and the header. */
  title: string;
  /** One line under the title. */
  intro: string;
  /** Menu label — shorter than the title. */
  navLabel: string;
  updated: string;
  sections: LegalSection[];
};

const LEGAL_DOCUMENTS_EN: LegalDocument[] = [
  {
    handle: 'privacy',
    title: 'privacy policy',
    navLabel: 'privacy',
    intro: 'What we collect, why, and what you can ask us to do about it.',
    updated: LEGAL.updated.en,
    sections: [
      {
        heading: 'who is responsible',
        body: [
          `The company operating this site is the data controller for the personal data collected through it — see our Legal Notice for its full registered identity. For any question about your data, write to us from the contact page and we will answer.`,
        ],
      },
      {
        heading: 'what we collect',
        body: [
          `We collect only what you choose to send us through the site's forms:`,
        ],
        list: [
          'Contact form — your name, email address and message',
          'Newsletter — your email address, and your first name if you give it',
          'Welcome offer — your phone number, if you ask for the code',
          'Technical data — IP address and browser, in the hosting provider’s server logs, needed to run and secure the site',
        ],
      },
      {
        heading: 'why we use it, and on what legal basis',
        body: [
          `To answer your messages: because you asked us to.`,
          `To send you news and offers: because you consented, and only until you withdraw it.`,
          `To secure the site: because we have a legitimate interest in it working and not being abused.`,
        ],
      },
      {
        heading: 'who sees it',
        body: [
          `Our processors, and nobody else: ${LEGAL.host.name} hosts the site; Resend (resend.com) delivers the messages sent through the site's forms to our inbox.`,
          `We do not sell your data. We do not rent it. We do not trade it for reach.`,
          `Some of these providers operate outside the European Union. Where they do, transfers are covered by the European Commission's standard contractual clauses.`,
        ],
      },
      {
        heading: 'how long we keep it',
        body: [
          `Messages sent through the contact form: as long as needed to answer them.`,
          `Newsletter and welcome-offer data: until you unsubscribe, then we delete it.`,
        ],
      },
      {
        heading: 'your rights',
        body: [
          `Under the GDPR you can ask us to give you a copy of your data, correct it, delete it, restrict what we do with it, or send it to another provider. You can object to processing based on legitimate interest, and withdraw consent for marketing at any time — every email has an unsubscribe link.`,
          `Write to us from the contact page. We answer within one month. If you are not satisfied, you can complain to the CNIL at cnil.fr.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `We only use what the site needs to work: a cookie that remembers your language, and one that remembers you already asked for the welcome offer. There is no audience measurement and no advertising pixel (Meta, TikTok, Google Ads or similar). You can block cookies from your browser settings at any time.`,
          `The welcome pop-up records that it has been shown, in your browser only. That record never leaves your device and tells us nothing about you.`,
        ],
      },
    ],
  },

  {
    handle: 'legal-notice',
    title: 'legal notice',
    navLabel: 'legal notice',
    intro:
      'Who publishes this site, where it is hosted, and what happens to your data.',
    updated: LEGAL.updated.en,
    sections: [
      {
        heading: 'about this translation',
        body: [
          `This page is an English rendering of the French "mentions légales", a filing French law requires of anyone publishing a commercial website. The French version — the one this site shows when it is set to French — is the version that governs; this one is here so an English-speaking customer can read the same facts.`,
        ],
      },
      {
        heading: 'site publisher',
        body: [`This site is published by:`],
        fields: [
          {label: 'Company name', value: C.name},
          {label: 'Trading name', value: B},
          {label: 'Legal form', value: C.form},
          {label: 'Registered office', value: C.address},
          {label: 'SIREN', value: C.siren},
          {label: 'SIRET', value: C.siret},
          {label: 'Intra-EU VAT number', value: C.vat},
          {label: 'Legal representatives', value: C.representatives},
          {label: 'Contact', value: EMAIL, href: MAILTO},
          {label: 'Phone', value: C.phone},
        ],
      },
      {
        heading: 'hosting',
        body: [
          `This site is hosted by ${LEGAL.host.name}, ${LEGAL.host.address} (${LEGAL.host.website}).`,
          `No purchase can be made on this site.`,
        ],
      },
      {
        heading: 'intellectual property',
        body: [
          `All elements on the ${B} site, including texts, photographs, images, logos, graphics, icons, visual elements, products and layout, are protected by applicable intellectual property law.`,
          `Any reproduction, representation, modification, adaptation or exploitation of these elements, in whole or in part, without prior authorisation is prohibited, except where the law allows.`,
        ],
      },
      {
        heading: 'personal data',
        body: [
          `In running this site, ${B} may collect and process certain personal data, in particular in the following situations:`,
        ],
        list: [
          'Contact: information sent through the contact page, to answer requests.',
          'Newsletter and commercial offers: email address or phone number given voluntarily, subject to the required consent.',
          'Security: technical data needed to run the site, keep it secure and prevent abuse.',
        ],
      },
      {
        heading: 'personal data — your rights',
        body: [
          `Personal data is kept for as long as needed for the purposes it was collected for, in line with applicable regulations, in particular the General Data Protection Regulation (GDPR).`,
          `Under these regulations, and subject to the applicable conditions, you have the right to access, rectify, erase, restrict the processing of, object to and port your data. You may also withdraw your consent to marketing communications at any time.`,
          `To exercise your rights, contact us at ${EMAIL}, or use the site's contact page.`,
          `For exactly what data is collected, why, how long it is kept and who receives it, see our Privacy Policy.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `This site only uses the cookies it needs to work (language preference, welcome offer already requested). It uses no audience measurement and no advertising tracker.`,
          `You can manage cookies through your browser settings.`,
        ],
      },
      {
        heading: 'liability',
        body: [
          `${B} strives to keep the information on this site as accurate and up to date as possible.`,
          `${B} cannot be held liable for temporary interruptions of the site due to maintenance, technical problems or events beyond its control, within the limits set by law.`,
        ],
      },
      {
        heading: 'mediation and dispute resolution',
        body: [
          `Under the French Consumer Code, any consumer may, subject to the applicable legal conditions, refer a dispute with a business to a consumer mediator free of charge, with a view to an amicable settlement.`,
          `The details of the competent mediator are to be provided once one has actually been appointed, in line with the applicable legal obligations.`,
          `For cross-border disputes, consumers may also consult the official European Union information and services on resolving consumer disputes.`,
        ],
      },
      {
        heading: 'contact us',
        body: [
          `For any question about this legal notice or your personal data, you can contact us:`,
        ],
        fields: [
          {label: 'Email', value: EMAIL, href: MAILTO},
          {label: 'Phone', value: C.phone},
          {label: 'Address', value: C.address},
        ],
        cta: {label: 'write from the contact page', to: '/contact'},
      },
    ],
  },
];

/**
 * The set shown for each language. Same handles on both sides, so a visitor
 * switching language stays on the same document.
 */
export const LEGAL_DOCUMENTS: Record<Locale, LegalDocument[]> = {
  en: LEGAL_DOCUMENTS_EN,
  fr: LEGAL_DOCUMENTS_FR,
};

/** Lookup by URL handle, in the language being shown. */
export function findLegalDocument(
  locale: Locale,
  handle?: string,
): LegalDocument | undefined {
  return LEGAL_DOCUMENTS[locale].find((document) => document.handle === handle);
}
