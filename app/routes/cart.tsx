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
import {
  BUNDLE_ADD_ACTION,
  BUNDLE_CODES,
  GIFT,
  GIFT_ATTRIBUTE,
  codesForBundle,
} from '~/lib/bundles';
import {PACK_ADD_ACTION, PACK_DISCOUNT_CODE} from '~/lib/packOffer';

export const meta: Route.MetaFunction = () => {
  return seoMeta({title: 'cart', noindex: true});
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

const CART_UNAVAILABLE_MESSAGE =
  'Le panier est momentanément indisponible. Réessayez dans un instant. / The cart is temporarily unavailable, please try again.';

/** The shop's own offer codes: the bundles' and the pack's. */
const OFFER_CODES = [...BUNDLE_CODES, PACK_DISCOUNT_CODE].filter(Boolean);

const isShopCode = (code: string) => OFFER_CODES.includes(code);

type CartApi = Route.ActionArgs['context']['cart'];

/**
 * Runs a change to the cart and settles which offer codes it comes out with.
 *
 * One rule, for every kind of change: **a basket keeps the offer it is
 * already under.** Only a bundle or the pack can put it under one (and
 * replaces any other offer); a plain add, a quantity change or a removal
 * never attaches or swaps a code.
 *
 * Shopify removes a code the moment the basket stops satisfying it and never
 * puts it back, so the codes are read before the change and anything the
 * basket was carrying is put back. Whether the basket *deserves* the
 * reduction is Shopify's to judge — it marks a code inapplicable when it
 * doesn't. Codes the customer typed themselves are never touched.
 *
 * Never throws. Whatever happens to the discount, the line change stands.
 */
async function withOfferCode(
  cart: CartApi,
  mutate: () => Promise<CartQueryDataReturn>,
  {attach = [], replace = false}: {attach?: string[]; replace?: boolean} = {},
): Promise<CartQueryDataReturn> {
  let carried: string[] = [];

  try {
    const before = await cart.get();
    carried = (before?.discountCodes ?? [])
      .map((discount) => discount.code)
      .filter(isShopCode);
  } catch (error) {
    console.error('Cart could not be read before the change', error);
  }

  let result = await mutate();
  if (!result?.cart) return result;

  // A mutation only answers with the cart's id and count: read the full cart
  // (lines, codes) before deciding anything.
  let after = await readCart(cart);

  try {
    const now = (after?.discountCodes ?? []).map((discount) => discount.code);

    const chosen =
      replace && attach.length ? attach : carried.length ? carried : attach;

    const typedByTheCustomer = now.filter((code) => !isShopCode(code));
    const wanted = [...new Set([...typedByTheCustomer, ...chosen])];

    const unchanged =
      wanted.length === now.length &&
      wanted.every((code) => now.includes(code));
    if (!unchanged) {
      const updated = await cart.updateDiscountCodes(wanted);
      if (updated?.cart) {
        result = updated;
        after = await readCart(cart);
      }
    }
  } catch (error) {
    console.error('Offer code could not be settled on the cart', error);
  }

  return withoutUnbackedGift(cart, result, after);
}

async function readCart(cart: CartApi) {
  try {
    return await cart.get();
  } catch (error) {
    console.error('Cart could not be read after the change', error);
    return null;
  }
}

/**
 * The free T-shirt is only ever free: if its code is not on the basket, or
 * Shopify says the basket no longer qualifies (a piece removed, the total
 * under the threshold), the T-shirt line is taken out rather than billed.
 */
async function withoutUnbackedGift(
  cart: CartApi,
  result: CartQueryDataReturn,
  after: Awaited<ReturnType<typeof readCart>>,
): Promise<CartQueryDataReturn> {
  const lines = after?.lines?.nodes ?? [];
  const giftLines = lines.filter((line) =>
    line.attributes?.some((attribute) => attribute.key === GIFT_ATTRIBUTE),
  );
  if (!giftLines.length) return result;

  const giftCode = GIFT.code.trim();
  const backed = (after?.discountCodes ?? []).some(
    (discount) =>
      giftCode !== '' && discount.code === giftCode && discount.applicable,
  );
  if (backed) return result;

  try {
    const cleaned = await cart.removeLines(giftLines.map((line) => line.id));
    return cleaned?.cart ? cleaned : result;
  } catch (error) {
    console.error('Unbacked gift line could not be removed', error);
    return result;
  }
}

/** Bundle lines from the form: sane quantities, a handful of lines at most. */
function bundleLinesFrom(
  lines: unknown,
  keepGift: boolean,
): Parameters<CartApi['addLines']>[0] {
  type Line = {
    merchandiseId: string;
    quantity: number;
    attributes?: {key: string; value: string}[];
  };
  if (!Array.isArray(lines)) return [];
  return (lines as Partial<Line>[])
    .filter(
      (line): line is Line =>
        typeof line?.merchandiseId === 'string' &&
        line.merchandiseId.startsWith('gid://shopify/ProductVariant/') &&
        Number.isInteger(line.quantity) &&
        (line.quantity ?? 0) > 0 &&
        (line.quantity ?? 0) <= 4,
    )
    .filter(
      (line) =>
        keepGift ||
        !line.attributes?.some((attribute) => attribute.key === GIFT_ATTRIBUTE),
    )
    .slice(0, 6)
    .map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      attributes: (line.attributes ?? [])
        .filter((attribute) => attribute.key === GIFT_ATTRIBUTE)
        .map(() => ({key: GIFT_ATTRIBUTE, value: 'true'})),
    }));
}

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
        result = await withOfferCode(cart, () => cart.addLines(inputs.lines));
        break;
      // Bundle box: its pieces (and the free T-shirt when unlocked) in one
      // request. The codes come from the offer id, on the server — a
      // browser cannot pick its own discount.
      case BUNDLE_ADD_ACTION: {
        const {codes, giftCode} = codesForBundle(
          String(inputs.offer ?? ''),
          inputs.gift === true || inputs.gift === 'true',
        );
        const bundleLines = bundleLinesFrom(inputs.lines, giftCode !== null);
        if (!bundleLines.length) {
          return data(
            {cart: null, errors: [{message: 'Invalid bundle'}], warnings: []},
            {status: 400},
          );
        }
        result = await withOfferCode(cart, () => cart.addLines(bundleLines), {
          attach: codes,
          replace: codes.length > 0,
        });
        break;
      }
      // Pack add: the chosen pieces plus the free one, and the pack's own
      // code, which replaces any other offer code on the basket.
      case PACK_ADD_ACTION: {
        const packLines = inputs.lines as Parameters<typeof cart.addLines>[0];
        result = await withOfferCode(cart, () => cart.addLines(packLines), {
          attach: PACK_DISCOUNT_CODE ? [PACK_DISCOUNT_CODE] : [],
          replace: true,
        });
        break;
      }
      case CartForm.ACTIONS.LinesUpdate:
        result = await withOfferCode(cart, () =>
          cart.updateLines(inputs.lines),
        );
        break;
      case CartForm.ACTIONS.LinesRemove:
        result = await withOfferCode(cart, () =>
          cart.removeLines(inputs.lineIds),
        );
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
