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
  RecoProductFragment,
} from 'storefrontapi.generated';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {ProductMedia} from '~/components/shop/ProductMedia';
import {BuyBox} from '~/components/shop/BuyBox';
import {
  CompleteTheFit,
  type FitProduct,
} from '~/components/shop/CompleteTheFit';
import {AlsoLike} from '~/components/shop/AlsoLike';
import {sizeChartFor} from '~/config/sizeCharts';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {parseRating} from '~/lib/rating';
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

  return {recommended};
}

export default function Product() {
  const {product, recommended, origin} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, description, descriptionHtml} = product;

  const galleryImages = product.images.nodes.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  // Real size values for this product, with their live availability.
  const sizeOption = productOptions.find((option) =>
    /taille|size|pointure/i.test(option.name),
  );
  const sizes: SizeEntry[] = (sizeOption?.optionValues ?? []).map((value) => ({
    name: value.name,
    available: value.available,
  }));

  const current: FitProduct = {
    title,
    image: product.images.nodes[0] ?? null,
    variants: product.allVariants.nodes.map((variant) => ({
      id: variant.id,
      availableForSale: variant.availableForSale,
      price: variant.price,
      label: variant.title,
    })),
  };

  return (
    <div className="sx-product">
      <div className="sx-product__main">
        <ProductMedia images={galleryImages} title={title} />

        <BuyBox
          title={title}
          variant={selectedVariant}
          productOptions={productOptions}
          sizes={sizes}
          sizeChart={sizeChartFor(product)}
          description={description ?? ''}
          descriptionHtml={descriptionHtml}
        >
          <Suspense fallback={null}>
            <Await resolve={recommended} errorElement={null}>
              {(items) => {
                const partner = items.find((item) =>
                  item.variants.nodes.some((v) => v.availableForSale),
                );
                return partner && selectedVariant?.availableForSale ? (
                  <CompleteTheFit
                    current={current}
                    currentVariantId={selectedVariant.id}
                    partner={fitProduct(partner)}
                  />
                ) : null;
              }}
            </Await>
          </Suspense>
        </BuyBox>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended} errorElement={null}>
          {(items) => <AlsoLike items={items} />}
        </Await>
      </Suspense>

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
/** A recommended product in the shape of the "complete the fit" box. */
function fitProduct(product: RecoProductFragment): FitProduct {
  return {
    title: product.title,
    image: product.featuredImage ?? null,
    variants: product.variants.nodes.map((variant) => ({
      id: variant.id,
      availableForSale: variant.availableForSale,
      price: variant.price,
      label: variant.selectedOptions.map((option) => option.value).join(' / '),
    })),
  };
}

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
    productType
    # Optional per-product content, written in Shopify Admin (see
    # app/config/productPage.ts): highlights, size chart.
    highlights: metafield(namespace: "custom", key: "highlights") {
      value
    }
    sizeChart: metafield(namespace: "custom", key: "size_chart") {
      value
    }
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
    allVariants: variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
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
