import type {Storefront} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {
  PACK_COLLECTION_HANDLE,
  PACK_FREE_HANDLE,
  PACK_SLOTS,
  slotForProduct,
  type PackSlot,
} from './packOffer';

/**
 * The products the pack is built from, loaded once for every place that sells
 * it — the pack page and the homepage section, which must never offer two
 * different lists. What belongs to the pack is decided in ./packOffer.ts.
 */

export type PackVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {amount: string; currencyCode: CurrencyCode};
  selectedOptions: Array<{name: string; value: string}>;
};

export type PackPiece = {
  id: string;
  title: string;
  handle: string;
  productType?: string | null;
  featuredImage: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variants: {nodes: PackVariant[]};
};

export type PackData = {
  slots: Record<PackSlot, PackPiece[]>;
  free: PackPiece | null;
};

/*
 * Not tagged `#graphql` on purpose: the types for this query are the ones
 * declared above, so codegen does not need to collect it.
 */
const PACK_QUERY = `
  fragment PackPiece on Product {
    id
    title
    handle
    productType
    featuredImage {
      id
      url
      altText
      width
      height
    }
    variants(first: 20) {
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
  query PackProducts(
    $collection: String!
    $free: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collection) {
      products(first: 50) {
        nodes {
          ...PackPiece
        }
      }
    }
    free: product(handle: $free) {
      ...PackPiece
    }
  }
`;

export async function loadPack(storefront: Storefront): Promise<PackData> {
  const data = (await storefront.query(PACK_QUERY, {
    variables: {collection: PACK_COLLECTION_HANDLE, free: PACK_FREE_HANDLE},
  })) as {
    collection?: {products: {nodes: PackPiece[]}} | null;
    free?: PackPiece | null;
  };

  const pieces = data?.collection?.products?.nodes ?? [];
  if (!pieces.length) {
    console.warn(
      `Pack: Shopify has no collection "${PACK_COLLECTION_HANDLE}" (or it is empty) — the pack is hidden.`,
    );
  }

  // Filed by what each product is, with anything unbuyable left out: a piece
  // nobody can add is not a choice, and the pre-ordered one is refused by the
  // cart itself.
  const slots = Object.fromEntries(
    PACK_SLOTS.map((slot) => [slot, [] as PackPiece[]]),
  ) as Record<PackSlot, PackPiece[]>;

  for (const piece of pieces) {
    if (!piece.variants.nodes.some((variant) => variant.availableForSale)) {
      continue;
    }

    const slot = slotForProduct(piece);
    if (slot) slots[slot].push(piece);
  }

  const missing = PACK_SLOTS.filter((slot) => !slots[slot].length);
  if (missing.length) {
    console.warn(
      `Pack: nothing available for ${missing.join(', ')} — check the "${PACK_COLLECTION_HANDLE}" collection in Shopify Admin.`,
    );
  }

  // The piece that is given. Looked up by handle rather than picked from a
  // slot: the discount is written for one product, and showing any other one
  // as free would be a promise Shopify will not keep.
  const free =
    data?.free ??
    pieces.find((piece) => piece.handle === PACK_FREE_HANDLE) ??
    null;

  if (!free) {
    console.warn(
      `Pack: the free product ("${PACK_FREE_HANDLE}") was not found — check pack.freeProductHandle in app/config/promotions.ts.`,
    );
  }

  return {slots, free};
}

/** Whether the pack can be sold at all: a piece in every slot, and the tee. */
export function isPackSellable(pack: PackData | null): pack is PackData {
  return Boolean(
    pack?.free && PACK_SLOTS.every((slot) => pack.slots[slot]?.length),
  );
}
