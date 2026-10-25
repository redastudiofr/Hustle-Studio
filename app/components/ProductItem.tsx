import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecoProductFragment,
  HomeProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useT} from '~/lib/i18n';
import {useModelView} from '~/lib/modelView';
import {Price} from '~/components/Price';

type GridProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecoProductFragment
  | HomeProductFragment;

/**
 * The product card of every grid: the photo on a light grey tile, an
 * "on sale" / "sold out" label only when Shopify says so, the title and the
 * price (compare-at price struck through before it).
 *
 * - `grid` (collection pages): label top left, title and price on one line.
 * - `rail` ("you may also like"): rounded label top right, title above the
 *   prices.
 *
 * With the collection page's "Model" switch on, the second Shopify image
 * (the piece worn) replaces the first.
 */
export function ProductItem({
  product,
  loading,
  variant = 'grid',
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
  variant?: 'grid' | 'rail';
}) {
  const t = useT();
  const {on: modelView} = useModelView();
  const variantUrl = useVariantUrl(product.handle);
  const soldOut = !product.availableForSale;

  const images = 'images' in product ? (product.images?.nodes ?? []) : [];
  const featured = product.featuredImage;
  const second = images.find((img) => img.id !== featured?.id);
  const image = modelView && second ? second : featured;

  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale =
    !soldOut && compareAt && Number(compareAt.amount) > Number(price.amount);

  const label = soldOut ? t('shop.soldOut') : onSale ? t('shop.onSale') : null;

  return (
    <Link
      className={`sx-card sx-card--${variant}${soldOut ? ' sx-card--sold-out' : ''}`}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="sx-card__media">
        {label && <span className="sx-card__label">{label}</span>}
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 25vw, 50vw"
          />
        ) : (
          <span className="sx-card__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="sx-card__info">
        <h3 className="sx-card__title">{product.title}</h3>
        <p className="sx-card__price">
          {onSale && compareAt && (
            <s>
              <Price data={compareAt} />
            </s>
          )}
          <Price data={price} />
        </p>
      </div>
    </Link>
  );
}
