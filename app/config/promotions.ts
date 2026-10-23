/**
 * Welcome pop-up — -15% on the first order, in exchange for a phone number,
 * shown once per visitor. Each number is e-mailed to INBOX
 * through Resend (RESEND_API_KEY on Vercel); the pop-up stays hidden without
 * it.
 *
 * The site sells nothing online: the code is only worth something where you
 * accept it (in the shop). Set `enabled: false` to hide the pop-up.
 */
export const PROMOTIONS = {
  welcomePopup: {
    enabled: true,
    code: 'WELCOME15',
    percent: 15,
  },
};

/** True when an offer is switched on AND has a code. */
export function isLive(offer: {enabled: boolean; code?: string}): boolean {
  return (
    offer.enabled && (offer.code === undefined || offer.code.trim() !== '')
  );
}
