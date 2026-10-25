/**
 * Collection-page filters, read from the URL so a filtered page can be
 * shared: `?available=1` (in stock only), `?min=` / `?max=` (price, in the
 * shop's currency). Shopify does the filtering.
 */
export type ShopFilters = {
  available: boolean;
  min: number | null;
  max: number | null;
};

function amount(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function filtersFromRequest(request: Request): ShopFilters {
  const params = new URL(request.url).searchParams;
  return {
    available: params.get('available') === '1',
    min: amount(params.get('min')),
    max: amount(params.get('max')),
  };
}

/** For `collection.products(filters:)`. */
export function collectionFilters(filters: ShopFilters) {
  const list: Array<
    {available: boolean} | {price: {min?: number; max?: number}}
  > = [];
  if (filters.available) list.push({available: true});
  if (filters.min !== null || filters.max !== null) {
    list.push({
      price: {
        ...(filters.min !== null ? {min: filters.min} : {}),
        ...(filters.max !== null ? {max: filters.max} : {}),
      },
    });
  }
  return list;
}

/** For the store-wide `products(query:)` search syntax. */
export function catalogQuery(filters: ShopFilters): string | null {
  const parts: string[] = [];
  if (filters.available) parts.push('available_for_sale:true');
  if (filters.min !== null) parts.push(`variants.price:>=${filters.min}`);
  if (filters.max !== null) parts.push(`variants.price:<=${filters.max}`);
  return parts.length ? parts.join(' AND ') : null;
}

export function hasFilters(filters: ShopFilters) {
  return filters.available || filters.min !== null || filters.max !== null;
}
