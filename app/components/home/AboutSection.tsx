import {Link} from 'react-router';
import type {HomeSection} from '~/config/home';
import {Reveal} from '~/components/Reveal';
import {useLocalized} from '~/lib/i18n/localized';

/**
 * "About us": a large photo and the brand story — side by side on desktop,
 * photo then text on phones. The text block reveals a beat after the photo.
 */
export function AboutSection({
  id,
  section,
}: {
  id: string;
  section: Extract<HomeSection, {type: 'about'}>;
}) {
  const l = useLocalized();
  const {image} = section;

  return (
    <section className="home-about" aria-labelledby={`${id}-heading`}>
      <Reveal className="home-about__media">
        <picture>
          {image.mobile && (
            <source media="(max-width: 47.99em)" srcSet={image.mobile} />
          )}
          <img
            src={image.desktop}
            alt={l(image.alt)}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </Reveal>

      <Reveal className="home-about__body">
        {section.eyebrow && (
          <p className="home-about__eyebrow">{l(section.eyebrow)}</p>
        )}
        <h2 className="home-about__title" id={`${id}-heading`}>
          {l(section.title)}
        </h2>
        {section.paragraphs.map((paragraph) => (
          <p className="home-about__text" key={l(paragraph)}>
            {l(paragraph)}
          </p>
        ))}
        {section.cta && (
          <Link
            to={section.cta.to}
            prefetch="intent"
            className="link-arrow home-about__cta"
          >
            {l(section.cta.label)}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </Reveal>
    </section>
  );
}
