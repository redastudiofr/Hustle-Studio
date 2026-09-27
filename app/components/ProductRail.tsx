import {Link} from 'react-router';
import type {ComponentProps} from 'react';
import {ProductItem} from '~/components/ProductItem';
import {RailArrows} from '~/components/RailArrows';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';

type RailProduct = ComponentProps<typeof ProductItem>['product'];

/**
 * A titled, horizontally scrolling row of product cards: swipe on touch,
 * drag or arrows on desktop (see useHorizontalRail). Used for the homepage
 * product sections and "you may also like" on product pages.
 */
export function ProductRail({
  id,
  title,
  products,
  link,
}: {
  id: string;
  title: string;
  products: RailProduct[];
  link?: {label: string; to: string};
}) {
  const t = useT();
  const {ref, scrollByCard, atStart, atEnd} =
    useHorizontalRail<HTMLDivElement>();
  if (!products.length) return null;
  const headingId = `${id}-heading`;

  return (
    <section className="product-rail" aria-labelledby={headingId}>
      <div className="section-head">
        <h2 className="section-title" id={headingId}>
          {title}
        </h2>
        {link && (
          <Link to={link.to} prefetch="intent" className="section-head__link">
            {link.label}
          </Link>
        )}
      </div>
      <div className="rail-wrap">
        <div className="related-rail" ref={ref}>
          {products.map((product, index) => (
            <div className="related-rail__item" key={product.id}>
              <ProductItem
                product={product}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          disablePrev={atStart}
          disableNext={atEnd}
          prevLabel={t('rail.prevProduct')}
          nextLabel={t('rail.nextProduct')}
        />
      </div>
    </section>
  );
}
