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
   * Bundles — the box on every product page where the customer builds a set
   * and picks one of three offers (app/components/product/SmartBundle.tsx).
   *
   * Each offer goes live once its `code` is filled in (and `enabled` is
   * true). Until then it sells the set at full price ("discount coming soon",
   * "Buy now" straight to checkout)
   * (set `enabled: false` to hide the whole box). In Shopify Admin → Discounts, create for each code
   * (step by step in docs/PROMOTIONS.md):
   *   duo  — Buy X get Y: buys 1 item, gets 1 item at `percent`% off
   *   trio — Buy X get Y: buys 2 items, gets 1 item at `percent`% off
   *   best — Amount off order: `percent`%, minimum quantity `minItems`
   *   gift — Buy X get Y: minimum purchase `threshold` €, gets the product
   *          `gift.productHandle` free; allow it to combine with order
   *          discounts.
   * Shopify's "Buy X get Y" puts the reduction on the cheapest item; the
   * product page computes its prices the same way.
   */
  bundles: {
    enabled: true,
    offers: [
      {
        id: 'duo',
        code: '',
        name: 'Duo',
        rule: '2nd piece −20%',
        items: 2,
        percent: 20,
        /** 'cheapest': on one piece (Buy X get Y). 'order': on every piece. */
        appliesTo: 'cheapest',
        badge: '',
      },
      {
        id: 'trio',
        code: '',
        name: 'Trio',
        rule: '3rd piece −30%',
        items: 3,
        percent: 30,
        appliesTo: 'cheapest',
        badge: 'Popular',
      },
      {
        id: 'best',
        code: '',
        name: 'Best offer',
        rule: '−30% on the whole order',
        items: 2,
        /** The customer may add pieces up to `maxItems`. */
        maxItems: 4,
        percent: 30,
        appliesTo: 'order',
        badge: 'Best offer',
        /** This offer unlocks the free T-shirt below. */
        gift: true,
      },
    ] as BundleOfferConfig[],

    /** Free T-shirt, unlocked when the bundle total reaches `threshold` €. */
    gift: {
      code: '',
      /** Shopify handle of the T-shirt given (end of its product URL). */
      productHandle: '',
      label: 'Free T-shirt',
      /** In euros, measured on the bundle total after its discount. */
      threshold: 100,
    },
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
   * T-shirt packs — the "Compose ton pack" selector of the product page:
   * 1 t-shirt, 2 bought + 1 free, 3 bought + 2 free.
   *
   * Each pack option shows only once its `code` is filled in, on products of
   * the `collection` below — the site never announces a free t-shirt Shopify
   * is not set up to give. In Shopify Admin → Discounts, create for each:
   *   Buy X get Y — Customer buys: minimum quantity `buy`, items from the
   *   collection `collection`; Customer gets: quantity `free`, items from the
   *   same collection, at 100 % off ("Free"); one use per order.
   * The free pieces are added to the cart as their own lines; if Shopify
   * does not apply the code to the basket, those lines are removed rather
   * than billed (app/routes/cart.tsx).
   */
  teePacks: {
    enabled: true,
    /** Shopify handle of the t-shirt collection the discounts target. */
    collection: 'tshirt',
    offers: [
      {id: '2+1', buy: 2, free: 1, code: '', mostChosen: true},
      {id: '3+2', buy: 3, free: 2, code: '', mostChosen: false},
    ] as TeePackOfferConfig[],
  },

  /**
   * Welcome pop-up — -15% on the first order, in exchange for a phone
   * number, shown once per visitor. Each number is e-mailed to
   * LAUNCH.notifyEmail through Resend (RESEND_API_KEY on Vercel), or stored
   * in Notion when NOTION_API_KEY and NOTION_PHONE_DATABASE_ID are set.
   *
   * It shows only once `code` is filled in AND one of those is configured:
   * create the discount in Shopify first (docs/WAITLIST.md, "Pop-up -15%"),
   * then type its exact code here.
   */
  welcomePopup: {
    enabled: true,
    code: 'WELCOME15',
    percent: 15,
  },
};

/** True when an offer is switched on AND has a Shopify code to back it. */
export function isLive(offer: {enabled: boolean; code?: string}): boolean {
  return (
    offer.enabled && (offer.code === undefined || offer.code.trim() !== '')
  );
}

export type BundleOfferConfig = {
  id: string;
  code: string;
  name: string;
  rule: string;
  items: number;
  maxItems?: number;
  percent: number;
  appliesTo: 'cheapest' | 'order';
  badge: string;
  gift?: boolean;
};

export type TeePackOfferConfig = {
  id: string;
  /** T-shirts paid for. */
  buy: number;
  /** T-shirts given on top. */
  free: number;
  /** The Shopify discount code, exactly as written in Shopify Admin. */
  code: string;
  /** Selected by default and marked "most chosen". */
  mostChosen: boolean;
};
