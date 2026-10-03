import type {Storefront} from '@shopify/hydrogen';
import type {
  HomeCollectionFragment,
  HomeProductFragment,
  HomeSortedProductsQuery,
} from 'storefrontapi.generated';
import {HOME_SECTIONS, type HomeSection, type ProductSort} from '~/config/home';
import {withoutAutoCollections} from '~/lib/collections';
import {PACK_ENABLED} from '~/lib/packOffer';
import {loadPack, type PackData} from '~/lib/packProducts';

export type HomeProductsData = {
  products: HomeProductFragment[];
  /** Set when the products came from the configured collection. */
  collection: {handle: string; title: string} | null;
} | null;

export type HomeFeatureData = {
  collection: {
    handle: string;
    title: string;
    description: string;
    image: HomeCollectionFragment['image'];
  };
  products: HomeProductFragment[];
} | null;

/** One tile of the "family" wall: a config photo or a Shopify image. */
export type FamilyTile = {
  key: string;
  src: string;
  alt: string;
  /** Shopify image (sized through its CDN) vs a file in public/. */
  shopify?: {url: string; width?: number | null; height?: number | null};
};

export type HomeSectionData =
  | {type: 'products'; data: Promise<HomeProductsData>}
  | {type: 'family'; data: Promise<FamilyTile[]>}
  | {type: 'spotlight'; data: Promise<HomeProductFragment[]>}
  | {type: 'feature'; data: Promise<HomeFeatureData>}
  | {type: 'collections'; data: Promise<HomeCollectionFragment[]>}
  | {type: 'pack'; data: Promise<PackData | null>}
  | {type: 'static'};

/** Largest page the Storefront API returns in one request. */
const SHOPIFY_PAGE_MAX = 250;

const SORT_KEYS: Record<
  ProductSort,
  {sortKey: 'CREATED_AT' | 'BEST_SELLING'; reverse: boolean}
> = {
  newest: {sortKey: 'CREATED_AT', reverse: true},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
};

/**
 * Starts one Shopify request per data-driven homepage section, without
 * awaiting any of them: the page streams, and each section appears as soon as
 * its own data is in. A failed or empty section resolves to null / [] and is
 * not rendered — it never takes the page down with it.
 */
export function loadHomeSections(
  storefront: Storefront,
  sections: HomeSection[] = HOME_SECTIONS,
): HomeSectionData[] {
  // One collections request, shared by every "collections" section.
  let collections: Promise<HomeCollectionFragment[]> | null = null;

  return sections.map((section) => {
    switch (section.type) {
      case 'products':
        return {
          type: 'products',
          data: loadProducts(storefront, section).catch(logAndReturn(null)),
        };
      case 'feature':
        return {
          type: 'feature',
          data: loadFeature(storefront, section).catch(logAndReturn(null)),
        };
      case 'collections':
        collections ??= storefront
          .query(HOME_COLLECTIONS_QUERY, {cache: storefront.CacheLong()})
          .then(({collections}) => withoutAutoCollections(collections.nodes))
          .catch(logAndReturn([] as HomeCollectionFragment[]));
        return {type: 'collections', data: collections};
      case 'spotlight':
        return {
          type: 'spotlight',
          data: loadByHandles(storefront, section.products).catch(
            logAndReturn([] as HomeProductFragment[]),
          ),
        };
      case 'family':
        // Photos from the config win; until there are some, the shop's own
        // product photos stand in, so the section is never empty or fake.
        if (section.photos.length) return {type: 'static'};
        return {
          type: 'family',
          data: loadFamilyStandIns(storefront).catch(
            logAndReturn([] as FamilyTile[]),
          ),
        };
      case 'pack':
        if (!PACK_ENABLED) return {type: 'static'};
        return {
          type: 'pack',
          data: loadPack(storefront).catch(logAndReturn(null)),
        };
      default:
        return {type: 'static'};
    }
  });
}

