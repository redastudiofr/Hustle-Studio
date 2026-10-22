import {PROMOTIONS, isLive} from '~/config/promotions';

/**
 * Homepage duo offer (the 2nd piece at -50 %). Display only: Shopify takes
 * the money off, through the code below, attached by the cart on the server.
 */
export const DUO = PROMOTIONS.homeDuo;

/** Cart action of the duo button: both pieces and the code, one request. */
export const DUO_ADD_ACTION = 'CustomDuoAdd' as const;

/** On only when switched on AND backed by a Shopify code. */
export const DUO_LIVE = isLive(DUO);

export const DUO_CODE = DUO.code.trim();
