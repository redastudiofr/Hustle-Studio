import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Reveal} from '~/components/Reveal';
import {useT} from '~/lib/i18n';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {BRAND} from '~/config/brand';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({
    title: 'our story',
    path: '/about',
    origin: originFromMatches(matches),
  });

/** The five chapters of the story, in reading order (dictionary story.*). */
const CHAPTERS = [1, 2, 3, 4, 5] as const;

/**
 * The story of the brand: a shop built for entrepreneurs, quality first,
 * stock held in Spain, the ambition of a lifetime, and an emerging brand
 * that helps other entrepreneurs launch. Linked from "about the story of
 * Hustle Studio" in the footer. Text in the dictionary (story.*).
 */
export default function About() {
  const t = useT();

  return (
    <div className="story">
      <header className="story__hero">
        <p className="story__eyebrow">{t('story.eyebrow')}</p>
        <h1 className="story__title">
          <span className="brand-wordmark" aria-hidden="true" />
          <span className="sr-only">{BRAND.name}</span>
        </h1>
        <p className="story__lead">{t('story.lead')}</p>
      </header>

      <Reveal as="section" className="story__manifesto">
        <p>&ldquo;{t('story.manifesto')}&rdquo;</p>
      </Reveal>

      <ol className="story__chapters">
        {CHAPTERS.map((n) => (
          <Reveal as="li" className="story__chapter" key={n}>
            <span className="story__number" aria-hidden="true">
              {String(n).padStart(2, '0')}
            </span>
            <div>
              <h2>{t(`story.chapter${n}Title`)}</h2>
              <p>{t(`story.chapter${n}Body`)}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal as="section" className="story__cta">
        <h2>{t('story.ctaTitle')}</h2>
        <p>{t('story.ctaBody')}</p>
        <div className="story__actions">
          <Link
            to="/collections/all"
            prefetch="intent"
            className="story__btn story__btn--dark"
          >
            {t('story.ctaShop')}
          </Link>
          <Link to="/contact" prefetch="intent" className="story__btn">
            {t('story.ctaContact')}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