async function loadProducts(
  storefront: Storefront,
  section: Extract<HomeSection, {type: 'products'}>,
): Promise<HomeProductsData> {
  const all = section.limit === 'all';
  // Shopify's page size cap: 'all' means "every page of this size".
  const first =
    typeof section.limit === 'number'
      ? section.limit
      : all
        ? SHOPIFY_PAGE_MAX
        : 12;

  if (section.collection) {
    const {collection} = await storefront.query(
      HOME_COLLECTION_PRODUCTS_QUERY,
      {
        variables: {handle: section.collection, first},
        cache: storefront.CacheShort(),
      },
    );
    if (collection?.products.nodes.length) {
      return {
        products: collection.products.nodes,
        collection: {handle: collection.handle, title: collection.title},
      };
    }
    if (!section.fallbackSort) {
      console.warn(
        `Homepage: Shopify has no collection "${section.collection}" (or it is empty) — the section is hidden.`,
      );
      return null;
    }
  }

  const {sortKey, reverse} = SORT_KEYS[section.fallbackSort ?? 'newest'];
  const nodes: HomeProductFragment[] = [];
  let after: string | null = null;
  // One page unless the section asks for every product; then follow the
  // cursor until Shopify says there is nothing left.
  do {
    const {products}: HomeSortedProductsQuery = await storefront.query(
      HOME_SORTED_PRODUCTS_QUERY,
      {
        variables: {first, sortKey, reverse, after},
        cache: storefront.CacheShort(),
      },
    );
    nodes.push(...products.nodes);
    after =
      all && products.pageInfo.hasNextPage
        ? (products.pageInfo.endCursor ?? null)
        : null;
  } while (after);

  return nodes.length ? {products: nodes, collection: null} : null;
}

async function loadByHandles(
  storefront: Storefront,
  handles: string[],
): Promise<HomeProductFragment[]> {
  const results = await Promise.all(
    handles.map((handle) =>
      storefront
        .query(HOME_PRODUCT_BY_HANDLE_QUERY, {
          variables: {handle},
          cache: storefront.CacheShort(),
        })
        .then(({product}) => {
          if (!product) {
            console.warn(`Homepage: Shopify has no product "${handle}".`);
          }
          return product;
        }),
    ),
  );
  return results.filter(
    (product): product is HomeProductFragment => product != null,
  );
}

async function loadFamilyStandIns(
  storefront: Storefront,
): Promise<FamilyTile[]> {
  const {products} = await storefront.query(HOME_SORTED_PRODUCTS_QUERY, {
    variables: {first: 16, ...SORT_KEYS.newest},
    cache: storefront.CacheLong(),
  });
  const seen = new Set<string>();
  const tiles: FamilyTile[] = [];
  for (const product of products.nodes) {
    // The second photo is usually the product worn; the first, a packshot.
    const nodes = [...product.images.nodes].reverse();
    for (const image of nodes) {
      if (seen.has(image.id ?? image.url)) continue;
      seen.add(image.id ?? image.url);
      tiles.push({
        key: image.id ?? image.url,
        src: image.url,
        alt: image.altText || product.title,
        shopify: {url: image.url, width: image.width, height: image.height},
      });
      break;
    }
  }
  return tiles;
}

async function loadFeature(
  storefront: Storefront,
  section: Extract<HomeSection, {type: 'feature'}>,
): Promise<HomeFeatureData> {
  const {collection} = await storefront.query(HOME_COLLECTION_PRODUCTS_QUERY, {
    variables: {handle: section.collection, first: section.limit ?? 12},
    cache: storefront.CacheShort(),
  });
  if (!collection?.products.nodes.length) {
    console.warn(
      `Homepage: Shopify has no collection "${section.collection}" (or it is empty) — the feature is hidden.`,
    );
    return null;
  }
  return {
    collection: {
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      image: collection.image,
    },
    products: collection.products.nodes,
  };
}

function logAndReturn<T>(fallback: T) {
  return (error: unknown) => {
    console.error(error);
    return fallback;
  };
}

const HOME_PRODUCT_FRAGMENT = `#graphql
  fragment HomeMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomeProduct on Product {
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
    priceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    options(first: 3) {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
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
  }
` as const;

const HOME_COLLECTION_FRAGMENT = `#graphql
  fragment HomeCollection on Collection {
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
` as const;

const HOME_COLLECTIONS_QUERY = `#graphql
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 30, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
  ${HOME_COLLECTION_FRAGMENT}
` as const;

const HOME_COLLECTION_PRODUCTS_QUERY = `#graphql
  query HomeCollectionProducts(
    $handle: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...HomeCollection
      description
      products(first: $first) {
        nodes {
          ...HomeProduct
        }
      }
    }
  }
  ${HOME_COLLECTION_FRAGMENT}
  ${HOME_PRODUCT_FRAGMENT}
` as const;

const HOME_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query HomeProductByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...HomeProduct
    }
  }
  ${HOME_PRODUCT_FRAGMENT}
` as const;

const HOME_SORTED_PRODUCTS_QUERY = `#graphql
  query HomeSortedProducts(
    $first: Int
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...HomeProduct
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${HOME_PRODUCT_FRAGMENT}
` as const;
