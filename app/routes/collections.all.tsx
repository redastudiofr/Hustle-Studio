import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {SortSelect} from '~/components/SortSelect';
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
    pageBy: 12,
  });

  const sort = sortFromRequest(request);
  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables, ...catalogSortKey(sort)},
    }),
  ]);
  return {products, sort};
}

export default function Catalog() {
  const t = useT();
  const {products, sort} = useLoaderData<typeof loader>();

  return (
    <div className="collection-page">
      <div className="collection-head">
        <h1>{t('shop.title')}</h1>
      </div>
      {products.nodes.length ? (
        <div className="collection-toolbar">
          <SortSelect
            value={sort === 'featured' ? 'newest' : sort}
            exclude={['featured']}
          />
        </div>
      ) : (
        <p className="collection-empty">{t('collection.empty')}</p>
      )}
      <PaginatedResourceSection<CollectionItemFragment>
        connection={products}
        resourcesClassName="product-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
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
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
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
