import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import type {
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductPurchase} from '~/components/ProductPurchase';
import {ProductDescription} from '~/components/ProductDescription';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {Accordion} from '~/components/Accordion';
import {RelatedProductsRail} from '~/components/RelatedProductsRail';
import {BundleOffer} from '~/components/BundleOffer';
import {ProductWornVideos} from '~/components/ProductWornVideos';
import {ProductReviews} from '~/components/ProductReviews';
import {parseRating} from '~/lib/rating';
import {OFFER_ENABLED} from '~/lib/offers';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getProductFaq} from '~/data/faq';
import {useT} from '~/lib/i18n';
import {seoMeta, originFromMatches, absoluteUrl} from '~/lib/seo';
import {BRAND} from '~/config/brand';

/** Title, description and share image all come from the product in Shopify. */
export const meta: Route.MetaFunction = ({data, matches}) => {
  const product = data?.product;
  if (!product) return seoMeta({title: '404', noindex: true});
  return seoMeta({
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    image: product.images.nodes[0]?.url,
    path: `/products/${product.handle}`,
    type: 'product',
    origin: originFromMatches(matches),
  });
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(
    args,
    criticalData.product.id,
    criticalData.product.handle,
  );
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Response(null, {status: 404});
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  // Unknown handle, or a product not published on this sales channel.
  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product, origin: new URL(request.url).origin};
}

const MAX_RECOMMENDATIONS = 16;

/**
 * "You may also like": Shopify's own recommendations, topped up with best
 * sellers when it returns fewer than a full row (it returns nothing for a
 * brand-new product). Real, in-stock catalogue products either way; a failure
 * just hides the row.
 */
function loadDeferredData(
  {context}: Route.LoaderArgs,
  productId: string,
  handle: string,
) {
  const recommended = Promise.all([
    context.storefront
      .query(PRODUCT_RECOMMENDATIONS_QUERY, {variables: {productId}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
    context.storefront
      .query(FALLBACK_PRODUCTS_QUERY, {
        variables: {first: 30},
        cache: context.storefront.CacheShort(),
      })
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
  ]).then(([recos, fallback]) => {
    const seen = new Set<string>([productId]);
    const merged = [];
    for (const item of [
      ...(recos?.productRecommendations ?? []),
      ...(fallback?.products?.nodes ?? []),
    ]) {
      if (
        !item ||
        seen.has(item.id) ||
        item.handle === handle ||
        !item.availableForSale
      ) {
        continue;
      }
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= MAX_RECOMMENDATIONS) break;
    }
    return merged;
  });

  /*
   * The pieces offered as the second half of the "take two" pair — real,
   * buyable catalogue products. Only fetched while the offer is live.
   */
  const pairChoices = OFFER_ENABLED
    ? context.storefront
        .query(PAIR_CHOICES_QUERY, {
          variables: {first: 12},
          cache: context.storefront.CacheShort(),
        })
        .then((data) =>
          (data?.products?.nodes ?? [])
            .filter(
              (node) =>
                node.handle !== handle &&
                node.availableForSale &&
                node.variants?.nodes?.some(
                  (variant) => variant.availableForSale,
                ),
            )
            .map((node) => {
              const variant = node.variants.nodes.find(
                (candidate) => candidate.availableForSale,
              )!;
              return {
                id: node.id,
                title: node.title,
                handle: node.handle,
                featuredImage: node.featuredImage,
                variantId: variant.id,
                price: variant.price,
              };
            })
            .slice(0, MAX_PAIR_CHOICES),
        )
        .catch((error: Error) => {
          console.error(error);
          return [];
        })
    : Promise.resolve([]);

  return {recommended, pairChoices};
}

/** First sentence of the product description, for the short blurb in the buy box. */
function shortenDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  const firstSentence = trimmed.split(/(?<=[.!?])\s/)[0];
  const blurb = firstSentence.length > 20 ? firstSentence : trimmed;
  return blurb.length > 180 ? `${blurb.slice(0, 177).trimEnd()}…` : blurb;
}

