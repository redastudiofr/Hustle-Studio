import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {SectionHeading, Stars} from '~/components/pdp/shared';
import type {Review} from '~/data/reviews';
import type {ProductRating} from '~/lib/rating';

/** Cards in the row before "See all reviews" (mock-up 02: four). */
const FIRST = 4;

/**
 * Mock-up 02 — real reviews only (app/lib/reviews.ts): photo when the
 * customer gave one, stars, topic, text, name and city. No review: the
 * section is not shown at all.
 */
export function PdpReviews({
  reviews,
  rating,
}: {
  reviews: Review[];
  rating: ProductRating | null;
}) {
  const l = useLocalized();
  const [all, setAll] = useState(false);
  if (!reviews.length) return null;

  const average =
    rating?.value ??
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const count = rating?.count ?? reviews.length;
  const shown = all ? reviews : reviews.slice(0, FIRST);

  return (
    <section
      className="pdpx-section pdpx-reviews"
      aria-labelledby="pdpx-reviews"
    >
      <SectionHeading
        id="pdpx-reviews"
        black={PDP.reviews.title.black}
        blue={PDP.reviews.title.blue}
      />
      <p className="pdpx-reviews__summary">
        <Stars value={average} />
        <strong>
          {average.toFixed(1).replace('.', l({en: '.', fr: ','}))}{' '}
          {l(PDP.reviews.outOf)}
        </strong>
        <span>
          · {count} {l(PDP.ratingShort)}
        </span>
      </p>

      <ul className="pdpx-reviews__list" data-all={all || undefined}>
        {shown.map((review) => (
          <li key={review.id} className="pdpx-review">
            {review.photo && (
              <div className="pdpx-review__photo">
                <Image
                  data={review.photo}
                  alt={review.photo.altText || review.name || ''}
                  aspectRatio="4/3"
                  sizes="(min-width: 64em) 25vw, 70vw"
                  loading="lazy"
                />
              </div>
            )}
            <div className="pdpx-review__body">
              <Stars value={review.rating} />
              {review.topic && (
                <p className="pdpx-review__topic">{review.topic}</p>
              )}
              <p className="pdpx-review__text">{review.text}</p>
              {(review.name || review.location) && (
                <p className="pdpx-review__who">
                  {[review.name, review.location?.split(',')[0]]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  · {l(PDP.reviews.verified)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!all && reviews.length > FIRST && (
        <div className="pdpx-center">
          <button
            type="button"
            className="pdpx-button"
            onClick={() => setAll(true)}
          >
            {l(PDP.reviews.seeAll)}
          </button>
        </div>
      )}
    </section>
  );
}
