import {useI18n} from '~/lib/i18n';
import {BRAND} from '~/config/brand';

type MoneyData = {amount?: string | null; currencyCode?: string | null};

/**
 * A Shopify price, formatted for the visitor's language: "35,00 €" in
 * French, "€35.00" in English. The amount and currency are Shopify's.
 */
export function Price({
  data,
  className,
}: {
  data: MoneyData;
  className?: string;
}) {
  const {locale} = useI18n();
  return <span className={className}>{formatPrice(data, locale)}</span>;
}

export function formatPrice(data: MoneyData, locale: string): string {
  const amount = Number(data.amount);
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-IE', {
      style: 'currency',
      currency: data.currencyCode || BRAND.currency.code,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${data.currencyCode ?? ''}`.trim();
  }
}
