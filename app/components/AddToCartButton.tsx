import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useT} from '~/lib/i18n';
import {BUNDLE_ADD_ACTION} from '~/lib/bundles';
import {PACK_ADD_ACTION} from '~/lib/packOffer';
import {TEE_PACK_ADD_ACTION} from '~/lib/teePacks';
import {cartFeedbackMessage} from '~/components/CartLineItem';

/** Shared by every add button, so the cart drawer can read the last add's outcome. */
export const ADD_TO_CART_FETCHER_KEY = 'cart-lines-add';
/** Keys of the offer buttons, so each shows its own "adding…" state. */
export const BUNDLE_FETCHER_KEY = 'cart-bundle-add';
export const PACK_FETCHER_KEY = 'cart-pack-add';
export const TEE_PACK_FETCHER_KEY = 'cart-tee-pack-add';

/**
 * Adds lines to the real Shopify cart (cartLinesAdd, or cartCreate on the
 * first add) through the /cart action. The header count and the drawer
 * update optimistically; if Shopify refuses the add, the drawer shows its
 * error message (see CartMain).
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'btn btn--full',
  bundle = false,
  pack = false,
  teePack = false,
  ariaLabel,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  /** Adds through the bundle action (offer and gift codes, server-side). */
  bundle?: {offer: string; gift: boolean} | false;
  /** Adds through the pack action, which attaches the pack's own code. */
  pack?: boolean;
  /** Adds through the t-shirt pack action (offer code chosen server-side). */
  teePack?: {offer: string} | false;
  ariaLabel?: string;
  /** Accepted for compatibility with the offer components; no effect. */
  shiny?: boolean;
}) {
  const t = useT();
  const action = teePack
    ? TEE_PACK_ADD_ACTION
    : pack
      ? PACK_ADD_ACTION
      : bundle
        ? BUNDLE_ADD_ACTION
        : CartForm.ACTIONS.LinesAdd;

  return (
    <CartForm
      route="/cart"
      inputs={
        teePack
          ? {lines, offer: teePack.offer}
          : bundle
            ? {lines, offer: bundle.offer, gift: bundle.gift}
            : {lines}
      }
      action={action}
      fetcherKey={
        teePack
          ? TEE_PACK_FETCHER_KEY
          : pack
            ? PACK_FETCHER_KEY
            : bundle
              ? BUNDLE_FETCHER_KEY
              : ADD_TO_CART_FETCHER_KEY
      }
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {fetcher.state !== 'idle' ? t('product.adding') : children}
          </button>
          {fetcher.state === 'idle' && cartFeedbackMessage(fetcher.data) && (
            <p className="form-error" role="alert">
              {cartFeedbackMessage(fetcher.data)}
            </p>
          )}
        </>
      )}
    </CartForm>
  );
}
