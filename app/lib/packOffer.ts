import {PROMOTIONS, isLive} from '~/config/promotions';

/**
 * The essential pack: three pieces chosen by the customer — a pair of jeans,
 * a longsleeve and a tee — and a fourth tee given by Shopify.
 *
 * **Nothing here decides a price.** The reduction is a native "Buy X get Y"
 * discount configured in Shopify Admin; the storefront only picks the pieces,
 * says what the offer is and puts the lines in the basket. That division
 * matters: a storefront cannot take money off, so anything it announces has
 * to be something Shopify is already configured to do.
 *
 * What this file *does* decide is which products the pack page offers — and
 * that list has to be the same one the discount rule targets, or the customer
 * is promised a free tee that never materialises at checkout. Hence two
 * sources, in this order:
 *
 *  The pack collection in Shopify Admin (app/config/promotions.ts). Point the
 *  discount rule at that same collection and the two can never drift: adding
 *  a product to the collection adds it to the page, with no deploy.
 *
 * See docs/PROMOTIONS.md.
 */

/** On only when switched on AND a code and a free product are set. */
export const PACK_ENABLED =
  isLive(PROMOTIONS.pack) && PROMOTIONS.pack.freeProductHandle.trim() !== '';

/** Where the pack page lives. */
export const PACK_PATH = '/pack';

/**
 * The collection that defines what belongs to the pack — create it in Shopify
 * Admin and point the Buy X get Y rule at it.
 */
export const PACK_COLLECTION_HANDLE = PROMOTIONS.pack.collection;

/**
 * The three kinds of piece the pack is built from. Broad on purpose: a
 * « haut » is a tee, a hoodie, a zip or a knit, a « bas » is jeans, a jogging,
 * a cargo or shorts — so a new product finds its place without a code change.
 * Longsleeves keep a slot of their own and never count as a « haut ».
 */
export type PackSlot = 'top' | 'bottom' | 'longsleeve';

/** The three choices, in the order the page presents them. */
export const PACK_SLOTS: PackSlot[] = ['top', 'bottom', 'longsleeve'];

/**
 * The piece that is given — a named product, not "a tee".
 *
 * It is shown as the fourth piece of the pack, marked as free, and added to
 * the basket with the other three: a discount code takes money off a line
 * that exists, it does not create one. If this handle ever stops matching the
 * product the discount is written for, the customer is charged for it.
 */
export const PACK_FREE_HANDLE = PROMOTIONS.pack.freeProductHandle.trim();

/**
 * The code that makes that tee free, exactly as spelled in Shopify — no
 * spaces, uppercase.
 *
 * It is the pack's code and nothing else's: the product page's "take two" box
 * runs on its own code (`OFFER_DISCOUNT_CODE` in ./offers.ts), and the two
 * must never be confused. The customer never types this one — the cart action
 * attaches it when the pack is added — but it stays visible on the basket so
 * they can check it.
 */
export const PACK_DISCOUNT_CODE = PROMOTIONS.pack.code.trim();

/**
 * Custom cart action: adds the pack's lines and attaches the pack's code in
 * the same request.
 *
 * The pack needs its own action precisely because it has its own code. Adding
 * the four lines through the ordinary add would attach the *other* offer's
 * code instead, and the tee would be charged for.
 */
export const PACK_ADD_ACTION = 'CustomPackAdd' as const;

/**
 * Whether the free tee is added to the basket alongside the three chosen
 * pieces.
 *
 * On, because a discount takes money off a line that exists — it does not
 * create one. The tee has to be in the basket for the pack's code to bring it to
 * zero, which is also why the page shows it as the fourth piece rather than
 * as a promise about checkout.
 *
 * Off only if the discount is ever rewritten so that one of the three chosen
 * pieces is itself the free one.
 */
export const PACK_ADDS_FREE_LINE = true;

/*
 * Tested in this order, and the order matters: a longsleeve is a top by
 * shape but has its own slot, and « sweatpants » must land in the bottoms
 * before the word « sweat » can file it among the tops.
 */
const LONGSLEEVE = /long\s*-?\s*sleeve|manches?\s+longues?/i;
const BOTTOM =
  /\b(jeans?|denim|jogg(?:ing|er)s?|sweat\s*-?\s*pants?|track\s*-?\s*pants?|pants?|pantalons?|cargos?|shorts?(?!\s*-?\s*sleeves?)|bermudas?|trousers?|chinos?)\b/i;
const TOP =
  /\b(t\s*-?\s*shirts?|tee\s*-?\s*shirts?|tees?|hoodies?|hoody|zip(?:\s*-?\s*hoodie)?s?|knits?|knitwear|pulls?|pullovers?|sweaters?|sweat\s*-?\s*shirts?|sweats?|crewnecks?|polos?|shirts?|chemises?|tank\s*-?\s*tops?|tops?|cardigans?|mailles?)\b/i;

/**
 * Which slot a product belongs to, read from what it is — its type, title and
 * handle — rather than from a list: a product added to the pack collection in
 * Shopify lands in the right slot on its own. Null for anything that matches
 * none of them, which the page then leaves out rather than filing under a
 * guess.
 */
export function slotForProduct(product: {
  handle: string;
  title: string;
  productType?: string | null;
}): PackSlot | null {
  // Handles separate words with hyphens; spaces let the patterns read them
  // the same way as titles.
  const text = `${product.productType ?? ''} ${product.title} ${product.handle.replace(/-/g, ' ')}`;

  if (LONGSLEEVE.test(text)) return 'longsleeve';
  if (BOTTOM.test(text)) return 'bottom';
  if (TOP.test(text)) return 'top';
  return null;
}
