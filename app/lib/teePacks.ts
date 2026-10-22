import {PROMOTIONS, type TeePackOfferConfig} from '~/config/promotions';

/**
 * T-shirt packs (product page "Compose ton pack"): which offers are live,
 * and the code each one puts on the basket.
 *
 * Display only: Shopify decides what is taken off. An offer is live only
 * with a code set in app/config/promotions.ts; the code is chosen on the
 * server from the offer id, never sent by the browser.
 */
const config = PROMOTIONS.teePacks;

export type TeePackOffer = TeePackOfferConfig;

/** Cart action of the pack selector: its lines and offer, one request. */
export const TEE_PACK_ADD_ACTION = 'CustomTeePackAdd' as const;

/** Line attribute marking a free t-shirt, so the cart can find it again. */
export const TEE_PACK_FREE_ATTRIBUTE = '_hs_pack_free';

/** Collection whose products the packs (and their discounts) cover. */
export const TEE_PACK_COLLECTION = config.collection.trim();

/** Offers customers can pick: enabled, with a Shopify code behind them. */
export const LIVE_TEE_PACKS: TeePackOffer[] = config.enabled
  ? config.offers.filter((offer) => offer.code.trim() !== '')
  : [];

/** Codes the packs may put on a basket (the cart manages these only). */
export const TEE_PACK_CODES: string[] = LIVE_TEE_PACKS.map((offer) =>
  offer.code.trim(),
);

/** The code for a pack added to the cart — from its id, on the server. */
export function codeForTeePack(offerId: string): string | null {
  const offer = LIVE_TEE_PACKS.find((candidate) => candidate.id === offerId);
  return offer ? offer.code.trim() : null;
}
