import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useT} from '~/lib/i18n';
import type {SetData} from '~/lib/sets';

/**
 * "The sets": one tile per colour — the photo of the set worn, its name and
 * its price (hoodie + trousers, at their Shopify prices). Used under "our
 * collections" on the homepage and on /sets.
 */
export function SetsGrid({
  sets,
  heading,
  viewAll = false,
}: {
  sets: SetData[];
  heading?: string;
  viewAll?: boolean;
}) {
  const t = useT();
  if (!sets.length) return null;
  return (
    <section className="hs-sets">
      <div className="hs-sets__head">
        <h2 className="hs-sets__title">{heading ?? t('sets.title')}</h2>
        {viewAll && (
          <Link to="/sets" prefetch="intent" className="hs-sets__all">
            {t('sets.viewAll')}
          </Link>
        )}
      </div>
      <div
        className="hs-sets__grid"
        style={{'--sets-cols': Math.min(sets.length, 4)} as React.CSSProperties}
      >
        {sets.map((set, index) => (
          <Link
            key={set.slug}
            to={`/sets/${set.slug}`}
            prefetch="intent"
            className="hs-sets__tile"
          >
            <div className="hs-sets__media">
              {set.image && (
                <Image
                  data={{...set.image, altText: set.image.altText ?? set.title}}
                  aspectRatio="2/3"
                  sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
                  loading={index < 2 ? 'eager' : 'lazy'}
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
