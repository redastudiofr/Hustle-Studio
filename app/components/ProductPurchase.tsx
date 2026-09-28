import {useEffect, useState} from 'react';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {BuyNowButton} from '~/components/BuyNowButton';
import {QuantitySelector} from '~/components/QuantitySelector';
import {ProductSizeGuide, type SizeEntry} from '~/components/ProductSizeGuide';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/i18n';
import {StarRating} from '~/components/StarRating';
import {TierNote} from '~/components/TierNote';
import type {ProductRating} from '~/lib/rating';

/** Shopify's own count is called out as "low" at or under this many units. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * The buy box: title, price, variants, size guide, quantity, add to cart and
 * buy now. Everything it states comes from the selected Shopify variant —
 * price, compare-at price, availability and, when the store publishes it,
 * the real remaining quantity.
 */
export function ProductPurchase({
  title,
  price,
  compareAtPrice,
  productOptions,
  sizes,
  available,
  quantityAvailable,
  shortDescription,
  variantId,
  selectedVariant,
  rating,
}: {
  title: string;
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  productOptions: MappedProductOptions[];
  sizes: SizeEntry[];
  available: boolean;
  /** Shopify's figure, or null when the store does not publish inventory. */
  quantityAvailable: number | null;
  shortDescription: string;
  variantId?: string;
  /** Lets the cart drawer show the line instantly, before Shopify answers. */
  selectedVariant?: ProductVariantFragment | null;
  /** From a review app's Shopify metafields only; null shows no stars. */
  rating?: ProductRating | null;
}) {
  const {open: openAside} = useAside();
  const [quantity, setQuantity] = useState(1);
  const t = useT();

  // A new variant has its own stock: start again from one.
  useEffect(() => setQuantity(1), [variantId]);

  const priceAmount = Number(price?.amount ?? 0);
  const compareAmount = Number(compareAtPrice?.amount ?? 0);
  const discountPct =
    compareAmount > priceAmount && compareAmount > 0
      ? Math.round((1 - priceAmount / compareAmount) * 100)
      : 0;

  const lowStock =
    available &&
    quantityAvailable !== null &&
    quantityAvailable > 0 &&
    quantityAvailable <= LOW_STOCK_THRESHOLD;

  const stock = !available
    ? {className: 'buybox__stock--out', label: t('product.soldOut')}
    : lowStock
      ? {
          className: 'buybox__stock--low',
          label: t('product.lowStock', {count: quantityAvailable}),
        }
      : {className: 'buybox__stock--in', label: t('product.inStock')};

  const lines = variantId ? [{merchandiseId: variantId, quantity}] : [];
  const optimisticLines = variantId
    ? [{merchandiseId: variantId, quantity, selectedVariant}]
    : [];

  return (
    <div className="buybox">
      {rating && (
        <div className="rating-summary">
          <StarRating rating={rating.value} size={18} />
          <span className="rating-summary__text">
            {t('product.ratedOutOf', {value: rating.value.toString()})}
            {typeof rating.count === 'number' && (
              <> {t('product.fromReviews', {count: rating.count})}</>
            )}
          </span>
        </div>
      )}

      <h1 className="buybox__title">{title}</h1>

      <div className="buybox__price">
        <ProductPrice price={price} compareAtPrice={compareAtPrice} />
        {discountPct > 0 && (
          <span className="buybox__discount">−{discountPct}%</span>
        )}
      </div>

      <TierNote />

      <p className="buybox__tax">
        {t('product.taxIncluded')}{' '}
        <a href="/policies/shipping-policy">{t('product.shipping')}</a>{' '}
        {t('product.calculatedAtCheckout')}
      </p>

      {shortDescription && <p className="buybox__blurb">{shortDescription}</p>}

      <div className={`buybox__stock ${stock.className}`}>
        <span className="buybox__stock-dot" />
        {stock.label}
      </div>

      <ProductForm productOptions={productOptions} />

      <ProductSizeGuide sizes={sizes} />

      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        max={quantityAvailable}
        disabled={!available}
      />

      <div className="buybox__actions">
        <AddToCartButton
          className="btn btn--full btn--outline"
          disabled={!available || !variantId}
          onClick={() => openAside('cart')}
          lines={optimisticLines}
        >
          {available ? t('product.addToCart') : t('product.soldOut')}
        </AddToCartButton>
        <BuyNowButton disabled={!available || !variantId} lines={lines}>
          {t('product.buyNow')}
        </BuyNowButton>
      </div>

      <ul className="buybox__perks">
        <li>{t('product.perk.delivery')}</li>
        <li>{t('product.perk.returns')}</li>
        <li>{t('product.perk.payment')}</li>
      </ul>
    </div>
  );
}
