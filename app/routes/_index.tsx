import {Await, Link, useLoaderData} from 'react-router';
import {Suspense, useState} from 'react';
import type {Route} from './+types/_index';
import type {
  HomeProductFragment,
  RedaHomeCollectionsQuery,
} from 'storefrontapi.generated';
import {AnimatedHero} from '~/components/reda/AnimatedHero';
import {CollectionsSlider} from '~/components/reda/CollectionsSlider';
import {ProductItem} from '~/components/reda/ProductItem';
import {ReviewsSection} from '~/components/reda/ReviewsSection';
import {HelpFaq} from '~/components/HelpFaq';
import {Newsletter} from '~/components/Newsletter';
import {Reveal} from '~/components/Reveal';
import {BRAND} from '~/config/brand';
import {withoutAutoCollections} from '~/lib/collections';
import {
  HOME_COLLECTION_FRAGMENT,
  HOME_PRODUCT_FRAGMENT,
} from '~/lib/homeSections';
import {loadReviews} from '~/lib/reviews';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {useT} from '~/lib/i18n';

/**
 * Homepage — the Reda Studio homepage (redastudiofr/reda-studio,
 * app/routes/_index.tsx), with Hustle Studio's photos and Shopify data:
 * hero, collections slider, every product, real reviews, help, newsletter.
 * The collection banners (photo + product slider) are left out on purpose.
 * Left out: Reda's Trustpilot badge, pack offer and community photos.
 * Styles: reda-home.css, scoped under `.rhome`.
 */

/** Products beyond this many wait behind "view more" on mobile. */
const MOBILE_INITIAL_PRODUCT_COUNT = 16;

const HERO_IMAGE_MOBILE = {
  src: '/brand/hero-mobile-paris.webp',
  alt: 'Grey zip hoodie and raw denim, worn at dusk in front of the Eiffel Tower',
};

// Served exactly as supplied (no re-encoding, no resizing) and shown whole.
const HERO_IMAGE_DESKTOP = {
  src: '/brand/hero-desktop-paris.webp',
  alt: 'Grey zip hoodie and raw denim, worn at dusk in front of the Eiffel Tower',
};

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({path: '/', origin: originFromMatches(matches)});

export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: HERO_IMAGE_MOBILE.src,
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: HERO_IMAGE_DESKTOP.src,
      media: '(min-width: 48em)',
    },
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {collections} = await storefront.query(REDA_HOME_COLLECTIONS_QUERY);
  const visible = withoutAutoCollections(collections.nodes);

  const allProducts = storefront
    .query(REDA_ALL_PRODUCTS_QUERY, {variables: {first: 100}})
    .then((response) => response.products.nodes)
    .catch((error: Error) => {
      console.error(error);
      return [] as HomeProductFragment[];
    });

  const reviews = loadReviews(storefront).catch(() => []);

  return {collections: visible, allProducts, reviews};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="home rhome">
      <AnimatedHero
        layout="top"
        imageMobile={HERO_IMAGE_MOBILE}
        imageDesktop={HERO_IMAGE_DESKTOP}
        eyebrow={t('home.eyebrow')}
        title={BRAND.name}
        description={t('home.tagline')}
        ctaButton={{text: t('home.shopNow'), href: '/collections'}}
        secondaryCta={{text: t('home.ourStory'), href: '/about'}}
      />

      <CollectionsSlider collections={data.collections} />

      <AllProducts products={data.allProducts} />

      <Suspense fallback={null}>
        <Await resolve={data.reviews}>
          {(reviews) =>
            reviews.length ? (
              <ReviewsSection
                heading={t('reviews.title')}
                subheading={t('reviews.subtitle')}
                reviews={reviews}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

function AllProducts({products}: {products: Promise<HomeProductFragment[]>}) {
  const t = useT();
  // Mobile only: the rest of the grid waits behind "view more" (see
  // .product-grid--capped in reda-home.css). Desktop always shows them all.
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-labelledby="catalogue-heading">
      <Reveal as="section">
        <h2 id="catalogue-heading" className="section-title">
          {t('home.allProducts')}
        </h2>
      </Reveal>
      <Suspense fallback={<div className="product-grid" aria-hidden="true" />}>
        <Await resolve={products}>
          {(nodes) => (
            <>
              <div
                className={`product-grid product-grid--capped ${
                  expanded ? 'product-grid--expanded' : ''
                }`}
              >
                {nodes.map((product, index) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 4 ? 'eager' : undefined}
                  />
                ))}
              </div>
              {!expanded && nodes.length > MOBILE_INITIAL_PRODUCT_COUNT && (
                <button
                  type="button"
                  className="view-more-mobile"
                  onClick={() => setExpanded(true)}
                >
                  {t('home.viewMore')}
                </button>
              )}
            </>
          )}
        </Await>
      </Suspense>
      <div className="view-all">
        <Link to="/collections/all">{t('home.viewAll')}</Link>
      </div>
    </section>
  );
}

export type RedaHomeCollection =
  RedaHomeCollectionsQuery['collections']['nodes'][number];

const REDA_HOME_COLLECTIONS_QUERY = `#graphql
  query RedaHomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
  ${HOME_COLLECTION_FRAGMENT}
` as const;

const REDA_ALL_PRODUCTS_QUERY = `#graphql
  query RedaAllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
  ${HOME_PRODUCT_FRAGMENT}
` as const;
