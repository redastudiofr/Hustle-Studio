import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {CollectionShell} from '~/components/shop/CollectionShell';
import {collectionFilters, filtersFromRequest} from '~/lib/shopFilters';
import {collectionSortKey, sortFromRequest} from '~/lib/sort';
import {useT} from '~/lib/i18n';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const collection = data?.collection;
  if (!collection) return seoMeta({title: '404', noindex: true});
  return seoMeta({
    title: collection.seo?.title || collection.title,
    description: collection.seo?.description || collection.description,
    image: collection.image?.url,
    path: `/collections/${collection.handle}`,
    origin: originFromMatches(matches),
  });
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 48,
  });

  if (!handle) {
    throw redirect('/collections/all');
  }

  const sort = sortFromRequest(request);
  const filters = filtersFromRequest(request);
  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        ...collectionSortKey(sort),
        filters: collectionFilters(filters),
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, sort, filters};
}

export default function Collection() {
  const {collection, sort, filters} = useLoaderData<typeof loader>();
  const t = useT();
  const {products} = collection;

  return (
    <CollectionShell
      title={collection.title}
      activeHandle={collection.handle}
      count={products.nodes.length}
      more={products.pageInfo.hasNextPage}
      sort={sort}
      filters={filters}
    >
      {!products.nodes.length && (
        <p className="sx-empty">{t('collection.empty')}</p>
      )}
      <PaginatedResourceSection<ProductItemFragment>
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
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </CollectionShell>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
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
          ...MoneyProductItem
        }
        compareAtPrice {
          ...MoneyProductItem
        }
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
      }
      seo {
        title
        description
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
