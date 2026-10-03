import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';

type SliderCollection = {
  id: string;
  handle: string;
  title: string;
  image?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * Horizontal collections slider shown under the hero. Each tile links to its
 * collection page. Native scroll-snap for the swipe on touch; mouse drag and
 * on desktop (useHorizontalRail, the same engine as the product rails).
 */
export function CollectionsSlider({
  title,
  collections,
}: {
  title: string;
  collections: SliderCollection[];
}) {
  const t = useT();
  const {ref} = useHorizontalRail<HTMLDivElement>();
  if (!collections.length) return null;

  return (
    <Reveal
      as="section"
      className="collections-slider"
      aria-labelledby="collections-heading"
    >
      <div className="section-head">
        <h2 className="section-title" id="collections-heading">
          {title}
        </h2>
        <Link to="/collections" prefetch="intent" className="section-head__link">
          {t('home.viewAll')}
        </Link>
      </div>

      <div className="rail-wrap">
        <div className="collections-slider__track" ref={ref}>
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="collections-slider__tile"
              draggable={false}
            >
              <div className="collections-slider__media">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    alt={collection.image.altText || collection.title}
                    aspectRatio="3/4"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    sizes="(min-width: 64em) 28vw, (min-width: 48em) 40vw, 75vw"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="collections-slider__placeholder"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="collections-slider__label">
                {collection.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
