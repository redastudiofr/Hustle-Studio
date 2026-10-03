import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeSection} from '~/config/home';
import type {
  FamilyTile,
  HomeFeatureData,
  HomeProductsData,
  HomeSectionData,
} from '~/lib/homeSections';
import {FamilyWall} from '~/components/home/FamilyWall';
import {AboutSection} from '~/components/home/AboutSection';
import {HelpFaq} from '~/components/HelpFaq';
import {Hero} from '~/components/home/Hero';
import {ProductRail} from '~/components/ProductRail';
import {ProductItem} from '~/components/ProductItem';
import {CollectionsSlider} from '~/components/CollectionsSlider';
import {Newsletter} from '~/components/Newsletter';
import {Reveal} from '~/components/Reveal';
import {PackOffer} from '~/components/PackOffer';
import {HomeReviews} from '~/components/HomeReviews';
import {useLocalized} from '~/lib/i18n/localized';
import {useT} from '~/lib/i18n';

/**
 * Renders app/config/home.ts in order. `data[i]` is the Shopify data the
 * loader started for `sections[i]`; sections with no data (static ones) get
 * `{type: 'static'}`.
 */
export function HomeSections({
  sections,
  data,
}: {
  sections: HomeSection[];
  data: HomeSectionData[];
}) {
  return (
    <>
      {sections.map((section, index) => (
        <HomeSectionView
          // eslint-disable-next-line react/no-array-index-key -- the config is static
          key={index}
          id={`home-${index}`}
          section={section}
          data={data[index]}
        />
      ))}
    </>
  );
}

function HomeSectionView({
  id,
  section,
  data,
}: {
  id: string;
  section: HomeSection;
  data?: HomeSectionData;
}) {
  const l = useLocalized();
  const t = useT();

  switch (section.type) {
    case 'hero':
      return <Hero {...section} />;

    case 'products': {
      if (data?.type !== 'products') return null;
      const layout = section.layout ?? 'rail';
      return (
        <Suspense fallback={<SectionSkeleton layout={layout} />}>
          <Await resolve={data.data}>
            {(result: HomeProductsData) => {
              if (!result) return null;
              const link = section.link
                ? {label: l(section.link.label), to: section.link.to}
                : result.collection
                  ? {
                      label: t('home.viewAll'),
                      to: `/collections/${result.collection.handle}`,
                    }
                  : undefined;
              return layout === 'grid' ? (
                <ProductGridSection
                  id={id}
                  title={l(section.title)}
                  products={result.products}
                  link={link}
                />
              ) : (
                <ProductRail
                  id={id}
                  title={l(section.title)}
                  products={result.products}
                  link={link}
                />
              );
            }}
          </Await>
        </Suspense>
      );
    }

    case 'feature':
      if (data?.type !== 'feature') return null;
      return (
        <Suspense fallback={<SectionSkeleton layout="rail" />}>
          <Await resolve={data.data}>
            {(result: HomeFeatureData) =>
              result ? (
                <FeatureSection id={id} section={section} data={result} />
              ) : null
            }
          </Await>
        </Suspense>
      );

    case 'collections':
      if (data?.type !== 'collections') return null;
      return (
        <Suspense fallback={null}>
          <Await resolve={data.data}>
            {(collections) => (
              <CollectionsSlider
                title={l(section.title)}
                collections={collections}
              />
            )}
          </Await>
        </Suspense>
      );

    case 'editorial':
      return (
        <Reveal
          as="section"
          className={`editorial ${section.image ? 'editorial--photo' : 'editorial--text'}`}
          aria-labelledby={`${id}-heading`}
        >
          {section.image && (
            <div className="editorial__media">
              <picture>
                <source
                  media="(min-width: 48em)"
                  srcSet={section.image.desktop}
                />
                <img
                  src={section.image.mobile ?? section.image.desktop}
                  alt={l(section.image.alt)}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          )}
          <div className="editorial__body">
            {section.eyebrow && (
              <p className="editorial__eyebrow">{l(section.eyebrow)}</p>
            )}
            <h2 className="editorial__title" id={`${id}-heading`}>
              {l(section.title)}
            </h2>
            <p className="editorial__text">{l(section.text)}</p>
            {section.cta && (
              <Link
                to={section.cta.to}
                prefetch="intent"
                className="btn btn--outline"
              >
                {l(section.cta.label)}
              </Link>
            )}
          </div>
        </Reveal>
      );

    case 'family': {
      const title = l(section.title);
      const text = section.text ? l(section.text) : undefined;
      if (section.photos.length) {
        const tiles: FamilyTile[] = section.photos.map((photo) => ({
          key: photo.src,
          src: photo.src,
          alt: l(photo.alt),
        }));
        return <FamilyWall id={id} title={title} text={text} tiles={tiles} />;
      }
      if (data?.type !== 'family') return null;
      return (
        <Suspense fallback={null}>
          <Await resolve={data.data}>
            {(tiles: FamilyTile[]) => (
              <FamilyWall id={id} title={title} text={text} tiles={tiles} />
            )}
          </Await>
        </Suspense>
      );
    }

    case 'about':
      return <AboutSection id={id} section={section} />;

    case 'faq':
      return <HelpFaq />;

    case 'pack':
      if (data?.type !== 'pack') return null;
      return <PackOffer pack={data.data} />;

    case 'reviews':
      if (data?.type !== 'reviews') return null;
      return (
        <Suspense fallback={null}>
          <Await resolve={data.data} errorElement={null}>
            {(reviews) => <HomeReviews reviews={reviews} />}
          </Await>
        </Suspense>
      );

    case 'newsletter':
      return (
        <Reveal as="section" className="home-newsletter">
          <h2 className="section-title">{t('news.title')}</h2>
          <Newsletter />
        </Reveal>
      );

    default:
      return null;
  }
}

