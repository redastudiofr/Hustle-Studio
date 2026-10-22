import {useMemo, useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {
  LIVE_TEE_PACKS,
  TEE_PACK_FREE_ATTRIBUTE,
  type TeePackOffer,
} from '~/lib/teePacks';

/** One size of a product, with the variant that sells it. */
export type PackVariant = {
  id: string;
  size: string | null;
  price: number;
  compareAt: number | null;
  availableForSale: boolean;
  image?: {url: string; altText?: string | null} | null;
};

/** A design that can be picked as the free t-shirt (and the product itself). */
export type PackModel = {
  id: string;
  title: string;
  handle: string;
  variants: PackVariant[];
};

/** "1 t-shirt", then the live packs. */
export type PackOption = {
  id: string;
  buy: number;
  free: number;
  mostChosen: boolean;
};

const SINGLE: PackOption = {id: 'single', buy: 1, free: 0, mostChosen: false};

/** Sizes offered first when available — the mock-ups select M. */
const PREFERRED_SIZE = 'M';

export function defaultSize(model: PackModel): string | null {
  const sizes = model.variants.filter((variant) => variant.availableForSale);
  if (!sizes.length) return model.variants[0]?.size ?? null;
  return (
    sizes.find((variant) => variant.size === PREFERRED_SIZE)?.size ??
    sizes[0].size
  );
}

function variantFor(model: PackModel, size: string | null) {
  return (
    model.variants.find((variant) => variant.size === size) ??
    (size === null ? model.variants[0] : undefined)
  );
}

/**
 * State and maths of "Compose ton pack".
 *
 * `product` is the page's product: the paid t-shirts are always of it, one
 * size each. `models` are the designs the free t-shirts can be picked from
 * (the pack collection). Packs are offered only when `packsAllowed` (the
 * product belongs to the pack collection) and a pack is live.
 *
 * Prices are Shopify's variant prices; what is actually charged is decided
 * by Shopify at checkout (the pack's discount makes the free lines 0 €).
 */
export function usePackSelection({
  product,
  models,
  packsAllowed,
}: {
  product: PackModel;
  models: PackModel[];
  packsAllowed: boolean;
}) {
  const options: PackOption[] = useMemo(
    () => [
      SINGLE,
      ...(packsAllowed
        ? LIVE_TEE_PACKS.map((offer: TeePackOffer) => ({
            id: offer.id,
            buy: offer.buy,
            free: offer.free,
            mostChosen: offer.mostChosen,
          }))
        : []),
    ],
    [packsAllowed],
  );

  const freeModels = models.length ? models : [product];
  const startSize = defaultSize(product);

  const [optionId, setOptionId] = useState(
    () => options.find((option) => option.mostChosen)?.id ?? SINGLE.id,
  );
  const [paidSizes, setPaidSizes] = useState<(string | null)[]>(() =>
    Array.from({length: 5}, () => startSize),
  );
  const [freePicks, setFreePicks] = useState<
    {handle: string; size: string | null}[]
  >(() =>
    Array.from({length: 5}, () => ({
      handle: product.handle,
      size: startSize,
    })),
  );

  const option =
    options.find((candidate) => candidate.id === optionId) ?? SINGLE;

  const paid = paidSizes
    .slice(0, option.buy)
    .map((size) => variantFor(product, size));
  const free = freePicks.slice(0, option.free).map((pick) => {
    const model =
      freeModels.find((candidate) => candidate.handle === pick.handle) ??
      product;
    return {model, variant: variantFor(model, pick.size)};
  });

  const ready =
    paid.every((variant) => variant?.availableForSale) &&
    free.every(({variant}) => variant?.availableForSale);

  const total = paid.reduce((sum, variant) => sum + (variant?.price ?? 0), 0);
  const saving = free.reduce(
    (sum, {variant}) => sum + (variant?.price ?? 0),
    0,
  );

  // Same variant twice = one line with quantity 2.
  const lines: OptimisticCartLineInput[] = [];
  const add = (id: string, isFree: boolean) => {
    const existing = lines.find(
      (line) =>
        line.merchandiseId === id &&
        Boolean(line.attributes?.length) === isFree,
    );
    if (existing) existing.quantity = (existing.quantity ?? 1) + 1;
    else
      lines.push({
        merchandiseId: id,
        quantity: 1,
        attributes: isFree
          ? [{key: TEE_PACK_FREE_ATTRIBUTE, value: 'true'}]
          : [],
      });
  };
  if (ready) {
    paid.forEach((variant) => variant && add(variant.id, false));
    free.forEach(({variant}) => variant && add(variant.id, true));
  }

  /** Prices of an option, for its row (before any size is picked). */
  const quote = (candidate: PackOption) => {
    const unit =
      variantFor(product, startSize)?.price ?? product.variants[0]?.price ?? 0;
    return {
      total: unit * candidate.buy,
      full: unit * (candidate.buy + candidate.free),
      saving: unit * candidate.free,
    };
  };

  return {
    options,
    option,
    select: setOptionId,
    paidSizes,
    setPaidSize: (index: number, size: string | null) =>
      setPaidSizes((sizes) => sizes.map((s, i) => (i === index ? size : s))),
    freePicks,
    setFreePick: (index: number, pick: {handle: string; size: string | null}) =>
      setFreePicks((picks) => picks.map((p, i) => (i === index ? pick : p))),
    freeModels,
    ready,
    total,
    full: total + saving,
    saving,
    lines,
    quote,
    firstImage: paid[0]?.image ?? null,
  };
}

export type PackSelection = ReturnType<typeof usePackSelection>;
