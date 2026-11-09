/**
 * What the buy box says about availability — Shopify's own inventory only.
 * A low count is shown exactly as Shopify reports it (quantityAvailable,
 * when the shop publishes it); otherwise a plain "in stock". Nothing here
 * invents a number.
 */
export type StockState =
  | {kind: 'out'}
  | {kind: 'low'; count: number}
  | {kind: 'in'};

/** Shopify's own count is called "low" at or under this many units. */
const REAL_LOW_THRESHOLD = 10;

export function stockState({
  available,
  quantityAvailable,
}: {
  available: boolean;
  /** Shopify's figure, or null when the store doesn't publish one. */
  quantityAvailable: number | null;
  /** Kept for the Reda Studio call signature; unused. */
  seed?: string;
}): StockState {
  if (!available) return {kind: 'out'};
  return quantityAvailable !== null &&
    quantityAvailable > 0 &&
    quantityAvailable <= REAL_LOW_THRESHOLD
    ? {kind: 'low', count: quantityAvailable}
    : {kind: 'in'};
}