function ProductGridSection({
  id,
  title,
  products,
  link,
}: {
  id: string;
  title: string;
  products: NonNullable<HomeProductsData>['products'];
  link?: {label: string; to: string};
}) {
  return (
    <section className="product-grid-section" aria-labelledby={`${id}-heading`}>
      <div className="section-head">
        <h2 className="section-title" id={`${id}-heading`}>
          {title}
        </h2>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} loading="lazy" />
        ))}
      </div>
      {link && (
        <div className="view-all">
          <Link to={link.to} prefetch="intent" className="btn btn--outline">
            {link.label}
          </Link>
        </div>
      )}
    </section>
  );
}

function FeatureSection({
  id,
  section,
  data,
}: {
  id: string;
  section: Extract<HomeSection, {type: 'feature'}>;
  data: NonNullable<HomeFeatureData>;
}) {
  const l = useLocalized();
  const t = useT();
  const {collection, products} = data;

  return (
    <section className="collection-feature" aria-labelledby={`${id}-heading`}>
      <div className="collection-feature__media">
        {section.image ? (
          <picture>
            <source media="(min-width: 48em)" srcSet={section.image.desktop} />
            <img
              src={section.image.mobile ?? section.image.desktop}
              alt={l(section.image.alt)}
              loading="lazy"
              decoding="async"
              className="collection-feature__img"
            />
          </picture>
        ) : collection.image ? (
          <Image
            data={collection.image}
            alt={collection.image.altText || collection.title}
            sizes="100vw"
            loading="lazy"
            className="collection-feature__img"
          />
        ) : null}
        <span className="collection-feature__overlay" aria-hidden="true" />
        <div className="collection-feature__caption">
          <h2 className="collection-feature__title" id={`${id}-heading`}>
            {collection.title}
          </h2>
          {collection.description && (
            <p className="collection-feature__description">
              {collection.description}
            </p>
          )}
          <Link
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="collection-feature__cta"
          >
            {t('home.shopNow')}
          </Link>
        </div>
      </div>
      <ProductRail id={`${id}-rail`} title="" products={products} />
    </section>
  );
}

/** Reserves roughly the section's height while Shopify answers, so nothing jumps. */
function SectionSkeleton({layout}: {layout: 'rail' | 'grid'}) {
  return (
    <div
      className={`section-skeleton section-skeleton--${layout}`}
      aria-hidden="true"
    >
      <span className="section-skeleton__title" />
      <div className="section-skeleton__row">
        {Array.from({length: 4}, (_, i) => (
          <span key={i} className="section-skeleton__card" />
        ))}
      </div>
    </div>
  );
}
