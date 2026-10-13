import {Link} from 'react-router';
import type {Route} from './+types/about';
import {useT} from '~/lib/i18n';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {BRAND} from '~/config/brand';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({title: 'about', path: '/about', origin: originFromMatches(matches)});

/**
 * The story page: a Nantes store and online shop for independent streetwear
 * labels. Its text lives in the dictionary (about.*) so it exists in both
 * languages; the store's address and hours come from BRAND.store and are
 * shown only once they are filled in.
 */
export default function About() {
  const t = useT();
  const pillars = [
    {title: t('about.pillar1Title'), body: t('about.pillar1Body')},
    {title: t('about.pillar2Title'), body: t('about.pillar2Body')},
    {title: t('about.pillar3Title'), body: t('about.pillar3Body')},
  ];
  const {store} = BRAND;

  return (
    <div className="about">
      <header className="about__hero">
        <p className="about__eyebrow">{t('about.eyebrowStory')}</p>
        <h1 className="about__title">
          <span className="brand-wordmark" aria-hidden="true" />
          <span className="sr-only">{BRAND.name}</span>
        </h1>
        <p className="about__lead">{t('about.lead')}</p>
      </header>

      <blockquote className="about__manifesto">
        <p>&ldquo;{t('about.manifesto')}&rdquo;</p>
      </blockquote>

      <ul className="about__pillars">
        {pillars.map((pillar) => (
          <li key={pillar.title}>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </li>
        ))}
      </ul>

      <section className="about__store" id="store">
        <p className="about__eyebrow">{t('about.storeEyebrow')}</p>
        <h2>{t('about.storeTitle')}</h2>
        <p>{t('about.storeBody')}</p>
        {(store.address || store.hours.length > 0) && (
          <dl className="about__store-info">
            {store.address && (
              <div>
                <dt>{t('about.storeAddress')}</dt>
                <dd>
                  {store.address}
                  {store.mapsUrl && (
                    <>
                      {' '}
                      <a href={store.mapsUrl} target="_blank" rel="noreferrer">
                        {t('about.storeMaps')}
                      </a>
                    </>
                  )}
                </dd>
              </div>
            )}
            {store.hours.length > 0 && (
              <div>
                <dt>{t('about.storeHours')}</dt>
                {store.hours.map((line) => (
                  <dd key={line}>{line}</dd>
                ))}
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="about__cta">
        <h2>{t('about.ctaTitle')}</h2>
        <p>{t('about.ctaBody')}</p>
        <Link to="/collections/all" prefetch="intent" className="btn">
          {t('about.ctaButton')}
        </Link>
      </section>
    </div>
  );
}
