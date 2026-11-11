import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';
import type {SetProduct} from '~/lib/sets';

/**
 * "The sets": the Shopify set products ("set 07 black"…), each with the
 * first photo set on it in Shopify, its title and its Shopify price.
 *
 * `rail`: a horizontal slider (homepage, under every product). Otherwise a
 * grid (/sets).
 */
export function SetsGrid({
  products,
  heading,
  viewAll = false,
  rail = false,
}: {
  products: SetProduct[];
  heading?: string;
  viewAll?: boolean;
  rail?: boolean;
}) {
  const t = useT();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>();
  if (!products.length) return null;

  return (
    <section className={`hs-sets${rail ? ' hs-sets--rail' : ''}`}>
      <div className="hs-sets__head">
        <h2 className="hs-sets__title">{heading ?? t('sets.title')}</h2>
        <div className="hs-sets__actions">
          {rail && products.length > 1 && (
            <>
              <button
                type="button"
                className="hs-sets__arrow"
                onClick={() => scrollByCard(-1)}
                aria-label={t('rail.prevProduct')}
              >
                <Arrow flip />
              </button>
              <button
                type="button"
                className="hs-sets__arrow"
                onClick={() => scrollByCard(1)}
                aria-label={t('rail.nextProduct')}
              >
                <Arrow />
              </button>
            </>
          )}
          {viewAll && (
            <Link to="/sets" prefetch="intent" className="hs-sets__all">
              {t('sets.viewAll')}
            </Link>
          )}
        </div>
      </div>
      <div
        className="hs-sets__grid"
        ref={rail ? ref : undefined}
        style={
          {'--sets-cols': Math.min(products.length, 4)} as React.CSSProperties
        }
      >
        {products.map((product, index) => {
          const ranged =
            Number(product.maxPrice.amount) > Number(product.minPrice.amount);
          return (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="hs-sets__tile"
              draggable={false}
            >
              <div className="hs-sets__media">
                {product.image && (
                  <Image
                    data={{
                      ...product.image,
                      altText: product.image.altText ?? product.title,
                    }}
                    aspectRatio="3/4"
                    sizes={
                      rail
                        ? '(min-width: 64em) 24vw, (min-width: 48em) 34vw, 52vw'
                        : '(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw'
                    }
                    loading={index < 2 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                )}
                {!product.availableForSale && (
                  <span className="hs-sets__badge">{t('product.soldOut')}</span>
                )}
              </div>
              <p className="hs-sets__name">{product.title}</p>
              <p className="hs-sets__price">
                {ranged && `${t('sets.from')} `}
                <Money
                  as="span"
                  data={{
                    amount: product.minPrice.amount,
                    currencyCode: product.minPrice.currencyCode as CurrencyCode,
                  }}
                />
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Arrow({flip = false}: {flip?: boolean}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={flip ? {transform: 'scaleX(-1)'} : undefined}
    >
      <path d="M2 9h13M10 4l5 5-5 5" />
    </svg>
  );
}
