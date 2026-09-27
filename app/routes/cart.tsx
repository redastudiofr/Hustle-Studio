import {
  useLoaderData,
  data,
  redirect,
  type HeadersFunction,
} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {useT} from '~/lib/i18n';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return seoMeta({title: 'cart', noindex: true});
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

const CART_UNAVAILABLE_MESSAGE =
  'Le panier est momentanément indisponible. Réessayez dans un instant. / The cart is temporarily unavailable, please try again.';

/**
 * Every cart change goes through this action — Hydrogen's cart helpers call
 * the Storefront API's cart mutations (cartCreate on the first add, then
 * cartLinesAdd / cartLinesUpdate / cartLinesRemove / …) and the cart id is
 * kept in a cookie, so the cart survives navigation and reloads.
 */
export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    return data(
      {cart: null, errors: [{message: 'Invalid cart request'}], warnings: []},
      {status: 400},
    );
  }

  let status = 200;
  let result: CartQueryDataReturn;

  // A Shopify outage must not replace the whole page with an error screen:
  // the cart keeps its last state and the drawer shows a readable message.
  try {
    switch (action) {
      case CartForm.ACTIONS.LinesAdd:
        result = await cart.addLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesUpdate:
        result = await cart.updateLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesRemove:
        result = await cart.removeLines(inputs.lineIds);
        break;
      case CartForm.ACTIONS.DiscountCodesUpdate: {
        const formDiscountCode = inputs.discountCode;

        // User inputted discount code
        const discountCodes = (
          formDiscountCode ? [formDiscountCode] : []
        ) as string[];

        // Combine discount codes already applied on cart
        discountCodes.push(...inputs.discountCodes);

        result = await cart.updateDiscountCodes(discountCodes);
        break;
      }
      case CartForm.ACTIONS.GiftCardCodesAdd: {
        const formGiftCardCode = inputs.giftCardCode;

        const giftCardCodes = (
          formGiftCardCode ? [formGiftCardCode] : []
        ) as string[];

        result = await cart.addGiftCardCodes(giftCardCodes);
        break;
      }
      case CartForm.ACTIONS.GiftCardCodesRemove: {
        const appliedGiftCardIds = inputs.giftCardCodes as string[];
        result = await cart.removeGiftCardCodes(appliedGiftCardIds);
        break;
      }
      case CartForm.ACTIONS.BuyerIdentityUpdate: {
        result = await cart.updateBuyerIdentity({
          ...inputs.buyerIdentity,
        });
        break;
      }
      default:
        return data(
          {
            cart: null,
            errors: [{message: `Unknown cart action: ${action}`}],
            warnings: [],
          },
          {status: 400},
        );
    }
  } catch (error) {
    console.error('Cart action failed', error);
    if (formData.get('checkoutAfterAdd') === 'true') {
      return redirect('/cart', {status: 303});
    }
    return data(
      {
        cart: null,
        errors: [{message: CART_UNAVAILABLE_MESSAGE}],
        warnings: [],
      },
      {status: 502},
    );
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  // Same-site paths only: never bounce a shopper to another domain.
  if (typeof redirectTo === 'string' && /^\/(?!\/)/.test(redirectTo)) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  /*
   * "Buy now" posts this flag and expects the server to send the customer
   * straight to checkout. Redirecting here rather than from the browser keeps
   * the whole thing one navigation: nothing is fetched client-side, so nothing
   * can be aborted mid-flight and surface as an error.
   *
   * If the cart came back without a checkout URL we simply fall through to the
   * cart page — a missing URL must not cost the customer their basket.
   */
  if (formData.get('checkoutAfterAdd') === 'true') {
    status = 303;
    // If Shopify refused the add, show the cart (with its message) rather
    // than sending the shopper to pay for a cart without the item.
    headers.set(
      'Location',
      errors?.length ? '/cart' : (cartResult?.checkoutUrl ?? '/cart'),
    );
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const t = useT();
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="page page--wide">
      <h1>{t('cart.title')}</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
