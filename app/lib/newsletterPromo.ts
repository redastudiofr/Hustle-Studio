import {PROMOTIONS, isLive} from '~/config/promotions';

/**
 * The welcome pop-up's code — set in app/config/promotions.ts. Read only by
 * the /newsletter route: the pop-up displays whatever code the server
 * returns, so the code shown and the code recorded can never drift apart.
 * It must also exist as an active discount in Shopify Admin → Discounts.
 */
export const NEWSLETTER_PROMO_CODE = PROMOTIONS.welcomePopup.code.trim();

/** The percentage the pop-up announces. */
export const NEWSLETTER_PROMO_PERCENT = PROMOTIONS.welcomePopup.percent;

/**
 * Set by the server once a phone number is stored, read by the pop-up to
 * never ask that visitor again. Holds nothing but "1".
 */
export const PROMO_SIGNUP_COOKIE = 'hs_promo_signup';

/** On only when switched on AND a code is set (Notion is checked in root.tsx). */
export const PROMO_POPUP_ACTIVE = isLive(PROMOTIONS.welcomePopup);
