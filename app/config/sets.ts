/**
 * The 07 sets — a Zip 07 and the matching Jogging 07, sold together.
 *
 * A set is not a Shopify product: it is the two real products of one colour,
 * each in the size the customer picks, added to the bag as two lines. Its
 * price is the sum of the two Shopify prices, nothing else. Stock, sizes and
 * prices all come from Shopify (app/lib/sets.ts); this file only says which
 * products pair up and which of their photos shows the whole set worn.
 *
 * Add a colour by adding a line once both pieces exist in Shopify.
 */
export type SetConfig = {
  /** URL of the set: /sets/<slug>. */
  slug: string;
  /** Colour as printed in the title ("07 Black set"). */
  color: string;
  /** Shopify handle of the hoodie. */
  jacket: string;
  /** Shopify handle of the trousers. */
  sweats: string;
  /**
   * Part of the file name of the photo (among either product's Shopify
   * images) that shows the whole set worn — the tile and the first photo of
   * the set page. Falls back to the hoodie's first photo.
   */
  photo: string;
};

export const SETS: SetConfig[] = [
  {
    slug: '07-black',
    color: 'Black',
    jacket: 'zip-07-noir',
    sweats: 'jogging-07-noir',
    photo: 'IMG-0809',
  },
  {
    slug: '07-blue',
    color: 'Blue',
    jacket: 'zip-07-bleu',
    sweats: 'jogging-07-bleu',
    photo: 'ae-blue-3',
  },
  {
    slug: '07-pink',
    color: 'Pink',
    jacket: 'zip-07-rose',
    sweats: 'jogging-07-rose',
    photo: 'Stylestreetwearrosedevantmurbeton',
  },
];

/**
 * "Any 2 sets: save €25" — shown on the set page only once a Shopify
 * discount with exactly this code exists (Shopify Admin → Discounts →
 * Amount off order, `amount` € off, minimum quantity 4 items, i.e. two sets).
 * Empty code: the offer stays invisible and nothing is promised.
 */
export const SETS_BUNDLE = {
  enabled: true,
  code: '',
  sets: 2,
  amount: 25,
};

/**
 * "Match your person" (homepage, after the sets slider): two photos of the
 * sets worn, each leading to its Shopify set product.
 */
export const MATCH_PHOTOS = [
  {
    src: '/brand/match-his-pink.webp',
    width: 1100,
    height: 1473,
    label: 'His · Pink',
    alt: 'Pink 07 zip hoodie and joggers, worn sitting on stone steps',
    href: '/products/set-07-pink',
  },
  {
    src: '/brand/match-hers-blue.webp',
    width: 1100,
    height: 1535,
    label: 'Hers · Blue',
    alt: 'Blue 07 zip hoodie and joggers, worn in front of a blue car',
    href: '/products/set-07-blue',
  },
];
