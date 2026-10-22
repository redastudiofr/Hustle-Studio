import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import type {
  PdpModelFragment,
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import {SizeChartBody} from '~/components/product/SizeChartDialog';
import {sizeChartFor} from '~/config/sizeCharts';
import {PRODUCT_PAGE} from '~/config/productPage';
import {PDP} from '~/config/productTemplate';
import {loadReviews, reviewsForProduct} from '~/lib/reviews';
import {parseRating} from '~/lib/rating';
import {LIVE_TEE_PACKS, TEE_PACK_COLLECTION} from '~/lib/teePacks';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useLocalized} from '~/lib/i18n/localized';
import {seoMeta, originFromMatches, absoluteUrl} from '~/lib/seo';
import {BRAND} from '~/config/brand';
import {PdpGallery} from '~/components/pdp/PdpGallery';
import {PdpBuyBox} from '~/components/pdp/PdpBuyBox';
import {PdpReviews} from '~/components/pdp/PdpReviews';
import {PdpMaterial} from '~/components/pdp/PdpMaterial';
import {PdpDetails} from '~/components/pdp/PdpDetails';
import {PdpManifesto} from '~/components/pdp/PdpManifesto';
import {PdpCollection} from '~/components/pdp/PdpCollection';
import {PdpComparison} from '~/components/pdp/PdpComparison';
import {PdpDelivery} from '~/components/pdp/PdpDelivery';
import {
  usePackSelection,
  type PackModel,
} from '~/components/pdp/usePackSelection';

/** Title, description and share image all come from the product in Shopify. */
export const meta: Route.MetaFunction = ({data, matches}) => {
  const product = data?.product;
  if (!product) return seoMeta({title: '404', noindex: true});
  const first = product.images.nodes[0];
  return [
    ...seoMeta({
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.description,
      image: first?.url,
      path: `/products/${product.handle}`,
      type: 'product',
      origin: originFromMatches(matches),
    }),
    // The first photo is the page's largest element: fetched with the HTML,
    // at the width the screen needs (same URLs as the gallery's <img>).
    ...(first ? [heroPreload(first.url)] : []),
  ];
};

/** Same widths and crop as Hydrogen's <Image aspectRatio="1/1">. */
function heroPreload(url: string) {
  const sep = url.includes('?') ? '&' : '?';
  const at = (width: number) =>
    `${url}${sep}width=${width}&height=${width}&crop=center`;
  return {
    tagName: 'link' as const,
    rel: 'preload',
    as: 'image',
    href: at(800),
    imageSrcSet: [200, 400, 600, 800, 1000, 1200, 1400, 1600]
      .map((width) => `${at(width)} ${width}w`)
      .join(', '),
    imageSizes: '(min-width: 64em) 50vw, 100vw',
    fetchPriority: 'high',
  };
}

