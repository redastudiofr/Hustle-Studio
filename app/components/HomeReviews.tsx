import type {Review} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

/** Every real review on the homepage (app/lib/reviews.ts). */
export function HomeReviews({reviews}: {reviews: Review[]}) {
  const t = useT();
  return (
    <ReviewsSection
      heading={t('reviews.title')}
      subheading={t('reviews.subtitle')}
      reviews={reviews}
    />
  );
}
