import {PROMOTIONS, isLive} from '~/config/promotions';

/**
 * Second-piece offer — values come from app/config/promotions.ts.
 *
 * Display only: Shopify decides what is actually taken off. If these figures
 * and the Shopify discount ever disagree, the customer is shown one price and
 * charged another — change both together.
 */
const offer = PROMOTIONS.secondItem;

export const SECOND_ITEM_DISCOUNT_PERCENT = offer.percent;

/** On only when switched on AND a Shopify code is set. */
export const OFFER_ENABLED = isLive(offer);

/** The offer's code, attached to the cart by app/routes/cart.tsx. */
export const OFFER_DISCOUNT_CODE: string = OFFER_ENABLED
  ? offer.code.trim()
  : '';

/** Codes this offer ran on before, swapped for the current one. */
export const RETIRED_OFFER_CODES: string[] = offer.retiredCodes;

/** How many pieces a basket holds before the code goes on. */
export const OFFER_MIN_PIECES = offer.minPieces;

/**
 * Custom cart action: adds the pair's two lines in one request. Kept
 * registered even when the offer is off, so a cached page still works.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;

/**
 * What the offer takes off a pair, following Shopify's rule for "buy X get
 * Y": the reduction lands on the cheapest item. Used for the product page's
 * estimate only — the cart shows what Shopify actually allocated.
 */
export function pairSaving(firstAmount: number, secondAmount: number): number {
  if (!OFFER_ENABLED) return 0;
  const cheapest = Math.min(firstAmount, secondAmount);
  return (cheapest * SECOND_ITEM_DISCOUNT_PERCENT) / 100;
}
