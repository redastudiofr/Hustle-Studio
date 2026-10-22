import {useState} from 'react';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME, type MediaCard, type MediaLogo} from '~/config/homeTemplate';
import {SectionHeading} from '~/components/pdp/shared';

/**
 * Homepage mock-up 06 — "seen everywhere": a three-card carousel, the
 * centre card enlarged, arrows on either side; then a row of media logos.
 * Real appearances and coverage only (HOME.media), so each part is not
 * rendered while its list is empty.
 */
export function MediaCarousel({
  cards,
  logos,
}: {
  cards: MediaCard[];
  logos: MediaLogo[];
}) {
  const l = useLocalized();
  const [current, setCurrent] = useState(0);
  if (!cards.length && !logos.length) return null;

  const count = cards.length;
  const at = (offset: number) => (current + offset + count) % count;
  const visible =
    count >= 3 ? [at(-1), current, at(1)] : cards.map((_, index) => index);

  return (
    <section className="hx-section hx-media" aria-labelledby="hx-media">
      {count > 0 && (
        <>
          <SectionHeading
            id="hx-media"
            eyebrow={HOME.media.eyebrow}
            black={HOME.media.title.black}
            blue={HOME.media.title.blue}
          />
          <div className="hx-media__carousel">
            {count > 1 && (
              <button
                type="button"
                className="hx-media__arrow"
                aria-label={l(HOME.media.previous)}
                onClick={() => setCurrent(at(-1))}
              >
                <Arrow direction="left" />
              </button>
            )}
            <ul className="hx-media__cards">
              {visible.map((index) => {
                const card = cards[index];
                return (
                  <li
                    key={`${index}-${card.src}`}
                    className="hx-media__card"
                    data-current={index === current || undefined}
                  >
                    <img
                      src={card.src}
                      alt={l(card.caption)}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="hx-media__caption">{l(card.caption)}</span>
                  </li>
                );
              })}
            </ul>
            {count > 1 && (
              <button
                type="button"
                className="hx-media__arrow"
                aria-label={l(HOME.media.next)}
                onClick={() => setCurrent(at(1))}
              >
                <Arrow direction="right" />
              </button>
            )}
          </div>
        </>
      )}
      {logos.length > 0 && (
        <div className="hx-media__logos">
          <SectionHeading
            id={count ? undefined : 'hx-media'}
            black={HOME.media.logosTitle.black}
            blue={HOME.media.logosTitle.blue}
            as={count ? 'h3' : 'h2'}
          />
          <ul className="hx-logos">
            {logos.map((logo) => (
              <li key={logo.name}>
                <img src={logo.src} alt={logo.name} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Arrow({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 4l-6 6 6 6' : 'M7.5 4l6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
