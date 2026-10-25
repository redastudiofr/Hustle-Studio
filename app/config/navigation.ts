/**
 * Menus and links — header, mobile menu and footer.
 *
 * Collections in the menu come from Shopify automatically: a collection
 * created in Shopify Admin appears in the menu without touching this file.
 * What this file decides is the ORDER, the grouping and the extra links.
 *
 * Labels are dictionary keys (app/lib/i18n/dictionary.ts) so they exist in
 * both languages.
 */
import type {TranslationKey} from '~/lib/i18n/dictionary';

export type NavLinkConfig = {labelKey: TranslationKey; to: string};

export const NAVIGATION = {
  /**
   * Order of collections in the menu, by title or handle (case, accents and
   * hyphens are ignored: "T-Shirts" = "tshirts"). Collections not listed keep
   * Shopify's order, after these.
   */
  collectionOrder: [
    'new arrivals',
    'best sellers',
    't shirts',
    'tshirts',
    'hoodies',
    'long sleeves',
    'longsleeves',
    'jeans',
    'shorts',
  ],

  /**
   * Collections whose title matches this pattern are listed in a second menu
   * group ("drops") instead of "shop". Set to null for a single group.
   */
  dropPattern: /\bdrops?\b/i as RegExp | null,

  /**
   * Brands: a Shopify collection whose URL handle starts with this prefix is
   * a brand (e.g. "marque-808vision"), not a category. Brands get their own
   * homepage row ("our independent labels") and their own menu group, and
   * stay out of the categories. Set the handle in Shopify Admin → Products →
   * Collections → the collection → Search engine listing → URL handle.
   */
  brandHandlePrefix: 'marque-',

  /** Collections never shown in the menu or on /collections (handle or title). */
  hiddenCollections: ['frontpage', 'home page'],

  /** Plain links next to the "shop" menu in the desktop header. */
  headerLinks: [
    {labelKey: 'nav.collections', to: '/collections'},
    {labelKey: 'footer.about', to: '/about'},
  ] as NavLinkConfig[],

  /**
   * Main pages of the burger menu, one per line, no dropdown: every page of
   * the site is one tap away. Service and legal links follow, smaller.
   */
  mobileLinks: [
    {labelKey: 'nav.home', to: '/'},
    {labelKey: 'nav.shop', to: '/collections/all'},
    {labelKey: 'nav.collections', to: '/collections'},
    {labelKey: 'footer.about', to: '/about'},
    {labelKey: 'footer.faq', to: '/faq'},
  ] as NavLinkConfig[],

  /** Service links under the main pages in the burger menu. */
  serviceLinks: [
    {labelKey: 'nav.track', to: '/order-tracking'},
    {labelKey: 'footer.contact', to: '/contact'},
  ] as NavLinkConfig[],

  footer: {
    info: [
      {labelKey: 'nav.allProducts', to: '/collections/all'},
      {labelKey: 'nav.track', to: '/order-tracking'},
      {labelKey: 'footer.faq', to: '/faq'},
      {labelKey: 'footer.about', to: '/about'},
      {labelKey: 'footer.contact', to: '/contact'},
    ] as NavLinkConfig[],

    /**
     * Legal pages, written in app/data/legal.ts (EN) and legal.fr.ts (FR);
     * the business details they state live in app/config/legal.ts.
     */
    policies: [
      {labelKey: 'footer.shipping', to: '/legal/shipping'},
      {labelKey: 'footer.returns', to: '/legal/returns'},
      {labelKey: 'footer.termsOfSale', to: '/legal/terms'},
      {labelKey: 'footer.privacy', to: '/legal/privacy'},
      {labelKey: 'footer.legalNotice', to: '/legal/legal-notice'},
    ] as NavLinkConfig[],
  },
};
