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
 * The product card of every grid: the photo, a red "-X%" label when Shopify
 * has a compare-at price above the price (a black "sold out" one when
 * nothing is left), the title, the prices — the old one struck through, the
 * new one in red — and how many colours exist. Everything comes from Shopify.
 *
 * Hovering a card shows the product's second Shopify image. With the
 * collection page's "Model" switch on, the two swap places.
 */
export function ProductItem({
  product,
  loading,
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
  /** Kept for older callers; every card now looks the same. */
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
  const hoverImage = image === featured ? second : featured;

  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale =
    !soldOut && compareAt && Number(compareAt.amount) > Number(price.amount);
  const percent = onSale
    ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100)
    : 0;

  const colorOption =
    'options' in product
      ? product.options?.find((option) =>
          /^(colou?r|couleur)$/i.test(option.name.trim()),
        )
      : undefined;
  const colors = colorOption?.optionValues.length ?? 0;

  return (
    <Link
      className={`st-card${soldOut ? ' st-card--sold-out' : ''}`}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="st-card__media">
        {soldOut ? (
          <span className="st-card__badge st-card__badge--dark">
            {t('shop.soldOut')}
          </span>
        ) : (
          percent > 0 && (
            <span className="st-card__badge st-card__badge--sale">
              {t('store.percentOff', {percent})}
            </span>
          )
        )}
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 25vw, 50vw"
            className="st-card__img"
          />
        ) : (
          <span className="st-card__placeholder" aria-hidden="true" />
        )}
        {/* The other photo, shown when the pointer is over the card. */}
        {hoverImage && (
          <Image
            alt=""
            aspectRatio="1/1"
            data={hoverImage}
            loading="lazy"
            sizes="(min-width: 64em) 25vw, 50vw"
            className="st-card__img st-card__img--hover"
          />
        )}
      </div>
      <h3 className="st-card__title">{product.title}</h3>
      <p className="st-card__price">
        {onSale && (
          <s>
            <Price data={compareAt} />
          </s>
        )}
        <Price
          data={price}
          className={onSale ? 'st-card__price--sale' : undefined}
        />
      </p>
      {colors > 1 && (
        <p className="st-card__colors">{t('store.colors', {count: colors})}</p>
      )}
    </Link>
  );
}
