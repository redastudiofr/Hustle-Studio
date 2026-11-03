import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

const LABELS: Record<string, string> = {
  VISA: 'VISA',
  MASTERCARD: 'Mastercard',
  AMERICAN_EXPRESS: 'Amex',
  DISCOVER: 'Discover',
  DINERS_CLUB: 'Diners',
  JCB: 'JCB',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  SHOPIFY_PAY: 'Shop Pay',
  ANDROID_PAY: 'Android Pay',
};

/**
 * The payment methods the Shopify checkout accepts, as small badges — read
 * from the store (shop.paymentSettings), so it only shows what is really
 * switched on in Shopify → Settings → Payments.
 */
export function PaymentIcons({
  className,
  label,
}: {
  className?: string;
  /** Shown above the badges, only when there are some. */
  label?: string;
}) {
  const root = useRouteLoaderData<RootLoader>('root');
  const settings = root?.header?.shop.paymentSettings;
  const methods = [
    ...(settings?.supportedDigitalWallets ?? []),
    ...(settings?.acceptedCardBrands ?? []),
  ].filter((method) => LABELS[method]);
  if (!methods.length) return null;

  const list = (
    <ul className={['st-pay', className].filter(Boolean).join(' ')}>
      {methods.map((method) => (
        <li
          key={method}
          className={`st-pay__item st-pay__item--${method.toLowerCase()}`}
        >
          {LABELS[method]}
        </li>
      ))}
    </ul>
  );
  return label ? (
    <div className="st-pay-block">
      <p>{label}</p>
      {list}
    </div>
  ) : (
    list
  );
}
