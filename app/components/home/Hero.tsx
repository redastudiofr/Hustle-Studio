import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import type {CountdownCopy, HomeImage, HomeLink} from '~/config/home';
import type {Localized} from '~/lib/i18n/localized';
import {useLocalized} from '~/lib/i18n/localized';
import {useHeaderTone} from '~/lib/header-tone';
import {BRAND} from '~/config/brand';
import {LAUNCH_TIME} from '~/config/launch';
import {Countdown} from '~/components/home/Countdown';

// Matches the fixed header's height so it turns solid exactly as its bottom
// edge clears the hero.
const HEADER_OFFSET_PX = 64;

/**
 * Homepage hero. Two looks, chosen by whether an image is configured in
 * app/config/home.ts:
 *
 * - photo: full-bleed image (one crop per breakpoint, only the matching one is
 *   downloaded), bottom scrim, text and buttons bottom-left;
 * - typographic: text on black, used until brand photography is added.
 *
 * With a `countdown`, it becomes the drop hero ("hero--launch"): serif title
 * and subtitle in one group, the countdown and the button in another, so each
 * format can place them where its own photo leaves room (desktop: stacked
 * bottom-left beside the subject; phone: title over the glass roof, countdown
 * and button at the bottom).
 *
 * The header sits transparent over it while it is in view. The entrance is a
 * CSS animation on transform only, so the content is visible even if
 * JavaScript never runs.
 */
export function Hero({
  eyebrow,
  title,
  text,
  image,
  cta,
  secondaryCta,
  countdown,
}: {
  eyebrow?: Localized;
  title?: Localized;
  text?: Localized;
  image?: HomeImage;
  cta?: HomeLink;
  secondaryCta?: HomeLink;
  countdown?: CountdownCopy;
}) {
  const l = useLocalized();
  // Nothing written on it: the photo alone, at its own ratio, no veil.
  const bare =
    !eyebrow && !title && !text && !cta && !secondaryCta && !countdown;
  const sectionRef = useRef<HTMLElement | null>(null);
  const {setTransparent} = useHeaderTone();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTransparent(entry.isIntersecting),
      {rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px`},
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setTransparent(false);
    };
  }, [setTransparent]);

  return (
    <section
      className={`hero ${image ? 'hero--photo' : 'hero--type'} ${countdown ? 'hero--launch' : ''} ${bare ? 'hero--bare' : ''}`}
      style={
        bare && image
          ? ({
              '--hero-ratio-desktop': image.desktopSize
                ? `${image.desktopSize[0]} / ${image.desktopSize[1]}`
                : undefined,
              '--hero-ratio-mobile':
                (image.mobileSize ?? image.desktopSize)
                  ? `${(image.mobileSize ?? image.desktopSize)![0]} / ${(image.mobileSize ?? image.desktopSize)![1]}`
                  : undefined,
            } as React.CSSProperties)
          : undefined
      }
      ref={sectionRef}
      aria-label={BRAND.name}
    >
      {image && (
        <div className="hero__media">
          <picture>
            <source
              media="(min-width: 48em)"
              srcSet={image.desktop}
              width={image.desktopSize?.[0]}
              height={image.desktopSize?.[1]}
            />
            <img
              src={image.mobile ?? image.desktop}
              alt={l(image.alt)}
              width={(image.mobileSize ?? image.desktopSize)?.[0]}
              height={(image.mobileSize ?? image.desktopSize)?.[1]}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="hero__img"
            />
          </picture>
          {!bare && <div className="hero__scrim" />}
        </div>
      )}

      {countdown ? (
        <div className="hero__content hero__content--launch">
          <div className="hero__head">
            {title ? (
              <h1 className="hero__title hero__title--serif">{l(title)}</h1>
            ) : (
              <h1 className="sr-only">{BRAND.name}</h1>
            )}
            {text && <p className="hero__text">{l(text)}</p>}
          </div>
          <div className="hero__foot">
            <Countdown
              target={LAUNCH_TIME}
              label={l(countdown.label)}
              endedLabel={l(countdown.endedLabel)}
              units={{
                days: l(countdown.units.days),
                hours: l(countdown.units.hours),
                minutes: l(countdown.units.minutes),
                seconds: l(countdown.units.seconds),
              }}
            />
            {cta && (
              <Link to={cta.to} prefetch="intent" className="hero__cta-line">
                <span>{l(cta.label)}</span>
                <span className="hero__cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="hero__content">
          {eyebrow && <p className="hero__eyebrow">{l(eyebrow)}</p>}
          {title ? (
            <h1 className="hero__title">{l(title)}</h1>
          ) : (
            // The logo lives in the header only; the page still has a real
            // heading for search engines and screen readers.
            <h1 className="sr-only">{BRAND.name}</h1>
          )}
          {text && <p className="hero__text">{l(text)}</p>}
          {(cta || secondaryCta) && (
            <div className="hero__actions">
              {cta && (
                <Link
                  to={cta.to}
                  prefetch="intent"
                  className="hero__cta hero__cta--primary"
                >
                  {l(cta.label)}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  to={secondaryCta.to}
                  prefetch="intent"
                  className="hero__cta"
                >
                  {l(secondaryCta.label)}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