export default function Product() {
  const {product, recommended, pairChoices, origin} =
    useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const t = useT();
  const {title, description, descriptionHtml} = product;

  // The selected variant's own photo first when it has one (e.g. the colour
  // just picked), then the rest of the product's images.
  const galleryImages = product.images.nodes.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const available = Boolean(selectedVariant?.availableForSale);

  // Real size values for this product, with their live availability.
  const sizeOption = productOptions.find((option) =>
    /taille|size|pointure/i.test(option.name),
  );
  const sizes: SizeEntry[] = (sizeOption?.optionValues ?? []).map((value) => ({
    name: value.name,
    available: value.available,
  }));

  return (
    <div className="pdp">
      {/* Gallery + buy box only: the sticky buy box is clamped to this
          wrapper, so full-width sections must stay outside it. */}
      <div className="pdp__main">
        <div className="pdp__gallery">
          <ProductGallery images={galleryImages} title={title} />
        </div>

        <aside className="pdp__buy">
          <ProductPurchase
            title={title}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
            productOptions={productOptions}
            sizes={sizes}
            available={available}
            quantityAvailable={selectedVariant?.quantityAvailable ?? null}
            shortDescription={shortenDescription(description ?? '')}
            variantId={selectedVariant?.id}
            selectedVariant={selectedVariant}
            // Only a real review app's score (Shopify metafields) — never an
            // invented one. No review app: no stars.
            rating={parseRating(product.rating, product.ratingCount)}
          />

          {OFFER_ENABLED && (
            <Suspense fallback={null}>
              <Await resolve={pairChoices} errorElement={null}>
                {(choices) => (
                  <BundleOffer
                    productTitle={title}
                    productImage={
                      product.images.nodes[0] ?? selectedVariant?.image
                    }
                    productPrice={selectedVariant?.price}
                    productVariantId={selectedVariant?.id}
                    choices={choices}
                    available={available}
                  />
                )}
              </Await>
            </Suspense>
          )}

          <div className="pdp__details">
            {descriptionHtml && (
              <section className="pdp__section">
                <ProductDescription
                  html={descriptionHtml}
                  intro={shortenDescription(description ?? '')}
                />
              </section>
            )}

            <section className="pdp__section">
              <h2 className="pdp__section-title">{t('product.faqTitle')}</h2>
              <div className="pdp__accordions">
                {getProductFaq(t, description ?? '').map((item) => (
                  <Accordion key={item.question} title={item.question}>
                    <p>{item.answer}</p>
                  </Accordion>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <ProductWornVideos />

      <Suspense fallback={null}>
        <Await resolve={recommended} errorElement={null}>
          {(items) =>
            items.length ? <RelatedProductsRail items={items} /> : null
          }
        </Await>
      </Suspense>

      <div className="pdp__reviews">
        <ProductReviews productHandle={product.handle} productTitle={title} />
      </div>

      <script
        type="application/ld+json"
        // Product structured data for Google (price, availability, images),
        // built from the same Shopify data the page shows.
        dangerouslySetInnerHTML={{
          __html: productJsonLd(product, selectedVariant, origin),
        }}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/**
 * schema.org Product with one Offer per known variant. `<` is escaped so the
 * JSON can never close the <script> tag early, whatever a description holds.
 */
function productJsonLd(
  product: ProductFragment,
  selected: ProductVariantFragment | null | undefined,
  origin: string,
): string {
  const url = absoluteUrl(`/products/${product.handle}`, origin);
  const rating = parseRating(product.rating, product.ratingCount);
  const variants = [
    selected,
    ...product.adjacentVariants.filter(
      (variant) => variant.id !== selected?.id,
    ),
  ].filter(Boolean) as ProductVariantFragment[];

  const json = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url,
    image: product.images.nodes.map((image) => image.url),
    brand: {'@type': 'Brand', name: product.vendor || BRAND.name},
    sku: selected?.sku || undefined,
    aggregateRating: rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: rating.value,
          reviewCount: rating.count ?? undefined,
        }
      : undefined,
    offers: variants.map((variant) => ({
      '@type': 'Offer',
      url: `${url}?${new URLSearchParams(
        variant.selectedOptions.map((option) => [option.name, option.value]),
      ).toString()}`,
      sku: variant.sku || undefined,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    })),
  };
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    # Written by review apps (Shopify Product Reviews, Judge.me…). Absent
    # when there is no review app — no rating is then shown at all.
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECO_PRODUCT_FRAGMENT = `#graphql
  fragment RecoMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecoProduct on Product {
    id
    title
    handle
    availableForSale
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...RecoMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...RecoMoney
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 20) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...RecoMoney
        }
        compareAtPrice {
          ...RecoMoney
        }
      }
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecoProduct
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;

/**
 * How many pieces the offer proposes. Enough to feel like a real choice,
 * few enough that the box stays a box rather than a second catalogue.
 */
const MAX_PAIR_CHOICES = 6;

const PAIR_CHOICES_QUERY = `#graphql
  query PdpPairChoices(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        availableForSale
        featuredImage {
          id
          url
          altText
          width
          height
        }
        variants(first: 10) {
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;

/** Tops the recommendation row up to a full set with real catalogue products. */
const FALLBACK_PRODUCTS_QUERY = `#graphql
  query PdpFallbackProducts(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...RecoProduct
      }
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;
