import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME} from '~/config/homeTemplate';
import {DUO} from '~/lib/homeDuo';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useMoney} from '~/components/pdp/shared';
import type {LandingProduct} from '~/components/landing/products';

/** First available size, M when there is one (as on the product page). */
function startSize(product: LandingProduct): string | null {
  const sizes = product.variants.filter((v) => v.availableForSale && v.size);
  return sizes.find((v) => v.size === 'M')?.size ?? sizes[0]?.size ?? null;
}

/**
 * Homepage mock-up 03 — the duo offer: light grey card, a giant "-50%"
 * watermark, two photos joined by a "+", the second price struck through
 * and halved, the total, and one button that adds both pieces with the
 * duo's code (the reduction is applied by Shopify in the cart). A size per
 * piece: a t-shirt cannot be added without one.
 */
export function DuoOffer({products}: {products: [LandingProduct, LandingProduct]}) {
  const l = useLocalized();
  const money = useMoney();
  const {open} = useAside();
  const [sizes, setSizes] = useState(() => products.map(startSize));

  const variants = products.map(
    (product, index) =>
      product.variants.find(
        (variant) => variant.size === sizes[index] || !variant.size,
      ) ?? null,
  );
  const ready = variants.every((variant) => variant?.availableForSale);
  const first = variants[0]?.price ?? products[0].price;
  const second = variants[1]?.price ?? products[1].price;
  const reduced = second * (1 - DUO.percent / 100);

  return (
    <section className="hx-section hx-duo-wrap" aria-labelledby="hx-duo">
      <div className="hx-duo">
        <span className="hx-duo__watermark" aria-hidden="true">
          {HOME.duo.watermark}
        </span>
        <p className="hx-pill">{l(HOME.duo.badge)}</p>
        <h2 className="hx-duo__title" id="hx-duo">
          {l(HOME.duo.title.black)}
          <span className="pdpx-title__blue">{l(HOME.duo.title.blue)}</span>
        </h2>
        <p className="hx-duo__text">{l(HOME.duo.text)}</p>

        <div className="hx-duo__pair">
          {products.map((product, index) => (
            <div key={product.id} className="hx-duo__item">
              <div className="hx-duo__photo">
                {product.image && (
                  <Image
                    data={product.image}
                    alt={product.image.altText || product.title}
                    aspectRatio="45/31"
                    sizes="(min-width: 64em) 34vw, 45vw"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="hx-duo__line">
                <span className="hx-duo__name">{product.title}</span>
                {index === 0 ? (
                  <span>{money(first)}</span>
                ) : (
                  <span>
                    <s>{money(second)}</s>{' '}
                    <strong className="hx-duo__half">{money(reduced)}</strong>
                  </span>
                )}
              </div>
              <label className="hx-duo__size">
                <span>{l(HOME.duo.size)}</span>
                <select
                  className="pdpx-select"
                  value={sizes[index] ?? ''}
                  onChange={(event) =>
                    setSizes((current) =>
                      current.map((size, i) =>
                        i === index ? event.target.value : size,
                      ),
                    )
                  }
                >
                  {product.variants
                    .filter((variant) => variant.size)
                    .map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.size ?? ''}
                        disabled={!variant.availableForSale}
                      >
                        {variant.size}
                      </option>
                    ))}
                </select>
              </label>
              {index === 0 && (
                <span className="hx-duo__plus" aria-hidden="true">
                  +
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="hx-duo__total">
          <span className="hx-duo__total-label">
            {l(HOME.duo.total)} <s>{money(first + second)}</s>
          </span>
          <strong className="hx-duo__total-value">
            {money(first + reduced)}
          </strong>
          <AddToCartButton
            duo
            lines={
              ready
                ? variants.map((variant) => ({
                    merchandiseId: variant!.id,
                    quantity: 1,
                  }))
                : []
            }
            disabled={!ready}
            className="hx-button"
            onClick={() => open('cart')}
          >
            {l(HOME.duo.cta)}
          </AddToCartButton>
        </div>
      </div>
    </section>
  );
}
