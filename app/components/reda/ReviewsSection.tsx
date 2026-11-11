import {Link} from 'react-router';
import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/reda/useHorizontalRail';
import {useAutoScroll} from '~/lib/reda/useAutoScroll';
import {useCenterFocus} from '~/lib/useCenterFocus';
import {useI18n, useT} from '~/lib/i18n';

/**
 * One review, laid out like a review-platform card: the stars, the customer's
 * headline if they wrote one, the review in their own words, then who left
 * it — their initial in a circle, their name, "verified purchase" only when
 * the review is tied to a real order, the date — and, when the review is
 * about a product, that product as bought (its Shopify photo, title, price).
 * Nothing on it is invented: a field the review does not have is left out.
 */
function ReviewCard({review}: {review: Review}) {
  const {locale} = useI18n();
  const t = useT();
  const [open, close] = locale === 'fr' ? ['« ', ' »'] : ['“', '”'];
  const name = review.name ?? t('reviews.anonymous');
  const initial = name.trim().charAt(0).toUpperCase();
  const when = [review.date, review.location].filter(Boolean).join(' · ');

  return (
    <article className="review-card review-card--rich">
      {typeof review.rating === 'number' && (
        <StarRating rating={review.rating} className="review-card__stars" />
      )}
      {review.title && <h3 className="review-card__title">{review.title}</h3>}
      <p className="review-card__text">
        {open}
        {review.text}
        {close}
      </p>

      <footer className="review-card__footer">
        <div className="review-card__author">
          <span className="review-card__avatar" aria-hidden="true">
            {initial}
          </span>
          <div>
            <p className="review-card__name">
              {name}
              {review.verified && (
                <span className="review-card__verified">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="8" fill="currentColor" />
                    <path
                      d="M4.6 8.2l2.2 2.2 4.6-4.8"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t('reviews.verified')}
                </span>
              )}
            </p>
            {when && <p className="review-card__meta">{when}</p>}
          </div>
        </div>

        {review.product && (
          <div className="review-card__product">
            {review.product.image && (
              <img
                src={`${review.product.image.url}${review.product.image.url.includes('?') ? '&' : '?'}width=96`}
                alt=""
                width={40}
                height={40}
                loading="lazy"
              />
            )}
            <div>
              <p className="review-card__product-label">
                {t('reviews.purchased')}
              </p>
              <p className="review-card__product-title">
                {review.product.title}
                {review.product.price && (
                  <>
                    {' · '}
                    <strong>{formatPrice(review.product.price, locale)}</strong>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}

function formatPrice(
  price: {amount: string; currencyCode: string},
  locale: string,
) {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: price.currencyCode,
      maximumFractionDigits: 2,
    }).format(Number(price.amount));
  } catch {
    return `${price.amount} ${price.currencyCode}`;
  }
}

/**
 * One row of reviews: drifting on its own, and scrollable by hand at the same
 * time.
 *
 * Both are the same mechanism — the row is a plain scroll container, and the
 * drift only nudges its scroll position (see useAutoScroll). So a finger, a
 * trackpad or the arrows take over instantly, the drift pauses while they do,
 * and it resumes from wherever the visitor stopped. `loop` renders the row
 * three times over so the travel never reaches an end; the two extra copies
 * are hidden from screen readers, which would otherwise read every review
 * three times.
 *
 * Two things blur the cards, and they are not the same thing. Reveal blurs
 * the row on arrival and clears it — and can never leave it blurred, since it
 * shows its content with no transition at all when its observer never
 * reports. useCenterFocus then keeps whatever is passing the middle sharp and
 * lets the rest soften, for as long as the row travels.
 */
function ReviewRow({
  reviews,
  direction,
}: {
  reviews: Review[];
  direction: 'left' | 'right';
}) {
  const t = useT();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>({loop: true});
  useAutoScroll(ref, {direction});
  useCenterFocus(ref);

  if (!reviews.length) return null;

  const copies = [0, 1, 2];

  return (
    <Reveal as="div" className="rail-wrap">
      <div className="reviews-row" ref={ref}>
        {copies.map((copy) =>
          reviews.map((review) => (
            <div
              className="reviews-row__item"
              key={`${copy}-${review.id}`}
              aria-hidden={copy === 0 ? undefined : true}
            >
              <ReviewCard review={review} />
            </div>
          )),
        )}
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        prevLabel={t('reviews.prev')}
        nextLabel={t('reviews.next')}
      />
    </Reveal>
  );
}

/** Three rows: right, left, then right again. */
const ROW_DIRECTIONS = ['right', 'left', 'right'] as const;

/**
 * Deals the reviews across the three rows (1st, 4th, 7th… to the first row,
 * and so on). With too few to fill three rows, each row shows all of them,
 * starting from a different one so the rows never line up.
 */
function rowsOf(reviews: Review[]): Review[][] {
  if (reviews.length < 6) {
    return ROW_DIRECTIONS.map((_, row) => {
      const start = (row * Math.ceil(reviews.length / 3)) % reviews.length;
      return [...reviews.slice(start), ...reviews.slice(0, start)];
    });
  }
  return ROW_DIRECTIONS.map((_, row) =>
    reviews.filter((__, index) => index % 3 === row),
  );
}

/**
 * Customer reviews, shared by the homepage and every product page.
 *
 * One row, holding every review in the order they were left, travelling on
 * its own and scrollable by hand. The same cards are shown at every screen
 * width; only how many fit changes.
 */
export function ReviewsSection({
  heading,
  subheading,
  reviews,
  // Threaded through from the product page so the "write a review" link can
  // arrive with the product already filled in — see ProductReviews.tsx. Left
  // unset on the homepage, where there's no single product to attach it to.
  productTitle,
}: {
  heading: string;
  subheading?: string;
  reviews: Review[];
  productTitle?: string;
}) {
  const t = useT();
  if (!reviews.length) return null;

  // The average of these very reviews — the same ones shown below.
  const rated = reviews.filter((review) => review.rating > 0);
  const average = rated.length
    ? Math.round(
        (rated.reduce((sum, review) => sum + review.rating, 0) / rated.length) *
          10,
      ) / 10
    : null;

  const writeReviewHref = productTitle
    ? `/reviews?product=${encodeURIComponent(productTitle)}`
    : '/reviews';

  return (
    <section className="reviews">
      <div className="reviews__head">
        {average !== null && (
          <div className="reviews__score">
            <StarRating rating={average} className="reviews__score-stars" />
            <p>
              <strong>{average.toFixed(1)}/5</strong>
              {' · '}
              {t('reviews.scoreCount', {count: rated.length})}
            </p>
          </div>
        )}
        <h2 className="reviews__title">{heading}</h2>
        {subheading ? <p className="reviews__subtitle">{subheading}</p> : null}
      </div>

      <div className="reviews__rows">
        {rowsOf(reviews).map((row, index) => (
          <ReviewRow
            // Fixed set of three rows, never reordered.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            reviews={row}
            direction={ROW_DIRECTIONS[index]}
          />
        ))}
      </div>

      <div className="reviews__cta">
        <p>{t('reviews.ctaText')}</p>
        <Link to={writeReviewHref} className="btn btn--outline">
          {t('reviews.ctaButton')}
        </Link>
      </div>
    </section>
  );
}
