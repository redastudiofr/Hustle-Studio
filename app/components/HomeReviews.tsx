import {getAllReviews} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

export function HomeReviews() {
  const t = useT();
  // Every real review (app/data/reviews.ts), dealt across the rows by
  // ReviewsSection. Nothing is shown while there are none.
  const reviews = getAllReviews();
  if (!reviews.length) return null;
  return (
    <ReviewsSection
      heading={t('reviews.title')}
      subheading={t('reviews.subtitle')}
      reviews={reviews}
    />
  );
}
