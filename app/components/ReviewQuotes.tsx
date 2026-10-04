import {useCallback, useEffect, useRef, useState} from 'react';
import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {useT} from '~/lib/i18n';

/** Only short reviews read as a one-line quote; longer ones stay in the cards. */
const MAX_QUOTE_LENGTH = 140;
const INTERVAL_MS = 4500;

/**
 * Quote slider above "Leave a review": one short review at a time — its
 * stars and its words, no name, place or date.
 *
 * Fed by the same real reviews as the cards (Shopify metaobjects +
 * app/data/reviews.ts); with no short review it renders nothing.
 *
 * The track is a native scroll-snap row, so a swipe (mobile) or a trackpad
 * scroll (desktop) moves it by hand. It also advances on its own every few
 * seconds, pausing while the pointer is over it, while it has focus, while
 * the visitor is touching it, and for good under prefers-reduced-motion.
 */
export function ReviewQuotes({reviews}: {reviews: Review[]}) {
  const t = useT();
  const quotes = reviews.filter(
    (review) => review.text.length <= MAX_QUOTE_LENGTH,
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const count = track.children.length;
    const next = ((index % count) + count) % count;
    track.scrollTo({left: next * track.clientWidth, behavior: 'smooth'});
  }, []);

  // Which quote is in view, from the scroll position (manual or automatic).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(Math.round(track.scrollLeft / (track.clientWidth || 1)));
      });
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Auto-advance.
  useEffect(() => {
    if (quotes.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!paused.current && document.visibilityState === 'visible') {
        goTo(active + 1);
      }
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [active, quotes.length, goTo]);

  if (!quotes.length) return null;

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  return (
    <div
      className="review-quotes"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* A scrollable region must be reachable by keyboard (WCAG 2.1.1). */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="review-quotes__track"
        ref={trackRef}
        role="region"
        aria-roledescription={t('gallery.carousel')}
        aria-label={t('reviews.title')}
        tabIndex={0}
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        {quotes.map((review, index) => (
          <figure
            className="review-quotes__slide"
            key={review.id}
            aria-hidden={index === active ? undefined : true}
          >
            <StarRating rating={review.rating} size={15} />
            <blockquote className="review-quotes__text">
              « {review.text} »
            </blockquote>
          </figure>
        ))}
      </div>

      {quotes.length > 1 && (
        <div className="review-quotes__dots">
          {quotes.map((review, index) => (
            <button
              type="button"
              key={review.id}
              className={`review-quotes__dot ${index === active ? 'is-active' : ''}`}
              aria-label={t('gallery.view', {
                index: index + 1,
                total: quotes.length,
              })}
              aria-current={index === active}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
