/**
 * Storefront queries of the previous product page, kept so the components
 * built on their types still compile and can be reused: product cards
 * (RecoProduct — collection grids, rails), the bundle box (BundleProduct)
 * and the collections band (BandCollection). The product page itself now
 * uses the queries in app/routes/products.$handle.tsx.
 */
export const RECO_PRODUCT_FRAGMENT = `#graphql
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

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
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

/** Pieces offered in the bundle's pickers, besides this product. */

export const BUNDLE_QUERY = `#graphql
  fragment BundleProduct on Product {
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
    variants(first: 30) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  query PdpBundle(
    $handle: String!
    $first: Int
    $giftHandle: String!
    $withGift: Boolean!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    current: product(handle: $handle) {
      ...BundleProduct
    }
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...BundleProduct
      }
    }
    gift: product(handle: $giftHandle) @include(if: $withGift) {
      ...BundleProduct
    }
  }
` as const;

export const BAND_COLLECTIONS_QUERY = `#graphql
  fragment BandCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query PdpBandCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 30, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...BandCollection
      }
    }
  }
` as const;

/** Tops the recommendation row up to a full set with real catalogue products. */
export const FALLBACK_PRODUCTS_QUERY = `#graphql
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
