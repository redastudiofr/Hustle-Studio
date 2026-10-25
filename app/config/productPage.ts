/**
 * Product page — the brand-wide copy and blocks shown on every product.
 *
 * Product-specific content comes from Shopify, per product, in metafields
 * (Shopify Admin → Settings → Custom data → Products → Add definition):
 *
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
    {
      icon: 'pin',
      title: {en: 'Designed in Nantes', fr: 'Pensé à Nantes'},
      detail: {en: 'Independent brand', fr: 'Marque indépendante'},
    },
    {
      icon: 'box',
      title: {en: 'Ships in 1–3 days', fr: 'Expédié sous 1 à 3 jours'},
      detail: {en: 'Tracked delivery', fr: 'Livraison suivie'},
    },
  ] as Highlight[],

  /** Under "In stock". */
  shipsNote: {
    en: 'Order today — ships within 1 to 3 business days',
    fr: 'Commandez aujourd’hui — expédié sous 1 à 3 jours ouvrés',
  } as Localized,

  /** Default highlights when the product has no custom.highlights. */
  highlightsTitle: {
    en: 'Designed in Nantes, built for the ambitious.',
    fr: 'Pensé à Nantes, pour les ambitieux.',
  } as Localized,
  highlights: [
    {
      icon: 'pin',
      title: {en: 'Independent brand', fr: 'Marque indépendante'},
      detail: {en: 'Born in Nantes', fr: 'Née à Nantes'},
    },
    {
      icon: 'box',
      title: {
        en: 'Shipped in 1–3 business days',
        fr: 'Expédié sous 1 à 3 jours ouvrés',
      },
      detail: {
        en: '48 h in France, 3–5 days worldwide, always tracked',
        fr: '48 h en France, 3 à 5 jours dans le monde, toujours suivi',
      },
    },
    {
      icon: 'return',
      title: {en: '30-day returns', fr: 'Retours sous 30 jours'},
      detail: {
        en: 'Unworn, in the original packaging',
        fr: 'Non portée, dans son emballage d’origine',
      },
    },
    {
      icon: 'lock',
      title: {en: 'Secure checkout', fr: 'Paiement sécurisé'},
      detail: {
        en: 'Paid on Shopify — card details never touch this site',
        fr: 'Réglé sur Shopify — vos données bancaires ne passent jamais par ce site',
      },
    },
  ] as Highlight[],

  /** The three grey accordions at the bottom of the details column. */
  info: {
    shippingTitle: {
      en: 'Shipping & returns',
      fr: 'Livraison & retours',
    } as Localized,
    shipping: [
      {
        en: 'Every order is prepared and shipped within 1 to 3 business days: 48 hours anywhere in France, 3 to 5 days worldwide, with tracking on every parcel.',
        fr: 'Chaque commande est préparée et expédiée sous 1 à 3 jours ouvrés : 48 h partout en France, 3 à 5 jours dans le monde, avec un suivi sur chaque colis.',
      },
      {
        en: 'Returns and exchanges are accepted within 30 days of delivery, on unworn pieces in their original packaging.',
        fr: 'Retours et échanges acceptés sous 30 jours après la livraison, pour les pièces non portées dans leur emballage d’origine.',
      },
    ] as Localized[],
    paymentTitle: {en: 'Secure payment', fr: 'Paiement sécurisé'} as Localized,
    payment: [
      {
        en: 'Payment happens on Shopify’s secure checkout, encrypted end to end. Your card details are never seen or stored by this site.',
        fr: 'Le paiement se fait sur le checkout sécurisé de Shopify, chiffré de bout en bout. Vos données bancaires ne sont jamais vues ni stockées par ce site.',
      },
    ] as Localized[],
  },

  /** Full-width band of collections at the very end of the page. */
  collectionsBand: {
    title: {
      en: 'Join the community',
      fr: 'Rejoindre la communauté',
    } as Localized,
    /** Collection handles, in order. Empty: the first collections with a photo. */
    handles: [] as string[],
    count: 4,
  },
};
