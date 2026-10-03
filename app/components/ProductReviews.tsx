import type {Review} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

/**
 * Real reviews on a product page: this product's first, then those about
 * the shop (see app/lib/reviews.ts). No review yet: the invitation to leave
 * the first one, with the product filled in on the form.
 */
export function ProductReviews({
  reviews,
  productTitle,
}: {
  reviews: Review[];
  productTitle: string;
}) {
  const t = useT();
  return (
    <ReviewsSection
      heading={t('reviews.title')}
      subheading={t('reviews.subtitle')}
      reviews={reviews}
      productTitle={productTitle}
    />
  );
}
