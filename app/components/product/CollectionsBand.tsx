import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {BandCollectionFragment} from 'storefrontapi.generated';
import {PRODUCT_PAGE} from '~/config/productPage';
import {useLocalized} from '~/lib/i18n/localized';

/**
 * Full-width band of collections closing the product page: one tall photo
 * per collection (its Shopify image), its name on a black label. Collections
 * come from app/config/productPage.ts, else the first ones with a photo.
 */
export function CollectionsBand({
  collections,
}: {
  collections: BandCollectionFragment[];
}) {
  const l = useLocalized();
  if (!collections.length) return null;

  return (
    <section className="collections-band" aria-labelledby="collections-band-title">
      <h2 className="collections-band__title" id="collections-band-title">
        {l(PRODUCT_PAGE.collectionsBand.title)}
      </h2>
      <div className="collections-band__grid">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="collections-band__tile"
          >
            {collection.image && (
              <Image
                data={collection.image}
                alt={collection.image.altText || collection.title}
                aspectRatio="3/5"
                sizes="(min-width: 48em) 25vw, 50vw"
                loading="lazy"
              />
            )}
            <span className="collections-band__label">{collection.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
