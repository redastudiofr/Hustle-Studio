import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useT} from '~/lib/i18n';
import {cartFeedbackMessage} from '~/components/CartLineItem';

/** Shared by every add button, so the cart drawer can read the last add's outcome. */
export const ADD_TO_CART_FETCHER_KEY = 'cart-lines-add';

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
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  const t = useT();

  return (
    <CartForm
      route="/cart"
      inputs={{lines}}
      action={CartForm.ACTIONS.LinesAdd}
      fetcherKey={ADD_TO_CART_FETCHER_KEY}
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
