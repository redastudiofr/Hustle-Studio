/**
 * Promotions — every offer the storefront can talk about, in one file.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at checkout. Each offer below therefore needs a matching discount
 * created in Shopify Admin → Discounts, with exactly the code written here.
 *
 * **An offer stays invisible until its code is filled in.** That is the
 * safety net: the site never announces a reduction Shopify is not set up to
 * apply. To switch an offer on:
 *   1. create the discount in Shopify Admin (steps in docs/PROMOTIONS.md);
 *   2. type its code below, and set `enabled: true`;
 *   3. push — Vercel redeploys on its own.
 * To switch one off, set `enabled: false` (and deactivate it in Shopify).
 */
export const PROMOTIONS = {
  /**
   * "Take two" — a percentage off the second piece in the basket. Shown as a
   * box under the buy buttons on every product page; the code is attached to
   * the cart automatically once it holds `minPieces` items.
   *
   * Shopify discount: Amount off products, percentage `percent`, minimum
   * quantity `minPieces`, applies to the cheapest item — or Buy X get Y.
   */
  secondItem: {
    enabled: false,
    code: '',
    percent: 30,
    minPieces: 2,
    /** Old codes still possibly sitting in shoppers' carts; swapped for `code`. */
    retiredCodes: [] as string[],
  },

  /**
   * The pack — the customer builds a set (a top, a bottom, a longsleeve) and a
   * fourth piece is given. Page at /pack, plus a section on the homepage.
   *
   * Shopify: create the collection `collection` holding the pack's products,
   * and a "Buy X get Y" discount (buy 3 from that collection, get
   * `freeProductHandle` at 100% off) with the code `code`.
   */
  pack: {
    enabled: false,
    code: '',
    collection: 'pack-essentiel',
    /** Handle of the product given for free (Shopify product URL, last part). */
    freeProductHandle: '',
  },

  /**
   * Volume offer — −20% on the 2nd piece, −30% from the 3rd, on everything.
   * Only a line of text on product and collection pages; the reduction comes
   * from a tiered-discount app in Shopify Admin. Keep it off while `secondItem`
   * is on — the two contradict each other.
   */
  tiers: {
    enabled: false,
    percents: [0, 20, 30] as const,
  },

  /**
   * Welcome pop-up — a discount code in exchange for a phone number, shown
   * once per visitor. Numbers are stored in a Notion database (environment
   * variables NOTION_API_KEY and NOTION_PHONE_DATABASE_ID); the pop-up stays
   * hidden until those are set on Vercel, even if `enabled` is true.
   */
  welcomePopup: {
    enabled: false,
    code: '',
    percent: 15,
  },
};

/** True when an offer is switched on AND has a Shopify code to back it. */
export function isLive(offer: {enabled: boolean; code?: string}): boolean {
  return (
    offer.enabled && (offer.code === undefined || offer.code.trim() !== '')
  );
}
