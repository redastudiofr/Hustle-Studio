/**
 * Product page — the brand-wide copy and blocks shown on every product.
 *
 * Product-specific content comes from Shopify, per product, in metafields
 * (Shopify Admin → Settings → Custom data → Products → Add definition):
 *
 *   custom.story       Multi-line text — the product's story. Replaces
 *                      `story.text` below for that product.
 *   custom.highlights  List of single-line texts, "Title — detail" each.
 *                      Replaces `highlights` below for that product.
 *   custom.size_chart  JSON (see SizeChart in app/config/sizeCharts.ts).
 *                      Replaces the size chart matched by product type.
 *
 * Every statement here must stay true for every product: delivery times,
 * return window and so on are the shop's own commitments (see the FAQ and
 * the legal pages), never per-product promises.
 */
import type {Localized} from '~/lib/i18n/localized';

export type Highlight = {
  icon: 'pin' | 'box' | 'return' | 'lock' | 'needle' | 'spark';
  title: Localized;
  detail: Localized;
};

export const PRODUCT_PAGE = {
  /** Two tiles under the price. */
  features: [
    {icon: 'pin', title: 'Designed in Paris', detail: 'In our Paris studio'},
    {icon: 'box', title: 'Ships in 1–3 days', detail: 'Tracked delivery'},
  ] as Highlight[],

  /** Under "In stock". */
  shipsNote: 'Order today — ships within 1 to 3 business days',

  /** Default highlights when the product has no custom.highlights. */
  highlightsTitle: 'Designed in Paris, built to be worn.',
  highlights: [
    {icon: 'pin', title: 'Designed in France', detail: 'In our Paris studio'},
    {
      icon: 'box',
      title: 'Shipped in 1–3 business days',
      detail: '48 h in France, 3–5 days worldwide, always tracked',
    },
    {
      icon: 'return',
      title: '30-day returns',
      detail: 'Unworn, in the original packaging',
    },
    {
      icon: 'lock',
      title: 'Secure checkout',
      detail: 'Paid on Shopify — card details never touch this site',
    },
  ] as Highlight[],

  /** Default story when the product has no custom.story. `{title}` = product. */
  story: {
    eyebrow: 'The story',
    text: [
      '{title} started where every Hustle Studio piece starts: in our Paris studio, with one question — would we wear it on the days that count?',
      'Not the photo-shoot days. The early mornings, the late nights, the work nobody sees. Clean lines, nothing that does not need to be there, made to keep up with you while you build.',
    ],
  },

  /** The three grey accordions at the bottom of the details column. */
  info: {
    shippingTitle: 'Shipping & returns',
    shipping: [
      'Every order is prepared and shipped within 1 to 3 business days from our Paris studio: 48 hours anywhere in France, 3 to 5 days worldwide, with tracking on every parcel.',
      'Returns and exchanges are accepted within 30 days of delivery, on unworn pieces in their original packaging.',
    ],
    paymentTitle: 'Secure payment',
    payment: [
      'Payment happens on Shopify’s secure checkout, encrypted end to end. Your card details are never seen or stored by this site.',
    ],
  },

  /** Full-width band of collections at the very end of the page. */
  collectionsBand: {
    title: 'Join the community',
    /** Collection handles, in order. Empty: the first collections with a photo. */
    handles: [] as string[],
    count: 4,
  },
};
