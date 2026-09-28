import {PROMOTIONS} from '~/config/promotions';

/**
 * The volume offer (−20% on the 2nd piece, −30% from the 3rd). Values come
 * from app/config/promotions.ts; the reduction itself is applied by a
 * tiered-discount app in Shopify Admin. Change both together, never one alone.
 */

/** Switched in app/config/promotions.ts (`tiers.enabled`). */
export const TIER_ENABLED: boolean = PROMOTIONS.tiers.enabled;

/** Percentage off by position in the basket: 1st, 2nd, 3rd and beyond. */
export const TIER_PERCENTS = PROMOTIONS.tiers.percents;

export const SECOND_ITEM_PERCENT = TIER_PERCENTS[1];
export const THIRD_ITEM_PERCENT = TIER_PERCENTS[2];

/** What comes off the item in this position (1-based). */
export function percentForPosition(position: number): number {
  if (!TIER_ENABLED || position < 1) return 0;
  const index = Math.min(position, TIER_PERCENTS.length) - 1;
  return TIER_PERCENTS[index];
}

/**
 * What a set of pieces costs under the offer.
 *
 * The order matters, and the assumption is stated rather than hidden: the
 * dearest piece is treated as the first one, so the reductions land on the
 * cheaper pieces. That is how tiered-discount apps normally allocate, and it
 * is the least flattering reading — the basket can only come out cheaper than
 * announced at checkout, never dearer.
 */
export function tierTotal(prices: number[]): {
  full: number;
  total: number;
  saving: number;
} {
  const full = prices.reduce((sum, price) => sum + price, 0);

  if (!TIER_ENABLED) return {full, total: full, saving: 0};

  const total = [...prices]
    .sort((a, b) => b - a)
    .reduce(
      (sum, price, index) =>
        sum + price * (1 - percentForPosition(index + 1) / 100),
      0,
    );

  return {full, total, saving: full - total};
}

/**
 * What the basket still has to gain, given how many pieces are in it. Null
 * once the best tier is reached — at which point there is nothing to nudge
 * anyone towards, and the cart says what it has instead.
 */
export function nextTier(
  quantity: number,
): {itemsNeeded: number; percent: number} | null {
  if (!TIER_ENABLED || quantity < 1) return null;
  if (quantity >= TIER_PERCENTS.length) return null;

  return {itemsNeeded: 1, percent: TIER_PERCENTS[quantity]};
}
