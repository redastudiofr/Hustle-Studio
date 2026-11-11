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
import {SetsGrid} from '~/components/sets/SetsGrid';
import {loadSetProducts, SET_PRODUCT_HANDLE} from '~/lib/sets';
import {StarRating} from '~/components/StarRating';
import type {Review} from '~/data/reviews';
import {HelpFaq} from '~/components/HelpFaq';
import {CommunitySections} from '~/components/CommunitySections';
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

/**
 * The grid shows the best sellers first (Shopify's BEST_SELLING order), four
 * rows on a computer, five on a phone; the rest wait behind "view all
 * products" (the rows are capped in on.css, per breakpoint). Ten is the
 * smallest cap: fewer products than that need no button.
 */
const SMALLEST_CAP = 10;

const HERO_IMAGE_MOBILE = {
  src: '/brand/hero-mobile-07.webp',
  alt: 'Black cropped 07 zip hoodie and joggers, and a pink 07 zip hoodie, against a deep blue backdrop',
};

// Served exactly as supplied (no re-encoding, no resizing) and shown whole.
const HERO_IMAGE_DESKTOP = {
  src: '/brand/hero-desktop-07.webp',
  alt: 'Black cropped 07 zip hoodie and joggers, and a pink 07 zip hoodie, against a deep blue backdrop',
};

/** The footer leaves out its community block: this page shows it itself. */
export const handle = {communityInPage: true};

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
    // The Shopify "set 07" products are sold through the sets slider
    // below, not in this grid.
    .then((response) =>
      response.products.nodes.filter(
        (product: HomeProductFragment) =>
          !SET_PRODUCT_HANDLE.test(product.handle),
      ),
    )
    .catch((error: Error) => {
      console.error(error);
      return [] as HomeProductFragment[];
    });

  const reviews = loadReviews(storefront).catch(() => []);
  const sets = loadSetProducts(storefront);

  return {collections: visible, allProducts, reviews, sets};
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
        rating={
          <Suspense fallback={null}>
            <Await resolve={data.reviews}>
              {(reviews) => <HeroRating reviews={reviews} />}
            </Await>
          </Suspense>
        }
      />

      <CollectionsSlider collections={data.collections} />

      <AllProducts products={data.allProducts} />

      {/* The 07 sets, as a slider, under every product. */}
      <Suspense fallback={null}>
        <Await resolve={data.sets}>
          {(sets) => <SetsGrid products={sets} viewAll rail />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.reviews}>
          {(reviews) =>
            reviews.length ? (
              <div id="reviews">
                <ReviewsSection
                  heading={t('reviews.title')}
                  subheading={t('reviews.subtitle')}
                  reviews={reviews}
                />
              </div>
            ) : null
          }
        </Await>
      </Suspense>

      {/* "become part of the community" and "follow us", here rather than in
          the footer (see `handle`). */}
      <CommunitySections />

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

function AllProducts({products}: {products: Promise<HomeProductFragment[]>}) {
  const t = useT();
  // The rest of the grid waits behind "view all products" (rows capped per
  // breakpoint in on.css, .product-grid--capped).
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
              {!expanded && nodes.length > SMALLEST_CAP && (
                <button
                  type="button"
                  className="view-more-mobile home-show-all"
                  data-count={nodes.length}
                  onClick={() => setExpanded(true)}
                >
                  {t('home.showAll')}
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
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...HomeProduct
      }
    }
  }
  ${HOME_PRODUCT_FRAGMENT}
` as const;

/**
 * The shop's own score on the banner: the average of the real reviews shown
 * further down, and how many there are. Nothing when there are none — and
 * never another platform's or another brand's rating.
 */
function HeroRating({reviews}: {reviews: Review[]}) {
  const t = useT();
  const rated = reviews.filter((review) => review.rating > 0);
  if (!rated.length) return null;
  const average =
    Math.round(
      (rated.reduce((sum, review) => sum + review.rating, 0) / rated.length) *
        10,
    ) / 10;
  return (
    <a href="#reviews" className="hero-rating">
      <StarRating rating={average} size={16} />
      <span>
        <strong>{average.toFixed(1)}/5</strong>
        {' · '}
        {t('reviews.scoreCount', {count: rated.length})}
      </span>
    </a>
  );
}
