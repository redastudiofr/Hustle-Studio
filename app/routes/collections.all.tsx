import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {CollectionShell} from '~/components/shop/CollectionShell';
import {catalogQuery, filtersFromRequest} from '~/lib/shopFilters';
import {catalogSortKey, sortFromRequest} from '~/lib/sort';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {useT} from '~/lib/i18n';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({
    title: 'shop',
    path: '/collections/all',
    origin: originFromMatches(matches),
  });

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 48,
  });

  const sort = sortFromRequest(request);
  const filters = filtersFromRequest(request);
  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        ...catalogSortKey(sort),
        query: catalogQuery(filters),
      },
    }),
  ]);
  return {products, sort, filters};
}

export default function Catalog() {
  const t = useT();
  const {products, sort, filters} = useLoaderData<typeof loader>();

  return (
    <CollectionShell
      title={t('shop.all')}
      activeHandle={null}
      count={products.nodes.length}
      more={products.pageInfo.hasNextPage}
      sort={sort}
      sortExclude={['featured']}
      filters={filters}
    >
      {!products.nodes.length && (
        <p className="sx-empty">{t('collection.empty')}</p>
      )}
      <PaginatedResourceSection<CollectionItemFragment>
        connection={products}
        resourcesClassName="sx-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </CollectionShell>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    availableForSale
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
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
          ...MoneyCollectionItem
        }
        compareAtPrice {
          ...MoneyCollectionItem
        }
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
