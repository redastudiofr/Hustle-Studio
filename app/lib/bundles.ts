import {PROMOTIONS, isLive, type BundleOfferConfig} from '~/config/promotions';

/**
 * Bundles — the three offers of app/config/promotions.ts (`bundles`), the
 * price maths shared by the product page and the cart, and the codes the
 * cart attaches.
 *
 * Display only: Shopify decides what is actually taken off. The maths below
 * mirrors how the matching Shopify discounts behave (see promotions.ts); if
 * the two ever disagree, the cart shows Shopify's figure, never ours.
 */
const config = PROMOTIONS.bundles;

export type BundleOffer = BundleOfferConfig;

/** Cart action of the bundle box: its lines, one request. */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;

/** Line attribute marking the free T-shirt, so the cart can find it again. */
export const GIFT_ATTRIBUTE = '_hs_gift';

export const GIFT = config.gift;

/** The free T-shirt is on only with a code, a product and a threshold. */
export const GIFT_LIVE =
  config.enabled &&
  GIFT.code.trim() !== '' &&
  GIFT.productHandle.trim() !== '' &&
  GIFT.threshold > 0;

/** Offers customers see: enabled, and backed by a Shopify code. */
export const LIVE_OFFERS: BundleOffer[] = config.offers.filter(
  (offer) => config.enabled && isLive({enabled: true, code: offer.code}),
);

/** Every offer, live or not — what ?bundle=preview shows the shop owner. */
export const ALL_OFFERS: BundleOffer[] = config.offers;

export function offersFor(preview: boolean): BundleOffer[] {
  if (!config.enabled) return [];
  return preview ? ALL_OFFERS : LIVE_OFFERS;
}

export function isOfferLive(offer: BundleOffer): boolean {
  return LIVE_OFFERS.some((live) => live.id === offer.id);
}

/** Every code the bundles may put on a cart (the cart manages these only). */
export const BUNDLE_CODES: string[] = [
  ...LIVE_OFFERS.map((offer) => offer.code.trim()),
  ...(GIFT_LIVE ? [GIFT.code.trim()] : []),
];

/**
 * Codes for a bundle added to the cart — decided on the server from the
 * offer id, never taken from the browser.
 */
export function codesForBundle(
  offerId: string,
  withGift: boolean,
): {codes: string[]; giftCode: string | null} {
  const offer = LIVE_OFFERS.find((candidate) => candidate.id === offerId);
  if (!offer) return {codes: [], giftCode: null};
  const giftCode =
    withGift && offer.gift && GIFT_LIVE ? GIFT.code.trim() : null;
  return {
    codes: [offer.code.trim(), ...(giftCode ? [giftCode] : [])],
    giftCode,
  };
}

export type BundleQuote = {
  /** Sum of the pieces at full price. */
  full: number;
  /** What the pieces cost under the offer. */
  total: number;
  saving: number;
  /** Whole-number percentage saved on the pieces. */
  percentSaved: number;
  /** Index of the piece carrying the reduction ('cheapest' offers). */
  discountedIndex: number | null;
};

/**
 * Prices a set of pieces under an offer. 'cheapest': the percentage comes
 * off the cheapest piece, as Shopify's "Buy X get Y" does. 'order': off
 * every piece. Below the offer's piece count, nothing comes off.
 */
export function quote(offer: BundleOffer, prices: number[]): BundleQuote {
  const full = round(prices.reduce((sum, price) => sum + price, 0));
  const complete = prices.length >= offer.items;
  let saving = 0;
  let discountedIndex: number | null = null;

  if (complete && offer.appliesTo === 'order') {
    saving = (full * offer.percent) / 100;
  } else if (complete && prices.length) {
    discountedIndex = prices.indexOf(Math.min(...prices));
    saving = (prices[discountedIndex] * offer.percent) / 100;
  }

  saving = round(saving);
  return {
    full,
    total: round(full - saving),
    saving,
    percentSaved: full > 0 ? Math.round((saving / full) * 100) : 0,
    discountedIndex,
  };
}

/** Progress towards the free T-shirt: 0–1, and what is still missing. */
export function giftProgress(total: number): {
  ratio: number;
  remaining: number;
  unlocked: boolean;
} {
  const threshold = GIFT.threshold;
  if (threshold <= 0) return {ratio: 0, remaining: 0, unlocked: false};
  const remaining = round(Math.max(0, threshold - total));
  return {
    ratio: Math.min(1, total / threshold),
    remaining,
    unlocked: remaining === 0,
  };
}

function round(amount: number): number {
  return Math.round(amount * 100) / 100;
}
