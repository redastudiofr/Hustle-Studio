/**
 * Menus and links — header, mobile menu and footer.
 *
 * Labels are dictionary keys (app/lib/i18n/dictionary.ts) so they exist in
 * both languages.
 */
import type {TranslationKey} from '~/lib/i18n/dictionary';

export type NavLinkConfig = {labelKey: TranslationKey; to: string};

export const NAVIGATION = {
  /** Links in the desktop header. */
  headerLinks: [
    {labelKey: 'footer.about', to: '/about'},
    {labelKey: 'footer.faq', to: '/faq'},
    {labelKey: 'footer.contact', to: '/contact'},
  ] as NavLinkConfig[],

  /** Main pages of the burger menu, one per line. */
  mobileLinks: [
    {labelKey: 'nav.home', to: '/'},
    {labelKey: 'footer.about', to: '/about'},
    {labelKey: 'footer.faq', to: '/faq'},
    {labelKey: 'footer.contact', to: '/contact'},
  ] as NavLinkConfig[],

  footer: {
    info: [
      {labelKey: 'footer.about', to: '/about'},
      {labelKey: 'footer.faq', to: '/faq'},
      {labelKey: 'footer.contact', to: '/contact'},
    ] as NavLinkConfig[],

    /**
     * Legal pages, written in app/data/legal.ts (EN) and legal.fr.ts (FR);
     * the business details they state live in app/config/legal.ts. The
     * online-sales texts (terms, shipping, returns) are not linked while the
     * site sells nothing online.
     */
    policies: [
      {labelKey: 'footer.privacy', to: '/legal/privacy'},
      {labelKey: 'footer.legalNotice', to: '/legal/legal-notice'},
    ] as NavLinkConfig[],
  },
};
