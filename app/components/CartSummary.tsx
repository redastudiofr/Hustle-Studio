import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';
import {useI18n, useT} from '~/lib/i18n';
import {BRAND} from '~/config/brand';
import {
  nextTier,
  THIRD_ITEM_PERCENT,
  TIER_ENABLED,
  TIER_PERCENTS,
} from '~/lib/tierDiscount';
import {Price} from '~/components/Price';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart}: CartSummaryProps) {
  const t = useT();

  return (
    <div className="cart-summary">
      <FreeShippingProgress cart={cart} />

      <OfferNote
        lines={cart?.lines?.nodes}
        currency={
          cart?.cost?.subtotalAmount?.currencyCode ?? BRAND.currency.code
        }
      />

      <CartDiscounts discountCodes={cart?.discountCodes} />

      <div className="cart-summary__row cart-summary__row--total">
        <span>{t('cart.subtotal')}</span>
        <span>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Price data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>
      <p className="cart-summary__note">{t('cart.taxNote')}</p>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

/**
 * "X € away from free shipping". Only shown when a threshold is set in
 * app/config/brand.ts — it must match the free-shipping rate configured in
 * Shopify Admin → Settings → Shipping, which is what the checkout applies.
 */
function FreeShippingProgress({cart}: Pick<CartSummaryProps, 'cart'>) {
  const {t, locale} = useI18n();
  const threshold = BRAND.freeShippingThreshold;
  if (!threshold) return null;

  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const currency =
    cart?.cost?.subtotalAmount?.currencyCode ?? BRAND.currency.code;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className="shipping-progress">
      <div className="shipping-progress__bar">
        <div
          className="shipping-progress__fill"
          style={{width: `${progress}%`}}
        />
      </div>
      <span className="shipping-progress__label">
        {remaining > 0
          ? t('cart.freeShippingAway', {
              amount: formatMoney(remaining, currency, locale),
            })
          : t('cart.freeShippingUnlocked')}
      </span>
    </div>
  );
}

/**
 * States the volume offer in the cart: what it has already taken off, and
 * what one more piece would add.
 *
 * There is no code to look for: Shopify reports what it actually took off as a
 * discount allocation on the line it applies to. Summing those allocations is
 * therefore a statement about the real total rather than an estimate — which
 * is why this is allowed to say "saved" at all. With nothing allocated it
 * stays an invitation, and never claims a reduction the customer has not got.
 */
function OfferNote({
  lines,
  currency,
}: {
  lines?: CartApiQueryFragment['lines']['nodes'];
  currency: string;
}) {
  const {t, locale} = useI18n();
  if (!TIER_ENABLED) return null;

  const discounted = (lines ?? []).reduce(
    (total, line) =>
      total +
      (line.discountAllocations ?? []).reduce(
        (sum, allocation) => sum + Number(allocation.discountedAmount.amount),
        0,
      ),
    0,
  );

  const items = (lines ?? []).reduce(
    (total, line) => total + (line.quantity ?? 0),
    0,
  );
  const next = nextTier(items);

  return (
    <>
      {discounted > 0 && (
        <p className="cap-offer cap-offer--active">
          {t('cart.tierSaved', {
            amount: formatMoney(discounted, currency, locale),
          })}
        </p>
      )}

      {next ? (
        <p className="cap-offer">
          {t('cart.tierNext', {percent: next.percent})}
        </p>
      ) : items >= TIER_PERCENTS.length && discounted === 0 ? (
        <p className="cap-offer">
          {t('cart.tierMax', {percent: THIRD_ITEM_PERCENT})}
        </p>
      ) : null}
    </>
  );
}

/**
 * Amounts follow the language, not just the currency: "€10.50" in English,
 * "10,50 €" in French. Same number, and the one a French customer expects to
 * read.
 */
function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-IE', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Checkout is Shopify's: this is a plain link to the cart's own `checkoutUrl`,
 * which Shopify generates for this exact cart (lines, variants, quantities,
 * discount codes). Payment never touches this site.
 */
function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const t = useT();
  if (!checkoutUrl) return null;
  return (
    <a
      href={checkoutUrl}
      target="_self"
      className="btn btn--full cart-summary__checkout"
    >
      {t('cart.checkout')}
    </a>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div className="cart-summary__row">
            <code>{codes.join(', ')}</code>
            <button type="submit" className="link">
              {t('cart.remove')}
            </button>
          </div>
        </UpdateDiscountForm>
      )}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="cart-discount-form">
          <input
            ref={inputRef}
            type="text"
            name="discountCode"
            placeholder={t('cart.promoCode')}
            aria-label={t('cart.promoCode')}
          />
          <button type="submit">{t('cart.apply')}</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}
