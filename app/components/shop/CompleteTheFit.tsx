import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Price} from '~/components/Price';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/i18n';

type Money = {amount: string; currencyCode: string};
type FitVariant = {
  id: string;
  availableForSale: boolean;
  price: Money;
  label: string;
};
export type FitProduct = {
  title: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variants: FitVariant[];
};

/**
 * "Complete the fit": this product and one piece Shopify recommends with
 * it, each with its own size, the total, and one button adding both. Real
 * products, real prices — no bundle discount is announced.
 */
export function CompleteTheFit({
  current,
  currentVariantId,
  partner,
}: {
  current: FitProduct;
  currentVariantId?: string;
  partner: FitProduct;
}) {
  const t = useT();
  const {open} = useAside();
  const firstAvailable = (product: FitProduct, preferred?: string) =>
    product.variants.find((v) => v.id === preferred && v.availableForSale)
      ?.id ??
    product.variants.find((v) => v.availableForSale)?.id ??
    '';
  const [ids, setIds] = useState(() => [
    firstAvailable(current, currentVariantId),
    firstAvailable(partner),
  ]);

  const items = [current, partner].map((product, index) => ({
    product,
    variant: product.variants.find((v) => v.id === ids[index]),
  }));
  const ready = items.every((item) => item.variant?.availableForSale);
  const total = items.reduce(
    (sum, item) => sum + Number(item.variant?.price.amount ?? 0),
    0,
  );
  const currency =
    items[0].variant?.price.currencyCode ??
    current.variants[0]?.price.currencyCode ??
    'EUR';

  return (
    <section className="sx-fit" aria-labelledby="sx-fit-title">
      <h2 className="sx-fit__eyebrow" id="sx-fit-title">
        {t('pdp.completeFit')}
      </h2>
      <div className="sx-fit__box">
        <span className="sx-fit__badge">{t('pdp.bundle')}</span>
        {items.map(({product, variant}, index) => (
          <div className="sx-fit__item" key={product.title}>
            <div className="sx-fit__thumb">
              {product.image && (
                <Image
                  data={product.image}
                  alt={product.image.altText || product.title}
                  aspectRatio="1/1"
                  width={72}
                  loading="lazy"
                />
              )}
            </div>
            <div className="sx-fit__info">
              <p className="sx-fit__name">
                {product.title}{' '}
                {index === 0 && (
                  <span className="sx-fit__this">{t('pdp.thisItem')}</span>
                )}
              </p>
              {variant && (
                <p className="sx-fit__price">
                  <Price data={variant.price} />
                </p>
              )}
              {product.variants.length > 1 && (
                <select
                  className="sx-fit__select"
                  aria-label={`${product.title} — ${t('pdp.size')}`}
                  value={ids[index]}
                  onChange={(event) =>
                    setIds((current) =>
                      current.map((id, i) =>
                        i === index ? event.target.value : id,
                      ),
                    )
                  }
                >
                  {product.variants.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                      disabled={!option.availableForSale}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
        <div className="sx-fit__total">
          <span>{t('pdp.total')}</span>
          <Price data={{amount: String(total), currencyCode: currency}} />
        </div>
        <AddToCartButton
          className="sx-btn sx-btn--dark sx-btn--small"
          disabled={!ready}
          onClick={() => open('cart')}
          lines={
            ready
              ? items.map((item) => ({
                  merchandiseId: item.variant!.id,
                  quantity: 1,
                }))
              : []
          }
        >
          {t('pdp.addBoth')}
        </AddToCartButton>
      </div>
    </section>
  );
}
