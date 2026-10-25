import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useT} from '~/lib/i18n';
import {Price} from '~/components/Price';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  const t = useT();
  // Shopify lets a compare-at price be set equal to or below the price; only
  // a real reduction is shown struck through.
  const onSale =
    price &&
    compareAtPrice &&
    Number(compareAtPrice.amount) > Number(price.amount);
  return (
    <div aria-label={t('product.price')} className="product-price" role="group">
      {onSale ? (
        <div className="product-price-on-sale">
          {price ? <Price data={price} /> : null}
          <s>
            <Price data={compareAtPrice!} />
          </s>
        </div>
      ) : price ? (
        <Price data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
