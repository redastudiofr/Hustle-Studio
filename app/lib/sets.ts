import type {Storefront} from '@shopify/hydrogen';
import {SETS, type SetConfig} from '~/config/sets';

/**
 * The 07 sets with their Shopify data: both pieces, their sizes and stock,
 * their prices, their photos. Nothing here is invented — a set whose pieces
 * are missing from Shopify is left out.
 */

export type Money = {amount: string; currencyCode: string};

export type SetImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type SetVariant = {
  id: string;
  size: string;
  availableForSale: boolean;
  price: Money;
};

export type SetPiece = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  images: SetImage[];
  variants: SetVariant[];
  /** Lowest variant price. */
  price: Money;
};

export type SetData = SetConfig & {
  title: string;
  jacketPiece: SetPiece;
  sweatsPiece: SetPiece;
  /** The photo of the whole set worn. */
  image: SetImage | null;
  /** Hoodie + trousers, at their Shopify prices. */
  price: Money;
  available: boolean;
};

type RawProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  images: {nodes: SetImage[]};
  variants: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      price: Money;
      selectedOptions: Array<{name: string; value: string}>;
    }>;
  };
};

const PIECE = `
  id handle title availableForSale
  images(first: 12) { nodes { url altText width height } }
  variants(first: 20) {
    nodes { id availableForSale price { amount currencyCode } selectedOptions { name value } }
  }
`;

const SIZE = /size|taille/i;

function toPiece(raw: RawProduct): SetPiece {
  const variants = raw.variants.nodes.map((variant) => ({
    id: variant.id,
    size:
      variant.selectedOptions.find((option) => SIZE.test(option.name))?.value ??
      variant.selectedOptions.map((o) => o.value).join(' / '),
    availableForSale: variant.availableForSale,
    price: variant.price,
  }));
  const lowest = variants.reduce<Money | null>(
    (min, v) =>
      !min || Number(v.price.amount) < Number(min.amount) ? v.price : min,
    null,
  );
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    availableForSale: raw.availableForSale,
    images: raw.images.nodes,
    variants,
    price: lowest ?? {amount: '0', currencyCode: 'EUR'},
  };
}

export function addMoney(a: Money, b: Money): Money {
  return {
    amount: (Number(a.amount) + Number(b.amount)).toFixed(2),
    currencyCode: a.currencyCode,
  };
}

export async function loadSets(
  storefront: Storefront,
  only?: string,
): Promise<SetData[]> {
  const configs = only ? SETS.filter((set) => set.slug === only) : SETS;
  if (!configs.length) return [];
  const fields = configs
    .flatMap((set, i) => [
      `j${i}: product(handle: ${JSON.stringify(set.jacket)}) { ${PIECE} }`,
      `s${i}: product(handle: ${JSON.stringify(set.sweats)}) { ${PIECE} }`,
    ])
    .join('\n');
  try {
    const data = (await storefront.query(`query Sets { ${fields} }`, {
      cache: storefront.CacheShort(),
    })) as Record<string, RawProduct | null>;
    return configs.flatMap((config, i) => {
      const jacket = data[`j${i}`];
      const sweats = data[`s${i}`];
      if (!jacket || !sweats) return [];
      const jacketPiece = toPiece(jacket);
      const sweatsPiece = toPiece(sweats);
      const image =
        [...jacketPiece.images, ...sweatsPiece.images].find((img) =>
          img.url.includes(config.photo),
        ) ??
        jacketPiece.images[0] ??
        null;
      return [
        {
          ...config,
          title: `07 ${config.color} set`,
          jacketPiece,
          sweatsPiece,
          image,
          price: addMoney(jacketPiece.price, sweatsPiece.price),
          available:
            jacketPiece.availableForSale && sweatsPiece.availableForSale,
        },
      ];
    });
  } catch (error) {
    console.error('[sets] could not load the sets', error);
    return [];
  }
}
