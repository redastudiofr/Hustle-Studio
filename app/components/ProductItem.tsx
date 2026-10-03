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
  const swatches = colorSwatches(product);

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
        {swatches.length > 1 && (
          <ul className="product-card__swatches" aria-label={t('product.colours')}>
            {swatches.slice(0, 5).map((swatch) => (
              <li
                key={swatch.name}
                className="product-card__swatch"
                style={{background: swatch.color}}
                title={swatch.name}
              />
            ))}
            {swatches.length > 5 && (
              <li className="product-card__swatch-more">
                +{swatches.length - 5}
              </li>
            )}
          </ul>
        )}
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

/** Common colour names → CSS, for colour options without a Shopify swatch. */
const COLOUR_NAMES: Record<string, string> = {
  black: '#111111',
  noir: '#111111',
  white: '#ffffff',
  blanc: '#ffffff',
  grey: '#9a9a96',
  gray: '#9a9a96',
  gris: '#9a9a96',
  navy: '#1f2a44',
  blue: '#2f4f8f',
  bleu: '#2f4f8f',
  red: '#8e1f24',
  rouge: '#8e1f24',
  burgundy: '#6b1f2a',
  bordeaux: '#6b1f2a',
  green: '#3d5a3a',
  vert: '#3d5a3a',
  beige: '#d8c8ad',
  cream: '#efe7d6',
  brown: '#5a3e2b',
  marron: '#5a3e2b',
  pink: '#e8b4c0',
  rose: '#e8b4c0',
};

/**
 * The product's colours, when Shopify gives it a colour option with more than
 * one value: the swatch colour set in Shopify, or a known colour name.
 * Products sold one colour per product show nothing.
 */
function colorSwatches(product: GridProduct): {name: string; color: string}[] {
  if (!('options' in product) || !product.options) return [];
  const option = product.options.find((o) =>
    /^(colou?r|couleur)$/i.test(o.name.trim()),
  );
  if (!option) return [];
  return option.optionValues.flatMap((value) => {
    const swatch =
      'swatch' in value
        ? (value.swatch as {color?: string | null} | null)?.color
        : undefined;
    const color = swatch ?? COLOUR_NAMES[value.name.trim().toLowerCase()];
    return color ? [{name: value.name, color}] : [];
  });
}
