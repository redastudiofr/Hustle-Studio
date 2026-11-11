import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';
import type {SetData} from '~/lib/sets';

/**
 * "The sets": one tile per colour — the photo of the set worn, its name and
 * its price (hoodie + trousers, at their Shopify prices).
 *
 * `rail`: a horizontal slider (homepage, under every product), its tiles a
 * little larger than the product cards above it. Otherwise a grid (/sets).
 */
export function SetsGrid({
  sets,
  heading,
  viewAll = false,
  rail = false,
}: {
  sets: SetData[];
  heading?: string;
  viewAll?: boolean;
  rail?: boolean;
}) {
  const t = useT();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>();
  if (!sets.length) return null;

  return (
    <section
      className={`hs-sets${rail ? ' hs-sets--rail' : ''}${sets.length <= 3 ? ' hs-sets--few' : ''}`}
    >
      <div className="hs-sets__head">
        <h2 className="hs-sets__title">{heading ?? t('sets.title')}</h2>
        <div className="hs-sets__actions">
          {rail && sets.length > 1 && (
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
        style={{'--sets-cols': Math.min(sets.length, 4)} as React.CSSProperties}
      >
        {sets.map((set, index) => (
          <Link
            key={set.slug}
            to={`/sets/${set.slug}`}
            prefetch="intent"
            className="hs-sets__tile"
            draggable={false}
          >
            <div className="hs-sets__media">
              {set.image && (
                <Image
                  data={{...set.image, altText: set.image.altText ?? set.title}}
                  aspectRatio="2/3"
                  sizes={
                    rail
                      ? '(min-width: 64em) 30vw, (min-width: 48em) 40vw, 58vw'
                      : '(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw'
                  }
                  loading={index < 2 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              )}
              {!set.available && (
                <span className="hs-sets__badge">{t('product.soldOut')}</span>
              )}
            </div>
            <p className="hs-sets__name">{set.title}</p>
            <p className="hs-sets__price">
              <Money
                as="span"
                data={{
                  amount: set.price.amount,
                  currencyCode: set.price.currencyCode as CurrencyCode,
                }}
              />
            </p>
          </Link>
        ))}
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
