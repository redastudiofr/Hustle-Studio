import type {Storefront} from '@shopify/hydrogen';
import type {LandingProductFragment} from 'storefrontapi.generated';
import type {
  HomeColor,
  HomeVariant,
  LandingProduct,
} from '~/components/landing/products';

const COLOR = /^(colou?r|couleur|coloris)$/i;
const SIZE = /^(size|taille)$/i;

const LANDING_PRODUCT_FRAGMENT = `#graphql
  fragment LandingProduct on Product {
    id
    title
    handle
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    variants(first: 50) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
          width
          height
        }
        price {
          amount
        }
      }
    }
  }
` as const;

const LANDING_QUERY = `#graphql
  query Landing($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 100) {
      nodes {
        handle
      }
    }
    products(first: 5, sortKey: BEST_SELLING) {
      nodes {
        ...LandingProduct
      }
    }
  }
  ${LANDING_PRODUCT_FRAGMENT}
` as const;

const LANDING_PRODUCT_QUERY = `#graphql
  query LandingByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...LandingProduct
    }
  }
  ${LANDING_PRODUCT_FRAGMENT}
` as const;

/** A Shopify product in the shape the homepage sections use. */
export function toLandingProduct(
  product: LandingProductFragment,
): LandingProduct {
  const option = (
    selected: {name: string; value: string}[],
    pattern: RegExp,
  ) => selected.find((entry) => pattern.test(entry.name))?.value ?? null;

  const variants: HomeVariant[] = product.variants.nodes.map((variant) => ({
    id: variant.id,
    size: option(variant.selectedOptions, SIZE),
    color: option(variant.selectedOptions, COLOR),
    price: Number(variant.price.amount),
    availableForSale: variant.availableForSale,
  }));

  const colorOption = product.options.find((entry) => COLOR.test(entry.name));
  const colors: HomeColor[] = (colorOption?.optionValues ?? []).map(
    (value) => ({
      name: value.name,
      swatch: value.swatch?.color ?? null,
      image:
        product.variants.nodes.find(
          (variant) =>
            variant.image &&
            option(variant.selectedOptions, COLOR) === value.name,
        )?.image ?? null,
    }),
  );

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    price: Number(product.priceRange.minVariantPrice.amount),
    image: product.featuredImage ?? null,
    colors,
    variants,
  };
}

async function byHandles(storefront: Storefront, handles: string[]) {
  const results = await Promise.all(
    handles.map((handle) =>
      storefront
        .query(LANDING_PRODUCT_QUERY, {variables: {handle}})
        .then((data) => data.product)
        .catch(() => null),
    ),
  );
  return results
    .filter((product): product is LandingProductFragment => Boolean(product))
    .map(toLandingProduct);
}

/**
 * Everything the homepage needs from Shopify, in parallel: the collection
 * handles (a hero panel is shown only when its collection exists), the
 * best sellers, and the products picked by handle in the config, if any.
 */
export async function loadLanding(
  storefront: Storefront,
  picks: {bestSeller: string[]; duo: string[]},
) {
  const [landing, bestSeller, duo] = await Promise.all([
    storefront.query(LANDING_QUERY),
    byHandles(storefront, picks.bestSeller),
    byHandles(storefront, picks.duo),
  ]);
  const bestSellers = landing.products.nodes.map(toLandingProduct);
  return {
    collections: landing.collections.nodes.map((node) => node.handle),
    bestSellers,
    vs: bestSeller.length >= 2 ? bestSeller : bestSellers,
    duo: duo.length >= 2 ? duo : bestSellers,
  };
}
