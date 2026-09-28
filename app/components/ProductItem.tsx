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
import {Price} from '~/components/Price';
import {StarRating} from '~/components/StarRating';
import {parseRating} from '~/lib/rating';

type GridProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecoProductFragment
  | HomeProductFragment;

/**
 * The product card used on every grid and rail: Shopify's featured image,
 * the second image on hover (desktop), the title, the price and — only when
 * Shopify says so — the compare-at price and the sold-out state.
 */
export function ProductItem({
  product,
  loading,
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
}) {
  const t = useT();
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const soldOut = !product.availableForSale;

  const images = 'images' in product ? (product.images?.nodes ?? []) : [];
  const altImage = images.find((img) => img.id !== image?.id);
  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale =
    !soldOut && compareAt && Number(compareAt.amount) > Number(price.amount);

  // Only when a review app publishes real ratings in Shopify.
  const rating =
    'rating' in product
      ? parseRating(
          product.rating,
          'ratingCount' in product ? product.ratingCount : null,
        )
      : null;

  return (
    <Link
      className={`product-card ${soldOut ? 'product-card--sold-out' : ''}`}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="product-card__media">
        {soldOut ? (
          <span className="badge-sold-out">{t('product.soldOut')}</span>
        ) : (
          onSale && <span className="badge-sale">{t('product.saleBadge')}</span>
        )}
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
            className="product-card__img product-card__img--main"
          />
        ) : (
          <span className="product-card__placeholder" aria-hidden="true" />
        )}
        {altImage && (
          <Image
            alt={altImage.altText || product.title}
            aspectRatio="4/5"
            data={altImage}
            loading="lazy"
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
            className="product-card__img product-card__img--alt"
          />
        )}
      </div>
      <div className="product-card__info">
        <h3 className="product-card__title">{product.title}</h3>
        <div className="product-card__price">
          <Price data={price} />
          {onSale && compareAt && (
            <s>
              <Price data={compareAt} />
            </s>
          )}
        </div>
        {rating && (
          <StarRating
            rating={rating.value}
            count={rating.count}
            className="product-card__rating"
          />
        )}
      </div>
    </Link>
  );
}
