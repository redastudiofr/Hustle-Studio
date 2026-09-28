import {getReviewsForProduct} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

/** Real reviews for this product (app/data/reviews.ts); hidden when none. */
export function ProductReviews({
  productHandle,
  productTitle,
}: {
  productHandle: string;
  productTitle: string;
}) {
  const t = useT();
  const reviews = getReviewsForProduct(productHandle);

  if (!reviews.length) return null;
  return (
    <ReviewsSection
      heading={t('reviews.forProduct', {product: productTitle.toLowerCase()})}
      reviews={reviews}
      productTitle={productTitle}
    />
  );
}
