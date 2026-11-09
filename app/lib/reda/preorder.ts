/**
 * "Royal Longsleeve — White" pre-order / waitlist — see
 * docs/preorder-royal-longsleeve.md for the full picture. Everything that
 * scopes the feature to this one product lives here, so turning it on for a
 * different product (or off entirely) is a one-line change in one file.
 */
export const PREORDER_PRODUCT_HANDLE: string = '';

export function isPreorderHandle(handle: string): boolean {
  return PREORDER_PRODUCT_HANDLE !== '' && handle === PREORDER_PRODUCT_HANDLE;
}

/**
 * This product's variant IDs, as of the pre-order going live — checked in
 * app/routes/cart.tsx so a request crafted straight against the cart action
 * (bypassing the buy box, which never renders an add-to-cart control for
 * this product at all) still can't add it.
 *
 * Hardcoded rather than looked up, so a normal add-to-cart for every *other*
 * product never pays for an extra query. The trade-off: if a size is ever
 * added to this product while the pre-order is active, it must be added
 * here too — Shopify Admin → Products → Royal Longsleeve — White →
 * Variants → copy the numeric id from each variant's URL.
 */
export const PREORDER_BLOCKED_VARIANT_IDS = new Set<string>([]);

/**
 * The discount promised to waitlist members once this product actually
 * launches. Only a constant, referenced nowhere that sends it automatically
 * — see docs/preorder-royal-longsleeve.md for how to run that campaign by
 * hand, once, when the piece is actually ready to sell.
 */
export const PREORDER_LAUNCH_PROMO_CODE: string = '';

/** The tag every waitlist sign-up gets in Shopify Admin → Customers. */
export const PREORDER_CUSTOMER_TAG = `preorder-${PREORDER_PRODUCT_HANDLE}`;
