import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import type {HomeImage, HomeLink} from '~/config/home';
import type {Localized} from '~/lib/i18n/localized';
import {useLocalized} from '~/lib/i18n/localized';
import {useHeaderTone} from '~/lib/header-tone';
import {BRAND} from '~/config/brand';

// Matches the fixed header's height so it turns solid exactly as its bottom
// edge clears the hero.
const HEADER_OFFSET_PX = 64;

/**
 * Homepage hero. Two looks, chosen by whether an image is configured in
 * app/config/home.ts:
 *
 * - photo: full-bleed image (one crop per breakpoint, only the matching one is
 *   downloaded), bottom scrim, text and buttons bottom-left;
 * - typographic: the brand's wordmark large on black — the default until
 *   brand photography is added.
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
}: {
  eyebrow?: Localized;
  title?: Localized;
  text?: Localized;
  image?: HomeImage;
  cta?: HomeLink;
  secondaryCta?: HomeLink;
}) {
  const l = useLocalized();
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
      className={`hero ${image ? 'hero--photo' : 'hero--type'}`}
      ref={sectionRef}
      aria-label={BRAND.name}
    >
      {image && (
        <div className="hero__media">
          <picture>
            <source media="(min-width: 48em)" srcSet={image.desktop} />
            <img
              src={image.mobile ?? image.desktop}
              alt={l(image.alt)}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="hero__img"
            />
          </picture>
          <div className="hero__scrim" />
        </div>
      )}

      <div className="hero__content">
        {eyebrow && <p className="hero__eyebrow">{l(eyebrow)}</p>}
        {title ? (
          <h1 className="hero__title">{l(title)}</h1>
        ) : (
          <h1 className="hero__title hero__title--wordmark">
            <span className="brand-wordmark" aria-hidden="true" />
            <span className="sr-only">{BRAND.name}</span>
          </h1>
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
    </section>
  );
}