/** Anton: every title of the product page, first in view. */
export function links() {
  return [
    {
      rel: 'preload',
      href: '/fonts/anton-latin.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ];
}

/** Option names that hold the size. */
const SIZE_OPTION = /taille|size|pointure/i;

/** A Shopify product (or collection product) as the pack selector needs it. */
function toPackModel(product: {
  id: string;
  title: string;
  handle: string;
  variants: {nodes: PdpModelFragment['variants']['nodes']};
}): PackModel {
  // Products with more than a size (e.g. a colour): keep the sizes of the
  // first available combination, so each size appears once.
  const nodes = product.variants.nodes;
  const reference =
    nodes.find((variant) => variant.availableForSale) ?? nodes[0];
  const others = (reference?.selectedOptions ?? []).filter(
    (option) => !SIZE_OPTION.test(option.name),
  );
  const sameKind = nodes.filter((variant) =>
    others.every((option) =>
      variant.selectedOptions.some(
        (own) => own.name === option.name && own.value === option.value,
      ),
    ),
  );
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    variants: sameKind.map((variant) => ({
      id: variant.id,
      size:
        variant.selectedOptions.find((option) => SIZE_OPTION.test(option.name))
          ?.value ?? null,
      price: Number(variant.price.amount),
      compareAt: variant.compareAtPrice
        ? Number(variant.compareAtPrice.amount)
        : null,
      availableForSale: variant.availableForSale,
      image: variant.image
        ? {url: variant.image.url, altText: variant.image.altText}
        : null,
    })),
  };
}

export async function loader(args: Route.LoaderArgs) {
  const {context, params, request} = args;
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

  // Packs and the collection grid: the t-shirt collection when the product
  // is in it, else the product's own first collection.
  const collectionHandles = product.collections.nodes.map((c) => c.handle);
  const inPackCollection =
    TEE_PACK_COLLECTION !== '' &&
    collectionHandles.includes(TEE_PACK_COLLECTION);
  const gridHandle = inPackCollection
    ? TEE_PACK_COLLECTION
    : (collectionHandles.find((c) => c !== 'frontpage' && c !== 'all') ?? null);

  const collection = gridHandle
    ? await storefront
        .query(PDP_COLLECTION_QUERY, {
          variables: {handle: gridHandle},
          cache: storefront.CacheShort(),
        })
        .then((data) => data.collection)
        .catch((error: Error) => {
          console.error(error);
          return null;
        })
    : null;

  // Real reviews: this product's, then the shop's (app/lib/reviews.ts).
  const reviews = loadReviews(storefront)
    .then((all) => reviewsForProduct(all, handle))
    .catch(() => []);

  return {
    product,
    collection,
    inPackCollection,
    reviews,
    origin: new URL(request.url).origin,
  };
}

export default function Product() {
  const {product, collection, inPackCollection, reviews, origin} =
    useLoaderData<typeof loader>();
  const l = useLocalized();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const model = toPackModel(product);
  const collectionProducts = (collection?.products.nodes ?? []).filter(
    (node) => node.availableForSale,
  );
  // Designs the free t-shirts can be picked from: the pack collection only.
  const freeModels = inPackCollection
    ? [
        model,
        ...collectionProducts
          .filter((node) => node.id !== product.id)
          .map(toPackModel),
      ]
    : [model];

  const packsAllowed = inPackCollection && LIVE_TEE_PACKS.length > 0;
  const selection = usePackSelection({
    product: model,
    models: freeModels,
    packsAllowed,
  });

  const ownRating = parseRating(product.rating, product.ratingCount);
  // Header rating: the review app's figure, else the average of the real
  // reviews shown below; nothing at all without either.
  const rating = reviews.then((list) => {
    if (ownRating) return ownRating;
    if (!list.length) return null;
    return {
      value: list.reduce((sum, review) => sum + review.rating, 0) / list.length,
      count: list.length,
    };
  });

  const salesCount = Number(product.salesCount?.value) || null;
  const bestSeller = product.tags.some(
    (tag) => tag.toLowerCase() === PDP.badges.bestSellerTag,
  );

  const sizeOption = product.options.find((option) =>
    SIZE_OPTION.test(option.name),
  );
  const sizes = (sizeOption?.optionValues ?? []).map((value) => ({
    name: value.name,
    available: model.variants.some(
      (variant) => variant.size === value.name && variant.availableForSale,
    ),
  }));

  const detailFiles = (product.detailImages?.references?.nodes ?? []).flatMap(
    (node) => ('image' in node && node.image ? [node.image] : []),
  );
  const detailImages = [0, 1, 2].map(
    (index) => detailFiles[index] ?? product.images.nodes[index + 1],
  );

  return (
    <div className="pdpx">
      <section className="pdpx-hero" aria-label={product.title}>
        <PdpGallery
          images={product.images.nodes}
          title={product.title}
          badge={bestSeller ? l(PDP.badges.bestSeller) : undefined}
        />
        <PdpBuyBox
          title={product.title}
          product={model}
          selection={selection}
          salesCount={salesCount}
          badge={product.badge?.value?.trim() || null}
          rating={rating}
          descriptionHtml={product.descriptionHtml}
          sizeGuide={
            sizes.length ? (
              <SizeChartBody chart={sizeChartFor(product)} sizes={sizes} />
            ) : null
          }
          shippingInfo={PRODUCT_PAGE.info.shipping.map((paragraph) => (
            <p key={l(paragraph)}>{l(paragraph)}</p>
          ))}
        />
      </section>

      <Suspense fallback={null}>
        <Await resolve={reviews} errorElement={null}>
          {(items) => <PdpReviews reviews={items} rating={ownRating} />}
        </Await>
      </Suspense>

      <PdpMaterial />
      <PdpDetails images={detailImages} />
      <PdpManifesto />
      <PdpCollection
        products={collectionProducts.map((node) => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          price: Number(node.priceRange.minVariantPrice.amount),
          image: node.featuredImage,
        }))}
        showPackLine={
          packsAllowed &&
          LIVE_TEE_PACKS.some((offer) => offer.buy === 2 && offer.free === 1)
        }
      />
      <PdpComparison />
      <PdpDelivery />

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

const PDP_MODEL_VARIANT_FRAGMENT = `#graphql
  fragment PdpModelVariant on ProductVariant {
    id
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      url
      altText
    }
    selectedOptions {
      name
      value
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    tags
    descriptionHtml
    description
    productType
    # Size chart written in Shopify Admin (app/config/sizeCharts.ts).
    sizeChart: metafield(namespace: "custom", key: "size_chart") {
      value
    }
    # Product page (app/config/productTemplate.ts): "[N] ventes" badge, the
    # second badge, and the three "Ce que tu ne vois pas" photos.
    salesCount: metafield(namespace: "custom", key: "sales_count") {
      value
    }
    badge: metafield(namespace: "custom", key: "badge") {
      value
    }
    detailImages: metafield(namespace: "custom", key: "detail_images") {
      references(first: 3) {
        nodes {
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
    # Written by review apps (Shopify Product Reviews, Judge.me…). Absent
    # when there is no review app — no rating is then shown from it.
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    collections(first: 10) {
      nodes {
        handle
      }
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
      }
    }
    variants(first: 100) {
      nodes {
        ...PdpModelVariant
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
  ${PDP_MODEL_VARIANT_FRAGMENT}
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

/** The designs of the collection: grid, and the free t-shirt's choices. */
const PDP_COLLECTION_QUERY = `#graphql
  fragment PdpModel on Product {
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
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 30) {
      nodes {
        ...PdpModelVariant
      }
    }
  }
  query PdpCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 12) {
        nodes {
          ...PdpModel
        }
      }
    }
  }
  ${PDP_MODEL_VARIANT_FRAGMENT}
` as const;
