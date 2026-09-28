/**
 * Everything that makes this storefront *this brand*, in one file.
 *
 * To reuse the site for another brand: change this file, `theme.css` next to
 * it, `home.ts` for the homepage, and the images under `public/brand/`.
 * Nothing else in the code names the brand.
 *
 * Products, prices, collections, stock, legal policies and menus are NOT here:
 * they come from Shopify and are edited in Shopify Admin.
 */
export const BRAND = {
  /** Shown in page titles, alt texts, the footer and structured data. */
  name: 'Hustle Studio',

  /** Default SEO description, used when a page has none of its own. */
  description:
    'Hustle Studio — streetwear minimaliste et premium. T-shirts, hoodies, jeans et essentiels pensés pour durer.',

  /**
   * Public URL of the live site, without a trailing slash. Used for canonical
   * URLs, Open Graph and the sitemap when the request URL is not enough.
   * Leave empty to use the domain the request came in on.
   */
  siteUrl: 'https://hustlestudio.store',

  logo: {
    /** Wordmark, black on transparent. Painted with currentColor via a CSS mask. */
    wordmark: '/brand/logo-wordmark.png',
    /** width / height of the wordmark file, so the header reserves the right space. */
    wordmarkRatio: 1200 / 441,
    /** Square brand mark (the flower), used for structured data. */
    icon: '/brand/icon-512.png',
  },

  /** Default share image (1200×630) for pages that have no image of their own. */
  ogImage: '/brand/og-image.jpg',

  /**
   * Contact e-mail shown in the footer and on the contact page.
   * Leave empty to hide it.
   */
  email: '',

  /** Social profiles. Any empty entry is simply not shown. */
  social: {
    instagram: '',
    tiktok: '',
  },

  /** Handles of the Shopify menus (Shopify Admin → Online Store → Navigation). */
  menus: {
    header: 'main-menu',
    footer: 'footer',
  },

  /**
   * Market used for prices and availability. Shopify converts prices when
   * several markets are set up; this is the one the storefront asks for.
   */
  country: 'FR',
  currency: {code: 'EUR', symbol: '€'},

  /**
   * Order amount (in the currency above) from which shipping is free, shown as
   * a progress bar in the cart. Must match your free-shipping rate in Shopify
   * Admin → Settings → Shipping and delivery. 0 hides the bar.
   */
  freeShippingThreshold: 0 as number,

  /**
   * Language a first-time visitor gets ('en' or 'fr'). They can switch at any
   * time; the choice is remembered in a cookie.
   */
  defaultLocale: 'en' as 'en' | 'fr',

  /** Colour of the browser UI on mobile (address bar). */
  themeColor: '#111111',
} as const;

export type Brand = typeof BRAND;
